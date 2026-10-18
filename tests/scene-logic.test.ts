import {
  FAQ_ITEMS,
  TRACKS,
} from '@/features/landing-page/rack-01/contact-desk/contact-content'
import {
  BPM,
  CLIP_MAX_MS,
  CLIP_MIN_MS,
  beatIndex,
  beatMs,
  clipDuration,
  clock,
  linearFocus,
  nextBeatDelay,
  progressAt,
  tracksOf,
  transportAt,
  typedAt,
  wordsOf,
} from '@/features/landing-page/rack-01/contact-desk/scene-logic'

describe('the content', () => {
  it('is a full 3 x 3 grid with unique ids, so no track has a hole', () => {
    expect(FAQ_ITEMS).toHaveLength(9)
    expect(new Set(FAQ_ITEMS.map((i) => i.id)).size).toBe(9)
    for (const track of TRACKS) {
      expect(FAQ_ITEMS.filter((i) => i.track === track)).toHaveLength(3)
    }
    for (const item of FAQ_ITEMS) {
      expect(item.question.endsWith('?')).toBe(true)
      expect(item.id).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('keeps the honest no on native mobile, and promises no rate or date', () => {
    expect(
      FAQ_ITEMS.find((i) => i.id === 'native-mobile')?.answer.startsWith('No.'),
    ).toBe(true)
    const text = FAQ_ITEMS.map((i) => i.answer)
      .join(' ')
      .toLowerCase()
    expect(text).not.toMatch(
      /\$|per hour|\brates?\b|booked|available (from|until)/,
    )
  })
})

describe('the beat clock', () => {
  it('is 500ms a beat at 120 BPM', () => {
    expect(BPM).toBe(120)
    expect(beatMs()).toBe(500)
    expect(beatMs(60)).toBe(1000)
  })

  it('numbers beats from the clock', () => {
    expect(beatIndex(0)).toBe(0)
    expect(beatIndex(499)).toBe(0)
    expect(beatIndex(500)).toBe(1)
    expect(beatIndex(2300)).toBe(4)
  })

  it('waits for the next boundary, never longer than a beat and never zero', () => {
    expect(nextBeatDelay(0)).toBe(500)
    expect(nextBeatDelay(1)).toBe(499)
    expect(nextBeatDelay(499)).toBe(1)
    expect(nextBeatDelay(500)).toBe(500)
    for (let t = 0; t < 5000; t += 37) {
      const d = nextBeatDelay(t)
      expect(d).toBeGreaterThan(0)
      expect(d).toBeLessThanOrEqual(500)
      // And it lands exactly on a boundary.
      expect((t + d) % 500).toBe(0)
    }
  })

  it('survives a negative clock', () => {
    expect(nextBeatDelay(-1)).toBe(1)
  })
})

describe('a clip', () => {
  it('lasts long enough to read and no longer than a reader will wait', () => {
    for (const item of FAQ_ITEMS) {
      const d = clipDuration(item.answer)
      expect(d).toBeGreaterThanOrEqual(CLIP_MIN_MS)
      expect(d).toBeLessThanOrEqual(CLIP_MAX_MS)
    }
    expect(clipDuration('')).toBe(CLIP_MIN_MS)
    expect(clipDuration('x'.repeat(5000))).toBe(CLIP_MAX_MS)
  })

  it('has progress clamped to 0–1', () => {
    expect(progressAt(0, 1000)).toBe(0)
    expect(progressAt(500, 1000)).toBe(0.5)
    expect(progressAt(9999, 1000)).toBe(1)
    expect(progressAt(-5, 1000)).toBe(0)
    expect(progressAt(5, 0)).toBe(0)
    expect(progressAt(Number.NaN, 1000)).toBe(0)
  })

  it('types in step with its progress and ends whole', () => {
    expect(typedAt('abcdefghij', 0)).toBe('')
    expect(typedAt('abcdefghij', 0.5)).toBe('abcde')
    expect(typedAt('abcdefghij', 1)).toBe('abcdefghij')
    expect(typedAt('abcdefghij', 7)).toBe('abcdefghij')
    expect(typedAt('abcdefghij', Number.NaN)).toBe('')
  })
})

describe('the transport readout', () => {
  it('formats the clock and the bar', () => {
    expect(clock(0)).toBe('00:00')
    expect(clock(7400)).toBe('00:07')
    expect(clock(65000)).toBe('01:05')
    expect(clock(-3)).toBe('00:00')
    expect(transportAt(0)).toBe('BAR 01.1')
    expect(transportAt(1500)).toBe('BAR 01.4')
    expect(transportAt(2000)).toBe('BAR 02.1')
    expect(transportAt(-10)).toBe('BAR 01.1')
  })
})

describe('tracksOf', () => {
  it('groups clips by track and keeps each one’s flat index', () => {
    const tracks = tracksOf()
    expect(tracks.map((t) => t.name)).toEqual([...TRACKS])
    const flat = tracks
      .flatMap((t) => t.clips.map((c) => c.index))
      .sort((a, b) => a - b)
    expect(flat).toEqual(Array.from({ length: 9 }, (_, i) => i))
  })
})

describe('wordsOf', () => {
  it('splits on any whitespace and drops empties', () => {
    expect(wordsOf('one  two\nthree ')).toEqual(['one', 'two', 'three'])
    expect(wordsOf('')).toEqual([])
  })

  it('keeps every answer a lyric sheet of a readable length', () => {
    for (const item of FAQ_ITEMS) {
      const n = wordsOf(item.answer).length
      expect(n).toBeGreaterThan(12)
      expect(n).toBeLessThan(60)
    }
  })
})

describe('linearFocus', () => {
  it('walks the whole column and wraps, across groups', () => {
    expect(linearFocus('ArrowDown', 2, 9)).toBe(3)
    expect(linearFocus('ArrowDown', 8, 9)).toBe(0)
    expect(linearFocus('ArrowUp', 0, 9)).toBe(8)
    expect(linearFocus('ArrowRight', 4, 9)).toBe(5)
    expect(linearFocus('ArrowLeft', 4, 9)).toBe(3)
  })

  it('jumps to the ends and ignores other keys', () => {
    expect(linearFocus('Home', 5, 9)).toBe(0)
    expect(linearFocus('End', 0, 9)).toBe(8)
    expect(linearFocus('Enter', 0, 9)).toBe(-1)
    expect(linearFocus('ArrowDown', 0, 0)).toBe(-1)
  })
})
