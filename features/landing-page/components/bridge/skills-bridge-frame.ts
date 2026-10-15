/**
 * The bridge from About to Skills: pure frame maths.
 *
 * The About ends on a light sheet, the Skills section is a dark room, and this
 * scene is what makes them one object. It has four beats, in this order:
 *
 * 1. **The sentence.** "Every rule needs an instrument." arrives on the About's
 *    own sheet, and the three devices the About pinned beside its chapters (a
 *    sampler, a cassette and a record) fly in around it.
 * 2. **The hole.** The Skills' room opens from the middle of the sheet like an
 *    iris, a black hole with a lit rim, and eats the sentence. The three
 *    devices are drawn in: they fall toward its centre in a tightening spiral,
 *    tumbling faster as they go, and vanish at the singularity.
 * 3. **The stream.** Out of the hole comes the stack: every technology in the
 *    Skills section streams past the viewer on a tunnel of rings, the way
 *    stars do at warp. It decelerates as it arrives.
 * 4. **The plates.** Three frosted plates settle out of the depth, one for each
 *    group of the stack, and the scene hands over to the controller they
 *    belong to.
 *
 * The pairing of the About's practices with the stack's groups is the argument
 * and is authored, not decorative: INTERACTION (sampler) is FRONTEND, SYSTEMS
 * (cassette) is APP + DATA, PRODUCTION (record) is DELIVERY + INFRA.
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
  /** The hole opens from the centre of the sheet. */
  iris: [0.22, 0.5],
  /** The devices spiral into it. Each starts a little after the last. */
  fall: [0.26, 0.5],
  fallStagger: 0.03,
  /** The stream: how far the tunnel has travelled. */
  stream: [0.34, 0.9],
  /** The plates settle out of the depth. */
  plates: [0.68, 0.88],
  platesStagger: 0.04,
  /** The caption comes up last. */
  caption: [0.84, 0.95],
} as const

/** Where the hole is, % of the stage. Shared with the stylesheet. */
export const BRIDGE_HOLE = { x: 50, y: 44 } as const

/** The plates' row, % of the stage height. Shared with the stylesheet. */
export const BRIDGE_PLATE_Y = 60

/** The perspective the depth layers are drawn through, px. Shared with the stylesheet. */
export const BRIDGE_PERSPECTIVE = 900

/** How many rings the tunnel has. */
export const BRIDGE_RING_COUNT = 5

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

export type BridgeWordFrame = {
  /** px from the hole's centre; z is the depth along the tunnel. */
  x: number
  y: number
  z: number
  opacity: number
}

export type BridgePlateFrame = {
  z: number
  opacity: number
  /** 0 until the plate has settled, then 1: its LED. */
  lit: number
}

export type BridgeFrame = {
  progress: number
  /** 0..1 clock for the statement's words. */
  statement: number
  /** The hole's radius, % of the stage diagonal. */
  iris: number
  /** 0..1, the light at the singularity. */
  core: number
  caption: number
  devices: BridgeDeviceFrame[]
  words: BridgeWordFrame[]
  rings: { z: number; opacity: number }[]
  plates: BridgePlateFrame[]
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

/** The golden angle, so the words never line up in spokes. */
const GOLDEN = 2.399963229728653

/** Where the tunnel starts and how far it travels, px of depth. */
const TUNNEL_DEPTH = 2800
const TUNNEL_TRAVEL = 3000

export function bridgeFrame(
  progress: number,
  stageWidth: number,
  stageHeight: number,
  wordCount: number,
): BridgeFrame {
  const p = clamp(finite(progress, 0), 0, 1)
  const width = Math.max(1, finite(stageWidth, 1440))
  const height = Math.max(1, finite(stageHeight, 900))
  const count = Math.max(0, Math.floor(finite(wordCount, 0)))
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

  // The stream decelerates into its end: it arrives, it does not stop.
  const travel = easeOut(phase(p, BRIDGE_PHASES.stream)) * TUNNEL_TRAVEL
  const reach = Math.min(width, height) * 0.62

  const words = Array.from({ length: count }, (_, index): BridgeWordFrame => {
    const angle = index * GOLDEN
    const fraction = (index * 0.6180339887) % 1
    const rho = 0.3 + 0.62 * fraction
    const z0 =
      -TUNNEL_DEPTH + (index / Math.max(1, count)) * (TUNNEL_DEPTH - 500)
    const z = z0 + travel
    const far = smooth((z + 2300) / 700)
    const near = 1 - smooth((z - 180) / 360)
    return {
      x: zero(Math.cos(angle) * rho * reach),
      y: zero(Math.sin(angle) * rho * reach * 0.82),
      z,
      opacity: far * near * smooth(phase(p, BRIDGE_PHASES.stream) / 0.1),
    }
  })

  const rings = Array.from({ length: BRIDGE_RING_COUNT }, (_, index) => {
    const z =
      -TUNNEL_DEPTH + (index / BRIDGE_RING_COUNT) * TUNNEL_DEPTH + travel
    const far = smooth((z + 2300) / 700)
    const near = 1 - smooth((z - 120) / 360)
    return {
      z,
      opacity: far * near * smooth(phase(p, BRIDGE_PHASES.stream) / 0.1) * 0.55,
    }
  })

  const plates = [0, 1, 2].map((index): BridgePlateFrame => {
    const window: [number, number] = [
      BRIDGE_PHASES.plates[0] + index * BRIDGE_PHASES.platesStagger,
      BRIDGE_PHASES.plates[1] + index * BRIDGE_PHASES.platesStagger,
    ]
    const t = easeOut(phase(p, window))
    return {
      z: zero(-1200 * (1 - t)),
      opacity: t,
      lit: smooth((t - 0.9) / 0.1),
    }
  })

  return {
    progress: p,
    statement: phase(p, BRIDGE_PHASES.arrive),
    iris: zero(easeInOut(phase(p, BRIDGE_PHASES.iris)) * 104),
    core: smooth(phase(p, [0.3, 0.6])),
    caption: phase(p, BRIDGE_PHASES.caption),
    devices,
    words,
    rings,
    plates,
  }
}
