'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { m } from 'motion/react'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTone } from '../hooks/use-tone'

export function VUMeters({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<any>(null)
  const animRef = useRef<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState('')
  const needleL = useRef(0)
  const needleR = useRef(0)

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

      const draw = () => {
        const values = analyser.getValue() as Float32Array
        const w = canvas.width / window.devicePixelRatio
        const h = canvas.height / window.devicePixelRatio

        // Split into left/right bands
        let left = 0
        let right = 0
        const half = Math.floor(values.length / 2)
        for (let i = 0; i < half; i++) {
          left += (values[i] + 140) / 140
          right += (values[i + half] + 140) / 140
        }
        left = Math.min(1, (left / half) * 1.5)
        right = Math.min(1, (right / half) * 1.5)

        // Smooth needle movement
        needleL.current += (left - needleL.current) * 0.15
        needleR.current += (right - needleR.current) * 0.15

        ctx.clearRect(0, 0, w, h)

        const meterW = w / 2 - 16
        const meterH = h - 40
        const cx1 = meterW / 2 + 8
        const cx2 = w - meterW / 2 - 8
        const cy = h - 20

        // Draw both meters
        drawMeter(ctx, cx1, cy, meterW, meterH, needleL.current, 'L')
        drawMeter(ctx, cx2, cy, meterW, meterH, needleR.current, 'R')

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
    needleL.current = 0
    needleR.current = 0

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const w = canvas.width / window.devicePixelRatio
        const h = canvas.height / window.devicePixelRatio
        const meterW = w / 2 - 16
        const meterH = h - 40
        drawMeter(ctx, meterW / 2 + 8, h - 20, meterW, meterH, 0, 'L')
        drawMeter(ctx, w - meterW / 2 - 8, h - 20, meterW, meterH, 0, 'R')
      }
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
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">VU METERS</div>
            <div className="text-[9px] text-zinc-500">ANALOG / PEAK DETECTION</div>
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

      <div className="relative h-48 w-full bg-zinc-950 sm:h-56">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ width: '100%', height: '100%' }} />
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
        <span className="text-[9px] text-zinc-500">LEFT / RIGHT CHANNELS</span>
      </div>
    </div>
  )
}

function drawMeter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  value: number,
  label: string
) {
  const radius = Math.min(w, h) * 0.8
  const startAngle = Math.PI * 0.8
  const endAngle = Math.PI * 0.2

  // Background arc
  ctx.beginPath()
  ctx.arc(cx, cy, radius, startAngle, endAngle)
  ctx.lineWidth = 8
  ctx.strokeStyle = '#18181b'
  ctx.stroke()

  // Color zones
  const greenEnd = startAngle + (endAngle - startAngle) * 0.6
  const yellowEnd = startAngle + (endAngle - startAngle) * 0.85

  ctx.beginPath()
  ctx.arc(cx, cy, radius, startAngle, greenEnd)
  ctx.lineWidth = 8
  ctx.strokeStyle = '#22c55e'
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, radius, greenEnd, yellowEnd)
  ctx.lineWidth = 8
  ctx.strokeStyle = '#eab308'
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, radius, yellowEnd, endAngle)
  ctx.lineWidth = 8
  ctx.strokeStyle = '#ef4444'
  ctx.stroke()

  // Ticks
  for (let i = 0; i <= 20; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / 20)
    const isMajor = i % 5 === 0
    const innerR = radius - (isMajor ? 16 : 12)
    const outerR = radius - 4
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
    ctx.lineWidth = isMajor ? 2 : 1
    ctx.strokeStyle = isMajor ? '#a1a1aa' : '#52525b'
    ctx.stroke()

    if (isMajor) {
      const textR = radius - 26
      const textX = cx + Math.cos(angle) * textR
      const textY = cy + Math.sin(angle) * textR
      ctx.fillStyle = '#71717a'
      ctx.font = 'bold 9px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(i), textX, textY)
    }
  }

  // Needle
  const needleAngle = startAngle + (endAngle - startAngle) * value
  const needleLen = radius - 4
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen)
  ctx.lineWidth = 2
  ctx.strokeStyle = '#ef4444'
  ctx.stroke()

  // Needle pivot
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#52525b'
  ctx.fill()

  // Label
  ctx.fillStyle = '#a1a1aa'
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(label, cx, cy + 20)
}
