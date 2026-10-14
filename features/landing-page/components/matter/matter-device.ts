/**
 * Sound becomes matter — the device layer's one pure function.
 *
 * The bridge is not a scatter of isolated icons; it is one machine coming
 * apart. This module owns the part of that story that belongs to the *device*
 * rather than to the individual cast members: how present the shell is, how
 * the faceplate lifts, how much of the signal route is lit, how far the platter
 * has turned, where the tonearm has swung, and how much quiet hardware residue
 * is left for the first practice line to sit beside.
 *
 * It is a module of its own, and not a branch of `matter-frame.ts`, for the
 * same three reasons that file is separate from its hook:
 *
 * 1. **Pure.** Progress in, numbers out. No DOM, no GSAP, no timers, no reads —
 *    so the whole device score can be pinned by a written-out fixture with no
 *    browser, and the stylesheet that consumes the numbers cannot silently
 *    drift away from the maths that produced them.
 * 2. **Deterministic under scrubbing.** Every term is a clamped smoothstep over
 *    a fixed window, so sampling forward and sampling backward land on the same
 *    frame. Nothing here accumulates, remembers, or reads the previous frame.
 * 3. **Total.** Non-finite or missing progress normalises to the opening frame
 *    rather than to `NaN`. A decorative layer that can be pushed into a broken
 *    transform by a resize is a layer that will be found broken mid-scroll.
 *
 * The semantic About copy is deliberately absent, exactly as it is from
 * `matter-frame.ts`. The device never gates the biography; it only decorates
 * the band the biography scrolls over.
 */

/** The visual floor of the handoff, as local progress. */
export const MATTER_DEVICE_PHASES = {
  /** The shell resolves over the outgoing machine. */
  establish: [0, 0.1],
  /** The signal route lights from the source proxy toward the playhead lane. */
  signal: [0.18, 0.58],
  /** The platter begins to turn, the tonearm begins to swing. */
  release: [0.4, 0.7],
  /** The faceplate gives way as the hardware detaches. */
  lift: [0.58, 0.78],
  /** The last large hardware clears. */
  clear: [0.7, 0.8],
} as const

/** The tonearm's own swing, inside `release`. */
export const MATTER_TONEARM_PHASES: readonly [number, number] = [0.38, 0.62]

/**
 * The practice residue's own two windows, and why they are not `release`'s.
 *
 * The residue exists for one reader, at one moment: the beat where
 * `Start with the user.` is the most legible thing on screen. That beat is not
 * where the design's prose put it.
 *
 * The score above assumes the first practice line arrives around `p=.65`,
 * which is where `MATTER_PHASES.arrive` begins and where the plan's residue
 * contract puts its brightest frame. Measured against the rendered page at
 * 1440×900, it does not: the reading panel's own top padding and the
 * `Behind the interface.` title sit *above* the practice statements, so the
 * heading does not enter the viewport until `p≈.72` and does not settle as the
 * focal point until `p≈.80`.
 *
 * Keying the residue off `release` and `clear` therefore produced the exact
 * defect the residue was added to fix. `release` reaches 1 at `p=.70` and
 * `clear` is whole at `p=.80`, so the residue *peaked* at `.22` on the frame
 * before the heading arrived and hit zero on the frame it arrived on. The
 * heading landed over an empty stage after all — the residue had already been
 * and gone.
 *
 * These two windows are the correction, and they are measured rather than
 * guessed: `in` is spent across the device release so the fragment reads as a
 * piece of the machine that has just come apart, and `out` is placed after the
 * heading has settled, so the anchor is present for the whole of its own beat
 * and clears before the body copy becomes the focal point.
 */
export const MATTER_RESIDUE_PHASES = {
  /** Rises with the break-apart, whole by the time the heading arrives. */
  in: [0.52, 0.74],
  /** Clears once the heading has settled, before the story copy lands. */
  out: [0.82, 0.94],
} as const

/**
 * Where the device's residue is at its quietest, and how quiet that is.
 *
 * The plan's contract asked for `0.22`, and it was chosen for a residue that
 * was only ever a supporting detail — the shell was still on screen behind it
 * for most of its life. Measured on the rendered page, the residue is now the
 * *only* thing in the band when the practice heading lands, and at `0.22` an
 * ink drawing on the page's own ground is under the threshold at which a
 * reader reads it as hardware rather than as a smudge. `0.30` is the smallest
 * value that survives that measurement while still staying well under the
 * heading's own contrast, which is the constraint that actually matters here.
 */
export const MATTER_RESIDUE_FLOOR = 0.3

/** The platter turns a token amount at rest, then a quarter-turn across release. */
const PLATTER_IDLE_DEGREES = 3
const PLATTER_TRAVEL_DEGREES = 42

/** The meter rests above zero so it reads as a live meter, not a dead one. */
const METER_IDLE = 0.24
const METER_TRAVEL = 0.7

export type DeviceFrame = {
  /** The shell's own presence. Zero before the establish window and after clear. */
  shellOpacity: number
  /** The chassis and faceplate, lifted before the shell itself leaves. */
  faceplateOpacity: number
  /** The primary-colour signal route and cue light. */
  signalOpacity: number
  /**
   * The quiet hardware left for the first practice line.
   *
   * It is the one number in the frame that is *only* ever non-zero across the
   * practice landing, which is what makes `Start with the user.` land beside a
   * piece of the machine instead of over an empty stage. It is deliberately not
   * keyed to the shell's `clear`: measured on the rendered page the heading
   * arrives after the shell has gone, so the residue runs on the two windows in
   * `MATTER_RESIDUE_PHASES` and outlives the shell it came from.
   */
  residueOpacity: number
  /** Degrees. Written to a platter group's `rotate()`. */
  platterRotation: number
  /** 0 → 1. Scales the mixer meters. */
  meterLevel: number
  /** 0 → 1. Written to the tonearm group's rotation. */
  tonearm: number
}

/**
 * The device's composition states, named for what the frame is doing rather
 * than for anything React stores. They are derived from progress and never
 * kept between frames.
 */
export type DeviceState =
  | 'source-hold'
  | 'device-established'
  | 'signal-transfer'
  | 'device-release'
  | 'reading-residue'
  | 'reading-plateau'

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value))

/** A non-finite or missing number is a broken input, not an extreme one. */
const finite = (value: number, fallback: number) =>
  Number.isFinite(value) ? value : fallback

const smooth = (t: number) => t * t * (3 - 2 * t)

/**
 * A bounded smoothstep across a window. Clamped at both ends, so a phase can
 * never be entered past its own span however the progress arrives.
 */
const phase = (p: number, from: number, to: number) =>
  smooth(clamp((p - from) / Math.max(1e-4, to - from), 0, 1))

export function matterDeviceFrame(progress: number): DeviceFrame {
  const p = clamp(finite(progress, 0), 0, 1)

  const establish = phase(p, ...MATTER_DEVICE_PHASES.establish)
  const release = phase(p, ...MATTER_DEVICE_PHASES.release)
  const lift = phase(p, ...MATTER_DEVICE_PHASES.lift)
  const clear = phase(p, ...MATTER_DEVICE_PHASES.clear)
  const signal = phase(p, ...MATTER_DEVICE_PHASES.signal)
  const residueIn = phase(p, ...MATTER_RESIDUE_PHASES.in)
  const residueOut = phase(p, ...MATTER_RESIDUE_PHASES.out)

  return {
    // The shell arrives before anything large flies and is exactly gone after
    // the clear, so no residue can outlive the reading plateau.
    shellOpacity: establish * (1 - clear),
    // The chassis goes first, and slightly earlier than the shell, so the
    // machine is seen to lose its body before it loses its outline.
    faceplateOpacity: establish * (1 - lift),
    signalOpacity: signal * (1 - clear),
    // The residue runs on its own clock, and it has to: the shell's `clear` is
    // spent by `p=.80`, which is the frame the practice heading arrives on, so
    // a residue keyed to `clear` is gone exactly when it is needed. See
    // `MATTER_RESIDUE_PHASES`. It is multiplied rather than subtracted so it
    // can never exceed its floor.
    residueOpacity: residueIn * (1 - residueOut) * MATTER_RESIDUE_FLOOR,
    platterRotation: PLATTER_IDLE_DEGREES + PLATTER_TRAVEL_DEGREES * release,
    meterLevel: METER_IDLE + METER_TRAVEL * signal,
    tonearm: phase(p, ...MATTER_TONEARM_PHASES),
  }
}

/**
 * The composition state at a given progress.
 *
 * The boundaries are the same numbers `matterDeviceFrame` is built on, written
 * once here so the two cannot disagree. This is a reading of the frame, not a
 * second source of truth: nothing stores it, and the frame is never derived
 * from it.
 */
export function matterDeviceState(progress: number): DeviceState {
  const p = clamp(finite(progress, 0), 0, 1)
  if (p < MATTER_DEVICE_PHASES.establish[1]) return 'source-hold'
  if (p < MATTER_DEVICE_PHASES.release[0]) return 'device-established'
  if (p < MATTER_DEVICE_PHASES.lift[0]) return 'signal-transfer'
  if (p < MATTER_DEVICE_PHASES.clear[0]) return 'device-release'
  // The reading states are the residue's, not the shell's: the shell is gone by
  // `clear[1]`, but the fragment that anchors the first practice line outlives
  // it, so the residue's own exit is what ends this state.
  if (p < MATTER_RESIDUE_PHASES.out[1]) return 'reading-residue'
  return 'reading-plateau'
}
