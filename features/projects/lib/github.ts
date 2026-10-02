const GITHUB_API = 'https://api.github.com'
const USERNAME = 'adityahimaone'

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
    `${GITHUB_API}/users/${USERNAME}/repos?sort=pushed&per_page=30`,
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
        r.name !== USERNAME &&
        r.name !== `${USERNAME}.github.io`,
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
