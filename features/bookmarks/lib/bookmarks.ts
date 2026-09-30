import type { Bookmark } from '../types'
import { BOOKMARK_CATEGORIES } from '../constants/categories'

/**
 * Rows per page. Chosen against the imported catalogue's 550+ entries: large
 * enough that a reader usually finishes inside one page, small enough that the
 * server-rendered HTML holds a list the browser can lay out without a
 * windowing library.
 */
export const PAGE_SIZE = 60

export type BookmarkFacet = { name: string; count: number }

export type BookmarkQuery = {
  q?: string
  category?: string
  page?: number
}

export type BookmarkPage = {
  items: Bookmark[]
  /** Rows matching the current filter, across every page. */
  total: number
  page: number
  pageCount: number
  /** Every row in the catalogue, unfiltered — the "{n} saved" figure. */
  totalAll: number
  /** Featured rows, which the Pinned strip shows above the filtered list. */
  pinned: Bookmark[]
  /** Category counts over the whole catalogue, so the sidebar stays truthful
   *  on page 7. Deliberately not derived from the visible slice. */
  facets: BookmarkFacet[]
}

/** Featured first, then alphabetical — an index reads best in a fixed order. */
export function indexOrder(a: Bookmark, b: Bookmark): number {
  if (Boolean(b.featured) !== Boolean(a.featured)) {
    return Boolean(b.featured) ? 1 : -1
  }
  return a.title.localeCompare(b.title)
}

/**
 * The one definition of "matches the search box", moved off the client so the
 * server and the browser cannot drift apart. Matches title, description, url,
 * category and tags, exactly as `views/bookmarks-page.tsx` did inline.
 */
function matches(bookmark: Bookmark, needle: string): boolean {
  return (
    bookmark.title.toLowerCase().includes(needle) ||
    bookmark.description.toLowerCase().includes(needle) ||
    bookmark.url.toLowerCase().includes(needle) ||
    bookmark.category.toLowerCase().includes(needle) ||
    bookmark.tags.some((tag) => tag.toLowerCase().includes(needle))
  )
}

/**
 * Parses a raw `?page=` value. Anything that is not a positive integer falls
 * back to page 1 rather than throwing, so a hand-typed or crawled `?page=-3`
 * still renders a real list.
 */
export function parsePage(raw: string | number | undefined): number {
  const value = typeof raw === 'number' ? raw : Number.parseInt(raw ?? '', 10)
  if (!Number.isFinite(value) || value < 1) return 1
  return Math.floor(value)
}

/**
 * The whole of the library's read path: filter, order, facet, page.
 *
 * Pure and synchronous so it can be unit tested directly against the real
 * `content/bookmarks.json`, and shared by the page and the API route so paging
 * has exactly one definition.
 */
export function queryBookmarks(
  all: readonly Bookmark[],
  { q, category, page }: BookmarkQuery = {},
): BookmarkPage {
  const needle = (q ?? '').toLowerCase().trim()

  // Counts come off the unfiltered catalogue, minus nothing: the sidebar has
  // always shown how many rows each playlist holds in total, not how many
  // survive the current search.
  const counts = new Map<string, number>()
  for (const bookmark of all) {
    counts.set(bookmark.category, (counts.get(bookmark.category) ?? 0) + 1)
  }
  const facets = BOOKMARK_CATEGORIES.filter(
    (name) => name !== 'All' && (counts.get(name) ?? 0) > 0,
  ).map((name) => ({ name, count: counts.get(name) ?? 0 }))

  const filtered = all
    .filter(
      (bookmark) =>
        !category || category === 'All' || bookmark.category === category,
    )
    .filter((bookmark) => (needle ? matches(bookmark, needle) : true))
    .sort(indexOrder)

  const total = filtered.length
  // An empty result set still has one (empty) page, so pageCount is never 0
  // and the maths below cannot divide by zero.
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const current = Math.min(Math.max(1, page ?? 1), pageCount)
  const start = (current - 1) * PAGE_SIZE

  return {
    items: filtered.slice(start, start + PAGE_SIZE),
    total,
    page: current,
    pageCount,
    totalAll: all.length,
    // Pinned is deliberately unfiltered, exactly as before: the strip is a
    // shelf of starred links, not part of the current playlist.
    pinned: all.filter((bookmark) => bookmark.featured).sort(indexOrder),
    facets,
  }
}
