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

/**
 * The immersive reading of the same window: where the eye is, rather than where
 * the camera is.
 *
 * `ARRANGEMENT_PHASES` above times the camera. These time the *reader*: scan the
 * session, lock onto PROFILE, dive into the clip, and read. They are the dials
 * the depth layer and the overshoot are hung from, and they are deliberately a
 * separate table — retiming the camera must not silently move the moment the
 * profile clip becomes the focal point.
 *
 * `dive` sits after the camera's own `zoom` and `reveal` after the seam has
 * opened, so the overshoot below lands on a frame that is already whole.
 */
export const IMMERSIVE_PHASES = {
  overview: 0,
  scan: 0.24,
  lock: 0.48,
  dive: 0.7,
  reveal: 0.84,
  read: 1,
} as const

/**
 * The one camera overshoot, and its ceiling.
 *
 * `0.025` is 2.5% of whatever the fitted scale happens to be, which is the
 * whole point of expressing it as a fraction rather than in pixels: at 1440×900
 * the measured fit is about 2.0, so the camera reaches 2.05 and comes back. It
 * is enough to imply weight on a 2× frame and small enough that the viewport
 * does not wobble.
 *
 * It starts after `ARRANGEMENT_SEAM_OPEN` and returns to zero before the read
 * begins, so the scale the reader settles on is the measured fit exactly —
 * `arrangementFrame(1, geo).scale === geo.worldWidth / profileWidth`. A bump
 * that never came back down would leave the panel permanently over-zoomed by
 * 2.5%, which is the "wobble" this exists to avoid.
 */
export const IMMERSIVE_OVERSHOOT = 0.025
/** Where the bump is spent. Ends before `read` so the last frame is the fit. */
export const IMMERSIVE_OVERSHOOT_FROM = 0.84
export const IMMERSIVE_OVERSHOOT_TO = 0.91

/** px of depth at full lock, and the extra earned by the dive. */
export const IMMERSIVE_DEPTH_LOCK = 18
export const IMMERSIVE_DEPTH_DIVE = 12

/**
 * What the supporting lanes are worth, at the two moments the reader's
 * attention moves: still fully lit when the scan starts, down to `.72` once
 * PROFILE has been locked, and down to `.16` once the clip has opened.
 *
 * These are opacities rather than a phase flag because the recession is
 * continuous — the lanes dim as the eye travels, not when a boundary is
 * crossed. The phase attribute still drives everything that changes *once* (the
 * rail's slide, the mixer's fade), which is where a transition is cheaper than
 * a per-tick value; contrast is the one thing that has to track the scroll, or
 * the lanes would sit at full strength for a third of the window and then snap.
 */
export const IMMERSIVE_LANE_SCAN_OPACITY = 0.72
export const IMMERSIVE_LANE_DIVE_OPACITY = 0.16

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
  /**
   * px — how far the camera has pushed into the frame, in the third dimension.
   * Written as `--arr-depth` and spent as `translateZ` on the lanes: the
   * supporting tracks go back, the PROFILE lane comes forward, and the ruler,
   * the playhead and the track headers stay where they are because they are not
   * inside the camera.
   *
   * It is a *depth*, not a zoom. The zoom is already `scale`, and stacking a
   * second one on top of it would make the two impossible to reason about
   * separately; a `translateZ` under a fixed `perspective` is a different axis
   * and reads as parallax rather than as more magnification.
   */
  depth: number
  /**
   * 0 → 1 — how much of the frame's attention belongs to the profile clip.
   * Reaches 1 at `lock` and stays there. Written as `--arr-profile-focus` and
   * spent as a small brightness lift on `.laneProfile`, so the focal point is
   * established by contrast rather than by moving anything.
   */
  profileFocus: number
  /**
   * 1 → `.72` → `.16` — how much contrast the supporting lanes keep. Continuous,
   * unlike the rest of the depth layer, because it is the signal that carries
   * the reader's attention off the supporting tracks and onto PROFILE. Applied
   * to every lane except `.laneProfile`, so the focal point is established by
   * the others stepping back rather than by the profile clip doing anything.
   */
  laneOpacity: number
  phase: ArrangementPhase
}

/**
 * The first frame is the whole arrangement, the way a DAW opens a project:
 * every lane and every bar visible, nothing cropped. The earlier 1.28x
 * over-zoom cut the right edge of the name and the last stage off the frame.
 */
export const OPEN_SCALE = 1
export const OPEN_OVERSHOOT = 1

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

/**
 * The camera's scale, as the measured fit plus one restrained overshoot.
 *
 * The dive itself is `ARRANGEMENT_PHASES.zoom → rail`, exactly as it was: the
 * fit is derived from the profile clip's width against the world, so this
 * function only ever moves between `1` and `zoomScale`, and it reaches
 * `zoomScale` on the rail and stays there.
 *
 * What it adds is the weight. A camera that arrives at its mark and stops dead
 * reads as a cross-fade; a camera that overshoots by 2.5% and settles reads as
 * something with mass. The bump is a half sine — zero at both ends, peak in the
 * middle — so it cannot leave a residual offset: at
 * `IMMERSIVE_OVERSHOOT_TO` and beyond, `cameraScale` is the measured fit to the
 * last decimal. That is what the acceptance criterion "zoom ends at the
 * measured clip fit" means, and it is why the overshoot is spent *after* the
 * seam has opened rather than on the way in.
 */
export function cameraScale(progress: number, zoomScale: number): number {
  const p = clamp01(progress)
  const fitted = mix(
    1,
    zoomScale,
    span(p, ARRANGEMENT_PHASES.zoom, ARRANGEMENT_PHASES.rail),
  )
  const weight = Math.sin(
    span(p, IMMERSIVE_OVERSHOOT_FROM, IMMERSIVE_OVERSHOOT_TO) * Math.PI,
  )
  return fitted + weight * IMMERSIVE_OVERSHOOT * zoomScale
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
      : cameraScale(p, zoomScale)

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

  // ── The depth layer ──
  //
  // Two spans, because the eye does two things. `lockT` is the supporting
  // tracks falling away while the profile clip becomes the focal point; `diveT`
  // is the clip opening into the frame. They are read from `IMMERSIVE_PHASES`
  // rather than from the camera's own table, so this is a statement about
  // attention and cannot drift when the zoom is retimed.
  //
  // `profileFocus` takes the max rather than the sum: it is a 0 → 1 signal for
  // "is this the focal point", and adding the two would push it past 1 and make
  // the brightness lift in the stylesheet unbounded.
  const lockT = span(p, IMMERSIVE_PHASES.scan, IMMERSIVE_PHASES.lock)
  const diveT = span(p, IMMERSIVE_PHASES.lock, IMMERSIVE_PHASES.dive)
  const depth = lockT * IMMERSIVE_DEPTH_LOCK + diveT * IMMERSIVE_DEPTH_DIVE
  const profileFocus = Math.max(lockT, diveT)

  // Nested rather than summed, because the two spans overlap: `lockT` is 1 by
  // the time `diveT` starts, so the second mix has to take the first one's
  // result as its floor. A single `1 - lockT*a - diveT*b` would double-count the
  // stretch where both are 1 and drive the lanes below the `.16` the contract
  // asks for.
  const laneOpacity = mix(
    mix(1, IMMERSIVE_LANE_SCAN_OPACITY, lockT),
    IMMERSIVE_LANE_DIVE_OPACITY,
    diveT,
  )

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
    depth,
    profileFocus,
    laneOpacity,
    phase: arrangementPhase(p),
  }
}
