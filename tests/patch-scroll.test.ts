import { readFileSync } from 'node:fs'
import {
  ARRANGEMENT_SEAM_OPEN,
  IMMERSIVE_OVERSHOOT_FROM,
  IMMERSIVE_OVERSHOOT_TO,
} from '@/features/landing-page/components/arrangement/arrangement-camera'
import {
  PATCH_ACTS,
  PATCH_READ_SVH,
  PATCH_SECTION_SVH,
  scrollBudget,
  splitProgress,
} from '@/features/landing-page/components/patch/patch-timeline'
import {
  barAt,
  stageAt,
} from '@/features/landing-page/components/patch/hero-story'
import {
  PATCH_LOOP,
  PATCH_MODULE_LIST,
} from '@/features/landing-page/components/patch/patch-data'
import { MIXER_DATA } from '@/features/landing-page/constants'

describe('splitProgress', () => {
  const { heroPx, readPx } = scrollBudget(900)
  it('opens the window on the camera clock, then starts the read', () => {
    expect(splitProgress(0, heroPx, readPx)).toEqual({ camera: 0, read: 0 })
    const open = splitProgress(heroPx, heroPx, readPx)
    expect(open.camera).toBeCloseTo(ARRANGEMENT_SEAM_OPEN, 10)
    expect(open.read).toBe(0)
    expect(splitProgress(heroPx + readPx, heroPx, readPx).read).toBe(1)
  })
  it('spends the camera overshoot during power-on and then holds the camera', () => {
    const powerOnEnd = heroPx + readPx * PATCH_ACTS.powerOn[1]
    expect(splitProgress(powerOnEnd, heroPx, readPx).camera).toBeCloseTo(
      IMMERSIVE_OVERSHOOT_TO,
      10,
    )
    expect(splitProgress(1e9, heroPx, readPx).camera).toBeCloseTo(
      IMMERSIVE_OVERSHOOT_TO,
      10,
    )
  })
  it('passes through the whole overshoot span, so the bump actually plays', () => {
    const mid = splitProgress(heroPx + readPx * 0.06, heroPx, readPx).camera
    expect(mid).toBeGreaterThan(IMMERSIVE_OVERSHOOT_FROM)
    expect(mid).toBeLessThan(IMMERSIVE_OVERSHOOT_TO)
  })
  it('never moves the camera backwards', () => {
    let prev = -1
    for (let s = 0; s <= heroPx + readPx; s += 25) {
      const { camera } = splitProgress(s, heroPx, readPx)
      expect(camera).toBeGreaterThanOrEqual(prev)
      prev = camera
    }
  })
  it('gives the read its own length', () => {
    expect(readPx).toBe(PATCH_READ_SVH * 9)
  })
})

describe('section height', () => {
  it('is the stage, the camera distance and the read, in svh', () => {
    expect(PATCH_SECTION_SVH).toBeCloseTo(
      100 + 360 * ARRANGEMENT_SEAM_OPEN + 300,
      9,
    )
    const { heroPx, readPx } = scrollBudget(900)
    expect((PATCH_SECTION_SVH * 900) / 100).toBeCloseTo(
      900 + heroPx + readPx,
      6,
    )
  })
  it('keeps the stylesheet in step with the section height', () => {
    const css = readFileSync(
      'features/landing-page/components/arrangement/arrangement.module.css',
      'utf8',
    )
    const match = css.match(/--arr-scroll:\s*([\d.]+)svh/)
    expect(Number(match?.[1])).toBeCloseTo(PATCH_SECTION_SVH, 6)
  })
})

describe('stageAt / barAt', () => {
  it('puts the playhead in the stage whose tick it has passed', () => {
    expect([0, 0.24, 0.25, 0.5, 0.75, 1].map(stageAt)).toEqual([
      0, 0, 1, 2, 3, 4,
    ])
  })
  it('counts bars like the toolbar does', () => {
    expect(barAt(0)).toBe(1)
    expect(barAt(1)).toBe(33)
  })
})

describe('the patch data is derived, not retyped', () => {
  it('has one module per MIXER_DATA group, with its channels and levels', () => {
    expect(PATCH_MODULE_LIST).toHaveLength(MIXER_DATA.length)
    PATCH_MODULE_LIST.forEach((m, i) => {
      expect(m.controls.map((c) => c.name)).toEqual(
        MIXER_DATA[i].channels.map((c) => c.name),
      )
      expect(m.controls.map((c) => c.level)).toEqual(
        MIXER_DATA[i].channels.map((c) => c.level / 100),
      )
      expect(m.control).toBe(MIXER_DATA[i].type)
    })
  })
  it('prints the profile clip as bars, matching the ruler', () => {
    expect(PATCH_LOOP).toMatchObject({ from: 14, to: 30 })
  })
})
