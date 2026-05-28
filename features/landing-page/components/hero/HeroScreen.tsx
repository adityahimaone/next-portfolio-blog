'use client'

import { useRef, useEffect, useCallback } from 'react'
import { m, useMotionValue, useTransform } from 'motion/react'

/**
 * OLED screen content — animated oscilloscope waveform (Lissajous curve)
 * Renders via Canvas 2D for smooth 60fps.
 */

interface HeroScreenProps {
  width?: number
  height?: number
  className?: string
}

export function HeroScreen({ width = 400, height = 180, className }: HeroScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const timeRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const t = timeRef.current

    // Clear
    ctx.clearRect(0, 0, w, h)

    // Background glow
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    grad.addColorStop(0, 'rgba(0, 180, 216, 0.05)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Draw Lissajous waveform
    ctx.beginPath()
    ctx.strokeStyle = '#00B4D8'
    ctx.lineWidth = 1.5
    ctx.shadowColor = '#00B4D8'
    ctx.shadowBlur = 6

    const cx = w / 2
    const cy = h / 2
    const ampX = w * 0.35
    const ampY = h * 0.3
    const freqX = 3
    const freqY = 4
    const phase = t * 0.02

    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180
      const x = cx + ampX * Math.sin(freqX * angle + phase)
      const y = cy + ampY * Math.sin(freqY * angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // Draw secondary waveform (stereo)
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.4)'
    ctx.lineWidth = 1
    ctx.shadowColor = '#00FF41'
    ctx.shadowBlur = 4
    const ampX2 = w * 0.3
    const ampY2 = h * 0.25
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180
      const x = cx + ampX2 * Math.sin(freqX * angle - phase * 0.7)
      const y = cy + ampY2 * Math.sin(freqY * angle + phase * 0.3)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // Horizontal grid lines (subtle)
    ctx.strokeStyle = 'rgba(0, 180, 216, 0.06)'
    ctx.lineWidth = 0.5
    for (let y = 0; y < h; y += h / 6) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    // Vertical grid
    for (let x = 0; x < w; x += w / 8) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }

    timeRef.current += 1
    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
