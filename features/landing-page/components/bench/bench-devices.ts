/**
 * The flying music devices: pure flight maths.
 *
 * Six small objects (a sampler, two records, a cassette, a knob and a player)
 * drift up through the gutters of the stage while the constraints assemble.
 * They are decoration and they say nothing: no label, no number, no claim.
 *
 * Like `bench-frame.ts`, this file owns every number and the DOM owns none. The
 * hook reads a frame per device and writes transforms and one custom property.
 * Nothing here knows about React, GSAP or the stylesheet.
 *
 * Three rules shape the table:
 *
 * - **They live in the gutters.** The ring owns the middle of the sheet, so the
 *   devices keep to the outer 14% either side, and paint *behind* the ring and
 *   the artifact. A device passing a chip reads as depth, never as a collision.
 * - **They dissolve before the principle line.** The principle owns the top
 *   band of the stage, so every device fades out as it climbs into it
 *   (`BENCH_DEVICE_CEILING`). Nothing flies through a sentence.
 * - **Depth is speed.** A nearer device travels further, tumbles faster and is
 *   drawn larger, which is what makes the layer read as parallax rather than as
 *   six sprites sharing one clock.
 */

export type BenchDeviceKind =
  | 'sampler'
  | 'vinyl'
  | 'cassette'
  | 'knob'
  | 'player'

export type BenchDeviceSpec = {
  id: string
  kind: BenchDeviceKind
  /** Horizontal anchor, % of the stage width. */
  x: number
  /** 0 = furthest back, 1 = closest. Drives scale and opacity. */
  depth: number
  /** Local-progress window the flight plays across. */
  window: readonly [number, number]
  /** Vertical anchor at the start and end of the flight, % of stage height. */
  y: readonly [number, number]
  /** Sideways sway, px at the base stage width, and its cycles per flight. */
  sway: number
  swayCycles: number
  swayPhase: number
  /** Orientation at the start of the flight, degrees. */
  tilt: { x: number; y: number; z: number }
  /** Extra rotation accumulated over the flight, degrees. */
  spin: { x: number; y: number; z: number }
}

/**
 * Below this height, as a % of the stage, a device is fading out.
 *
 * The principle line occupies roughly the first 13% of the stage; the fade
 * finishes at `CEILING` and starts `BENCH_DEVICE_CEILING_SOFT` points below it.
 */
export const BENCH_DEVICE_CEILING = 15
export const BENCH_DEVICE_CEILING_SOFT = 14

/** The share of a flight spent fading in. */
export const BENCH_DEVICE_FADE_IN = 0.14

export const BENCH_DEVICE_SCALE = { far: 0.7, near: 1.25 } as const
export const BENCH_DEVICE_OPACITY = { far: 0.55, near: 1 } as const

export const BENCH_DEVICES: readonly BenchDeviceSpec[] = [
  {
    id: 'sampler',
    kind: 'sampler',
    x: 7,
    depth: 0.9,
    window: [0.08, 0.44],
    y: [118, 18],
    sway: 26,
    swayCycles: 1.2,
    swayPhase: 0,
    tilt: { x: 58, y: -34, z: -14 },
    spin: { x: -46, y: 70, z: 22 },
  },
  {
    id: 'vinyl-a',
    kind: 'vinyl',
    x: 94,
    depth: 0.8,
    window: [0.1, 0.47],
    y: [122, 20],
    sway: 22,
    swayCycles: 1,
    swayPhase: 1.6,
    tilt: { x: 64, y: 22, z: 0 },
    spin: { x: 30, y: -80, z: 40 },
  },
  {
    id: 'cassette',
    kind: 'cassette',
    x: 12,
    depth: 0.45,
    window: [0.17, 0.5],
    y: [112, 24],
    sway: 18,
    swayCycles: 1.5,
    swayPhase: 3.1,
    tilt: { x: -28, y: 40, z: 12 },
    spin: { x: 24, y: -54, z: -26 },
  },
  {
    id: 'knob',
    kind: 'knob',
    x: 88,
    depth: 0.6,
    window: [0.13, 0.46],
    y: [116, 22],
    sway: 16,
    swayCycles: 1.3,
    swayPhase: 4.4,
    tilt: { x: 52, y: 18, z: 0 },
    spin: { x: -36, y: 90, z: 0 },
  },
  {
    id: 'player',
    kind: 'player',
    x: 4,
    depth: 0.3,
    window: [0.2, 0.52],
    y: [108, 26],
    sway: 12,
    swayCycles: 1,
    swayPhase: 2.2,
    tilt: { x: 18, y: -46, z: 8 },
    spin: { x: 20, y: 62, z: -18 },
  },
  {
    id: 'vinyl-b',
    kind: 'vinyl',
    x: 97,
    depth: 0.25,
    window: [0.22, 0.54],
    y: [110, 28],
    sway: 10,
    swayCycles: 0.8,
    swayPhase: 5.2,
    tilt: { x: 70, y: -18, z: 10 },
    spin: { x: -20, y: 50, z: 30 },
  },
] as const

export type BenchDeviceFrame = {
  id: string
  /** px, from the anchor's authored `left`. */
  x: number
  /** px, from the top of the stage. */
  y: number
  scale: number
  opacity: number
  rotateX: number
  rotateY: number
  rotateZ: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const finite = (value: number, fallback: number) =>
  Number.isFinite(value) ? value : fallback

const lerp = (from: number, to: number, t: number) => from + (to - from) * t

const smooth = (t: number) => t * t * (3 - 2 * t)

/** `-0` is a real number and a real CSS token; never write one. */
const zero = (value: number) => (Object.is(value, -0) ? 0 : value)

export function benchDeviceFrame(
  spec: BenchDeviceSpec,
  progress: number,
  stageHeight: number,
  unit: number,
): BenchDeviceFrame {
  const p = clamp(finite(progress, 0), 0, 1)
  const height = Math.max(1, finite(stageHeight, 760))
  const u = clamp(finite(unit, 1), 0.6, 2)

  const [start, end] = spec.window
  const t = clamp((p - start) / Math.max(1e-6, end - start), 0, 1)

  const yPct = lerp(spec.y[0], spec.y[1], t)
  const fadeIn = smooth(clamp(t / BENCH_DEVICE_FADE_IN, 0, 1))
  const ceiling = smooth(
    clamp((yPct - BENCH_DEVICE_CEILING) / BENCH_DEVICE_CEILING_SOFT, 0, 1),
  )
  // Before it starts and after it has gone, a device is not on the sheet.
  const live = p > start && p < end ? 1 : 0

  const scale = lerp(
    BENCH_DEVICE_SCALE.far,
    BENCH_DEVICE_SCALE.near,
    spec.depth,
  )
  const opacity = lerp(
    BENCH_DEVICE_OPACITY.far,
    BENCH_DEVICE_OPACITY.near,
    spec.depth,
  )

  return {
    id: spec.id,
    x: zero(
      Math.sin(t * Math.PI * 2 * spec.swayCycles + spec.swayPhase) *
        spec.sway *
        u,
    ),
    y: zero((yPct / 100) * height),
    scale: scale * u,
    opacity: opacity * fadeIn * ceiling * live,
    rotateX: zero(spec.tilt.x + spec.spin.x * t),
    rotateY: zero(spec.tilt.y + spec.spin.y * t),
    rotateZ: zero(spec.tilt.z + spec.spin.z * t),
  }
}

export const benchDeviceFrames = (
  progress: number,
  stageHeight: number,
  unit: number,
): BenchDeviceFrame[] =>
  BENCH_DEVICES.map((spec) =>
    benchDeviceFrame(spec, progress, stageHeight, unit),
  )
