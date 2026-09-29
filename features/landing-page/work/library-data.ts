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
    lyrics: project.highlights,
  }),
)

export type ArchiveTrack = {
  readonly name: string
  readonly description: string
  readonly url: string
  readonly tech: readonly string[]
  readonly cover: string
  /** Seeds the generated cover art, so a row always draws the same art. */
  readonly slug: string
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
    slug: project.githubSlug,
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
 * The credits column, sized to match a real player's artist column. The
 * avatars are generated gradients rather than photographs.
 *
 * These used to be real artists' names with invented listener counts. The
 * metaphor was fine; borrowing six real people's names and hanging fabricated
 * statistics on them was not something to put above a "Get in touch" button in
 * a portfolio a client is reading to decide whether to hire you. They are now
 * the actual clients and collaborators behind the work, which fills the same
 * six rows and is the one version that is true.
 */
export const ARTIST_ROWS: readonly ArtistRow[] = [
  {
    id: 0,
    name: 'Bisadaya',
    meta: 'Job platform · 15K users',
    from: '#f2a1b8',
    to: '#b45a86',
  },
  {
    id: 1,
    name: '80&Company',
    meta: 'HR management · Kyoto',
    from: '#d8b4a0',
    to: '#8c5f4d',
  },
  {
    id: 2,
    name: 'Primarindo Asia',
    meta: 'Manufacturing · Jakarta',
    from: '#9fd6e0',
    to: '#3f7f95',
  },
  {
    id: 3,
    name: 'Niqcode',
    meta: 'Product studio · Partner',
    from: '#f6d68a',
    to: '#c08a3e',
  },
  {
    id: 4,
    name: 'Unzyp Solusi',
    meta: 'E-commerce · Jakarta',
    from: '#b9a7e6',
    to: '#5f4b9c',
  },
  {
    id: 5,
    name: 'Campus Connect',
    meta: 'Launched in three months',
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
