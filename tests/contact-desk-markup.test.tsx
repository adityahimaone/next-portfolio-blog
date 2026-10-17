/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server'

import { ContactDesk } from '@/features/landing-page/rack-01/contact-desk/contact-desk'
import { ContactStatus } from '@/features/landing-page/rack-01/contact-desk/contact-status'
import {
  CHANNELS,
  PATH,
  PROJECT_TYPES,
  TIMELINES,
} from '@/features/landing-page/rack-01/contact-desk/contact-content'

/**
 * What the server sends, which is also what a visitor without JavaScript and a
 * crawler see. These pin the properties that make the desk a real page and not
 * a picture of one: every answer is in the markup, the tabs are a correct tabs
 * pattern, nothing is hidden before a script runs, and the brief builder's link
 * is a working `mailto:` on first paint.
 */
describe('the contact desk, server-rendered', () => {
  const html = renderToStaticMarkup(<ContactDesk />)

  it('prints the active answer and question as real text', () => {
    // Only the active channel's answer is in the panel; the rest are reached by
    // the tabs. What must be true is that the first one is present as text.
    expect(html).toContain(CHANNELS[0].answer)
    expect(html).toContain(CHANNELS[0].question)
  })

  it('is a tabs pattern: one tablist, one panel, one selected tab', () => {
    expect(html.match(/role="tablist"/g)).toHaveLength(1)
    expect(html.match(/role="tabpanel"/g)).toHaveLength(1)
    expect(html.match(/role="tab"/g)).toHaveLength(CHANNELS.length)
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1)
    expect(html.match(/tabindex="0"/g)).toHaveLength(1)
    expect(html.match(/tabindex="-1"/g)).toHaveLength(CHANNELS.length - 1)
  })

  it('wires each tab to the panel and the panel back to the active tab', () => {
    const panel = /aria-controls="([^"]+)"/.exec(html)?.[1]
    expect(panel).toBeTruthy()
    expect(html).toContain(`id="${panel}"`)
    const labelled = /role="tabpanel"[^>]*aria-labelledby="([^"]+)"/.exec(html)
    expect(labelled?.[1]).toBeTruthy()
    expect(html).toContain(`id="${labelled?.[1]}"`)
  })

  it('hides the typed copy from assistive tech so it never reads half a sentence', () => {
    expect(html).toMatch(/aria-hidden="true"/)
    expect(html).toMatch(
      /class="[^"]*monitorAnswer[^"]*"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*class="[^"]*monitorAnswer/,
    )
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
    expect(html).not.toMatch(/aria-pressed="true"/)
  })

  it('has a working mailto on first paint, before any script', () => {
    const href =
      /class="[^"]*send[^"]*"[^>]*href="([^"]+)"|href="(mailto:[^"]+)"[^>]*class="[^"]*send/.exec(
        html,
      )
    const link = href?.[1] ?? href?.[2]
    expect(link?.startsWith('mailto:')).toBe(true)
    expect(link).toContain('subject=')
  })

  it('does not hide anything before a script runs', () => {
    expect(html).toContain('data-reveal="idle"')
    expect(html).not.toContain('data-reveal="armed"')
  })

  it('labels the form controls', () => {
    expect(html).toMatch(/<label[^>]*for="([^"]+)"/)
    const id = /<label[^>]*for="([^"]+)"/.exec(html)?.[1]
    expect(html).toContain(`id="${id}"`)
    expect(html).toContain('<fieldset')
    expect(html.match(/<legend>/g)).toHaveLength(2)
  })
})

describe('the status strip, server-rendered', () => {
  it('renders a placeholder clock so hydration has nothing to disagree about', () => {
    const html = renderToStaticMarkup(<ContactStatus />)
    expect(html).toContain('--:--:--')
    expect(html).toContain('aria-label="Channel status"')
  })
})
