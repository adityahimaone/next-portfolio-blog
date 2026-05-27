'use client'

import { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function Oscilloscope({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [isActive] = useState(true) // always on, display only

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }
    resize()
    window.addEventListener('resize', resize)

    let phase = 0

    const draw = () => {
      const w = canvas.width / window.devicePixelRatio
      const h = canvas.height / window.devicePixelRatio

      // CRT fade
      ctx.fillStyle = 'rgba(0, 20, 0, 0.12)'
      ctx.fillRect(0, 0, w, h)

      // Waveform
      ctx.strokeStyle = '#00ff41'
      ctx.lineWidth = 1.5
      ctx.shadowColor = '#00ff41'
      ctx.shadowBlur = 4
      ctx.beginPath()
      for (let i = 0; i <= w; i++) {
        const x = i
        const y = h / 2 +
          Math.sin(i * 0.02 + phase) * (h * 0.15) *
          Math.sin(i * 0.005 + phase * 0.3) +
          Math.sin(i * 0.05 + phase * 1.3) * (h * 0.06)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Second waveform (sine, different freq)
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let i = 0; i <= w; i++) {
        const x = i
        const y = h / 2 +
          Math.sin(i * 0.035 + phase * 0.7) * (h * 0.1)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Scanlines
      ctx.fillStyle = 'rgba(0, 255, 65, 0.02)'
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1)
      }

      // Grid
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.06)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let x = 0; x < w; x += w / 10) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      for (let y = 0; y < h; y += h / 6) {
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()

      phase += 0.03
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950',
      className
    )}>
      {/* Top label bar */}
      <div className="flex items-center justify-between border-b border-zinc-300 bg-zinc-200/80 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          <span className="text-[9px] font-bold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">OSCILLOSCOPE</span>
        </div>
        <span className="text-[8px] text-zinc-500">CRT / WAVEFORM</span>
      </div>

      {/* Canvas */}
      <div className="relative h-32 w-full bg-black sm:h-40">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ width: '100%', height: '100%' }} />
        {/* CRT vignette */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)' }}
        />
      </div>

      {/* Bottom status */}
      <div className="flex items-center justify-between border-t border-zinc-300 bg-zinc-200/50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-green-500" />
          <span className="text-[8px] font-bold tracking-wider text-zinc-500 uppercase">ACTIVE</span>
        </div>
        <span className="text-[8px] text-zinc-500">TIME/DIV: 0.5ms</span>
      </div>
    </div>
  )
}
