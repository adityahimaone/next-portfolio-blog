/**
 * The bridge from About to Skills: pure frame maths.
 *
 * The About ends on a light sheet and the Skills section is a dark room. This
 * scene joins them by making the Skills section literally *behind* the sheet:
 * the section is lifted up under the bridge's stage, so while the stage is
 * pinned the real Skills section is scrolling up beneath it, and the only
 * thing this scene has to do is cut a hole in the sheet. It has three beats:
 *
 * 1. **The sentence.** "Every rule needs an instrument." arrives on the About's
 *    own sheet, and the three devices the About pinned beside its chapters (a
 *    sampler, a cassette and a record) fly in around it.
 * 2. **The hole.** A black hole opens from the middle of the sheet, with a lit
 *    rim, and eats the sentence. The three devices are drawn in: they fall in a
 *    tightening spiral, tumbling faster as they go, and vanish at the
 *    singularity.
 * 3. **The reveal.** The hole keeps growing, and what it opens onto is the
 *    Skills section, rising into it. It grows past the edges of the screen, the
 *    rim fades, and the sheet is simply gone: the page has become the Skills
 *    section with no join, because it was always the Skills section underneath.
 *
 * The pairing of the About's practices with the devices is the argument and is
 * authored, not decorative: INTERACTION (sampler), SYSTEMS (cassette) and
 * PRODUCTION (record) are the three things that fall into the stack.
 *
 * As everywhere in this folder, this file owns every number and the DOM owns
 * none. The hook reads a frame and writes a handful of custom properties and
 * transforms. Nothing here knows about React, GSAP or the stylesheet.
 */

export type BridgeDeviceKind = 'sampler' | 'cassette' | 'vinyl'

type Pose = {
  /** % of the stage. */
  x: number
  y: number
  scale: number
  rx: number
  ry: number
  rz: number
}

export type BridgeDeviceSpec = {
  id: BridgeDeviceKind
  /** Where it enters from, off the sheet. */
  start: Pose
  /** Where it hovers before the hole opens. */
  hover: Pose
  /** Sway at the hover, px at the base stage width. */
  sway: number
  swayPhase: number
}

export const BRIDGE_PHASES = {
  /** The sentence arrives and the devices fly in. */
  arrive: [0, 0.2],
  /**
   * The hole opens and keeps opening until it is larger than the screen. It
   * ends late on purpose: the Skills section is rising behind the sheet for
   * the whole of this phase, and a hole that finished early would be a hole
   * onto a section that has not arrived.
   */
  iris: [0.2, 0.86],
  /** The devices spiral into it. Each starts a little after the last. */
  fall: [0.26, 0.5],
  fallStagger: 0.03,
  /** The glow at the singularity rises, then gives way to the section. */
  core: [0.24, 0.48],
  coreOut: [0.5, 0.78],
} as const

/** Where the hole is, % of the stage. Shared with the stylesheet. */
export const BRIDGE_HOLE = { x: 50, y: 44 } as const

export const BRIDGE_DEVICES: readonly BridgeDeviceSpec[] = [
  {
    id: 'sampler',
    start: { x: 4, y: 128, scale: 1.05, rx: 62, ry: -40, rz: -16 },
    hover: { x: 14, y: 72, scale: 1.55, rx: 36, ry: 24, rz: -8 },
    sway: 14,
    swayPhase: 0,
  },
  {
    id: 'cassette',
    start: { x: 96, y: 118, scale: 1.05, rx: -34, ry: 46, rz: 14 },
    hover: { x: 86, y: 22, scale: 1.55, rx: -18, ry: -26, rz: 6 },
    sway: 12,
    swayPhase: 2.1,
  },
  {
    id: 'vinyl',
    start: { x: 70, y: 134, scale: 1, rx: 74, ry: 18, rz: 20 },
    hover: { x: 84, y: 76, scale: 1.6, rx: 48, ry: -14, rz: 24 },
    sway: 16,
    swayPhase: 4.2,
  },
] as const

export type BridgeDeviceFrame = {
  id: BridgeDeviceKind
  /** px from the stage's top-left. */
  x: number
  y: number
  scale: number
  opacity: number
  rx: number
  ry: number
  rz: number
  /** Degrees, for the reels and the record. */
  spin: number
}

export type BridgeFrame = {
  progress: number
  /** 0..1 clock for the statement's words. */
  statement: number
  /** The hole's radius, % of the stage diagonal. */
  iris: number
  /** 0..1, the light at the singularity. */
  core: number
  devices: BridgeDeviceFrame[]
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
const finite = (value: number, fallback: number) =>
  Number.isFinite(value) ? value : fallback
const lerp = (from: number, to: number, t: number) => from + (to - from) * t
const phase = (p: number, [start, end]: readonly [number, number]) =>
  clamp((p - start) / Math.max(1e-6, end - start), 0, 1)
const easeOut = (t: number) => 1 - (1 - t) ** 3
const easeIn = (t: number) => t * t * t
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
const smooth = (t: number) => {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}
/** `-0` is a real number and a real CSS token; never write one. */
const zero = (value: number) => (Object.is(value, -0) ? 0 : value)

export function bridgeFrame(
  progress: number,
  stageWidth: number,
  stageHeight: number,
): BridgeFrame {
  const p = clamp(finite(progress, 0), 0, 1)
  const width = Math.max(1, finite(stageWidth, 1440))
  const height = Math.max(1, finite(stageHeight, 900))
  const unit = clamp(width / 1440, 0.7, 1.3)

  const holeX = (BRIDGE_HOLE.x / 100) * width
  const holeY = (BRIDGE_HOLE.y / 100) * height

  const arrive = easeOut(phase(p, BRIDGE_PHASES.arrive))

  const devices = BRIDGE_DEVICES.map((spec, index): BridgeDeviceFrame => {
    const fallWindow: [number, number] = [
      BRIDGE_PHASES.fall[0] + index * BRIDGE_PHASES.fallStagger,
      BRIDGE_PHASES.fall[1] + index * BRIDGE_PHASES.fallStagger * 0.5,
    ]
    const fall = easeIn(phase(p, fallWindow))

    const pose = (key: keyof Pose) =>
      lerp(spec.start[key], spec.hover[key], arrive)

    const sway =
      Math.sin(p * Math.PI * 2 * 1.4 + spec.swayPhase) *
      spec.sway *
      unit *
      (1 - fall) *
      arrive

    // Hover position, then a polar fall about the hole: the radius shrinks to
    // nothing while the angle keeps turning, which is what makes it a spiral
    // and not a slide.
    const hx = (pose('x') / 100) * width + sway
    const hy = (pose('y') / 100) * height
    const dx = hx - holeX
    const dy = hy - holeY
    const radius = Math.hypot(dx, dy) * (1 - fall) ** 1.25
    const angle = Math.atan2(dy, dx) + fall * Math.PI * 3.4

    return {
      id: spec.id,
      x: zero(holeX + Math.cos(angle) * radius),
      y: zero(holeY + Math.sin(angle) * radius),
      scale: pose('scale') * unit * (1 - fall * 0.94),
      opacity: smooth(p / 0.05) * (1 - smooth((fall - 0.8) / 0.2)),
      rx: zero(
        pose('rx') +
          (1 - fall) * arrive * 18 * Math.sin(p * 9 + index) +
          fall * 380,
      ),
      ry: zero(pose('ry') + (1 - fall) * arrive * 22 * Math.sin(p * 7 + index)),
      rz: zero(pose('rz') + fall * 540),
      spin: zero(p * 900 + fall * 720),
    }
  })

  return {
    progress: p,
    statement: phase(p, BRIDGE_PHASES.arrive),
    iris: zero(easeInOut(phase(p, BRIDGE_PHASES.iris)) * 104),
    core: zero(
      smooth(phase(p, BRIDGE_PHASES.core)) *
        (1 - smooth(phase(p, BRIDGE_PHASES.coreOut))),
    ),
    devices,
  }
}
