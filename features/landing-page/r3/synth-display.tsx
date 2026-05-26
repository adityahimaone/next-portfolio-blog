'use client'

/**
 * Ravemped 4.0 — LCD synth display.
 *
 * Pixel-font screen with scanlines, phosphor glow, and animated readouts.
 * Visual-only; data passed in via props.
 */

import { cn } from '@/lib/utils'

interface SynthDisplayProps {
  preset: string
  title: string
  tagline: string
  oscillator: string
  cutoff: number
  resonance: number
  bpm: number
  ambient: boolean
}

export function SynthDisplay({
  preset,
  title,
  tagline,
  oscillator,
  cutoff,
  resonance,
  bpm,
  ambient,
}: SynthDisplayProps) {
  return (
    <div
      className={cn(
        'r3-lcd relative overflow-hidden rounded-sm border',
        'border-[var(--r3-edge)] bg-[#04140a]',
      )}
      style={{
        boxShadow:
          'inset 0 0 60px rgba(57,255,110,0.08), inset 0 0 0 1px rgba(57,255,110,0.18), 0 0 0 4px #060611, 0 0 0 5px #1c1c2c',
      }}
    >
      {/* Scanlines */}
      <div className="r3-scanlines pointer-events-none absolute inset-0" aria-hidden />
      {/* Phosphor afterglow gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at 30% 0%, rgba(57,255,110,0.12) 0%, transparent 60%)',
        }}
      />

      <div className="relative p-4 sm:p-5 lg:p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between r3-mono text-[10px] uppercase tracking-widest text-[var(--r3-signal)]/80">
          <span>PRESET · {preset}</span>
          <div className="flex items-center gap-2">
            <span className={cn('r3-mono', ambient ? 'text-[var(--r3-signal)]' : 'text-[var(--r3-signal)]/40')}>
              {ambient ? '● PLAYING' : '○ STOPPED'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-[var(--r3-signal)]/15" />

        {/* Identity */}
        <div className="space-y-1.5">
          <div
            className="r3-mono text-[10px] uppercase tracking-[0.3em] text-[var(--r3-signal)]/60"
            style={{ textShadow: '0 0 8px rgba(57,255,110,0.4)' }}
          >
            ADITYA HIMAWAN
          </div>
          <div
            className="text-2xl font-bold leading-tight text-[var(--r3-signal)] sm:text-3xl lg:text-4xl"
            style={{
              fontFamily: 'var(--r3-display)',
              textShadow: '0 0 12px rgba(57,255,110,0.45), 0 0 2px rgba(57,255,110,0.9)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
          <p
            className="r3-mono text-[11px] leading-relaxed text-[var(--r3-signal)]/70 sm:text-xs"
            style={{ textShadow: '0 0 6px rgba(57,255,110,0.25)' }}
          >
            {tagline}
          </p>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-[var(--r3-signal)]/15" />

        {/* Readout strip */}
        <div className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-4 sm:grid-cols-4">
          <Readout label="OSC" value={oscillator.toUpperCase()} />
          <Readout label="CUT" value={`${Math.round(cutoff * 100)}%`} />
          <Readout label="RES" value={`${Math.round(resonance * 100)}%`} />
          <Readout label="BPM" value={String(bpm).padStart(3, '0')} />
        </div>
      </div>
    </div>
  )
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="r3-mono text-[9px] uppercase tracking-widest text-[var(--r3-signal)]/45"
      >
        {label}
      </span>
      <span
        className="r3-mono text-xs font-bold tabular-nums text-[var(--r3-signal)]"
        style={{ textShadow: '0 0 8px rgba(57,255,110,0.35)' }}
      >
        {value}
      </span>
    </div>
  )
}
