'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { m } from 'motion/react'
import { Play, Pause, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Note {
  key: number
  start: number
  duration: number
  color: string
}

const NOTES: Note[] = [
  { key: 60, start: 0, duration: 2, color: 'bg-blue-500' },
  { key: 64, start: 2, duration: 2, color: 'bg-blue-500' },
  { key: 67, start: 4, duration: 2, color: 'bg-blue-500' },
  { key: 72, start: 6, duration: 2, color: 'bg-blue-500' },
  { key: 67, start: 8, duration: 2, color: 'bg-blue-500' },
  { key: 64, start: 10, duration: 2, color: 'bg-blue-500' },
  { key: 60, start: 12, duration: 4, color: 'bg-blue-500' },
  { key: 55, start: 1, duration: 1, color: 'bg-purple-500' },
  { key: 55, start: 3, duration: 1, color: 'bg-purple-500' },
  { key: 55, start: 5, duration: 1, color: 'bg-purple-500' },
  { key: 52, start: 9, duration: 1, color: 'bg-purple-500' },
  { key: 52, start: 11, duration: 1, color: 'bg-purple-500' },
  { key: 48, start: 8, duration: 4, color: 'bg-emerald-500' },
  { key: 53, start: 12, duration: 4, color: 'bg-emerald-500' },
]

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const KEY_COLORS = ['white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white']

function getKeyName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1
  const note = midi % 12
  return `${KEY_NAMES[note]}${octave}`
}

export function PianoRoll({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playhead, setPlayhead] = useState(0)
  const animRef = useRef<number>(0)
  const startTime = useRef<number>(0)
  const duration = 16 // bars
  const keys = Array.from({ length: 24 }, (_, i) => 72 - i)

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      cancelAnimationFrame(animRef.current)
    } else {
      setIsPlaying(true)
      startTime.current = Date.now()
      const animate = () => {
        const elapsed = (Date.now() - startTime.current) / 1000
        const bars = (elapsed * 2) % duration
        setPlayhead(bars)
        animRef.current = requestAnimationFrame(animate)
      }
      animRef.current = requestAnimationFrame(animate)
    }
  }, [isPlaying])

  const stop = useCallback(() => {
    setIsPlaying(false)
    cancelAnimationFrame(animRef.current)
    setPlayhead(0)
  }, [])

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100 shadow-xl dark:border-zinc-700 dark:bg-zinc-950',
      className
    )}>
      <div className="flex items-center justify-between border-b border-zinc-300 bg-zinc-200/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">PIANO ROLL</div>
            <div className="text-[9px] text-zinc-500">16-BARS / NOTE EDITOR</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <m.button whileTap={{ scale: 0.9 }} onClick={togglePlay}
            className={cn('flex h-9 w-9 items-center justify-center rounded border shadow-sm transition-colors',
              isPlaying
                ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300')}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </m.button>
          <m.button whileTap={{ scale: 0.9 }} onClick={stop}
            className="flex h-9 w-9 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Square size={14} />
          </m.button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Ruler */}
          <div className="flex h-6 border-b border-zinc-300 bg-zinc-200/50 dark:border-zinc-700 dark:bg-zinc-900/50">
            <div className="w-12 shrink-0 border-r border-zinc-300 dark:border-zinc-700" />
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={cn('flex-1 border-r border-zinc-200 px-1 text-[9px] font-mono text-zinc-500 dark:border-zinc-800', i % 4 === 0 && 'bg-zinc-200/30 dark:bg-zinc-800/30')}>
                {i + 1}
              </div>
            ))}
          </div>

          {/* Keys + Notes */}
          <div className="relative">
            {keys.map((key, rowIdx) => {
              const noteIdx = key % 12
              const isBlack = KEY_COLORS[noteIdx] === 'black'
              return (
                <div key={key} className={cn('flex h-5 border-b border-zinc-200 dark:border-zinc-800', isBlack ? 'bg-zinc-200/50 dark:bg-zinc-800/50' : 'bg-zinc-100 dark:bg-zinc-950')}>
                  {/* Key label */}
                  <div className={cn('w-12 shrink-0 border-r border-zinc-300 px-1 text-right text-[9px] font-mono dark:border-zinc-700', isBlack ? 'text-zinc-400' : 'text-zinc-600')}>
                    {getKeyName(key)}
                  </div>
                  {/* Grid cells */}
                  <div className="relative flex flex-1">
                    {Array.from({ length: 16 }).map((_, colIdx) => (
                      <div key={colIdx} className={cn('flex-1 border-r border-zinc-100 dark:border-zinc-900', colIdx % 4 === 0 && 'border-r-zinc-300 dark:border-r-zinc-700')} />
                    ))}
                    {/* Notes */}
                    {NOTES.filter((n) => n.key === key).map((note, ni) => (
                      <div
                        key={ni}
                        className={cn('absolute top-0.5 h-4 rounded-sm', note.color, 'shadow-sm')}
                        style={{
                          left: `calc(${(note.start / 16) * 100}% + 3rem)`,
                          width: `calc(${(note.duration / 16) * 100}% - 2px)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)] z-10 pointer-events-none"
              style={{ left: `calc(${(playhead / 16) * 100}% + 3rem)` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-300 bg-zinc-200/50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', isPlaying ? 'animate-pulse bg-green-500' : 'bg-zinc-400')} />
          <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">{isPlaying ? 'PLAYING' : 'STOPPED'}</span>
        </div>
        <span className="text-[9px] text-zinc-500">BAR {Math.floor(playhead) + 1} / 16</span>
      </div>
    </div>
  )
}
