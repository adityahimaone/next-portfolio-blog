'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTone } from '../hooks/use-tone'
import {
  createDrumKit,
  DEFAULT_PATTERN,
  TRACK_NAMES,
  TRACK_COLORS,
  TRACK_COLORS_DIM,
} from '../lib/sounds'

const STEPS = 16

export function StepSequencer({ className }: { className?: string }) {
  const [pattern, setPattern] = useState<boolean[][]>(
    DEFAULT_PATTERN.map((row) => [...row]),
  )
  const [currentStep, setCurrentStep] = useState(-1)
  const [bpm, setBpm] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const kitRef = useRef<Awaited<ReturnType<typeof createDrumKit>> | null>(null)
  const loopRef = useRef<any>(null)
  const stepRef = useRef(0)

  // Init audio
  const init = useCallback(async () => {
    if (kitRef.current) return
    const Tone = await getTone()
    await Tone.start()
    kitRef.current = await createDrumKit(Tone)
    Tone.Transport.bpm.value = bpm
    setIsReady(true)
  }, [bpm])

  // Update BPM
  useEffect(() => {
    if (isReady) {
      getTone().then((Tone) => {
        Tone.Transport.bpm.value = bpm
      })
    }
  }, [bpm, isReady])

  // Start/stop transport
  const togglePlay = useCallback(async () => {
    const Tone = await getTone()
    if (!kitRef.current) {
      await init()
    }

    if (isPlaying) {
      Tone.Transport.stop()
      setIsPlaying(false)
      setCurrentStep(-1)
      stepRef.current = 0
    } else {
      // Create loop if not exists
      if (!loopRef.current) {
        loopRef.current = new Tone.Loop((time) => {
          const step = stepRef.current % STEPS
          stepRef.current = step + 1

          // Schedule UI update
          Tone.Draw.schedule(() => {
            setCurrentStep(step)
          }, time)

          // Trigger sounds
          const kit = kitRef.current
          if (!kit) return
          if (pattern[0][step]) kit.kick.triggerAttackRelease('C1', '8n', time)
          if (pattern[1][step]) kit.snare.triggerAttackRelease('8n', time)
          if (pattern[2][step]) kit.hihat.triggerAttackRelease('32n', time, 0.3)
          if (pattern[3][step]) kit.clap.triggerAttackRelease('8n', time)
        }, '16n').start(0)
      }

      Tone.Transport.start()
      setIsPlaying(true)
    }
  }, [isPlaying, init, pattern])

  const stop = useCallback(async () => {
    const Tone = await getTone()
    Tone.Transport.stop()
    setIsPlaying(false)
    setCurrentStep(-1)
    stepRef.current = 0
  }, [])

  const resetPattern = useCallback(() => {
    setPattern(DEFAULT_PATTERN.map((row) => [...row]))
  }, [])

  const toggleStep = useCallback((track: number, step: number) => {
    setPattern((prev) => {
      const next = prev.map((row) => [...row])
      next[track][step] = !next[track][step]
      return next
    })
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (loopRef.current) {
        loopRef.current.dispose()
        loopRef.current = null
      }
      if (kitRef.current) {
        kitRef.current.dispose()
        kitRef.current = null
      }
      getTone().then((Tone) => {
        Tone.Transport.stop()
        Tone.Transport.cancel()
      })
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
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
              STEP SEQUENCER
            </div>
            <div className="text-[9px] text-zinc-500">808-STYLE / 4-TRACK</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* BPM */}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-[10px] font-bold text-zinc-500">BPM</span>
            <input
              type="range"
              min={60}
              max={180}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-zinc-300 accent-primary dark:bg-zinc-700"
            />
            <span className="w-8 text-right font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {bpm}
            </span>
          </div>

          {/* Controls */}
          <m.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded border shadow-sm transition-colors',
              isPlaying
                ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
            )}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </m.button>

          <m.button
            whileTap={{ scale: 0.9 }}
            onClick={stop}
            className="flex h-9 w-9 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <Square size={14} />
          </m.button>

          <m.button
            whileTap={{ scale: 0.9 }}
            onClick={resetPattern}
            className="flex h-9 w-9 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <RotateCcw size={14} />
          </m.button>
        </div>
      </div>

      {/* Mobile BPM */}
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-2 sm:hidden dark:border-zinc-800">
        <span className="text-[10px] font-bold text-zinc-500">BPM</span>
        <input
          type="range"
          min={60}
          max={180}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-300 accent-primary dark:bg-zinc-700"
        />
        <span className="w-8 text-right font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
          {bpm}
        </span>
      </div>

      {/* Step Grid */}
      <div className="overflow-x-auto p-4">
        <div className="min-w-[600px]">
          {/* Beat numbers */}
          <div className="mb-2 flex">
            <div className="w-20 shrink-0" />
            {Array.from({ length: STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 text-center font-mono text-[9px] font-bold',
                  i === currentStep
                    ? 'text-primary dark:text-primary-light'
                    : i % 4 === 0
                      ? 'text-zinc-600 dark:text-zinc-400'
                      : 'text-zinc-300 dark:text-zinc-700',
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Tracks */}
          {pattern.map((track, trackIdx) => (
            <div key={trackIdx} className="mb-2 flex items-center">
              {/* Track label */}
              <div className="w-20 shrink-0 pr-3 text-right">
                <span className="text-[10px] font-bold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  {TRACK_NAMES[trackIdx]}
                </span>
              </div>

              {/* Steps */}
              <div className="flex flex-1 gap-1">
                {track.map((active, stepIdx) => (
                  <m.button
                    key={stepIdx}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleStep(trackIdx, stepIdx)}
                    className={cn(
                      'relative flex-1 rounded-sm transition-all',
                      'h-8 sm:h-10',
                      active
                        ? TRACK_COLORS[trackIdx]
                        : TRACK_COLORS_DIM[trackIdx],
                      stepIdx === currentStep &&
                        'ring-2 ring-white dark:ring-zinc-900',
                      stepIdx % 4 === 3 && 'mr-1',
                    )}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-sm bg-white/20" />
                    )}
                  </m.button>
                ))}
              </div>
            </div>
          ))}

          {/* Playhead indicator */}
          <div className="mt-2 flex">
            <div className="w-20 shrink-0" />
            <div className="flex flex-1">
              {Array.from({ length: STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 border-t-2 transition-colors',
                    i === currentStep
                      ? 'border-primary dark:border-primary-light'
                      : 'border-transparent',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-300 bg-zinc-200/50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isPlaying
                ? 'animate-pulse bg-green-500'
                : 'bg-zinc-400 dark:bg-zinc-600',
            )}
          />
          <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
            {isPlaying ? 'PLAYING' : 'STOPPED'}
          </span>
        </div>
        <span className="text-[9px] text-zinc-500">CLICK TO ARM STEPS</span>
      </div>
    </div>
  )
}
