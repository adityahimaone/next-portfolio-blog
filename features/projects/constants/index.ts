export type FeaturedProject = {
  name: string
  slug: string
  githubSlug?: string
  description: string
  demo?: string
  image?: string
  tech: string[]
  isPrivate?: boolean
}

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    name: 'Hermes Agent',
    slug: 'hermes-agent',
    description:
      'High-throughput AI agent orchestration infrastructure designed for autonomous task planning, long-lived workflows, and parallel subprocess executions with real-time stream updates.',
    tech: ['Python', 'LangChain', 'Redis', 'Docker', 'WebSockets'],
    isPrivate: true,
  },
  {
    name: 'IDX Trading Toolchain',
    slug: 'idx-trading-toolchain',
    description:
      'Advanced algorithmic trading framework and market analyzer tailored for the Indonesia Stock Exchange. Features automated technical indicator computation, historical backtesting, and automated alerts.',
    tech: ['Python', 'Pandas', 'PostgreSQL', 'Grafana', 'Telegram API'],
    isPrivate: true,
  },
  {
    name: 'Enterprise HRIS Platform',
    slug: 'fatiha-sakti-hris',
    description:
      'Full-scope Human Resource Information System built for PT Fatiha Sakti, Jakarta. Orchestrates employee profiles, monthly payroll generation, dynamic tax calculation, and automated leave approvals.',
    tech: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    isPrivate: true,
  },
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
    name: 'Campus-Connect',
    slug: 'campus-connect',
    description:
      'A collaborative community platform for university students enabling peer-to-peer resource sharing, local event listings, and interactive course discussion forums.',
    tech: ['React', 'Vite', 'Firebase', 'Tailwind CSS'],
    isPrivate: true,
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
    description:
      'Send WhatsApp messages without saving the number first.',
    tech: ['TypeScript'],
  },
]

export const FEATURED_SLUGS = FEATURED_PROJECTS
  .map(p => p.githubSlug)
  .filter((slug): slug is string => !!slug)
