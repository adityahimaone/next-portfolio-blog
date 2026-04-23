'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { Mic, MicOff, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTone } from '../hooks/use-tone'

export function SpectrumAnalyzer({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<any>(null)
  const animRef = useRef<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [source, setSource] = useState<'mic' | 'demo'>('demo')
  const [error, setError] = useState('')

  const draw = useCallback((values: Float32Array) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const barCount = 64
    const barWidth = w / barCount

    ctx.clearRect(0, 0, w, h)

    for (let i = 0; i < barCount; i++) {
      const idx = Math.floor((i / barCount) * values.length)
      const val = (values[idx] + 140) / 140 // normalize roughly 0-1
      const barH = Math.max(4, val * h * 0.85)

      // Color gradient: low = green, mid = amber, high = red
      const hue = val > 0.7 ? 0 : val > 0.4 ? 35 : 140
      const sat = 80
      const light = 50 + val * 20

      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`

      // Draw bar with rounded top
      const x = i * barWidth + 1
      const y = h - barH
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth - 2, barH, [3, 3, 0, 0])
      ctx.fill()

      // Reflection (subtle)
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.15)`
      ctx.fillRect(x, h + 2, barWidth - 2, barH * 0.3)
    }
  }, [])

  const startMic = useCallback(async () => {
    try {
      setError('')
      const Tone = await getTone()
      await Tone.start()

      // Stop existing
      if (analyserRef.current) {
        analyserRef.current.dispose()
      }

      const analyser = new Tone.Analyser('fft', 128)
      analyserRef.current = analyser

      const mic = new Tone.UserMedia().connect(analyser)
      await mic.open()

      setSource('mic')
      setIsActive(true)

      // Animation loop
      const loop = () => {
        const values = analyser.getValue() as Float32Array
        draw(values)
        animRef.current = requestAnimationFrame(loop)
      }
      animRef.current = requestAnimationFrame(loop)
    } catch (err) {
      setError('Microphone access denied. Using demo mode.')
      startDemo()
    }
  }, [draw])

  const startDemo = useCallback(async () => {
    setError('')
    const Tone = await getTone()
    await Tone.start()

    if (analyserRef.current) {
      analyserRef.current.dispose()
    }

    const analyser = new Tone.Analyser('fft', 128)
    analyserRef.current = analyser

    // Create a synth for demo
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1 },
    }).connect(analyser)
    synth.volume.value = -12

    // Arpeggio pattern
    const notes = ['C3', 'E3', 'G3', 'B3', 'C4', 'G3', 'E3', 'B2']
    let noteIdx = 0

    const loop = new Tone.Loop((time) => {
      const note = notes[noteIdx % notes.length]
      synth.triggerAttackRelease(note, '8n', time)
      noteIdx++
    }, '8n').start(0)

    Tone.Transport.bpm.value = 110
    Tone.Transport.start()

    setSource('demo')
    setIsActive(true)

    // Visual loop
    const visLoop = () => {
      const values = analyser.getValue() as Float32Array
      draw(values)
      animRef.current = requestAnimationFrame(visLoop)
    }
    animRef.current = requestAnimationFrame(visLoop)

    // Store loop for cleanup
    ;(analyser as any)._demoLoop = loop
    ;(analyser as any)._demoSynth = synth
  }, [draw])

  const stop = useCallback(async () => {
    const Tone = await getTone()
    Tone.Transport.stop()

    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = 0
    }

    if (analyserRef.current) {
      if (analyserRef.current._demoLoop) {
        analyserRef.current._demoLoop.dispose()
      }
      if (analyserRef.current._demoSynth) {
        analyserRef.current._demoSynth.dispose()
      }
      analyserRef.current.dispose()
      analyserRef.current = null
    }

    setIsActive(false)
    setSource('demo')

    // Clear canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  // Setup canvas size
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
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100 shadow-xl dark:border-zinc-700 dark:bg-zinc-950',
        className,
      )}
    >
      {/* Top panel */}
      <div className="flex items-center justify-between border-b border-zinc-300 bg-zinc-200/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <Activity size={14} className="text-blue-500" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
              SPECTRUM ANALYZER
            </div>
            <div className="text-[9px] text-zinc-500">
              FFT / REAL-TIME
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <m.button
            whileTap={{ scale: 0.9 }}
            onClick={isActive ? stop : startMic}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded border px-3 shadow-sm transition-colors',
              isActive
                ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
            )}
          >
            {isActive ? <MicOff size={14} /> : <Mic size={14} />}
            <span className="text-xs font-bold">
              {isActive ? 'STOP' : 'MIC'}
            </span>
          </m.button>

          <m.button
            whileTap={{ scale: 0.9 }}
            onClick={isActive ? stop : startDemo}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded border px-3 shadow-sm transition-colors',
              isActive && source === 'demo'
                ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
            )}
          >
            <Activity size={14} />
            <span className="text-xs font-bold">DEMO</span>
          </m.button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20"
          >
            <p className="px-4 py-2 text-xs text-amber-700 dark:text-amber-400">
              {error}
            </p>
          </m.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className="relative h-48 w-full bg-zinc-950 sm:h-64">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 30px',
          }}
        />

        {/* Frequency labels */}
        <div className="pointer-events-none absolute bottom-1 left-0 right-0 flex justify-between px-4 text-[9px] text-zinc-600">
          <span>LOW</span>
          <span>MID</span>
          <span>HIGH</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-300 bg-zinc-200/50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isActive
                ? 'animate-pulse bg-green-500'
                : 'bg-zinc-400 dark:bg-zinc-600',
            )}
          />
          <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
            {isActive ? `${source.toUpperCase()} INPUT` : 'STANDBY'}
          </span>
        </div>
        <span className="text-[9px] text-zinc-500">128-BIN FFT</span>
      </div>
    </div>
  )
}
