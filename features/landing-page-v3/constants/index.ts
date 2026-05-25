/**
 * V3 constants — Spatial + Motion (2026)
 * Re-exports + restructured shape over existing landing-page constants.
 * Source of truth stays in features/landing-page.
 */
import {
  EMAIL,
  EXPERIENCES,
  MIXER_DATA,
  PROJECTS_SHOWCASE,
  SOCIAL_LINKS_LANDING,
  WORK_EXPERIENCE,
} from '@/features/landing-page/constants'

export { EMAIL, SOCIAL_LINKS_LANDING, WORK_EXPERIENCE }

// ─── Manifesto / Hero ────────────────────────────────────────────
export const MANIFESTO_V3 = {
  scene: 'SCENE 01',
  release: 'PORTFOLIO 2026',
  catalog: 'V3 / SPATIAL EDITION',
  // Each line animates separately
  lines: [
    { id: 'l1', text: 'Frontend', tone: 'sans' as const },
    { id: 'l2', text: 'developer', tone: 'serif-italic' as const },
    { id: 'l3', text: 'who builds', tone: 'sans' as const },
    { id: 'l4', text: 'in motion.', tone: 'iris' as const },
  ],
  subline:
    'Building interfaces with depth, rhythm, and a sense of physical space.',
  role: 'FRONTEND ENGINEER',
  location: 'BANDUNG · INDONESIA',
  status: 'AVAILABLE FOR BOOKING',
  primaryCta: { label: 'View work', href: '#work' },
  secondaryCta: { label: 'Get in touch', href: '#contact' },
} as const

// ─── About / Profile ─────────────────────────────────────────────
export const PROFILE_V3 = {
  kicker: 'PROFILE — 02',
  headline: 'A small studio of one,\nbuilt around taste and care.',
  paragraphs: [
    'I’m Aditya — a frontend developer based in Bandung. I focus on calm, considered interfaces with React, Next.js, and TypeScript. I care about the quiet details: typography, motion curves, the feel of a click.',
    'My approach borrows from design, music, and architecture. The rhythm of a layout. The weight of a headline. The silence between sections. Software earns its character there.',
    'When I’m not at a screen, I’m walking around with a 35mm, listening to old jazz reissues, or rereading Edward Tufte.',
  ],
  pullQuote:
    '"Software earns its character in the silence between features."',
  signals: [
    { id: 'loc', label: 'Based in', value: 'Bandung, ID' },
    { id: 'avail', label: 'Available for', value: 'Freelance · Full-time' },
    { id: 'years', label: 'Years shipping', value: '8+' },
    { id: 'stack', label: 'Stack', value: 'React · Next · TS' },
  ],
} as const

// ─── Stack — orbital tag cloud ───────────────────────────────────
export type StackEntry = {
  readonly id: string
  readonly name: string
  readonly group: 'language' | 'framework' | 'tool'
}

export const STACK_V3: readonly StackEntry[] = MIXER_DATA.flatMap((g) =>
  g.channels.map((c, i) => ({
    id: `${g.id}-${i}`,
    name: c.name,
    group:
      g.id === 'languages'
        ? ('language' as const)
        : g.id === 'frameworks'
          ? ('framework' as const)
          : ('tool' as const),
  })),
)

// ─── Work / Catalog Releases ─────────────────────────────────────
export type WorkRelease = {
  readonly id: string
  readonly index: string // 01, 02, ...
  readonly title: string
  readonly genre: string
  readonly year: string
  readonly description: string
  readonly image: string
  readonly url: string
  readonly catalogNumber: string
  readonly tags: readonly string[]
}

export const WORK_V3: readonly WorkRelease[] = PROJECTS_SHOWCASE.map(
  (p, i) => ({
    id: String(p.id),
    index: String(i + 1).padStart(2, '0'),
    title: p.title,
    genre: p.genre ?? 'Web',
    year: p.year ?? '—',
    description: p.description,
    image: p.image,
    url: p.url,
    catalogNumber: `AH-${String(p.id).padStart(3, '0')}`,
    tags: [p.genre ?? 'Web', p.year ?? '2026'],
  }),
)

// ─── Timeline / Process ──────────────────────────────────────────
const periodToYear = (p: string): string => {
  const matchYears = p.match(/\b(19|20)\d{2}\b/g)
  const isPresent = /PRESENT/i.test(p)
  if (!matchYears || matchYears.length === 0) return p
  const start = matchYears[0]
  const endRaw = matchYears[matchYears.length - 1]
  const end = isPresent ? 'Present' : endRaw
  return start === end ? start : `${start} — ${end}`
}

export type TimelineEntry = {
  readonly id: string
  readonly year: string
  readonly company: string
  readonly role: string
  readonly type: string
  readonly location: string
  readonly description: readonly string[]
}

export const TIMELINE_V3: readonly TimelineEntry[] = EXPERIENCES.map((e) => {
  const description: readonly string[] =
    e.isGroup && e.items
      ? e.items.map((i) => `${i.role} · ${i.company} — ${i.description}`)
      : (e.description ?? [])
  return {
    id: String(e.id),
    year: periodToYear(e.period),
    company: e.company,
    role: e.role,
    type: e.type,
    location: e.location,
    description,
  }
})

// ─── Contact / Connect ───────────────────────────────────────────
export const CONTACT_V3 = {
  kicker: 'CONTACT — 06',
  headline: 'Let’s make\nsomething\nmemorable.',
  intro:
    'Open to freelance and full-time frontend roles. Best for considered product UI, marketing sites, and design-engineering work.',
  email: EMAIL,
  availableFor: ['Freelance', 'Full-time', 'Consulting'],
  social: SOCIAL_LINKS_LANDING,
  cta: { label: 'Send a message', href: `mailto:${EMAIL}` },
} as const

// ─── Marquee tape (between sections) ─────────────────────────────
export const MARQUEE_TAPE_V3: readonly string[] = [
  'PORTFOLIO',
  '2026',
  'SPATIAL · MOTION',
  'AH-026',
  'BANDUNG ID',
  'OPEN FOR WORK',
] as const

// ─── Section index (for nav) ─────────────────────────────────────
export const SECTIONS_V3 = [
  { id: 'manifesto', label: 'Manifesto', index: '01' },
  { id: 'profile', label: 'Profile', index: '02' },
  { id: 'work', label: 'Work', index: '03' },
  { id: 'stack', label: 'Stack', index: '04' },
  { id: 'timeline', label: 'Timeline', index: '05' },
  { id: 'contact', label: 'Contact', index: '06' },
] as const
