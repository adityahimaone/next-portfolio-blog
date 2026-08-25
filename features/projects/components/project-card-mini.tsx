import { memo } from 'react'
import { ExternalLink, Star } from 'lucide-react'
import type { GitHubRepo } from '../lib/github'

export const ProjectCardMini = memo(function ProjectCardMini({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60 hover:shadow-md"
    >
      <div className="absolute right-4 top-5 flex h-3 items-center gap-0.5 opacity-60" aria-hidden="true">
        {[3, 1, 4].map((height, index) => <span key={index} className="w-1 rounded-sm bg-primary" style={{ height: `${height * 3}px` }} />)}
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <h4 className="font-medium text-card-foreground group-hover:text-primary">
          {repo.name}
        </h4>
        <ExternalLink
          size={14}
          className="mt-1 text-muted-foreground transition-colors group-hover:text-primary"
        />
      </div>

      <p className="relative z-10 mt-1 line-clamp-2 text-sm text-muted-foreground">
        {repo.description || 'No description'}
      </p>

      <div className="relative z-10 mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="bg-primary h-2.5 w-2.5 rounded-full" />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <Star size={12} />
            {repo.stargazers_count}
          </span>
        )}
      </div>
    </a>
  )
})
