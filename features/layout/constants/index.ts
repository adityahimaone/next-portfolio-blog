// Layout Navigation & Footer Data

export const HOMEPAGE_NAV_ITEMS = [
  { name: 'HOME', href: '/' },
  { name: 'ABOUT', href: '/#about' },
  { name: 'SKILLS', href: '/#skills' },
  { name: 'EXP', href: '/#experience' },
  { name: 'WORK', href: '/#projects' },
  { name: 'CONTACT', href: '/#contact' },
  { name: 'BLOG', href: '/blog' },
  { name: 'PROJECTS', href: '/projects' },
  { name: 'MIXTAPE', href: '/music' },
] as const

export const SUBPAGE_NAV_ITEMS = [
  { name: 'HOME', href: '/' },
  { name: 'BLOG', href: '/blog' },
  { name: 'PROJECTS', href: '/projects' },
  { name: 'MIXTAPE', href: '/music' },
] as const

export const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    href: 'https://github.com/adityahimaone',
    color: 'from-zinc-700 to-zinc-900',
    label: '@adityahimaone',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/adityahimaone',
    color: 'from-blue-600 to-blue-800',
    label: 'adityahimaone',
  },
  {
    name: 'Spotify',
    href: 'https://open.spotify.com/user/212nmrqpklzmvpntgorzpavgq',
    color: 'from-green-500 to-emerald-600',
    label: 'My Playlists',
  },
  {
    name: 'Email',
    href: 'mailto:adityahimaone@gmail.com',
    color: 'from-purple-600 to-pink-600',
    label: 'Get in Touch',
  },
] as const

export const FOOTER_NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Projects', href: '/projects' },
  { name: 'Mixtape', href: '/music' },
] as const

export const TECH_STACK = [
  'Next.js 15',
  'React 19',
  'TypeScript',
  'Tailwind CSS',
  'Framer Motion',
  'Tone.js',
] as const
