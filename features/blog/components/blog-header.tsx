import type { BlogMeta } from '../lib/blog'

export function BlogHeader({ meta }: { meta: BlogMeta }) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <time dateTime={meta.date}>
          {new Date(meta.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <span>·</span>
        <span>{meta.readingTime}</span>
      </div>

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl dark:text-white">
        {meta.title}
      </h1>

      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        {meta.description}
      </p>

      {meta.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {meta.tags.map(tag => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20 dark:text-primary-light"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  )
}
