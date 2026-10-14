import { MATTER_PHASES } from './matter-frame'

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))
const fin = (v: number, f: number) => (Number.isFinite(v) ? v : f)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)

function staged(
  p: number,
  win: readonly [number, number],
  k: number,
  spread: number,
) {
  const u = (p - win[0]) / Math.max(1e-6, win[1] - win[0])
  return smooth(clamp((u - k * spread) / (1 - spread), 0, 1))
}

export type LetterFrame = { yPercent: number; scale: number; opacity: number }

export function letterFrame(
  progress: number,
  word: 'signal' | 'human',
  index: number,
  count: number,
): LetterFrame {
  const p = clamp(fin(progress, 0), 0, 1)
  if (word === 'human' && p >= MATTER_PHASES.arrive[1]) {
    return { yPercent: -30, scale: 1, opacity: 0 }
  }
  const n = Math.max(1, Math.floor(fin(count, 1)))
  const i = clamp(Math.floor(fin(index, 0)), 0, n - 1)
  const k = n > 1 ? i / (n - 1) : 0

  if (word === 'signal') {
    const inT = staged(p, MATTER_PHASES.signalIn, k, 0.5)
    const outT = staged(p, MATTER_PHASES.swap, k, 0.5)
    return {
      opacity: inT * (1 - outT),
      yPercent: (1 - inT) * 60 - outT * 50,
      scale: mix(1.25, 1, inT) * mix(1, 0.92, outT),
    }
  }

  const inT = staged(p, MATTER_PHASES.swap, k, 0.5)
  const outT = staged(p, MATTER_PHASES.arrive, k, 0.3)
  return {
    opacity: inT * (1 - outT),
    yPercent: (1 - inT) * 50 - outT * 30,
    scale: mix(0.92, 1, inT),
  }
}
