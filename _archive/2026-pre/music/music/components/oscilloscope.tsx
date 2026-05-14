'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { m } from 'motion/react'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTone } from '../hooks/use-tone'

export function Oscilloscope({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<any>(null)
  const animRef = useRef<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState('')

  const start = useCallback(async () => {
    try {
      setError('')
      const Tone = await getTone()
      await Tone.start()

      if (analyserRef.current) analyserRef.current.dispose()

      const analyser = new Tone.Analyser('waveform', 256)
      analyserRef.current = analyser

      const mic = new Tone.UserMedia().connect(analyser)
      await mic.open()

      setIsActive(true)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const draw = () => {
        const values = analyser.getValue() as Float32Array
        const w = canvas.width / window.devicePixelRatio
        const h = canvas.height / window.devicePixelRatio

        // CRT fade effect
        ctx.fillStyle = 'rgba(0, 20, 0, 0.15)'
        ctx.fillRect(0, 0, w, h)

        ctx.strokeStyle = '#00ff41'
        ctx.lineWidth = 1.5
        ctx.shadowColor = '#00ff41'
        ctx.shadowBlur = 4
        ctx.beginPath()

        for (let i = 0; i < values.length; i++) {
          const x = (i / values.length) * w
          const y = (0.5 + values[i] * 0.4) * h
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.stroke()
        ctx.shadowBlur = 0

        // Scanline
        ctx.fillStyle = 'rgba(0, 255, 65, 0.03)'
        for (let y = 0; y < h; y += 3) {
          ctx.fillRect(0, y, w, 1)
        }

        // Grid
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.08)'
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

        animRef.current = requestAnimationFrame(draw)
      }

      animRef.current = requestAnimationFrame(draw)
    } catch (err) {
      setError('Mic access denied')
    }
  }, [])

  const stop = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    if (analyserRef.current) {
      analyserRef.current.dispose()
      analyserRef.current = null
    }
    setIsActive(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100 shadow-xl dark:border-zinc-700 dark:bg-zinc-950',
      className
    )}>
      <div className="flex items-center justify-between border-b border-zinc-300 bg-zinc-200/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">OSCILLOSCOPE</div>
            <div className="text-[9px] text-zinc-500">CRT / WAVEFORM / 256-SAMPLE</div>
          </div>
        </div>
        <m.button
          whileTap={{ scale: 0.9 }}
          onClick={isActive ? stop : start}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded border px-3 shadow-sm transition-colors',
            isActive
              ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
              : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
          )}
        >
          {isActive ? <MicOff size={14} /> : <Mic size={14} />}
          <span className="text-xs font-bold">{isActive ? 'STOP' : 'MIC'}</span>
        </m.button>
      </div>

      <div className="relative h-48 w-full bg-black sm:h-56">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ width: '100%', height: '100%' }} />
        {/* CRT screen border effect */}
        <div className="pointer-events-none absolute inset-0 rounded-[2px] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
        {/* Screen curve overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)' }}
        />
      </div>

      {error && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-zinc-300 bg-zinc-200/50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', isActive ? 'animate-pulse bg-green-500' : 'bg-zinc-400')} />
          <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">{isActive ? 'ACTIVE' : 'STANDBY'}</span>
        </div>
        <span className="text-[9px] text-zinc-500">TIME/DIV: 0.5ms</span>
      </div>
    </div>
  )
}
