/**
 * Pure scroll-to-track maths for the work section.
 *
 * Kept free of React so the boundary behaviour is directly testable: these two
 * functions decide which project is "playing" and where the tonearm sits, and
 * an off-by-one here shows up as the wrong record changing.
 */

/** Which track the needle is currently inside, clamped to a valid index. */
export function resolveActiveIndex(progress: number, count: number): number {
  if (count <= 0) return 0
  const scaled = progress * count
  if (scaled <= 0) return 0
  return Math.min(count - 1, Math.floor(scaled))
}

/**
 * Progress within the active track, in [0, 1].
 *
 * The upper clamp pulls back by an epsilon so the last track never reports
 * exactly 1 — the tonearm and time counter should approach the end of the
 * record, not overshoot it, and the final project has to stay reachable.
 */
export function resolveTrackProgress(progress: number, count: number): number {
  if (count <= 0) return 0
  const clamped = Math.min(Math.max(progress, 0), 1)
  const scaled = Math.min(clamped * count, count - 1e-6)
  return scaled - Math.floor(scaled)
}
