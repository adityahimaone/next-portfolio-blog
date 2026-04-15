export type Project = {
  name: string
  description: string
  repo: string
  demo?: string
  image?: string
  tech: string[]
  featured: boolean
  githubSlug: string
}

export const FEATURED_PROJECTS: Project[] = [
  {
    name: 'Portfolio 2025',
    description:
      'Personal portfolio with music-inspired design. Built with Next.js 15, Tailwind CSS v4.',
    repo: 'https://github.com/adityahimaone/next-portfolio-2025',
    demo: 'https://adityahimaone.tech',
    tech: ['Next.js', 'React 19', 'Tailwind CSS v4', 'TypeScript', 'Motion'],
    featured: true,
    githubSlug: 'next-portfolio-2025',
  },
  {
    name: 'Habbit Tracking',
    description:
      'Habit tracking app to build better daily routines.',
    repo: 'https://github.com/adityahimaone/habbit-tracking-next',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    featured: true,
    githubSlug: 'habbit-tracking-next',
  },
]

export const FEATURED_SLUGS = FEATURED_PROJECTS.map(p => p.githubSlug)
