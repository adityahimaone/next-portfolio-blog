import {
  BOOT,
  CAMERA_KEYFRAMES,
  LOCK_IN_COUNT,
  PAD_GRID_DESKTOP,
  PAD_GRID_MOBILE,
  PALETTE_REVEAL,
  bootGlow,
  buildPadLayout,
  calmFactor,
  cameraAt,
  energyFromVelocity,
  lockInBlend,
  lockInStepLit,
  lockInTarget,
  padCountFor,
  padTilt,
  paletteReveal,
  planLockIn,
  pressAt,
  rippleAt,
  smoothstep,
  waveHeight,
} from '@/features/landing-page/components/hero/pad-sea/pad-field-math'

const NO_CHOP = { amplitude: 0.6, chop: 0 }

describe('pad layout', () => {
  it('lays out 448 pads on the 28x16 desktop grid', () => {
    const layout = buildPadLayout(PAD_GRID_DESKTOP)
    expect(layout).toHaveLength(448)
    expect(padCountFor(PAD_GRID_DESKTOP)).toBe(448)
  })

  it('lays out 280 pads on the 14x20 phone grid', () => {
    expect(buildPadLayout(PAD_GRID_MOBILE)).toHaveLength(280)
  })

  it('is wide enough to cover the far corners, not just the middle', () => {
    const layout = buildPadLayout(PAD_GRID_DESKTOP)
    const xs = layout.map((pad) => pad.x)
    // At the resting camera the top of the frame sees ground ~14 units either
    // side of centre; a field narrower than that leaves bare corners.
    expect(Math.max(...xs)).toBeGreaterThan(13)
    expect(Math.min(...xs)).toBeLessThan(-13)
  })

  it('centres the field on X and pushes it toward the horizon on Z', () => {
    const layout = buildPadLayout(PAD_GRID_DESKTOP)
    const centre = layout.reduce(
      (sum, pad) => [sum[0] + pad.x, sum[1] + pad.z],
      [0, 0],
    )
    expect(Math.abs(centre[0])).toBeLessThan(1e-9)
    expect(centre[1] / layout.length).toBeCloseTo(PAD_GRID_DESKTOP.zOffset, 6)
  })

  it('runs much further in front of the camera than behind it', () => {
    const layout = buildPadLayout(PAD_GRID_DESKTOP)
    const zs = layout.map((pad) => pad.z)
    // The far edge has to clear the point where fog reaches full strength
    // (ground at FOG.far from the resting camera lands near z = -11.4), or the
    // top of the screen shows the field simply ending.
    expect(Math.min(...zs)).toBeLessThanOrEqual(-12)
    expect(Math.max(...zs)).toBeLessThan(8)
  })

  it('gives every pad a distinct cell and a dense index', () => {
    const layout = buildPadLayout(PAD_GRID_DESKTOP)
    const keys = new Set(layout.map((pad) => `${pad.col}:${pad.row}`))
    expect(keys.size).toBe(layout.length)
    layout.forEach((pad, index) => expect(pad.index).toBe(index))
  })

  it('puts the first row at the top of the field, not in the middle', () => {
    const layout = buildPadLayout(PAD_GRID_DESKTOP)
    const firstRow = layout.filter((pad) => pad.row === 0)
    const lastRow = layout.filter(
      (pad) => pad.row === PAD_GRID_DESKTOP.rows - 1,
    )
    expect(firstRow.every((pad) => pad.z < 0)).toBe(true)
    expect(lastRow.every((pad) => pad.z > 0)).toBe(true)
  })
})

describe('wave', () => {
  it('stays inside its amplitude envelope', () => {
    const layout = buildPadLayout(PAD_GRID_DESKTOP)
    for (const pad of layout) {
      for (let t = 0; t < 12; t += 0.37) {
        const h = waveHeight(pad.x, pad.z, t, NO_CHOP)
        // 0.62 + 0.38 + 0.30 is the largest the three sines can sum to.
        expect(Math.abs(h)).toBeLessThanOrEqual(0.6 * 1.301)
      }
    }
  })

  it('is still water at zero amplitude', () => {
    expect(waveHeight(3, -2, 1.7, { amplitude: 0, chop: 0 })).toBe(0)
  })

  it('chops harder when the scroll is fast', () => {
    const layout = buildPadLayout(PAD_GRID_DESKTOP)
    const rms = (chop: number) => {
      let total = 0
      let count = 0
      for (const pad of layout) {
        for (let t = 0; t < 4; t += 0.4) {
          const h = waveHeight(pad.x, pad.z, t, { amplitude: 0.6, chop })
          total += h * h
          count += 1
        }
      }
      return Math.sqrt(total / count)
    }
    // Choppiness is a property of the whole field, not of one sample: raising
    // the spatial frequency moves individual pads either way.
    expect(rms(1)).toBeGreaterThan(rms(0))
  })

  it('tilts pads with the surface slope, within the clamp', () => {
    const layout = buildPadLayout(PAD_GRID_DESKTOP)
    for (const pad of layout) {
      const { tiltX, tiltZ } = padTilt(pad.x, pad.z, 2.1, {
        amplitude: 0.86,
        chop: 1,
      })
      expect(Number.isFinite(tiltX)).toBe(true)
      expect(Number.isFinite(tiltZ)).toBe(true)
      expect(Math.abs(tiltX)).toBeLessThanOrEqual(0.5201)
      expect(Math.abs(tiltZ)).toBeLessThanOrEqual(0.5201)
    }
  })

  it('flattens as the amplitude falls to zero', () => {
    const { tiltX, tiltZ } = padTilt(2, -1, 3, { amplitude: 0, chop: 0 })
    expect(tiltX).toBeCloseTo(0, 6)
    expect(tiltZ).toBeCloseTo(0, 6)
  })
})

describe('calm zone', () => {
  it('dips under the title and leaves the edges alone', () => {
    expect(calmFactor(0, 0)).toBe(0)
    expect(calmFactor(1.5, -1)).toBe(0)
    expect(calmFactor(9, 6)).toBe(1)
  })

  it('increases monotonically with distance from the centre', () => {
    let previous = -1
    for (let r = 0; r < 9; r += 0.25) {
      const value = calmFactor(r, 0)
      expect(value).toBeGreaterThanOrEqual(previous)
      previous = value
    }
  })

  it('is the identity at the edges, so the swell still reads', () => {
    const edge = calmFactor(7, 0)
    expect(edge).toBe(1)
  })
})

describe('camera choreography', () => {
  it('starts and ends on the declared keyframes', () => {
    expect(cameraAt(0).position).toEqual(CAMERA_KEYFRAMES[0].position)
    expect(cameraAt(0).fov).toBe(CAMERA_KEYFRAMES[0].fov)
    const last = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1]
    expect(cameraAt(1).position).toEqual(last.position)
    expect(cameraAt(1).amplitude).toBe(last.amplitude)
  })

  it('clamps progress from scroll bounce', () => {
    expect(cameraAt(-0.4).position).toEqual(CAMERA_KEYFRAMES[0].position)
    expect(cameraAt(1.6).amplitude).toBe(
      CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1].amplitude,
    )
  })

  it('rises through the swell, dives, then returns to plan view', () => {
    expect(cameraAt(0.4).amplitude).toBeGreaterThan(cameraAt(0).amplitude)
    // The dive puts the camera below the pad tops for the first time.
    expect(cameraAt(0.66).position[1]).toBeLessThan(1)
    // Calm is a top-down view again, well above the field, and the water is
    // already dead by the time the rig gets there.
    expect(cameraAt(0.95).position[1]).toBeGreaterThan(10)
    expect(cameraAt(0.88).amplitude).toBeLessThan(0.03)
    expect(cameraAt(1).amplitude).toBe(0)
  })

  it('never lets the camera look straight down the up vector', () => {
    for (let p = 0; p <= 1; p += 0.005) {
      const { position, lookAt } = cameraAt(p)
      const dx = lookAt[0] - position[0]
      const dz = lookAt[2] - position[2]
      // A top-down camera whose look-at sits directly below its position is a
      // gimbal flip waiting for floating-point noise.
      expect(Math.hypot(dx, dz)).toBeGreaterThan(0.2)
    }
  })

  it('is continuous: no frame jumps across a keyframe boundary', () => {
    let previous = cameraAt(0)
    let maxStep = 0
    for (let p = 0.001; p <= 1; p += 0.001) {
      const pose = cameraAt(p)
      const step = Math.hypot(
        pose.position[0] - previous.position[0],
        pose.position[1] - previous.position[1],
        pose.position[2] - previous.position[2],
      )
      maxStep = Math.max(maxStep, step)
      previous = pose
    }
    // 0.001 of hero scroll is well under a pixel of travel; a step this large
    // would be a cut, not an eased move.
    expect(maxStep).toBeLessThan(0.15)
  })
})

describe('lock-in', () => {
  const layout = buildPadLayout(PAD_GRID_DESKTOP)

  it('keeps exactly 24 pads and fades the rest', () => {
    const plan = planLockIn(layout)
    expect(plan.targets.size).toBe(LOCK_IN_COUNT)
    expect(plan.order).toHaveLength(LOCK_IN_COUNT)
    const faded = layout.filter((pad) => !plan.targets.has(pad.index))
    expect(faded).toHaveLength(layout.length - LOCK_IN_COUNT)
  })

  it('snaps them to 8 distinct columns and 3 distinct rows', () => {
    const targets = [...planLockIn(layout).targets.values()]
    expect(new Set(targets.map((t) => t.x.toFixed(6))).size).toBe(8)
    expect(new Set(targets.map((t) => t.z.toFixed(6))).size).toBe(3)
  })

  it('forms the grid from the middle of the field, not a corner', () => {
    const plan = planLockIn(layout)
    const nearest = [...layout].sort(
      (a, b) =>
        a.x * a.x + a.z * a.z - (b.x * b.x + b.z * b.z) || a.index - b.index,
    )[0]
    expect(plan.targets.has(nearest.index)).toBe(true)
    // ...and the field's actual corners do not survive.
    const corner = layout.find((pad) => pad.col === 0 && pad.row === 0)!
    expect(plan.targets.has(corner.index)).toBe(false)
  })

  it('gives every survivor a slot, and every slot a survivor', () => {
    const plan = planLockIn(layout)
    expect(new Set(plan.order).size).toBe(LOCK_IN_COUNT)
    plan.order.forEach((index, slot) => {
      expect(plan.targets.get(index)).toEqual(lockInTarget(slot))
    })
  })

  it('is deterministic and independent of layout order', () => {
    const reversed = [...layout].reverse()
    expect(planLockIn(reversed).order).toEqual(planLockIn(layout).order)
  })

  it('hands over in the last quarter, and is settled before the scroll ends', () => {
    expect(lockInBlend(0.7)).toBe(0)
    expect(lockInBlend(0.76)).toBe(0)
    expect(lockInBlend(0.92)).toBe(1)
    // The grid has stopped moving while the About panel is still rising.
    expect(lockInBlend(0.96)).toBe(1)
    expect(lockInBlend(1)).toBe(1)
  })

  it('lights the step grid unevenly, like a pattern rather than a block', () => {
    const lit = new Set<boolean>()
    for (let col = 0; col < 8; col += 1) {
      for (let row = 0; row < 3; row += 1) lit.add(lockInStepLit(col, row))
    }
    expect(lit).toEqual(new Set([true, false]))
  })
})

describe('boot, ripple and press', () => {
  it('lights rows in order', () => {
    expect(bootGlow(0, 0)).toBe(0)
    expect(bootGlow(0, BOOT.rowDuration)).toBe(1)
    // The last row is still dark when the first is fully lit.
    expect(bootGlow(9, BOOT.rowDuration)).toBeLessThan(
      bootGlow(0, BOOT.rowDuration),
    )
    expect(bootGlow(9, 9 * BOOT.rowDelay + BOOT.rowDuration)).toBe(1)
  })

  it('boots the field in one colour, then releases the bank', () => {
    const rows = 18
    // Palette reveal now starts at `hold` (0.1s) and finishes at `hold+duration` (0.9s),
    // so colours fan out *during* the boot sweep, not after.
    expect(paletteReveal(rows, 0)).toBe(0)
    // At the middle of the reveal (0.5s), it's already halfway.
    expect(paletteReveal(rows, 0.5)).toBeGreaterThanOrEqual(0.5)
    expect(paletteReveal(rows, PALETTE_REVEAL.hold + PALETTE_REVEAL.duration)).toBe(1)
    // And it only ever moves one way.
    let previous = -1
    for (let t = 0; t < 8; t += 0.1) {
      const value = paletteReveal(rows, t)
      expect(value).toBeGreaterThanOrEqual(previous)
      previous = value
    }
  })

  it('sends a ring outward from a struck pad, and then stops', () => {
    const atPointer = rippleAt(0, 0)
    const onTheRing = rippleAt(3.25, 0.5)
    const aheadOfTheRing = rippleAt(6.5, 0.1)
    expect(atPointer).toBeGreaterThan(0)
    expect(onTheRing).toBeGreaterThan(aheadOfTheRing)
    expect(rippleAt(1, 1.11)).toBe(0)
    expect(rippleAt(1, -0.1)).toBe(0)
  })

  it('compresses on the hit and settles', () => {
    expect(pressAt(0)).toBeCloseTo(1, 6)
    expect(Math.abs(pressAt(0.5))).toBeLessThan(0.2)
    expect(pressAt(1.5)).toBe(0)
    expect(pressAt(-1)).toBe(0)
  })

  it('turns scroll speed into bounded energy', () => {
    expect(energyFromVelocity(0)).toBe(0)
    expect(energyFromVelocity(-1300)).toBeCloseTo(0.5, 6)
    expect(energyFromVelocity(99_000)).toBe(1)
  })

  it('keeps smoothstep pinned outside its edges', () => {
    expect(smoothstep(0, 1, -2)).toBe(0)
    expect(smoothstep(0, 1, 2)).toBe(1)
    expect(smoothstep(1, 1, 1)).toBe(1)
  })
})
