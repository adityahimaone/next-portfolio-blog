'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { m } from 'motion/react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Generate demo waveform data
function generateWaveform(length: number): number[] {
  const data: number[] = []
  for (let i = 0; i < length; i++) {
    const t = i / length
    const val = Math.sin(t * Math.PI * 8) * 0.3 +
      Math.sin(t * Math.PI * 16) * 0.2 +
      Math.sin(t * Math.PI * 32) * 0.1 +
      (Math.random() - 0.5) * 0.15
    data.push(Math.max(-1, Math.min(1, val)))
  }
  return data
}

const WAVEFORM = generateWaveform(200)
const TRACK_INFO = {
  title: 'Frontend Groove',
  artist: 'Aditya Himawan',
  duration: 184,
}

export function WaveformPlayer({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(80)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const animRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      cancelAnimationFrame(animRef.current)
    } else {
      setIsPlaying(true)
      const start = Date.now() - progress * TRACK_INFO.duration * 10
      const animate = () => {
        const elapsed = (Date.now() - start) / 1000
        const newProgress = Math.min(1, elapsed / TRACK_INFO.duration)
        setProgress(newProgress)
        if (newProgress < 1) {
          animRef.current = requestAnimationFrame(animate)
        } else {
          setIsPlaying(false)
        }
      }
      animRef.current = requestAnimationFrame(animate)
    }
  }, [isPlaying, progress])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    setProgress(Math.max(0, Math.min(1, x)))
  }, [])

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const currentTime = progress * TRACK_INFO.duration

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100 shadow-xl dark:border-zinc-700 dark:bg-zinc-950',
      className
    )}>
      <div className="flex items-center justify-between border-b border-zinc-300 bg-zinc-200/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-2.5 w-2.5 rounded-full bg-pink-500" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">WAVEFORM</div>
            <div className="text-[9px] text-zinc-500">AUDIO PLAYER / SEEKABLE</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 size={14} className="text-zinc-500" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-zinc-300 accent-primary dark:bg-zinc-700"
          />
        </div>
      </div>

      {/* Track info */}
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-gradient-to-br from-pink-500 to-purple-600 text-lg font-bold text-white">
          ♪
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-zinc-900 dark:text-white">{TRACK_INFO.title}</div>
          <div className="text-xs text-zinc-500">{TRACK_INFO.artist}</div>
        </div>
        <m.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-lg transition-colors',
            isPlaying
              ? 'border-pink-300 bg-pink-50 text-pink-600 dark:border-pink-800 dark:bg-pink-950/30 dark:text-pink-400'
              : 'border-zinc-300 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
          )}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </m.button>
      </div>

      {/* Waveform */}
      <div
        ref={containerRef}
        className="relative h-24 cursor-pointer bg-zinc-50 dark:bg-zinc-900"
        onClick={handleSeek}
        onMouseMove={(e) => {
          if (!containerRef.current) return
          const rect = containerRef.current.getBoundingClientRect()
          setHoverX((e.clientX - rect.left) / rect.width)
        }}
        onMouseLeave={() => setHoverX(null)}
      >
        <svg className="h-full w-full" preserveAspectRatio="none">
          {WAVEFORM.map((val, i) => {
            const x = (i / WAVEFORM.length) * 100
            const barHeight = Math.abs(val) * 80
            const isPlayed = i / WAVEFORM.length <= progress
            const isHovered = hoverX !== null && Math.abs(i / WAVEFORM.length - hoverX) < 0.02

            return (
              <rect
                key={i}
                x={`${x}%`}
                y={`${50 - barHeight / 2}%`}
                width={`${100 / WAVEFORM.length + 0.2}%`}
                height={`${barHeight}%`}
                rx={1}
                className={cn(
                  'transition-all',
                  isPlayed
                    ? 'fill-pink-500'
                    : 'fill-zinc-300 dark:fill-zinc-700',
                  isHovered && 'fill-pink-400'
                )}
              />
            )
          })}
        </svg>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-pink-500 shadow-[0_0_4px_rgba(236,72,153,0.6)] pointer-events-none"
          style={{ left: `${progress * 100}%` }}
        />

        {/* Hover time */}
        {hoverX !== null && (
          <div
            className="absolute -top-1 rounded bg-pink-500 px-1.5 py-0.5 text-[9px] font-bold text-white"
            style={{ left: `${hoverX * 100}%`, transform: 'translateX(-50%)' }}
          >
            {formatTime(hoverX * TRACK_INFO.duration)}
          </div>
        )}
      </div>

      {/* Time */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-500">
        <span className="font-mono">{formatTime(currentTime)}</span>
        <span className="font-mono">{formatTime(TRACK_INFO.duration)}</span>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-300 bg-zinc-200/50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', isPlaying ? 'animate-pulse bg-green-500' : 'bg-zinc-400')} />
          <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">{isPlaying ? 'PLAYING' : 'STOPPED'}</span>
        </div>
        <span className="text-[9px] text-zinc-500">CLICK WAVEFORM TO SEEK</span>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
