import { WORK_PROJECTS, type WorkProject } from '@/data/projects'
// Imported from the deep path, not the `features/projects` barrel: the barrel
// re-exports `getRepos`, which would drag the GitHub fetch into the client
// bundle graph.
import { FEATURED_PROJECTS } from '@/features/projects/constants'

/**
 * A playable release. Always a real client project — these are the rows that
 * drive the player and the scroll sequence.
 */
export type LibraryTrack = WorkProject & {
  readonly album: string
  /** Synced lines for the lyric view. */
  readonly lyrics: readonly string[]
}

const REAL_LYRICS: Record<string, readonly string[]> = {
  Switchyard: [
    'One board, one queue, no handoff',
    'Dispatch lands where the task lives',
    'Every run leaves a trace you can read',
    'Review happens where the work happened',
    'Nothing hides in a second tab',
    'The agent stops when the work stops',
  ],
  'Primarindo Asia': [
    'Manufacturing, made scannable',
    'Product lines on one honest grid',
    'Capability without the brochure tone',
    'A public face that matches the plant',
    'The facts first, the pitch after',
    'Clear enough to forward to a client',
  ],
  'Habit Tracker': [
    'Log the day in a single tap',
    'Miss once and the streak survives',
    'The week reads in one glance',
    'No dashboard sprawl to decode',
    'Small enough to keep every morning',
    'Momentum you can actually see',
  ],
  SeaPhantom: [
    'Landing page for a Web3 product',
    'Explain the collection, not the jargon',
    'Responsive from the first breakpoint',
    'A door, not a dead end',
    'The pitch ends where the product starts',
    'Built to hand off cleanly',
  ],
  'SeaPhantom P2P': [
    'Account states you can read at a glance',
    'Confirm before the trade commits',
    'Every pending state has feedback',
    'Trading without the guesswork',
    'Failure modes surfaced, not swallowed',
    'The interface admits what it does not know',
  ],
  Labgrownbeasts: [
    'A profile site for a small team',
    'The work explains itself',
    'Case studies in the order people arrive',
    'Company story without a sales call',
    'Maintainable by the people who own it',
    'Clarity as a competitive edge',
  ],
}

const ALBUMS = [
  'Selected Work',
  'Proof In The Product',
  'Interface Notes',
] as const

/** The playable releases. Scroll and the transport address these only. */
export const LIBRARY_TRACKS: readonly LibraryTrack[] = WORK_PROJECTS.map(
  (project, index) => ({
    ...project,
    album: ALBUMS[index % ALBUMS.length] as string,
    lyrics: REAL_LYRICS[project.title] ?? project.highlights,
  }),
)

export type ArchiveTrack = {
  readonly name: string
  readonly description: string
  readonly url: string
  readonly tech: readonly string[]
  readonly cover: string
}

/**
 * Sourced from FEATURED_PROJECTS so the archive reflects real repositories
 * rather than invented rows. Read-only: listed for reference and deliberately
 * not playable, so these never enter the scroll sequence.
 */
const ARCHIVE_COVERS: readonly string[] = [
  '/assets/frontend-resources.png',
  '/assets/thumbnail-habit-tracker.png',
  '/assets/thumbnail-fe-resources.png',
  '/assets/quick-chat-wa.png',
  '/assets/primarindo.png',
]

export const ARCHIVE_TRACKS: readonly ArchiveTrack[] = FEATURED_PROJECTS.map(
  (project, index) => ({
    name: project.name,
    description: project.description,
    url:
      project.demo ?? `https://github.com/adityahimaone/${project.githubSlug}`,
    tech: project.tech,
    cover: ARCHIVE_COVERS[index % ARCHIVE_COVERS.length] as string,
  }),
)

export type ArtistRow = {
  readonly id: number
  readonly name: string
  readonly meta: string
  /** Two stops for the generated avatar. */
  readonly from: string
  readonly to: string
}

/**
 * Placeholder credits, sized to match a real player's artist column. The
 * avatars are generated gradients rather than photographs, so nothing implies a
 * real person endorsed this work.
 */
export const ARTIST_ROWS: readonly ArtistRow[] = [
  {
    id: 0,
    name: 'Taylor Swift',
    meta: '221M listeners · 14 albums',
    from: '#f2a1b8',
    to: '#b45a86',
  },
  {
    id: 1,
    name: 'Ariana Grande',
    meta: '196M listeners · 9 albums',
    from: '#d8b4a0',
    to: '#8c5f4d',
  },
  {
    id: 2,
    name: 'Dua Lipa',
    meta: '210M listeners · 3 albums',
    from: '#9fd6e0',
    to: '#3f7f95',
  },
  {
    id: 3,
    name: 'Sabrina Carpenter',
    meta: '148M listeners · 6 albums',
    from: '#f6d68a',
    to: '#c08a3e',
  },
  {
    id: 4,
    name: 'NIKI',
    meta: '92M listeners · 2 albums',
    from: '#b9a7e6',
    to: '#5f4b9c',
  },
  {
    id: 5,
    name: 'Billie Eilish',
    meta: '205M listeners · 2 albums',
    from: '#8fd9c0',
    to: '#2f6f5c',
  },
]

/** Header avatar, distinct from the credits list. */
export const nowPlayingArtist: ArtistRow = {
  id: 0,
  name: 'Aditya Himawan',
  meta: 'Frontend engineer · Jakarta',
  from: '#ff9a5c',
  to: '#c2481c',
}

export const GITHUB_URL = 'https://github.com/adityahimaone'
