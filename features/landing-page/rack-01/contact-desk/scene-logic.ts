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

/** A 32-bit string hash (FNV-1a), for seeding. */
export function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * A waveform for a clip: `count` bar heights in 0.14–1, the same every time for
 * the same seed. Each clip's thumbnail is its own shape, so nine clips do not
 * look like one clip nine times.
 *
 * Built from a seeded generator and then smoothed with a short moving average
 * and an envelope that swells in the middle, because raw noise reads as static
 * and a clip reads as audio when it has a body.
 */
export function waveformBars(seed: string, count: number): number[] {
  let state = hash(seed) || 1
  const next = () => {
    // xorshift32
    state ^= state << 13
    state >>>= 0
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 0xffffffff
  }
  const raw = Array.from({ length: count }, () => next())
  return raw.map((_, i) => {
    const a = raw[Math.max(0, i - 1)]
    const b = raw[i]
    const c = raw[Math.min(count - 1, i + 1)]
    const smooth = (a + b * 2 + c) / 4
    const envelope = 0.55 + 0.45 * Math.sin((Math.PI * (i + 0.5)) / count)
    return Math.min(1, Math.max(0.14, 0.14 + smooth * envelope * 0.9))
  })
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

/**
 * Where focus goes from clip (`track`, `row`) on a key press, across a grid of
 * tracks with `counts[t]` clips each; `null` for a key it does not own.
 *
 * Left and right change track and keep the row, clamped to the shorter track;
 * up and down walk the track and wrap; Home and End are the ends of the track.
 */
export function moveFocus(
  key: string,
  track: number,
  row: number,
  counts: readonly number[],
): [number, number] | null {
  const tracks = counts.length
  if (!tracks) return null
  const clamp = (t: number, r: number): [number, number] => [
    t,
    Math.max(0, Math.min(r, Math.max(0, counts[t] - 1))),
  ]
  switch (key) {
    case 'ArrowRight':
      return clamp(Math.min(tracks - 1, track + 1), row)
    case 'ArrowLeft':
      return clamp(Math.max(0, track - 1), row)
    case 'ArrowDown':
      return [track, counts[track] ? (row + 1) % counts[track] : 0]
    case 'ArrowUp':
      return [
        track,
        counts[track] ? (row - 1 + counts[track]) % counts[track] : 0,
      ]
    case 'Home':
      return [track, 0]
    case 'End':
      return [track, Math.max(0, counts[track] - 1)]
    default:
      return null
  }
}
