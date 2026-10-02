import type { Metadata } from 'next'
import { JsonLd, breadcrumbList, faqPage } from '@/lib/structured-data'
import { GuidePage } from '@/features/guides/components/guide-page'
import { GUIDES, guideFaq, guideMetadata } from '@/features/guides/lib/guides'

/**
 * `/guides/self-hosting-nextjs` — the pillar page for the cluster the blog
 * already contained but never named.
 *
 * Four posts covered VPS hosting, Nginx, PM2, Prometheus and Tailscale, all
 * with overlapping tags, and nothing on the site tied them together. Each was
 * individually findable and collectively incoherent: a reader arriving on any
 * one of them had no route to the other three.
 *
 * This page is the hub. It carries `FAQPage` structured data, which is the
 * "answer People Also Ask questions" item from the SEO checklist, and it is
 * built entirely from material already published — no new claims are made here
 * that the linked posts do not support.
 *
 * The page itself is `GuidePage` now; this file is metadata and structure. The
 * copy, the step list and the FAQ moved to `features/guides/lib/guides.ts`
 * because the FAQ is emitted twice — visibly by the reader, and as `FAQPage`
 * JSON-LD here — and two copies of the same seven answers is exactly how a
 * structured-data claim goes quietly untrue.
 */
const SLUG = 'self-hosting-nextjs'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  // `slug` is always this route's own on a static segment, but `generateMetadata`
  // types it loosely; falling back keeps a stale `params` from emitting metadata
  // for a page that is not on screen.
  return guideMetadata(slug ?? SLUG)
}

export default async function SelfHostingGuide() {
  const meta = GUIDES[SLUG]
  const faq = guideFaq(SLUG)

  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: meta.title, path: `/guides/${meta.slug}` },
  ])

  return (
    <>
      {/*
        Only the pillar carries an FAQ. `guideFaq` returns an empty array for the
        comparison guide, and `faqPage([])` would emit a `FAQPage` with zero
        questions — a structured-data claim about a page that has none.
      */}
      {faq.length > 0 ? <JsonLd data={faqPage(faq)} /> : null}
      <JsonLd data={breadcrumbs} />

      <GuidePage meta={meta} />
    </>
  )
}
