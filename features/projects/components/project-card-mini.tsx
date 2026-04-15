import { ExternalLink, Star } from 'lucide-react'
import type { GitHubRepo } from '../github'

export function ProjectCardMini({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-primary/50"
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary-light">
          {repo.name}
        </h4>
        <ExternalLink
          size={14}
          className="mt-1 text-zinc-400 transition-colors group-hover:text-primary"
        />
      </div>

      <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
        {repo.description || 'No description'}
      </p>

      <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
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
}
