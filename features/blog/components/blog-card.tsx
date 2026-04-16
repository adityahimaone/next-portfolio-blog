'use client'

import Link from 'next/link'
import { Pin } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'

export function BlogCard({ post }: { post: BlogMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-primary/30 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-primary/50">
        {/* Decorative Pattern Background */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.08] dark:opacity-[0.05] dark:group-hover:opacity-[0.1]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[20px_20px]" />
        </div>
        
        {/* Interactive Equalizer Graphic */}
        <div className="absolute right-6 top-6 flex h-4 items-end gap-[2px] opacity-30 transition-opacity group-hover:opacity-100">
          <div className="h-2 w-1 bg-primary transition-all duration-300 group-hover:h-3" />
          <div className="h-4 w-1 bg-primary transition-all delay-75 duration-300 group-hover:h-2" />
          <div className="h-1 w-1 bg-primary transition-all delay-150 duration-300 group-hover:h-4" />
        </div>
        
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          {post.pinned && (
            <span className="flex items-center gap-1 text-primary dark:text-primary-light">
              <Pin size={14} className="fill-primary/20" />
            </span>
          )}
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

          <p className="mt-2 flex-grow text-zinc-600 dark:text-zinc-400">
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
        </div>
      </article>
    </Link>
  )
}
