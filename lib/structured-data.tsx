import { WEBSITE_URL } from './constants'

/**
 * JSON-LD for the list routes.
 *
 * Only the home page emitted structured data before this, so the three index
 * pages were describing themselves to crawlers with nothing but a title and a
 * meta description. `ItemList` is the type that actually matches what they
 * are — an ordered list of things, each with a position.
 *
 * Everything here is a plain object rather than JSX so the shapes stay
 * testable, and the one component that renders it keeps the same
 * `application/ld+json` + `dangerouslySetInnerHTML` pattern the home page
 * already established.
 */

export type ListEntry = {
  name: string
  url: string
  description?: string
}

/**
 * An ordered list of the items on one page of a listing.
 *
 * `startAt` matters on a paginated route: page seven of /bookmarks starts at
 * position 361, not 1, so the positions are globally unique and stable across
 * the whole set rather than restarting on every page.
 */
export function itemList({
  items,
  name,
  description,
  startAt = 1,
}: {
  items: readonly ListEntry[]
  name: string
  description: string
  startAt?: number
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: startAt + index,
      name: item.name,
      url: item.url,
      ...(item.description ? { description: item.description } : {}),
    })),
  }
}

/**
 * A single blog post.
 *
 * `wordCount` is deliberately absent — nothing here reads the post body to
 * count it, and guessing a number for a field Google may use to judge article
 * depth is worse than omitting it.
 */
export function blogPosting({
  title,
  description,
  datePublished,
  url,
  tags,
  image,
}: {
  title: string
  description: string
  datePublished: string
  url: string
  tags: readonly string[]
  image?: string
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished,
    ...(tags.length ? { keywords: tags.join(', ') } : {}),
    ...(image ? { image } : {}),
    author: {
      '@type': 'Person',
      name: 'Aditya Himawan',
      url: WEBSITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'en',
  }
}

/**
 * The trail Home → Blog → this post.
 *
 * `/blog/[slug]` already renders a visible breadcrumb nav, so this describes
 * the same trail in a form a crawler can read. Positions are 1-based, as the
 * spec requires.
 */
export function breadcrumbList(
  crumbs: readonly { name: string; path: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${WEBSITE_URL}${crumb.path}`,
    })),
  }
}

/**
 * Renders a graph into a script tag.
 *
 * `<` is escaped so a title containing one cannot close the script element and
 * inject markup — the JSON is data, and this is the one place that boundary
 * is crossed.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is JSON.stringify'd, and `<` is escaped above, so this
      // cannot close the script element early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
