'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { m } from 'motion/react'
import { Zap, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTone } from '../hooks/use-tone'

interface Pad {
  id: string
  note: string
  label: string
  color: string
  glow: string
  key: string
}

const PADS: Pad[] = [
  { id: 'q', note: 'C2', label: 'KICK', color: 'bg-red-500', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.5)]', key: 'Q' },
  { id: 'w', note: 'D2', label: 'SNARE', color: 'bg-blue-500', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.5)]', key: 'W' },
  { id: 'e', note: 'E2', label: 'CLAP', color: 'bg-purple-500', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.5)]', key: 'E' },
  { id: 'r', note: 'F2', label: 'TOM', color: 'bg-pink-500', glow: 'shadow-[0_0_12px_rgba(236,72,153,0.5)]', key: 'R' },
  { id: 'a', note: 'G2', label: 'HIHAT', color: 'bg-amber-500', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]', key: 'A' },
  { id: 's', note: 'A2', label: 'OPEN', color: 'bg-orange-500', glow: 'shadow-[0_0_12px_rgba(249,115,22,0.5)]', key: 'S' },
  { id: 'd', note: 'B2', label: 'CRASH', color: 'bg-cyan-500', glow: 'shadow-[0_0_12px_rgba(6,182,212,0.5)]', key: 'D' },
  { id: 'f', note: 'C3', label: 'RIDE', color: 'bg-teal-500', glow: 'shadow-[0_0_12px_rgba(20,184,166,0.5)]', key: 'F' },
  { id: 'z', note: 'D3', label: 'BASS', color: 'bg-emerald-500', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]', key: 'Z' },
  { id: 'x', note: 'E3', label: 'SYNTH', color: 'bg-indigo-500', glow: 'shadow-[0_0_12px_rgba(99,102,241,0.5)]', key: 'X' },
  { id: 'c', note: 'G3', label: 'CHORD', color: 'bg-rose-500', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.5)]', key: 'C' },
  { id: 'v', note: 'A3', label: 'PLUCK', color: 'bg-lime-500', glow: 'shadow-[0_0_12px_rgba(132,204,22,0.5)]', key: 'V' },
]

export function BeatPad({ className }: { className?: string }) {
  const [activePads, setActivePads] = useState<Set<string>>(new Set())
  const [volume, setVolume] = useState(-6)
  const [isReady, setIsReady] = useState(false)

  const synthRef = useRef<any>(null)

  const init = useCallback(async () => {
    if (synthRef.current) return
    const Tone = await getTone()
    await Tone.start()

    const synth = new Tone.PolySynth(Tone.MembraneSynth, {
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    }).toDestination()

    synth.volume.value = volume
    synthRef.current = synth
    setIsReady(true)
  }, [volume])

  const trigger = useCallback(
    async (pad: Pad) => {
      if (!synthRef.current) {
        await init()
      }

      // Visual feedback
      setActivePads((prev) => {
        const next = new Set(prev)
        next.add(pad.id)
        setTimeout(() => {
          setActivePads((p) => {
            const n = new Set(p)
            n.delete(pad.id)
            return n
          })
        }, 150)
        return next
      })

      // Audio
      if (synthRef.current) {
        synthRef.current.triggerAttackRelease(pad.note, '8n')
      }
    },
    [init],
  )

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const pad = PADS.find((p) => p.key.toLowerCase() === e.key.toLowerCase())
      if (pad) {
        e.preventDefault()
        trigger(pad)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [trigger])

  // Volume update
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = volume
    }
  }, [volume])

  // Cleanup
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose()
        synthRef.current = null
      }
    }
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
            <Zap size={14} className="text-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
              BEAT PAD
            </div>
            <div className="text-[9px] text-zinc-500">4×4 / KEYBOARD MAPPED</div>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden items-center gap-2 sm:flex">
          <Volume2 size={14} className="text-zinc-500" />
          <input
            type="range"
            min={-30}
            max={0}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-zinc-300 accent-primary dark:bg-zinc-700"
          />
          <span className="w-8 text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
            {volume}dB
          </span>
        </div>
      </div>

      {/* Mobile volume */}
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-2 sm:hidden dark:border-zinc-800">
        <Volume2 size={14} className="text-zinc-500" />
        <input
          type="range"
          min={-30}
          max={0}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-300 accent-primary dark:bg-zinc-700"
        />
        <span className="w-8 text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
          {volume}dB
        </span>
      </div>

      {/* Pad Grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {PADS.map((pad) => {
            const isActive = activePads.has(pad.id)
            return (
              <m.button
                key={pad.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => trigger(pad)}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-lg border-2 transition-all',
                  'border-zinc-300 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900',
                  isActive && `${pad.color} ${pad.glow} border-transparent`,
                )}
              >
                {/* Key hint */}
                <span
                  className={cn(
                    'absolute top-1.5 right-1.5 text-[9px] font-bold',
                    isActive ? 'text-white/80' : 'text-zinc-400 dark:text-zinc-600',
                  )}
                >
                  {pad.key}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    'text-[9px] font-bold tracking-wider',
                    isActive
                      ? 'text-white'
                      : 'text-zinc-500 dark:text-zinc-500',
                  )}
                >
                  {pad.label}
                </span>

                {/* Note */}
                <span
                  className={cn(
                    'mt-0.5 font-mono text-[10px]',
                    isActive
                      ? 'text-white/70'
                      : 'text-zinc-400 dark:text-zinc-600',
                  )}
                >
                  {pad.note}
                </span>
              </m.button>
            )
          })}
        </div>

        {/* Keyboard hint */}
        <div className="mt-4 text-center text-[10px] text-zinc-400 dark:text-zinc-600">
          KEYBOARD: Q-R, A-F, Z-V TO TRIGGER
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-300 bg-zinc-200/50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isReady
                ? 'bg-green-500'
                : 'bg-zinc-400 dark:bg-zinc-600',
            )}
          />
          <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
            {isReady ? 'ARMED' : 'STANDBY'}
          </span>
        </div>
        <span className="text-[9px] text-zinc-500">MEMBRANE SYNTH</span>
      </div>
    </div>
  )
}
