import {
  PATCH_STAGGER,
  controlSweep,
  knobAngle,
  patchFrame,
} from '@/features/landing-page/components/patch/patch-timeline'

describe('patchFrame', () => {
  it('is dark at the start and fully settled at the end', () => {
    const a = patchFrame(0)
    expect(a.power).toBe(0)
    expect(a.sweep).toEqual([0, 0, 0])
    const z = patchFrame(1)
    expect(z.bounce).toBe(1)
    expect(z.sweep).toEqual([1, 1, 1])
  })
  it('walks the three modules in order and never past the last', () => {
    // Boundaries fall at 0.12 + 0.76/3 = 0.3733 and 0.12 + 2 * 0.76/3 = 0.6267.
    const seen = [0.13, 0.37, 0.38, 0.62, 0.63, 0.99, 5].map(
      (t) => patchFrame(t).active,
    )
    expect(seen).toEqual([0, 0, 1, 1, 2, 2, 2])
    for (let t = 0; t <= 1; t += 0.01)
      expect(patchFrame(t).active).toBeGreaterThanOrEqual(0)
  })
  it('is monotonic in every channel', () => {
    let prev = patchFrame(0)
    for (let t = 0.01; t <= 1.0001; t += 0.01) {
      const f = patchFrame(t)
      expect(f.power).toBeGreaterThanOrEqual(prev.power)
      expect(f.bounce).toBeGreaterThanOrEqual(prev.bounce)
      expect(f.cursor).toBeGreaterThanOrEqual(prev.cursor)
      f.sweep.forEach((s, i) => expect(s).toBeGreaterThanOrEqual(prev.sweep[i]))
      prev = f
    }
  })
  it('clamps out-of-range input instead of extrapolating', () => {
    expect(patchFrame(-3)).toEqual(patchFrame(0))
    expect(patchFrame(9)).toEqual(patchFrame(1))
  })
})

describe('controlSweep', () => {
  it('lands every control on its value when the sweep ends', () => {
    for (const n of [4, 6])
      for (let i = 0; i < n; i++) expect(controlSweep(i, n, 1)).toBe(1)
  })
  it('starts later controls later', () => {
    expect(controlSweep(0, 4, PATCH_STAGGER)).toBeGreaterThan(0)
    expect(controlSweep(3, 4, PATCH_STAGGER)).toBe(0)
  })
})

describe('knobAngle', () => {
  it('sweeps 270 degrees', () => {
    expect(knobAngle(0)).toBe(-135)
    expect(knobAngle(1)).toBe(135)
    expect(knobAngle(0.5)).toBe(0)
    expect(knobAngle(2)).toBe(135)
  })
})
