import type { Metadata } from 'next'
import { BlogPage, getAllPosts } from '@/features/blog'
import { itemList, JsonLd } from '@/lib/structured-data'
import { WEBSITE_URL } from '@/lib/constants'

// The posts here are overwhelmingly self-hosting, VPS and infrastructure
// writing — Nginx, PM2, Prometheus, Tailscale, AI gateways — so the index is
// described around that. The previous copy promised "frontend development,
// design, and code" and matched almost nothing published here, which is a
// mismatch between what the page claims and what a visitor finds.
const DESCRIPTION =
  'Notes on self-hosting, VPS deployment, Nginx, PM2, Prometheus and Docker, written while running production infrastructure.'

function first(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value.trim()
  return ''
}

/**
 * `/blog` reads `q`, `tag` and `sort` from the URL (see `blog-list.tsx`), so
 * every filter permutation is a distinct render of the same post set. Metadata
 * was a flat export that ignored `searchParams` entirely, so all of them
 * declared `canonical: '/blog'` while rendering content that does not match it
 * — the exact duplicate-content signal the canonical tag exists to prevent.
 *
 * Filtered and re-sorted views are self-canonical and noindexed, which is what
 * `/bookmarks` already does for the same situation. The unfiltered default view
 * keeps the canonical index title.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const q = first(params.q)
  const tag = first(params.tag)
  const sort = first(params.sort) === 'asc' ? 'asc' : 'desc'

  // `sort=desc` is what the list defaults to, so it is not a distinct view.
  const unfiltered = !q && !tag && sort === 'desc'

  if (unfiltered) {
    return {
      title: 'Blog',
      description: DESCRIPTION,
      alternates: {
        canonical: '/blog',
        // The feed has existed at /rss.xml all along but nothing pointed a
        // reader or a crawler at it.
        types: { 'application/rss+xml': `${WEBSITE_URL}/rss.xml` },
      },
      openGraph: {
        title: 'Blog — Aditya Himawan',
        description: DESCRIPTION,
        url: `${WEBSITE_URL}/blog`,
        type: 'website',
        // The sibling `opengraph-image.tsx` supplies this by convention; the
        // previous value was a third-party ucarecdn hotlink, which put the most
        // shared asset for the whole blog behind someone else's CDN.
      },
      twitter: {
        card: 'summary_large_image',
        site: '@adityahimaone',
        title: 'Blog — Aditya Himawan',
        description: DESCRIPTION,
      },
    }
  }

  const described = [q && `“${q}”`, tag].filter(Boolean).join(' · ')

  return {
    title: described ? `${described} | Blog` : `Blog (oldest first)`,
    description: described
      ? `${DESCRIPTION.replace(/\.$/, '')} filtered to ${described}.`
      : DESCRIPTION,
    alternates: { canonical: '/blog' },
    // Combinatorially many, thin, and all reachable from post bodies, which
    // link to `/blog?tag=<tag>`. Linkable and crawlable, but each not worth an
    // index slot. Collapsing the canonical onto the unfiltered page instead
    // would be worse — it tells the index these are duplicates of /blog while
    // they render different rows.
    robots: { index: false, follow: true },
  }
}

export default async function Page() {
  const posts = await getAllPosts()

  // Describes the full post set, not whatever filter is applied — this list is
  // the same on every permutation of the query, and positions must stay stable
  // across them.
  const jsonLd = itemList({
    name: 'Blog — adityahimaone',
    description: DESCRIPTION,
    items: posts.map((post) => ({
      name: post.title,
      url: `${WEBSITE_URL}/blog/${post.slug}`,
      description: post.description,
    })),
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogPage posts={posts} />
    </>
  )
}
