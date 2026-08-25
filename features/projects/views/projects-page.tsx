'use client'

import { Github } from 'lucide-react'
import type { FeaturedProject } from '../constants'
import type { GitHubRepo } from '../lib/github'
import { ProjectCard } from '../components/project-card'
import { ProjectCardMini } from '../components/project-card-mini'
import { SignalArchiveHeader, SubpageHeader, Footer } from '@/features/layout'

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
      <main className="mx-auto min-h-screen max-w-7xl bg-background px-4 pb-20 pt-28">
        <SignalArchiveHeader
          activeSection="projects"
          label="Output 01 / Released work"
          title="Shipped work"
          description="Production frontend systems, interfaces, and experiments built from architecture through interaction."
        />

        {/* Featured */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Featured
          </h2>
          <div className="grid gap-3">
            {featured.map(({ project, repo }, index) => (
              <ProjectCard key={project.slug} project={project} repo={repo} index={index} session />
            ))}
          </div>
        </section>

        {/* Recent from GitHub */}
        {recent.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-foreground">
                Recent Activity
              </h2>
              <a
                href="https://github.com/adityahimaone"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Github size={16} />
                View all on GitHub
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
