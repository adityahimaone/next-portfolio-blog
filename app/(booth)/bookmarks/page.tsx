import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { BookmarksPage } from '@/features/bookmarks'
import {
  queryBookmarks,
  parsePage,
  PAGE_SIZE,
} from '@/features/bookmarks/lib/bookmarks'
import { breadcrumbList, itemList, JsonLd } from '@/lib/structured-data'
import type { Bookmark } from '@/features/bookmarks/types'

const FILE_PATH = path.join(process.cwd(), 'content', 'bookmarks.json')

// The catalogue is a file in the repo, so it only changes on deploy. An hour
// matches the rest of the site's cached reads.
export const revalidate = 3600

/**
 * Read and parsed once per process, not once per request.
 *
 * The catalogue is ~200KB of JSON. Reading and `JSON.parse`-ing it on every
 * `/bookmarks` hit produced a fresh ~550-object graph per request, which the
 * GC then had to chase — measured at roughly 14MB of retained growth over 20
 * requests on a low-heap run. `queryBookmarks` below never mutates its input
 * (it filters/sorts into new arrays), so one shared immutable instance is safe
 * for every concurrent render.
 *
 * A module-level cache is correct here specifically because the file ships in
 * the repo: the only way its contents change is a new deploy, which restarts
 * the process and repopulates this on the first request.
 */
let cache: Bookmark[] | null = null

function getBookmarks(): Bookmark[] {
  if (cache) return cache
  try {
    if (fs.existsSync(FILE_PATH)) {
      cache = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8')) as Bookmark[]
      return cache
    }
  } catch (error) {
    console.error('Failed to load initial bookmarks:', error)
  }
  return []
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.trim() : ''
  const category = typeof params.category === 'string' ? params.category : ''

  // A filtered view is a distinct page and gets its own title, so the pages
  // competing in search each describe what they actually show. Page one of an
  // unfiltered view keeps the canonical home title.
  const unfiltered = !q && (!category || category === 'All')
  const page = parsePage(
    typeof params.page === 'string' ? params.page : undefined,
  )

  if (unfiltered && page === 1) {
    return {
      title: 'Curated Bookmarks | Web Resources & Tools',
      description:
        'A curated list of developer tools, design resources, audio synthesis frameworks, and articles collected by Aditya.',
      alternates: { canonical: '/bookmarks' },
    }
  }

  const described = [q && `“${q}”`, category && category !== 'All' && category]
    .filter(Boolean)
    .join(' · ')

  return {
    title: described ? `${described} | Bookmarks` : `Bookmarks — page ${page}`,
    description: described
      ? `Bookmarks matching ${described} from a curated library of developer tools, design resources and references.`
      : 'A curated list of developer tools, design resources, audio synthesis frameworks, and articles collected by Aditya.',
    // Self-referential on page two onwards. Collapsing every page onto page one
    // would tell the index that pages 2-10 are duplicates, which is exactly
    // what deindexes a paginated set.
    alternates: {
      canonical: `/bookmarks${q ? `?q=${encodeURIComponent(q)}` : ''}${
        category && category !== 'All'
          ? `&category=${encodeURIComponent(category)}`
          : ''
      }${page > 1 ? `${q || category ? '&' : '?'}page=${page}` : ''}`,
    },
    // Filter permutations are combinatorially many and thin on content. They
    // are linkable and crawlable, just not each worth an index slot.
    robots: { index: false, follow: true },
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''
  const category = typeof params.category === 'string' ? params.category : 'All'
  const page = parsePage(
    typeof params.page === 'string' ? params.page : undefined,
  )

  const bookmarks = queryBookmarks(getBookmarks(), { q, category, page })

  // Describes this page's rows only. Claiming all 559 on page one would be
  // listing items the page does not contain; positions start at this page's
  // true offset so the numbering stays unique across the whole set.
  const jsonLd = itemList({
    name: 'Curated Bookmarks',
    description:
      'A curated list of developer tools, design resources, audio synthesis frameworks, and articles collected by Aditya.',
    startAt: (bookmarks.page - 1) * PAGE_SIZE + 1,
    items: bookmarks.items.map((bookmark) => ({
      name: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
    })),
  })

  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Bookmarks', path: '/bookmarks' },
  ])

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbs} />
      <BookmarksPage page={bookmarks} />
    </>
  )
}
