'use client'

import Link from 'next/link'
import { ArrowLeft, Github } from 'lucide-react'
import type { FeaturedProject } from '../constants'
import type { GitHubRepo } from '../lib/github'
import { ProjectCard } from '../components/project-card'
import { ProjectCardMini } from '../components/project-card-mini'
import { SubpageHeader, Footer } from '@/features/layout'

interface ProjectsPageContentProps {
  repos: GitHubRepo[]
  featuredProjects: FeaturedProject[]
}

export function ProjectsPage({
  repos,
  featuredProjects,
}: ProjectsPageContentProps) {
  const featured = featuredProjects.map((fp) => {
    const repo = repos.find((r) => r.name === fp.githubSlug)
    return { project: fp, repo }
  })

  const recent = repos
    .filter((r) => !featuredProjects.some((fp) => fp.githubSlug === r.name))
    .slice(0, 8)

  return (
    <>
      <SubpageHeader />
      <main className="mx-auto max-w-7xl px-4 py-20 pt-28">
        {/* Header */}
        <div className="mb-12 pt-8">
          <Link
            href="/"
            className="hover:text-primary dark:hover:text-primary-light mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors dark:text-zinc-400"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            A collection of things I've built. Featured projects get the full
            treatment, everything else shows up automatically from GitHub.
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
                className="hover:text-primary dark:hover:text-primary-light flex items-center gap-2 text-sm text-zinc-500 transition-colors dark:text-zinc-400"
              >
                <Github size={16} />
                View all on GitHub
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((repo) => (
                <ProjectCardMini key={repo.name} repo={repo} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
