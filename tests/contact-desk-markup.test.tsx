/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server'

import { ContactDesk } from '@/features/landing-page/rack-01/contact-desk/contact-desk'
import { ContactStatus } from '@/features/landing-page/rack-01/contact-desk/contact-status'
import {
  FAQ_ITEMS,
  SIDES,
  TRACKS,
} from '@/features/landing-page/rack-01/contact-desk/contact-content'

/**
 * What the server sends, which is also what a visitor without JavaScript and a
 * crawler see. These pin the properties that make the setlist a real FAQ and
 * not a picture of one: every question is a button in a labelled group, the
 * answer region is live, nothing is hidden before a script runs, the animated
 * lyric is kept out of the accessibility tree, and without a script every
 * question and answer is plain text.
 */
describe('the setlist, server-rendered', () => {
  const html = renderToStaticMarkup(<ContactDesk />)

  it('is one labelled section with a heading under the section title', () => {
    expect(html.match(/<section/g)).toHaveLength(1)
    const id = /aria-labelledby="([^"]+)"/.exec(html)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`id="${id}"`)
    expect(html).toMatch(/<h3[^>]*>Before you write<\/h3>/)
  })

  it('has a labelled group per side, with the question as a button', () => {
    for (const track of TRACKS) {
      expect(html).toContain(`aria-label="${SIDES[track]}: ${track}"`)
    }
    expect(html.match(/role="group"/g)).toHaveLength(TRACKS.length)
    for (const item of FAQ_ITEMS) expect(html).toContain(item.question)
    // A song is a toggle: it says whether it is playing, and none is yet.
    expect(html.match(/aria-pressed="false"/g)?.length).toBeGreaterThanOrEqual(
      FAQ_ITEMS.length,
    )
    expect(html).not.toContain('aria-pressed="true"')
  })

  it('lists the songs as ordered lists, one per side', () => {
    expect(html.match(/<ol/g)).toHaveLength(TRACKS.length)
    expect(html.match(/<li/g)).toHaveLength(FAQ_ITEMS.length)
  })

  it('is a roving tabindex: exactly one song is a tab stop', () => {
    const buttons =
      html.match(
        /<button[^>]*aria-pressed="false"[^>]*tabindex="[^"]+"[^>]*>/g,
      ) ?? []
    const songs = buttons.filter((b) => /tabindex="-?[01]"/.test(b))
    expect(songs.filter((b) => b.includes('tabindex="0"'))).toHaveLength(1)
    expect(songs.filter((b) => b.includes('tabindex="-1"'))).toHaveLength(
      FAQ_ITEMS.length - 1,
    )
  })

  it('announces the answer once, in a polite live region, and hides the lyric', () => {
    expect(html).toMatch(/aria-live="polite"/)
    expect(html).toMatch(/aria-label="Answer"/)
    expect(html).toMatch(/class="[^"]*lyrics[^"]*"[^>]*aria-hidden="true"/)
  })

  it('stands by with nothing chosen, on beat 0', () => {
    expect(html).toContain('data-beat="0"')
    expect(html).toContain('Standing by')
    expect(html).toContain('Pick a song. It starts on the next beat.')
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

  it('has the stage controls as real buttons', () => {
    for (const label of ['Next song', 'Stop', 'Auto', 'Copy link']) {
      expect(html).toContain(`>${label}</button>`)
    }
  })

  it('ends on a working mailto', () => {
    expect(html).toMatch(/href="mailto:[^"]+"/)
  })

  it('has no leftover pieces of the earlier designs', () => {
    for (const gone of [
      'Signal path',
      'Brief builder',
      'SCENE LAUNCH',
      'MASTER OUT',
      'BPM',
    ]) {
      expect(html).not.toContain(gone)
    }
  })
})

describe('the status strip, server-rendered', () => {
  it('renders a placeholder clock so hydration has nothing to disagree about', () => {
    const strip = renderToStaticMarkup(<ContactStatus />)
    expect(strip).toContain('--:--:--')
    expect(strip).toContain('aria-label="Channel status"')
  })
})
