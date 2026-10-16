import {
  hwfFitSize,
  hwfHex,
  hwfLift,
  hwfPhase,
  hwfRadius,
  hwfStep,
  hwfTransport,
  hwfWarmth,
} from '@/components/ui/halftone-wordmark-footer'

describe('hwfHex', () => {
  it('reads #rgb and #rrggbb, and refuses anything else', () => {
    expect(hwfHex('#ff5a1f')).toEqual([255, 90, 31])
    expect(hwfHex('f80')).toEqual([255, 136, 0])
    expect(hwfHex('rgb(1,2,3)')).toBeNull()
    expect(hwfHex('')).toBeNull()
  })
})

describe('hwfRadius', () => {
  it('is area-true and clamped', () => {
    expect(hwfRadius(0, 6)).toBe(0)
    expect(hwfRadius(-1, 6)).toBe(0)
    expect(hwfRadius(1, 6)).toBeCloseTo(6 * 0.52, 6)
    expect(hwfRadius(9, 6)).toBe(hwfRadius(1, 6))
    // Quarter of the coverage is half the radius, i.e. a quarter of the ink.
    expect(hwfRadius(0.25, 6)).toBeCloseTo(hwfRadius(1, 6) / 2, 6)
  })

  it('keeps full-tone dots from overlapping by more than a pixel at the default gap', () => {
    const r = hwfRadius(1, 6)
    expect(r * 2 - 6).toBeLessThan(1)
  })
})

describe('hwfStep', () => {
  it('pushes a dot away from a near pointer', () => {
    const [x] = hwfStep(100, 100, 0, 0, 100, 100, 90, 100, 80)
    expect(x).toBeGreaterThan(100)
  })

  it('always comes home once the pointer is gone', () => {
    let s: [number, number, number, number] = [130, 80, 0, 0]
    for (let i = 0; i < 400; i++) {
      s = hwfStep(s[0], s[1], s[2], s[3], 100, 100, -1e5, -1e5, 80)
    }
    expect(s[0]).toBeCloseTo(100, 2)
    expect(s[1]).toBeCloseTo(100, 2)
  })
})

describe('hwfWarmth', () => {
  it('is 0 at home and 1 at the span', () => {
    expect(hwfWarmth(10, 10, 10, 10, 28)).toBe(0)
    expect(hwfWarmth(10 + 28, 10, 10, 10, 28)).toBe(1)
    expect(hwfWarmth(500, 10, 10, 10, 28)).toBe(1)
    expect(hwfWarmth(5, 5, 0, 0, 0)).toBe(0)
  })
})

describe('hwfFitSize', () => {
  it('sizes the word to the width', () => {
    expect(hwfFitSize(400, 800)).toBe(200)
    expect(hwfFitSize(0, 800)).toBe(0)
  })
})

describe('hwfLift', () => {
  it('peaks under the playhead and is zero outside the span', () => {
    expect(hwfLift(0, 64)).toBe(1)
    expect(hwfLift(64, 64)).toBe(0)
    expect(hwfLift(-200, 64)).toBe(0)
  })

  it('is symmetric and falls monotonically', () => {
    expect(hwfLift(20, 64)).toBeCloseTo(hwfLift(-20, 64), 10)
    expect(hwfLift(10, 64)).toBeGreaterThan(hwfLift(30, 64))
    expect(hwfLift(30, 64)).toBeGreaterThan(hwfLift(50, 64))
  })
})

describe('hwfPhase / hwfTransport', () => {
  it('loops 0–1 over the period, including for negative clocks', () => {
    expect(hwfPhase(0, 8000)).toBe(0)
    expect(hwfPhase(4000, 8000)).toBe(0.5)
    expect(hwfPhase(8000, 8000)).toBe(0)
    expect(hwfPhase(-2000, 8000)).toBeCloseTo(0.75, 10)
    expect(hwfPhase(5, 0)).toBe(0)
  })

  it('reads four bars of four beats', () => {
    expect(hwfTransport(0, 120)).toBe('BAR 01 · BEAT 1 · 120 BPM')
    expect(hwfTransport(0.25, 120)).toBe('BAR 02 · BEAT 1 · 120 BPM')
    expect(hwfTransport(0.3125, 120)).toBe('BAR 02 · BEAT 2 · 120 BPM')
    expect(hwfTransport(0.999, 120)).toBe('BAR 04 · BEAT 4 · 120 BPM')
    expect(hwfTransport(1, 120)).toBe('BAR 04 · BEAT 4 · 120 BPM')
  })
})
