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
    const frames = Math.floor(
      ((Date.now() - startTimeRef.current) % 1000) / (1000 / 30),
    )
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
        'absolute right-0 bottom-0 left-0 z-30 flex items-center justify-center gap-6 border-t px-6 py-2.5 backdrop-blur-md',
        'border-graphite/15 bg-bone-white/60 dark:border-graphite/40 dark:bg-void/60',
      )}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className={cn(
            'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border transition-all active:scale-95',
            isPlaying
              ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_8px_rgba(175,80,255,0.3)]'
              : isDark
                ? 'border-graphite bg-void text-smoke hover:text-bone-white hover:border-iris/50'
                : 'border-graphite/25 bg-bone-white text-slate hover:text-foreground hover:border-plum/50',
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect
                x="1"
                y="1"
                width="3"
                height="8"
                fill="currentColor"
                rx="0.5"
              />
              <rect
                x="6"
                y="1"
                width="3"
                height="8"
                fill="currentColor"
                rx="0.5"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polygon points="2,1 9,5 2,9" fill="currentColor" />
            </svg>
          )}
        </button>
        <button
          className={cn(
            'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border transition-all',
            isDark
              ? 'border-graphite bg-void text-smoke hover:text-bone-white'
              : 'border-graphite/25 bg-bone-white text-slate hover:text-foreground',
          )}
          aria-label="Stop"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect
              x="2"
              y="2"
              width="6"
              height="6"
              fill="currentColor"
              rx="0.5"
            />
          </svg>
        </button>
        <button
          className={cn(
            'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border transition-all',
            isDark
              ? 'border-graphite bg-void'
              : 'border-graphite/25 bg-bone-white',
          )}
          aria-label="Record"
        >
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>
      </div>

      <div className="font-[family-name:var(--font-whyte-inktrap-mono)] text-sm tracking-wider tabular-nums">
        <span className="text-slate dark:text-ash">{pad(timecode.h)}</span>
        <span
          className={cn(styles.colonBlink, 'text-slate/40 dark:text-graphite')}
        >
          :
        </span>
        <span className="text-slate dark:text-ash">{pad(timecode.m)}</span>
        <span
          className={cn(styles.colonBlink, 'text-slate/40 dark:text-graphite')}
        >
          :
        </span>
        <span className="text-slate dark:text-ash">{pad(timecode.s)}</span>
        <span
          className={cn(styles.colonBlink, 'text-slate/40 dark:text-graphite')}
        >
          :
        </span>
        <span className="text-slate/65 dark:text-slate">{pad(timecode.f)}</span>
      </div>

      <div
        className={cn(
          styles.scrollHint,
          'text-slate/50 dark:text-graphite flex items-center gap-1.5',
        )}
      >
        <span className="font-[family-name:var(--font-whyte-inktrap-mono)] text-[10px] tracking-widest uppercase">
          scroll
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 4L5 7L8 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
