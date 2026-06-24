'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface HeroWaveformProps {
  className?: string
  layer?: 'behind' | 'front'
}

export function HeroWaveform({ className, layer = 'behind' }: HeroWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const lastFrameTime = useRef(0)
  const timeRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const now = performance.now()
    if (now - lastFrameTime.current < 33) {
      animationRef.current = requestAnimationFrame(draw)
      return
    }
    lastFrameTime.current = now
    timeRef.current += 0.015

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    ctx.clearRect(0, 0, w, h)

    const t = timeRef.current
    const centerY = h * 0.5
    const amplitude = h * 0.15
    const frontOpacity = layer === 'front' ? 0.15 : 1

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    for (let x = 0; x <= w; x += 2) {
      const normalX = x / w
      const y =
        centerY +
        Math.sin(normalX * 4 + t * 1.2) * amplitude * 0.8 +
        Math.sin(normalX * 2.5 + t * 0.8) * amplitude * 0.4
      ctx.lineTo(x, y)
    }
    ctx.strokeStyle = isDark
      ? `rgba(175, 80, 255, ${0.5 * frontOpacity})`
      : `rgba(127, 86, 217, ${0.35 * frontOpacity})`
    ctx.lineWidth = 2
    if (isDark && layer === 'behind') {
      ctx.shadowColor = 'rgba(175, 80, 255, 0.35)'
      ctx.shadowBlur = 12
    }
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    for (let x = 0; x <= w; x += 2) {
      const normalX = x / w
      const y =
        centerY +
        Math.sin(normalX * 3 + t * 0.9 + 1.5) * amplitude * 0.6 +
        Math.cos(normalX * 5 + t * 1.1) * amplitude * 0.3
      ctx.lineTo(x, y)
    }
    ctx.strokeStyle = isDark
      ? `rgba(225, 189, 255, ${0.4 * frontOpacity})`
      : `rgba(175, 80, 255, ${0.25 * frontOpacity})`
    ctx.lineWidth = 1.5
    if (isDark && layer === 'behind') {
      ctx.shadowColor = 'rgba(225, 189, 255, 0.25)'
      ctx.shadowBlur = 10
    }
    ctx.stroke()
    ctx.restore()

    animationRef.current = requestAnimationFrame(draw)
  }, [isDark, layer])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      timeRef.current = 0
      lastFrameTime.current = 0
      requestAnimationFrame(() => {
        draw()
        cancelAnimationFrame(animationRef.current)
      })
      return
    }

    animationRef.current = requestAnimationFrame(draw)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'absolute inset-0 h-full w-full pointer-events-none',
        layer === 'behind' ? 'z-[1]' : 'z-[3]',
        className,
      )}
      style={{ willChange: 'transform' }}
    />
  )
}
