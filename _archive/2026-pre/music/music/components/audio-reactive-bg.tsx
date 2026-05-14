'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { m } from 'motion/react'
import { Mic, MicOff, Waves } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTone } from '../hooks/use-tone'

interface AudioReactiveBgProps {
  className?: string
  children?: React.ReactNode
  intensity?: 'subtle' | 'medium' | 'strong'
  mode?: 'gradient' | 'bars' | 'orb'
}

export function AudioReactiveBg({
  className,
  children,
  intensity = 'medium',
  mode = 'gradient',
}: AudioReactiveBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<any>(null)
  const animRef = useRef<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState('')

  const intensityMap = {
    subtle: 0.3,
    medium: 0.6,
    strong: 1.0,
  }

  const drawGradient = useCallback(
    (values: Float32Array, ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const mult = intensityMap[intensity]

      // Get average energy in low/mid/high bands
      let low = 0
      let mid = 0
      let high = 0
      const third = Math.floor(values.length / 3)

      for (let i = 0; i < third; i++) {
        low += (values[i] + 140) / 140
      }
      for (let i = third; i < third * 2; i++) {
        mid += (values[i] + 140) / 140
      }
      for (let i = third * 2; i < values.length; i++) {
        high += (values[i] + 140) / 140
      }

      low = (low / third) * mult
      mid = (mid / third) * mult
      high = (high / third) * mult

      // Create radial gradient that shifts with audio
      const cx = w * (0.3 + low * 0.4)
      const cy = h * (0.3 + mid * 0.4)
      const r = Math.max(w, h) * (0.5 + high * 0.5)

      const grad = ctx.createRadialGradient(cx, cy, 0, w / 2, h / 2, r)

      // Colors shift based on energy
      const hue1 = 220 + low * 60 // blue → purple
      const hue2 = 280 + mid * 50 // purple → pink
      const hue3 = 340 + high * 20 // pink → red

      grad.addColorStop(0, `hsla(${hue1}, 70%, 15%, ${0.3 + low * 0.3})`)
      grad.addColorStop(0.5, `hsla(${hue2}, 60%, 12%, ${0.2 + mid * 0.2})`)
      grad.addColorStop(1, `hsla(${hue3}, 50%, 8%, 0.1)`)

      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Add subtle glow spots
      const spotCount = 3
      for (let i = 0; i < spotCount; i++) {
        const sx = w * (0.2 + i * 0.3 + mid * 0.2)
        const sy = h * (0.2 + low * 0.6)
        const sr = 50 + high * 200

        const spot = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr)
        spot.addColorStop(0, `hsla(${hue1 + i * 30}, 80%, 50%, ${0.05 + mid * 0.05})`)
        spot.addColorStop(1, 'transparent')

        ctx.fillStyle = spot
        ctx.fillRect(0, 0, w, h)
      }
    },
    [intensity],
  )

  const drawBars = useCallback(
    (values: Float32Array, ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const mult = intensityMap[intensity]
      const barCount = 32
      const barWidth = w / barCount

      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < barCount; i++) {
        const idx = Math.floor((i / barCount) * values.length)
        const val = ((values[idx] + 140) / 140) * mult
        const barH = val * h * 0.4

        const hue = 220 + (i / barCount) * 120
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${0.1 + val * 0.2})`

        const x = i * barWidth + 2
        const y = h - barH
        ctx.fillRect(x, y, barWidth - 4, barH)
      }
    },
    [intensity],
  )

  const drawOrb = useCallback(
    (values: Float32Array, ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const mult = intensityMap[intensity]

      let avg = 0
      for (let i = 0; i < values.length; i++) {
        avg += (values[i] + 140) / 140
      }
      avg = (avg / values.length) * mult

      ctx.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      const baseR = Math.min(w, h) * 0.15
      const r = baseR + avg * Math.min(w, h) * 0.25

      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 2)
      const hue = 260 + avg * 60
      glow.addColorStop(0, `hsla(${hue}, 80%, 50%, ${0.2 + avg * 0.3})`)
      glow.addColorStop(0.5, `hsla(${hue + 20}, 70%, 40%, ${0.1 + avg * 0.15})`)
      glow.addColorStop(1, 'transparent')

      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      // Core orb
      const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      orb.addColorStop(0, `hsla(${hue}, 90%, 60%, ${0.3 + avg * 0.4})`)
      orb.addColorStop(0.7, `hsla(${hue + 10}, 80%, 40%, ${0.2 + avg * 0.2})`)
      orb.addColorStop(1, 'transparent')

      ctx.fillStyle = orb
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()

      // Ring
      ctx.strokeStyle = `hsla(${hue}, 80%, 50%, ${0.1 + avg * 0.3})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.3 + avg * 20, 0, Math.PI * 2)
      ctx.stroke()
    },
    [intensity],
  )

  const start = useCallback(async () => {
    try {
      setError('')
      const Tone = await getTone()
      await Tone.start()

      if (analyserRef.current) {
        analyserRef.current.dispose()
      }

      const analyser = new Tone.Analyser('fft', 64)
      analyserRef.current = analyser

      const mic = new Tone.UserMedia().connect(analyser)
      await mic.open()

      setIsActive(true)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const loop = () => {
        const values = analyser.getValue() as Float32Array
        const w = canvas.width / window.devicePixelRatio
        const h = canvas.height / window.devicePixelRatio

        if (mode === 'gradient') {
          drawGradient(values, ctx, w, h)
        } else if (mode === 'bars') {
          drawBars(values, ctx, w, h)
        } else {
          drawOrb(values, ctx, w, h)
        }

        animRef.current = requestAnimationFrame(loop)
      }
      animRef.current = requestAnimationFrame(loop)
    } catch (err) {
      setError('Microphone access denied')
    }
  }, [mode, drawGradient, drawBars, drawOrb])

  const stop = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = 0
    }
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
    return () => stop()
  }, [stop])

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

  return (
    <div className={cn('relative', className)}>
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Toggle button */}
      <m.button
        whileTap={{ scale: 0.9 }}
        onClick={isActive ? stop : start}
        className={cn(
          'absolute top-4 right-4 z-20 flex h-8 items-center gap-1.5 rounded border px-2.5 shadow-sm transition-colors',
          isActive
            ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
            : 'border-zinc-300 bg-white/80 text-zinc-600 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400',
        )}
      >
        {isActive ? <MicOff size={12} /> : <Mic size={12} />}
        <span className="text-[10px] font-bold">
          {isActive ? 'STOP' : 'MIC'}
        </span>
      </m.button>

      {/* Mode indicator */}
      {isActive && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded border border-green-200 bg-green-50/80 px-2 py-1 backdrop-blur-sm dark:border-green-900/30 dark:bg-green-950/30">
          <Waves size={10} className="text-green-500" />
          <span className="text-[9px] font-bold text-green-600 uppercase dark:text-green-400">
            {mode}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute top-4 left-4 z-20 rounded border border-amber-200 bg-amber-50/90 px-3 py-1.5 text-xs text-amber-700 backdrop-blur-sm dark:border-amber-900/30 dark:bg-amber-950/60 dark:text-amber-400">
          {error}
        </div>
      )}
    </div>
  )
}
