import fc from 'fast-check'
import fs from 'fs'
import path from 'path'
import {
  queryBookmarks,
  parsePage,
  indexOrder,
  PAGE_SIZE,
} from '../features/bookmarks/lib/bookmarks'
import type { Bookmark } from '../features/bookmarks/types'

/**
 * Guards the paging and filtering the /bookmarks route now does on the server.
 *
 * The filter predicate used to live in the client component and had no test at
 * all; it is now shared by the page, the API route and the "Load more" append,
 * so a mistake in it is a mistake in three places at once.
 */

const FILE_PATH = path.join(process.cwd(), 'content', 'bookmarks.json')
const bookmarks = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8')) as Bookmark[]

function make(over: Partial<Bookmark> = {}): Bookmark {
  return {
    id: 'bm-x',
    title: 'Title',
    url: 'https://example.com',
    description: '',
    category: 'Dev Tools',
    tags: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    ...over,
  }
}

const arbBookmark = fc.record({
  title: fc.string({ minLength: 1, maxLength: 12 }),
  category: fc.constantFrom('Dev Tools', 'Type', 'Color'),
  description: fc.string({ maxLength: 12 }),
  tags: fc.array(fc.string({ maxLength: 8 }), { maxLength: 3 }),
})

describe('parsePage', () => {
  it('reads a positive integer', () => {
    expect(parsePage('3')).toBe(3)
    expect(parsePage(7)).toBe(7)
  })

  it('falls back to page one for anything else', () => {
    // A hand-typed or crawled `?page=` must render a real list, not a blank
    // page or a crash.
    for (const raw of ['0', '-4', 'abc', '', undefined, null as never]) {
      expect(parsePage(raw as string | undefined)).toBe(1)
    }
  })

  it('truncates rather than rounding up', () => {
    expect(parsePage('2.9')).toBe(2)
  })
})

describe('queryBookmarks', () => {
  it('reports one page for an empty result set rather than zero', () => {
    const result = queryBookmarks([], { q: 'nothing' })
    // pageCount feeds the "Load more" visibility check; 0 would read as
    // "not loaded" and divide by zero in the offset maths.
    expect(result.pageCount).toBe(1)
    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
  })

  it('splits the catalogue across pages without losing or repeating a row', () => {
    const first = queryBookmarks(bookmarks, { page: 1 })
    const collected: string[] = []

    for (let p = 1; p <= first.pageCount; p += 1) {
      collected.push(
        ...queryBookmarks(bookmarks, { page: p }).items.map((b) => b.id),
      )
    }

    expect(new Set(collected).size).toBe(bookmarks.length)
    expect(collected.length).toBe(bookmarks.length)
  })

  it('clamps an out-of-range page to the last one instead of returning nothing', () => {
    const result = queryBookmarks(bookmarks, { page: 99_999 })
    expect(result.page).toBe(result.pageCount)
    expect(result.items.length).toBeGreaterThan(0)
  })

  it('clamps a zero or negative page to the first', () => {
    expect(queryBookmarks(bookmarks, { page: 0 }).page).toBe(1)
    expect(queryBookmarks(bookmarks, { page: -5 }).page).toBe(1)
  })

  it('holds a short page when the total is not a multiple of the page size', () => {
    const first = queryBookmarks(bookmarks)
    const remainder = first.total % PAGE_SIZE
    // 559 rows over 60-row pages leaves a 19-row last page, so this is the
    // case the button's "Load 19 more" label depends on.
    expect(remainder).toBeGreaterThan(0)

    const last = queryBookmarks(bookmarks, { page: first.pageCount })
    expect(last.items.length).toBe(remainder)
  })

  it('filters by category and keeps the total honest', () => {
    const result = queryBookmarks(bookmarks, { category: 'Type' })
    expect(result.items.length).toBeGreaterThan(0)
    for (const item of result.items) expect(item.category).toBe('Type')
    // `total` is the count across every page, not the size of this slice.
    expect(result.total).toBeGreaterThanOrEqual(result.items.length)
  })

  it('treats All and an absent category as the whole catalogue', () => {
    expect(queryBookmarks(bookmarks, { category: 'All' }).total).toBe(
      bookmarks.length,
    )
    expect(queryBookmarks(bookmarks).total).toBe(bookmarks.length)
  })

  it('matches on title, description, url, category and tags', () => {
    const row = make({
      title: 'Prisma',
      description: 'a database toolkit',
      url: 'https://prisma.io',
      category: 'Dev Tools',
      tags: ['orm', 'sql'],
    })
    const all = [row]

    for (const q of ['prisma', 'toolkit', 'prisma.io', 'dev tools', 'orm']) {
      expect(queryBookmarks(all, { q }).total).toBe(1)
    }
    // Case-insensitive, since every real search is typed in whatever case the
    // reader feels like.
    expect(queryBookmarks(all, { q: 'PRISMA' }).total).toBe(1)
    expect(queryBookmarks(all, { q: 'kubernetes' }).total).toBe(0)
  })

  it('ignores surrounding whitespace in the query', () => {
    const row = make({ title: 'Vite' })
    expect(queryBookmarks([row], { q: '  vite  ' }).total).toBe(1)
  })

  it('applies category and query together', () => {
    const all = [
      make({ id: 'a', title: 'Alpha', category: 'Type' }),
      make({ id: 'b', title: 'Alpha', category: 'Color' }),
    ]
    const result = queryBookmarks(all, { category: 'Type', q: 'alpha' })
    expect(result.items.map((b) => b.id)).toEqual(['a'])
  })

  it('counts categories over the whole catalogue, not the visible page', () => {
    // The sidebar shows these counts, and it sits on every page — if they were
    // derived from the slice, page 7 would claim channels were empty.
    const result = queryBookmarks(bookmarks, { page: 7 })
    const counted = result.facets.reduce((sum, f) => sum + f.count, 0)
    expect(counted).toBe(bookmarks.length)
    expect(result.facets.length).toBeGreaterThan(0)
  })

  it('lists only categories that actually hold rows', () => {
    const all = [make({ category: 'Type' })]
    const result = queryBookmarks(all)
    expect(result.facets.map((f) => f.name)).toEqual(['Type'])
  })

  it('reports the full catalogue size regardless of filter', () => {
    expect(queryBookmarks(bookmarks, { q: 'zzzznomatch' }).totalAll).toBe(
      bookmarks.length,
    )
  })

  it('returns the featured rows unfiltered as pinned', () => {
    const all = [
      make({ id: 'a', title: 'Alpha', featured: true }),
      make({ id: 'b', title: 'Beta' }),
    ]
    const result = queryBookmarks(all, { q: 'zzzznomatch' })
    // Pinned is a shelf, not part of the current playlist — it has always
    // ignored the search, and the strip stays populated above the results.
    expect(result.pinned.map((b) => b.id)).toEqual(['a'])
  })

  it('orders featured first, then alphabetically', () => {
    const all = [
      make({ id: 'a', title: 'Zebra' }),
      make({ id: 'b', title: 'Apple', featured: true }),
      make({ id: 'c', title: 'Mango' }),
    ]
    expect(queryBookmarks(all).items.map((b) => b.id)).toEqual(['b', 'c', 'a'])
  })

  it('does not mutate the array it is given', () => {
    // `.sort` mutates, and the page hands this the array straight out of
    // JSON.parse — mutating it would reorder the module-level fixture for
    // every later assertion.
    const all = [
      make({ id: 'a', title: 'Zebra' }),
      make({ id: 'b', title: 'Apple' }),
    ]
    const before = all.map((b) => b.id)
    queryBookmarks(all)
    expect(all.map((b) => b.id)).toEqual(before)
  })

  it('never returns a page beyond the page size', () => {
    fc.assert(
      fc.property(fc.array(arbBookmark, { maxLength: 250 }), (rows) => {
        const all = rows.map((row, i) => make({ ...row, id: `bm-${i}` }))
        for (let p = 0; p <= 4; p += 1) {
          const result = queryBookmarks(all, { page: p })
          expect(result.items.length).toBeLessThanOrEqual(PAGE_SIZE)
          expect(result.page).toBeGreaterThanOrEqual(1)
          expect(result.page).toBeLessThanOrEqual(result.pageCount)
        }
      }),
      { numRuns: 40 },
    )
  })

  it('paginates exhaustively for any generated catalogue', () => {
    fc.assert(
      fc.property(fc.array(arbBookmark, { maxLength: 200 }), (rows) => {
        const all = rows.map((row, i) => make({ ...row, id: `bm-${i}` }))
        const first = queryBookmarks(all)
        const seen: string[] = []
        for (let p = 1; p <= first.pageCount; p += 1) {
          seen.push(...queryBookmarks(all, { page: p }).items.map((b) => b.id))
        }
        // Every row reachable exactly once: no gaps, no duplicates.
        expect(seen.length).toBe(all.length)
        expect(new Set(seen).size).toBe(all.length)
      }),
      { numRuns: 40 },
    )
  })

  it('agrees with its own filter predicate for any query', () => {
    fc.assert(
      fc.property(
        fc.array(arbBookmark, { maxLength: 60 }),
        fc.string({ maxLength: 6 }),
        (rows, q) => {
          const all = rows.map((row, i) => make({ ...row, id: `bm-${i}` }))
          const needle = q.toLowerCase().trim()
          const expected = all.filter(
            (b) =>
              b.title.toLowerCase().includes(needle) ||
              b.description.toLowerCase().includes(needle) ||
              b.url.toLowerCase().includes(needle) ||
              b.category.toLowerCase().includes(needle) ||
              b.tags.some((t) => t.toLowerCase().includes(needle)),
          )
          // `total` is the number of matches, regardless of which page is
          // being asked for.
          expect(queryBookmarks(all, { q }).total).toBe(expected.length)
        },
      ),
      { numRuns: 40 },
    )
  })
})

describe('indexOrder', () => {
  it('sorts by title when neither row is featured', () => {
    const a = make({ title: 'Alpha' })
    const b = make({ title: 'Beta' })
    expect(indexOrder(a, b)).toBeLessThan(0)
  })

  it('puts a featured row ahead of an unfeatured one regardless of title', () => {
    const plain = make({ title: 'Alpha' })
    const starred = make({ title: 'Zebra', featured: true })
    expect(indexOrder(plain, starred)).toBeGreaterThan(0)
  })

  it('treats absent and false as the same thing', () => {
    const absent = make({ title: 'Alpha' })
    const explicit = make({ title: 'Zebra', featured: false })
    expect(indexOrder(absent, explicit)).toBeLessThan(0)
  })
})
