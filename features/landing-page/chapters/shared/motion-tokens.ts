/**
 * The page's motion vocabulary, in one file.
 *
 * The timelines used to carry these as inline strings, so the same
 * "heavy hardware" easing was spelled `power3.inOut` in one chapter
 * and `power2.inOut` in another, and nobody could tell which values
 * were deliberate and which were copied. Every easing, scrub default
 * and shared duration lives here now; a chapter that needs a one-off
 * timing still spells it locally.
 */
export const ease = {
  /** Heavy hardware moves: the radio flip, a lid, a deck. */
  mech: 'power3.inOut',
  /** Landings with a small overshoot: settle, seat, snap. */
  settle: 'back.out(1.4)',
  /** UI reveals: fast out, long tail. */
  glide: 'expo.out',
  /** Weight going into a move. */
  windup: 'power2.out',
  /** Weight coming out of a move. */
  release: 'sine.in',
} as const

export const scrub = {
  /** The rack's default scrub — the seam's 0.8. */
  default: 0.8,
  /** Slow drifts: the controller, the cable divider. */
  drift: 1.15,
  /** The hero collapse, tuned to the decimal. */
  hero: 0.85,
} as const

export const perspective = {
  /**
   * The radio scene's vertical FOV, in CSS px. One number for both
   * the CSS `perspective` on the scene and the GSAP transforms inside
   * it, so the DOM scene and any WebGL layer behind it can share the
   * same camera: `cssPerspective = (viewportHeight / 2) / tan(fov/2)`.
   */
  scene: 1800,
  /** Shallower stage for the contact deck's tilt. */
  deck: 1400,
  /** The skills controller's scrub. */
  controller: 1200,
} as const

/**
 * The radio flip window's scroll length, in viewport heights. The
 * tune, eject, anticipation, rotation and settle phases are all
 * fractions of this one number, so re-tuning the window is a single
 * edit and the choreography keeps its proportions.
 */
export const FLIP_SCROLL_VH = 260

/**
 * How much scroll one work track gets, in viewport heights. This was
 * 55 — about 495px per project, six records deep, and the reader had
 * to travel a marathon to advance one record. 30 keeps every project
 * fully scrubbable (all six lyric lines still land) while making the
 * section feel like a transport.
 */
export const TRACK_SCROLL_VH = 30
