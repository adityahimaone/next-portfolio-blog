/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server'

import { ContactDesk } from '@/features/landing-page/rack-01/contact-desk/contact-desk'
import { ContactStatus } from '@/features/landing-page/rack-01/contact-desk/contact-status'
import {
  FAQ_ITEMS,
  TRACKS,
} from '@/features/landing-page/rack-01/contact-desk/contact-content'

/**
 * What the server sends, which is also what a visitor without JavaScript and a
 * crawler see. These pin the properties that make the field a real FAQ and not
 * a picture of one: every question is a disclosure button, the filters are
 * pressed-state buttons, the CTA is a working mail link, and without a script
 * every question and answer is plain text.
 */
describe('the magnetic FAQ, server-rendered', () => {
  const html = renderToStaticMarkup(<ContactDesk />)

  it('is one labelled section, named by its heading', () => {
    expect(html.match(/<section/g)).toHaveLength(1)
    const id = /aria-labelledby="([^"]+)"/.exec(html)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`id="${id}"`)
    expect(html).toContain('Pull a question out of the air.')
  })

  it('renders a disclosure button per question, all collapsed', () => {
    const triggers = html.match(/<button[^>]*aria-expanded="false"[^>]*>/g)
    expect(triggers).toHaveLength(FAQ_ITEMS.length)
    for (const item of FAQ_ITEMS) {
      expect(html).toContain(item.question)
    }
    expect(html).not.toContain('aria-expanded="true"')
    // Each trigger points at a unique answer panel that mounts on open.
    const controls = [...html.matchAll(/aria-controls="([^"]+)"/g)].map(
      (match) => match[1],
    )
    expect(controls).toHaveLength(FAQ_ITEMS.length)
    expect(new Set(controls).size).toBe(FAQ_ITEMS.length)
    for (const control of controls) expect(control).toContain('-panel-')
  })

  it('has a pressed-state filter for All and each track', () => {
    expect(html.match(/<button[^>]*aria-pressed=/g)).toHaveLength(
      TRACKS.length + 1,
    )
    expect(html).toContain('aria-pressed="true"')
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(TRACKS.length)
    for (const track of TRACKS) {
      expect(html).toContain(`>${track}</span>`)
      expect(html).toContain('03')
    }
    expect(html).toContain('09')
  })

  it('does not hide anything before a script runs', () => {
    expect(html).toContain('data-reveal="idle"')
    expect(html).not.toContain('data-reveal="armed"')
  })

  it('works with no script: every question and every answer is plain text', () => {
    const plain = /<noscript>(.*?)<\/noscript>/s.exec(html)?.[1] ?? ''
    expect(plain).toContain('<dl')
    for (const item of FAQ_ITEMS) {
      expect(plain).toContain(item.question)
      expect(plain).toContain(item.answer)
    }
    expect(plain).toMatch(/<style>[^<]*display:none/)
  })

  it('ends on a working mailto and names the fallback response time', () => {
    expect(html).toMatch(/href="mailto:[^"]+"/)
    expect(html).toContain('Usually a reply within a couple of days.')
  })

  it('keeps the decoration out of the accessibility tree', () => {
    expect((html.match(/aria-hidden="true"/g) ?? []).length).toBeGreaterThan(
      FAQ_ITEMS.length * 2,
    )
  })

  it('expands inline instead of opening a modal', () => {
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('aria-modal')
    expect(html).not.toContain('faq-detail')
  })

  it('has none of the old dark sampler left', () => {
    expect(html).not.toContain('AH / SCENE LAUNCH')
    expect(html).not.toContain('MASTER OUT')
    expect(html).not.toContain('BPM')
    expect(html).not.toContain('wave')
  })
})

describe('the status strip, server-rendered', () => {
  it('renders a placeholder clock so hydration has nothing to disagree about', () => {
    const strip = renderToStaticMarkup(<ContactStatus />)
    expect(strip).toContain('--:--:--')
    expect(strip).toContain('aria-label="Channel status"')
  })
})
