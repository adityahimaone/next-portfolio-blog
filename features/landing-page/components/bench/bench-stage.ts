/**
 * The chapters' pinned stage: pure maths.
 *
 * Three texts scroll past one pinned stage, and three devices live in it. The
 * only input is `g`, the scroll position expressed in chapters, where chapter
 * *i* is centred in the viewport at `g = i`. Every device is a continuous
 * function of its distance from `g`, which is the whole point: a device that
 * is a smooth function of one smoothly-moving number cannot jump.
 *
 * - `|g - i| < 0.15`: device *i* is at rest, fully visible.
 * - `0.15 .. 0.85`: it is leaving (above) or arriving (below), fading as it
 *   goes; the neighbour is doing the opposite, so the two cross.
 * - beyond that: gone.
 *
 * This file knows nothing about the DOM. `use-bench-motion.ts` measures where
 * the texts are and writes what these functions return.
 */

export type SlideFrame = {
  opacity: number
  /** Vertical offset as a fraction of the stage's height; positive is down. */
  y: number
  scale: number
  /** 0..1, the pose parameter `chapterPose` takes. 0.5 is at rest. */
  p: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
const smooth = (t: number) => {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}
/** `-0` is a real number and a real CSS token; never write one. */
const zero = (value: number) => (Object.is(value, -0) ? 0 : value)

export const SLIDE_REST = 0.15
/**
 * `REST + REACH = 1` is deliberate: with a smoothstep ramp, two neighbours' opacities
 * then sum to exactly 1 at every `g`, so the crossfade never dips.
 */
export const SLIDE_REACH = 0.85
/** How far a leaving or arriving device is carried, as a fraction of the stage. */
export const SLIDE_TRAVEL = 0.38

export function slideFrame(g: number, index: number): SlideFrame {
  const t = Number.isFinite(g) ? g - index : 10
  const distance = Math.abs(t)
  return {
    opacity: smooth(1 - (distance - SLIDE_REST) / (SLIDE_REACH - SLIDE_REST)),
    // Positive `t` means the chapter has gone past: it leaves upward.
    y: zero(-t * SLIDE_TRAVEL),
    scale: 1 - 0.18 * Math.min(1, distance),
    p: clamp(0.5 + t * 0.5, 0, 1),
  }
}

/**
 * `g` from the viewport's centre and the page y of each text's centre, which are
 * measured, because the texts are not guaranteed to be the same height. The
 * mapping is piecewise linear between the centres and extends beyond the first
 * and last by their own spacing, so `g` is continuous and never clamps in the
 * middle of a scroll.
 */
export function chapterPosition(viewCenter: number, centers: number[]): number {
  const n = centers.length
  if (n === 0 || !Number.isFinite(viewCenter)) return 0
  if (n === 1) return (viewCenter - centers[0]) / 800

  if (viewCenter <= centers[0]) {
    const span = Math.max(1, centers[1] - centers[0])
    return (viewCenter - centers[0]) / span
  }
  for (let index = 0; index < n - 1; index += 1) {
    if (viewCenter <= centers[index + 1]) {
      const span = Math.max(1, centers[index + 1] - centers[index])
      return index + (viewCenter - centers[index]) / span
    }
  }
  const span = Math.max(1, centers[n - 1] - centers[n - 2])
  return n - 1 + (viewCenter - centers[n - 1]) / span
}
