'use client'

import { LazyMotion, domMax, m, useInView } from 'motion/react'
import { useRef } from 'react'
import { Disc, Music } from 'lucide-react'
import { FEATURED_PROJECTS } from '../data'
import { getRepos } from '../github'
import type { GitHubRepo } from '../github'
import { ProjectCard } from './project-card'
import { ProjectCardMini } from './project-card-mini'
import { useEffect, useState } from 'react'

export function ProjectsSection2025() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const [repos, setRepos] = useState<GitHubRepo[]>([])

  useEffect(() => {
    getRepos().then(setRepos)
  }, [])

  // Merge featured data with live GitHub data
  const featured = FEATURED_PROJECTS.map(fp => {
    const repo = repos.find(r => r.name === fp.githubSlug)
    return { project: fp, repo }
  })

  // Recent repos (not featured, top 4 by push date)
  const recent = repos
    .filter(r => !FEATURED_PROJECTS.some(fp => fp.githubSlug === r.name))
    .slice(0, 4)

  return (
    <LazyMotion features={domMax}>
      <section ref={sectionRef} className="relative overflow-hidden py-20">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 to-white dark:from-zinc-900/50 dark:to-zinc-950" />

        <div className="relative mx-auto max-w-7xl px-4">
          {/* Section header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Disc className="h-8 w-8 text-primary animate-spin-slow" />
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
                Projects
              </h2>
              <Music className="h-6 w-6 text-accent" />
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Things I've built. Some are featured, others show up automatically from GitHub.
            </p>
          </m.div>

          {/* Featured projects */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map(({ project, repo }, index) => (
              <m.div
                key={project.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProjectCard project={project} repo={repo} />
              </m.div>
            ))}
          </div>

          {/* Recent from GitHub */}
          {recent.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16"
            >
              <h3 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-white">
                Recent Activity
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recent.map(repo => (
                  <ProjectCardMini key={repo.name} repo={repo} />
                ))}
              </div>
            </m.div>
          )}
        </div>
      </section>
    </LazyMotion>
  )
}
