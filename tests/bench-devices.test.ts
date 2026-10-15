import {
  BENCH_DEVICES,
  BENCH_DEVICE_CEILING,
  benchDeviceFrame,
  benchDeviceFrames,
} from '@/features/landing-page/components/bench/bench-devices'

describe('benchDeviceFrame', () => {
  it('keeps every device off the sheet before and after its flight', () => {
    for (const spec of BENCH_DEVICES) {
      expect(benchDeviceFrame(spec, 0, 760, 1).opacity).toBe(0)
      expect(
        benchDeviceFrame(spec, spec.window[1] + 0.01, 760, 1).opacity,
      ).toBe(0)
    }
  })

  it('fades a device out before it reaches the principle band', () => {
    for (const spec of BENCH_DEVICES) {
      const end = benchDeviceFrame(spec, spec.window[1] - 1e-4, 760, 1)
      expect(spec.y[1]).toBeGreaterThanOrEqual(BENCH_DEVICE_CEILING)
      expect(end.opacity).toBeLessThan(0.9)
    }
  })

  it('makes nearer devices travel further and draw larger', () => {
    const [far, near] = [...BENCH_DEVICES]
      .sort((a, b) => a.depth - b.depth)
      .filter((_, i, all) => i === 0 || i === all.length - 1)
    expect(benchDeviceFrame(near, 0.3, 760, 1).scale).toBeGreaterThan(
      benchDeviceFrame(far, 0.3, 760, 1).scale,
    )
  })

  it('rises monotonically through the flight', () => {
    for (const spec of BENCH_DEVICES) {
      let last = Infinity
      for (let p = spec.window[0]; p <= spec.window[1]; p += 0.01) {
        const y = benchDeviceFrame(spec, p, 760, 1).y
        expect(y).toBeLessThanOrEqual(last + 1e-6)
        last = y
      }
    }
  })

  it('never writes NaN, Infinity or negative zero', () => {
    for (const progress of [NaN, -1, 0, 0.3, 1, 2, Infinity]) {
      for (const frame of benchDeviceFrames(progress, NaN, NaN)) {
        for (const value of Object.values(frame)) {
          if (typeof value === 'number') {
            expect(Number.isFinite(value)).toBe(true)
            expect(Object.is(value, -0)).toBe(false)
          }
        }
      }
    }
  })
})
