import { render } from '@testing-library/react'
import { createElement } from 'react'
import { ArrangementHero } from '@/features/landing-page/components/arrangement/arrangement-hero'
import { RULER_LABELS } from '@/features/landing-page/components/arrangement/arrangement-data'

/**
 * The hero's markup contract with `use-arrangement-hero`.
 *
 * The hook reaches into this tree by attribute, and two of those lookups are
 * one keystroke apart. It calls `querySelector('[data-arr-stage]')` for the
 * stage **wrapper** — whose height it measures — and
 * `querySelector('[data-arr-stage-label]')` for the caption's `<small>`, which
 * it overwrites with the name of the stage the playhead is in.
 *
 * Collapsing those two names into one is not a naming slip, it is a wipe: an
 * ancestor wins document order, so the wrapper would be found first and the
 * stage write would replace the whole hero — header, ruler, lanes, panel — with
 * a single word. That is silent, because every other write in the hook is
 * `?.`-guarded, and it only shows up in a browser. So the two are pinned here,
 * where a browser is not needed.
 *
 * The hero is rendered for real rather than read as source: a source assertion
 * would pass the day both attributes are renamed together.
 */

/**
 * jsdom does not implement `matchMedia`. Answering `matches: true` makes both
 * of the hero's hooks take their bail-out branch — the one phones and
 * reduced-motion visitors take — so no GSAP is imported and the test measures
 * the markup rather than a scroll.
 */
beforeEach(() => {
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
})

const renderHero = () => render(createElement(ArrangementHero))

describe('the hero stage marker and the caption label are different elements', () => {
  it('puts the stage marker on the wrapper and the label on the caption', () => {
    const { container } = renderHero()
    const stage = container.querySelector('[data-arr-stage]')
    const label = container.querySelector('[data-arr-stage-label]')

    expect(stage).not.toBeNull()
    expect(label).not.toBeNull()
    expect(stage).not.toBe(label)
    // The label lives inside the stage; the stage is the wrapper that holds the
    // header, the ruler, the track area and the panel.
    expect(stage!.contains(label!)).toBe(true)
    expect(stage!.querySelector('header')).not.toBeNull()
  })

  it('never lets a hook text target share the stage marker', () => {
    const { container } = renderHero()
    const stage = container.querySelector('[data-arr-stage]')
    expect(container.querySelectorAll('[data-arr-stage]')).toHaveLength(1)
    // Every attribute the hook writes text into must sit on its own element.
    // If any of them rode along on the wrapper, the wrapper — which wins
    // document order — would be what the stage lookup returned, and the write
    // would land on the whole hero.
    for (const target of [
      'data-arr-stage-label',
      'data-arr-caption',
      'data-arr-position',
      'data-arr-ruler',
      'data-arr-proof',
    ]) {
      expect(stage!.hasAttribute(target)).toBe(false)
    }
  })

  it('never puts the stage marker on a text node the hook would overwrite', () => {
    const { container } = renderHero()
    const stage = container.querySelector('[data-arr-stage]')!
    // The wrapper's own text is the whole panel. If the hook wrote a stage name
    // into it, this is what would be lost.
    expect(stage.textContent!.length).toBeGreaterThan(RULER_LABELS[0].length)
  })

  it('seeds the caption with the first stage and an empty story line', () => {
    const { container } = renderHero()
    const label = container.querySelector('[data-arr-stage-label]')!
    const caption = container.querySelector('[data-arr-caption]')!
    expect(label.textContent).toBe(RULER_LABELS[0])
    expect(caption).not.toBeNull()
    expect(caption.textContent).toBe('')
  })
})

/**
 * The hook's other five lookups are all `?.`-guarded, which is right — three of
 * them are optional by design — but it also means a renamed attribute disables
 * a readout in silence. These pin that each one resolves, so a rename that is
 * not mirrored in the hook fails here instead of in a browser.
 */
describe('every element the hook reaches for resolves', () => {
  it.each([
    ['data-arr-stage', 'the stage wrapper'],
    ['data-arr-stage-label', 'the caption stage label'],
    ['data-arr-caption', 'the caption story line'],
    ['data-arr-position', 'the transport position readout'],
    ['data-arr-ruler', 'the ruler'],
    ['data-arr-proof', 'the mixer proof strip'],
  ])('finds exactly one %s — %s', (attribute) => {
    const { container } = renderHero()
    expect(container.querySelectorAll(`[${attribute}]`)).toHaveLength(1)
  })
})
