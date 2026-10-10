/** @jest-environment node */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { COPY, MACHINE_NAV, SCREEN_COPY } from './riddim-content'
import { PADS, SCREEN, TOP_CAPS } from './riddim-geometry'

// CSS modules are not transformed under ts-jest: answer every class with its
// own name so the markup stays inspectable.
jest.mock('./riddim-hero.module.css', () => ({
  __esModule: true,
  default: new Proxy({}, { get: (_target, key) => String(key) }),
}))
jest.mock('@/features/layout/components/top-bar', () => ({
  TopBar: () => null,
}))
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light', setTheme: () => {} }),
}))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: Record<string, unknown>) =>
    createElement('a', { href, ...rest }, children as never),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mod = require('./riddim-hero') as typeof import('./riddim-hero')
const { RiddimHero } = mod

describe('RiddimHero server render', () => {
  const html = renderToString(createElement(RiddimHero))

  it('is a complete hero with no JS at all', () => {
    expect(html).toContain('id="home"')
    expect(html).toContain('data-rack-section')
    expect(html).toContain('data-riddim-hero')
    expect(html).toContain('class="machine"')
  })

  it('prints the name on the machine, as the h1', () => {
    expect(html).toContain('<h1')
    expect(html).toContain(SCREEN_COPY.title)
    expect(html).toContain(SCREEN_COPY.role)
    // the hero has no second, competing headline
    expect(html.match(/<h1/g)).toHaveLength(1)
  })

  it('clones the reference panel', () => {
    expect(html).toContain(SCREEN_COPY.brand)
    expect(html).toContain(SCREEN_COPY.model)
    expect(html).toContain(SCREEN_COPY.tagline)
    for (const cap of TOP_CAPS) {
      expect(html).toContain(cap.label)
    }
    for (const word of SCREEN_COPY.words) {
      expect(html).toContain(word)
    }
    expect(html.match(/data-cap|class="cap/g)?.length).toBeGreaterThan(4)
    expect(html.match(/data-seg=/g)).toHaveLength(4)
  })

  it('prints the destinations on the controls that carry them', () => {
    for (const entry of MACHINE_NAV) {
      expect(html).toContain(entry.label)
    }
    // the nine index pads keep their numbers and gain their names
    for (const pad of PADS) {
      if (pad.glyph !== 'digit') continue
      expect(html).toContain(`>${pad.value}<`)
    }
  })

  it('carries the copy and the seam into the next chapter', () => {
    expect(html).toContain(COPY.line)
    expect(html).toContain(COPY.sub)
    for (const word of SCREEN_COPY.handoff) {
      expect(html).toContain(word)
    }
  })

  it('renders the navigation once: the stack, which is what a phone uses', () => {
    // On the server the machine is a drawing and the stack holds the links, so
    // a client without JS still has one complete navigation.
    expect(html).toContain('href="#work"')
    expect(html).toContain('href="/projects"')
    expect(html).toContain('href="/blog"')
    expect(html).toContain('href="/music"')
    expect(html).toContain('href="/bookmarks"')
    expect(html).toContain('href="#about"')
    expect(html).toContain('href="#contact"')
    expect(html).toContain('href="/resume.pdf"')
    expect(html).toContain('href="/rss.xml"')
    expect(html).toContain('mailto:')
    expect(html.match(/aria-label="Primary"/g)).toHaveLength(1)
  })

  it('lays the screen out on the reference window', () => {
    expect(html).toContain(`0 0 ${SCREEN.w} ${SCREEN.h}`)
    expect(html).toContain('data-riddim-hero')
  })
})
