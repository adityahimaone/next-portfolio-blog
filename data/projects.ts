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
    cover:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/fphb7ddemp4ixeutav1b.webp',
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
    cover:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/mqprcb6todunicq4cg0a.webp',
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
 * Newest first, which is what the section heading promises the visitor.
 * Sorting here rather than hand-ordering SEEDS means a new project added at
 * the bottom lands in the right place without anyone remembering to move it —
 * SEEDS order is 2024, 2024, 2026, 2022, so the raw order was the one place
 * this could silently drift from the copy again.
 *
 * The spread-then-sort keeps SEEDS first, so two projects sharing a year stay
 * in the order they were written rather than flipping between builds.
 */
export const WORK_PROJECTS: WorkProject[] = SEEDS.map((seed, index) => ({
  ...seed,
  id: index,
  palette: palette(index),
}))
  .sort((a, b) => b.year - a.year)
  .map((project, index) => ({ ...project, id: index }))

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
