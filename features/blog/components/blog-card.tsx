'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Pin } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'

export const BlogCard = memo(function BlogCard({ post, index }: { post: BlogMeta; index: number }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="relative grid min-h-32 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/70 hover:shadow-md sm:grid-cols-[56px_minmax(0,1fr)_108px]">
        <div className="flex min-h-12 items-center justify-center border-b border-border bg-muted font-mono text-xs font-bold text-primary sm:min-h-full sm:border-r sm:border-b-0">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="relative z-10 flex h-full flex-col p-4 sm:p-5">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {post.pinned && (
            <span className="flex items-center gap-1 text-primary">
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

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground group-hover:text-primary">
          {post.title}
        </h2>

          <p className="mt-1.5 max-w-2xl flex-grow text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          )}
        </div>
        <div className="relative hidden overflow-hidden border-l border-border bg-primary/5 sm:block" aria-hidden="true">
          <div className="absolute inset-x-4 top-1/2 flex h-10 -translate-y-1/2 items-center gap-1">
            {[2, 5, 3, 7, 4, 6, 2].map((height, barIndex) => <span key={barIndex} className="flex-1 rounded-sm bg-primary/65" style={{ height: `${height * 4}px` }} />)}
          </div>
        </div>
      </article>
    </Link>
  )
})
