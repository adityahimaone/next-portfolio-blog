/**
 * The landing page is one continuous side: a studio wall the reader scrolls
 * past. The colours are shared with the sticker-slap footer at the bottom, so
 * the last frame is already in the first one.
 */
export const PALETTE = {
  paper: '#f3ecdf',
  paperHi: '#fffaf1',
  paperLo: '#e9dfcf',
  ink: '#191a2e',
  muted: '#5f5b6e',
  line: 'rgba(25, 26, 46, 0.16)',
  cobalt: '#3d53d6',
  cobaltInk: '#2c3cae',
  cobaltWash: '#e8ebff',
  tangerine: '#ff6a2b',
  butter: '#ffd23f',
  pink: '#ffb6e1',
  mint: '#b7e4c7',
  sky: '#a9c8ff',
} as const

export const CONTACT = {
  email: 'adityahimaone@gmail.com',
  href: 'mailto:adityahimaone@gmail.com',
  location: 'Jakarta, Indonesia',
  timezone: 'GMT+7',
  resume: '/resume.pdf',
} as const

export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/adityahimaone' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/adityahimaone' },
  { label: 'X', href: 'https://x.com/adityahimaone' },
] as const

export const CHAPTERS = [
  { id: 'home', label: 'Intro', number: '00' },
  { id: 'about', label: 'About', number: '01' },
  { id: 'showcase', label: 'Show & tell', number: '02' },
  { id: 'work', label: 'Work', number: '03' },
  { id: 'skills', label: 'Skills', number: '04' },
  { id: 'contact', label: 'Contact', number: '05' },
] as const

export type ChapterId = (typeof CHAPTERS)[number]['id']

export const HERO_FACTS = [
  { value: '4+', label: 'years shipping frontends' },
  { value: '15k+', label: 'people using the work' },
  { value: '6', label: 'sides in the catalogue' },
] as const

export const ABOUT_FACTS = [
  {
    key: 'Day job',
    value:
      'Design engineer at Niqcode — product interfaces for manufacturing, developer tools and finance.',
  },
  {
    key: 'Practice',
    value:
      'Four years in React and TypeScript. The browser is where I decide, not just deliver.',
  },
  {
    key: 'Home',
    value:
      'Jakarta, GMT+7. Remote-friendly, chronically online at reasonable hours.',
  },
  {
    key: 'Off-screen',
    value:
      'Badminton, coffee that takes too long, and crates of records with one good song.',
  },
] as const

export const PRINCIPLES = [
  {
    number: '01',
    title: 'Make it legible.',
    line: 'If a new teammate cannot see what a screen is doing in three seconds, the screen is not finished.',
  },
  {
    number: '02',
    title: 'Motion earns its keep.',
    line: 'Every move explains a change, keeps a place, or gives an answer back. Nothing moves because it can.',
  },
  {
    number: '03',
    title: 'Leave it easy to change.',
    line: 'The next person will have less context than me. Types, tokens and honest names are for them.',
  },
] as const

export type ShowcaseStudy = {
  id: string
  title: string
  year: string
  tags: readonly string[]
  blurb: string
  madeWith: string
  favourite: string
}

export const SHOWCASE_STUDIES: readonly ShowcaseStudy[] = [
  {
    id: 'sun-club',
    title: 'Sun Club',
    year: '2026',
    tags: ['poster', 'type', 'colour'],
    blurb:
      'A membership card for a club that only exists on this page. Built to test how loud a single warm colour can be when the type stays quiet.',
    madeWith: 'CSS gradients, repeating conic rays, one very patient circle',
    favourite:
      'The rays are one repeated gradient. Change a single custom property and the whole poster swings.',
  },
  {
    id: 'peel-here',
    title: 'Peel Here',
    year: '2026',
    tags: ['stickers', 'print', 'system'],
    blurb:
      'A sticker sheet drawn in code: nine die-cut shapes, one shared white outline, and a dashed cut line that does the explaining.',
    madeWith: 'Inline SVG, a shared clipping technique, no image files',
    favourite:
      'The white border is the same 11px stroke on every shape, so a heart and a bolt feel like siblings.',
  },
  {
    id: 'type-tray',
    title: 'Type Tray',
    year: '2025',
    tags: ['type', 'specimen', 'layout'],
    blurb:
      'A specimen for the three voices this site uses. One tray, three jobs: display, reading, and the small machine labels.',
    madeWith: 'Syne, Geist and Geist Mono, set in the browser',
    favourite:
      'The mono labels are deliberately tiny. They should read like a ruler, not a headline.',
  },
  {
    id: 'spring-study',
    title: 'Spring Study',
    year: '2025',
    tags: ['motion', 'interaction', 'curves'],
    blurb:
      'The same distance covered three ways. A note to myself about when a spring is charming and when it is just late.',
    madeWith: 'CSS transitions, three curves, a lot of watching dots',
    favourite:
      'The loose line is the most fun and the worst button. That is the whole lesson.',
  },
]

export type SkillGroup = {
  id: string
  eyebrow: string
  title: string
  line: string
  skills: readonly string[]
  tone: 'cobalt' | 'butter' | 'pink' | 'paper'
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    id: 'build',
    eyebrow: 'Daily drivers',
    title: 'Build',
    line: 'The stack that pays the rent. I care about the boring half: typed data at the edge, loading states that tell the truth, error paths someone bothered to design.',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    tone: 'cobalt',
  },
  {
    id: 'motion',
    eyebrow: 'The part I sweat',
    title: 'Motion',
    line: 'Springs, scroll-linked reveals and state changes that land where the eye expects. Motion for React, GSAP and the browser’s own APIs.',
    skills: ['Motion', 'GSAP', 'CSS transitions', 'WAAPI'],
    tone: 'butter',
  },
  {
    id: 'systems',
    eyebrow: 'How it stays usable',
    title: 'Systems',
    line: 'Tokens, accessible components and performance budgets. A page that only works on my laptop is not finished.',
    skills: ['Design systems', 'Accessibility', 'Performance', 'Playwright'],
    tone: 'pink',
  },
  {
    id: 'also',
    eyebrow: 'Also in the bag',
    title: 'The rest',
    line: 'Enough of everything else to be useful in a room: design files, a database, a deploy, a bug report that actually reproduces.',
    skills: ['Figma', 'Git', 'Cloudflare', 'PostgreSQL', 'Vitest', 'Go'],
    tone: 'paper',
  },
]

export const WORK_NOTES = [
  'Product interfaces that survive real data',
  'Design systems people keep using',
  'Motion that explains, not decorates',
  'Front-end rescue work, with the tests',
] as const

export function scrollToSection(id: string, reduced: boolean) {
  document.getElementById(id)?.scrollIntoView({
    behavior: reduced ? 'auto' : 'smooth',
    block: 'start',
  })
}
