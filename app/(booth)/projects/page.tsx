import type { Metadata } from 'next'
import { getRepos } from '@/features/projects/lib/github'
import { FEATURED_PROJECTS } from '@/features/projects/constants'
import { ProjectsPage } from '@/features/projects'
import { WORK_PROJECTS } from '@/data/projects'
import { itemList, JsonLd } from '@/lib/structured-data'
import { WEBSITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Shipped Work — Projects',
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
  const { repos, failed } = await getRepos()

  const jsonLd = itemList({
    name: 'Shipped Work',
    description:
      'Production frontend systems, interfaces and experiments built with Next.js, React and TypeScript.',
    items: WORK_PROJECTS.map((project) => ({
      name: project.title,
      url: project.url.startsWith('http')
        ? project.url
        : `${WEBSITE_URL}${project.url}`,
      description: project.description,
    })),
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <ProjectsPage
        repos={repos}
        featuredProjects={FEATURED_PROJECTS}
        feedFailed={failed}
      />
    </>
  )
}
