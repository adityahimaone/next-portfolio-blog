'use client'

/**
 * Horizontal "track strip" header used at the top of every r3 section.
 * Mimics a DAW track header: TRACK # | NAME | DEVICE | LED + bars.
 *
 * Props are intentionally minimal — sections compose their own narrative
 * underneath this strip.
 */

import { cn } from '@/lib/utils'

interface TrackStripProps {
  trackNumber: string
  trackName: string
  deviceLabel: string
  color?: 'clip' | 'beat' | 'signal' | 'filament' | 'melody'
  status?: string
  bpm?: number
  className?: string
}

const colorMap: Record<NonNullable<TrackStripProps['color']>, string> = {
  clip: 'r3-led--clip',
  beat: 'r3-led--beat',
  signal: '',
  filament: 'r3-led--filament',
  melody: '',
}

export function TrackStrip({
  trackNumber,
  trackName,
  deviceLabel,
  color = 'signal',
  status = 'ARMED',
  bpm = 120,
  className,
}: TrackStripProps) {
  return (
    <div
      className={cn(
        'r3-panel flex items-center justify-between gap-4 px-3 py-2 sm:px-4 sm:py-2.5',
        className,
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <span className="r3-mono text-[10px] sm:text-xs text-[var(--r3-text-mute)] tabular-nums shrink-0">
          {trackNumber}
        </span>
        <span
          className={cn('r3-led r3-pulse shrink-0', colorMap[color])}
          aria-hidden
        />
        <span className="r3-display text-sm sm:text-base font-semibold truncate">
          {trackName}
        </span>
        <span className="hidden sm:inline-block h-3 w-px bg-[var(--r3-edge)]" />
        <span className="hidden sm:block r3-label truncate">
          {deviceLabel}
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="r3-mono text-[10px] text-[var(--r3-text-mute)] tabular-nums">
          {bpm} BPM
        </span>
        <span className="hidden sm:inline-block h-3 w-px bg-[var(--r3-edge)]" />
        <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-signal)]">
          {status}
        </span>
      </div>
    </div>
  )
}
