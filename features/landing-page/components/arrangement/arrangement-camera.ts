/**
 * The arrangement camera — one pure function, no DOM reads.
 *
 * Mirrors `riddimFrame(progress)` from the RIDDIM hero: everything the scene
 * needs is derived from `progress` plus geometry that `measure()` supplies once
 * per refresh. That is what lets the whole camera be unit-tested against a
 * written-out fixture with no browser, and it is why the lane heights and the
 * camera maths cannot silently drift apart.
 *
 * `cameraX` / `cameraY` are a **translate in world coordinates**, not a focus
 * point plus `transform-origin`. `worldWidth / 2 - focusX * scale` is exactly
 * `0` when the focus is the world's centre — which is precisely the overview —
 * so the CSS fallbacks *are* the settled frame and the no-JavaScript and
 * reduced-motion renderings need no second set of rules.
 */

/**
 * The window is deliberately longer than the five phases need.
 *
 * The rail reveal completes at `rail`, and everything from there to 1.0 is a
 * **hold**: the panel the camera dived into stays put, fully revealed, for about
 * a screen and a bit of scrolling. Without it About would be a flash — the
 * reader would watch the zoom land and then be swept straight past the thing the
 * whole move was for. `rail` is early enough that the hold is roughly a quarter
 * of the window.
 *
 * The hold is split in two, because About does not fit the window it is revealed
 * in and the reader still has to be able to reach all of it:
 *
 * - `rail → seamOpen` — the clip-path window finishes opening. Short and
 *   decisive, so the reveal reads as a cut rather than a fade.
 * - `seamOpen → 1` — **the read.** The panel's content translates up by exactly
 *   its measured overflow, so the last card is reachable instead of clipped.
 *
 * Measured at five viewports, the overflow runs from 0px (1728×1117) to 304px
 * (1280×720) — it is a function of the viewport, not a constant, which is why
 * the read is driven by a measured number rather than a tuned one.
 */
export const ARRANGEMENT_SCROLL_SVH = 460

export const ARRANGEMENT_PHASES = {
  open: 0,
  settle: 0.1,
  travel: 0.3,
  zoom: 0.52,
  rail: 0.72,
} as const

/**
 * Where the window has finished opening and the read begins. The window gets
 * `rail → seamOpen` to open and the read gets everything after it, so the read
 * is the longer half: at 1440×900 that is 324px to open and 583px to read 191px
 * of overflow, which paces at about 3:1 instead of the 4.75:1 a single hold
 * would give.
 */
export const ARRANGEMENT_SEAM_OPEN = 0.82

export type ArrangementPhase = 'open' | 'settle' | 'travel' | 'zoom' | 'rail'

export type SeamInset = {
  top: number
  right: number
  bottom: number
  left: number
}

export type ArrangementGeometry = {
  /** px — the track area's width less the rail gutter. */
  worldWidth: number
  /** px — the lane stack's height. */
  worldHeight: number
  /** px — the rail gutter the lanes and the ruler both start after. */
  gutter: number
  /** px, in world coordinates. */
  profileStart: number
  profileEnd: number
  profileLaneTop: number
  laneHeight: number
  rulerHeight: number
  /** px — the visible frame, i.e. the track area. */
  viewportWidth: number
  viewportHeight: number
  /**
   * px — the stage's top edge to the track area's top edge. The seam is an
   * overlay on the whole stage, so its window is measured from the stage's edges
   * rather than the track area's; these two are the correction. Without them the
   * window would sit one chrome-height too high and the dive would reveal the
   * wrong part of the panel.
   */
  chromeHeight: number
  /** px — the track area's bottom edge to the stage's bottom edge. */
  proofHeight: number
  /**
   * px — how much taller the card rail is than the window it is revealed in.
   * Zero when it happens to fit. Measured, never assumed: at 1728×1117 it is 0
   * and at 1280×720 it is 304, so a constant here would either clip a card or
   * leave dead scroll behind.
   *
   * It is the **rail's** overflow and not the panel's, because the rail is the
   * only thing that travels — see `readTravel`.
   */
  readOverflow: number
}

export type ArrangementFrame = {
  scale: number
  cameraX: number
  cameraY: number
  playheadFraction: number
  /** px from the track area's left edge — a screen coordinate, ready for CSS. */
  playheadX: number
  railReveal: number
  clipInterior: number
  /**
   * The window the clip's interior is revealed through, as a `clip-path`
   * inset in px against the track area. It starts as the PROFILE clip's own
   * rectangle and opens to the frame, so the panel is *revealed* rather than
   * scaled: laid out at its real size the whole time, and uncovered.
   */
  seamInset: SeamInset
  /** Fades the interior in as the window opens. */
  seamOpacity: number
  /**
   * px — how far the panel's reading content has travelled. Always `>= 0`, and
   * never more than the measured overflow, so the read ends exactly on the last
   * card rather than past it.
   *
   * It drives the **heading and the card rail only**. The timeline panel beside
   * them stays put, which is the panel's own animation — `.timelinePanel` is
   * `position: sticky` in `rack-01.module.css` and was written to hold still
   * beside a scrolling column of cards. There is no scroll container inside the
   * seam for that to stick against, so the travel is this translate instead, and
   * keeping the timeline out of it is what preserves the original behaviour.
   */
  readTravel: number
  phase: ArrangementPhase
}

export const OPEN_SCALE = 1.28
/** 4% of headroom so the window has somewhere to travel from — see doc §6.1. */
export const OPEN_OVERSHOOT = 1.04

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const mix = (from: number, to: number, t: number) => from + (to - from) * t
const smooth = (t: number) => t * t * (3 - 2 * t)
/**
 * A zero-length span is a step, not a division by zero. `seamOpen` is a
 * constant so it can never equal `rail`, but the guard keeps the helper honest
 * for the callers that pass measured ranges.
 */
const span = (value: number, from: number, to: number) =>
  to <= from
    ? value >= to
      ? 1
      : 0
    : smooth(clamp01((value - from) / (to - from)))

export function arrangementPhase(progress: number): ArrangementPhase {
  const p = clamp01(progress)
  if (p < ARRANGEMENT_PHASES.settle) return 'open'
  if (p < ARRANGEMENT_PHASES.travel) return 'settle'
  if (p < ARRANGEMENT_PHASES.zoom) return 'travel'
  if (p < ARRANGEMENT_PHASES.rail) return 'zoom'
  return 'rail'
}

export function arrangementFrame(
  progress: number,
  geo: ArrangementGeometry,
): ArrangementFrame {
  const p = clamp01(progress)
  const profileWidth = Math.max(1, geo.profileEnd - geo.profileStart)
  const profileCentre = (geo.profileStart + geo.profileEnd) / 2

  // Derived, never tuned: the scale at which the clip's two vertical edges land
  // on the frame's two vertical edges. That is the seam's whole premise, and it
  // is what makes the rail reveal's horizontal insets already zero when it
  // opens. At 1440×900 against the real axis it comes to about 2.0.
  const zoomScale = geo.worldWidth / profileWidth

  const settleT = span(p, 0, ARRANGEMENT_PHASES.settle)
  const travelT = span(p, ARRANGEMENT_PHASES.travel, ARRANGEMENT_PHASES.zoom)
  const zoomT = span(p, ARRANGEMENT_PHASES.zoom, ARRANGEMENT_PHASES.rail)
  const railT = span(p, ARRANGEMENT_PHASES.rail, ARRANGEMENT_SEAM_OPEN)
  // The read only starts once the window has finished opening. Overlapping them
  // would slide the panel's content while it was still half clipped, which reads
  // as the layout breaking rather than as the page settling.
  const readT = span(p, ARRANGEMENT_SEAM_OPEN, 1)

  const scale =
    p < ARRANGEMENT_PHASES.settle
      ? mix(OPEN_SCALE * OPEN_OVERSHOOT, 1, settleT)
      : p < ARRANGEMENT_PHASES.zoom
        ? 1
        : mix(1, zoomScale, zoomT)

  // Both axes are `0` at the overview, which is what makes the CSS fallbacks
  // *be* the settled frame rather than a second rendering that has to be kept
  // in step with this one. The world is anchored to the top-left of the frame —
  // where a DAW puts the start of the arrangement — and only moves during the
  // dive.
  //
  // The dive brings the profile clip's **left edge onto the lane area's left
  // edge**, which is the rail's right edge. That is the frame the clip is
  // allowed to occupy: the rail is the track header column, and in a real DAW a
  // clip never slides underneath it. It is also why the target is
  // `-profileStart * scale` and not `-gutter - profileStart * scale` — the
  // second one puts the clip's edge at the frame's edge and hides its label
  // behind the rail, which is what the first build did.
  //
  // Note what this does *not* do: the clip's vertical edges do not land on the
  // frame's, because a 58px lane would need a scale near 13 to reach the bottom
  // of a 792px band. §3.1's "the clip's border becomes the frame" is only true
  // horizontally at a derived scale of ~2, and the clip reads as a wide band
  // across the frame instead. Inventing a scale to make the sentence true would
  // take the ruler out of alignment with the clips, which is worse.
  const bandHeight = geo.viewportHeight - geo.rulerHeight
  const cameraX = mix(0, -geo.profileStart * zoomScale, zoomT)
  const cameraY = mix(
    0,
    bandHeight / 2 - (geo.profileLaneTop + geo.laneHeight / 2) * zoomScale,
    zoomT,
  )

  // The open question in doc §1, resolved the honest and cheap way: the
  // playhead opens at the axis start rather than at its midpoint, and the walk
  // is the travel and the dive. It holds on the profile centre from the rail on.
  const playheadFraction =
    p < ARRANGEMENT_PHASES.travel
      ? 0
      : p < ARRANGEMENT_PHASES.rail
        ? travelT
        : 1
  const playheadWorld = mix(0, profileCentre, playheadFraction)
  const playheadX = geo.gutter + cameraX + playheadWorld * scale

  const clipLeft = geo.gutter + cameraX + geo.profileStart * scale
  const clipTop = geo.rulerHeight + cameraY + geo.profileLaneTop * scale
  const clipRight = geo.viewportWidth - (clipLeft + profileWidth * scale)
  const clipBottom = geo.viewportHeight - (clipTop + geo.laneHeight * scale)

  // The window is measured from the **stage's** edges, because that is what the
  // seam overlays. `clipTop` / `clipBottom` are relative to the track area, so
  // they need the chrome above and the proof below added back. At `railT` 1 both
  // mix to `0` and the window is the whole stage — which is what lets the panel
  // cover the chrome and the proof rather than sitting between them.
  const seamTop = clipTop + geo.chromeHeight
  const seamBottom = clipBottom + geo.proofHeight

  return {
    scale,
    cameraX,
    cameraY,
    playheadFraction,
    playheadX,
    railReveal: railT,
    clipInterior: railT,
    seamInset: {
      top: mix(seamTop, 0, railT),
      right: mix(clipRight, 0, railT),
      bottom: mix(seamBottom, 0, railT),
      left: mix(clipLeft, 0, railT),
    },
    // The interior is already legible once the dive has started, so it fades in
    // across the zoom rather than waiting for the rail — otherwise the reader
    // watches a rectangle grow for a third of the window with nothing in it.
    seamOpacity: zoomT,
    // The read. Exactly the measured overflow at the end, so the last card
    // arrives flush with the bottom of the frame and no scroll is wasted past it.
    readTravel: readT * Math.max(0, geo.readOverflow),
    phase: arrangementPhase(p),
  }
}
