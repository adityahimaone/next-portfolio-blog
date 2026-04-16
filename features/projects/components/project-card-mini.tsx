import { ExternalLink, Star, Radio } from 'lucide-react'
import type { GitHubRepo } from '../lib/github'

export function ProjectCardMini({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-primary/50"
    >
      {/* Decorative Radio Watermark */}
      <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-10 text-zinc-300 dark:text-zinc-700 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-[-10deg] group-hover:text-primary/10">
        <Radio size={80} strokeWidth={1} />
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <h4 className="font-medium text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary-light">
          {repo.name}
        </h4>
        <ExternalLink
          size={14}
          className="mt-1 text-zinc-400 transition-colors group-hover:text-primary"
        />
      </div>

      <p className="relative z-10 mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
        {repo.description || 'No description'}
      </p>

      <div className="relative z-10 mt-3 flex items-center gap-3 text-xs text-zinc-400">
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
