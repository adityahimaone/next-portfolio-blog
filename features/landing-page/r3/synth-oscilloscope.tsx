'use client'

/**
 * Ravemped 4.0 — Ambient oscilloscope.
 *
 * Reads waveform samples from the synth engine via `readWaveform` callback
 * and draws a soft, low-opacity line. When the engine isn't running (no
 * data), draws a slow synthetic sine so the visual still feels alive.
 *
 * Respects `prefers-reduced-motion`: if reduced, draws a single static line
 * and exits the rAF loop.
 */

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

interface SynthOscilloscopeProps {
  readWaveform: () => Float32Array | null
  /** Stroke colour. Default cyan. */
  color?: string
  /** Background fill alpha for trail (0..1). 0 = no trail. */
  trail?: number
}

export function SynthOscilloscope({
  readWaveform,
  color = 'rgba(57, 255, 110, 0.45)',
  trail = 0,
}: SynthOscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let mounted = true
    let phase = 0

    const fitCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    fitCanvas()

    const ro = new ResizeObserver(() => {
      // Reset transform before re-scaling
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      fitCanvas()
    })
    ro.observe(canvas)

    const draw = () => {
      if (!mounted) return
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      // Trail / clear
      if (trail > 0) {
        ctx.fillStyle = `rgba(9, 9, 18, ${trail})`
        ctx.fillRect(0, 0, w, h)
      } else {
        ctx.clearRect(0, 0, w, h)
      }

      const samples = readWaveform()
      ctx.lineWidth = 1.2
      ctx.strokeStyle = color
      ctx.beginPath()

      if (samples && samples.length > 0) {
        const step = w / samples.length
        for (let i = 0; i < samples.length; i++) {
          const v = samples[i]
          const x = i * step
          const y = h / 2 + v * (h * 0.42)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
      } else {
        // Idle synthetic wave so visual is never dead
        const N = 180
        for (let i = 0; i < N; i++) {
          const t = i / (N - 1)
          const v =
            Math.sin(phase + t * Math.PI * 4) * 0.18 +
            Math.sin(phase * 0.5 + t * Math.PI * 7) * 0.08
          const x = t * w
          const y = h / 2 + v * (h * 0.42)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        phase += 0.02
      }

      ctx.stroke()

      if (!prefersReduced) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    if (prefersReduced) {
      draw()
    } else {
      rafRef.current = requestAnimationFrame(draw)
    }

    return () => {
      mounted = false
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [color, prefersReduced, readWaveform, trail])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  )
}
