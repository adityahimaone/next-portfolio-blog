import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'

export function RelatedPosts({ posts }: { posts: BlogMeta[] }) {
  if (posts.length === 0) return null

  return (
    <section className="mt-16 border-t border-zinc-200 pt-12 dark:border-zinc-800">
      <h3 className="mb-6 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
        Related Posts
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-primary/50"
          >
            <time className="text-xs text-zinc-500 dark:text-zinc-400">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
            <h4 className="mt-1 text-sm font-medium text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary-light">
              {post.title}
            </h4>
            <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
              {post.description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary dark:text-primary-light">
              Read more <ArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
