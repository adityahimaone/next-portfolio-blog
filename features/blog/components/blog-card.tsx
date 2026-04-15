'use client'

import Link from 'next/link'
import type { BlogMeta } from '../blog'

export function BlogCard({ post }: { post: BlogMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-primary/30 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-primary/50">
        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>

        <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary-light">
          {post.title}
        </h2>

        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {post.description}
        </p>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  )
}
