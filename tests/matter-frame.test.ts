import {
  MATTER_CONTOUR_TRAVEL,
  MATTER_HOLD,
  MATTER_PHASES,
  MATTER_READING_AT,
  MATTER_SCALE_CEILING,
  MATTER_TITLE_TRAVEL,
  matterFrame,
  matterRunway,
  type MatterFrame,
  type MatterGeometry,
  type MatterRunwayInput,
} from '@/features/landing-page/components/matter/matter-frame'

/**
 * The handoff's one pure function, pinned at the boundaries the choreography
 * is timed on.
 *
 * Everything the bridge does to the page is a number this function returns, so
 * these assertions are the real contract — the hook around it only writes them.
 * They are written against `MATTER_PHASES` rather than against literals, so a
 * retime cannot leave a fixture asserting last week's numbers.
 *
 * The geometry is a written-out 1440×900 frame: the source region is a wide,
 * short band, which is what the PROFILE clip actually is. That matters, because
 * the aspect mismatch is what the scale ceiling exists for.
 */
const GEO: MatterGeometry = {
  viewportWidth: 1440,
  viewportHeight: 900,
  sourceX: 400,
  sourceY: 350,
  sourceWidth: 640,
  sourceHeight: 100,
}

/** A frame with every number in it, for the finite-value sweep. */
const numericValues = (frame: MatterFrame): number[] =>
  Object.values(frame).filter(
    (value): value is number => typeof value === 'number',
  )

describe('matterFrame — the opening beat', () => {
  it('opens on the source at its measured size with the device still whole', () => {
    const opening = matterFrame(0, GEO)
    expect(opening.sourceScale).toBe(1)
    expect(opening.sourceOpacity).toBe(1)
    expect(opening.deviceOpacity).toBe(1)
    expect(opening.progress).toBe(0)
  })

  it('hides both decorative words before the handoff begins', () => {
    expect(matterFrame(0, GEO).signalOpacity).toBe(0)
    expect(matterFrame(0, GEO).humanOpacity).toBe(0)
  })

  it('leaves the reading plateau closed until the title has arrived', () => {
    expect(matterFrame(0, GEO).reading).toBe(false)
    expect(matterFrame(MATTER_READING_AT - 0.001, GEO).reading).toBe(false)
    expect(matterFrame(MATTER_READING_AT, GEO).reading).toBe(true)
    expect(matterFrame(1, GEO).reading).toBe(true)
  })
})

describe('matterFrame — the stage takes over while the hero holds', () => {
  it('adds nothing at all on the first frame', () => {
    // At p=0 the reader is still looking at the machine. Anything the bridge
    // paints here is a second picture of the same moment, and two pictures of
    // one moment can only disagree — which is exactly what a visible cut is.
    expect(matterFrame(0, GEO).stageOpacity).toBe(0)
  })

  it('is whole exactly when the hero unpins, so the machine is never seen moving', () => {
    // `MATTER_HOLD` is the progress the hero's own pin ends on. The takeover
    // has to be *finished* by then: if the stage were still half-transparent
    // when the machine starts sliding away, the reader would watch a dissolve
    // and a slide at the same time, which reads as a mistake rather than a
    // handoff.
    expect(matterFrame(MATTER_HOLD, GEO).stageOpacity).toBe(1)
    expect(matterFrame(1, GEO).stageOpacity).toBe(1)
  })

  it('opens monotonically, so reverse scroll cannot flash the machine back', () => {
    let previous = -1
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const { stageOpacity } = matterFrame(p, GEO)
      expect(stageOpacity).toBeGreaterThanOrEqual(previous - 1e-9)
      expect(stageOpacity).toBeLessThanOrEqual(1 + 1e-9)
      previous = stageOpacity
    }
    expect(previous).toBe(1)
  })

  it('spends the whole hold on the takeover and none of the departure', () => {
    // The hold is the stretch of scroll the hero's sticky stage stays pinned
    // through, and it is not free: it is dead scroll for everything else. It
    // must therefore be the takeover and nothing more.
    expect(MATTER_HOLD).toBeGreaterThan(0)
    expect(MATTER_HOLD).toBeLessThanOrEqual(MATTER_PHASES.depart[0])
    expect(matterFrame(MATTER_PHASES.depart[0], GEO).stageOpacity).toBe(1)
  })

  it('does not start the device leaving before the takeover is complete', () => {
    // A departure that begins while the machine is still half-covered would
    // fade a flat field the reader can still see the machine through.
    expect(matterFrame(MATTER_HOLD, GEO).deviceOpacity).toBe(1)
  })
})

describe('matterFrame — SIGNAL becomes HUMAN', () => {
  it('brings SIGNAL fully in by the end of its own window, and not before', () => {
    expect(matterFrame(MATTER_PHASES.signalIn[1], GEO).signalOpacity).toBe(1)
    expect(
      matterFrame(MATTER_PHASES.signalIn[0] - 0.001, GEO).signalOpacity,
    ).toBe(0)
  })

  it('crossfades the two words over the same measured bounds', () => {
    const [swapFrom, swapTo] = MATTER_PHASES.swap
    // Before the swap: SIGNAL alone.
    expect(matterFrame(swapFrom - 0.001, GEO).signalOpacity).toBe(1)
    expect(matterFrame(swapFrom - 0.001, GEO).humanOpacity).toBe(0)
    // After it: HUMAN alone.
    expect(matterFrame(swapTo, GEO).signalOpacity).toBe(0)
    expect(matterFrame(swapTo, GEO).humanOpacity).toBe(1)
    // The two never sum past one, so the swap cannot double-expose.
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const frame = matterFrame(p, GEO)
      expect(frame.signalOpacity + frame.humanOpacity).toBeLessThanOrEqual(
        1.000001,
      )
    }
  })

  it('fades HUMAN out exactly where the semantic title lands', () => {
    expect(matterFrame(MATTER_PHASES.arrive[1], GEO).humanOpacity).toBe(0)
    expect(matterFrame(1, GEO).humanOpacity).toBe(0)
  })
})

describe('matterFrame — the title is never hidden, only offset', () => {
  it('starts the title one bounded entry travel away and settles it at arrival', () => {
    expect(matterFrame(0, GEO).titleY).toBe(MATTER_TITLE_TRAVEL)
    expect(matterFrame(MATTER_PHASES.arrive[0], GEO).titleY).toBe(
      MATTER_TITLE_TRAVEL,
    )
    expect(matterFrame(MATTER_PHASES.arrive[1], GEO).titleY).toBe(0)
    expect(matterFrame(1, GEO).titleY).toBe(0)
  })

  it('keeps the title travel monotonic, so reverse scroll cannot re-enter it', () => {
    let previous = Infinity
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const { titleY } = matterFrame(p, GEO)
      expect(titleY).toBeLessThanOrEqual(previous + 1e-9)
      expect(titleY).toBeGreaterThanOrEqual(-1e-9)
      previous = titleY
    }
    expect(previous).toBe(0)
  })
})

describe('matterFrame — the contours open outward', () => {
  it('starts every contour offset and ends every contour mirrored', () => {
    const { far, middle, near } = MATTER_CONTOUR_TRAVEL
    const opening = matterFrame(0, GEO)
    expect(opening.farY).toBe(far)
    expect(opening.middleY).toBe(middle)
    expect(opening.nearY).toBe(near)
    const settled = matterFrame(1, GEO)
    expect(settled.farY).toBe(-far)
    expect(settled.middleY).toBe(-middle)
    expect(settled.nearY).toBe(-near)
  })

  it('travels further the nearer the layer is, and never reverses', () => {
    const opening = matterFrame(0, GEO)
    expect(Math.abs(opening.nearY)).toBeGreaterThan(Math.abs(opening.middleY))
    expect(Math.abs(opening.middleY)).toBeGreaterThan(Math.abs(opening.farY))
    for (let p = 0; p <= 1.0001; p += 0.01) {
      expect(Math.abs(matterFrame(p, GEO).nearY)).toBeGreaterThanOrEqual(
        Math.abs(matterFrame(p, GEO).middleY) - 1e-9,
      )
      expect(Math.abs(matterFrame(p, GEO).middleY)).toBeGreaterThanOrEqual(
        Math.abs(matterFrame(p, GEO).farY) - 1e-9,
      )
    }
  })

  it('never lets a contour exceed the parallax ceiling the contract declares', () => {
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const frame = matterFrame(p, GEO)
      expect(Math.abs(frame.farY)).toBeLessThanOrEqual(
        MATTER_CONTOUR_TRAVEL.far,
      )
      expect(Math.abs(frame.middleY)).toBeLessThanOrEqual(
        MATTER_CONTOUR_TRAVEL.middle,
      )
      expect(Math.abs(frame.nearY)).toBeLessThanOrEqual(
        MATTER_CONTOUR_TRAVEL.near,
      )
    }
  })
})

describe('matterFrame — the device leaves and the source gives way', () => {
  it('fades the device out across the departure and leaves it out', () => {
    const [from, to] = MATTER_PHASES.depart
    expect(matterFrame(from, GEO).deviceOpacity).toBe(1)
    expect(matterFrame(to, GEO).deviceOpacity).toBe(0)
    expect(matterFrame(1, GEO).deviceOpacity).toBe(0)
  })

  it('hands the frame from the source proxy to the contours across the spread', () => {
    const [from, to] = MATTER_PHASES.spread
    expect(matterFrame(from, GEO).sourceOpacity).toBe(1)
    expect(matterFrame(to, GEO).sourceOpacity).toBe(0)
    expect(matterFrame(1, GEO).sourceOpacity).toBe(0)
  })

  it('translates the source onto the frame centre, then stops', () => {
    // The proxy is placed at the source's own centre, so the frame's job is to
    // move that centre to the middle of the viewport — and only during the
    // departure. This is object motion, not camera travel.
    const centred: MatterGeometry = {
      ...GEO,
      sourceX: (GEO.viewportWidth - GEO.sourceWidth) / 2,
      sourceY: (GEO.viewportHeight - GEO.sourceHeight) / 2,
    }
    expect(matterFrame(1, centred).sourceX).toBeCloseTo(0, 9)
    expect(matterFrame(1, centred).sourceY).toBeCloseTo(0, 9)
    // An off-centre source is translated by exactly its offset, no more.
    const offset = matterFrame(1, GEO)
    expect(offset.sourceX).toBeCloseTo(
      GEO.viewportWidth / 2 - (GEO.sourceX + GEO.sourceWidth / 2),
      9,
    )
    expect(offset.sourceY).toBeCloseTo(
      GEO.viewportHeight / 2 - (GEO.sourceY + GEO.sourceHeight / 2),
      9,
    )
  })

  it('holds both source translations still once the departure is spent', () => {
    const settled = matterFrame(MATTER_PHASES.depart[1], GEO)
    expect(matterFrame(1, GEO).sourceX).toBeCloseTo(settled.sourceX, 9)
    expect(matterFrame(1, GEO).sourceY).toBeCloseTo(settled.sourceY, 9)
  })
})

describe('matterFrame — the scale ceiling', () => {
  it('fits the source to the frame, never past the declared ceiling', () => {
    // A 640×100 band against a 1440×900 frame needs 9× to cover it, which is
    // past the ceiling. The limit is deliberate: it is what stops a tiny source
    // region from becoming a pathological zoom.
    expect(matterFrame(1, GEO).sourceScale).toBe(MATTER_SCALE_CEILING)
  })

  it('never shrinks below one, however large the source is', () => {
    const huge: MatterGeometry = {
      ...GEO,
      sourceWidth: GEO.viewportWidth * 4,
      sourceHeight: GEO.viewportHeight * 4,
    }
    expect(matterFrame(1, huge).sourceScale).toBe(1)
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const scale = matterFrame(p, huge).sourceScale
      expect(scale).toBeGreaterThanOrEqual(1)
      expect(scale).toBeLessThanOrEqual(MATTER_SCALE_CEILING)
    }
  })

  it('grows the source monotonically, so reverse scroll cannot re-open it', () => {
    let previous = -1
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const scale = matterFrame(p, GEO).sourceScale
      expect(scale).toBeGreaterThanOrEqual(previous)
      previous = scale
    }
  })
})

describe('matterFrame — degenerate input', () => {
  it('clamps out-of-range progress instead of extrapolating', () => {
    expect(matterFrame(-1, GEO)).toEqual(matterFrame(0, GEO))
    expect(matterFrame(2, GEO)).toEqual(matterFrame(1, GEO))
  })

  it('normalises non-finite progress to the opening frame', () => {
    // Deliberately the opening frame rather than the nearest bound: a progress
    // that is not a number is a broken input, and the safe reading of "I do not
    // know where the reader is" is "nothing has happened yet".
    expect(matterFrame(NaN, GEO)).toEqual(matterFrame(0, GEO))
    expect(matterFrame(Infinity, GEO)).toEqual(matterFrame(0, GEO))
    expect(matterFrame(-Infinity, GEO)).toEqual(matterFrame(0, GEO))
  })

  it('returns finite numbers for every phase against empty geometry', () => {
    const probes = [
      0,
      ...Object.values(MATTER_PHASES).flatMap(([from, to]) => [
        from,
        (from + to) / 2,
        to,
      ]),
      MATTER_READING_AT,
      1,
      NaN,
    ]
    for (const p of probes) {
      for (const value of numericValues(matterFrame(p, {}))) {
        expect(Number.isFinite(value)).toBe(true)
      }
    }
  })

  it('survives a zero-size source and a zero-size viewport', () => {
    const degenerate: MatterGeometry = {
      viewportWidth: 0,
      viewportHeight: 0,
      sourceX: 0,
      sourceY: 0,
      sourceWidth: 0,
      sourceHeight: 0,
    }
    for (const value of numericValues(matterFrame(0.6, degenerate))) {
      expect(Number.isFinite(value)).toBe(true)
    }
  })
})

describe('matterFrame — the reverse pass reproduces the forward pass', () => {
  const checkpoints = [
    0,
    MATTER_PHASES.depart[0],
    MATTER_PHASES.signalIn[1],
    MATTER_PHASES.depart[1],
    MATTER_PHASES.swap[0],
    MATTER_PHASES.swap[1],
    MATTER_PHASES.spread[1],
    MATTER_PHASES.arrive[0],
    MATTER_READING_AT,
    1,
  ]

  it('is a pure function of progress', () => {
    expect(matterFrame(0.73, GEO)).toEqual(matterFrame(0.73, GEO))
  })

  it('renders identical frames scrolling down and back up', () => {
    const forward = checkpoints.map((p) => matterFrame(p, GEO))
    const reverse = [...checkpoints]
      .reverse()
      .map((p) => matterFrame(p, GEO))
      .reverse()
    expect(forward).toEqual(reverse)
  })
})

/**
 * The runway is the scroll the reading panel is held off screen for, and it is
 * the one number that decides whether the typography beats are *watchable*.
 *
 * The panel is opaque and above the stage, so as soon as its top edge climbs
 * into the band the decorative words live in, it starts eating them. Measured
 * at 1440×900 before this function existed, the runway was `999` and the panel
 * crossed the SIGNAL band at p≈.33. The runway now keeps the band clear through
 * HUMAN's hold as well as SIGNAL's entrance, so the exit beat cannot be covered
 * by the opaque panel.
 */
describe('matterRunway — the panel waits for the words', () => {
  /** A written-out 1440×900 bridge: a 999px reading panel inside a 1272px one. */
  const INPUT: MatterRunwayInput = {
    viewportHeight: 900,
    readingHeight: 999,
    aboutHeight: 1272,
    typeBandBottom: 553,
  }

  /**
   * The panel's top edge, in viewport px, at a given progress.
   *
   * At p=0 the panel's top sits exactly one runway below the stage's top, and
   * the whole bridge's travel is the runway plus the panel less the viewport it
   * is pinned over — so this is the panel's whole climb.
   */
  const panelTop = (
    runway: number,
    p: number,
    input: MatterRunwayInput = INPUT,
  ) => runway - p * (runway + input.aboutHeight - input.viewportHeight)

  it('keeps the panel out of the word band through HUMAN’s exit start', () => {
    const runway = matterRunway(INPUT)
    for (let p = 0; p <= MATTER_PHASES.arrive[0] + 1e-9; p += 0.01) {
      expect(panelTop(runway, p)).toBeGreaterThanOrEqual(
        INPUT.typeBandBottom - 1e-9,
      )
    }
  })

  it('is the shortest runway that does, so no scroll is spent on slack', () => {
    const runway = matterRunway(INPUT)
    expect(panelTop(runway - 2, MATTER_PHASES.arrive[0])).toBeLessThan(
      INPUT.typeBandBottom,
    )
  })

  it('never goes below the reading panel or one viewport', () => {
    // The two floors that were already there: a runway shorter than the panel
    // puts the panel's own content on screen during the opening beat, and one
    // shorter than the viewport lets the panel's top edge show before p=0.
    const short: MatterRunwayInput = {
      ...INPUT,
      readingHeight: 400,
      aboutHeight: 400,
      typeBandBottom: 40,
    }
    expect(matterRunway(short)).toBe(INPUT.viewportHeight)
    expect(
      matterRunway({ ...INPUT, aboutHeight: 100, typeBandBottom: 0 }),
    ).toBe(Math.max(INPUT.readingHeight, INPUT.viewportHeight))
  })

  it('asks for more scroll the taller the band it has to clear', () => {
    const taller = matterRunway({ ...INPUT, typeBandBottom: 700 })
    expect(taller).toBeGreaterThan(matterRunway(INPUT))
  })

  it('asks for more scroll the taller the panel that climbs', () => {
    const taller = matterRunway({ ...INPUT, aboutHeight: 1800 })
    expect(taller).toBeGreaterThan(matterRunway(INPUT))
  })

  it('returns a finite, non-negative number for degenerate input', () => {
    const probes: MatterRunwayInput[] = [
      {
        viewportHeight: 0,
        readingHeight: 0,
        aboutHeight: 0,
        typeBandBottom: 0,
      },
      { ...INPUT, typeBandBottom: NaN },
      { ...INPUT, viewportHeight: NaN },
      { ...INPUT, readingHeight: Infinity },
      { ...INPUT, aboutHeight: -50 },
    ]
    for (const probe of probes) {
      const runway = matterRunway(probe)
      expect(Number.isFinite(runway)).toBe(true)
      expect(runway).toBeGreaterThanOrEqual(1)
    }
  })
})
