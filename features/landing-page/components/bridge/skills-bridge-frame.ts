/**
 * The bridge from About to Skills: pure frame maths.
 *
 * The About ends on a light sheet, the Skills section is a dark room, and the
 * two used to be separated by a ticker. This scene is the thing that makes them
 * one object. The three devices the About pinned beside its chapters (a
 * sampler, a cassette and a record) leave the sheet, the sheet is eaten from
 * its centre by the room, and the devices dock into three rack slots whose
 * labels are the three groups of the stack. Cables then run from the slots out
 * of the bottom of the scene, into the controller that the Skills section is.
 *
 * The pairing is the argument, so it is authored, not decorative:
 *
 * - INTERACTION (sampler)  ->  FRONTEND
 * - SYSTEMS (cassette)     ->  APP + DATA
 * - PRODUCTION (record)    ->  DELIVERY + INFRA
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
  /** Where it hovers while the sheet is being eaten. */
  hover: Pose
  /** The slot it docks into, face on. */
  dock: Pose
  /** Sway at the hover, px at the base stage width. */
  sway: number
  swayPhase: number
}

export const BRIDGE_PHASES = {
  /** The statement arrives, word by word, and the devices fly in. */
  arrive: [0, 0.28],
  /** The room opens from the centre of the sheet. */
  iris: [0.3, 0.58],
  /** The rack slots appear inside the room. */
  rack: [0.46, 0.62],
  /** Each device docks; the next one starts a little after the last. */
  dock: [0.5, 0.76],
  dockStagger: 0.05,
  /** A cable is drawn out of a slot only once that slot's device has docked. */
  cables: [0.78, 0.9],
  cableStagger: 0.05,
  /** The caption comes up last, once everything is in place. */
  caption: [0.8, 0.92],
} as const

/** The slot row's height, % of the stage. Shared with the stylesheet. */
export const BRIDGE_SLOT_Y = 47

export const BRIDGE_DEVICES: readonly BridgeDeviceSpec[] = [
  {
    id: 'sampler',
    start: { x: 4, y: 128, scale: 1.05, rx: 62, ry: -40, rz: -16 },
    hover: { x: 11, y: 72, scale: 1.55, rx: 36, ry: 24, rz: -8 },
    dock: { x: 20, y: BRIDGE_SLOT_Y, scale: 1.9, rx: 0, ry: 0, rz: 0 },
    sway: 14,
    swayPhase: 0,
  },
  {
    id: 'cassette',
    start: { x: 96, y: 118, scale: 1.05, rx: -34, ry: 46, rz: 14 },
    hover: { x: 89, y: 24, scale: 1.55, rx: -18, ry: -26, rz: 6 },
    dock: { x: 50, y: BRIDGE_SLOT_Y, scale: 2, rx: 0, ry: 0, rz: 0 },
    sway: 12,
    swayPhase: 2.1,
  },
  {
    id: 'vinyl',
    start: { x: 70, y: 134, scale: 1, rx: 74, ry: 18, rz: 20 },
    hover: { x: 88, y: 76, scale: 1.6, rx: 48, ry: -14, rz: 24 },
    dock: { x: 80, y: BRIDGE_SLOT_Y, scale: 1.95, rx: 0, ry: 0, rz: 0 },
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
  /** 0 until the device has docked, then 1: the slot's LED. */
  lit: number
  /** 0..1, how much of this device's cable is drawn. */
  cable: number
}

export type BridgeFrame = {
  progress: number
  /** 0..1 clock for the statement's words. */
  statement: number
  /** The room's radius, % of the stage diagonal. */
  iris: number
  rack: number
  caption: number
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
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
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

  const arrive = easeOut(phase(p, BRIDGE_PHASES.arrive))
  const devices = BRIDGE_DEVICES.map((spec, index): BridgeDeviceFrame => {
    const dockWindow: [number, number] = [
      BRIDGE_PHASES.dock[0] + index * BRIDGE_PHASES.dockStagger,
      BRIDGE_PHASES.dock[1] + index * BRIDGE_PHASES.dockStagger,
    ]
    const dock = easeInOut(phase(p, dockWindow))
    const cableWindow: [number, number] = [
      BRIDGE_PHASES.cables[0] + index * BRIDGE_PHASES.cableStagger,
      BRIDGE_PHASES.cables[1] + index * BRIDGE_PHASES.cableStagger,
    ]

    const pose = (key: keyof Pose) => {
      const flown = lerp(spec.start[key], spec.hover[key], arrive)
      return lerp(flown, spec.dock[key], dock)
    }

    // The hover is alive until it is told to dock: a sway that dies with `dock`
    // so the device arrives still, not mid-wobble.
    const sway =
      Math.sin(p * Math.PI * 2 * 1.4 + spec.swayPhase) *
      spec.sway *
      unit *
      (1 - dock) *
      arrive

    return {
      id: spec.id,
      x: zero((pose('x') / 100) * width + sway),
      y: zero((pose('y') / 100) * height),
      scale: pose('scale') * unit,
      opacity: smoothIn(p / 0.05),
      rx: zero(pose('rx') + (1 - dock) * arrive * 18 * Math.sin(p * 9 + index)),
      ry: zero(pose('ry') + (1 - dock) * arrive * 22 * Math.sin(p * 7 + index)),
      rz: zero(pose('rz')),
      lit: smoothIn((dock - 0.9) / 0.1),
      cable: phase(p, cableWindow),
    }
  })

  return {
    progress: p,
    statement: phase(p, BRIDGE_PHASES.arrive),
    iris: zero(easeInOut(phase(p, BRIDGE_PHASES.iris)) * 104),
    rack: phase(p, BRIDGE_PHASES.rack),
    caption: phase(p, BRIDGE_PHASES.caption),
    devices,
  }
}

function smoothIn(t: number) {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}
