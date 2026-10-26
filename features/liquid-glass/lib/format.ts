/**
 * Formatting primitives for the liner-notes voice.
 *
 * Dates are `2026.04.15` and lengths are `8:12` because the blog is framed as a
 * tracklist — a date that reads like a catalogue number and a reading time that
 * reads like a runtime. Both are pure, so they are safe on the server.
 */

/** `2026-04-15` → `2026.04.15` */
export function formatNoteDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')
  const day = `${date.getUTCDate()}`.padStart(2, '0')
  return `${year}.${month}.${day}`
}

/** Long form for document metadata: `15 April 2026`. */
export function formatLongDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** 1 → `01` */
export function padIndex(value: number): string {
  return `${value}`.padStart(2, '0')
}

/** Seconds → `m:ss`, used by the player clock. */
export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  const rest = `${whole % 60}`.padStart(2, '0')
  return `${minutes}:${rest}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
