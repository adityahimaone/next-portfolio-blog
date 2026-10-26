import type { Project } from '../types'

/**
 * The catalogue, in sleeve order.
 *
 * `cover` is optional on purpose. Three of these releases have no photograph
 * that deserves to be on a cover, and bolting a stock image onto them would
 * read as filler — so the card renders a generated sleeve instead: a chromatic
 * wash keyed to `accent`, with the catalogue number set large. Two do have real
 * artwork, and use it.
 */
export const PROJECTS: Project[] = [
  {
    id: 'project-9router',
    slug: '9router',
    order: 1,
    title: '9Router',
    category: 'AI Infrastructure',
    tagline:
      'One OpenAI-compatible endpoint routing 60+ providers with three-tier fallback.',
    summary:
      'A gateway that presents sixty-odd model providers as a single OpenAI-shaped API. The interesting part was never the protocol translation — it was deciding what happens when a provider degrades mid-stream, and making that decision legible to whoever is on call.',
    year: 2026,
    role: 'Design and build',
    stack: ['Next.js', 'TypeScript', 'Edge', 'SQLite'],
    highlights: [
      'Three-tier fallback: same-provider retry, then peer model, then a local queue.',
      'Streaming is preserved across a fallback — the client sees one continuous response.',
      'Per-key routing rules and cost ceilings, editable without a redeploy.',
      'Every hop is logged with the reason it was taken, readable by a human.',
    ],
    links: [
      { kind: 'live', label: 'Case study', href: '/projects' },
      {
        kind: 'source',
        label: 'Archive',
        href: 'https://github.com/adityahimaone',
      },
    ],
    cover: '',
    coverAlt: '',
    accent: '#96e6ea',
    span: 'feature',
    preview: {
      src: '/music/attention.mp3',
      title: 'Attention — Instrumental',
      duration: '0:34',
    },
  },
  {
    id: 'project-signal',
    slug: 'signal',
    order: 2,
    title: 'Signal',
    category: 'Site',
    tagline: 'A studio-rack portfolio that plays back everything I ship.',
    summary:
      'This site, in an earlier movement. The brief to myself was simple: if a section does not earn its place, it comes out. What is left is a rack of instruments rather than a set of pages, and the audio is not decoration — it is the navigation metaphor.',
    year: 2026,
    role: 'Design and build',
    stack: ['Next.js 16', 'GSAP', 'Web Audio'],
    highlights: [
      'Persistent audio graph mounted in the root layout, so playback survives navigation.',
      'Scroll choreography driven by GSAP timelines rather than per-section observers.',
      'Rendered end to end from a typed content layer with no CMS dependency.',
    ],
    links: [
      {
        kind: 'case',
        label: 'Read the rebuild notes',
        href: '/notes/thirty-dead-components',
      },
      { kind: 'live', label: 'Live', href: '/' },
    ],
    cover: '/work/switchyard-cover.webp',
    coverAlt: 'Signal — the studio-rack portfolio, in its dark configuration.',
    accent: '#a9a0f0',
    span: 'standard',
  },
  {
    id: 'project-habit-engine',
    slug: 'habit-engine',
    order: 3,
    title: 'Habit Engine',
    category: 'Product',
    tagline: 'Streaks, heat maps and a calendar that forgives.',
    summary:
      'A habit tracker built for the person who has already quit three of them. The calendar is the product: it shows what happened, not what should have happened, and it has no opinion about a missed Tuesday.',
    year: 2025,
    role: 'Design and build',
    stack: ['React', 'D1', 'Service Worker'],
    highlights: [
      'Local-first writes with a replayable mutation log; offline is a normal state.',
      'Streak logic that survives a timezone change, which is where most of them break.',
      'A single-tap daily interaction — the whole daily loop is one target.',
    ],
    links: [
      { kind: 'live', label: 'Case study', href: '/projects/habit-tracker' },
      { kind: 'source', label: 'Archive', href: '/projects' },
    ],
    cover: '/work/habit-tracker-cover.webp',
    coverAlt: 'Habit Engine — a year of squares, most of them filled.',
    accent: '#f2b878',
    span: 'standard',
  },
  {
    id: 'project-crate',
    slug: 'crate',
    order: 4,
    title: 'Crate',
    category: 'Archive',
    tagline: 'Bookmarks that behave like a record shelf.',
    summary:
      'A personal archive of six hundred links, filed the way a record shop files records — by feel, not by folder. Search is instant because the index is built at write time, and every entry keeps the sentence that made it worth saving.',
    year: 2025,
    role: 'Design and build',
    stack: ['Search', 'SQLite FTS', 'Next.js'],
    highlights: [
      'Full-text search over title, note and page text, under 30ms on device.',
      'A shelf view that reads density rather than a list of rows.',
      'Import from browser exports without a cleanup pass.',
    ],
    links: [
      { kind: 'live', label: 'Open the shelf', href: '/bookmarks' },
      {
        kind: 'case',
        label: 'How it works',
        href: '/notes/thirty-dead-components',
      },
    ],
    cover: '',
    coverAlt: '',
    accent: '#cbcfda',
    span: 'standard',
  },
  {
    id: 'project-booth',
    slug: 'booth',
    order: 5,
    title: 'Booth',
    category: 'Audio',
    tagline: 'An in-browser listening room for the mixtapes.',
    summary:
      'A WebGL booth that reacts to whatever is playing, built as a place rather than a player. It is the only part of the site that uses the GPU, and it is deliberately behind a click — a room you choose to enter.',
    year: 2025,
    role: 'Design and build',
    stack: ['Audio', 'WebGL', 'React Three Fiber'],
    highlights: [
      'One analyser feeding both the shader and the UI, so the two cannot drift.',
      'The scene sleeps when the tab is hidden instead of rendering at 60fps for nobody.',
      'Falls back to a static plate when WebGL is unavailable — no empty canvas.',
    ],
    links: [
      { kind: 'live', label: 'Enter the booth', href: '/music' },
      { kind: 'case', label: 'Listening notes', href: '/notes/frontend-2026' },
    ],
    cover: '',
    coverAlt: '',
    accent: '#e49aa8',
    span: 'wide',
  },
]

/**
 * The rest of the shelf. Hand-written links rather than generated ones: an
 * archive row that 404s is worse than one that is missing.
 */
export interface ArchiveEntry {
  index: string
  title: string
  href: string
  meta: string
}

export const ARCHIVE: ArchiveEntry[] = [
  {
    index: '06',
    title: 'Primarindo Asia',
    href: '/projects/primarindo-asia',
    meta: 'Corporate · CMS',
  },
  {
    index: '07',
    title: 'SeaPhantom',
    href: '/projects/seaphantom',
    meta: 'Web3 · Wallet',
  },
  {
    index: '08',
    title: 'SeaPhantom P2P',
    href: '/projects/seaphantom-p2p',
    meta: 'Web3 · Escrow',
  },
  {
    index: '09',
    title: 'The full archive',
    href: '/projects',
    meta: '14 releases',
  },
]
