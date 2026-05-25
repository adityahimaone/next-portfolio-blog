/**
 * V2 constants — re-exports + restructured shape over the existing
 * landing-page constants. Source of truth stays in features/landing-page.
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

// ─── Hero ────────────────────────────────────────────────────────────
export const HERO_V2 = {
  sideALabel: 'SIDE A',
  release: 'PORTFOLIO 2026',
  catalog: 'CAT NO. AH-026',
  name: 'ADITYA\nHIMAONE',
  role: 'FRONTEND DEVELOPER',
  location: 'BANDUNG · ID',
  // single primary CTA per brief
  primaryCta: { label: 'Browse the catalog', href: '#catalog' },
  secondaryCta: { label: 'Booking', href: '#booking' },
  scrollCue: 'TURN OVER FOR LINER NOTES',
} as const

// ─── About / Liner notes ─────────────────────────────────────────────
export const ABOUT_V2 = {
  kicker: 'LINER NOTES',
  headline: 'Crafting interfaces with intent.',
  paragraphs: [
    'Frontend developer based in Bandung, focused on calm, considered interfaces. I build with React, Next.js and TypeScript, and care about the small details — typography, motion, and the feel of a click.',
    'My approach borrows from print and music: the rhythm of a layout, the weight of a headline, the silence between sections. Software gets its character from those choices.',
    'Outside of code I read about design systems, take photos on a 35mm, and dig through old jazz reissues for inspiration.',
  ],
  pullQuote:
    'Software gets its character from the choices you make in the spaces between features.',
  metadata: [
    { label: 'Based in', value: 'Bandung, ID' },
    { label: 'Available for', value: 'Freelance · Full-time' },
    { label: 'Years shipping', value: '8+' },
    { label: 'Stack', value: 'React · Next · TS' },
  ],
} as const

// ─── Credits (was Skills / Mixer) ────────────────────────────────────
// We drop the level bars — credits style only.
export type CreditsGroup = {
  readonly id: string
  readonly label: string
  readonly entries: readonly string[]
}

export const CREDITS_V2: readonly CreditsGroup[] = MIXER_DATA.map((g) => ({
  id: g.id,
  label:
    g.id === 'languages'
      ? 'Languages'
      : g.id === 'frameworks'
        ? 'Frameworks'
        : 'Tools & FX',
  entries: g.channels.map((c) => c.name),
}))

// ─── Discography (was Experience) ────────────────────────────────────
export type CatalogEntry = {
  readonly id: string
  readonly year: string
  readonly label: string
  readonly role: string
  readonly type: string
  readonly location: string
  readonly description: readonly string[]
}

const periodToYear = (p: string): string => {
  // turns 'OCT 2022 - PRESENT' into '2022 — Present', '2021 - 2022' into '2021 — 22'
  const matchYears = p.match(/\b(19|20)\d{2}\b/g)
  const isPresent = /PRESENT/i.test(p)
  if (!matchYears || matchYears.length === 0) return p
  const start = matchYears[0]
  const endRaw = matchYears[matchYears.length - 1]
  const end = isPresent ? 'Present' : endRaw
  return start === end ? start : `${start} — ${end}`
}

export const DISCOGRAPHY_V2: readonly CatalogEntry[] = EXPERIENCES.map(
  (e) => {
    const description: readonly string[] =
      e.isGroup && e.items
        ? e.items.map(
            (i) => `${i.role} · ${i.company} — ${i.description}`,
          )
        : (e.description ?? [])
    return {
      id: String(e.id),
      year: periodToYear(e.period),
      label: e.company,
      role: e.role,
      type: e.type,
      location: e.location,
      description,
    }
  },
)

// ─── Catalog (was Projects) ──────────────────────────────────────────
// Drop vinylColor / vinylIcon. Editorial cards only.
export type CatalogRelease = {
  readonly id: string
  readonly title: string
  readonly genre: string
  readonly year: string
  readonly description: string
  readonly image: string
  readonly url: string
  readonly catalogNumber: string
}

export const CATALOG_V2: readonly CatalogRelease[] = PROJECTS_SHOWCASE.map(
  (p, i) => ({
    id: String(p.id),
    title: p.title,
    genre: p.genre ?? 'Web',
    year: p.year ?? '—',
    description: p.description,
    image: p.image,
    url: p.url,
    catalogNumber: `AH-${String(p.id).padStart(3, '0')}`,
  }),
)

// ─── Booking (was Contact) ───────────────────────────────────────────
export const BOOKING_V2 = {
  kicker: 'BOOKING',
  headline: 'Let’s build something memorable.',
  intro:
    'Open to freelance and full-time frontend roles. Best for considered product UI, marketing sites, and design-engineering work.',
  email: EMAIL,
  availableFor: ['Freelance', 'Full-time', 'Consulting'],
  social: SOCIAL_LINKS_LANDING,
} as const
