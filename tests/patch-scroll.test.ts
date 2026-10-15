import { readFileSync } from 'node:fs'
import {
  ARRANGEMENT_SCROLL_SVH,
  ARRANGEMENT_SEAM_OPEN,
} from '@/features/landing-page/components/arrangement/arrangement-camera'
import {
  PATCH_READ_SVH,
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
  it('stops the camera on the seam-open mark and holds it there', () => {
    // The camera's domain is the window it opens, and nothing more. It used to
    // run on to `IMMERSIVE_OVERSHOOT_TO` so the panel's power-on act had the
    // camera's overshoot to spend; the overshoot is gone, so the extra scroll
    // bought nothing and went with it.
    for (const at of [heroPx, heroPx + readPx * 0.06, heroPx + readPx, 1e9]) {
      expect(splitProgress(at, heroPx, readPx).camera).toBeCloseTo(
        ARRANGEMENT_SEAM_OPEN,
        10,
      )
    }
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
  it('keeps the stylesheet in step with the camera distance', () => {
    // The hero is one instrument now: one viewport of sticky stage plus
    // `ARRANGEMENT_SCROLL_SVH`'s travel, with the trigger's own progress *being*
    // the camera's progress. The read that used to add `PATCH_READ_SVH` of its
    // own went with the seam, so `PATCH_SECTION_SVH` no longer describes any
    // section on the page — the guard is against the camera constant instead.
    const css = readFileSync(
      'features/landing-page/components/arrangement/arrangement.module.css',
      'utf8',
    )
    const match = css.match(/--arr-scroll:\s*([\d.]+)svh/)
    expect(Number(match?.[1])).toBeCloseTo(ARRANGEMENT_SCROLL_SVH, 6)
    expect(ARRANGEMENT_SCROLL_SVH).toBeGreaterThanOrEqual(340)
  })

  it('un-pins the hero on short viewports, where the hook declines to run', () => {
    // The hook gates on three conditions at once — `min-width: 769px`,
    // `min-height: 700px`, motion allowed — and the stylesheet has to un-pin
    // the stage for each of the three ways one can fail. It had a block for
    // narrow and a block for reduced motion, but none for short.
    //
    // The cost of the missing third was measured at 1440×640: the hook declined
    // to activate, nothing told the stylesheet, and `position: sticky` stayed on
    // — so the arrangement sat frozen at the top of a 400svh section and the
    // reader scrolled ~1920px past a picture that never changed. The design
    // rules that out by name: "insufficient height (<700px initial target), use
    // normal stacked layout; no pinning, zoom, parallax, hidden text or blank
    // runway."
    const css = readFileSync(
      'features/landing-page/components/arrangement/arrangement.module.css',
      'utf8',
    )
    const block = css.match(/@media \(max-height: 699px\) \{([\s\S]*?)\n\}/)
    expect(block).not.toBeNull()
    expect(block?.[1]).toMatch(/\.hero\s*\{[^}]*height:\s*auto/)
    expect(block?.[1]).toMatch(/\.stage\s*\{[^}]*position:\s*static/)
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
