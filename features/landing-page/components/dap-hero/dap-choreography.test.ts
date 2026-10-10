import {
  DAP_PHASES,
  DAP_TILT,
  DAP_TRACK_SECONDS,
  dapFrame,
  formatTime,
  portalAt,
  portalRest,
} from './dap-choreography'

const samples = Array.from({ length: 201 }, (_, i) => i / 200)

describe('dapFrame', () => {
  it('starts as the assembled, idle player', () => {
    const f = dapFrame(0)
    expect(f.explode).toBe(0)
    expect(f.tiltX).toBe(0)
    expect(f.tiltY).toBe(0)
    expect(f.callouts).toBe(0)
    expect(f.light).toBe(0)
    expect(f.portal).toBe(0)
    expect(f.copy).toBe(1)
    expect(f.keys).toBe(1)
    expect(f.elapsed).toBe(0)
  })

  it('is fully exploded, tilted and tagged at the middle of the story', () => {
    const f = dapFrame(0.55)
    expect(f.explode).toBe(1)
    expect(f.tiltX).toBe(DAP_TILT.x)
    expect(f.tiltY).toBe(DAP_TILT.y)
    expect(f.callouts).toBe(1)
    expect(f.portal).toBe(0)
  })

  it('is reassembled and open onto the About surface at the end', () => {
    const f = dapFrame(1)
    expect(f.explode).toBe(0)
    expect(f.calm).toBe(1)
    expect(f.light).toBe(1)
    expect(f.portal).toBe(1)
    expect(f.portalLabel).toBe(0)
    expect(f.copy).toBe(0)
    expect(f.fill).toBe(1)
    expect(f.elapsed).toBe(DAP_TRACK_SECONDS)
  })

  it('is a pure function: the same progress always gives the same frame', () => {
    const forward = samples.map((p) => dapFrame(p))
    const backward = [...samples]
      .reverse()
      .map((p) => dapFrame(p))
      .reverse()
    expect(backward).toEqual(forward)
  })

  it('clamps progress outside 0..1', () => {
    expect(dapFrame(-3)).toEqual(dapFrame(0))
    expect(dapFrame(7)).toEqual(dapFrame(1))
  })

  it('keeps every driven value inside its range', () => {
    for (const p of samples) {
      const f = dapFrame(p)
      for (const key of [
        'explode',
        'callouts',
        'signal',
        'calm',
        'light',
        'portal',
        'portalLabel',
        'copy',
        'keys',
        'fill',
      ] as const) {
        expect(f[key]).toBeGreaterThanOrEqual(0)
        expect(f[key]).toBeLessThanOrEqual(1)
      }
    }
  })

  it('opens the portal only after the screen has gone light', () => {
    // The seam is invisible only if the OLED already is the About surface when
    // the window starts to open.
    for (const p of samples) {
      const f = dapFrame(p)
      if (f.portal > 0) expect(f.light).toBe(1)
    }
  })

  it('has no layer separation while the portal is opening', () => {
    for (const p of samples) {
      const f = dapFrame(p)
      if (f.portal > 0) expect(f.explode).toBe(0)
    }
  })

  it('only ever grows through a phase and shrinks through its release', () => {
    let previous = dapFrame(0).explode
    let peaked = false
    for (const p of samples) {
      const { explode } = dapFrame(p)
      if (!peaked) {
        if (explode < previous) peaked = true
      } else {
        expect(explode).toBeLessThanOrEqual(previous + 1e-9)
      }
      previous = explode
    }
    expect(peaked).toBe(true)
  })

  it('keeps its phase windows ordered', () => {
    const [explodeA, explodeB] = DAP_PHASES.explode
    const [reA, reB] = DAP_PHASES.reassemble
    const [lightA, lightB] = DAP_PHASES.light
    const [portalA, portalB] = DAP_PHASES.portal
    expect(explodeA).toBeLessThan(explodeB)
    expect(explodeB).toBeLessThanOrEqual(reA)
    expect(reA).toBeLessThan(reB)
    expect(lightA).toBeLessThan(lightB)
    expect(lightB).toBeLessThanOrEqual(portalA)
    expect(portalB).toBeLessThanOrEqual(1)
  })
})

describe('portal geometry', () => {
  const stage = { w: 1440, h: 900 }
  // a 370x740 player centred at (720, 472) with the OLED inside it
  const screen = { left: 548, top: 453, width: 318, height: 518 }
  const rest = portalRest(screen, stage.w, stage.h, 28)

  it('starts exactly on the OLED window', () => {
    const w = portalAt(rest, 0)
    expect(w.left).toBe(screen.left)
    expect(w.top).toBe(screen.top)
    expect(stage.w - w.right - w.left).toBeCloseTo(screen.width)
    expect(stage.h - w.bottom - w.top).toBeCloseTo(screen.height)
    expect(w.radius).toBe(28)
  })

  it('ends covering the whole stage at scale 1', () => {
    const w = portalAt(rest, 1)
    expect(w).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      radius: 0,
      scale: 1,
    })
  })

  it('starts at a scale whose stage-sized plane covers the window', () => {
    // Scaling the stage about the window's centre by `scale` must still cover
    // the window, or the portal would open onto a gap.
    const s = rest.scale
    expect(s).toBeGreaterThan(0)
    expect(s).toBeLessThanOrEqual(1)
    expect(stage.w * s).toBeGreaterThanOrEqual(screen.width)
    expect(stage.h * s).toBeGreaterThanOrEqual(screen.height)
    expect(rest.ox - rest.ox * s).toBeLessThanOrEqual(screen.left + 0.5)
    expect(rest.oy - rest.oy * s).toBeLessThanOrEqual(screen.top + 0.5)
  })

  it('interpolates monotonically from window to stage', () => {
    let previous = portalAt(rest, 0)
    for (let i = 1; i <= 20; i++) {
      const next = portalAt(rest, i / 20)
      expect(next.left).toBeLessThanOrEqual(previous.left)
      expect(next.top).toBeLessThanOrEqual(previous.top)
      expect(next.scale).toBeGreaterThanOrEqual(previous.scale)
      previous = next
    }
  })
})

describe('formatTime', () => {
  it('formats m:ss', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(9.9)).toBe('0:09')
    expect(formatTime(74)).toBe('1:14')
    expect(formatTime(DAP_TRACK_SECONDS)).toBe('3:34')
    expect(formatTime(-5)).toBe('0:00')
  })
})
