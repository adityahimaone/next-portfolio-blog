// Layout Navigation & Footer Data — The Concept Album

export const HOMEPAGE_NAV_ITEMS = [
  { name: 'OVERTURE', href: '/#overture', track: '01' },
  { name: 'LINER NOTES', href: '/#about', track: '02' },
  { name: 'PATCH BAY', href: '/#skills', track: '03' },
  { name: 'TOUR HISTORY', href: '/#experience', track: '04' },
  { name: 'CRATE DIGGING', href: '/#projects', track: '05' },
  { name: 'ENCORE', href: '/#contact', track: '06' },
] as const

export const SUBPAGE_NAV_ITEMS = [
  { name: 'HOME', href: '/' },
  { name: 'BLOG', href: '/blog' },
  { name: 'PROJECTS', href: '/projects' },
] as const

export const PAGE_LINKS = [
  { name: 'BLOG', href: '/blog' },
  { name: 'PROJECTS', href: '/projects' },
] as const

export const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    href: 'https://github.com/adityahimaone',
    label: '@adityahimaone',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/adityahimaone',
    label: 'adityahimaone',
  },
  {
    name: 'Spotify',
    href: 'https://open.spotify.com/user/212nmrqpklzmvpntgorzpavgq',
    label: 'My Playlists',
  },
  {
    name: 'Email',
    href: 'mailto:adityahimaone@gmail.com',
    label: 'Get in Touch',
  },
] as const

export const FOOTER_NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Projects', href: '/projects' },
] as const

export const TECH_STACK = [
  'Next.js 15',
  'React 19',
  'TypeScript',
  'Tailwind CSS v4',
  'Motion',
] as const
