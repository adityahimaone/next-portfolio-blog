/**
 * The pad sea, as arithmetic.
 *
 * Everything here is a pure function of scroll progress, time and the pointer,
 * with no `three` import, so the choreography can be unit-tested on the same
 * terms a sequencer is: does the wave stay inside its amplitude, does the calm
 * zone actually calm, do the camera keyframes land on their endpoints, does
 * lock-in produce exactly 24 distinct steps.
 *
 * `pad-field.tsx` is the only consumer that matters at runtime, but the numbers
 * live here so the scene file reads as render code rather than as tuning.
 */

export type PadCount = number

export type PadGrid = {
  cols: number
  rows: number
  /** Centre-to-centre distance. Pad bodies are a fraction of this. */
  spacing: number
  /**
   * Shifts the whole field along Z. Negative pushes it toward the horizon.
   *
   * The camera only ever looks down -Z from above, so the ground it can see
   * runs much further in front of it than behind it. Centring the grid leaves a
   * bare band at the top of the frame; offsetting it puts the field's far edge
   * past the point where fog has already swallowed it.
   */
  zOffset: number
}

export type PadLayoutItem = {
  index: number
  col: number
  row: number
  x: number
  z: number
}

/**
 * The field has to out-run the camera on every pose, so it is sized against the
 * worst case rather than the hero's resting frame: at scroll 0 the top of the
 * screen sees ground ~22 units away, and the dive puts the camera inside the
 * field. Rows therefore extend much further toward the horizon than behind the
 * camera, which is what `zOffset` is for.
 *
 * The phone grid is portrait because a landscape field on a 0.46 aspect ratio
 * is either cropped to three columns or pushed so far back that fog eats it.
 */
export const PAD_GRID_DESKTOP: PadGrid = {
  cols: 28,
  rows: 16,
  spacing: 1,
  zOffset: -4.5,
}
export const PAD_GRID_MOBILE: PadGrid = {
  cols: 14,
  rows: 20,
  spacing: 1.05,
  zOffset: -6,
}

/**
 * Fog, in world units. `far` is chosen so the field reaches full fog *before*
 * its own far edge: the surface dissolves into the background instead of
 * ending on a visible line at the top of the screen.
 */
export const FOG = { near: 5, far: 21, farPortrait: 26 } as const

/** Portrait viewports need a wider lens to hold the same number of columns. */
export const PORTRAIT_FOV_SCALE = 1.5

export function padCountFor(grid: PadGrid): PadCount {
  return grid.cols * grid.rows
}

/** Row/column grid centred on X and offset along Z, in the XZ plane. */
export function buildPadLayout(grid: PadGrid): PadLayoutItem[] {
  const items: PadLayoutItem[] = []
  const xOffset = ((grid.cols - 1) * grid.spacing) / 2
  const zCentre = ((grid.rows - 1) * grid.spacing) / 2

  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      items.push({
        index: items.length,
        col,
        row,
        x: col * grid.spacing - xOffset,
        z: row * grid.spacing - zCentre + grid.zOffset,
      })
    }
  }
  return items
}

/** Hermite smoothstep. The scroll choreography never wants a linear seam. */
export function smoothstep(
  edge0: number,
  edge1: number,
  value: number,
): number {
  if (edge1 === edge0) return value < edge0 ? 0 : 1
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** Smootherstep (Perlin's 6t^5 - 15t^4 + 10t^3): zero first *and* second derivative at both ends. */
export function smootherstep(
  edge0: number,
  edge1: number,
  value: number,
): number {
  if (edge1 === edge0) return value < edge0 ? 0 : 1
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

/* -------------------------------------------------------------------------
 * Wave
 * ---------------------------------------------------------------------- */

export type WaveOptions = {
  /** Peak displacement in world units at the field's edge. */
  amplitude: number
  /** 1 = smooth swell, higher = choppier. Driven by scroll velocity. */
  chop: number
}

const WAVE_PRIMARY = 0.55
const WAVE_SECONDARY = 0.42
const WAVE_DIAGONAL = 0.34
const WAVE_TIME = 0.9
const WAVE_TIME_SECONDARY = 0.72
const WAVE_TIME_DIAGONAL = 0.45

/**
 * Two crossed sines plus a slow diagonal — enough to read as a surface rather
 * than a rippling plane, cheap enough to evaluate 160 times a frame.
 */
export function waveHeight(
  x: number,
  z: number,
  time: number,
  { amplitude, chop }: WaveOptions,
): number {
  const spread = 1 + clamp01(chop) * 0.28
  const swell =
    0.62 * Math.sin(x * WAVE_PRIMARY * spread + time * WAVE_TIME) +
    0.38 * Math.cos(z * WAVE_SECONDARY * spread + time * WAVE_TIME_SECONDARY) +
    0.3 * Math.sin((x + z) * WAVE_DIAGONAL + time * WAVE_TIME_DIAGONAL)

  return amplitude * swell * (1 + clamp01(chop) * 0.5)
}

/**
 * The pad's tilt, taken from the analytic slope of `waveHeight` rather than
 * from its own rotation curve — that is what makes the field read as one
 * surface instead of as boxes that happen to bob.
 */
export function padTilt(
  x: number,
  z: number,
  time: number,
  { amplitude, chop }: WaveOptions,
): { tiltX: number; tiltZ: number } {
  const spread = 1 + clamp01(chop) * 0.28
  const gain = amplitude * (1 + clamp01(chop) * 0.5)

  const dx =
    gain *
    (0.62 *
      WAVE_PRIMARY *
      spread *
      Math.cos(x * WAVE_PRIMARY * spread + time * WAVE_TIME) +
      0.3 *
        WAVE_DIAGONAL *
        Math.cos((x + z) * WAVE_DIAGONAL + time * WAVE_TIME_DIAGONAL))
  const dz =
    gain *
    (-0.38 *
      WAVE_SECONDARY *
      spread *
      Math.sin(z * WAVE_SECONDARY * spread + time * WAVE_TIME_SECONDARY) +
      0.3 *
        WAVE_DIAGONAL *
        Math.cos((x + z) * WAVE_DIAGONAL + time * WAVE_TIME_DIAGONAL))

  return {
    tiltX: clampTilt(-Math.atan(dz)),
    tiltZ: clampTilt(Math.atan(dx)),
  }
}

const MAX_TILT = 0.52
function clampTilt(value: number): number {
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, value))
}

/**
 * The calm zone under the title: pads dip and their LEDs dim so the name keeps
 * its contrast without a scrim over the whole stage.
 *
 * The zone is centred where the name actually is, not at the world origin. The
 * name sits at 42% of the frame in landscape (which lands almost on the origin)
 * but at 31% in portrait, which is roughly 3.8 units further down the field —
 * a zone anchored at the origin left the brightest pads directly behind the
 * white line on a phone.
 */
export const CALM_ZONE = {
  inner: 3.4,
  outer: 6.6,
  dip: 0.18,
  led: 0.1,
  /** Dimming floor for the pad bodies inside the zone. */
  body: 0.3,
  centreZ: -0.5,
  centreZPortrait: -3.8,
}

export function calmFactor(
  x: number,
  z: number,
  zone: typeof CALM_ZONE = CALM_ZONE,
  centreZ: number = zone.centreZ,
): number {
  const distance = Math.hypot(x, z - centreZ)
  return smoothstep(zone.inner, zone.outer, distance)
}

/* -------------------------------------------------------------------------
 * Choreography
 * ---------------------------------------------------------------------- */

export type CameraKeyframe = {
  /** Scroll progress this pose sits at. */
  at: number
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  amplitude: number
}

/**
 * Five scenes over one hero: Boot, Swell, Dive, Calm, Lock-in.
 *
 * Dive drops the camera *between* the pads (y 0.35 against a 0.16-thick pad) so
 * the field becomes architecture, then Calm pulls straight up to plan view
 * before lock-in. The two positions keep a non-zero Z so `lookAt` never becomes
 * parallel to the default up vector, which is the classic top-down gimbal flip.
 */
export const CAMERA_KEYFRAMES: readonly CameraKeyframe[] = [
  {
    at: 0,
    position: [0, 5.6, 8.8],
    lookAt: [0, 0, 0.6],
    fov: 40,
    amplitude: 0.3,
  },
  {
    at: 0.15,
    position: [0, 4.4, 7.2],
    lookAt: [0, -0.1, 0],
    fov: 44,
    amplitude: 0.62,
  },
  {
    at: 0.4,
    position: [0, 2.6, 4.6],
    lookAt: [0, 0.1, -0.6],
    fov: 52,
    amplitude: 0.86,
  },
  {
    // The dive sits just above the pad tops rather than level with them. Level
    // with them the top faces are seen at a grazing angle and 160 pads read as
    // 160 slats; a little height keeps the surface legible while still putting
    // the camera down inside the field.
    at: 0.55,
    position: [0, 0.95, 1.9],
    lookAt: [0, 0.7, -3],
    fov: 62,
    amplitude: 0.56,
  },
  {
    at: 0.65,
    position: [0, 0.6, 0.95],
    lookAt: [0, 0.78, -3.2],
    fov: 64,
    amplitude: 0.3,
  },
  {
    // The climb back out is deliberately spread over four poses. Pulling from
    // y=0.6 to plan view in one segment puts an 8-unit whip into 7% of the
    // scroll, which reads as a teleport rather than as a crane shot.
    at: 0.72,
    position: [0, 2.6, 2.6],
    lookAt: [0, 0.2, -1.2],
    fov: 56,
    amplitude: 0.14,
  },
  {
    at: 0.76,
    position: [0, 4.6, 2.2],
    lookAt: [0, 0.15, -0.8],
    fov: 52,
    amplitude: 0.08,
  },
  {
    at: 0.8,
    position: [0, 7.2, 1.7],
    lookAt: [0, 0.05, -0.3],
    fov: 48,
    amplitude: 0.02,
  },
  {
    // Water is dead and the rig is overhead before the lock-in starts, so the
    // last quarter of the scroll has one thing happening rather than three
    // overlapping ones: the step grid forming on a still surface. The crane is
    // spread over six poses because compressing it into two put a 4.6-unit
    // whip into 2% of the scroll.
    at: 0.84,
    position: [0, 9.8, 1.3],
    lookAt: [0, 0, 0],
    fov: 42,
    amplitude: 0,
  },
  {
    at: 0.88,
    position: [0, 11.6, 0.9],
    lookAt: [0, 0, 0],
    fov: 38,
    amplitude: 0,
  },
  {
    at: 0.92,
    position: [0, 12.3, 0.6],
    lookAt: [0, 0, 0],
    fov: 34,
    amplitude: 0,
  },
  {
    at: 1,
    position: [0, 12.6, 0.5],
    lookAt: [0, 0, 0],
    fov: 33,
    amplitude: 0,
  },
]

export type CameraPose = {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  amplitude: number
}

/** Eased pose for a scroll progress. Values outside [0,1] clamp to the ends. */
export function cameraAt(
  progress: number,
  keys: readonly CameraKeyframe[] = CAMERA_KEYFRAMES,
): CameraPose {
  const p = clamp01(progress)

  let upper = 1
  while (upper < keys.length - 1 && p > keys[upper].at) upper += 1
  const to = keys[upper]
  const from = keys[Math.max(0, upper - 1)]
  const span = to.at - from.at
  const raw = span <= 0 ? 1 : (p - from.at) / span
  const t = smootherstep(0, 1, clamp01(raw))

  return {
    position: [
      lerp(from.position[0], to.position[0], t),
      lerp(from.position[1], to.position[1], t),
      lerp(from.position[2], to.position[2], t),
    ],
    lookAt: [
      lerp(from.lookAt[0], to.lookAt[0], t),
      lerp(from.lookAt[1], to.lookAt[1], t),
      lerp(from.lookAt[2], to.lookAt[2], t),
    ],
    fov: lerp(from.fov, to.fov, t),
    amplitude: lerp(from.amplitude, to.amplitude, t),
  }
}

/* -------------------------------------------------------------------------
 * Lock-in
 * ---------------------------------------------------------------------- */

export const LOCK_IN_STEPS = { cols: 8, rows: 3, spacing: 0.86 } as const
export const LOCK_IN_COUNT = LOCK_IN_STEPS.cols * LOCK_IN_STEPS.rows

/**
 * Where slot `index` of the 8x3 step grid sits, in world units. Slots are
 * numbered left-to-right, top-to-bottom.
 */
export function lockInTarget(index: number): { x: number; z: number } {
  const { cols, rows, spacing } = LOCK_IN_STEPS
  const safe = ((index % LOCK_IN_COUNT) + LOCK_IN_COUNT) % LOCK_IN_COUNT
  const col = safe % cols
  const row = Math.floor(safe / cols)
  const xOffset = ((cols - 1) * spacing) / 2
  const zOffset = ((rows - 1) * spacing) / 2

  return {
    x: col * spacing - xOffset,
    z: row * spacing - zOffset,
  }
}

export type LockInPlan = {
  /** Pad index -> where it snaps. Pads absent from the map scale away. */
  targets: Map<number, { x: number; z: number }>
  /** The same pads in grid order; slot `n` is `order[n]`. */
  order: number[]
}

/**
 * The grid forms from the pads nearest the middle, not from index 0, so the
 * handoff reads as the field condensing rather than as the top-left corner
 * flying into the frame. Survivors keep their reading order, which is what
 * makes the result a grid instead of a tangle.
 */
export function planLockIn(layout: readonly PadLayoutItem[]): LockInPlan {
  const chosen = [...layout]
    .sort((a, b) => {
      const da = a.x * a.x + a.z * a.z
      const db = b.x * b.x + b.z * b.z
      return da - db || a.index - b.index
    })
    .slice(0, LOCK_IN_COUNT)
    .sort((a, b) => a.row - b.row || a.col - b.col)

  const targets = new Map<number, { x: number; z: number }>()
  const order: number[] = []
  chosen.forEach((pad, slot) => {
    targets.set(pad.index, lockInTarget(slot))
    order.push(pad.index)
  })

  return { targets, order }
}

/**
 * 0 before the handoff, 1 once the grid has snapped.
 *
 * Finishes at 0.92, not 0.99, so the step grid is already formed and still
 * while the About panel finishes rising. Previously the snap and the panel
 * arrival were still resolving at the same time in the last 5% of the scroll.
 */
export function lockInBlend(progress: number): number {
  return smootherstep(0.76, 0.92, progress)
}

/** Which step LEDs are lit once locked, as a small eight-step pattern. */
export function lockInStepLit(col: number, row: number): boolean {
  return (col + row * 3) % 3 !== 2
}

/* -------------------------------------------------------------------------
 * Boot, ripple, press
 * ---------------------------------------------------------------------- */

export const BOOT = { rowDelay: 0.09, rowDuration: 0.5 } as const

/** How long the field holds one colour after the sweep, then how fast the bank arrives. */
export const PALETTE_REVEAL = { hold: 0.35, duration: 1.6 } as const

/** Row-by-row power-on, 0..1. `elapsed` is seconds since the field mounted. */
export function bootGlow(row: number, elapsed: number): number {
  const start = row * BOOT.rowDelay
  return smoothstep(start, start + BOOT.rowDuration, elapsed)
}

/**
 * 0 while the field is booting in one colour, 1 once the Contact bank has
 * arrived. A device powers on in a single colour; the sixteen-key bank is what
 * it becomes. Keyed off the row count because the sweep is row-by-row.
 */
export function paletteReveal(rows: number, elapsed: number): number {
  const bootDone = Math.max(0, rows - 1) * BOOT.rowDelay + BOOT.rowDuration
  const start = bootDone + PALETTE_REVEAL.hold
  return smoothstep(start, start + PALETTE_REVEAL.duration, elapsed)
}

/**
 * A strike's ring. The field does not follow the cursor, so this only ever
 * fires when a pad is hit: `distance` is world-space distance from the struck
 * pad, and the ring expands at `speed` and fades over `life`.
 */
export function rippleAt(
  distance: number,
  age: number,
  {
    speed = 6.5,
    width = 1.1,
    life = 1.1,
    strength = 0.5,
  }: { speed?: number; width?: number; life?: number; strength?: number } = {},
): number {
  if (age < 0 || age > life) return 0
  const radius = age * speed
  const falloff = 1 - age / life
  const ring = Math.exp(-((distance - radius) ** 2) / (width * width))
  return ring * falloff * strength
}

/**
 * A pad that has been struck: it compresses, springs back, and settles.
 * `age` is seconds since the hit.
 */
export function pressAt(age: number): number {
  if (age < 0) return 0
  if (age > 1.4) return 0
  const envelope = Math.exp(-age * 6.5)
  return Math.cos(age * 18) * envelope
}

/** Voltage that bleeds off the last scroll gesture. */
export function decayEnergy(
  current: number,
  target: number,
  dt: number,
): number {
  const rate = 1 - Math.exp(-dt * 3.4)
  return current + (target - current) * rate
}

/** Scroll speed in px/s to a 0..1 chop factor. */
export function energyFromVelocity(velocity: number): number {
  return clamp01(Math.abs(velocity) / 2600)
}
