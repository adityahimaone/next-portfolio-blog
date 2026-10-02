import type { Metadata } from 'next'
import { BookmarksPage } from '@/features/bookmarks'
import {
  queryBookmarks,
  parsePage,
  PAGE_SIZE,
} from '@/features/bookmarks/lib/bookmarks'
import { breadcrumbList, itemList, JsonLd } from '@/lib/structured-data'
import { readBookmarks } from '@/lib/d1'

// The catalogue lives in D1 rather than a JSON file, so an hour is no longer
// the ceiling on staleness. Kept as-is because these pages are revalidated
// through the incremental cache anyway.
export const revalidate = 3600

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

  const bookmarks = queryBookmarks(await readBookmarks(), { q, category, page })

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
