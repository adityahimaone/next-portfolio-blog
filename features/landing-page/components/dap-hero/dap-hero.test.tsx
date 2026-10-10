/** @jest-environment node */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { LAYER_TAGS, KEYS } from './dap-content'

// CSS modules are not transformed under ts-jest: answer every class with its
// own name so the markup stays inspectable.
jest.mock('./dap-hero.module.css', () => ({
  __esModule: true,
  default: new Proxy({}, { get: (_target, key) => String(key) }),
}))
jest.mock('@/features/layout/components/top-bar', () => ({
  TopBar: () => null,
}))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: Record<string, unknown>) =>
    createElement('a', { href, ...rest }, children as never),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DapHero } = require('./dap-hero') as typeof import('./dap-hero')

describe('DapHero server render', () => {
  const html = renderToString(createElement(DapHero))

  it('is a complete, assembled hero with no JS', () => {
    expect(html).toContain('id="home"')
    expect(html).toContain('data-rack-section')
    expect(html).toContain('data-portal="off"')
    expect(html).toContain('Aditya Himawan, Frontend Engineer')
  })

  it('renders every layer and one tag per labelled layer', () => {
    for (const layer of ['glass', 'oled', 'plate', 'pcb', 'battery', 'back']) {
      expect(html).toContain(`layer ${layer}`)
    }
    for (const tag of LAYER_TAGS) {
      expect(html).toContain(tag.title)
    }
  })

  it('keeps the device decorative and the keys real links', () => {
    expect(html).toMatch(/class="device"[^>]*aria-hidden="true"/)
    for (const key of KEYS) {
      expect(html).toContain(`>${key.label}<`)
    }
    expect(html).toContain('href="#work"')
    expect(html).toContain('href="/blog"')
    expect(html).toContain('href="/resume.pdf"')
    expect(html).toContain('href="#about"')
  })

  it('serialises the screen geometry as custom properties', () => {
    expect(html).toContain('--scr-x:0.07')
    expect(html).toContain('--dap-scroll:340')
  })
})
