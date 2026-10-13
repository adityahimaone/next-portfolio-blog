// Brings the jest-dom matchers into scope for `tsc`, not just for the runtime.
// `jest.setup.js` installs them for Jest; this is what tells the type checker
// that `toHaveAttribute` exists.
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { createElement } from 'react'
import { PatchPanel } from '@/features/landing-page/components/patch/patch-panel'
import { PATCH_MODULE_LIST } from '@/features/landing-page/components/patch/patch-data'
import { PROOF_READOUTS } from '@/features/landing-page/components/arrangement/arrangement-data'
import { ABOUT_TRACKS } from '@/features/landing-page/rack-01/about-copy'

/**
 * The Patch's two accessibility contracts, asserted against the real markup.
 *
 * Both are properties of the *shape* of the tree rather than of any value, so
 * they are exactly the kind of thing a later refactor can break without
 * changing a single number — which is why they are pinned here and not left to
 * a render-time review.
 *
 * Written with `createElement` rather than JSX: this suite runs under ts-jest
 * with `extensionsToTreatAsEsm`, which skips the transform for a .tsx entry
 * point, so the JSX would never compile. Same reason as `use-list-keys.test.tsx`.
 */
const renderPanel = (active = 0) =>
  render(createElement(PatchPanel, { active, onSelect: () => {} }))

describe('the Patch keeps every take reachable', () => {
  it('renders all three takes, so no story is behind a script', () => {
    const { container } = renderPanel(0)
    const takes = container.querySelectorAll('article')
    expect(takes).toHaveLength(PATCH_MODULE_LIST.length)
    // The copy is the About copy, not a re-typed summary of it.
    for (const track of ABOUT_TRACKS) {
      expect(container.textContent).toContain(track.heading)
      expect(container.textContent).toContain(track.story)
    }
  })

  it('makes the inactive takes inert and leaves exactly one live', () => {
    const { container } = renderPanel(1)
    const takes = [...container.querySelectorAll('article')]
    const live = takes.filter((take) => !take.hasAttribute('inert'))
    expect(live).toHaveLength(1)
    expect(takes[1]).not.toHaveAttribute('inert')
    expect(takes[0]).toHaveAttribute('inert')
    expect(takes[2]).toHaveAttribute('inert')
    // `data-active` is what the stylesheet gates the visible take on, so it and
    // `inert` have to agree or the panel shows one take and reads out another.
    takes.forEach((take, index) => {
      expect(take.getAttribute('data-active')).toBe(String(index === 1))
    })
  })

  it('moves both signals together when the active module changes', () => {
    const { container } = renderPanel(2)
    const takes = [...container.querySelectorAll('article')]
    expect(takes[2]).not.toHaveAttribute('inert')
    expect(takes[2].getAttribute('data-active')).toBe('true')
    expect(takes[0]).toHaveAttribute('inert')
    expect(takes[0].getAttribute('data-active')).toBe('false')
  })
})

describe('the Patch never nests a link inside a button', () => {
  it('keeps the résumé link out of every button', () => {
    const { container } = renderPanel(0)
    const links = [...container.querySelectorAll('a[href]')]
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      // A focusable descendant of a button is announced as part of the button
      // and is not reachable by keyboard.
      expect(link.closest('button')).toBeNull()
    }
  })

  it('renders the résumé link once, for the take that has one', () => {
    const { container } = renderPanel(0)
    const withResume = ABOUT_TRACKS.filter((track) => track.resumeLink)
    const links = [...container.querySelectorAll('a[href]')].filter((link) =>
      (link.textContent ?? '').includes('Résumé'),
    )
    expect(links).toHaveLength(withResume.length)
    expect(links[0].getAttribute('href')).toBe(withResume[0].resumeLink)
  })
})

describe('the Patch is a readout, not an input surface', () => {
  it('offers no form controls — the only buttons are the module heads', () => {
    const { container } = renderPanel(0)
    expect(container.querySelectorAll('input, select, textarea')).toHaveLength(
      0,
    )
    const buttons = [...container.querySelectorAll('button')]
    expect(buttons).toHaveLength(PATCH_MODULE_LIST.length)
    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveAttribute('aria-pressed', String(index === 0))
    })
  })

  it('describes every knob and fader as an image with its level', () => {
    const { container } = renderPanel(0)
    const readouts = [...container.querySelectorAll('[role="img"]')]
    const controlCount = PATCH_MODULE_LIST.reduce(
      (total, module) => total + module.controls.length,
      0,
    )
    expect(readouts).toHaveLength(controlCount)
    for (const readout of readouts) {
      expect(readout.getAttribute('aria-label')).toMatch(/, \d+ out of 100$/)
    }
  })

  it('prints the hero proof strip unchanged', () => {
    const { container } = renderPanel(0)
    for (const readout of PROOF_READOUTS) {
      expect(container.textContent).toContain(readout.value)
      expect(container.textContent).toContain(readout.unit)
      expect(container.textContent).toContain(readout.meter)
    }
  })
})
