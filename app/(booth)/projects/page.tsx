import type { Metadata } from 'next'
import { getContributions, getRepos } from '@/features/projects/lib/github'
import { FEATURED_PROJECTS } from '@/features/projects/constants'
import { ProjectsPage } from '@/features/projects'
import { WORK_PROJECTS } from '@/data/projects'
import { breadcrumbList, itemList, JsonLd } from '@/lib/structured-data'
import { WEBSITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Shipped Work',
  description:
    'Production frontend systems, interfaces and experiments built with Next.js, React and TypeScript — including the code behind this portfolio.',
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Shipped Work — Aditya Himawan',
    description:
      'Production frontend systems, interfaces and experiments built from architecture through interaction.',
    url: `${WEBSITE_URL}/projects`,
    type: 'website',
    // No explicit image. Next replaces the root openGraph block rather than
    // merging it, so declaring one here without `images` meant this page
    // emitted no og:image at all and shared links rendered bare. The sibling
    // `opengraph-image.tsx` supplies it by convention.
  },
  twitter: {
    card: 'summary_large_image',
    site: '@adityahimaone',
    title: 'Shipped Work — Aditya Himawan',
    description:
      'Production frontend systems, interfaces and experiments built from architecture through interaction.',
  },
}

export default async function Page() {
  // Both feeds are independent and each degrades on its own, so they are
  // fetched together rather than in sequence — one GitHub round trip's latency
  // instead of two.
  const [
    { repos, failed },
    { days: contributions, failed: contributionsFailed },
  ] = await Promise.all([getRepos(), getContributions()])

  const jsonLd = itemList({
    name: 'Shipped Work',
    description:
      'Production frontend systems, interfaces and experiments built with Next.js, React and TypeScript.',
    items: WORK_PROJECTS.map((project) => ({
      name: project.title,
      // Points at the local case study, not the off-site artefact. The ItemList
      // is a list of *this site's* pages; linking the external URL here meant
      // the site's own index listed nothing that belonged to it, and the detail
      // pages it now has were discoverable from neither the list nor the sitemap.
      url: `${WEBSITE_URL}/projects/${project.slug}`,
      description: project.description,
    })),
  })

  // Breadcrumbs were emitted only on blog posts. `/projects` is one level deep
  // and was eligible all along.
  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
  ])

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbs} />
      <ProjectsPage
        repos={repos}
        featuredProjects={FEATURED_PROJECTS}
        contributions={contributions}
        contributionsFailed={contributionsFailed}
        feedFailed={failed}
      />
    </>
  )
}
