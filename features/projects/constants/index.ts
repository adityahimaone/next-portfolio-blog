export type FeaturedProject = {
  name: string
  slug: string
  githubSlug: string
  description: string
  demo?: string
  image?: string
  tech: string[]
}

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    name: 'Portfolio 2025',
    slug: 'portfolio-2025',
    githubSlug: 'next-portfolio-2025',
    description:
      'Personal portfolio with music-inspired design. Built with Next.js 15, Tailwind CSS v4, and a feature-based architecture.',
    demo: 'https://adityahimaone.tech',
    image: '/images/projects/portfolio.png',
    tech: ['Next.js', 'React 19', 'Tailwind CSS v4', 'TypeScript', 'Motion'],
  },
  {
    name: 'Habbit Tracking',
    slug: 'habbit-tracking',
    githubSlug: 'habbit-tracking-next',
    description:
      'Habit tracking app to build better daily routines. Track streaks, view weekly overviews, and stay consistent.',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
  },
  {
    name: 'Frontend Resources',
    slug: 'frontend-resources',
    githubSlug: 'frontend-resources',
    description:
      'A curated collection of frontend resources — articles, tools, and libraries for building better web applications.',
    tech: ['TypeScript', 'Next.js'],
  },
  {
    name: 'Money Tracker',
    slug: 'money-tracker',
    githubSlug: 'money-tracker',
    description:
      'Simple money tracking application to manage personal finances.',
    tech: ['JavaScript'],
  },
  {
    name: 'Quick Chat WhatsApp',
    slug: 'quick-chat-wa',
    githubSlug: 'QuickChatWhatsapp',
    description: 'Send WhatsApp messages without saving the number first.',
    tech: ['TypeScript'],
  },
]

/**
 * Record-label colours for the shelf, applied by position: a spine only reads
 * as a spine when neighbouring releases differ (design.md §1).
 */
export const RELEASE_LABELS = [
  '#e0b75a',
  '#7abb5e',
  '#ff8a5e',
  '#c9a574',
  '#5cd6a3',
] as const

export function releaseLabel(index: number): string {
  return RELEASE_LABELS[index % RELEASE_LABELS.length]
}
