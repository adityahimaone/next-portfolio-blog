const GITHUB_API = 'https://api.github.com'
const GITHUB_WEB = 'https://github.com'
export const GITHUB_USER = 'adityahimaone'

export type GitHubRepo = {
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  topics: string[]
  language: string | null
  stargazers_count: number
  updated_at: string
  pushed_at: string
  archived: boolean
}

export type RepoFeed = {
  repos: GitHubRepo[]
  /** Lets the session log tell "nothing pushed" apart from "the fetch failed". */
  failed: boolean
}

export async function getRepos(): Promise<RepoFeed> {
  const res = await fetch(
    `${GITHUB_API}/users/${GITHUB_USER}/repos?sort=pushed&per_page=30`,
    { next: { revalidate: 3600 } }, // Cache 1 hour
  )

  if (!res.ok) {
    console.error('Failed to fetch repos:', res.status)
    return { repos: [], failed: true }
  }

  const repos: GitHubRepo[] = await res.json()

  return {
    repos: repos.filter(
      (r) =>
        !r.archived &&
        r.name !== GITHUB_USER &&
        r.name !== `${GITHUB_USER}.github.io`,
    ),
    failed: false,
  }
}

/**
 * The subset the landing page actually reads, for passing into the client
 * rack.
 *
 * The GitHub response carries ~30 fields per repo — `node_id`, `owner`,
 * `avatar_url`, eleven `*_url` variants, `permissions`, and so on. The landing
 * archive uses four of them. Because the rack is a client tree, whatever the
 * page passes gets serialised into the RSC payload inlined in the HTML: 58
 * repos' worth of full objects was ~180KB of the document that had to be
 * received, parsed and walked before the first paint, which is most of the
 * mobile LCP. Mapping to the four fields used takes that to a few KB.
 *
 * /projects keeps the full objects — it renders more of them and is not on the
 * landing critical path.
 */
export type ArchiveRepo = Pick<
  GitHubRepo,
  'name' | 'description' | 'html_url' | 'language' | 'pushed_at'
>

export function toArchiveRepos(
  repos: readonly GitHubRepo[],
): readonly ArchiveRepo[] {
  return repos.map((repo) => ({
    name: repo.name,
    description: repo.description,
    html_url: repo.html_url,
    language: repo.language,
    pushed_at: repo.pushed_at,
  }))
}

export type ContributionDay = { date: string; count: number }

export type ContributionFeed = {
  days: ContributionDay[]
  /** Lets the UI tell "no activity" apart from "the fetch failed". */
  failed: boolean
}

/**
 * A year of contribution counts, as `{ date, count }[]`.
 *
 * There is no public REST endpoint for the contribution graph — the API only
 * exposes it to an authenticated user's own token, and the popular third-party
 * mirrors are unversioned and go down without notice (the
 * `github-contributions-api.deno.dev` one this used to use now 404s, Deno
 * Deploy Classic having been sunset). What GitHub *does* serve publicly is the
 * rendered grid at /users/<name>/contributions: one `data-date` cell per day,
 * each paired with a `tool-tip` whose text is the plain-English count. So we
 * read the same numbers GitHub puts on the profile, with no token and no
 * third-party dependency in the request path.
 *
 * A browser User-Agent is sent because the endpoint 403s the default
 * `node`/undici one — it serves HTML to real clients, not to scripts that
 * identify as scripts.
 *
 * The shape is a scrape, so every step is defensive: if the markup shifts and
 * the cells stop parsing we return an empty, `failed: true` feed and the
 * component falls back to its own seeded sample year rather than rendering a
 * blank or misleading chart. Cached hourly, same as the repo feed.
 */
export async function getContributions(): Promise<ContributionFeed> {
  const res = await fetch(`${GITHUB_WEB}/users/${GITHUB_USER}/contributions`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; portfolio-contribution-graph)',
      Accept: 'text/html',
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    console.error('Failed to fetch contributions:', res.status)
    return { days: [], failed: true }
  }

  const html = await res.text()
  const days = parseContributions(html)

  if (!days.length) {
    console.error(
      'Contribution grid parsed to zero days — markup may have changed',
    )
    return { days: [], failed: true }
  }

  return { days, failed: false }
}

/**
 * Pull `{ date, count }` pairs out of the rendered contribution grid.
 *
 * Each cell is followed immediately by its tooltip, so the two are matched in
 * one pass with the pair non-greedy and DOTALL — pairing by `for="…"` id would
 * break the moment GitHub changed the cell id format, while adjacency has been
 * stable. The count comes from the leading integer of the tooltip text
 * ("3 contributions on April 26th."); a day with no contributions reads "No
 * contributions on …" and becomes a 0.
 *
 * Exported for the test — it is the one piece of this file that is a pure
 * function of its input, and the piece most likely to break silently.
 */
export function parseContributions(html: string): ContributionDay[] {
  const cell =
    /data-date="(\d{4}-\d{2}-\d{2})"[^>]*><\/td>\s*<tool-tip[^>]*>([\s\S]*?)<\/tool-tip>/g
  const out: ContributionDay[] = []

  for (const match of html.matchAll(cell)) {
    const count = /(\d+)\s+contribution/.exec(match[2].replace(/<[^>]+>/g, ''))
    out.push({ date: match[1], count: count ? Number(count[1]) : 0 })
  }

  return out
}
