import { EMAIL, EXPERIENCES, MIXER_DATA } from '../constants'
import { LIBRARY_TRACKS } from '../work/library-data'
import { RESUME_URL } from '../rack-01/shared'

/**
 * The landing page's copy, in one place.
 *
 * The redesign changes the frame, not the record. Every string below is either
 * an existing site fact (experience, stack, project) or a line that describes
 * the work already on the page. Nothing here invents a client, a metric or a
 * reading the rest of the site cannot back up.
 */

export type NavItem = {
  readonly id: string
  readonly label: string
  readonly href: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'index', label: 'Index', href: '#index' },
  { id: 'practice', label: 'Practice', href: '#practice' },
  { id: 'record', label: 'Record', href: '#record' },
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'contact', label: 'Contact', href: '#contact' },
]

export type Fact = { readonly value: string; readonly label: string }

export const FACTS: readonly Fact[] = [
  { value: '4+', label: 'years in production' },
  { value: '15K+', label: 'users on Bisadaya' },
  { value: '6', label: 'selected releases' },
]

export const HERO_READOUT = {
  tempo: '112',
  key: 'JAKARTA',
  status: 'OPEN FOR SELECT WORK',
} as const

export type PracticeChannel = {
  readonly name: string
  readonly level: number
}

export type PracticeGroup = {
  readonly id: string
  readonly label: string
  readonly type: string
  readonly channels: readonly PracticeChannel[]
}

/**
 * The mixer is the skill set, transposed.
 *
 * A fader's position is the level the data already carries, and the three
 * groups are the three places the work happens. There is no fourth "soft
 * skills" channel because that would be a label with no signal behind it.
 */
export const PRACTICE: readonly PracticeGroup[] = MIXER_DATA.map((group) => ({
  id: group.id,
  label: group.label,
  type: group.type,
  channels: group.channels,
}))

export type RecordEntry = {
  readonly id: string
  readonly role: string
  readonly company: string
  readonly location: string
  readonly period: string
  readonly type: string
  readonly notes: readonly string[]
}

const asEntry = (item: (typeof EXPERIENCES)[number]): RecordEntry => ({
  id: `record-${item.id}`,
  role: item.role,
  company: item.company,
  location: item.location,
  period: item.period,
  type: item.type,
  notes:
    item.description ??
    item.items?.map((entry) => `${entry.role}. ${entry.description}`) ??
    [],
})

export const RECORD: readonly RecordEntry[] = EXPERIENCES.map(asEntry)

export type Release = {
  readonly index: number
  readonly slug: string
  readonly title: string
  readonly year: number
  readonly genre: string
  readonly role: string
  readonly description: string
  readonly stack: readonly string[]
  readonly url: string
  readonly cover: string
  readonly accent: string
  readonly wash: string
}

export const RELEASES: readonly Release[] = LIBRARY_TRACKS.map(
  (track, index) => ({
    index: index + 1,
    slug: track.slug,
    title: track.title,
    year: track.year,
    genre: track.genre,
    role: track.role,
    description: track.description,
    stack: track.stack,
    url: track.url,
    cover: track.cover,
    accent: track.palette.accent,
    wash: track.palette.a,
  }),
)

export const SOCIAL_LINKS = [
  { label: 'Email', href: `mailto:${EMAIL}` },
  { label: 'GitHub', href: 'https://github.com/adityahimaone' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/adityahimaone' },
  { label: 'Resume', href: RESUME_URL },
] as const

export const CONTACT_EMAIL = EMAIL

export const FOOTER_NOTE =
  'Built with Next.js, React, Three.js and GSAP. The signal is real; the 3D is a drawing.'
