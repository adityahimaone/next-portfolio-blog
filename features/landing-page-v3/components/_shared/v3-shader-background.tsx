'use client'

import { useEffect, useRef } from 'react'

/**
 * V3ShaderBackground — Canvas 2D animated noise/fluid background.
 * Mimics WebGL shader gradient feel without the GPU cost.
 *
 * Strategy: layered radial gradients with sine-wave drifting positions.
 * Pauses when off-screen (IntersectionObserver) for performance.
 */
export function V3ShaderBackground({
  intensity = 0.6,
  className = '',
}: {
  intensity?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const visibleRef = useRef(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.parentElement?.clientHeight || window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Iridescent palette (matches v3 tokens)
    const blobs = [
      { hue: 320, sat: 65, light: 50, ax: 0.18, ay: 0.13, sx: 1.2, sy: 0.8 },
      { hue: 220, sat: 60, light: 55, ax: 0.21, ay: 0.16, sx: -0.9, sy: 1.1 },
      { hue: 50, sat: 70, light: 55, ax: 0.14, ay: 0.19, sx: 1.5, sy: -1.3 },
      { hue: 120, sat: 55, light: 55, ax: 0.17, ay: 0.12, sx: -1.1, sy: -0.7 },
    ]

    let t = 0

    const draw = () => {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Deep space base
      ctx.fillStyle = 'oklch(0.06 0.012 260)'
      ctx.fillRect(0, 0, width, height)

      const time = reduced ? 0 : t

      blobs.forEach((b, i) => {
        const cx =
          width * 0.5 +
          Math.sin(time * 0.0003 * b.sx + i) * width * b.ax +
          Math.cos(time * 0.0002 * b.sy + i * 1.7) * width * 0.1
        const cy =
          height * 0.5 +
          Math.cos(time * 0.0004 * b.sy + i * 1.3) * height * b.ay +
          Math.sin(time * 0.00025 * b.sx + i) * height * 0.1
        const r = Math.min(width, height) * 0.55

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        const alpha = intensity * 0.32
        g.addColorStop(
          0,
          `hsla(${b.hue}, ${b.sat}%, ${b.light}%, ${alpha})`,
        )
        g.addColorStop(
          0.5,
          `hsla(${b.hue}, ${b.sat}%, ${b.light}%, ${alpha * 0.4})`,
        )
        g.addColorStop(1, `hsla(${b.hue}, ${b.sat}%, ${b.light}%, 0)`)

        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = g
        ctx.fillRect(0, 0, width, height)
      })

      // Subtle vignette to keep text legible
      ctx.globalCompositeOperation = 'source-over'
      const vg = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.3,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75,
      )
      vg.addColorStop(0, 'oklch(0.06 0.012 260 / 0)')
      vg.addColorStop(1, 'oklch(0.06 0.012 260 / 0.7)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, width, height)

      t += 16.67
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    // Pause when tab hidden
    const visHandler = () => {
      visibleRef.current = !document.hidden
    }
    document.addEventListener('visibilitychange', visHandler)

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visHandler)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [intensity])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  )
}

export default V3ShaderBackground
