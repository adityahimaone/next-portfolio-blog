import {
  highlightRuns,
  itemIds,
  matches,
  nextFocus,
  resolveOpen,
  slugify,
  snippet,
  toggled,
  wordsOf,
} from '@/features/landing-page/rack-01/contact-desk/faq-logic'

describe('slugify / itemIds', () => {
  it('makes URL-safe, accent-free, bounded slugs and never an empty one', () => {
    expect(slugify('What kind of work do you take on?')).toBe(
      'what-kind-of-work-do-you-take-on',
    )
    expect(slugify('Café déjà vu')).toBe('cafe-deja-vu')
    expect(slugify('???')).toBe('question')
    expect(slugify('a'.repeat(200)).length).toBeLessThanOrEqual(64)
  })

  it('keeps ids unique, preferring an explicit one', () => {
    expect(
      itemIds(['Same?', 'Same?', 'Other'], [undefined, undefined, 'x']),
    ).toEqual(['same', 'same-2', 'x'])
  })
})

describe('matches', () => {
  it('requires every word, in any order, case-insensitively', () => {
    expect(
      matches('Frontend over an existing backend', 'BACKEND frontend'),
    ).toBe(true)
    expect(matches('Frontend over an existing backend', 'backend mobile')).toBe(
      false,
    )
  })

  it('treats an empty or blank query as everything', () => {
    expect(matches('anything', '')).toBe(true)
    expect(matches('anything', '   ')).toBe(true)
  })
})

describe('highlightRuns', () => {
  it('splits into plain and matched runs that rejoin to the original', () => {
    const runs = highlightRuns('React and Next.js work', 'react next')
    expect(runs.map((r) => r.text).join('')).toBe('React and Next.js work')
    expect(runs.filter((r) => r.hit).map((r) => r.text)).toEqual([
      'React',
      'Next',
    ])
  })

  it('merges overlapping matches into one run', () => {
    const runs = highlightRuns('backend', 'back end backend')
    expect(runs).toEqual([{ text: 'backend', hit: true }])
  })

  it('returns the text whole when there is nothing to mark', () => {
    expect(highlightRuns('hello', '')).toEqual([{ text: 'hello', hit: false }])
    expect(highlightRuns('', 'x')).toEqual([{ text: '', hit: false }])
  })
})

describe('snippet', () => {
  const text = 'word '.repeat(30) + 'needle ' + 'word '.repeat(30)

  it('windows around the first match with ellipses where it was cut', () => {
    const s = snippet(text, 'needle')
    expect(s).toContain('needle')
    expect(s.startsWith('…')).toBe(true)
    expect(s.endsWith('…')).toBe(true)
    expect(s.length).toBeLessThan(text.length)
  })

  it('is empty when nothing matches or there is no query', () => {
    expect(snippet(text, 'absent')).toBe('')
    expect(snippet(text, '')).toBe('')
  })

  it('is the whole text, unadorned, when the text is short', () => {
    expect(snippet('a short answer', 'short')).toBe('a short answer')
  })
})

describe('resolveOpen / toggled', () => {
  const ids = ['a', 'b', 'c']

  it('resolves an index, an id and a list, and honours single', () => {
    expect(resolveOpen(1, ids, true)).toEqual(['b'])
    expect(resolveOpen('c', ids, true)).toEqual(['c'])
    expect(resolveOpen([0, 'c', 'zzz', 99], ids, false)).toEqual(['a', 'c'])
    expect(resolveOpen([0, 1], ids, true)).toEqual(['a'])
    expect(resolveOpen(undefined, ids, false)).toEqual([])
  })

  it('toggles within single and multiple modes', () => {
    expect(toggled(['a'], 'b', true)).toEqual(['b'])
    expect(toggled(['a'], 'b', false)).toEqual(['a', 'b'])
    expect(toggled(['a', 'b'], 'a', false)).toEqual(['b'])
    expect(toggled(['a'], 'a', true)).toEqual([])
  })
})

describe('nextFocus', () => {
  it('moves and wraps, and ignores other keys', () => {
    expect(nextFocus('ArrowDown', 2, 3)).toBe(0)
    expect(nextFocus('ArrowUp', 0, 3)).toBe(2)
    expect(nextFocus('Home', 2, 3)).toBe(0)
    expect(nextFocus('End', 0, 3)).toBe(2)
    expect(nextFocus('Enter', 0, 3)).toBe(-1)
    expect(nextFocus('ArrowDown', 0, 0)).toBe(-1)
  })
})

describe('wordsOf', () => {
  it('splits a short answer and declines a long one', () => {
    expect(wordsOf('one  two\nthree')).toEqual(['one', 'two', 'three'])
    expect(wordsOf('w '.repeat(200))).toBeNull()
  })
})
