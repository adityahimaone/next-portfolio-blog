import { WORK_PROJECTS, type WorkProject } from '@/data/projects'
import { formatRelative } from '@/lib/date'
// Imported from the deep path, not the `features/projects` barrel: the barrel
// re-exports `getRepos`, which would drag the GitHub fetch into the client
// bundle graph.
import { FEATURED_PROJECTS } from '@/features/projects/constants'
import type { ArchiveRepo } from '@/features/projects/lib/github'

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
  /** Empty means "draw the generated cover" — see the Cover fallback. */
  readonly cover: string
  /** Seeds the generated cover art, so a row always draws the same art. */
  readonly slug: string
}

/**
 * Repos that are already represented elsewhere on the page, so they are not
 * repeated in the archive.
 *
 * The six playable releases match on their own repository slug, and the older
 * FEATURED_PROJECTS entries match on the repo they point at. Without this the
 * archive listed three of the six projects that are already one scroll away.
 */
const ALREADY_SHOWN = new Set([
  ...WORK_PROJECTS.map(
    (project) =>
      // A project url is either its repo or its demo site; the repo name is the
      // last path segment in either case.
      project.url.split('/').filter(Boolean).pop()?.toLowerCase() ?? '',
  ),
  ...FEATURED_PROJECTS.map((project) => project.githubSlug.toLowerCase()),
])

/**
 * Builds the archive from live repositories, most recently pushed first — the
 * same feed and ordering the /projects session log reads, so both surfaces show
 * one set of rows in one order rather than two hand-maintained lists.
 *
 * Read-only by design: these are not playable, so they never enter the scroll
 * sequence. Rows are only a hint at what else exists, which is why the panel
 * caps the list and points at /projects for the rest.
 */
export function buildArchiveTracks(
  repos: readonly ArchiveRepo[],
): readonly ArchiveTrack[] {
  return repos
    .filter((repo) => !ALREADY_SHOWN.has(repo.name.toLowerCase()))
    .map((repo) => ({
      name: repo.name,
      // A repo without a description reads better as its language than as an
      // empty second line.
      description:
        repo.description ??
        `${repo.language ?? 'Project'} · ${formatRelative(repo.pushed_at)}`,
      url: repo.html_url,
      tech: repo.language ? [repo.language] : [],
      // No real image exists for a repo, so the generated cover is the only
      // honest option. Seeding by repo name means a row's art is stable.
      cover: '',
      slug: repo.name,
    }))
}

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
