import { MATTER_PHASES } from './matter-frame'

/**
 * The cast's groups.
 *
 * Grouping is *math metadata*, not a DOM wrapper. A group is a set of cast
 * members that leave the machine as one mechanism: the platter turns and then
 * slides, the mixer bank lifts as a single panel, the timeline clips keep their
 * lane, the patch cable follows its plug, and the keys cascade. Every part
 * belongs to exactly one group, and every group has exactly one departure
 * direction — which is what stops the scene reading as particle scatter.
 *
 * There are six groups and no more. The two secondary cast members are folded
 * into the groups they physically belong to rather than given a group of their
 * own: the cassette is a carrier of the timeline, and the headphones are an
 * accessory that plugs into the patch bay. See `FLIGHT_PARTS` below.
 */
export type FlightGroup =
  | 'platter'
  | 'mixer'
  | 'timeline'
  | 'patch'
  | 'keys'
  | 'resident'

/** Every valid group, for validation and iteration. */
export const FLIGHT_GROUPS: readonly FlightGroup[] = [
  'platter',
  'mixer',
  'timeline',
  'patch',
  'keys',
  'resident',
] as const

export type FlightPart = {
  id: string
  group: FlightGroup
  depth: number
  size: number
  home: { x: number; y: number }
  source?: string
  exit: { x: number; y: number }
  /**
   * A small offset applied to the part's home, in the group's direction.
   *
   * It is what keeps a group from looking rigid: two members with the same exit
   * and different local offsets leave as a spread panel rather than as a single
   * stamped shape. It is authored *along* the exit vector on purpose, so the
   * part's distance from home never decreases — the flight is monotonic by
   * construction rather than by tuning.
   */
  local: { x: number; y: number }
  rot: [number, number]
  window: [number, number]
  /**
   * How far into its own window this part waits before it starts to travel,
   * as a fraction of the window. It delays *position* only: the opacity ramp
   * still keys off the window's start, so a delayed part fades in where it is
   * and then goes, rather than appearing late and late-fading.
   */
  delay?: number
  resident?: boolean
}

export type FlightGeometry = { viewportWidth: number; viewportHeight: number }
export type FlightHome = { x: number; y: number }
export type FlightFrame = {
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
}

export const FLIGHT_PART_CAP = 14
export const FLIGHT_FADE_OUT: readonly [number, number] = [
  0.6,
  MATTER_PHASES.arrive[0],
]
export const FLIGHT_RESIDENT_EDGE = 0.06

const WAKE_FRACTION = 0.15
const ZERO: FlightHome = { x: 0, y: 0 }
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))
const fin = (v: number | undefined, f: number) =>
  typeof v === 'number' && Number.isFinite(v) ? v : f
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)
const easeIn = (t: number) => t * t
const easeOut = (t: number) => 1 - (1 - t) * (1 - t)
/**
 * Collapse `-0` to `0`.
 *
 * A negative zero is the same number, but it is not the same *value* to
 * `Object.is`, and it stringifies as `-0` — which would end up inside a
 * transform string. Normalising here keeps the frame comparable by value and
 * the written style clean.
 */
const unsignedZero = (value: number) => (value === 0 ? 0 : value)

/**
 * The departure direction of each group, as a unit vector.
 *
 * The parts reference these rather than restating a direction, so a group can
 * never drift out of alignment with itself — the "shared first movement
 * direction" property is structural, not a value that has to be kept in step by
 * hand.
 */
export const GROUP_ANCHORS: Record<FlightGroup, FlightHome> = {
  platter: { x: 0.94, y: -0.18 },
  mixer: { x: -0.55, y: -0.83 },
  timeline: { x: -0.62, y: -0.78 },
  patch: { x: -0.88, y: 0.48 },
  keys: { x: 0.28, y: 0.96 },
  resident: { x: 0, y: 0 },
}

/**
 * px — how far a whole group is allowed to bias its members off their homes
 * once it has begun to detach.
 *
 * This is the "one panel cluster" idea made arithmetic: every member of a group
 * shares this translation, on top of its own flight, so the group reads as one
 * mechanism rather than as members that happen to point the same way. It is
 * small against the exit travel on purpose — the cluster bias is a nudge, not
 * the flight.
 */
export const GROUP_ANCHOR_TRAVEL = 26

/**
 * The shared cluster bias for a group at a given progress.
 *
 * Zero until the departure begins, so no group is displaced while the machine
 * is still whole, and then eased in across the release. Pure, bounded, and
 * finite for any input.
 */
export function groupAnchorFor(
  group: FlightGroup,
  progress: number,
): FlightHome {
  const p = clamp(fin(progress, 0), 0, 1)
  const release = smooth(clamp((p - MATTER_PHASES.depart[1]) / 0.28, 0, 1))
  const bias = GROUP_ANCHORS[group] ?? ZERO
  return {
    x: unsignedZero(fin(bias.x, 0) * release * GROUP_ANCHOR_TRAVEL),
    y: unsignedZero(fin(bias.y, 0) * release * GROUP_ANCHOR_TRAVEL),
  }
}

export function flightBand(depth: number): 'far' | 'near' {
  return depth < 0.45 ? 'far' : 'near'
}

export function flightFrame(
  progress: number,
  part: FlightPart,
  geometry: FlightGeometry,
  home: FlightHome = part.home,
  groupAnchor: FlightHome = ZERO,
): FlightFrame {
  const p = clamp(fin(progress, 0), 0, 1)
  const vw = Math.max(1, fin(geometry.viewportWidth, 1))
  const vh = Math.max(1, fin(geometry.viewportHeight, 1))
  const d = clamp(fin(part.depth, 0), 0, 1)
  const local = part.local ?? ZERO
  // The local offset and the group bias are both part of the part's origin: the
  // flight is always measured from where this member actually sits inside its
  // cluster, not from a nominal home it never occupies.
  const hx = fin(home.x, 0) + fin(local.x, 0) + fin(groupAnchor.x, 0)
  const hy = fin(home.y, 0) + fin(local.y, 0) + fin(groupAnchor.y, 0)
  const [from, to] = part.window
  const span = Math.max(1e-6, to - from)
  const raw = clamp((p - from) / span, 0, 1)
  // Delay eats into the *travel* only. Opacity keeps keying off `from`, so a
  // delayed member still fades in at the window's start and never pops.
  const delay = clamp(fin(part.delay, 0), 0, 0.95)
  const staged = clamp((raw - delay) / Math.max(1e-6, 1 - delay), 0, 1)
  const t =
    d > 0.7 ? easeIn(staged) : d < 0.35 ? easeOut(staged) : smooth(staged)
  const size = Math.max(1, fin(part.size, 1))

  if (part.resident) {
    const finalScale = 1.12
    const targetX =
      0.5 * vw - (size * finalScale) / 2 - FLIGHT_RESIDENT_EDGE * vw
    const wakeEnd = from + span * WAKE_FRACTION
    const wake = smooth(
      clamp((p - from) / Math.max(1e-6, wakeEnd - from), 0, 1),
    )
    return {
      x: mix(hx, targetX, t),
      y: mix(hy, -0.4 * vh, t),
      scale: mix(1, 1.12, t),
      rotation: mix(part.rot[0], part.rot[1], t),
      opacity: p < from ? 0 : wake,
    }
  }

  const length = Math.hypot(part.exit.x, part.exit.y) || 1
  const dx = part.exit.x / length
  const dy = part.exit.y / length
  const clearance = Math.hypot(vw, vh) + size
  const x = mix(hx, dx * clearance, t)
  const y = mix(hy, dy * clearance, t)
  const wakeEnd = from + span * WAKE_FRACTION
  const wake = smooth(clamp((p - from) / Math.max(1e-6, wakeEnd - from), 0, 1))
  const tailStart = Math.max(from, to - span * 0.2)
  const tailFade =
    1 - smooth(clamp((p - tailStart) / Math.max(1e-6, to - tailStart), 0, 1))
  const fade =
    1 -
    clamp(
      (p - FLIGHT_FADE_OUT[0]) / (FLIGHT_FADE_OUT[1] - FLIGHT_FADE_OUT[0]),
      0,
      1,
    )
  const ceiling = mix(0.55, 1, d)

  return {
    x,
    y,
    scale: mix(1, mix(0.9, 2.6, d), t),
    rotation: mix(part.rot[0], part.rot[1], t),
    opacity: p < from || p > to ? 0 : wake * ceiling * tailFade * fade,
  }
}

/**
 * The cast, grouped.
 *
 * The cap is unchanged at fourteen: the device shell and the practice residue
 * are single nodes owned by the binder, not cast members, so the machine reads
 * as one object without the flight set growing. Exits are taken from
 * `GROUP_ANCHORS` so every member of a group leaves in the same direction by
 * construction; the local offsets and delays are what make a group spread
 * rather than stamp.
 */
export const FLIGHT_PARTS: readonly FlightPart[] = [
  // ── mixer: the left bank lifts as one panel ──────────────
  {
    id: 'knob-a',
    group: 'mixer',
    depth: 0.95,
    size: 190,
    home: { x: -120, y: -40 },
    exit: GROUP_ANCHORS.mixer,
    local: { x: -14, y: -22 },
    rot: [0, 140],
    window: [0.4, 0.58],
  },
  {
    id: 'pad-a',
    group: 'mixer',
    depth: 0.9,
    size: 170,
    home: { x: 180, y: 60 },
    exit: GROUP_ANCHORS.mixer,
    local: { x: -12, y: -18 },
    rot: [-10, -190],
    window: [0.41, 0.59],
    delay: 0.1,
  },
  {
    id: 'fader',
    group: 'mixer',
    depth: 0.85,
    size: 150,
    home: { x: 40, y: 90 },
    source: '[data-flight-source="fader"]',
    exit: GROUP_ANCHORS.mixer,
    local: { x: -10, y: -16 },
    rot: [0, 25],
    window: [0.42, 0.6],
    delay: 0.2,
  },
  // ── timeline: the clips keep their lane ──────────────────
  {
    id: 'clip-a',
    group: 'timeline',
    depth: 0.6,
    size: 150,
    home: { x: -260, y: -10 },
    source: '[data-matter-source]',
    exit: GROUP_ANCHORS.timeline,
    local: { x: -16, y: -20 },
    rot: [0, -24],
    window: [0.22, 0.58],
  },
  {
    id: 'clip-b',
    group: 'timeline',
    depth: 0.6,
    size: 140,
    home: { x: 260, y: 0 },
    exit: GROUP_ANCHORS.timeline,
    local: { x: -14, y: -18 },
    rot: [0, 18],
    window: [0.4, 0.6],
    delay: 0.12,
  },
  {
    id: 'cassette',
    group: 'timeline',
    depth: 0.55,
    size: 160,
    home: { x: 0, y: -70 },
    exit: GROUP_ANCHORS.timeline,
    local: { x: -12, y: -16 },
    rot: [0, -60],
    window: [0.44, 0.62],
    delay: 0.24,
  },
  // ── patch: the plug goes first, the cable follows ────────
  {
    id: 'cable',
    group: 'patch',
    depth: 0.5,
    size: 170,
    home: { x: -200, y: 70 },
    exit: GROUP_ANCHORS.patch,
    local: { x: -20, y: 10 },
    rot: [0, 40],
    window: [0.44, 0.62],
    delay: 0.34,
  },
  {
    id: 'phones',
    group: 'patch',
    depth: 0.5,
    size: 130,
    home: { x: -30, y: 20 },
    exit: GROUP_ANCHORS.patch,
    local: { x: -14, y: 8 },
    rot: [0, -12],
    window: [0.46, 0.62],
    delay: 0.18,
  },
  // ── platter: the record turns, then slides ───────────────
  {
    id: 'vinyl',
    group: 'platter',
    depth: 0.4,
    size: 260,
    home: { x: 120, y: -30 },
    exit: GROUP_ANCHORS.platter,
    local: { x: 18, y: -4 },
    rot: [0, 90],
    window: [0.4, 0.64],
  },
  // ── keys: one short cascade ──────────────────────────────
  {
    id: 'key-a',
    group: 'keys',
    depth: 0.25,
    size: 70,
    home: { x: -60, y: 40 },
    exit: GROUP_ANCHORS.keys,
    local: { x: 6, y: 20 },
    rot: [0, 30],
    window: [0.2, 0.64],
  },
  {
    id: 'key-b',
    group: 'keys',
    depth: 0.25,
    size: 64,
    home: { x: 90, y: 50 },
    exit: GROUP_ANCHORS.keys,
    local: { x: 5, y: 18 },
    rot: [0, -35],
    window: [0.21, 0.64],
    delay: 0.12,
  },
  {
    id: 'key-c',
    group: 'keys',
    depth: 0.22,
    size: 58,
    home: { x: 0, y: 30 },
    exit: GROUP_ANCHORS.keys,
    local: { x: 4, y: 16 },
    rot: [0, 20],
    window: [0.22, 0.65],
    delay: 0.24,
  },
  {
    id: 'jack',
    group: 'patch',
    depth: 0.3,
    size: 80,
    home: { x: 70, y: -10 },
    exit: GROUP_ANCHORS.patch,
    local: { x: -10, y: 5 },
    rot: [0, -80],
    window: [0.23, 0.64],
  },
  // ── resident: the playhead outlives the machine ──────────
  {
    id: 'playhead',
    group: 'resident',
    depth: 0.2,
    size: 120,
    home: { x: 0, y: 0 },
    source: '[data-flight-source="playhead"]',
    exit: GROUP_ANCHORS.resident,
    local: { x: 0, y: 0 },
    rot: [0, 0],
    window: [0.2, 0.65],
    resident: true,
  },
] as const
