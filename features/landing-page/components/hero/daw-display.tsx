'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CHANNEL_COLORS } from '@/features/landing-page/constants/daw-channels'
import styles from './daw-hero.module.css'

interface NameLetter {
  char: string
  ch: number
  color: string
  param: string // e.g. "NEXT.JS", "TYPSCR" — shows below letter
  pan: number // -50 to +50 for PAN display
  db: number // volume in dB e.g. -3.7
}

const NAME_CELLS: NameLetter[] = [
  {
    char: 'A',
    ch: 1,
    color: CHANNEL_COLORS[0],
    param: 'FRONTED',
    pan: 0,
    db: -3.5,
  },
  {
    char: 'D',
    ch: 2,
    color: CHANNEL_COLORS[1],
    param: 'NEXT.JS',
    pan: -7,
    db: -5.3,
  },
  {
    char: 'I',
    ch: 3,
    color: CHANNEL_COLORS[2],
    param: 'TYPSCR',
    pan: 2,
    db: -6.0,
  },
  {
    char: 'T',
    ch: 4,
    color: CHANNEL_COLORS[3],
    param: 'TAILWND',
    pan: -4,
    db: -4.2,
  },
  {
    char: 'Y',
    ch: 5,
    color: CHANNEL_COLORS[4],
    param: 'FRAMER',
    pan: 8,
    db: -3.7,
  },
  {
    char: 'A',
    ch: 6,
    color: CHANNEL_COLORS[5],
    param: 'NODE',
    pan: -3,
    db: -7.1,
  },
  {
    char: 'H',
    ch: 7,
    color: CHANNEL_COLORS[6],
    param: 'PYTHON',
    pan: 5,
    db: -1.3,
  },
  {
    char: 'I',
    ch: 8,
    color: CHANNEL_COLORS[7],
    param: 'HERMES',
    pan: -6,
    db: -4.6,
  },
  {
    char: 'M',
    ch: 9,
    color: CHANNEL_COLORS[8],
    param: 'IDX',
    pan: 0,
    db: -2.1,
  },
  {
    char: 'A',
    ch: 10,
    color: CHANNEL_COLORS[9],
    param: 'DEVOPS',
    pan: -2,
    db: -8.4,
  },
  {
    char: 'O',
    ch: 11,
    color: CHANNEL_COLORS[10],
    param: 'VPS',
    pan: 4,
    db: -5.9,
  },
  {
    char: 'N',
    ch: 12,
    color: CHANNEL_COLORS[11],
    param: 'NGINX',
    pan: -1,
    db: -3.3,
  },
  {
    char: 'E',
    ch: 13,
    color: CHANNEL_COLORS[12],
    param: 'DESIGN',
    pan: 7,
    db: -0.7,
  },
]

interface DawDisplayProps {
  baseDelay?: number
}

export function DawDisplay({ baseDelay = 0 }: DawDisplayProps) {
  const [visibleCount, setVisibleCount] = useState(0)

  // Staggered boot-up: each cell becomes visible in sequence
  useEffect(() => {
    if (visibleCount >= NAME_CELLS.length) return
    const t = setTimeout(() => setVisibleCount((n) => n + 1), 60)
    return () => clearTimeout(t)
  }, [visibleCount])

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        'rounded-sm border',
        'border-[var(--ko-screw)]/60',
        // Display glass — always dark regardless of mode
        'instrument-display bg-[var(--ko-display-bg)]',
        // Inset shadow for LCD depth
        'shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.04)]',
        styles.displayPhosphor,
      )}
      style={{ height: '120px' }}
    >
      <div className="pointer-events-none absolute top-2 left-3 z-20 font-mono text-[7px] font-bold tracking-[0.18em] text-white/40 uppercase">
        音場 · SOUND FIELD
      </div>

      {/* Green phosphor scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, color-mix(in srgb, var(--daw-led-green) 3%, transparent) 2px, color-mix(in srgb, var(--daw-led-green) 3%, transparent) 4px)',
        }}
      />

      {/* Channel cells row */}
      <div className="relative z-20 flex h-full pr-24">
        {NAME_CELLS.map((cell, i) => {
          const isVisible = i < visibleCount
          return (
            <DawDisplayCell
              key={`${cell.char}-${i}`}
              cell={cell}
              isVisible={isVisible}
              animDelay={i * 0.06 + baseDelay}
            />
          )
        })}
      </div>

      {/* Right-side master readout */}
      <div className="absolute top-0 right-0 bottom-0 flex w-24 flex-col items-end justify-center gap-1.5 border-l border-white/5 px-3">
        <span className="font-mono text-[8px] tracking-widest text-white/45 uppercase">
          Master / 出力
        </span>
        <span
          className="font-mono text-[13px] font-bold tabular-nums"
          style={{
            color: 'var(--daw-gold)',
            textShadow: '0 0 8px var(--daw-gold)',
          }}
        >
          0.0 dB
        </span>
        {/* Mini stereo meter */}
        <div className="flex items-end gap-0.5">
          {[...Array(8)].map((_, s) => (
            <MeterSegment key={s} index={s} totalSegments={8} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Sub-component: individual channel cell ── */
interface DawDisplayCellProps {
  cell: NameLetter
  isVisible: boolean
  animDelay: number
}

function DawDisplayCell({ cell, isVisible, animDelay }: DawDisplayCellProps) {
  const panStr = cell.pan === 0 ? 'C' : `${cell.pan > 0 ? '+' : ''}${cell.pan}`

  return (
    <div
      className={cn(
        'relative flex min-w-0 flex-1 flex-col justify-between border-r border-white/[0.04] px-1.5 py-1.5 transition-opacity duration-200',
        isVisible ? 'opacity-100' : 'opacity-0',
        cell.ch > 6 && 'hidden sm:flex', // Hide cells 7-13 on mobile screen sizes
      )}
      style={{ animationDelay: `${animDelay}s` }}
    >
      {/* Top row: channel badge + label */}
      <div className="flex items-center gap-1">
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] font-mono text-[8px] font-bold text-white"
          style={{ background: cell.color }}
        >
          {cell.ch}
        </span>
        <span className="truncate font-mono text-[8px] tracking-wide text-white/60 uppercase">
          {cell.param}
        </span>
      </div>

      {/* Middle: large LED letter */}
      <div
        className={cn(
          'flex justify-center font-mono text-4xl leading-none font-black',
          styles.ledChar,
        )}
        style={{
          color: cell.color,
          textShadow: `0 0 8px ${cell.color}, 0 0 16px ${cell.color}60`,
          animationDelay: `${animDelay + 0.15}s`,
        }}
      >
        {cell.char}
      </div>

      {/* Bottom row: PAN + VU */}
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[6px] text-white/30 uppercase">
            Pan
          </div>
          <div className="font-mono text-[8px] text-white/70 tabular-nums">
            {panStr}
          </div>
        </div>
        <div className="flex items-end gap-[2px]" style={{ height: '24px' }}>
          {[...Array(4)].map((_, b) => (
            <div
              key={b}
              className={cn(styles.vuBar, 'w-[3px] rounded-t-[1px]')}
              style={
                {
                  '--vu-min': `${6 + b * 2}px`,
                  '--vu-max': `${16 + b * 3}px`,
                  '--vu-dur': `${0.8 + b * 0.15 + (cell.ch % 3) * 0.1}s`,
                  background: b < 3 ? cell.color : 'var(--daw-led-red)',
                  animationDelay: `${cell.ch * 0.07}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Sub-component: master meter segment ── */
function MeterSegment({
  index,
  totalSegments,
}: {
  index: number
  totalSegments: number
}) {
  const isHot = index >= totalSegments - 2
  const color = isHot
    ? 'var(--daw-led-red)'
    : index >= totalSegments - 3
      ? 'var(--daw-led-amber)'
      : 'var(--daw-led-green)'
  return (
    <div
      className="w-1 rounded-[1px] opacity-70"
      style={{
        height: `${4 + index * 1.5}px`,
        background: color,
        boxShadow: `0 0 4px ${color}60`,
      }}
    />
  )
}
