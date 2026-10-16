import {
  COVER_FROM,
  COVER_TO,
  SEAM_COLUMNS,
  SEAM_PANELS,
  SEAM_PHASES,
  seamFrame,
} from '@/features/landing-page/rack-01/seam-frame'

const SWEEP = Array.from({ length: 201 }, (_, i) => i / 200)

describe('seamFrame', () => {
  it('starts as the untouched radio and ends as the untouched player', () => {
    const open = seamFrame(0)
    expect(open.overlayVisible).toBe(false)
    expect(open.experienceHidden).toBe(false)
    expect(open.headingOpacity).toBe(1)
    expect(open.washOpacity).toBe(0)
    expect(open.deck).toEqual({ scale: 1, y: 0, opacity: 1 })
    expect(open.shell.opacity).toBe(0)
    expect(open.columns.every((top) => top === 1)).toBe(true)
    expect(open.caps.every((cap) => cap === 0)).toBe(true)

    const close = seamFrame(1)
    expect(close.overlayVisible).toBe(false)
    expect(close.experienceHidden).toBe(true)
    expect(close.shell).toEqual({ opacity: 1, scale: 1 })
    expect(close.columns.every((top) => top === 1)).toBe(true)
    expect(close.panels.every((panel) => panel === 1)).toBe(true)
  })

  it('returns one column and one cap per column asked for', () => {
    expect(seamFrame(0.3).columns).toHaveLength(SEAM_COLUMNS)
    expect(seamFrame(0.3).caps).toHaveLength(SEAM_COLUMNS)
    expect(seamFrame(0.3, 10).columns).toHaveLength(10)
    expect(seamFrame(0.3).panels).toHaveLength(SEAM_PANELS)
  })

  it('covers the whole screen, every column, across the whole plateau', () => {
    // The swap between the radio and the player happens inside this plateau and
    // is never seen. A column that stopped short would show it.
    for (const p of SWEEP.filter((v) => v >= COVER_FROM && v <= COVER_TO)) {
      for (const top of seamFrame(p).columns) expect(top).toBe(0)
    }
  })

  it('hides the Experience section only once the wall is solid, and keeps it hidden', () => {
    let hidden = false
    for (const p of SWEEP) {
      const frame = seamFrame(p)
      if (frame.experienceHidden) {
        hidden = true
        expect(p).toBeGreaterThan(COVER_FROM)
      }
      // Once hidden, never shown again on the way out.
      if (hidden) expect(frame.experienceHidden).toBe(true)
    }
    // And the first hidden frame is inside the plateau.
    const first = SWEEP.find((p) => seamFrame(p).experienceHidden) as number
    expect(first).toBeGreaterThanOrEqual(COVER_FROM)
    expect(first).toBeLessThan(COVER_TO)
  })

  it('has the player in place before the wall comes down', () => {
    expect(seamFrame(COVER_FROM).shell.opacity).toBe(1)
    expect(seamFrame(SEAM_PHASES.fall[0]).shell.opacity).toBe(1)
  })

  it('keeps every column inside its track', () => {
    for (const p of SWEEP) {
      const frame = seamFrame(p)
      for (const top of frame.columns) {
        expect(top).toBeGreaterThanOrEqual(0)
        expect(top).toBeLessThanOrEqual(1)
      }
      for (const cap of frame.caps) expect([0, 1]).toContain(cap)
    }
  })

  it('only marks a column with a cap while it is moving', () => {
    const frame = seamFrame(0.3)
    frame.columns.forEach((top, i) => {
      if (top > 0.002 && top < 0.998) expect(frame.caps[i]).toBe(1)
      else expect(frame.caps[i]).toBe(0)
    })
  })

  it('drops from the centre outward', () => {
    const n = SEAM_COLUMNS
    const [f0, f1] = SEAM_PHASES.fall
    const p = f0 + (f1 - f0) * 0.4
    const { columns } = seamFrame(p, n)
    const centreLeft = columns[n / 2 - 1]
    const centreRight = columns[n / 2]
    const edge = columns[0]
    // The centre has fallen further than the edge, so its top edge is lower.
    expect(centreLeft).toBeGreaterThan(edge)
    expect(centreRight).toBeGreaterThan(edge)
    // And the two centre columns are mirror images.
    expect(centreLeft).toBeCloseTo(centreRight, 9)
    expect(columns[0]).toBeCloseTo(columns[n - 1], 9)
  })

  it('has dropped every column all the way by the end of the fall', () => {
    for (const top of seamFrame(SEAM_PHASES.fall[1]).columns) {
      expect(top).toBe(1)
    }
  })

  it('is stateless: the same progress renders the same frame, forwards or back', () => {
    const forward = SWEEP.map((p) => seamFrame(p))
    const backward = [...SWEEP]
      .reverse()
      .map((p) => seamFrame(p))
      .reverse()
    expect(backward).toEqual(forward)
  })

  it('clamps out-of-range and non-finite progress to a real frame', () => {
    expect(seamFrame(-4)).toEqual(seamFrame(0))
    expect(seamFrame(9)).toEqual(seamFrame(1))
    expect(seamFrame(Number.NaN)).toEqual(seamFrame(0))
  })

  it('pushes the radio back monotonically while the lights go down', () => {
    let scale = 2
    let opacity = 2
    for (const p of SWEEP) {
      const { deck } = seamFrame(p)
      expect(deck.scale).toBeLessThanOrEqual(scale + 1e-9)
      expect(deck.opacity).toBeLessThanOrEqual(opacity + 1e-9)
      scale = deck.scale
      opacity = deck.opacity
    }
    expect(scale).toBeGreaterThanOrEqual(0.9 - 1e-9)
    expect(opacity).toBe(0)
  })

  it('shows its label only while the wall is closing, closed, or just opening', () => {
    expect(seamFrame(0.1).labelOpacity).toBe(0)
    expect(seamFrame(COVER_FROM).labelOpacity).toBeGreaterThan(0.9)
    expect(seamFrame(0.9).labelOpacity).toBe(0)
  })

  it('staggers the player panels in order', () => {
    const mid = seamFrame(0.78).panels
    for (let k = 1; k < mid.length; k += 1) {
      expect(mid[k]).toBeLessThanOrEqual(mid[k - 1] + 1e-9)
    }
  })

  it('never writes a negative zero into a style', () => {
    for (const p of SWEEP) {
      const frame = seamFrame(p)
      expect(Object.is(frame.deck.y, -0)).toBe(false)
      for (const top of frame.columns) expect(Object.is(top, -0)).toBe(false)
    }
  })
})
