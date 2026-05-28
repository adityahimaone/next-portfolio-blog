'use client'

import { useRef, useEffect, useCallback } from 'react'

interface WaveformVisualizerProps {
  isActive: boolean
  height?: number
  barCount?: number
  className?: string
}

export function WaveformVisualizer({
  isActive,
  height = 48,
  barCount = 48,
  className,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>()
  const barsRef = useRef<number[]>([])

  // Initialize bar values
  useEffect(() => {
    barsRef.current = Array.from({ length: barCount }, () =>
      Math.random() * 0.3
    )
  }, [barCount])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    if (canvas.width !== rect.width * dpr) {
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    const w = rect.width
    const h = rect.height
    ctx.clearRect(0, 0, w, h)

    const barWidth = Math.max(2, (w / barCount) * 0.6)
    const gap = (w - barWidth * barCount) / (barCount - 1)

    const bars = barsRef.current

    for (let i = 0; i < barCount; i++) {
      const target = isActive ? 0.15 + Math.random() * 0.85 : 0.08 + Math.sin(i * 0.3) * 0.05

      // Smooth interpolation
      bars[i] += (target - bars[i]) * 0.12

      const barH = Math.max(2, bars[i] * h)
      const x = i * (barWidth + gap)
      const y = (h - barH) / 2

      // Gradient per bar
      const gradient = ctx.createLinearGradient(x, y, x, y + barH)
      const alpha = 0.3 + bars[i] * 0.5
      gradient.addColorStop(0, `rgba(139, 92, 246, ${alpha})`)
      gradient.addColorStop(0.5, `rgba(139, 92, 246, ${alpha * 1.2})`)
      gradient.addColorStop(1, `rgba(139, 92, 246, ${alpha * 0.8})`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barH, 1)
      ctx.fill()
    }

    animRef.current = requestAnimationFrame(draw)
  }, [isActive, barCount])

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [draw])

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />
    </div>
  )
}
