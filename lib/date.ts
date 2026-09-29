/**
 * One date formatter for the archive pages. Blog previously formatted the
 * same `post.date` four different ways across four components (design.md §3.1).
 */

const META = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const LONG = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** `12 Apr 2026` — the archive meta line. */
export function formatDate(
  value: string | Date,
  style: 'meta' | 'long' = 'meta',
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return style === 'long' ? LONG.format(date) : META.format(date)
}

/** `3 days ago` — used by the projects session log. */
export function formatRelative(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]

  const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return relative.format(-Math.round(seconds / secondsInUnit), unit)
    }
  }
  return relative.format(-seconds, 'second')
}
