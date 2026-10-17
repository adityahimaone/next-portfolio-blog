import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  MAX_HREF,
  NOTE_LIMIT,
  PATH,
  PROJECT_TYPES,
  TIMELINES,
  cleanNote,
  composeBrief,
} from '@/features/landing-page/rack-01/contact-desk/contact-content'

const TO = 'hello@example.com'

describe('content', () => {
  it('has distinct, non-empty channels and stages', () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(6)
    expect(new Set(FAQ_ITEMS.map((c) => c.question)).size).toBe(
      FAQ_ITEMS.length,
    )
    for (const c of FAQ_ITEMS) {
      expect(c.question.endsWith('?')).toBe(true)
      expect(c.answer.length).toBeGreaterThan(40)
      expect(FAQ_CATEGORIES).toContain(c.category)
    }
    // Every category has at least two questions, or its chip is a dead end.
    for (const category of FAQ_CATEGORIES) {
      expect(
        FAQ_ITEMS.filter((i) => i.category === category).length,
      ).toBeGreaterThanOrEqual(2)
    }
    expect(PATH).toHaveLength(4)
    expect(new Set(PROJECT_TYPES.map((t) => t.id)).size).toBe(
      PROJECT_TYPES.length,
    )
    expect(new Set(TIMELINES.map((t) => t.id)).size).toBe(TIMELINES.length)
  })

  it('keeps the honest no on native mobile', () => {
    const mobile = FAQ_ITEMS.find((c) => c.question.includes('React Native'))
    expect(mobile?.answer.startsWith('No.')).toBe(true)
  })

  it('makes no promise beyond the one the page always made', () => {
    const text = FAQ_ITEMS.map((c) => c.answer)
      .join(' ')
      .toLowerCase()
    expect(text).not.toMatch(/\$|per hour|\brates?\b|booked|available (from|until)/)
  })
})

describe('composeBrief', () => {
  it('is a valid brief with nothing selected', () => {
    const brief = composeBrief({ type: null, timeline: null, note: '' }, TO)
    expect(brief.subject).toBe('Brief: a frontend project')
    expect(brief.body).toContain('help with a frontend project.')
    expect(brief.body).not.toContain('About it:')
    expect(brief.href.startsWith(`mailto:${TO}?subject=`)).toBe(true)
  })

  it('folds the type, the timeline and the note into the body', () => {
    const brief = composeBrief(
      { type: 'build', timeline: 'soon', note: 'A dashboard for ops.' },
      TO,
    )
    expect(brief.subject).toBe('Brief: new build')
    expect(brief.body).toContain('a new frontend build, as soon as possible.')
    expect(brief.body).toContain('About it:\nA dashboard for ops.')
  })

  it('ignores an id it does not know rather than printing it', () => {
    const brief = composeBrief({ type: 'nope', timeline: 'nope', note: '' }, TO)
    expect(brief.body).not.toContain('nope')
    expect(brief.subject).toBe('Brief: a frontend project')
  })

  it('encodes the link so a newline or an ampersand cannot break it', () => {
    const brief = composeBrief(
      { type: 'talk', timeline: null, note: 'R&D, then "ship"\nsecond line' },
      TO,
    )
    expect(brief.href).not.toMatch(/[\n\r ]/)
    expect(brief.href).toContain('%0A')
    expect(brief.href).toContain('R%26D')
    const body = new URL(brief.href).searchParams.get('body')
    expect(body).toBe(brief.body)
  })

  it('is deterministic', () => {
    const input = { type: 'design', timeline: 'open', note: 'x' }
    expect(composeBrief(input, TO)).toEqual(composeBrief(input, TO))
  })
})

describe('cleanNote', () => {
  it('collapses runs of spaces and trims', () => {
    expect(cleanNote('  a   b \t c  ')).toBe('a b c')
  })

  it('caps the length and marks the cut', () => {
    const out = cleanNote('x'.repeat(NOTE_LIMIT * 3))
    expect(out.length).toBeLessThanOrEqual(NOTE_LIMIT)
    expect(out.endsWith('…')).toBe(true)
  })

  it('keeps a short note as it was', () => {
    expect(cleanNote('short')).toBe('short')
  })

  it('keeps a mailto under a size every mail client accepts', () => {
    const brief = composeBrief(
      { type: 'build', timeline: 'soon', note: '“é”\n'.repeat(500) },
      TO,
    )
    expect(brief.href.length).toBeLessThanOrEqual(MAX_HREF)
    // And it is still a brief with a note, not an empty one.
    expect(brief.body).toContain('About it:')
  })
})
