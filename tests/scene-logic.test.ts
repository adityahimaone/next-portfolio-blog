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
  hash,
  moveFocus,
  nextBeatDelay,
  progressAt,
  tracksOf,
  transportAt,
  typedAt,
  waveformBars,
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

describe('waveformBars', () => {
  it('is deterministic and the right length', () => {
    expect(waveformBars('scope', 24)).toEqual(waveformBars('scope', 24))
    expect(waveformBars('scope', 24)).toHaveLength(24)
    expect(waveformBars('x', 0)).toEqual([])
  })

  it('differs between clips, so nine thumbnails are nine shapes', () => {
    const shapes = new Set(
      FAQ_ITEMS.map((i) => waveformBars(i.id, 24).join(',')),
    )
    expect(shapes.size).toBe(FAQ_ITEMS.length)
  })

  it('stays inside 0.14–1 and has a body, not a flat line', () => {
    for (const item of FAQ_ITEMS) {
      const bars = waveformBars(item.id, 64)
      for (const v of bars) {
        expect(v).toBeGreaterThanOrEqual(0.14)
        expect(v).toBeLessThanOrEqual(1)
      }
      expect(Math.max(...bars) - Math.min(...bars)).toBeGreaterThan(0.25)
    }
  })

  it('swells toward the middle', () => {
    const bars = waveformBars('envelope', 64)
    const edge =
      (bars.slice(0, 6).reduce((a, b) => a + b) +
        bars.slice(-6).reduce((a, b) => a + b)) /
      12
    const mid = bars.slice(26, 38).reduce((a, b) => a + b) / 12
    expect(mid).toBeGreaterThan(edge)
  })

  it('hashes stably', () => {
    expect(hash('a')).toBe(hash('a'))
    expect(hash('a')).not.toBe(hash('b'))
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

describe('moveFocus', () => {
  const counts = [3, 3, 2]

  it('moves between tracks keeping the row, clamped to a shorter track', () => {
    expect(moveFocus('ArrowRight', 0, 1, counts)).toEqual([1, 1])
    expect(moveFocus('ArrowRight', 1, 2, counts)).toEqual([2, 1])
    expect(moveFocus('ArrowRight', 2, 1, counts)).toEqual([2, 1])
    expect(moveFocus('ArrowLeft', 0, 2, counts)).toEqual([0, 2])
    expect(moveFocus('ArrowLeft', 2, 1, counts)).toEqual([1, 1])
  })

  it('walks a track and wraps', () => {
    expect(moveFocus('ArrowDown', 0, 2, counts)).toEqual([0, 0])
    expect(moveFocus('ArrowUp', 0, 0, counts)).toEqual([0, 2])
    expect(moveFocus('ArrowDown', 2, 1, counts)).toEqual([2, 0])
  })

  it('jumps to the ends of the track and ignores other keys', () => {
    expect(moveFocus('Home', 2, 1, counts)).toEqual([2, 0])
    expect(moveFocus('End', 2, 0, counts)).toEqual([2, 1])
    expect(moveFocus('Enter', 0, 0, counts)).toBeNull()
    expect(moveFocus('ArrowDown', 0, 0, [])).toBeNull()
  })
})
