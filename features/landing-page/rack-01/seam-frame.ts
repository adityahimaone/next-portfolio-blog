/**
 * Experience → Work: the spectrum curtain. One pure function, no DOM.
 *
 * ## The idea
 *
 * The radio is an audio object and the Work section is a music player, so the
 * move between them is made of the one thing both of them draw: a level meter.
 * The house lights go down on the radio, the radio is pushed back into the
 * dark like a speaker cone taking a bass hit, and a wall of equaliser columns
 * rises from the bottom of the screen — dancing as it climbs, then locking
 * solid. For a beat the whole screen is one dark meter. Then the columns drop,
 * from the centre outward, and the player is what was behind them.
 *
 * It replaces a 180° turn of the radio. A turn is a move *of the object*; this
 * is a move *of the room*, which is why it does not read as a second flip and
 * why the Work section can simply be there afterwards instead of arriving
 * through a card.
 *
 * ## Why it is a module of its own
 *
 * The same rules the About's and the hero's frame functions follow:
 *
 * 1. **Pure and stateless.** Progress in, numbers out. Reverse scroll renders
 *    the forward frame exactly, because nothing accumulates. The dance in the
 *    rise is a function of progress (`sin(i * k + g * w)`), not a timer, so a
 *    reader who scrubs backward sees the bars dance backward.
 * 2. **Bounded.** Every fraction is clamped. A column's top edge is always in
 *    `[0, 1]` of the viewport, so a resize can never push a bar off its track.
 * 3. **Measured nowhere.** Nothing here reads a rect. The hook supplies the
 *    viewport height in px and the frame hands back fractions of it.
 *
 * ## The one invariant that matters
 *
 * Between `COVER_FROM` and `COVER_TO` every column's top edge is exactly `0`:
 * the screen is fully covered. The hook swaps the Experience section out and
 * the player in **inside that plateau**, so the swap is never seen — it is the
 * reason there is a hold at all, and a test pins it.
 */

/** Columns in the wall. Even, so the centre falls between two of them. */
export const SEAM_COLUMNS = 24

/** The seam's windows, as fractions of its own scroll (see `SEAM_SVH`). */
export const SEAM_PHASES = {
  /** House lights down: wash, heading, and the radio pushed back. */
  lights: [0, 0.42],
  /** The wall rises, dancing. */
  rise: [0.1, 0.5],
  /** The first and last progress at which the screen is fully covered. */
  cover: [0.5, 0.56],
  /** The wall drops, centre-out. */
  fall: [0.56, 0.94],
  /** The label that names the move, in and out. */
  label: [0.34, 0.5, 0.58, 0.7],
  /** The player settles and its panels come in. */
  settle: [0.56, 1],
} as const

export const COVER_FROM = SEAM_PHASES.cover[0]
export const COVER_TO = SEAM_PHASES.cover[1]

/** How many of the player's panels are staggered in. */
export const SEAM_PANELS = 4

const clamp01 = (n: number) =>
  Number.isFinite(n) ? (n < 0 ? 0 : n > 1 ? 1 : n) : 0
const smooth = (t: number) => t * t * (3 - 2 * t)
const span = (p: number, from: number, to: number) =>
  to <= from ? (p >= to ? 1 : 0) : smooth(clamp01((p - from) / (to - from)))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
/** A zero that is never `-0`, so a test can `toBe(0)` and a style never reads `-0px`. */
const zero = (n: number) => (n === 0 ? 0 : n)

export type SeamFrame = {
  /** The clamped progress this frame was rendered from. */
  progress: number
  /** The overlay is only worth painting while the seam is live. */
  overlayVisible: boolean
  /** True once the Experience section may be taken out of paint and hit-testing. */
  experienceHidden: boolean
  /** The Experience section's heading. */
  headingOpacity: number
  /** The dark wash behind the radio: the house lights going down. */
  washOpacity: number
  /** The radio, pushed back. `y` is a percentage of its own height. */
  deck: { scale: number; y: number; opacity: number }
  /**
   * One entry per column: the top edge of its fill as a fraction of the
   * viewport's height. `0` covers the column's whole track; `1` is hidden.
   */
  columns: number[]
  /** How bright each column's cap is. Zero when it is parked at either end. */
  caps: number[]
  /** The label at the centre of the wall. */
  labelOpacity: number
  /** The player's shell: it rests a little large, and settles to size. */
  shell: { opacity: number; scale: number }
  /** Per panel: 0 → 1, staggered. The hook turns it into opacity and a lift. */
  panels: number[]
}

/** How far along its rise a column is, 0 → 1, dancing on the way. */
function rise(i: number, g: number): number {
  // A column's own phase. The golden-ratio step keeps neighbours from moving
  // in unison without any of them being random: the same column is at the same
  // height at the same scroll, always.
  const spectrum = 0.5 + 0.5 * Math.sin(i * 1.7 + g * 11)
  const dance = clamp01(g * (0.35 + 0.85 * spectrum))
  // The dance gives way to a solid climb over the last third, which is what
  // makes every column land on exactly 1 — no column is allowed to stop short.
  return mix(dance, 1, span(g, 0.7, 1))
}

/** How far along its drop a column is, 0 → 1, centre first. */
function fall(i: number, n: number, p: number): number {
  const [f0, f1] = SEAM_PHASES.fall
  const centre = (n - 1) / 2
  const away = centre === 0 ? 0 : Math.abs(i - centre) / centre
  // Each column takes half the window; the stagger spends the other half.
  const win = (f1 - f0) * 0.5
  const start = f0 + away * (f1 - f0) * 0.5
  return span(p, start, start + win)
}

export function seamFrame(
  progress: number,
  n: number = SEAM_COLUMNS,
): SeamFrame {
  const p = clamp01(progress)

  const g = span(p, SEAM_PHASES.rise[0], SEAM_PHASES.rise[1])
  const push = span(p, SEAM_PHASES.lights[0] + 0.04, SEAM_PHASES.lights[1])

  const columns: number[] = []
  const caps: number[] = []
  for (let i = 0; i < n; i += 1) {
    const top = clamp01(1 - rise(i, g) + fall(i, n, p))
    columns.push(zero(top))
    // A cap is a line on the top edge of a moving column. Parked at the top of
    // the viewport (covering) or at the bottom (hidden) it has nothing to mark.
    caps.push(top <= 0.002 || top >= 0.998 ? 0 : 1)
  }

  const [l0, l1, l2, l3] = SEAM_PHASES.label
  const labelOpacity = span(p, l0, l1) * (1 - span(p, l2, l3))

  const [s0, s1] = SEAM_PHASES.settle
  const settle = span(p, s0, s1)
  const panels: number[] = []
  for (let k = 0; k < SEAM_PANELS; k += 1) {
    const start = mix(s0 + 0.04, s0 + 0.2, k / Math.max(1, SEAM_PANELS - 1))
    panels.push(span(p, start, start + (s1 - s0) * 0.46))
  }

  return {
    progress: p,
    overlayVisible: p > 0.002 && p < 0.998,
    // Hidden from just inside the cover plateau onward. The margin is what
    // keeps the swap off the frame where the wall first closes, and because the
    // plateau is a stretch of fully-covered frames, scrolling back across this
    // boundary shows the same dark wall on both sides of it.
    experienceHidden: p >= COVER_FROM + 0.01,
    headingOpacity: 1 - span(p, 0, 0.18),
    washOpacity: span(p, 0.02, SEAM_PHASES.lights[1]),
    deck: {
      scale: mix(1, 0.9, push),
      y: zero(mix(0, -4, push)),
      opacity: 1 - span(p, 0.14, 0.46),
    },
    columns,
    caps,
    labelOpacity,
    shell: {
      // Dark and hidden behind the wall until the wall is solid; from then on
      // it is simply there, so the drop uncovers a finished player rather than
      // one that is still arriving.
      opacity: p >= COVER_FROM - 0.04 ? 1 : 0,
      scale: mix(1.05, 1, settle),
    },
    panels,
  }
}
