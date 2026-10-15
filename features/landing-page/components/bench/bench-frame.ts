/**
 * Rules becoming play — the About's one pure function.
 *
 * The section tells a single story in three moves. A ring of real constraints
 * is strewn across an empty sheet of graph paper; as the reader scrolls, the
 * ring contracts and every chip lands on the slot it was always going to land
 * on; the thing they assemble around draws itself; and then the experiment
 * steps aside for the one line of prose it was a demonstration of. The
 * biography is what the section is *for*, and the artwork is the argument that
 * arrives before it.
 *
 * Four properties this file is built to have, and they are why it is a module
 * of its own rather than a timeline inside a hook:
 *
 * 1. **Pure.** Progress in, numbers out. No DOM, no GSAP, no timers, no reads.
 *    That is what lets the whole choreography be pinned by a written-out
 *    fixture with no browser, and what stops the frame maths from silently
 *    drifting away from the stylesheet that reads it.
 * 2. **Stateless.** Reverse scroll reproduces the forward pass frame for frame,
 *    because nothing here accumulates. Every value is a function of `p` alone.
 * 3. **Bounded.** Every entry is clamped, the scale has a ceiling and a floor,
 *    and non-finite input normalises to the opening frame rather than to NaN.
 *    A decorative layer that a resize can push past its bounds is a layer that
 *    will be found mid-scroll in a broken state.
 * 4. **Data-driven.** The chips are read from `bench-copy`, not passed in, so
 *    the frame array and the rendered ring cannot disagree about how many
 *    constraints there are or where they go.
 *
 * ## Depth is not a constant parallax ratio, and that is the point
 *
 * Three strata move: the ground and the principle line at the back, the
 * artifact in the middle, the constraints in front. It would be easy to give
 * them one ratio and call it parallax, but that is the version that looks like
 * a rig rather than a scene — three planes sliding at fixed speeds forever.
 *
 * Instead each stratum spends its travel on its own beat. The ground drifts
 * almost imperceptibly for the whole arc because it is the steady explanation
 * and it should feel bolted to the page. The artifact drifts a little more and
 * then lifts away as the principle arrives. The chips travel furthest of all,
 * but *only until they land* — their travel is the scatter, and it is spent
 * exactly at the dock, because a constraint that drifted after it aligned
 * would not have aligned. So the ratio between the strata is large at the
 * start, collapses to zero in the middle, and the depth the reader actually
 * reads comes from scale, opacity, paint order and scatter distance rather
 * than from a uniform speed difference.
 *
 * The body copy is deliberately absent. The biography is never opacity-scrubbed
 * and never enters this function at all — the reading plateau is a flag, and
 * the stylesheet does the rest.
 */

import { BENCH_CHIPS, type BenchChip } from './bench-copy'

/** The three moves, in order. Published to the stage as `data-bench-state`. */
export type BenchState = 'scatter' | 'align' | 'settle'

/** Where one chip is and how it is dressed, this frame. */
export type BenchChipFrame = {
  id: string
  /** px — offset from the chip's authored slot. Zero once it has landed. */
  x: number
  y: number
  /** Degrees. The scatter's tilt, given up as the chip docks. */
  rotate: number
  scale: number
  opacity: number
  /** 0 = furthest back, 1 = closest. Carried through so the painter can sort. */
  depth: number
}

export type BenchFrame = {
  /** The clamped local progress this frame was rendered from. */
  progress: number
  state: BenchState
  /**
   * The seam, one entry per `BENCH_HERO_EXITS` — and every one of these is a
   * fact about the *outgoing* section, not about this one's artwork.
   *
   * The About's sheet does not arrive; it is the page. This section is pulled
   * up under the hero, so its opaque ground is already sitting behind the
   * machine on the first frame of the handoff and it never moves again. What
   * the hold spends is the machine coming apart — see `BENCH_HERO_EXITS` for
   * which piece goes where and why. There is deliberately no `stageY` beside
   * these any more: a surface that is *uncovered* has no arrival of its own to
   * time, and the two-clock seam it used to need went with the arrival.
   *
   * The hero is pinned for exactly as long as the exits take, which is the
   * whole reason the hold exists — the machine cannot scroll away while it is
   * still on screen being dismantled. See `BENCH_HOLD`.
   */
  heroExits: BenchHeroExit[]
  /**
   * True once the last piece has gone, which is the handoff boundary itself.
   *
   * Published rather than left for the hook to re-derive from `progress`,
   * because the hook hangs an *interaction* change off it — the stage has to
   * leave the tab order and stop being hit-tested — and a boundary that two
   * files compute separately is a boundary that will eventually disagree.
   */
  heroCleared: boolean
  /**
   * px — the far stratum: the graph paper and the principle line.
   *
   * Small on purpose. This is the layer that has to read as the page's own
   * surface, so it moves least; if it moved like the others the sheet would
   * come loose and the whole thing would read as objects on a conveyor.
   */
  farY: number
  /** px — the middle stratum: the artifact. */
  middleY: number
  /**
   * The near stratum's shared contraction, about the stage's own centre.
   *
   * A uniform scale is the one transform the ring can take after it has landed
   * without any chip leaving its slot relative to its neighbours — the ring
   * stays a ring, it just tightens. That is what lets the constraints keep
   * moving through the second half of the arc while still being *aligned*.
   */
  ringScale: number
  /** 0 → 1: how much of the artifact wireframe has been drawn on. */
  artifactDraw: number
  artifactOpacity: number
  artifactScale: number
  /** px — the artifact's own lift as it steps aside for the principle. */
  artifactY: number
  /**
   * 1 → 0 across the assembly: the construction marks the drawing replaces.
   *
   * The opening frame is a set of words on an empty sheet, and a sheet with
   * nothing on it but words is not a drawing — it is a list that has come
   * apart. These are the dashed bounds and the centre mark of the thing that is
   * about to exist, present from the first frame and spent exactly as the
   * wireframe draws over them, which is what makes the assembly read as the
   * scaffolding *becoming* the drawing rather than as a second object fading
   * in beside it.
   */
  scaffoldOpacity: number
  /** px — the principle line's entry travel. Never hidden, only offset. */
  principleY: number
  principleOpacity: number
  /** The silkscreen caption beside the artifact. */
  captionOpacity: number
  /** One entry per chip, in `BENCH_CHIPS` order. */
  chips: BenchChipFrame[]
  /** True once the principle has settled and the reading plateau has begun. */
  reading: boolean
}

/**
 * The local progress windows the section is timed on, as `[from, to]` pairs.
 *
 * These are **local** to the section's own scroll range, not elapsed seconds,
 * so reverse scroll reproduces the forward pass frame for frame. `gather` and
 * `assemble` are the two halves of the build — the ring closes while the
 * artifact draws, and they overlap so the last chip lands as the wireframe
 * completes rather than after it. `resolve` is the handover from constraints to
 * artifact, and `emerge` is the artifact stepping aside for the prose.
 *
 * ## Why the arc ends at 0.55 and not at 0.80
 *
 * Every one of these numbers is a *fraction of the section's scroll*, and the
 * section's scroll is not a free variable — it is derived from these very
 * numbers by `benchRunway`. That coupling is what makes the table below a
 * budget rather than a taste, and it is why the arc was retimed.
 *
 * The runway solves for the scroll that keeps the panel's top edge off the
 * artwork until the artwork's last beat, and the solution carries a
 * `1 / (1 - clearUntil)` amplifier — the panel climbs the whole section's
 * travel, so the later a band has to stay clear, the more runway it takes to
 * buy that clearance. At `emerge[1] = 0.80` the amplifier was `5x` and the
 * section cost 2 582px of scroll, which measured as **3.30 viewports** of
 * scrolling before the reader reached a single word of the biography. The
 * artwork was not being given room to breathe; it was being given room to
 * loiter.
 *
 * The windows below keep every relationship the original table had — the two
 * halves of the build still overlap, `resolve` still straddles the moment the
 * last chip lands, `emerge` still begins where the artifact starts receding —
 * and only shorten the whole arc from `0.15 → 0.80` to `0.12 → 0.55`. Measured
 * on the rendered page that is **2.14 viewports**, a third less scroll, with
 * the artwork still playing across 1 722px of travel rather than 2 582px.
 *
 * The scaling factor is the ratio of the two spans — `0.43 / 0.65` — and every
 * derived constant that is a *fraction of the arc* rather than a shape has to
 * be scaled by it too. `BENCH_CHIP_STAGGER` is the one that matters; see there.
 */
export const BENCH_PHASES = {
  /** The chips give up their drift and begin falling toward their slots. */
  gather: [0.1, 0.27],
  /** The artifact draws itself on while the ring closes around it. */
  assemble: [0.14, 0.32],
  /** The constraints hand over: the ring dims and tightens as the artifact wins. */
  resolve: [0.3, 0.36],
  /** The artifact recedes and the principle line rises into the cleared stage. */
  emerge: [0.38, 0.49],
} as const

/**
 * The progress the reading panel is held clear until.
 *
 * It is the top of `emerge` and not a number of its own: the panel is allowed
 * to start eating the stage the instant the principle has finished arriving,
 * so the two beats meet at one boundary instead of two that would have to be
 * kept in step.
 */
export const BENCH_READING_AT = BENCH_PHASES.emerge[1]

/**
 * The local progress at which this stage has taken the frame over completely —
 * and, by construction, the progress the hero's own pin ends on.
 *
 * ## Why the hero has to hold, and why it costs a constant
 *
 * The hero's sticky stage unsticks at the exact scroll its camera finishes on:
 * the camera's travel is the section's height minus the one viewport its stage
 * is pinned for, so the camera's last frame and the stage's last pinned frame
 * are the same frame. Past that scroll the machine slides away, and this
 * section's first frame would arrive over an empty page.
 *
 * That is a cut, and no amount of tuning can hide it — a fade can only
 * cross-dissolve between two things that are both still there, and by the time
 * this section starts, the machine is not. So the hero is given a hold: the
 * hook publishes `--arr-hold` and the hero's section grows by it, which keeps
 * the stage pinned for `BENCH_HOLD` of this section's own scroll while the
 * camera sits still on its final frame.
 *
 * The hold is what makes this number a *constant of the pair* rather than a
 * taste: it must be exactly the exits' length, or the machine is still coming
 * apart when it starts scrolling (a disassembly and a slide at once, which is
 * the one thing the disassembly exists to avoid) or already gone while the
 * reader is still being asked to look at it.
 *
 * It is deliberately the top of `gather` and not a number of its own. The ring
 * begins to close where the exits end, so the two beats meet at one boundary
 * instead of two that would have to be kept in step.
 *
 * ## Why it is short, and why shortening it was not a compromise
 *
 * The hold is the only stretch of the whole page where the reader scrolls and
 * the machine does not move, so its length is the one number that is pure cost:
 * every pixel of it is a pixel spent looking at a still frame. It was `0.15`
 * and is now `0.12`, which on the rendered page is 387px down to 207px.
 *
 * That is a *quality* gain rather than a saving, because of what the hold
 * contains. See `BENCH_HERO_EXITS`: the hold is the one beat where the machine
 * is on screen and is no longer the thing being read, and every pixel of it is
 * a pixel of a composition on its way out. Shortening it shortens that
 * directly.
 */
export const BENCH_HOLD = BENCH_PHASES.gather[0]

/**
 * The stage box the px constants below are authored against.
 *
 * The chip slots are percentages and need no reference, but the scatter
 * distances, the strata drifts and the principle travel are all px, so they
 * need one. Everything px in this module is multiplied by `unit` — the measured
 * stage width over this width, clamped — so a 2560px display gets a scatter
 * twice as wide rather than a scatter that has shrunk to a third of the stage.
 */
export const BENCH_STAGE_BASE = { width: 1280, height: 760 } as const

/** How far the unit may stretch. Beyond this the artwork stops tracking the box. */
export const BENCH_UNIT_RANGE = { min: 0.6, max: 2 } as const

/**
 * px — how far each continuous stratum is allowed to travel across the arc.
 *
 * Unequal on purpose, and not by a small margin: equal offsets would read as
 * one rigid layer sliding, which is the opposite of depth. There is no `near`
 * entry because the near stratum's travel *is* the chip scatter, spent at the
 * dock — see the module header.
 */
export const BENCH_STRATA_TRAVEL = {
  far: 14,
  middle: 34,
} as const

/**
 * px of outward scatter per percent of stage, per unit of depth.
 *
 * The scatter is radial — a chip is pushed directly away from the stage's
 * centre, in proportion to how far out its slot already is — so the opening
 * frame is a *loose ring* rather than a cloud, and the reader's eye can feel it
 * contracting into place. Pushing every chip the same direction would have been
 * simpler and would have read as a slide, not a gather.
 *
 * The magnitude is bounded by the frame, not by taste. A chip's slot can sit at
 * 88% of the stage, and the stage clips; the authored `home` vectors plus this
 * spread have to leave every chip's centre on the sheet at `p=0`, or the
 * opening tableau is a scatter of half-labels sliced by the viewport edge.
 */
export const BENCH_CHIP_SPREAD = 2.2

/**
 * How far into the gather window the last chip's own window is pushed.
 *
 * It is a fraction of the **arc**, not of the gather window, so it has to be
 * rescaled whenever the arc is retimed — it was `0.16` against an arc of `0.65`
 * and is `0.11` against an arc of `0.43`, which preserves the ratio. Left at
 * `0.16` the stagger would have eaten three quarters of a gather window that is
 * now only `0.19` wide, and the last chip would have arrived with almost no
 * travel left to travel.
 */
export const BENCH_CHIP_STAGGER = 0.11

/**
 * The pieces of the outgoing machine, and how each one leaves.
 *
 * ## Why the seam is a disassembly rather than an arrival
 *
 * The handoff used to be the About's sheet *arriving*: an opaque surface rose
 * over a machine that was pinned still underneath it, and because both surfaces
 * were dense and full-viewport the overlap read as two pictures at half
 * contrast for as long as the blend lasted.
 *
 * It is now the machine *coming apart*. The About's sheet is the page the whole
 * time — the next section is pulled up under the hero and sits there, whole,
 * from the first frame of the handoff — and the hold is spent taking the
 * instrument away one piece at a time, each along the axis it already lives on:
 * the track headers slide out to the left, the mixer drops out of the bottom,
 * the toolbar and the ruler ride up off the top, the clip content and the
 * ground dissolve where they stand. What the reader watches is an interface
 * being dismantled, which is a thing the eye already has a grammar for, and the
 * About is simply what was behind it.
 *
 * ## Why the whole stage is not scaled instead
 *
 * One `scale()` on the stage would be a third of the code, and it is the wrong
 * picture. A full-viewport composition shrunk toward its own centre reads as a
 * *picture* of a device being resized — a screenshot in a window — and it
 * flattens every piece into a single object. The pieces are what carry the
 * meaning here: a toolbar leaving upward says "this was an application", and a
 * rail leaving sideways says the same thing again from another direction.
 *
 * ## Why the furniture translates but does not fade
 *
 * The stage clips (`overflow: hidden`), so a piece that has left its own box
 * has already left the frame; a fade on top of that would be a second,
 * redundant statement of the same fact. Worse, it would fight the stylesheet —
 * `.chrome` and `.proof` both declare a `transition: opacity`, and an inline
 * opacity written every frame behind a 400ms transition is a smear, not a fade.
 * Of the *furniture*, the pieces that genuinely dissolve are the two with no
 * axis to leave on: the playhead, which is a line, and the ground, which is
 * what the whole machine is drawn on. The clip content dissolves as well, but
 * through a different channel entirely — see `BenchHeroExitMode`.
 *
 * ## The stagger
 *
 * Every exit ends on the same frame and starts later the later it is delayed,
 * so a delayed piece is a *faster* piece — the same shape the chip gather uses.
 * The ground is last and longest on purpose: while it holds, the furniture is
 * read leaving against the dark it was drawn on, and only once it goes is the
 * About simply there.
 *
 * `x` and `y` are percentages of the piece's own box, which is why the rail
 * clears itself with a smaller number than the ruler needs: the ruler is short
 * and has the toolbar above it to get past.
 */
export const BENCH_HERO_EXITS = [
  { id: 'rail', x: -135, y: 0, mode: 'slide', delay: 0 },
  { id: 'proof', x: 0, y: 135, mode: 'slide', delay: 0.06 },
  { id: 'playhead', x: 0, y: 0, mode: 'fade', delay: 0.1 },
  { id: 'camera', x: 0, y: 0, mode: 'dissolve', delay: 0.14 },
  { id: 'chrome', x: 0, y: -135, mode: 'slide', delay: 0.18 },
  { id: 'ruler', x: 0, y: -250, mode: 'slide', delay: 0.24 },
  { id: 'ground', x: 0, y: 0, mode: 'fade', delay: 0.34 },
] as const

/** Every piece of the machine the seam knows how to take away. */
export type BenchHeroPiece = (typeof BENCH_HERO_EXITS)[number]['id']

/**
 * How one piece is taken away — and the third case is not a synonym for the
 * second.
 *
 * - `slide` — the piece leaves along its own axis and nothing else about it
 *   changes. Its opacity is deliberately left alone, because two of the sliding
 *   pieces declare a `transition: opacity` the stylesheet owns.
 * - `fade` — the piece itself dissolves. Correct for a node that is a single
 *   painted thing: the playhead is a hairline, the ground is a field of colour.
 * - `dissolve` — the piece's **content** dissolves while the node's own opacity
 *   stays at 1. This exists for exactly one piece, the camera, and the reason is
 *   mechanical rather than stylistic: `.camera` carries
 *   `transform-style: preserve-3d`, and `opacity` below 1 is a *grouping
 *   property value* — it forces the element to render its subtree into a flat
 *   plane. Fading the camera would therefore flatten the depth layer mid-seam,
 *   and the profile lane's `translateZ` would vanish on the frame the fade
 *   began: a ~2.5% geometry snap at the exact moment the reader is meant to be
 *   watching the machine come apart, at full opacity. The lanes inside it are
 *   leaves — they have no 3D descendants — so their opacity can fall without
 *   flattening anything, and the dissolve is delivered through them instead.
 *   See `arrangement.module.css` for the `--arr-fade` half of the contract.
 */
export type BenchHeroExitMode = 'slide' | 'fade' | 'dissolve'

/** Where one piece of the machine is, and how much of it is left, this frame. */
export type BenchHeroExit = {
  id: BenchHeroPiece
  /** % of the piece's own box. Zero for a piece that does not slide. */
  x: number
  y: number
  /** 1 for a piece that leaves by direction; falls to 0 for one that fades. */
  opacity: number
  /** How the piece is taken away. See `BenchHeroExitMode`. */
  mode: BenchHeroExitMode
}

/** The size a chip is drawn at, furthest back to closest. */
export const BENCH_CHIP_SCALE = { far: 0.8, near: 1.08 } as const

/**
 * The weight a chip is drawn at, furthest back to closest.
 *
 * The floor is 0.5 rather than 0.42 because of where the far chips end up: by
 * the end of the arc a chip at depth 0.25 is drawn at `far * resolveFloor`, and
 * at 0.42 that came to 0.14 — which the rendered page showed as absent rather
 * than as quiet. The constraints have to stay legible as texture once they have
 * been spent, because they are what the artifact is made of.
 */
export const BENCH_CHIP_OPACITY = { far: 0.5, near: 1 } as const

/**
 * How far a chip overshoots its own rotation mid-flight, as a fraction.
 *
 * It is applied as `dock * (1 - dock) * 4`, which is zero at both ends and one
 * at the midpoint, so the chip swings past its final angle and settles back
 * into it without the frame ever leaving its declared bounds. A straight
 * interpolation to zero reads as a spring releasing; this reads as a hand
 * setting something down.
 */
export const BENCH_CHIP_OVERSHOOT = 0.24

/** How much a chip grows as it comes forward and lands. */
export const BENCH_CHIP_GROW = 0.07

/**
 * The fraction of its base weight a chip keeps after the artifact has won.
 *
 * Not zero. The constraints are what the artifact is *made of*, so they stay
 * on the stage as texture once they have been spent — dropping them to nothing
 * would say the argument was thrown away rather than concluded.
 */
export const BENCH_CHIP_RESOLVE_FLOOR = 0.42

/** How much the ring contracts once the artifact has taken the foreground. */
export const BENCH_RING_TIGHTEN = 0.05

/** px — the artifact's lift as it steps aside. */
export const BENCH_ARTIFACT_LIFT = 40

/** px — the principle line's entry travel. */
export const BENCH_PRINCIPLE_TRAVEL = 30

/** The artifact's scale once it has fully receded. */
export const BENCH_ARTIFACT_RECEDE = 0.09

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value))

/** A non-finite or missing number is a broken input, not an extreme one. */
const finite = (value: number | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

/**
 * Collapse negative zero.
 *
 * `-0` stringifies as `"-0"` inside a transform and is not `Object.is`-equal to
 * `0`, so a chip that has landed on exactly zero would serialise a transform
 * that differs from the one its neighbour serialises — and every fixture that
 * compares frames would fail on a value that is arithmetically correct.
 */
const unsignedZero = (value: number) => (value === 0 ? 0 : value)

const smooth = (t: number) => t * t * (3 - 2 * t)

/**
 * A bounded smoothstep across a window. Clamped at both ends, so a phase can
 * never be entered past its own span however the progress arrives.
 */
const phase = (p: number, from: number, to: number) =>
  smooth(clamp((p - from) / (to - from), 0, 1))

/**
 * Which of the three moves the arc is in.
 *
 * Exposed separately from `benchFrame` because the stage publishes it as an
 * attribute and the stylesheet keys off it, and a state derived twice from two
 * different expressions is a state that will eventually disagree with itself.
 */
export function benchState(progress: number): BenchState {
  const p = clamp(finite(progress, 0), 0, 1)
  if (p < BENCH_PHASES.gather[0]) return 'scatter'
  if (p < BENCH_PHASES.resolve[1]) return 'align'
  return 'settle'
}
const benchChipFrame = (
  chip: BenchChip,
  p: number,
  unit: number,
  resolve: number,
): BenchChipFrame => {
  const depth = clamp(finite(chip.depth, 0.5), 0, 1)
  const delay = clamp(finite(chip.delay, 0), 0, 0.9)

  // Every chip's window ends on the same frame and starts later the more
  // delayed it is, so a late chip is a *faster* chip. That is what a stagger
  // should be: the ring closes in one motion, not in a queue.
  const from = BENCH_PHASES.gather[0] + delay * BENCH_CHIP_STAGGER
  const dock = phase(p, from, BENCH_PHASES.gather[1])

  // Radial scatter, scaled by depth. A chip whose slot is already far out is
  // pushed further out than one near the middle, which is what keeps the
  // opening frame a ring rather than a blur.
  const outwardX = chip.slot.x - 50
  const outwardY = chip.slot.y - 50
  const spread = BENCH_CHIP_SPREAD * depth
  const scatterX = (chip.home.x + outwardX * spread) * unit
  const scatterY = (chip.home.y + outwardY * spread) * unit

  const ease = 1 - dock
  const wobble = dock * (1 - dock) * 4

  const baseScale =
    BENCH_CHIP_SCALE.far +
    (BENCH_CHIP_SCALE.near - BENCH_CHIP_SCALE.far) * depth
  const baseOpacity =
    BENCH_CHIP_OPACITY.far +
    (BENCH_CHIP_OPACITY.near - BENCH_CHIP_OPACITY.far) * depth

  return {
    id: chip.id,
    // Both offsets are zero at the dock, so a landed chip is exactly on its
    // slot — the alignment the whole section is an argument for.
    x: unsignedZero(scatterX * ease),
    y: unsignedZero(scatterY * ease),
    rotate: unsignedZero(chip.rotate * (ease - BENCH_CHIP_OVERSHOOT * wobble)),
    scale: baseScale * (1 + BENCH_CHIP_GROW * dock),
    opacity: baseOpacity * (1 - resolve * (1 - BENCH_CHIP_RESOLVE_FLOOR)),
    depth,
  }
}

/**
 * Everything the frame needs, as a measured geometry. Every field is required
 * on the type and optional at the call site — see `BenchGeometryInput`.
 */
export type BenchGeometry = {
  /** px — the decorative stage's own box, measured once per refresh. */
  stageWidth: number
  stageHeight: number
}

/**
 * What `benchFrame` actually accepts.
 *
 * A partial geometry is a real state, not a programming error: the first call
 * can happen before anything has been laid out, and a measurement can be zero
 * for a frame. The frame normalises both rather than requiring the caller to
 * guard, which is what keeps the maths total.
 */
export type BenchGeometryInput = Partial<BenchGeometry>

export function benchFrame(
  progress: number,
  geometry: BenchGeometryInput = {},
): BenchFrame {
  const p = clamp(finite(progress, 0), 0, 1)

  // Measured geometry, floored at one pixel and clamped to the declared range.
  // A zero-size box is a box that has not been laid out yet, and dividing by it
  // would put Infinity into a transform — the one failure mode that survives
  // all the way to paint.
  const stageWidth = Math.max(
    1,
    finite(geometry.stageWidth, BENCH_STAGE_BASE.width),
  )
  const unit = clamp(
    stageWidth / BENCH_STAGE_BASE.width,
    BENCH_UNIT_RANGE.min,
    BENCH_UNIT_RANGE.max,
  )

  const assemble = phase(p, ...BENCH_PHASES.assemble)
  const resolve = phase(p, ...BENCH_PHASES.resolve)
  const emerge = phase(p, ...BENCH_PHASES.emerge)

  return {
    progress: p,
    state: benchState(p),
    // The seam, spent over the hold on a machine that is not moving. These are
    // the only numbers in the frame that are about the handoff rather than the
    // artwork: the About's sheet never moves, and the machine above it is taken
    // apart out of the way. See `BENCH_HERO_EXITS`.
    //
    // Nothing here is scaled by `unit`. Every distance is a percentage of the
    // piece's own box, so a piece clears itself by its own size at any viewport
    // — which is the one measurement this table cannot be given and does not
    // need.
    heroExits: BENCH_HERO_EXITS.map((exit) => {
      const leave = phase(p, BENCH_HOLD * exit.delay, BENCH_HOLD)
      return {
        id: exit.id,
        x: unsignedZero(exit.x * leave),
        y: unsignedZero(exit.y * leave),
        // A sliding piece keeps whatever opacity the hero's own phases gave it;
        // only a piece that dissolves carries a falling one.
        opacity: exit.mode === 'slide' ? 1 : 1 - leave,
        mode: exit.mode,
      }
    }),
    heroCleared: p >= BENCH_HOLD,
    // The two continuous strata. Linear, because a constant-velocity drift is
    // what a layer bolted to the page actually does; easing them would make
    // them read as objects that start and stop.
    farY: unsignedZero(-BENCH_STRATA_TRAVEL.far * unit * p),
    middleY: unsignedZero(-BENCH_STRATA_TRAVEL.middle * unit * p),
    ringScale: 1 - BENCH_RING_TIGHTEN * resolve,
    artifactDraw: assemble,
    // Never fully gone: the artifact stays as a ghost under the principle, so
    // the line reads as something the drawing *became* rather than something
    // that replaced it.
    artifactOpacity: assemble * (1 - emerge * 0.88),
    artifactScale: 1 - BENCH_ARTIFACT_RECEDE * emerge,
    artifactY: unsignedZero(-BENCH_ARTIFACT_LIFT * unit * emerge),
    // The construction marks are whole on the first frame and spent exactly as
    // the wireframe finishes drawing over them.
    scaffoldOpacity: 1 - assemble,
    // The principle is in normal flow from the first frame. Only its offset
    // moves, and only during its own window, so it can never be invisible.
    principleY: unsignedZero(BENCH_PRINCIPLE_TRAVEL * unit * (1 - emerge)),
    principleOpacity: emerge,
    captionOpacity: assemble * (1 - emerge * 0.55),
    chips: BENCH_CHIPS.map((chip) => benchChipFrame(chip, p, unit, resolve)),
    reading: p >= BENCH_READING_AT,
  }
}

/**
 * When each band of the artwork stops needing to be clear of the reading panel.
 *
 * There is more than one band and they do not expire together, which is the
 * whole reason this is a table rather than a single number:
 *
 * - the **artifact** is the lowest thing that has to survive whole, and it stops
 *   needing to be clear the instant it starts receding — because the recede and
 *   the panel's climb are the same beat, and a drawing that stepped aside after
 *   the panel had already eaten it never stepped aside at all.
 * - the **principle** sits above the artifact and arrives later, so it has to
 *   stay clear until it has finished rising. It is the payoff line; a runway
 *   that let the panel cross it mid-entry would bury the one sentence the whole
 *   drawing is an argument for.
 *
 * See `benchRunway` for how the two are combined.
 */
export const BENCH_BAND_CLEARANCE = {
  artifact: BENCH_PHASES.emerge[0],
  principle: BENCH_PHASES.emerge[1],
} as const

/**
 * What the runway is measured from. Every field is measured once per refresh by
 * the hook; nothing here is a constant.
 */
export type BenchRunwayInput = {
  /** px — the sticky stage. This is the viewport the section is pinned over. */
  viewportHeight: number
  /** px — the reading panel's own height, the content without its padding. */
  readingHeight: number
  /** px — the whole About panel, padding included: what actually climbs. */
  aboutHeight: number
  /** The bands of artwork that have to stay clear of the panel, and until when. */
  bands: readonly BenchRunwayBand[]
}

export type BenchRunwayBand = {
  /**
   * px — from the stage's top edge to the **bottom** of the band.
   *
   * The bottom edge is what matters, not the top: the panel climbs from below,
   * so the last part of a band to be eaten is its top and the first is its
   * bottom. A runway that cleared the top would already be covering the bottom.
   */
  bottom: number
  /** The local progress at which this band stops needing to be clear. */
  clearUntil: number
}

/**
 * How much scroll the reading panel has to be held off screen for.
 *
 * ## Why this is not just "one viewport"
 *
 * The reading panel is opaque and sits above the stage, so as soon as its top
 * edge climbs into a band of artwork it starts eating it. That is by design —
 * the panel is *supposed* to scroll over the drawing — but it means the runway
 * is what decides whether the beats are watchable at all.
 *
 * ## The rule
 *
 * The panel's top edge starts one runway below the stage's top and climbs the
 * whole section's travel, which is the runway plus the panel less the viewport
 * it is pinned over. So its position at progress `p` is
 *
 *     runway - p * (runway + aboutHeight - viewportHeight)
 *
 * and the runway that puts its first frame exactly on a band's bottom edge on
 * the frame that band stops needing to be clear is the solution of that
 * expression equalling `band.bottom` at `p = band.clearUntil`:
 *
 *     runway = (band.bottom + clearUntil * (aboutHeight - viewportHeight))
 *              / (1 - clearUntil)
 *
 * Every band is solved for and the **largest** wins, because the panel is one
 * object: a runway that satisfied a higher band but not a lower one would still
 * be covering the lower one. That is also why this takes a list rather than the
 * single band it started with — the artifact is lower and expires earlier than
 * the principle, and solving for the principle alone left the panel climbing
 * over the artifact while it was still being drawn.
 *
 * Deriving it rather than tuning it is the point: the bands move with the type
 * scale and the artwork, the panel moves with the biography, and all of them
 * move with the viewport. A constant here would be correct at exactly one
 * window size.
 *
 * The two floors stay. A runway shorter than the reading panel would put the
 * panel's own content on screen during the opening beat, and one shorter than
 * the viewport would let the panel's top edge show before `p=0`, over a stage
 * the previous section is still holding.
 */
export function benchRunway(input: BenchRunwayInput): number {
  const viewportHeight = Math.max(1, finite(input.viewportHeight, 1))
  const readingHeight = Math.max(1, finite(input.readingHeight, 1))
  const aboutHeight = Math.max(0, finite(input.aboutHeight, 0))

  let clearance = 0
  for (const band of input.bands) {
    const bottom = Math.max(0, finite(band.bottom, 0))
    // A band that has to stay clear until the very end has no runway that can
    // satisfy it — the divisor would be zero. Capping below one keeps the
    // answer finite and still gives the longest runway the formula can express.
    const clearUntil = clamp(finite(band.clearUntil, 0), 0, 0.95)
    const climb = Math.max(0.05, 1 - clearUntil)
    clearance = Math.max(
      clearance,
      (bottom + clearUntil * (aboutHeight - viewportHeight)) / climb,
    )
  }

  return Math.max(readingHeight, viewportHeight, Math.ceil(clearance))
}
