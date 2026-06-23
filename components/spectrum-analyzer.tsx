'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SpectrumAnalyzerProps {
  isPlaying: boolean
  barCount?: number
  className?: string
}

interface BarState {
  current: number
  target: number
  phase: number
  speed: number
}

export function SpectrumAnalyzer({ isPlaying, barCount = 24, className }: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const barsRef = useRef<BarState[]>([])
  const animFrameRef = useRef<number>(0)
  const lastTargetUpdateRef = useRef<number>(0)
  const isPlayingRef = useRef(isPlaying)

  // Keep isPlaying ref in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  // Initialize bar states
  useEffect(() => {
    barsRef.current = Array.from({ length: barCount }, () => ({
      current: 0.1 + Math.random() * 0.05,
      target: 0.1 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 0.4,
    }))
  }, [barCount])

  const generateTargets = useCallback(() => {
    const bars = barsRef.current
    const playing = isPlayingRef.current

    for (let i = 0; i < bars.length; i++) {
      if (playing) {
        // Playing: random heights 20%–100%, with spectral shaping
        // Center bars tend higher for a more natural look
        const centerBias = 1 - Math.abs(i - bars.length / 2) / (bars.length / 2) * 0.3
        bars[i].target = (0.2 + Math.random() * 0.8) * centerBias
      } else {
        // Idle: subtle breathing between 10%–15%
        bars[i].target = 0.08 + Math.random() * 0.07
      }
    }
  }, [])

  const drawBars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const bars = barsRef.current
    const gap = 2
    const totalGaps = (bars.length - 1) * gap
    const barWidth = (width - totalGaps) / bars.length
    const mainAreaHeight = height * 0.65 // Top 65% for main bars
    const reflectionGap = 2 // Tiny gap between bars and reflection

    ctx.clearRect(0, 0, width, height)

    // Enable shadow for glow effect on main bars
    ctx.shadowColor = 'rgba(74, 222, 128, 0.4)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    for (let i = 0; i < bars.length; i++) {
      const x = i * (barWidth + gap)
      const barHeight = bars[i].current * mainAreaHeight
      const y = mainAreaHeight - barHeight
      const radius = Math.min(barWidth / 2, 3) // Rounded top cap

      // --- Main bar ---
      // Gradient for each bar: brighter at top, slightly darker at base
      const grad = ctx.createLinearGradient(x, y, x, mainAreaHeight)
      grad.addColorStop(0, 'rgba(74, 222, 128, 0.95)')
      grad.addColorStop(0.5, 'rgba(74, 222, 128, 0.8)')
      grad.addColorStop(1, 'rgba(34, 180, 90, 0.7)')
      ctx.fillStyle = grad

      // Draw bar with rounded top
      if (barHeight > radius * 2) {
        ctx.beginPath()
        ctx.moveTo(x, mainAreaHeight)
        ctx.lineTo(x, y + radius)
        ctx.arcTo(x, y, x + radius, y, radius)
        ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius)
        ctx.lineTo(x + barWidth, mainAreaHeight)
        ctx.closePath()
        ctx.fill()
      } else if (barHeight > 0) {
        ctx.fillRect(x, y, barWidth, barHeight)
      }

      // --- Bright tip highlight ---
      if (barHeight > 4) {
        ctx.fillStyle = 'rgba(180, 255, 200, 0.6)'
        const tipH = Math.min(2, barHeight * 0.08)
        ctx.fillRect(x + 1, y, barWidth - 2, tipH)
      }
    }

    // Disable shadow for reflection
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // --- Reflection (mirrored, faded) ---
    for (let i = 0; i < bars.length; i++) {
      const x = i * (barWidth + gap)
      const barHeight = bars[i].current * mainAreaHeight * 0.5 // Half height
      const reflectionY = mainAreaHeight + reflectionGap

      // Gradient: fades out toward bottom
      const grad = ctx.createLinearGradient(x, reflectionY, x, reflectionY + barHeight)
      grad.addColorStop(0, 'rgba(74, 222, 128, 0.25)')
      grad.addColorStop(1, 'rgba(74, 222, 128, 0.0)')
      ctx.fillStyle = grad

      if (barHeight > 0) {
        ctx.fillRect(x, reflectionY, barWidth, barHeight)
      }
    }

    // Subtle horizontal line at boundary for a "surface" feel
    ctx.fillStyle = 'rgba(74, 222, 128, 0.12)'
    ctx.fillRect(0, mainAreaHeight, width, 1)
  }, [])

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1
    let parentWidth = 0
    let parentHeight = 0

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return
      dpr = window.devicePixelRatio || 1
      const rect = parent.getBoundingClientRect()
      parentWidth = rect.width
      parentHeight = rect.height
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resizeCanvas()

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }

    let running = true

    const animate = (timestamp: number) => {
      if (!running) return

      const playing = isPlayingRef.current
      const targetInterval = playing ? 150 : 2000
      const lerpFactor = playing ? 0.15 : 0.05

      // Generate new targets at configured interval
      if (timestamp - lastTargetUpdateRef.current > targetInterval) {
        generateTargets()
        lastTargetUpdateRef.current = timestamp
      }

      // Lerp current toward target with per-bar micro-movement
      const bars = barsRef.current
      for (let i = 0; i < bars.length; i++) {
        bars[i].current += (bars[i].target - bars[i].current) * lerpFactor

        // Organic micro-oscillation
        if (playing) {
          bars[i].phase += 0.02 * bars[i].speed
          bars[i].current += Math.sin(bars[i].phase) * 0.008
        } else {
          bars[i].phase += 0.005 * bars[i].speed
          bars[i].current += Math.sin(bars[i].phase) * 0.003
        }

        // Clamp
        bars[i].current = Math.max(0.02, Math.min(1, bars[i].current))
      }

      // Draw
      drawBars(ctx, parentWidth, parentHeight)

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      running = false
      cancelAnimationFrame(animFrameRef.current)
      resizeObserver.disconnect()
    }
  }, [generateTargets, drawBars])

  return (
    <div className={cn('relative w-full', className)} style={{ height: 80 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
    </div>
  )
}
