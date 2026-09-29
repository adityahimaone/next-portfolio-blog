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
  icon: LucideIcon
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
      'A keyboard-first workflow board that turns a pile of tabs into one routeable list. Built for people who keep their whole workday in a browser.',
    cover: '/work/switchyard-cover.webp',
    url: 'https://github.com/adityahimaone/switchyard',
    genre: 'Developer tools',
    year: 2024,
    role: 'Design and build',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    highlights: [
      'One board replaces the tab strip',
      'Every item keeps its origin route',
      'Keyboard-first, mouse-optional',
      'Shipped as a static export',
    ],
    icon: Globe,
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
      'One catalogue across every plant',
      'Enquiry flow cut from five steps to two',
      'Editors ship changes without a deploy',
      'Largest screen size reduced 38%',
    ],
    icon: 'globe' as unknown as LucideIcon,
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
      'Streaks survive timezone travel',
      'Weekly review replaces daily nagging',
      'Local-first storage, no account',
      'Installable as a PWA',
    ],
    icon: Zap,
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
      'Wallet connect without a modal maze',
      'Gallery scrolls smoothly on mobile',
      'Ownership verified on chain',
      'Lazy-loaded mint flow',
    ],
    icon: Cpu,
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
      'Escrow states legible without docs',
      'Order book updates without a reload',
      'Settlement is explained, not implied',
      'Keyboard reachable throughout',
    ],
    icon: Database,
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
      'Science written for a general reader',
      'Gallery preloads before scroll',
      'Editorial structure, not a landing page',
      'Print stylesheet included',
    ],
    icon: Layers,
  },
]

export const WORK_PROJECTS: WorkProject[] = SEEDS.map((seed, index) => ({
  ...seed,
  id: index,
  palette: palette(index),
}))

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
