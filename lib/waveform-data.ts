/**
 * Deterministic waveform generators.
 *
 * Every waveform in the archive system encodes real data (design.md §0.0):
 * a bar series must be derived from something measurable — an article's
 * runtime, a page's item count — and must survive rebuilds byte-identical.
 * Hence the seeded generator below: no Math.random(), no time dependency.
 */

const GOLDEN_RATIO = 0.6180339887498949

/** Stable 32-bit string hash (FNV-1a). Same input, same number, forever. */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Deterministic pseudo-random sequence in [0, 1) from a seed. */
function sequence(seed: number, count: number): number[] {
  const out: number[] = []
  let state = seed || 1
  for (let i = 0; i < count; i++) {
    state = (state + GOLDEN_RATIO * 0xffffffff) >>> 0
    out.push(((state >>> 8) & 0xffff) / 0x10000)
  }
  return out
}

interface BarOptions {
  /** Tallest bar reaches this fraction of the container. */
  maxHeight?: number
  /** Shortest bar never drops below this fraction. */
  minHeight?: number
}

/**
 * Percentage heights (0-100) for a bar series, stable for a given seed.
 * Pass a measurable value as the seed (a slug, a runtime, an item count)
 * so the trace means something rather than decorating.
 */
export function waveformBars(
  seed: string | number,
  count = 16,
  { maxHeight = 1, minHeight = 0.12 }: BarOptions = {},
): number[] {
  const numericSeed = typeof seed === 'number' ? seed : hashSeed(seed)
  const safeCount = Math.max(1, Math.min(Math.floor(count), 64))
  const raw = sequence(numericSeed, safeCount)
  const span = maxHeight - minHeight

  return raw.map((value, index) => {
    // Fold the series so it reads as a waveform: denser through the middle.
    const centreBias = 0.72 + 0.28 * Math.sin((index / safeCount) * Math.PI)
    const height = minHeight + value * span * centreBias
    return Math.round(Math.min(1, height) * 100)
  })
}

/**
 * Same series as `waveformBars` but as 0..1 fractions, for callers that
 * compose the height into a style value themselves.
 */
export function getWaveformBars(
  seed: string | number,
  count = 16,
  { maxHeight = 1, minHeight = 0.12 }: BarOptions = {},
): number[] {
  return waveformBars(seed, count, { maxHeight, minHeight }).map((h) => h / 100)
}

/** Minutes carried by a readingTime string such as "7 min read". */
export function minutesFromReadingTime(readingTime: string): number {
  const match = readingTime.match(/(\d+)/)
  if (!match) return 1
  return Math.max(1, parseInt(match[1], 10) || 1)
}

/**
 * Longer articles get more bars and a taller trace, so a reader can size
 * an article before opening it (design.md §3.1).
 */
export function waveformFromReadingTime(readingTime: string): number[] {
  const minutes = minutesFromReadingTime(readingTime)
  const count = Math.max(9, Math.min(9 + Math.round(minutes * 0.8), 22))
  const maxHeight = Math.min(0.42 + minutes * 0.035, 1)
  return waveformBars(readingTime, count, { maxHeight, minHeight: 0.1 })
}

/** `4:12` style runtime for transport readouts. */
export function formatRuntime(minutes: number): string {
  const totalSeconds = Math.max(0, Math.round(minutes * 60))
  const mins = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${mins}:${seconds.toString().padStart(2, '0')}`
}
