import type { LucideIcon } from 'lucide-react'
import { Cpu, Database, Globe, Layers, Zap } from 'lucide-react'

/** Two wash colours plus the accent that drives a project's glass rims. */
export interface ProjectPalette {
  a: string
  b: string
  accent: string
}

export type WorkProject = {
  id: number
  slug: string
  title: string
  description: string
  /** 1:1 artwork. Local path or allow-listed remote URL. */
  cover: string
  url: string
  /** Reads as the genre on a sleeve. */
  genre: string
  year: number
  /** Liner notes: personnel line. */
  role: string
  /** Liner notes: personnel chips. */
  stack: string[]
  /** Liner notes tracklist, and the "lyrics" that light up on the turntable. */
  highlights: string[]
  palette: ProjectPalette
}

/**
 * Reuses the palettes the rack section already had, promoted to exported
 * data. `a`/`b` drive the ambient wash, `accent` the glass rims.
 */
const PALETTES: ProjectPalette[] = [
  { a: '#315d72', b: '#7eb8c7', accent: '#7eb8c7' },
  { a: '#476b50', b: '#8fc49a', accent: '#8fc49a' },
  { a: '#a55b35', b: '#dc8752', accent: '#dc8752' },
  { a: '#563f70', b: '#9c7fbd', accent: '#9c7fbd' },
  { a: '#36466f', b: '#7489bd', accent: '#7489bd' },
  { a: '#743f3f', b: '#b96862', accent: '#b96862' },
]

function palette(index: number): ProjectPalette {
  return PALETTES[index % PALETTES.length]
}

type Seed = Omit<WorkProject, 'id' | 'palette'>

const SEEDS: Seed[] = [
  {
    slug: 'switchyard',
    title: 'Switchyard',
    description:
      'A control plane for coding agents. Boards and tasks live in one place, a dispatcher claims each one, and results wait in review until someone approves the diff.',
    cover: '/work/switchyard-cover.webp',
    url: 'https://github.com/adityahimaone/switchyard',
    genre: 'Developer tools',
    year: 2024,
    role: 'Design and build',
    stack: ['Go', 'SQLite', 'React', 'Vite', 'gRPC'],
    highlights: [
      'One board, one queue, no handoff',
      'Dispatch lands where the task lives',
      'Every run leaves a trace you can read',
      'Review happens where the work happened',
      'Nothing hides in a second tab',
      'The agent stops when the work stops',
    ],
  },
  {
    slug: 'primarindo-asia',
    title: 'Primarindo Asia',
    description:
      'A manufacturing group running several plants on one site. Content, catalogue and enquiry flows rebuilt so the sales team stopped maintaining duplicate pages.',
    cover: '/work/primarindo-asia-cover.webp',
    url: 'https://primarindo.niqcode.com/',
    genre: 'Corporate',
    year: 2024,
    role: 'Frontend lead',
    stack: ['Next.js', 'TypeScript', 'CMS'],
    highlights: [
      'Manufacturing, made scannable',
      'Product lines on one honest grid',
      'Capability without the brochure tone',
      'A public face that matches the plant',
      'The facts first, the pitch after',
      'Clear enough to forward to a client',
    ],
  },
  {
    slug: 'habit-tracker',
    title: 'Habit Tracker',
    description:
      'A habit tracker built around streaks and weekly review rather than daily guilt. Local-first, so the data never leaves the device.',
    cover: '/work/habit-tracker-cover.webp',
    url: 'https://habit.adityahimaone.space/',
    genre: 'Utility',
    year: 2026,
    role: 'Design and build',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    highlights: [
      'Log the day in a single tap',
      'Miss once and the streak survives',
      'The week reads in one glance',
      'No dashboard sprawl to decode',
      'Small enough to keep every morning',
      'Momentum you can actually see',
    ],
  },
  {
    slug: 'seaphantom',
    title: 'SeaPhantom',
    description:
      'A collectible NFT storefront with on-chain verification, wallet connection and a gallery that stays readable on a phone.',
    cover:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/y2l1g36bjudgsf6yr0eg.webp',
    url: 'https://seaphantom.com',
    genre: 'Web3',
    year: 2022,
    role: 'Frontend engineer',
    stack: ['React', 'Web3.js', 'Tailwind CSS'],
    highlights: [
      'Landing page for a Web3 product',
      'Explain the collection, not the jargon',
      'Responsive from the first breakpoint',
      'A door, not a dead end',
      'The pitch ends where the product starts',
      'Built to hand off cleanly',
    ],
  },
  {
    slug: 'seaphantom-p2p',
    title: 'SeaPhantom P2P',
    description:
      'The peer-to-peer trading desk for the same collection: escrow, live order book and settlement states, designed to be readable at a glance.',
    // No artwork for this one: an empty cover draws the generated album-art
    // fallback, the same treatment the "More on GitHub" archive rows use.
    cover: '',
    url: 'https://auth.seaphantom.com/',
    genre: 'DeFi',
    year: 2022,
    role: 'Frontend engineer',
    stack: ['React', 'TypeScript', 'Web3.js'],
    highlights: [
      'Account states you can read at a glance',
      'Confirm before the trade commits',
      'Every pending state has feedback',
      'Trading without the guesswork',
      'Failure modes surfaced, not swallowed',
      'The interface admits what it does not know',
    ],
  },
  {
    slug: 'labgrownbeasts',
    title: 'Labgrownbeasts',
    description:
      'A biotech brand site built to make a hard subject feel plain: long-form science, clear structure, and a gallery that loads before you scroll to it.',
    // Generated cover, for the same reason as SeaPhantom P2P above.
    cover: '',
    url: 'https://labgrownbeasts.com/',
    genre: 'Biotech',
    year: 2022,
    role: 'Frontend engineer',
    stack: ['Next.js', 'CMS', 'Tailwind CSS'],
    highlights: [
      'A profile site for a small team',
      'The work explains itself',
      'Case studies in the order people arrive',
      'Company story without a sales call',
      'Maintainable by the people who own it',
      'Clarity as a competitive edge',
    ],
  },
]

/**
 * The order the six releases are presented in, by slug.
 *
 * Explicit rather than sorted by year: the section is a curated set, not a
 * changelog, and Switchyard leads because it is the strongest thing here. A
 * year sort put Habit Tracker (2026) first and demoted everything else, and
 * the heading's "newest first" then had to be reworded instead of the data
 * being fixed. Listing the order here means a new project goes where it
 * belongs by being added to this array, and the A1/B1 labels, the sleeve
 * tags and the turntable all follow from it.
 */
const ORDER: readonly string[] = [
  'switchyard',
  'primarindo-asia',
  'habit-tracker',
  'seaphantom',
  'seaphantom-p2p',
  'labgrownbeasts',
]

const ORDERED_SEEDS = ORDER.map((slug) => {
  const seed = SEEDS.find((candidate) => candidate.slug === slug)
  if (!seed) throw new Error(`ORDER lists "${slug}", which is not in SEEDS`)
  return seed
})

// Anything added to SEEDS without being added to ORDER would silently vanish
// from the site, so fail loudly rather than dropping it.
const missing = SEEDS.filter((seed) => !ORDER.includes(seed.slug)).map(
  (seed) => seed.slug,
)
if (missing.length > 0) {
  throw new Error(`SEEDS entries missing from ORDER: ${missing.join(', ')}`)
}

export const WORK_PROJECTS: WorkProject[] = ORDERED_SEEDS.map(
  (seed, index) => ({
    ...seed,
    id: index,
    palette: palette(index),
  }),
)

/** Seconds of "playback" each project gets in the turntable preview. */
export const PROJECT_PREVIEW_DURATION = 185

export function formatProjectTime(seconds: number) {
  const safe = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safe / 60)
  return `${minutes}:${(safe % 60).toString().padStart(2, '0')}`
}

/** A1..A3 then B1..B3 — the six projects split into two sides. */
export function trackLabel(index: number, count = WORK_PROJECTS.length) {
  const perSide = Math.ceil(count / 2)
  const side = index < perSide ? 'A' : 'B'
  return `${side}${(index % perSide) + 1}`
}
