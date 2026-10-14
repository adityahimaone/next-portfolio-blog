/**
 * The Patch's timeline: one number in (`readT`, 0..1 across the read), one frame
 * out. Pure, so it is tested without a browser and cannot drift from the CSS.
 */

import {
  ARRANGEMENT_SCROLL_SVH,
  ARRANGEMENT_SEAM_OPEN,
} from '../arrangement/arrangement-camera'

export const PATCH_MODULES = 3

/**
 * Scroll the read gets, on top of the camera's. The old read borrowed the last
 * 18% of the camera's own range — about 65svh — which is why the audit found it
 * had nothing to do. This is its own length, in `svh`, so it scales with the
 * viewport the way the camera's does.
 */
export const PATCH_READ_SVH = 300

/** Where each act of the read starts, as a share of the read. */
export const PATCH_ACTS = {
  powerOn: [0, 0.12],
  modules: [0.12, 0.88],
  bounce: [0.88, 1],
} as const

/** Inside a module's span: the sweep, then the hold the reader reads in. */
export const PATCH_SWEEP_SHARE = 0.45
/** Each control starts this much later than the one before it, as a sweep share. */
export const PATCH_STAGGER = 0.1

export type PatchFrame = {
  /** 0..1, the faceplate waking: wash, LCD boot, panel rise. */
  power: number
  /** The module whose LED is lit and whose story the LCD shows. */
  active: number
  /** 0..1 per module, how far its sweep has got. */
  sweep: readonly [number, number, number]
  /** 0..1, the proof meters settling and the render bar filling. */
  bounce: number
  /** 0..1 across the three modules, what the playhead reports. */
  cursor: number
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const span = (v: number, from: number, to: number) =>
  clamp((v - from) / (to - from))
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function patchFrame(readT: number): PatchFrame {
  const t = clamp(readT)
  const [mFrom, mTo] = PATCH_ACTS.modules
  const across = span(t, mFrom, mTo) * PATCH_MODULES
  const active = Math.min(PATCH_MODULES - 1, Math.floor(across))

  const sweep = [0, 1, 2].map((i) => {
    const local = clamp(across - i)
    return easeOutCubic(clamp(local / PATCH_SWEEP_SHARE))
  }) as unknown as PatchFrame['sweep']

  return {
    power: span(t, ...PATCH_ACTS.powerOn),
    active,
    sweep,
    bounce: span(t, ...PATCH_ACTS.bounce),
    cursor: span(t, mFrom, mTo),
  }
}

/**
 * One control's own progress inside its module's sweep. Controls roll in one
 * after another rather than all at once, and the last one still lands exactly
 * on its value when the sweep ends.
 */
export function controlSweep(index: number, count: number, sweep: number) {
  if (count <= 1) return sweep
  const start = index * PATCH_STAGGER
  const room = 1 - (count - 1) * PATCH_STAGGER
  return clamp((sweep - start) / room)
}

/** A 270° rotary sweep, -135° at zero to +135° at full. */
export const KNOB_MIN = -135
export const KNOB_MAX = 135
export const knobAngle = (level: number) =>
  KNOB_MIN + clamp(level) * (KNOB_MAX - KNOB_MIN)

// ─── One scroll, two clocks ──────────────────────────────

export type SplitProgress = {
  /**
   * The camera's progress, **in the camera's own domain**. It runs 0 →
   * `ARRANGEMENT_SEAM_OPEN` while the window opens, and stops there.
   *
   * It used to carry on to `IMMERSIVE_OVERSHOOT_TO` so the camera's overshoot
   * could be spent during the panel's power-on act. The camera has no overshoot
   * any more — the reader read the in-out-in as a mistake — so there is nothing
   * left for the extra scroll to buy, and the camera's domain is exactly the
   * window it opens. Feeding the camera this, unscaled, leaves
   * `arrangement-camera.ts` and its tests untouched: the camera never learns the
   * read exists.
   */
  camera: number
  /** 0..1 across the read, 0 until the window is open. */
  read: number
}

/**
 * Splits the section's scroll into the camera's clock and the read's.
 *
 * @param scrolled px scrolled into the section
 * @param heroPx   px the camera gets: `(ARRANGEMENT_SCROLL_SVH - 100)svh` of the
 *                 viewport, times `ARRANGEMENT_SEAM_OPEN`
 * @param readPx   px the read gets: `PATCH_READ_SVH` of the viewport
 */
export function splitProgress(
  scrolled: number,
  heroPx: number,
  readPx: number,
): SplitProgress {
  return {
    camera: span(scrolled, 0, heroPx) * ARRANGEMENT_SEAM_OPEN,
    read: span(scrolled, heroPx, heroPx + readPx),
  }
}

/**
 * The section's height in `svh`: one viewport for the sticky stage, then the
 * camera's distance, then the read's. The stylesheet's `--arr-scroll` must say
 * the same number; a test reads the CSS and compares.
 */
export const PATCH_SECTION_SVH =
  100 + (ARRANGEMENT_SCROLL_SVH - 100) * ARRANGEMENT_SEAM_OPEN + PATCH_READ_SVH

/** Pixel budgets for a viewport height, from the two `svh` constants. */
export function scrollBudget(viewportHeight: number) {
  const svh = viewportHeight / 100
  return {
    heroPx: (ARRANGEMENT_SCROLL_SVH - 100) * svh * ARRANGEMENT_SEAM_OPEN,
    readPx: PATCH_READ_SVH * svh,
  }
}
