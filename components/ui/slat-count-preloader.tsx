'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import styles from './slat-count-preloader.module.css'

const s = styles

/* ── Pure helpers ─────────────────────────────────────────────────────────
   The schedule is arithmetic, so it lives outside React and can be asserted
   without a DOM. Everything the component does with time goes through these
   three, which is why the boot cannot drift from the value it reports. */

/** How many strips the rack is drawn with. Odd, so the two origins balance. */
export const SLAT_COUNT = 13

/** The reduced-motion beat: long enough to read a count, short enough to skip. */
export const REDUCED_STEP_MS = 320
export const REDUCED_EXIT_MS = 240

/** The step on screen at `elapsed`. Clamped, so a late tick still ends on the
 *  final frame rather than wrapping round to the first one. */
export function sequenceIndexAt(
  elapsed: number,
  steps: number,
  stepMs: number,
): number {
  if (steps <= 1 || stepMs <= 0) return 0
  return Math.min(
    steps - 1,
    Math.max(0, Math.floor(Math.max(0, elapsed) / stepMs)),
  )
}

/** 0 → 1 across the whole boot. The first frame is a quarter in, not zero,
 *  because the first count is already a step of progress. */
export function bootProgress(step: number, steps: number): number {
  if (steps <= 0) return 1
  return Math.min(1, Math.max(0, (step + 1) / steps))
}

/** When the exit starts and when the caller is told the boot is over. */
export function bootTimings(steps: number, stepMs: number, exitMs: number) {
  const exitAt = Math.max(0, steps * stepMs)
  return { exitAt, completeAt: exitAt + exitMs }
}

/** Per-strip delay, so the blinds open top-down rather than all at once. */
export function blindDelay(
  index: number,
  count: number,
  totalMs: number,
): number {
  if (count <= 1) return 0
  return (index / (count - 1)) * totalMs
}

/* ── Props ──────────────────────────────────────────────────────────────── */

export type SlatCountPalette = {
  background: string
  ink: string
  accent: string
}

/** `ink` is the rack's own hardware palette: graphite ground, warm white ink,
 *  signal orange as the single accent. */
export const SLAT_PRESETS = {
  ink: {
    background: '#14171a',
    ink: '#eee9df',
    accent: '#ff5a1f',
  },
} as const satisfies Record<string, SlatCountPalette>

export type SlatCountPreset = keyof typeof SLAT_PRESETS

export type SlatCountPreloaderProps = {
  sequence?: readonly string[]
  preset?: SlatCountPreset
  palette?: Partial<SlatCountPalette>
  label?: string
  caption?: string
  /** `blinds` collapses the strips; `fade` dissolves the overlay whole. */
  exit?: 'blinds' | 'fade'
  hud?: boolean
  /** Adds pointer and wheel gestures. The skip control always works. */
  interactive?: boolean
  stepMs?: number
  exitMs?: number
  onComplete?: () => void
}

const DEFAULT_SEQUENCE = ['003', '002', '001', 'READY'] as const

/**
 * The session boot.
 *
 * A visual boot sequence for the rack, not a report of network progress: the
 * sequence it steps through is the caller's copy, and nothing here claims to
 * have measured a download. The only live number on screen is the step
 * counter, which is the sequence's own position.
 *
 * Reachability is not optional. The overlay is `position: fixed` over the whole
 * page, so the skip control is a real `<button>` in the DOM at every size,
 * operable with Enter and Space, and carrying a visible focus ring. A pointer
 * is never required to leave.
 */
export default function SlatCountPreloader({
  sequence = DEFAULT_SEQUENCE,
  preset = 'ink',
  palette,
  label = 'RACK 01 / SESSION BOOT',
  caption = 'Routing interface, systems and production notes.',
  exit = 'blinds',
  hud = true,
  interactive = false,
  stepMs = 560,
  exitMs = 640,
  onComplete,
}: SlatCountPreloaderProps) {
  const [step, setStep] = useState(0)
  const [exiting, setExiting] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const finished = useRef(false)
  const intervalRef = useRef<number | null>(null)

  const colors = useMemo<SlatCountPalette>(
    () => ({ ...SLAT_PRESETS[preset], ...palette }),
    [preset, palette],
  )

  const steps = Math.max(1, sequence.length)
  const token = sequence[Math.min(step, steps - 1)] ?? ''
  const progress = bootProgress(step, steps)

  const complete = useCallback(() => {
    if (finished.current) return
    finished.current = true
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    onComplete?.()
  }, [onComplete])

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const beat = reduced ? Math.min(stepMs, REDUCED_STEP_MS) : stepMs
    const out = reduced ? Math.min(exitMs, REDUCED_EXIT_MS) : exitMs
    const { exitAt, completeAt } = bootTimings(steps, beat, out)
    const started = performance.now()

    // One clock for the whole boot, read on a coarse tick. Driving `step` and
    // `exiting` from the same elapsed time is what stops the exit from firing
    // on a frame where the last count has not been painted yet.
    const tick = () => {
      const elapsed = performance.now() - started
      if (elapsed >= completeAt) {
        complete()
        return
      }
      setStep(sequenceIndexAt(elapsed, steps, beat))
      setExiting(elapsed >= exitAt)
    }

    intervalRef.current = window.setInterval(tick, 80)
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [steps, stepMs, exitMs, complete])

  // Land the reader on the overlay rather than in the page behind it, so the
  // first Tab reaches the skip control. `preventScroll` because the overlay is
  // already the whole viewport and focusing it must not move the document.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
  }, [])

  const skip = useCallback(() => {
    if (finished.current) return
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const out = reduced ? Math.min(exitMs, REDUCED_EXIT_MS) : exitMs
    setStep(steps - 1)
    setExiting(true)
    window.setTimeout(complete, out)
  }, [complete, exitMs, steps])

  // `interactive` is the pointer shortcut, not a requirement: with it off the
  // only way out is the skip control, which is what the contract asks for.
  const gestureProps = interactive ? { onPointerDown: skip, onWheel: skip } : {}

  return (
    <div
      ref={rootRef}
      className={s['scp']}
      style={
        {
          '--scp-bg': colors.background,
          '--scp-ink': colors.ink,
          '--scp-accent': colors.accent,
          '--scp-exit': `${exitMs}ms`,
        } as CSSProperties
      }
      data-exit={exiting ? 'true' : 'false'}
      data-hud={hud ? 'true' : 'false'}
      tabIndex={-1}
      aria-label={`${label}. ${caption}`}
      aria-busy={exiting ? 'false' : 'true'}
      {...gestureProps}
    >
      {exit === 'blinds' ? (
        <div className={s['scp-blinds']} aria-hidden="true">
          {Array.from({ length: SLAT_COUNT }, (_, index) => (
            <span
              key={index}
              className={s['scp-blind']}
              style={
                {
                  '--scp-seam-delay': `${blindDelay(index, SLAT_COUNT, 600)}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}
      <div className={s['scp-veil']} aria-hidden="true" />

      {hud ? (
        <div className={s['scp-hud']} aria-hidden="true">
          <div className={s['scp-hud-row']}>
            <i className={s['scp-hud-mark']} />
            <span className={s['scp-hud-label']}>{label}</span>
            <span className={s['scp-hud-step']}>
              {String(Math.min(step + 1, steps)).padStart(2, '0')} /{' '}
              {String(steps).padStart(2, '0')}
            </span>
          </div>
          <div className={s['scp-hud-row']}>
            <span className={s['scp-hud-note']}>SESSION BOOT</span>
          </div>
        </div>
      ) : null}

      <div className={s['scp-core']}>
        <p className={s['scp-eyebrow']}>{label}</p>
        <p
          key={token}
          className={s['scp-count']}
          data-long={token.length > 3 ? 'true' : 'false'}
        >
          {token}
        </p>
        <p className={s['scp-caption']}>{caption}</p>
        <div
          className={s['scp-meter']}
          role="progressbar"
          aria-label="Session boot progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuetext={`${token}, step ${Math.min(step + 1, steps)} of ${steps}`}
        >
          <i style={{ '--scp-progress': progress } as CSSProperties} />
        </div>
      </div>

      <button type="button" className={s['scp-skip']} onClick={skip}>
        Skip intro
      </button>

      <span className={s['scp-sr']} role="status" aria-live="polite">
        {`Session boot ${token}`}
      </span>
    </div>
  )
}
