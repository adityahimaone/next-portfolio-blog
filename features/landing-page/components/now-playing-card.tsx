'use client'

/**
 * Now Playing Card — Music Section v4
 *
 * Visual music player card with:
 * - Circular rotating album art (200x200px)
 * - Song title + artist
 * - Progress bar
 * - Transport controls (prev, play/pause, next)
 * - Waveform visualizer bars
 *
 * NOTE: Static/demo data for now. Actual Spotify wiring in Phase 5.
 */

import { useState, useEffect } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NowPlayingCardProps {
  isPlaying?: boolean
  onPlayPause?: () => void
}

// Demo track data
const DEMO_TRACK = {
  title: 'Untitled Session',
  artist: 'Aditya Himawan',
  duration: 154, // seconds
  current: 45,
}

// Waveform bars animation
function WaveformBars({ active }: { active: boolean }) {
  const prefersReduced = useReducedMotion()
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: 10 }, () => 20 + Math.random() * 60),
  )

  useEffect(() => {
    if (!active || prefersReduced) return
    const interval = setInterval(() => {
      setBars(
        Array.from({ length: 10 }, () => 20 + Math.random() * 60),
      )
    }, 150)
    return () => clearInterval(interval)
  }, [active, prefersReduced])

  return (
    <div className="flex items-end justify-center gap-1 h-12" aria-hidden>
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-150 bg-[var(--color-ink)]"
          style={{
            height: `${height}%`,
            opacity: 0.4 + (height / 100) * 0.6,
          }}
        />
      ))}
    </div>
  )
}

export function NowPlayingCard({
  isPlaying = false,
  onPlayPause,
}: NowPlayingCardProps) {
  const prefersReduced = useReducedMotion()
  const progress = (DEMO_TRACK.current / DEMO_TRACK.duration) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="bg-[var(--color-canvas)] rounded-[var(--radius-card)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
      {/* Album Art */}
      <div className="flex justify-center mb-6">
        <m.div
          animate={isPlaying && !prefersReduced ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 8,
            repeat: isPlaying ? Infinity : 0,
            ease: 'linear',
          }}
          className="w-[180px] h-[180px] rounded-full overflow-hidden border-4 border-[var(--color-ink)]/10 flex items-center justify-center bg-gradient-to-br from-[var(--color-slate)] to-[var(--color-accent-grey)]"
        >
          <div className="text-center">
            <div className="text-3xl mb-1">♪</div>
            <p className="text-[10px] text-[var(--color-accent-grey)]">Album Art</p>
          </div>
        </m.div>
      </div>

      {/* Now Playing Label */}
      <div className="text-center mb-5">
        <p className="font-ui text-[10px] uppercase tracking-[0.15em] text-[var(--color-accent-grey)] mb-1.5">
          Now Playing
        </p>
        <div className="h-px bg-[var(--color-accent-grey)] mx-auto mb-3 w-12" />
        <h3 className="font-display text-[18px] text-[var(--color-ink)] mb-0.5">
          {DEMO_TRACK.title}
        </h3>
        <p className="font-ui text-[12px] text-[var(--color-accent-grey)]">
          {DEMO_TRACK.artist}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-1 bg-[var(--color-accent-grey)]/20 rounded-full overflow-hidden mb-2">
          <m.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-[var(--color-ink)]"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="font-ui text-xs text-[var(--color-accent-grey)]">
            {formatTime(DEMO_TRACK.current)}
          </span>
          <span className="font-ui text-xs text-[var(--color-accent-grey)]">
            {formatTime(DEMO_TRACK.duration)}
          </span>
        </div>
      </div>

      {/* Waveform */}
      <div className="mb-8">
        <WaveformBars active={isPlaying} />
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          className="p-2 rounded-full border border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]/40 transition-colors"
          aria-label="Previous track"
        >
          <SkipBack size={16} className="text-[var(--color-ink)]" />
        </button>

        <button
          onClick={onPlayPause}
          className={cn(
            'p-3 rounded-full border-2 transition-all',
            isPlaying
              ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-canvas)]'
              : 'border-[var(--color-ink)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5',
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <button
          className="p-2 rounded-full border border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]/40 transition-colors"
          aria-label="Next track"
        >
          <SkipForward size={16} className="text-[var(--color-ink)]" />
        </button>
      </div>
    </div>
  )
}
