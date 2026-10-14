/**
 * Sound becomes matter — the handoff's one pure function.
 *
 * The hero is a DAW session: a picture of a machine. This is what happens when
 * the machine is left behind. A signal region grows about its own centre until
 * its edges leave the viewport, the frame it was drawn in gives way to three
 * broad contours, and a decorative word crosses from SIGNAL to HUMAN and gets
 * out of the way of the biography that was behind the interface all along.
 *
 * Three properties this file is built to have, and they are why it is a module
 * of its own rather than a timeline inside a hook:
 *
 * 1. **Pure.** Progress plus geometry in, numbers out. No DOM, no GSAP, no
 *    timers, no reads. That is what lets the whole choreography be pinned by a
 *    written-out fixture with no browser, and what stops the frame maths from
 *    silently drifting away from the stylesheet that reads it.
 * 2. **The camera never moves.** The only translation in here is the source
 *    region's own centre sliding onto the frame's centre — object motion, not
 *    camera travel. Depth comes from the three contours moving at unequal
 *    rates, which is why they have three separate ceilings and one shared sign.
 * 3. **Bounded.** Every entry is clamped to a declared travel, the scale has a
 *    ceiling, and non-finite input normalises to the opening frame rather than
 *    to NaN. A decorative layer that can be pushed past its bounds by a resize
 *    is a layer that will be found mid-scroll in a broken state.
 *
 * The body copy is deliberately absent. The biography is never opacity-scrubbed
 * and never enters this function at all — the reading plateau is a flag, and the
 * stylesheet does the rest.
 */

/**
 * Everything the frame needs, as a measured geometry. Every field is required
 * on the type and optional at the call site — see `MatterGeometryInput`.
 */
export type MatterGeometry = {
  /** px — the decorative stage's own box, measured once per refresh. */
  viewportWidth: number
  viewportHeight: number
  /** px — the source region's top-left, in the stage's coordinates. */
  sourceX: number
  sourceY: number
  /** px — the source region's measured extent. */
  sourceWidth: number
  sourceHeight: number
}

/**
 * What `matterFrame` actually accepts.
 *
 * A partial geometry is a real state, not a programming error: the first call
 * can happen before anything has been laid out, and a measurement can be zero
 * for a frame. The frame normalises both rather than requiring the caller to
 * guard, which is what keeps the maths total.
 */
export type MatterGeometryInput = Partial<MatterGeometry>

export type MatterFrame = {
  /** The clamped local progress this frame was rendered from. */
  progress: number
  /** The source proxy's scale about its own centre. */
  sourceScale: number
  /** px — the source proxy's own translation, which centres its expansion. */
  sourceX: number
  sourceY: number
  /**
   * 0 → 1 across the hold: this stage's own presence over the machine.
   *
   * It is separate from `deviceOpacity` because the two are not the same fact,
   * even though they look like it. This one is *how much of the bridge is
   * here*, and it is spent entirely while the hero is still pinned — which is
   * what lets the machine dissolve into the stage's own ground without either
   * of them moving. `deviceOpacity` is how much of the *machine* is left, and
   * it is spent afterwards, on a frame the machine can no longer be seen in.
   */
  stageOpacity: number
  /** 1 → 0 across the departure: the outgoing device leaving the frame. */
  deviceOpacity: number
  /** 1 → 0 across the spread: the proxy handing over to the contours. */
  sourceOpacity: number
  /** px — the three contours' parallax, far to near. */
  farY: number
  middleY: number
  nearY: number
  /** px — the decorative word's entry travel. */
  signalY: number
  signalOpacity: number
  humanOpacity: number
  /** px — the semantic title's entry travel. Never hidden, only offset. */
  titleY: number
  /** True once the title has arrived and the reading plateau has begun. */
  reading: boolean
}

/**
 * The local progress windows the bridge is timed on, as `[from, to]` pairs.
 *
 * These are **local** to the bridge's own scroll range, not elapsed seconds, so
 * reverse scroll reproduces the forward pass frame for frame. `depart` and
 * `spread` are the two halves of the handoff; `signalIn`, `swap` and `arrive`
 * are the typographic score laid over them.
 */
export const MATTER_PHASES = {
  /** The source grows about its centre and the outgoing device leaves. */
  depart: [0.15, 0.42],
  /** The contours separate and the proxy gives way to them. */
  spread: [0.42, 0.65],
  /** SIGNAL arrives as a decorative word. */
  signalIn: [0.15, 0.35],
  /** SIGNAL crossfades to HUMAN over the same measured bounds. */
  swap: [0.48, 0.58],
  /** HUMAN leaves and the semantic title rises into place. */
  arrive: [0.7, 0.8],
} as const

/**
 * The local progress at which this stage has taken the frame over completely —
 * and, by construction, the progress the hero's own pin ends on.
 *
 * ## Why the hero has to hold, and why it costs a constant
 *
 * The hero's sticky stage unsticks at the exact scroll its camera finishes on:
 * the camera's travel is the section's height minus the one viewport its stage
 * is pinned for, so the camera's last frame and the stage's last pinned frame
 * are the same frame. Past that scroll the machine slides away, and the
 * bridge's first frame would arrive over an empty page.
 *
 * That is a cut, and no amount of tuning the bridge can hide it — a fade can
 * only cross-dissolve between two things that are both still there, and by the
 * time the bridge starts, the machine is not. So the hero is given a hold: the
 * hook publishes `--arr-hold` and the hero's section grows by it, which keeps
 * the stage pinned for `MATTER_HOLD` of the bridge's own scroll while the
 * camera sits still on its final frame.
 *
 * The hold is what makes this number a *constant of the pair* rather than a
 * taste: it must be exactly the takeover's length, or the stage is either still
 * half-transparent when the machine starts moving (a dissolve and a slide at
 * once) or fully opaque while the machine is still standing there (a machine
 * fading behind a wall).
 *
 * It is deliberately the top of `depart` and not a number of its own. The
 * device's departure begins where the takeover ends, so the two beats meet at
 * one boundary instead of two that would have to be kept in step.
 */
export const MATTER_HOLD = MATTER_PHASES.depart[0]

/**
 * The scale ceiling. A 640×100 source region against a 1440×900 frame wants 9×
 * to cover it; 8 is where the zoom stops. It is an intentional limit rather
 * than a claim that every source can fill the frame — a mismatched aspect ratio
 * leaves unused space, and the full-stage artwork finishes the handoff instead
 * of the source being stretched non-uniformly to pretend otherwise.
 */
export const MATTER_SCALE_CEILING = 8

/** Where the reading plateau begins, as local progress. */
export const MATTER_READING_AT = MATTER_PHASES.arrive[1]

/** px — how far the decorative word and the title are allowed to enter. */
export const MATTER_TITLE_TRAVEL = 32

/**
 * px — how far each contour is allowed to travel, far to near. Unequal on
 * purpose: equal offsets would read as one rigid layer sliding, which is the
 * opposite of depth.
 */
export const MATTER_CONTOUR_TRAVEL = {
  far: 8,
  middle: 20,
  near: 40,
} as const

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value))

/** A non-finite or missing number is a broken input, not an extreme one. */
const finite = (value: number | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const smooth = (t: number) => t * t * (3 - 2 * t)

/**
 * A bounded smoothstep across a window. Clamped at both ends, so a phase can
 * never be entered past its own span however the progress arrives.
 */
const phase = (p: number, from: number, to: number) =>
  smooth(clamp((p - from) / (to - from), 0, 1))

export function matterFrame(
  progress: number,
  geometry: MatterGeometryInput,
): MatterFrame {
  const p = clamp(finite(progress, 0), 0, 1)

  // Measured geometry, floored at one pixel. A zero-size box is a box that has
  // not been laid out yet, and dividing by it would put Infinity into a
  // transform — the one failure mode that survives all the way to paint.
  const vw = Math.max(1, finite(geometry.viewportWidth, 1))
  const vh = Math.max(1, finite(geometry.viewportHeight, 1))
  const sw = Math.max(1, finite(geometry.sourceWidth, 1))
  const sh = Math.max(1, finite(geometry.sourceHeight, 1))
  const sourceX = finite(geometry.sourceX, 0)
  const sourceY = finite(geometry.sourceY, 0)

  const targetScale = clamp(Math.max(vw / sw, vh / sh), 1, MATTER_SCALE_CEILING)

  const hold = phase(p, 0, MATTER_HOLD)
  const depart = phase(p, ...MATTER_PHASES.depart)
  const spread = phase(p, ...MATTER_PHASES.spread)
  const signalIn = phase(p, ...MATTER_PHASES.signalIn)
  const swap = phase(p, ...MATTER_PHASES.swap)
  const arrive = phase(p, ...MATTER_PHASES.arrive)

  return {
    progress: p,
    sourceScale: 1 + (targetScale - 1) * depart,
    // The proxy is authored where the source region actually is, so this is the
    // one translation in the whole handoff: its centre onto the frame's. It is
    // spent across the departure and then holds — the viewport never moves.
    sourceX: (vw / 2 - (sourceX + sw / 2)) * depart,
    sourceY: (vh / 2 - (sourceY + sh / 2)) * depart,
    // Spent over the hold, against a machine that is not moving. Nothing is
    // hidden here that the reader is still watching: the source region's proxy
    // is already drawn at the measured bounds, so the band does not move — what
    // arrives over it is the frame it was always going to be.
    stageOpacity: hold,
    deviceOpacity: 1 - depart,
    sourceOpacity: 1 - spread,
    // One sign, three magnitudes. They open outward and stop at their ceiling.
    farY: MATTER_CONTOUR_TRAVEL.far * (1 - 2 * spread),
    middleY: MATTER_CONTOUR_TRAVEL.middle * (1 - 2 * spread),
    nearY: MATTER_CONTOUR_TRAVEL.near * (1 - 2 * spread),
    // The word enters from below and never splits, scrambles or reverses.
    signalY: MATTER_TITLE_TRAVEL * (1 - signalIn),
    signalOpacity: signalIn * (1 - swap),
    humanOpacity: swap * (1 - arrive),
    // The title is in normal flow from the first frame. Only its offset moves,
    // and only during its own window, so it can never be invisible.
    titleY: MATTER_TITLE_TRAVEL * (1 - arrive),
    reading: p >= MATTER_READING_AT,
  }
}

/**
 * What the runway is measured from. Every field is measured once per refresh by
 * the hook; nothing here is a constant.
 */
export type MatterRunwayInput = {
  /** px — the sticky stage. This is the viewport the bridge is pinned over. */
  viewportHeight: number
  /** px — the reading panel's own height, the content without its padding. */
  readingHeight: number
  /** px — the whole About panel, padding included: what actually climbs. */
  aboutHeight: number
  /**
   * px — from the stage's top edge to the **bottom** of the decorative word
   * band. The band is the region the two words occupy, and it is the part of
   * the artwork the reading panel is allowed to eat first — so its bottom edge
   * is the line that matters.
   */
  typeBandBottom: number
}

/**
 * How much scroll the reading panel has to be held off screen for.
 *
 * ## Why this is not just "one viewport"
 *
 * The reading panel is opaque and sits above the stage, so as soon as its top
 * edge climbs into the band the words live in, it starts eating them. That is
 * by design — the panel is *supposed* to scroll over the artwork — but it means
 * the runway is what decides whether the typography beats are watchable at all.
 *
 * It used to be `max(readingHeight, viewportHeight)`, which only guaranteed
 * that the panel was off screen on the first frame. Measured at 1440×900 that
 * came to 999px against a 1272px panel, and the panel crossed the SIGNAL band
 * at p≈.33. SIGNAL, which the design has fully legible from `.35` to `.48`, was
 * therefore covered for the whole of its own beat: the readable window was 80px
 * and the reader saw the word for about a fifth of a screen.
 *
 * ## The rule
 *
 * The panel's top edge starts one runway below the stage's top and climbs the
 * whole bridge's travel, which is the runway plus the panel less the viewport it
 * is pinned over. So its position at progress `p` is
 *
 *     runway - p * (runway + aboutHeight - viewportHeight)
 *
 * and the runway that puts its first frame in the band exactly on SIGNAL's last
 * legible one is the solution of that expression equalling `typeBandBottom` at
 * `p = MATTER_PHASES.swap[0]` — the moment SIGNAL starts leaving, so being
 * covered from then on costs nothing.
 *
 * Deriving it rather than tuning it is the point: the word band moves with the
 * type scale, the panel moves with the biography, and both move with the
 * viewport. A constant here would be correct at exactly one window size.
 *
 * The two floors stay. A runway shorter than the reading panel would put the
 * panel's own content on screen during the opening beat, and one shorter than
 * the viewport would let the panel's top edge show before `p=0`, over a machine
 * the hero is still holding.
 */
export function matterRunway(input: MatterRunwayInput): number {
  const viewportHeight = Math.max(1, finite(input.viewportHeight, 1))
  const readingHeight = Math.max(1, finite(input.readingHeight, 1))
  const aboutHeight = Math.max(0, finite(input.aboutHeight, 0))
  const typeBandBottom = Math.max(0, finite(input.typeBandBottom, 0))

  const swapFrom = MATTER_PHASES.swap[0]
  // `swap` is a constant pair with a non-zero span, so this can only ever be
  // 0.42 — but the guard keeps the division honest if the table is retimed to a
  // swap that starts at 1.
  const climb = Math.max(0.05, 1 - swapFrom)
  const clearance =
    (typeBandBottom + swapFrom * (aboutHeight - viewportHeight)) / climb

  return Math.max(readingHeight, viewportHeight, Math.ceil(clearance))
}
