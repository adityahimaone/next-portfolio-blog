/**
 * The scene launcher's pure logic: the beat clock, a clip's length and
 * progress, the waveform each clip carries, the transport readout, and the
 * movement of focus across the grid. No React, no DOM, no timers, so every rule
 * is testable and the component is only wiring.
 *
 * The launcher borrows one idea from clip-launching instruments: **a clip does
 * not start when you press it, it starts on the next beat.** That is what makes
 * a press feel like it is being performed rather than executed, and it costs
 * at most one beat (500ms at the default tempo). `nextBeatDelay` is that rule.
 */

import { FAQ_ITEMS, TRACKS, type FaqEntry } from './contact-content'

export const BPM = 120

export const beatMs = (bpm: number = BPM) => 60000 / Math.max(1, bpm)

/** Which beat of the (endless) clock `now` falls on. */
export const beatIndex = (now: number, bpm: number = BPM) =>
  Math.floor(now / beatMs(bpm))

/** Milliseconds from `now` to the next beat boundary. Never 0, never past a beat. */
export function nextBeatDelay(now: number, bpm: number = BPM): number {
  const beat = beatMs(bpm)
  const into = ((now % beat) + beat) % beat
  return into === 0 ? beat : beat - into
}

export const CLIP_MIN_MS = 5000
export const CLIP_MAX_MS = 13000
export const MS_PER_CHAR = 44

/**
 * How long a clip plays: long enough to read as it types, short enough that
 * nobody waits. The typed text reaches the end exactly when the clip does, so
 * the length is the reading speed (about 27 characters a second).
 */
export function clipDuration(answer: string): number {
  return Math.min(
    CLIP_MAX_MS,
    Math.max(CLIP_MIN_MS, Math.round(answer.length * MS_PER_CHAR)),
  )
}

export function progressAt(elapsed: number, duration: number): number {
  if (!(duration > 0) || !Number.isFinite(elapsed)) return 0
  return Math.min(1, Math.max(0, elapsed / duration))
}

/** The first `progress` (0–1) of `text`. */
export function typedAt(text: string, progress: number): string {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
  return text.slice(0, Math.round(text.length * p))
}

/** `mm:ss`, from milliseconds, clamped at zero. */
export function clock(ms: number): string {
  const total = Math.max(0, Math.floor((Number.isFinite(ms) ? ms : 0) / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** `BAR 02.3`: bar and beat since a clip started, four beats to a bar. */
export function transportAt(elapsed: number, bpm: number = BPM): string {
  const beats = Math.max(0, Math.floor(elapsed / beatMs(bpm)))
  const bar = Math.floor(beats / 4) + 1
  return `BAR ${String(bar).padStart(2, '0')}.${(beats % 4) + 1}`
}

/** The clips grouped by track, each with its index in the flat list. */
export function tracksOf(items: readonly FaqEntry[] = FAQ_ITEMS) {
  return TRACKS.map((name) => ({
    name,
    clips: items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.track === name),
  }))
}

/** The answer's words, in order, for the lyric sheet. */
export function wordsOf(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}

/**
 * Where focus goes on a key press in the setlist, a single column read top to
 * bottom whichever group a song is in: down and up walk it and wrap, Home and
 * End are its ends. `-1` for a key it does not own.
 */
export function linearFocus(key: string, index: number, count: number): number {
  if (!count) return -1
  if (key === 'ArrowDown' || key === 'ArrowRight') return (index + 1) % count
  if (key === 'ArrowUp' || key === 'ArrowLeft')
    return (index - 1 + count) % count
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return -1
}
