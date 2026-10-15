import {
  SLIDE_REACH,
  SLIDE_REST,
  chapterPosition,
  slideFrame,
} from '@/features/landing-page/components/bench/bench-stage'

describe('chapterPosition', () => {
  const centers = [1000, 2000, 3200]

  it('is the chapter index at each text centre', () => {
    centers.forEach((c, i) =>
      expect(chapterPosition(c, centers)).toBeCloseTo(i),
    )
  })

  it('is continuous and increasing through the whole scroll', () => {
    let last = -Infinity
    for (let y = 0; y <= 4400; y += 25) {
      const g = chapterPosition(y, centers)
      expect(g).toBeGreaterThan(last)
      last = g
    }
  })

  it('handles unevenly tall texts without a step', () => {
    const a = chapterPosition(2000 - 0.5, centers)
    const b = chapterPosition(2000 + 0.5, centers)
    expect(Math.abs(b - a)).toBeLessThan(0.01)
  })

  it('is finite on degenerate input', () => {
    expect(chapterPosition(NaN, centers)).toBe(0)
    expect(chapterPosition(5, [])).toBe(0)
    expect(Number.isFinite(chapterPosition(5, [100]))).toBe(true)
  })
})

describe('slideFrame', () => {
  it('shows exactly the centred device, at rest', () => {
    const f = slideFrame(1, 1)
    expect(f.opacity).toBe(1)
    expect(f.y).toBe(0)
    expect(f.scale).toBe(1)
    expect(f.p).toBeCloseTo(0.5)
    expect(slideFrame(1, 0).opacity).toBe(0)
    expect(slideFrame(1, 2).opacity).toBe(0)
  })

  it('crosses two neighbours rather than dropping one then raising the other', () => {
    for (let g = 0; g <= 1; g += 0.02) {
      const total = slideFrame(g, 0).opacity + slideFrame(g, 1).opacity
      expect(total).toBeCloseTo(1, 6)
    }
  })

  it('carries a leaving device up and an arriving one up from below', () => {
    expect(slideFrame(1.5, 1).y).toBeLessThan(0)
    expect(slideFrame(0.5, 1).y).toBeGreaterThan(0)
  })

  it('is flat where it should be at rest, and gone past its reach', () => {
    expect(slideFrame(1 + SLIDE_REST * 0.99, 1).opacity).toBe(1)
    expect(slideFrame(1 + SLIDE_REACH, 1).opacity).toBe(0)
  })

  it('never writes NaN, Infinity or negative zero', () => {
    for (const g of [NaN, -3, 0, 1, 2.5, Infinity]) {
      for (let i = 0; i < 3; i += 1) {
        const f = slideFrame(g, i)
        for (const value of Object.values(f)) {
          expect(Number.isFinite(value)).toBe(true)
          expect(Object.is(value, -0)).toBe(false)
        }
      }
    }
  })
})
