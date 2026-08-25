import { memo } from 'react'
import { ExternalLink, Star, Github, Disc3 } from 'lucide-react'
import type { FeaturedProject } from '../constants'
import type { GitHubRepo } from '../lib/github'

export const ProjectCard = memo(function ProjectCard({
  project,
  repo,
  index = 0,
  session = false,
}: {
  project: FeaturedProject
  repo?: GitHubRepo
  index?: number
  session?: boolean
}) {
  if (!session) {
    return (
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60 hover:shadow-md">
        <div className="relative flex h-28 items-end overflow-hidden border-b border-border bg-primary/5 p-5">
          <Disc3 className="pointer-events-none absolute -right-5 -top-7 text-primary/15 transition-transform duration-500 group-hover:rotate-12" size={128} strokeWidth={1} aria-hidden="true" />
          <h3 className="relative text-xl font-bold tracking-tight text-foreground">{project.name}</h3>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tech.map((tech) => <span key={tech} className="rounded-sm border border-primary/35 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{tech}</span>)}
          </div>
          <div className="mt-auto flex items-center gap-4 pt-5 text-sm">
            <a href={`https://github.com/adityahimaone/${project.githubSlug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary"><Github size={16} />Code</a>
            {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary"><ExternalLink size={16} />Live Demo</a>}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group relative grid overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/70 hover:shadow-md md:grid-cols-[56px_minmax(0,1fr)_120px]">
      <div className="flex min-h-12 items-center justify-center border-b border-border bg-muted font-mono text-xs font-bold text-primary md:min-h-full md:border-r md:border-b-0">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="flex min-w-0 flex-col p-4 sm:p-5">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Production track</p>
        <h3 className="mt-1.5 text-xl font-bold tracking-tight text-foreground group-hover:text-primary">{project.name}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {/* Tech stack */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tech.map(tech => (
            <span
              key={tech}
              className="rounded-sm border border-primary/35 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* GitHub stats */}
        {repo && (
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
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
        <div className="mt-3 flex flex-wrap items-center gap-5 border-t border-border pt-3">
          <a
            href={`https://github.com/adityahimaone/${project.githubSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Github size={16} />
            Code
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
        </div>
      </div>

      <div className="relative hidden min-h-full overflow-hidden border-l border-border bg-primary/5 md:block" aria-hidden="true">
        <Disc3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/25 transition-transform duration-500 group-hover:-translate-x-1/2 group-hover:-translate-y-1/2 group-hover:rotate-12" size={94} strokeWidth={1} />
        <div className="absolute inset-x-4 bottom-4 h-1 bg-border"><span className="block h-full w-2/3 bg-primary" /></div>
      </div>
    </article>
  )
})
