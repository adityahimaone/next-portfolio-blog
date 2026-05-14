'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Track {
  title: string
  artist: string
  duration: string
  color: string
}

const TRACKS: Track[] = [
  { title: 'Midnight Groove', artist: 'Aditya Himawan', duration: '4:20', color: 'from-amber-600 to-orange-800' },
  { title: 'Digital Waves', artist: 'Frontend Beats', duration: '3:45', color: 'from-blue-600 to-indigo-800' },
  { title: 'Neon Pulse', artist: 'Synth City', duration: '5:12', color: 'from-pink-600 to-purple-800' },
]

export function VinylRecordPlayer({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [rpm, setRpm] = useState<33 | 45>(33)
  const [progress, setProgress] = useState(0)
  const animRef = useRef<number>(0)
  const lastTime = useRef<number>(0)

  const track = TRACKS[currentTrack]

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animRef.current)
      return
    }

    const speed = rpm === 33 ? 0.3 : 0.45

    const animate = (time: number) => {
      if (lastTime.current) {
        const delta = time - lastTime.current
        setRotation((prev) => prev + speed * delta * 0.06)
        setProgress((prev) => (prev + delta * 0.0001) % 1)
      }
      lastTime.current = time
      animRef.current = requestAnimationFrame(animate)
    }

    lastTime.current = 0
    animRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying, rpm])

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), [])
  const nextTrack = useCallback(() => {
    setCurrentTrack((p) => (p + 1) % TRACKS.length)
    setProgress(0)
  }, [])
  const prevTrack = useCallback(() => {
    setCurrentTrack((p) => (p - 1 + TRACKS.length) % TRACKS.length)
    setProgress(0)
  }, [])

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100 shadow-xl dark:border-zinc-700 dark:bg-zinc-950',
      className
    )}>
      {/* Top panel */}
      <div className="flex items-center justify-between border-b border-zinc-300 bg-zinc-200/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">TURNTABLE</div>
            <div className="text-[9px] text-zinc-500">DIRECT DRIVE / HI-FI</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRpm(33)}
            className={cn(
              'rounded px-2 py-1 text-[10px] font-bold transition-colors',
              rpm === 33
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'bg-zinc-300 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
            )}
          >
            33
          </button>
          <button
            onClick={() => setRpm(45)}
            className={cn(
              'rounded px-2 py-1 text-[10px] font-bold transition-colors',
              rpm === 45
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'bg-zinc-300 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
            )}
          >
            45
          </button>
        </div>
      </div>

      {/* Platter area */}
      <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-center sm:gap-10">
        {/* Vinyl disc */}
        <div className="relative">
          <div
            className={cn(
              'relative h-56 w-56 rounded-full shadow-2xl sm:h-64 sm:w-64',
              'bg-gradient-to-br',
              track.color
            )}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Grooves */}
            <div className="absolute inset-2 rounded-full border border-black/10" />
            <div className="absolute inset-4 rounded-full border border-black/10" />
            <div className="absolute inset-6 rounded-full border border-black/10" />
            <div className="absolute inset-8 rounded-full border border-black/10" />
            <div className="absolute inset-10 rounded-full border border-black/10" />
            <div className="absolute inset-12 rounded-full border border-black/10" />
            <div className="absolute inset-14 rounded-full border border-black/10" />

            {/* Label */}
            <div className="absolute inset-[4.5rem] flex flex-col items-center justify-center rounded-full bg-zinc-100 shadow-inner sm:inset-[5rem] dark:bg-zinc-800">
              <span className="text-[8px] font-bold text-zinc-500 uppercase">Side A</span>
              <span className="mt-0.5 max-w-[60px] text-center text-[9px] font-bold leading-tight text-zinc-800 dark:text-zinc-200">
                {track.title}
              </span>
              <span className="mt-0.5 text-[7px] text-zinc-500">{track.artist}</span>
            </div>

            {/* Spindle hole */}
            <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          </div>

          {/* Tonearm */}
          <div
            className={cn(
              'absolute -top-4 right-0 h-40 w-2 origin-top-right rounded-full bg-zinc-400 shadow-lg transition-transform duration-700 sm:-top-6 sm:right-2 sm:h-48',
              isPlaying ? 'rotate-[35deg]' : 'rotate-[15deg]'
            )}
          >
            <div className="absolute bottom-0 left-1/2 h-4 w-6 -translate-x-1/2 rounded-sm bg-zinc-600" />
          </div>
        </div>

        {/* Controls & Info */}
        <div className="w-full max-w-xs space-y-4">
          {/* Now playing */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Now Playing</div>
            <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">{track.title}</div>
            <div className="text-sm text-zinc-500">{track.artist}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
              <span>{formatTime(progress * 260)}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${progress * 100}%` }} />
              </div>
              <span>{track.duration}</span>
            </div>
          </div>

          {/* Transport */}
          <div className="flex items-center justify-center gap-3">
            <m.button whileTap={{ scale: 0.9 }} onClick={prevTrack} className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <SkipBack size={16} />
            </m.button>
            <m.button
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-lg transition-colors',
                isPlaying
                  ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                  : 'border-zinc-300 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
              )}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
            </m.button>
            <m.button whileTap={{ scale: 0.9 }} onClick={nextTrack} className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <SkipForward size={16} />
            </m.button>
          </div>

          {/* Track list */}
          <div className="space-y-1">
            {TRACKS.map((t, i) => (
              <button
                key={i}
                onClick={() => { setCurrentTrack(i); setProgress(0) }}
                className={cn(
                  'flex w-full items-center justify-between rounded px-3 py-2 text-left text-xs transition-colors',
                  i === currentTrack
                    ? 'bg-amber-50 font-medium text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-400">{String(i + 1).padStart(2, '0')}</span>
                  {t.title}
                </span>
                <span className="text-zinc-400">{t.duration}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-300 bg-zinc-200/50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', isPlaying ? 'animate-pulse bg-green-500' : 'bg-zinc-400')} />
          <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">{isPlaying ? 'PLAYING' : 'STOPPED'}</span>
        </div>
        <span className="text-[9px] text-zinc-500">{rpm} RPM / DIRECT DRIVE</span>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
