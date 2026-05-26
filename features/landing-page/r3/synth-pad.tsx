'use client'

/**
 * Ravemped 4.0 — Synth pad strip.
 *
 * 8 MPC-style pads. Each pad maps to a Tone.js note + a label representing
 * something Adit does (profession, tech, interest). Click/tap = trigger.
 * Keyboard: 1-8 trigger the corresponding pad.
 */

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface PadDef {
  id: number
  note: string
  label: string
  /** 1-character keyboard binding */
  key: string
  accent: string
}

const PADS: PadDef[] = [
  { id: 1, note: 'C4', label: 'frontend', key: '1', accent: 'var(--r3-signal)' },
  { id: 2, note: 'D4', label: 'react', key: '2', accent: 'var(--r3-signal)' },
  { id: 3, note: 'E4', label: 'next.js', key: '3', accent: 'var(--r3-clip)' },
  { id: 4, note: 'F4', label: 'typescript', key: '4', accent: 'var(--r3-clip)' },
  { id: 5, note: 'G4', label: 'tailwind', key: '5', accent: 'var(--r3-beat)' },
  { id: 6, note: 'A4', label: 'tone.js', key: '6', accent: 'var(--r3-beat)' },
  { id: 7, note: 'B4', label: 'devops', key: '7', accent: 'var(--r3-filament)' },
  { id: 8, note: 'C5', label: 'building', key: '8', accent: 'var(--r3-melody)' },
]

interface SynthPadProps {
  onTrigger: (pad: PadDef) => void
}

export function SynthPad({ onTrigger }: SynthPadProps) {
  const [active, setActive] = useState<number | null>(null)

  const handlePress = useCallback(
    (pad: PadDef) => {
      onTrigger(pad)
      setActive(pad.id)
      window.setTimeout(() => {
        setActive((cur) => (cur === pad.id ? null : cur))
      }, 180)
    },
    [onTrigger],
  )

  // Keyboard: 1-8
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Skip if focus is in a typeable element
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        return
      }
      const pad = PADS.find((p) => p.key === e.key)
      if (pad) {
        e.preventDefault()
        handlePress(pad)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handlePress])

  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      {PADS.map((pad) => {
        const isActive = active === pad.id
        return (
          <button
            key={pad.id}
            type="button"
            onPointerDown={() => handlePress(pad)}
            aria-label={`Pad ${pad.id} — ${pad.label}, plays ${pad.note}`}
            className={cn(
              'group relative flex aspect-square flex-col items-center justify-center rounded-sm border transition-all',
              'border-[var(--r3-edge)] bg-[var(--r3-rack)] hover:border-[var(--r3-text-mute)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--r3-signal)]/60',
              isActive && 'scale-[0.96]',
            )}
            style={{
              boxShadow: isActive
                ? `0 0 0 1px ${pad.accent}, 0 0 16px ${pad.accent}88, inset 0 0 12px ${pad.accent}55`
                : 'inset 0 -2px 4px rgba(0,0,0,0.4)',
            }}
          >
            {/* Top-right: keyboard hint */}
            <span className="absolute right-1 top-1 r3-mono text-[8px] text-[var(--r3-label)]">
              {pad.key}
            </span>
            {/* Top-left: note */}
            <span className="absolute left-1 top-1 r3-mono text-[8px] text-[var(--r3-label)]">
              {pad.note}
            </span>
            {/* LED */}
            <span
              className="mb-1 h-1.5 w-1.5 rounded-full transition-all"
              style={{
                background: isActive ? pad.accent : 'var(--r3-edge)',
                boxShadow: isActive ? `0 0 8px ${pad.accent}` : 'none',
              }}
              aria-hidden
            />
            {/* Label */}
            <span
              className={cn(
                'r3-mono text-[9px] sm:text-[10px] uppercase tracking-wider transition-colors',
                isActive ? 'text-[var(--r3-text)]' : 'text-[var(--r3-text-mute)]',
              )}
            >
              {pad.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
