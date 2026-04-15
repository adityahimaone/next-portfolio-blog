'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Github } from 'lucide-react'
import { FEATURED_PROJECTS } from '@/features/projects/data'
import { getRepos } from '@/features/projects/github'
import type { GitHubRepo } from '@/features/projects/github'
import { ProjectCard } from '@/features/projects/components/project-card'
import { ProjectCardMini } from '@/features/projects/components/project-card-mini'

export default function ProjectsPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])

  useEffect(() => {
    getRepos().then(setRepos)
  }, [])

  const featured = FEATURED_PROJECTS.map(fp => {
    const repo = repos.find(r => r.name === fp.githubSlug)
    return { project: fp, repo }
  })

  const recent = repos
    .filter(r => !FEATURED_PROJECTS.some(fp => fp.githubSlug === r.name))
    .slice(0, 8)

  return (
    <main className="mx-auto max-w-7xl px-4 py-20">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary-light"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Projects
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          A collection of things I've built. Featured projects get the full treatment,
          everything else shows up automatically from GitHub.
        </p>
      </div>

      {/* Featured */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-white">
          Featured
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map(({ project, repo }) => (
            <ProjectCard key={project.slug} project={project} repo={repo} />
          ))}
        </div>
      </section>

      {/* Recent from GitHub */}
      {recent.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Recent Activity
            </h2>
            <a
              href="https://github.com/adityahimaone"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary-light"
            >
              <Github size={16} />
              View all on GitHub
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map(repo => (
              <ProjectCardMini key={repo.name} repo={repo} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
