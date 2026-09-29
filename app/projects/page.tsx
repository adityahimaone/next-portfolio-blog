import type { Metadata } from 'next'
import { getRepos } from '@/features/projects/lib/github'
import { FEATURED_PROJECTS } from '@/features/projects/constants'
import { ProjectsPage } from '@/features/projects'

export const metadata: Metadata = {
  title: 'Shipped Work — Projects',
  description:
    'Production frontend systems, interfaces and experiments built with Next.js, React and TypeScript — including the code behind this portfolio.',
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Shipped Work — Aditya Himawan',
    description:
      'Production frontend systems, interfaces and experiments built from architecture through interaction.',
    url: 'https://adityahimaone.space/projects',
    type: 'website',
  },
}

export default async function Page() {
  const { repos, failed } = await getRepos()

  return (
    <ProjectsPage
      repos={repos}
      featuredProjects={FEATURED_PROJECTS}
      feedFailed={failed}
    />
  )
}
