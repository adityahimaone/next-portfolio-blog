import { BENCH_CHIPS } from '@/features/landing-page/components/bench/bench-copy'
import {
  BENCH_ARTIFACT_RECEDE,
  BENCH_BAND_CLEARANCE,
  BENCH_CHIP_GROW,
  BENCH_CHIP_OPACITY,
  BENCH_CHIP_RESOLVE_FLOOR,
  BENCH_CHIP_SCALE,
  BENCH_HOLD,
  BENCH_PHASES,
  BENCH_PRINCIPLE_TRAVEL,
  BENCH_READING_AT,
  BENCH_RING_TIGHTEN,
  BENCH_SEAM_FADE,
  BENCH_SEAM_RISE,
  BENCH_STAGE_BASE,
  BENCH_STRATA_TRAVEL,
  BENCH_UNIT_RANGE,
  benchFrame,
  benchRunway,
  benchState,
  type BenchFrame,
  type BenchGeometry,
} from '@/features/landing-page/components/bench/bench-frame'

/**
 * The About's one pure function, pinned at the boundaries the choreography is
 * timed on.
 *
 * Everything the section does to the page is a number this function returns, so
 * these assertions are the real contract — the hook around it only writes them.
 * They are written against `BENCH_PHASES` and the exported constants rather than
 * against literals, so a retime cannot leave a fixture asserting last week's
 * numbers.
 *
 * The geometry is a written-out 1280×900 stage, which is the box every px
 * constant in the module is authored against — so `unit` is 1 and the numbers
 * in the assertions are the authored ones.
 */
const GEO: BenchGeometry = { stageWidth: 1280, stageHeight: 900 }

const chip = (frame: BenchFrame, id: string) => {
  const found = frame.chips.find((entry) => entry.id === id)
  if (!found) throw new Error(`no chip "${id}" in the frame`)
  return found
}

/** Every number in a frame, chips included. */
const numericValues = (frame: BenchFrame): number[] => [
  ...Object.values(frame).filter(
    (value): value is number => typeof value === 'number',
  ),
  ...frame.chips.flatMap((entry) => [
    entry.x,
    entry.y,
    entry.rotate,
    entry.scale,
    entry.opacity,
  ]),
]

const SWEEP = Array.from({ length: 101 }, (_, index) => index / 100)

describe('benchFrame — the opening tableau', () => {
  it('opens on the sheet with the ring already scattered', () => {
    const opening = benchFrame(0, GEO)
    expect(opening.progress).toBe(0)
    expect(opening.state).toBe('scatter')
    // Every constraint is on the stage and off its slot: the tableau is the
    // scatter, not an empty frame waiting for one.
    const offSlot = opening.chips.filter(
      (entry) => entry.x !== 0 || entry.y !== 0,
    )
    expect(offSlot).toHaveLength(BENCH_CHIPS.length)
  })

  it('has not drawn the artifact or the principle yet', () => {
    const opening = benchFrame(0, GEO)
    expect(opening.artifactDraw).toBe(0)
    expect(opening.artifactOpacity).toBe(0)
    expect(opening.captionOpacity).toBe(0)
    expect(opening.principleOpacity).toBe(0)
  })

  it('carries each chip own tilt and no wobble on the first frame', () => {
    const opening = benchFrame(0, GEO)
    for (const authored of BENCH_CHIPS) {
      // `dock * (1 - dock) * 4` is zero at both ends, so the opening angle is
      // the authored angle exactly rather than an approximation of it.
      expect(chip(opening, authored.id).rotate).toBeCloseTo(authored.rotate, 10)
    }
  })

  it('keeps every chip on the stage at the widest scatter', () => {
    // The stage clips, so a chip whose centre has left the box is a chip that
    // is drawn as a sliced label. This is the bound that makes the scatter a
    // constellation rather than a mess at the viewport edge.
    const opening = benchFrame(0, GEO)
    for (const authored of BENCH_CHIPS) {
      const entry = chip(opening, authored.id)
      const centreX = (authored.slot.x / 100) * GEO.stageWidth + entry.x
      const centreY = (authored.slot.y / 100) * GEO.stageHeight + entry.y
      expect(centreX).toBeGreaterThan(0)
      expect(centreX).toBeLessThan(GEO.stageWidth)
      expect(centreY).toBeGreaterThan(0)
      expect(centreY).toBeLessThan(GEO.stageHeight)
    }
  })
})

describe('benchFrame — the stage takes over while the hero holds', () => {
  it('adds nothing at all on the first frame', () => {
    // At p=0 the reader is still looking at the machine. Anything the section
    // paints here is a second picture of the same moment, and two pictures of
    // one moment can only disagree — which is exactly what a visible cut is.
    expect(benchFrame(0, GEO).stageOpacity).toBe(0)
  })

  it('is whole at the hold and stays whole afterwards', () => {
    expect(benchFrame(BENCH_HOLD, GEO).stageOpacity).toBe(1)
    for (const p of [0.2, 0.5, BENCH_READING_AT, 1]) {
      expect(benchFrame(p, GEO).stageOpacity).toBe(1)
    }
  })

  it('rises monotonically across the hold', () => {
    let previous = -1
    for (const p of SWEEP.filter((value) => value <= BENCH_HOLD)) {
      const value = benchFrame(p, GEO).stageOpacity
      expect(value).toBeGreaterThanOrEqual(previous)
      previous = value
    }
  })

  it('starts gathering exactly where the takeover ends', () => {
    // The two beats meet at one boundary rather than two that have to be kept
    // in step: the hold *is* the top of `gather`.
    expect(BENCH_HOLD).toBe(BENCH_PHASES.gather[0])
    expect(benchFrame(BENCH_HOLD - 0.001, GEO).state).toBe('scatter')
    expect(benchFrame(BENCH_HOLD, GEO).state).toBe('align')
  })
})

describe('benchFrame — the seam is an arrival, not a dissolve', () => {
  it('starts the sheet below its resting place and brings it up', () => {
    // The direction is the whole point: the reader's model is that a surface is
    // rising over a machine being held still, not that a surface is appearing
    // out of it.
    expect(benchFrame(0, GEO).stageY).toBe(BENCH_SEAM_RISE)
    expect(benchFrame(BENCH_HOLD, GEO).stageY).toBe(0)
  })

  it('has fully settled by the handoff boundary and never moves again', () => {
    // At `BENCH_HOLD` the hero's stage unsticks and starts sliding away. A sheet
    // still travelling on that frame would be two motions in one viewport, and
    // the one the reader is meant to be following is the machine leaving.
    for (const p of SWEEP.filter((value) => value >= BENCH_HOLD)) {
      expect(benchFrame(p, GEO).stageY).toBe(0)
    }
  })

  it('only ever rises', () => {
    let previous = Infinity
    for (const p of SWEEP) {
      const value = benchFrame(p, GEO).stageY
      expect(value).toBeLessThanOrEqual(previous + 1e-9)
      expect(value).toBeGreaterThanOrEqual(0)
      previous = value
    }
  })

  it('finishes the opacity while the sheet is still travelling', () => {
    // Two clocks on purpose. The opacity decides how long the reader can see
    // both surfaces at once; the settle is what gives the arrival its edge. If
    // they ended together, the last blended frame would also be the frame the
    // machine starts moving on — the one frame that must not be ambiguous.
    const faded = BENCH_HOLD * BENCH_SEAM_FADE
    expect(faded).toBeLessThan(BENCH_HOLD)
    expect(benchFrame(faded, GEO).stageOpacity).toBe(1)
    expect(benchFrame(faded, GEO).stageY).toBeGreaterThan(0)
  })

  it('spends the minority of the hold below full opacity', () => {
    // This is the number the rendered page fixed. At a straight 0→1 fade over
    // the whole hold, the section spent 387px — more than a third of a viewport
    // — with the rack at its final zoom and the sheet both partly visible, and
    // both were legible through each other. The share of the hold below full
    // opacity is exactly the share spent in that state, so it is bounded here
    // rather than left to taste.
    expect(BENCH_SEAM_FADE).toBeGreaterThan(0.5)
    expect(BENCH_SEAM_FADE).toBeLessThanOrEqual(0.75)
  })
})

describe('benchFrame — the ring contracts onto its slots', () => {
  it('lands every chip exactly on its slot', () => {
    const landed = benchFrame(BENCH_PHASES.gather[1], GEO)
    for (const authored of BENCH_CHIPS) {
      const entry = chip(landed, authored.id)
      expect(entry.x).toBe(0)
      expect(entry.y).toBe(0)
      expect(entry.rotate).toBe(0)
    }
  })

  it('never overshoots a slot on the way in', () => {
    // Every offset is `scatter * (1 - dock)` with `dock` a monotone smoothstep,
    // so the distance to the slot can only shrink. A chip that drifted back out
    // after passing its slot would read as a bounce, not a landing.
    let previous = Infinity
    for (const p of SWEEP.filter((value) => value <= BENCH_PHASES.gather[1])) {
      const distance = Math.hypot(
        chip(benchFrame(p, GEO), 'bisadaya').x,
        chip(benchFrame(p, GEO), 'bisadaya').y,
      )
      expect(distance).toBeLessThanOrEqual(previous + 1e-9)
      previous = distance
    }
  })

  it('holds the ring still once it has landed', () => {
    const landed = benchFrame(BENCH_PHASES.gather[1], GEO)
    for (const p of [0.6, 0.8, 1]) {
      const later = benchFrame(p, GEO)
      for (const authored of BENCH_CHIPS) {
        expect(chip(later, authored.id).x).toBe(chip(landed, authored.id).x)
        expect(chip(later, authored.id).y).toBe(chip(landed, authored.id).y)
      }
    }
  })

  it('starts a delayed chip later than an undelayed one', () => {
    // A stagger is a shorter window, not a queue: every chip's window ends on
    // the same frame, so a delayed chip has covered less of its own distance at
    // any moment before the landing — and therefore has to travel faster to
    // catch up.
    const remaining = (frame: BenchFrame, id: string) => {
      const entry = chip(frame, id)
      const start = chip(benchFrame(0, GEO), id)
      return Math.hypot(entry.x, entry.y) / Math.hypot(start.x, start.y)
    }
    const frame = benchFrame(0.24, GEO)
    expect(remaining(frame, 'cache')).toBeGreaterThan(remaining(frame, 'react'))
  })

  it('sweeps a chip past its final angle and settles back into it', () => {
    // The overshoot is `dock * (1 - dock) * 4` — zero at both ends — so the
    // mid-flight angle is closer to zero than a straight interpolation would
    // put it, and the landing is exact.
    const authored = BENCH_CHIPS.find((entry) => entry.id === 'react')
    if (!authored) throw new Error('no react chip')
    const mid = chip(benchFrame(0.28, GEO), 'react')
    expect(Math.abs(mid.rotate)).toBeLessThan(Math.abs(authored.rotate) * 0.5)
  })

  it('draws a nearer chip larger and heavier than a further one', () => {
    const frame = benchFrame(0.3, GEO)
    const near = chip(frame, 'years') // depth 0.9
    const far = chip(frame, 'cache') // depth 0.25
    expect(near.depth).toBeGreaterThan(far.depth)
    expect(near.scale).toBeGreaterThan(far.scale)
    expect(near.opacity).toBeGreaterThan(far.opacity)
  })

  it('keeps every chip inside its declared scale and opacity range', () => {
    for (const p of SWEEP) {
      const frame = benchFrame(p, GEO)
      for (const entry of frame.chips) {
        expect(entry.scale).toBeGreaterThanOrEqual(BENCH_CHIP_SCALE.far)
        expect(entry.scale).toBeLessThanOrEqual(
          BENCH_CHIP_SCALE.near * (1 + BENCH_CHIP_GROW),
        )
        expect(entry.opacity).toBeGreaterThanOrEqual(
          BENCH_CHIP_OPACITY.far * BENCH_CHIP_RESOLVE_FLOOR,
        )
        expect(entry.opacity).toBeLessThanOrEqual(BENCH_CHIP_OPACITY.near)
      }
    }
  })
})

describe('benchFrame — the constraints hand over to the artifact', () => {
  it('dims the ring by exactly the resolve floor', () => {
    const before = benchFrame(BENCH_PHASES.resolve[0] - 0.001, GEO)
    const after = benchFrame(BENCH_PHASES.resolve[1], GEO)
    for (const authored of BENCH_CHIPS) {
      const ratio =
        chip(after, authored.id).opacity / chip(before, authored.id).opacity
      expect(ratio).toBeCloseTo(BENCH_CHIP_RESOLVE_FLOOR, 6)
    }
  })

  it('never lets the ring vanish', () => {
    // The constraints are what the artifact is made of. Dropping them to
    // nothing would say the argument was thrown away rather than concluded.
    for (const entry of benchFrame(1, GEO).chips) {
      expect(entry.opacity).toBeGreaterThan(0)
    }
  })

  it('contracts the ring only after it has landed', () => {
    expect(benchFrame(BENCH_PHASES.resolve[0], GEO).ringScale).toBe(1)
    expect(benchFrame(1, GEO).ringScale).toBeCloseTo(1 - BENCH_RING_TIGHTEN, 10)
  })
})

describe('benchFrame — the artifact draws itself', () => {
  it('is blank before its window and whole at the top of it', () => {
    expect(benchFrame(BENCH_PHASES.assemble[0], GEO).artifactDraw).toBe(0)
    expect(benchFrame(BENCH_PHASES.assemble[1], GEO).artifactDraw).toBe(1)
  })

  it('rises monotonically and never past one', () => {
    let previous = -1
    for (const p of SWEEP) {
      const value = benchFrame(p, GEO).artifactDraw
      expect(value).toBeGreaterThanOrEqual(previous)
      expect(value).toBeLessThanOrEqual(1)
      previous = value
    }
  })

  it('is whole and still while the ring hands over', () => {
    const frame = benchFrame(BENCH_PHASES.assemble[1], GEO)
    expect(frame.artifactOpacity).toBe(1)
    expect(frame.artifactScale).toBe(1)
    expect(frame.artifactY).toBe(0)
  })

  it('opens with the construction marks whole and spends them as it draws', () => {
    // The opening sheet has to have something geometric on it: a set of words
    // on an empty page is a list that has come apart, not a drawing about to
    // assemble. These are spent exactly as the wireframe finishes drawing over
    // them, so the assembly reads as the scaffolding becoming the drawing.
    expect(benchFrame(0, GEO).scaffoldOpacity).toBe(1)
    expect(benchFrame(BENCH_PHASES.assemble[0], GEO).scaffoldOpacity).toBe(1)
    expect(benchFrame(BENCH_PHASES.assemble[1], GEO).scaffoldOpacity).toBe(0)
    expect(benchFrame(1, GEO).scaffoldOpacity).toBe(0)
  })

  it('fades the construction marks monotonically and never past its bounds', () => {
    let previous = Infinity
    for (const p of SWEEP) {
      const value = benchFrame(p, GEO).scaffoldOpacity
      expect(value).toBeLessThanOrEqual(previous + 1e-9)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
      previous = value
    }
  })

  it('recedes but never disappears', () => {
    const end = benchFrame(1, GEO)
    expect(end.artifactScale).toBeCloseTo(1 - BENCH_ARTIFACT_RECEDE, 10)
    expect(end.artifactOpacity).toBeGreaterThan(0)
    expect(end.artifactOpacity).toBeLessThan(0.2)
  })

  it('leaves the caption legible after the drawing has faded', () => {
    // The last thing readable on the sheet is what the thing was made of.
    const end = benchFrame(1, GEO)
    expect(end.captionOpacity).toBeGreaterThan(end.artifactOpacity)
  })
})

describe('benchFrame — the principle rises into the cleared stage', () => {
  it('is invisible until its own window opens', () => {
    expect(benchFrame(0, GEO).principleOpacity).toBe(0)
    expect(
      benchFrame(BENCH_PHASES.emerge[0] - 0.001, GEO).principleOpacity,
    ).toBe(0)
  })

  it('is fully arrived at the reading plateau', () => {
    const arrived = benchFrame(BENCH_PHASES.emerge[1], GEO)
    expect(arrived.principleOpacity).toBe(1)
    expect(arrived.principleY).toBe(0)
  })

  it('enters from below and never above its travel', () => {
    for (const p of SWEEP) {
      const value = benchFrame(p, GEO).principleY
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(BENCH_PRINCIPLE_TRAVEL)
    }
  })

  it('rises monotonically', () => {
    let previous = Infinity
    for (const p of SWEEP) {
      const value = benchFrame(p, GEO).principleY
      expect(value).toBeLessThanOrEqual(previous + 1e-9)
      previous = value
    }
  })
})

describe('benchFrame — the strata', () => {
  it('moves the sheet least and the artifact more', () => {
    const end = benchFrame(1, GEO)
    expect(Math.abs(end.farY)).toBe(BENCH_STRATA_TRAVEL.far)
    expect(Math.abs(end.middleY)).toBe(BENCH_STRATA_TRAVEL.middle)
    expect(Math.abs(end.middleY)).toBeGreaterThan(Math.abs(end.farY))
  })

  it('drifts both continuous strata in one direction and never back', () => {
    let previousFar = 0
    let previousMiddle = 0
    for (const p of SWEEP) {
      const frame = benchFrame(p, GEO)
      expect(frame.farY).toBeLessThanOrEqual(previousFar + 1e-9)
      expect(frame.middleY).toBeLessThanOrEqual(previousMiddle + 1e-9)
      previousFar = frame.farY
      previousMiddle = frame.middleY
    }
  })
})

describe('benchFrame — the reading plateau', () => {
  it('opens exactly when the principle has settled', () => {
    expect(BENCH_READING_AT).toBe(BENCH_PHASES.emerge[1])
    expect(benchFrame(BENCH_READING_AT - 0.001, GEO).reading).toBe(false)
    expect(benchFrame(BENCH_READING_AT, GEO).reading).toBe(true)
    expect(benchFrame(1, GEO).reading).toBe(true)
  })
})

describe('benchState', () => {
  it('names the three moves at their own boundaries', () => {
    expect(benchState(0)).toBe('scatter')
    expect(benchState(BENCH_PHASES.gather[0] - 0.001)).toBe('scatter')
    expect(benchState(BENCH_PHASES.gather[0])).toBe('align')
    expect(benchState(BENCH_PHASES.resolve[1] - 0.001)).toBe('align')
    expect(benchState(BENCH_PHASES.resolve[1])).toBe('settle')
    expect(benchState(1)).toBe('settle')
  })

  it('agrees with the frame it is derived alongside', () => {
    for (const p of SWEEP) {
      expect(benchFrame(p, GEO).state).toBe(benchState(p))
    }
  })

  it('normalises a broken progress rather than throwing', () => {
    expect(benchState(Number.NaN)).toBe('scatter')
    expect(benchState(-4)).toBe('scatter')
    expect(benchState(9)).toBe('settle')
  })
})

describe('benchFrame — the maths stays total', () => {
  it('returns only finite numbers across the whole arc', () => {
    for (const p of SWEEP) {
      for (const value of numericValues(benchFrame(p, GEO))) {
        expect(Number.isFinite(value)).toBe(true)
      }
    }
  })

  it('normalises non-finite progress to the opening frame', () => {
    // Infinity is a broken input, not an extreme one: the same `finite` guard
    // that catches `NaN` catches it, and the frame it falls back to is the
    // opening one. A finite value outside the arc is a different case and is
    // clamped rather than discarded — see below.
    expect(benchFrame(Number.NaN, GEO)).toEqual(benchFrame(0, GEO))
    expect(benchFrame(Number.POSITIVE_INFINITY, GEO)).toEqual(
      benchFrame(0, GEO),
    )
    expect(benchFrame(Number.NEGATIVE_INFINITY, GEO)).toEqual(
      benchFrame(0, GEO),
    )
  })

  it('clamps progress outside the arc', () => {
    expect(benchFrame(-2, GEO)).toEqual(benchFrame(0, GEO))
    expect(benchFrame(3, GEO)).toEqual(benchFrame(1, GEO))
  })

  it('falls back to the base stage when the geometry is missing or non-finite', () => {
    const base = benchFrame(0.4)
    expect(benchFrame(0.4, {})).toEqual(base)
    expect(benchFrame(0.4, { stageWidth: Number.NaN })).toEqual(base)
    expect(benchFrame(0.4, { stageHeight: Number.NaN })).toEqual(base)
  })

  it('shrinks to the minimum unit for a stage that has not been laid out', () => {
    // A zero-size box is a box that has not been measured yet, not a box that
    // is genuinely nothing. Flooring it at one pixel keeps the maths total and
    // lands on the clamp's floor rather than on Infinity.
    const collapsed = benchFrame(1, { stageWidth: 0, stageHeight: 0 })
    expect(Math.abs(collapsed.farY)).toBeCloseTo(
      BENCH_STRATA_TRAVEL.far * BENCH_UNIT_RANGE.min,
      6,
    )
  })

  it('is pure — the same input twice gives the same frame', () => {
    const first = benchFrame(0.37, GEO)
    const second = benchFrame(0.37, GEO)
    expect(second).toEqual(first)
    expect(second).not.toBe(first)
    expect(second.chips).not.toBe(first.chips)
  })

  it('does not write to the authored chips', () => {
    const before = JSON.stringify(BENCH_CHIPS)
    benchFrame(0.63, GEO)
    expect(JSON.stringify(BENCH_CHIPS)).toBe(before)
  })

  it('never emits a negative zero into a transform', () => {
    // `-0` stringifies as `"-0"` inside a transform string and is not
    // `Object.is`-equal to `0`, so a chip that has landed would serialise a
    // different transform from the one beside it.
    for (const value of numericValues(benchFrame(0, GEO))) {
      expect(Object.is(value, -0)).toBe(false)
    }
  })
})

describe('benchFrame — the stage unit', () => {
  it('scales every px constant with the measured stage', () => {
    const baseDrift = benchFrame(1, GEO)
    const wideDrift = benchFrame(1, { stageWidth: BENCH_STAGE_BASE.width * 2 })
    expect(Math.abs(wideDrift.farY)).toBeCloseTo(
      Math.abs(baseDrift.farY) * 2,
      6,
    )
    expect(Math.abs(wideDrift.middleY)).toBeCloseTo(
      Math.abs(baseDrift.middleY) * 2,
      6,
    )

    const baseScatter = benchFrame(0, GEO)
    const wideScatter = benchFrame(0, {
      stageWidth: BENCH_STAGE_BASE.width * 2,
    })
    for (const authored of BENCH_CHIPS) {
      expect(Math.abs(chip(wideScatter, authored.id).y)).toBeCloseTo(
        Math.abs(chip(baseScatter, authored.id).y) * 2,
        6,
      )
    }

    // The seam's rise is a px constant like the rest, so it scales too — a
    // larger display gets a proportionally larger settle rather than one that
    // has shrunk to a nudge.
    expect(baseScatter.stageY).toBe(BENCH_SEAM_RISE)
    expect(wideScatter.stageY).toBeCloseTo(BENCH_SEAM_RISE * 2, 6)
  })

  it('clamps the unit at both ends rather than tracking an absurd box', () => {
    const tiny = benchFrame(1, { stageWidth: 1 })
    const huge = benchFrame(1, { stageWidth: 100000 })
    expect(Math.abs(tiny.farY)).toBeCloseTo(
      BENCH_STRATA_TRAVEL.far * BENCH_UNIT_RANGE.min,
      6,
    )
    expect(Math.abs(huge.farY)).toBeCloseTo(
      BENCH_STRATA_TRAVEL.far * BENCH_UNIT_RANGE.max,
      6,
    )
  })
})

describe('benchFrame — the arc is a budget, not a taste', () => {
  /**
   * The page the numbers below were measured on, written out as a fixture.
   *
   * These are not the design's intent; they are what the rendered page reported
   * at 1440×900 — the stage is one viewport, the artifact's box is ~398px tall
   * and centred, the principle's resting bottom is ~108px down, and the reading
   * panel is 1232px including its padding. They are here so the test states the
   * cost of the arc in the same units the reader pays it in.
   */
  const PAGE = {
    viewportHeight: 900,
    readingHeight: 958,
    aboutHeight: 1232,
    artifactBandBottom: 649,
    principleBandBottom: 108,
  } as const

  const entry = () => {
    const runway = benchRunway({
      viewportHeight: PAGE.viewportHeight,
      readingHeight: PAGE.readingHeight,
      aboutHeight: PAGE.aboutHeight,
      bands: [
        {
          bottom: PAGE.artifactBandBottom,
          clearUntil: BENCH_BAND_CLEARANCE.artifact,
        },
        {
          bottom: PAGE.principleBandBottom,
          clearUntil: BENCH_BAND_CLEARANCE.principle,
        },
      ],
    })
    // `range` is the section's own scroll — the runway plus the panel less the
    // viewport the stage is pinned over. `hold` is the frozen stretch the hero
    // spends at the top of it, and it is a fraction of `range`. Both are scroll
    // the reader covers before the first word of the biography is clear.
    const range = runway + PAGE.aboutHeight - PAGE.viewportHeight
    return {
      range,
      hold: BENCH_HOLD * range,
      total: range + BENCH_HOLD * range,
    }
  }

  it('finishes the artwork inside the first two thirds of the section', () => {
    // The runway carries a `1 / (1 - clearUntil)` amplifier, so a phase table
    // that ends late costs scroll superlinearly — not proportionally. At
    // `emerge[1] = 0.80` that amplifier was 5x and the section cost 2 582px.
    expect(BENCH_PHASES.emerge[1]).toBeLessThanOrEqual(0.6)
    expect(BENCH_READING_AT).toBeLessThanOrEqual(0.6)
  })

  it('keeps the whole entry inside 2.4 viewports on the measured page', () => {
    // The defect this pins: at the original timing the entry measured 2 969px
    // — 3.30 viewports — of scrolling before the biography arrived, which read
    // as the section dragging rather than as the artwork having room. The
    // threshold is deliberately just above where the current timing lands
    // (2.14), so a retime that quietly re-lengthens the arc fails here.
    expect(entry().total / PAGE.viewportHeight).toBeLessThan(2.4)
  })

  it('still gives the artwork a viewport and a half to play in', () => {
    // The other side of the budget. Compressing the arc is only an improvement
    // while the beats remain watchable, and the failure mode on that side is a
    // section that snaps through its whole choreography in half a screen.
    expect(entry().range / PAGE.viewportHeight).toBeGreaterThan(1.5)
  })

  it('spends the hold on a minority of the section', () => {
    expect(BENCH_HOLD).toBeLessThanOrEqual(0.15)
    expect(BENCH_HOLD).toBeGreaterThanOrEqual(0.08)
  })
})

describe('benchRunway', () => {
  /** The panel's top edge at progress `p`, given a runway. */
  const panelTop = (
    runway: number,
    p: number,
    aboutHeight: number,
    viewportHeight: number,
  ) => runway - p * (runway + aboutHeight - viewportHeight)

  it('solves each band for the panel reaching it on the frame it expires', () => {
    const viewportHeight = 900
    const aboutHeight = 1300
    const bands = [
      { bottom: 650, clearUntil: BENCH_BAND_CLEARANCE.artifact },
      { bottom: 110, clearUntil: BENCH_BAND_CLEARANCE.principle },
    ]

    const runway = benchRunway({
      viewportHeight,
      readingHeight: 1200,
      aboutHeight,
      bands,
    })

    for (const band of bands) {
      expect(
        panelTop(runway, band.clearUntil, aboutHeight, viewportHeight),
      ).toBeGreaterThanOrEqual(band.bottom - 1)
    }
  })

  it('is decided by the lowest band, not the last one to expire', () => {
    // The artifact is lower and expires earlier than the principle. Solving for
    // the principle alone — which is what a single-band runway did — leaves the
    // panel climbing over the artifact while it is still being drawn.
    const shared = {
      viewportHeight: 900,
      readingHeight: 1,
      aboutHeight: 1300,
    }
    const both = benchRunway({
      ...shared,
      bands: [
        { bottom: 650, clearUntil: BENCH_BAND_CLEARANCE.artifact },
        { bottom: 110, clearUntil: BENCH_BAND_CLEARANCE.principle },
      ],
    })
    const principleOnly = benchRunway({
      ...shared,
      bands: [{ bottom: 110, clearUntil: BENCH_BAND_CLEARANCE.principle }],
    })
    const artifactOnly = benchRunway({
      ...shared,
      bands: [{ bottom: 650, clearUntil: BENCH_BAND_CLEARANCE.artifact }],
    })
    expect(both).toBe(Math.max(artifactOnly, principleOnly))
    expect(both).toBeGreaterThan(principleOnly)
  })

  it('floors at the reading panel so its content cannot show on the first beat', () => {
    const runway = benchRunway({
      viewportHeight: 900,
      readingHeight: 2400,
      aboutHeight: 900,
      bands: [{ bottom: 0, clearUntil: 0 }],
    })
    expect(runway).toBe(2400)
  })

  it('floors at one viewport so the panel cannot show before p=0', () => {
    const runway = benchRunway({
      viewportHeight: 900,
      readingHeight: 100,
      aboutHeight: 100,
      bands: [{ bottom: 0, clearUntil: 0 }],
    })
    expect(runway).toBe(900)
  })

  it('keeps the answer finite for a band that would need an infinite runway', () => {
    // A band that has to stay clear until the very end has no solution — the
    // divisor is zero. The clamp is what keeps a decorative layout value from
    // becoming Infinity, which is the one number that survives all the way to
    // paint as a broken transform.
    const runway = benchRunway({
      viewportHeight: 900,
      readingHeight: 1,
      aboutHeight: 1300,
      bands: [{ bottom: 400, clearUntil: 1 }],
    })
    expect(Number.isFinite(runway)).toBe(true)
    expect(Number.isInteger(runway)).toBe(true)
  })

  it('returns a finite, whole number of pixels for broken input', () => {
    const runway = benchRunway({
      viewportHeight: Number.NaN,
      readingHeight: Number.NaN,
      aboutHeight: Number.NaN,
      bands: [
        { bottom: Number.NaN, clearUntil: Number.NaN },
        {
          bottom: Number.POSITIVE_INFINITY,
          clearUntil: Number.NEGATIVE_INFINITY,
        },
      ],
    })
    expect(Number.isFinite(runway)).toBe(true)
    expect(Number.isInteger(runway)).toBe(true)
    expect(runway).toBeGreaterThan(0)
  })

  it('ignores an empty band list rather than returning a broken number', () => {
    const runway = benchRunway({
      viewportHeight: 900,
      readingHeight: 700,
      aboutHeight: 1300,
      bands: [],
    })
    expect(runway).toBe(900)
  })
})
