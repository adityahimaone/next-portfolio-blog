'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { useTheme } from 'next-themes'
import styles from './hero.module.css'

export function HeroTransport() {
  const { isPlaying, togglePlay } = useAudio()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [timecode, setTimecode] = useState({ h: 0, m: 0, s: 0, f: 0 })
  const frameRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)

  const updateTimecode = useCallback(() => {
    if (!isPlaying) return
    if (startTimeRef.current === null) startTimeRef.current = Date.now()
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const frames = Math.floor(((Date.now() - startTimeRef.current) % 1000) / (1000 / 30))
    setTimecode({
      h: Math.floor(elapsed / 3600),
      m: Math.floor((elapsed % 3600) / 60),
      s: elapsed % 60,
      f: frames,
    })
    frameRef.current = requestAnimationFrame(updateTimecode)
  }, [isPlaying])

  useEffect(() => {
    if (isPlaying) {
      frameRef.current = requestAnimationFrame(updateTimecode)
    } else {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [isPlaying, updateTimecode])

  const pad = (n: number, len = 2) => String(n).padStart(len, '0')

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-6 border-t px-6 py-2.5 backdrop-blur-md',
        'border-zinc-200/40 bg-white/50 dark:border-zinc-800/40 dark:bg-zinc-950/50',
      )}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md border transition-all active:scale-95 cursor-pointer',
            isPlaying
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500'
              : isDark
                ? 'border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                : 'border-zinc-300 bg-zinc-100/80 text-zinc-500 hover:text-zinc-800',
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="1" y="1" width="3" height="8" fill="currentColor" rx="0.5" />
              <rect x="6" y="1" width="3" height="8" fill="currentColor" rx="0.5" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polygon points="2,1 9,5 2,9" fill="currentColor" />
            </svg>
          )}
        </button>
        <button
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md border transition-all cursor-pointer',
            isDark ? 'border-zinc-700 bg-zinc-800/80 text-zinc-500' : 'border-zinc-300 bg-zinc-100/80 text-zinc-400',
          )}
          aria-label="Stop"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="2" y="2" width="6" height="6" fill="currentColor" rx="0.5" />
          </svg>
        </button>
        <button
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md border transition-all cursor-pointer',
            isDark ? 'border-zinc-700 bg-zinc-800/80' : 'border-zinc-300 bg-zinc-100/80',
          )}
          aria-label="Record"
        >
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        </button>
      </div>

      <div className="font-[family-name:var(--font-jetbrains-mono)] text-sm tabular-nums tracking-wider">
        <span className="text-zinc-700 dark:text-zinc-300">{pad(timecode.h)}</span>
        <span className={cn(styles.colonBlink, 'text-zinc-400 dark:text-zinc-600')}>:</span>
        <span className="text-zinc-700 dark:text-zinc-300">{pad(timecode.m)}</span>
        <span className={cn(styles.colonBlink, 'text-zinc-400 dark:text-zinc-600')}>:</span>
        <span className="text-zinc-700 dark:text-zinc-300">{pad(timecode.s)}</span>
        <span className={cn(styles.colonBlink, 'text-zinc-400 dark:text-zinc-600')}>:</span>
        <span className="text-zinc-500 dark:text-zinc-500">{pad(timecode.f)}</span>
      </div>

      <div className={cn(styles.scrollHint, 'flex items-center gap-1.5 text-zinc-400 dark:text-zinc-600')}>
        <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] tracking-widest uppercase">scroll</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
