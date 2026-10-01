import type {
  BreadcrumbList,
  BlogPosting,
  CreativeWork,
  FAQPage,
  ItemList,
  Person,
  Question,
  SearchActionLeaf,
  WebSite,
} from 'schema-dts'

import { DEFAULT_ARTICLE_IMAGE, WEBSITE_URL } from './constants'

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
 *
 * The return types are `schema-dts` types rather than `Record<string, unknown>`.
 * That is the point: a typo like `dateModifed`, or a `BreadcrumbList` whose
 * items are missing `position`, is now a type error rather than invalid JSON-LD
 * that only a Rich Results validator would ever notice.
 */

/** Anything this module emits goes through this, whatever its shape. */
export type Graph = WithContext<
  | ItemList
  | BlogPosting
  | CreativeWork
  | BreadcrumbList
  | WebSite
  | Person
  | FAQPage
>

type WithContext<T> = T & { '@context': 'https://schema.org' }

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
}): Graph {
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
 * `image` is required, not optional. Article rich results are ineligible
 * without it, and no post sets a `cover` in frontmatter, so the `...(image ?)`
 * guard this used to have never once fired — every post was declaring a
 * BlogPosting with no image at all while the sibling `opengraph-image.tsx`
 * rendered a perfectly good one for the OG tag. The two disagreed, and the
 * graph is the one a crawler reads. Callers can pass a real cover; anything
 * omitted falls back to the site-level article image.
 *
 * `wordCount` is deliberately absent — nothing here reads the post body to
 * count it, and guessing a number for a field Google may use to judge article
 * depth is worse than omitting it.
 */
export function blogPosting({
  title,
  description,
  datePublished,
  dateModified,
  url,
  tags,
  image,
}: {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  url: string
  tags: readonly string[]
  image?: string
}): Graph {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished,
    // Only claim a modification date when one is actually known. Omitting the
    // field is honest; defaulting it to `datePublished` on every post would put
    // a freshness signal on 13 posts that have never been edited since.
    ...(dateModified ? { dateModified } : {}),
    ...(tags.length ? { keywords: tags.join(', ') } : {}),
    // Never omit this — see the note above on why the old guard was wrong.
    image: image ?? DEFAULT_ARTICLE_IMAGE,
    author: {
      '@type': 'Person',
      name: 'Aditya Himawan',
      url: WEBSITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Aditya Himawan',
      url: WEBSITE_URL,
      image: `${WEBSITE_URL}/memoji-1.png`,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'en',
  }
}

/**
 * The site itself, as its own entity.
 *
 * Without this the `Person` on the home page stands alone with nothing naming
 * the site it belongs to, so a crawler had no `sitename` to attach to the
 * domain. `potentialAction` describes the `/blog` search, which already exists.
 */
export function webSite(): Graph {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'adityahimaone',
    alternateName: 'Aditya Himawan',
    url: WEBSITE_URL,
    inLanguage: 'en',
    publisher: {
      '@type': 'Person',
      name: 'Aditya Himawan',
      url: WEBSITE_URL,
      image: `${WEBSITE_URL}/memoji-1.png`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${WEBSITE_URL}/blog?q={search_term_string}`,
      },
      // `query-input` is a Google extension rather than a schema.org property,
      // so `schema-dts` rejects it on `SearchAction`. Google still documents it
      // and still reads it, so it stays — declared explicitly here instead of
      // via a blanket cast, so the one place this happens is visible.
      'query-input': 'required name=search_term_string',
    } as SearchActionLeaf & { 'query-input': string },
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
): Graph {
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
 * One shipped project.
 *
 * `/projects` describes its six entries as `ItemList` name/url/description
 * strings, which is the correct type for a listing but says nothing about the
 * work itself — no author, no date, no genre. Every project's `url` is also
 * off-site, so before `/projects/[slug]` existed there was no URL on this domain
 * that described any of it in a form a crawler could read.
 *
 * `image` is required for the same reason it is on `blogPosting`: a CreativeWork
 * with no image is ineligible for rich results. Falls back to the site image
 * when a project ships no cover — two of the six currently have none.
 */
export function creativeWork({
  title,
  description,
  url,
  image,
  genre,
  year,
  stack,
}: {
  title: string
  description: string
  url: string
  image?: string
  genre?: string
  year?: number
  stack?: readonly string[]
}): Graph {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description,
    url,
    image: image ?? DEFAULT_ARTICLE_IMAGE,
    ...(genre ? { genre } : {}),
    ...(year ? { dateCreated: String(year) } : {}),
    ...(stack?.length ? { keywords: stack.join(', ') } : {}),
    creator: {
      '@type': 'Person',
      name: 'Aditya Himawan',
      url: WEBSITE_URL,
    },
  }
}

/**
 * The person this site belongs to.
 *
 * Was inlined in `app/page.tsx` and again in the new `/about` page, which is
 * exactly the arrangement that lets two copies of a name, an email and a list of
 * schools drift apart without anything failing. One builder, one Person.
 *
 * `mainEntity` on the home page's `WebSite` already points here, so the two
 * are describing the same entity rather than two similar ones.
 */
export function person({
  description,
  knowsAbout,
  sameAs,
  alumniOf,
  email = 'adityahimaone@gmail.com',
}: {
  description?: string
  knowsAbout: readonly string[]
  sameAs: readonly string[]
  alumniOf: readonly string[]
  email?: string
}): Graph {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aditya Himawan',
    url: WEBSITE_URL,
    // Without an `image` a Person entity has nothing for a knowledge panel to
    // show, and the site already has a public avatar to point at.
    image: `${WEBSITE_URL}/memoji-1.png`,
    jobTitle: 'Frontend Engineer',
    email,
    ...(description ? { description } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jakarta',
      addressCountry: 'ID',
    },
    knowsAbout: [...knowsAbout],
    alumniOf: alumniOf.map((name) => ({
      '@type': 'EducationalOrganization',
      name,
    })),
    sameAs: [...sameAs],
  }
}

/**
 * A set of questions and answers, for the "People also ask" surface.
 *
 * Only valid on a page that visibly shows the same questions and answers — the
 * markup is a claim about what is on the page, not a place to stash keywords.
 */
export function faqPage(
  entries: readonly { question: string; answer: string }[],
): Graph {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(
      (entry): Question => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: { '@type': 'Answer', text: entry.answer },
      }),
    ),
  }
}

/**
 * Renders a graph into a script tag.
 *
 * `<` is escaped so a title containing one cannot close the script element and
 * inject markup — the JSON is data, and this is the one place that boundary
 * is crossed.
 */
export function JsonLd({ data }: { data: Graph }) {
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
