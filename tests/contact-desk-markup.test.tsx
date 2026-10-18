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
 * crawler see. These pin the properties that make the launcher a real FAQ and
 * not a picture of one: every question is a button in a labelled track, the
 * answer region is live, nothing is hidden before a script runs, and without a
 * script every question and answer is plain text.
 */
describe('the scene launcher, server-rendered', () => {
  const html = renderToStaticMarkup(<ContactDesk />)

  it('is one labelled section, named by its brand line', () => {
    expect(html.match(/<section/g)).toHaveLength(1)
    const id = /aria-labelledby="([^"]+)"/.exec(html)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`id="${id}"`)
    expect(html).toContain('AH / SCENE LAUNCH')
  })

  it('has a labelled group per track and a button per question', () => {
    for (const track of TRACKS) {
      expect(html).toContain(`aria-label="${track} track"`)
    }
    expect(html.match(/role="group"/g)).toHaveLength(TRACKS.length)
    for (const item of FAQ_ITEMS) {
      expect(html).toContain(item.question)
    }
    // A clip is a toggle: it says whether it is playing, and none is yet.
    expect(html.match(/aria-pressed="false"/g)?.length).toBeGreaterThanOrEqual(
      FAQ_ITEMS.length,
    )
    expect(html).not.toContain('aria-pressed="true"')
  })

  it('is a roving tabindex: exactly one clip is a tab stop', () => {
    const clips = html.match(/<button[^>]*data-state="idle"[^>]*>/g) ?? []
    expect(clips).toHaveLength(FAQ_ITEMS.length)
    expect(clips.filter((c) => c.includes('tabindex="0"'))).toHaveLength(1)
    expect(clips.filter((c) => c.includes('tabindex="-1"'))).toHaveLength(
      FAQ_ITEMS.length - 1,
    )
  })

  it('announces the answer once, in a polite live region, and hides the typed copy', () => {
    expect(html).toMatch(
      /role="region"[^>]*aria-live="polite"|aria-live="polite"[^>]*role="region"/,
    )
    expect(html).toMatch(/class="[^"]*answer[^"]*"[^>]*aria-hidden="true"/)
  })

  it('keeps the decorative parts out of the accessibility tree', () => {
    // Waveforms, playheads, the beat LEDs and the readouts are all decoration.
    expect((html.match(/aria-hidden="true"/g) ?? []).length).toBeGreaterThan(
      FAQ_ITEMS.length * 3,
    )
  })

  it('starts on beat 0, standing by, with nothing chosen', () => {
    expect(html).toContain('data-beat="0"')
    expect(html).toContain('MASTER OUT · STANDBY')
    expect(html).toContain('Pick a clip. It starts on the next beat.')
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
    // And the controls that cannot work without a script are hidden there.
    expect(plain).toMatch(/<style>[^<]*display:none/)
  })

  it('ends on a working mailto', () => {
    expect(html).toMatch(/href="mailto:[^"]+"/)
  })

  it('has no leftover pieces of the old desk', () => {
    expect(html).not.toContain('Signal path')
    expect(html).not.toContain('Brief builder')
    expect(html).not.toContain('Before you')
  })
})

describe('the status strip, server-rendered', () => {
  it('renders a placeholder clock so hydration has nothing to disagree about', () => {
    const strip = renderToStaticMarkup(<ContactStatus />)
    expect(strip).toContain('--:--:--')
    expect(strip).toContain('aria-label="Channel status"')
  })
})
