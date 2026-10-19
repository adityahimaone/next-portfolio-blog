import { useEffect, type RefObject } from 'react'

/**
 * Pieces shared by the preloaders: a stable hash, and the timecode decode.
 * They live here so neither preloader depends on the other.
 */

/** A small stable integer hash. Everything "random" in a preloader is this, so
 *  the same poster is drawn every time. */
export function hash(...n: number[]): number {
  let h = 2166136261
  for (const v of n) {
    h ^= v | 0
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const NOISE_DIGITS = '0123456789'
const NOISE_LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ'

const isDigit = (c: string) => c >= '0' && c <= '9'
const isLetter = (c: string) => c >= 'A' && c <= 'Z'

/**
 * `target`, partly decoded at `progress` (0 to 1).
 *
 * Characters resolve left to right; those not yet resolved are noise of their
 * own kind (a digit stays a digit, a letter a letter) and punctuation never
 * changes, so the line holds its shape and its width while it decodes. The noise
 * is a hash of the position and `frame`, so a given frame always reads the same.
 */
export function scrambleAt(
  target: string,
  progress: number,
  frame: number,
): string {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
  const resolved = Math.floor(p * target.length)
  let out = ''
  for (let i = 0; i < target.length; i += 1) {
    const c = target[i]
    if (i < resolved || p >= 1 || !(isDigit(c) || isLetter(c))) {
      out += c
    } else {
      const pool = isDigit(c) ? NOISE_DIGITS : NOISE_LETTERS
      out += pool[hash(i, frame) % pool.length]
    }
  }
  return out
}

/** Decode `target` into `ref`'s text between `start` and `end` ms after mount.
 *  Written to the node, not to state: forty frames of noise are forty text
 *  writes and no renders. With `enabled` false the final text is set at once. */
export function useScramble(
  ref: RefObject<Element | null>,
  target: string,
  { start, end, enabled }: { start: number; end: number; enabled: boolean },
) {
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (!enabled) {
      node.textContent = target
      return
    }
    const t0 = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const elapsed = now - t0
      const progress = (elapsed - start) / Math.max(1, end - start)
      node.textContent = scrambleAt(target, progress, Math.floor(elapsed / 45))
      if (progress < 1) raf = requestAnimationFrame(frame)
    }
    node.textContent = scrambleAt(target, 0, 0)
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [ref, target, start, end, enabled])
}
