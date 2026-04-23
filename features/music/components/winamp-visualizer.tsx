'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { m } from 'motion/react'
import { Mic, MicOff, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTone } from '../hooks/use-tone'

const COLOR_PRESETS = [
  { name: 'Fire', bars: ['#ff0040', '#ff4000', '#ff8000', '#ffbf00', '#ffff00'] },
  { name: 'Ocean', bars: ['#0040ff', '#0080ff', '#00bfff', '#00ffbf', '#00ff80'] },
  { name: 'Neon', bars: ['#ff00ff', '#bf00ff', '#8000ff', '#4000ff', '#0000ff'] },
  { name: 'Matrix', bars: ['#00ff00', '#00cc00', '#009900', '#006600', '#003300'] },
]

export function WinampVisualizer({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<any>(null)
  const animRef = useRef<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [presetIdx, setPresetIdx] = useState(0)
  const [error, setError] = useState('')

  const start = useCallback(async () => {
    try {
      setError('')
      const Tone = await getTone()
      await Tone.start()

      if (analyserRef.current) analyserRef.current.dispose()

      const analyser = new Tone.Analyser('fft', 64)
      analyserRef.current = analyser

      const mic = new Tone.UserMedia().connect(analyser)
      await mic.open()

      setIsActive(true)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const preset = COLOR_PRESETS[presetIdx]

      const draw = () => {
        const values = analyser.getValue() as Float32Array
        const w = canvas.width / window.devicePixelRatio
        const h = canvas.height / window.devicePixelRatio

        ctx.clearRect(0, 0, w, h)

        const barCount = 32
        const barWidth = w / barCount
        const barGap = 1

        for (let i = 0; i < barCount; i++) {
          const idx = Math.floor((i / barCount) * values.length)
          const val = (values[idx] + 140) / 140
          const barH = Math.max(2, val * h)

          const colorIdx = Math.floor(val * (preset.bars.length - 1))
          const color = preset.bars[Math.min(colorIdx, preset.bars.length - 1)]

          // Main bar
          ctx.fillStyle = color
          ctx.fillRect(i * barWidth + barGap, h - barH, barWidth - barGap * 2, barH)

          // Peak dot
          ctx.fillStyle = 'rgba(255,255,255,0.5)'
          ctx.fillRect(i * barWidth + barGap, h - barH - 2, barWidth - barGap * 2, 2)

          // Reflection
          ctx.fillStyle = color + '20'
          ctx.fillRect(i * barWidth + barGap, h + 2, barWidth - barGap * 2, barH * 0.25)
        }

        animRef.current = requestAnimationFrame(draw)
      }

      animRef.current = requestAnimationFrame(draw)
    } catch (err) {
      setError('Mic access denied')
    }
  }, [presetIdx])

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
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">VISUALIZER</div>
            <div className="text-[9px] text-zinc-500">WINAMP-STYLE / 32-BAND</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <m.button whileTap={{ scale: 0.9 }} onClick={() => setPresetIdx((p) => (p + 1) % COLOR_PRESETS.length)}
            className="flex h-9 w-9 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Palette size={14} />
          </m.button>
          <m.button whileTap={{ scale: 0.9 }} onClick={isActive ? stop : start}
            className={cn('flex h-9 items-center gap-1.5 rounded border px-3 shadow-sm transition-colors',
              isActive
                ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300')}
          >
            {isActive ? <MicOff size={14} /> : <Mic size={14} />}
            <span className="text-xs font-bold">{isActive ? 'STOP' : 'MIC'}</span>
          </m.button>
        </div>
      </div>

      <div className="relative h-40 w-full bg-black">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[9px] font-bold text-white">
          {COLOR_PRESETS[presetIdx].name}
        </div>
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
        <span className="text-[9px] text-zinc-500">{COLOR_PRESETS.length} COLOR PRESETS</span>
      </div>
    </div>
  )
}
