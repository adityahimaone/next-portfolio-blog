import type { Metadata } from 'next'
import { JsonLd, breadcrumbList } from '@/lib/structured-data'
import { GuidePage } from '@/features/guides/components/guide-page'
import { GUIDES, guideMetadata } from '@/features/guides/lib/guides'

/**
 * `/guides/vps-vs-vercel` — the comparison page the checklist asked for.
 *
 * The `vs` shape is the one that matches an existing search intent: someone
 * comparing hosting options is not looking for a hosted-platform tutorial. It
 * also gives the self-hosting cluster a second entry point for a different
 * query than the how-to pillar targets.
 *
 * The matrix is deliberately plain — no pricing figures that would go stale on
 * their own. Anything that changes often is stated as a range or a relative,
 * because a comparison page full of stale numbers is worse than no page.
 *
 * No `FAQPage` here: this route has no questions and answers, and emitting the
 * graph for an empty set would claim otherwise.
 */
const SLUG = 'vps-vs-vercel'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return guideMetadata(slug ?? SLUG)
}

export default async function VpsVsVercel() {
  const meta = GUIDES[SLUG]

  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: meta.title, path: `/guides/${meta.slug}` },
  ])

  return (
    <>
      <JsonLd data={breadcrumbs} />

      <GuidePage meta={meta} />
    </>
  )
}
