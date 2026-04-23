import { memo } from 'react'
import Link from 'next/link'
import { ExternalLink, Star, Github, Disc3 } from 'lucide-react'
import type { FeaturedProject } from '../constants'
import type { GitHubRepo } from '../lib/github'

export const ProjectCard = memo(function ProjectCard({
  project,
  repo,
}: {
  project: FeaturedProject
  repo?: GitHubRepo
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-primary/30 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-primary/50">
      {/* Gradient header */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        {/* Speaker Grille Pattern */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] opacity-5 dark:bg-[radial-gradient(#fff_1px,transparent_1px)] dark:opacity-10" 
          style={{ backgroundSize: '4px 4px' }} 
        />
        {/* Decorative Vinyl */}
        <div className="absolute -right-8 -top-8 text-primary/10 transition-transform duration-700 ease-out group-hover:rotate-45 dark:text-primary-light/10">
          <Disc3 size={160} strokeWidth={1} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent dark:from-zinc-900/90" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {project.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {project.description}
        </p>

        {/* Tech stack */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech.map(tech => (
            <span
              key={tech}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/20 dark:text-primary-light"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* GitHub stats */}
        {repo && (
          <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            {repo.stargazers_count > 0 && (
              <span className="flex items-center gap-1">
                <Star size={14} />
                {repo.stargazers_count}
              </span>
            )}
            {repo.language && (
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-primary" />
                {repo.language}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="mt-auto flex items-center gap-3 pt-4">
          <a
            href={`https://github.com/adityahimaone/${project.githubSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary-light"
          >
            <Github size={16} />
            Code
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary-light"
            >
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  )
})
