/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server'

import { ContactDesk } from '@/features/landing-page/rack-01/contact-desk/contact-desk'
import { ContactStatus } from '@/features/landing-page/rack-01/contact-desk/contact-status'
import { ContactTitle } from '@/features/landing-page/rack-01/contact-desk/contact-title'
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  PATH,
  PROJECT_TYPES,
  TIMELINES,
} from '@/features/landing-page/rack-01/contact-desk/contact-content'

/**
 * What the server sends, which is also what a visitor without JavaScript and a
 * crawler see. These pin the properties that make the desk a real page and not
 * a picture of one: every answer is in the markup, the questions are real
 * disclosure buttons, the headlines are real headings, nothing is hidden before
 * a script runs, and the brief builder's link is a working `mailto:`.
 */
describe('the contact desk, server-rendered', () => {
  const html = renderToStaticMarkup(<ContactDesk />)

  it('prints every question and every answer as real text', () => {
    for (const item of FAQ_ITEMS) {
      expect(html).toContain(item.question)
      expect(html).toContain(item.answer.split(' ')[0])
    }
  })

  it('makes each question a disclosure button wired to its own region', () => {
    const buttons = html.match(/aria-expanded="(true|false)"/g) ?? []
    expect(buttons).toHaveLength(FAQ_ITEMS.length)
    // Nothing is open on the server: opening is the visitor's, or the intro's.
    expect(html).not.toContain('aria-expanded="true"')
    expect(html.match(/role="region"/g)).toHaveLength(FAQ_ITEMS.length)
    const controls = [...html.matchAll(/aria-controls="([^"]+)"/g)].map(
      (m) => m[1],
    )
    expect(new Set(controls).size).toBe(FAQ_ITEMS.length)
    for (const id of controls) expect(html).toContain(`id="${id}"`)
  })

  it('gives every row a heading, so the page outline lists the questions', () => {
    expect(html.match(/<h3/g)?.length).toBeGreaterThanOrEqual(FAQ_ITEMS.length)
  })

  it('keeps the inverted copy of each row out of the accessibility tree', () => {
    // Each row is printed twice (the cream one and the dark one the flood
    // reveals); the second must be aria-hidden or every question is read twice.
    const hidden = html.match(
      /class="[^"]*rowInv[^"]*"[^>]*aria-hidden="true"/g,
    )
    expect(hidden).toHaveLength(FAQ_ITEMS.length)
  })

  it('offers a topic chip per category plus All, with counts', () => {
    for (const category of FAQ_CATEGORIES) {
      expect(html).toContain(`${category} <small>`)
    }
    expect(html).toContain('All <small>')
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1) // "All"
  })

  it('has a search field with a real label', () => {
    const id = /<label for="([^"]+)">Search the answers/.exec(html)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`id="${id}"`)
    expect(html).toContain('role="search"')
  })

  it('still works with no script: the answers are forced open', () => {
    expect(html).toMatch(/<noscript><style>[^<]*grid-template-rows:1fr/)
  })

  it('renders the signal path as an ordered list of its stages, in order', () => {
    expect(html).toContain('<ol')
    let at = -1
    for (const stage of PATH) {
      const next = html.indexOf(`>${stage.title}<`)
      expect(next).toBeGreaterThan(at)
      at = next
    }
  })

  it('offers every kind of work and timing, none pre-selected', () => {
    for (const choice of [...PROJECT_TYPES, ...TIMELINES]) {
      expect(html).toContain(`>${choice.label}<`)
    }
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1) // only the FAQ's "All"
  })

  it('has a working mailto on first paint, before any script', () => {
    const links = [...html.matchAll(/href="(mailto:[^"]+)"/g)].map((m) => m[1])
    expect(links.length).toBeGreaterThanOrEqual(2) // the builder and the FAQ's CTA
    expect(links.some((l) => l.includes('subject='))).toBe(true)
  })

  it('does not hide anything before a script runs', () => {
    expect(html).toContain('data-reveal="idle"')
    expect(html).not.toContain('data-reveal="armed"')
  })

  it('labels the builder controls', () => {
    expect(html).toMatch(/<label[^>]*for="([^"]+)"[^>]*>One line about it/)
    expect(html.match(/<legend>/g)).toHaveLength(2)
  })
})

describe('the slit headlines, server-rendered', () => {
  it('the section title is one real h2 with the whole line as its name', () => {
    const html = renderToStaticMarkup(<ContactTitle />)
    expect(html.match(/<h2/g)).toHaveLength(1)
    expect(html).toContain('aria-label="Got a hard one? Let&#x27;s roll tape."')
    // The old title is gone.
    expect(html).not.toContain('Bring me the difficult part')
  })

  it('keeps every visible letter out of the accessibility tree', () => {
    const html = renderToStaticMarkup(<ContactTitle />)
    expect(
      html.match(/<span class="[^"]*line[^"]*" aria-hidden="true">/g),
    ).toHaveLength(2)
  })

  it('starts below the slit until the section arrives, and says so', () => {
    expect(renderToStaticMarkup(<ContactTitle />)).toContain(
      'data-intro="pending"',
    )
  })

  it('the FAQ headline is a real h2 too, named by its text', () => {
    const html = renderToStaticMarkup(<ContactDesk />)
    expect(html).toContain('aria-label="Before you press record"')
    expect(html).toMatch(/<section[^>]*aria-labelledby="([^"]+)"/)
  })
})

describe('the status strip, server-rendered', () => {
  it('renders a placeholder clock so hydration has nothing to disagree about', () => {
    const html = renderToStaticMarkup(<ContactStatus />)
    expect(html).toContain('--:--:--')
    expect(html).toContain('aria-label="Channel status"')
  })
})
