
# Projects Page Design

## Overview

Showcase real projects — both static (manually curated) and dynamic (auto-fetched from GitHub). Homepage section + optional dedicated `/projects` page.

## Data Strategy

### Option A: Static Only (Simple)
Curated list in `data/projects.ts`. Manually update when adding new projects.

### Option B: Dynamic from GitHub (Recommended)
Fetch repos from GitHub API, filtered by criteria. Auto-updates when you push new repos.

### Option C: Hybrid (Best)
Static "featured" projects with custom descriptions + dynamic "recent" from GitHub.

**Recommendation:** Option C — Hybrid. Featured projects get full treatment (images, detailed descriptions), recent repos auto-populate.

## Project Data Model

```typescript
type Project = {
  name: string
  slug: string
  description: string
  longDescription?: string       // For detail page
  repo: string                   // GitHub URL
  demo?: string                  // Live demo URL
  image?: string                 // Screenshot/preview
  tech: string[]                 // ['Next.js', 'Tailwind', 'TypeScript']
  featured: boolean              // Show prominently
  status: 'active' | 'archived' | 'wip'
  startDate: string
}
```

## Featured Projects

### 1. Portfolio Website (This Site)
```typescript
{
  name: 'Portfolio',
  slug: 'portfolio-2025',
  description: 'Personal portfolio with music-inspired design. Built with Next.js 15, Tailwind v4.',
  repo: 'https://github.com/adityahimaone/next-portfolio-2025',
  demo: 'https://adityahimaone.tech',
  tech: ['Next.js', 'React 19', 'Tailwind CSS v4', 'TypeScript', 'Motion'],
  featured: true,
  status: 'active',
}
```

### 2. Habbit Tracking
```typescript
{
  name: 'Habbit Tracking',
  slug: 'habbit-tracking-next',
  description: 'Habit tracking app built with Next.js.',
  repo: 'https://github.com/adityahimaone/habbit-tracking-next',
  tech: ['Next.js', 'TypeScript'],
  featured: true,
  status: 'active',
}
```

### 3. _(Add more as needed)_

## Implementation

### File: `features/projects/github.ts`

```typescript
const GITHUB_API = 'https://api.github.com'
const USERNAME = 'adityahimaone'

type GitHubRepo = {
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
    `${GITHUB_API}/users/${USERNAME}/repos?sort=updated&per_page=30`,
    { next: { revalidate: 3600 } } // Cache 1 hour
  )
  
  if (!res.ok) throw new Error('Failed to fetch repos')
  
  const repos: GitHubRepo[] = await res.json()
  
  return repos.filter(r => !r.archived && r.name !== USERNAME)
}

export async function getFeaturedRepos(slugs: string[]) {
  const repos = await getRepos()
  return repos.filter(r => slugs.includes(r.name))
}
```

### File: `features/projects/data.ts`

```typescript
export type FeaturedProject = {
  name: string
  slug: string
  githubSlug: string     // For matching with GitHub API
  description: string
  longDescription?: string
  demo?: string
  image?: string
  tech: string[]
  featured: true
}

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    name: 'Portfolio 2025',
    slug: 'portfolio-2025',
    githubSlug: 'next-portfolio-2025',
    description: 'Personal portfolio with music-inspired design.',
    tech: ['Next.js 15', 'React 19', 'Tailwind CSS v4', 'TypeScript'],
    demo: 'https://adityahimaone.tech',
  },
  {
    name: 'Habbit Tracking',
    slug: 'habbit-tracking',
    githubSlug: 'habbit-tracking-next',
    description: 'Habit tracking app to build better daily routines.',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
  },
]

// Slugs for auto-fetching from GitHub
export const FEATURED_SLUGS = FEATURED_PROJECTS.map(p => p.githubSlug)
```

### File: `features/projects/projects-section.tsx`

```tsx
import { FEATURED_PROJECTS } from '@/data/projects'
import { getRepos } from '@/lib/github'
import { ProjectCard } from '@/components/project-card'

export async function ProjectsSection() {
  const repos = await getRepos()
  
  // Merge featured data with live GitHub data
  const featured = FEATURED_PROJECTS.map(fp => {
    const repo = repos.find(r => r.name === fp.githubSlug)
    return {
      ...fp,
      stars: repo?.stargazers_count ?? 0,
      lastUpdated: repo?.pushed_at ?? '',
      language: repo?.language ?? '',
    }
  })
  
  // Recent repos (not featured, top 4 by update time)
  const recent = repos
    .filter(r => !FEATURED_PROJECTS.some(fp => fp.githubSlug === r.name))
    .slice(0, 4)
  
  return (
    <section id="projects" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="section-heading mb-12">Projects</h2>
        
        {/* Featured */}
        <div className="grid gap-6 md:grid-cols-2 mb-16">
          {featured.map(project => (
            <ProjectCard key={project.slug} project={project} featured />
          ))}
        </div>
        
        {/* Recent from GitHub */}
        {recent.length > 0 && (
          <>
            <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {recent.map(repo => (
                <MiniProjectCard key={repo.name} repo={repo} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
```

### File: `features/projects/project-card.tsx`

```tsx
// Project card with:
// - Project image/preview (or gradient placeholder)
// - Name, description
// - Tech stack tags
// - GitHub link, demo link
// - Stars count (from GitHub API)
// - Last updated
// - Hover animation matching site theme
```

## UI Design Notes

### Featured Project Card
- Large card (full width on mobile, half on desktop)
- Image/preview on top (or animated gradient)
- Title + description below
- Tech stack as small colored pills
- GitHub + Demo links as buttons
- Star count with star icon

### Mini Project Card (Recent)
- Small card, compact
- Repo name, description (truncated)
- Language indicator dot
- Link to GitHub

## Adding New Projects — Workflow

### Quick Add (Featured)
1. Open `data/projects.ts`
2. Add new entry to `FEATURED_PROJECTS`
3. Push — GitHub API auto-fetches stars/updates

### Auto-Show (Non-Featured)
Just push a new public repo to GitHub — it'll appear in "Recent Activity" automatically.

## Homepage vs Dedicated Page

### Homepage Section (Recommended for now)
- 2-3 featured project cards
- 4 recent repos from GitHub
- "View all" link to `/projects` (future)

### Dedicated `/projects` Page (Future)
- All featured projects with full descriptions
- Filter by tech stack
- Full GitHub activity feed

## Routes

| Route | Description |
|-------|-------------|
| `/#projects` | Homepage section (featured + recent) |
| `/projects` | _(Future)_ Full projects page |

## Navigation Integration

Add "Projects" anchor link in header navigation. Already scrolls to `#projects` section.
