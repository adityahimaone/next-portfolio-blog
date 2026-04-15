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

export async function getRepos(): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${GITHUB_API}/users/${USERNAME}/repos?sort=pushed&per_page=30`,
    { next: { revalidate: 3600 } } // Cache 1 hour
  )

  if (!res.ok) {
    console.error('Failed to fetch repos:', res.status)
    return []
  }

  const repos: GitHubRepo[] = await res.json()

  return repos.filter(
    r => !r.archived && r.name !== USERNAME && r.name !== USERNAME + '.github.io'
  )
}

export async function getFeaturedRepos(slugs: string[]): Promise<GitHubRepo[]> {
  const repos = await getRepos()
  return repos.filter(r => slugs.includes(r.name))
}
