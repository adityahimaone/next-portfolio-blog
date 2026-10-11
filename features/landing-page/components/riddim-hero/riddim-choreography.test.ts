import {
  bandInset,
  cameraAt,
  fillScale,
  LCD_CENTRE,
  DRIFT,
} from './riddim-camera'
import {
  RIDDIM_COUNTER,
  RIDDIM_PHASES,
  counterDigits,
  riddimFrame,
} from './riddim-choreography'

const samples = Array.from({ length: 401 }, (_, i) => i / 400)

describe('riddimFrame', () => {
  it('starts on the machine at its screen, not blown up fullscreen', () => {
    // Scroll 0 is the frame the machine was photographed in: the camera is
    // already on the LCD, and the letterbox is shut, so the console and its
    // metronome are visible below the screen rather than covered by the plane.
    const f = riddimFrame(0)
    expect(f.lens).toBe(1)
    expect(f.open).toBe(0)
    expect(f.plane).toBe(false)
    expect(f.swap).toBe(0)
    expect(f.side).toBe(0)
    expect(f.flip).toBe(0)
    expect(f.digits).toEqual(counterDigits(0))
  })

  it('is the whole machine, playing, with the panels out, in the overview', () => {
    const [a, b] = RIDDIM_PHASES.drift
    const f = riddimFrame((a + b) / 2)
    expect(f.lens).toBe(0)
    expect(f.open).toBe(0)
    expect(f.plane).toBe(false)
    expect(f.side).toBe(1)
    expect(f.play).toBe(1)
    expect(f.power).toBe(1)
  })

  it('presses the key and swaps the screen inside the overview', () => {
    const peak = riddimFrame(0.5)
    expect(peak.press).toBe(1)
    expect(riddimFrame(0.45).press).toBe(0)
    expect(riddimFrame(0.56).press).toBe(0)
    expect(riddimFrame(0.45).swap).toBe(0)
    expect(riddimFrame(0.56).swap).toBe(1)
  })

  it('ends on the profile screen, flipped to the page surface', () => {
    const f = riddimFrame(1)
    expect(f.open).toBe(1)
    expect(f.lens).toBe(1)
    expect(f.swap).toBe(1)
    expect(f.flip).toBe(1)
    expect(f.side).toBe(0)
    expect(f.digits).toEqual(counterDigits(1))
  })

  it('is a pure function: the same progress always gives the same frame', () => {
    const forward = samples.map((p) => riddimFrame(p))
    const backward = [...samples]
      .reverse()
      .map((p) => riddimFrame(p))
      .reverse()
    expect(backward).toEqual(forward)
  })

  it('clamps progress outside 0..1', () => {
    expect(riddimFrame(-2)).toEqual(riddimFrame(0))
    expect(riddimFrame(9)).toEqual(riddimFrame(1))
  })

  it('keeps every driven value inside its range', () => {
    for (const p of samples) {
      const f = riddimFrame(p)
      for (const key of [
        'power',
        'controls',
        'meter',
        'ink',
        'inkTwo',
        'readout',
        'play',
        'handoff',
        'open',
        'lens',
        'drift',
        'press',
        'swap',
        'side',
        'flip',
      ] as const) {
        expect(f[key]).toBeGreaterThanOrEqual(0)
        expect(f[key]).toBeLessThanOrEqual(1)
        expect(Object.is(f[key], -0)).toBe(false)
      }
    }
  })

  it('never puts the plane over the console', () => {
    // The plane covers the whole stage. If it were on while the letterbox was
    // shut, the opening frame — the screen with the console and its metronome
    // around it — would be a fullscreen screen instead.
    for (const p of samples) {
      if (riddimFrame(p).plane) expect(riddimFrame(p).open).toBeGreaterThan(0)
    }
    expect(riddimFrame(0).plane).toBe(false)
    // and it is on at the end, where the profile screen is the viewport
    expect(riddimFrame(1).plane).toBe(true)
    expect(riddimFrame(1).open).toBe(1)
  })

  it('never has the letterbox open while the camera is away from the screen', () => {
    // The plane hides when the camera leaves the LCD; an open letterbox at that
    // moment would be a fullscreen screen that suddenly is not there.
    for (const p of samples) {
      const f = riddimFrame(p)
      if (f.lens < 0.9999) expect(f.open).toBe(0)
    }
  })

  it('hands over at the LCD: the plane is exactly a closed band there', () => {
    // The plane turns on the instant the letterbox starts to open, and at that
    // moment its window is still the LCD band, so the two surfaces show the
    // same picture and the hand-over cannot be seen.
    const [openStart, openEnd] = RIDDIM_PHASES.open
    expect(riddimFrame(openStart).open).toBe(0)
    expect(riddimFrame(openStart).lens).toBe(1)
    expect(riddimFrame(openStart).plane).toBe(false)
    expect(riddimFrame(openStart + 0.01).plane).toBe(true)
    expect(riddimFrame(openStart + 0.01).open).toBeLessThan(0.03)
    // and on the way in, the letterbox is shut for the whole push
    expect(riddimFrame(RIDDIM_PHASES.pushIn[0]).lens).toBe(0)
    expect(riddimFrame(RIDDIM_PHASES.pushIn[1]).open).toBe(0)
    expect(riddimFrame(RIDDIM_PHASES.pushIn[1]).lens).toBe(1)
    expect(riddimFrame(RIDDIM_PHASES.pushIn[1]).plane).toBe(false)
    // the plane is the only surface at the end of the open
    expect(riddimFrame(openEnd).plane).toBe(true)
  })

  it('swaps the screen only while the camera is back', () => {
    for (const p of samples) {
      const f = riddimFrame(p)
      if (f.swap > 0 && f.swap < 1) expect(f.lens).toBe(0)
      if (f.press > 0) expect(f.lens).toBe(0)
    }
  })

  it('brings the side panels in only once the camera is nearly back', () => {
    for (const p of samples) {
      const f = riddimFrame(p)
      if (f.side > 0) expect(f.lens).toBeLessThan(0.6)
    }
  })

  it('keeps its phase windows ordered', () => {
    const p = RIDDIM_PHASES
    // the opening frame holds the screen for a moment before the camera moves
    expect(p.pullBack[0]).toBeGreaterThan(0)
    expect(p.pullBack[1]).toBeLessThanOrEqual(p.drift[0])
    expect(p.drift[1]).toBeLessThanOrEqual(p.pushIn[0])
    expect(p.pushIn[1]).toBeLessThanOrEqual(p.open[0])
    expect(p.open[1]).toBeLessThanOrEqual(p.flip[1])
    // press and swap live inside the overview
    expect(p.press[0]).toBeGreaterThanOrEqual(p.drift[0])
    expect(p.pressOut[1]).toBeLessThanOrEqual(p.drift[1])
    expect(p.swap[0]).toBeGreaterThanOrEqual(p.drift[0])
    expect(p.swap[1]).toBeLessThanOrEqual(p.drift[1])
    expect(p.flip[1]).toBeLessThanOrEqual(1)
  })
})

describe('counterDigits', () => {
  it('prints bar.beat, first to last', () => {
    expect(counterDigits(0)).toEqual(['0', '1', '1', '2'])
    expect(counterDigits(1)).toEqual(['0', '4', '1', '6'])
    expect(RIDDIM_COUNTER.last).toBeGreaterThan(RIDDIM_COUNTER.first)
  })

  it('never goes backwards', () => {
    let previous = 0
    for (const p of samples) {
      const d = counterDigits(p)
      const n = Number(d.join(''))
      expect(n).toBeGreaterThanOrEqual(previous)
      previous = n
    }
  })
})

describe('camera', () => {
  const fill = 2.6

  it('rests on the machine in the overview', () => {
    const c = cameraAt({ lens: 0, drift: 0 }, fill)
    expect(c.scale).toBe(1)
    expect(c.dx).toBe(0)
    expect(c.dy).toBe(0)
  })

  it('fills the stage with the LCD, centred, at lens 1', () => {
    const c = cameraAt({ lens: 1, drift: 0 }, fill)
    expect(c.scale).toBeCloseTo(fill)
    expect(c.dx).toBeCloseTo(0)
    // the LCD sits above the machine's centre, so the machine moves down
    expect(c.dy).toBeGreaterThan(0)
  })

  it('zooms in log space: halfway is the geometric mean', () => {
    const c = cameraAt({ lens: 0.5, drift: 0 }, fill)
    expect(c.scale).toBeCloseTo(Math.sqrt(fill))
  })

  it('only ever grows from overview to screen', () => {
    let previous = 0
    for (let i = 0; i <= 20; i++) {
      const c = cameraAt({ lens: i / 20, drift: 0 }, fill)
      expect(c.scale).toBeGreaterThanOrEqual(previous)
      previous = c.scale
    }
  })

  it('dollies a little during the overview, and no further than DRIFT', () => {
    const c = cameraAt({ lens: 0, drift: 1 }, fill)
    expect(c.scale).toBeCloseTo(1 + DRIFT)
  })

  it('puts the LCD at the stage centre whatever the scale', () => {
    // A point at the focus must land on the stage centre: its offset from the
    // machine centre, scaled, plus the pan, is zero.
    const lens = 1
    const c = cameraAt({ lens, drift: 0 }, fill)
    const offsetY = LCD_CENTRE.y - 1317 / 2
    expect(c.scale * offsetY + c.dy).toBeCloseTo(0)
  })

  it('measures the scale at which the LCD spans the stage', () => {
    expect(fillScale(1440, 0.6)).toBeCloseTo(1440 / (922 * 0.6))
  })

  it('sizes the letterbox from the LCD aspect', () => {
    expect(bandInset(1440, 900)).toBeCloseTo((900 - (1440 * 268) / 922) / 2)
    // a stage no taller than the band has no bars to close onto
    expect(bandInset(2600, 700)).toBe(0)
  })
})
