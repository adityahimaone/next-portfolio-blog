import Link from 'next/link'
import { Pin } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'

export function BlogCardPinned({ post }: { post: BlogMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="relative grid min-h-48 overflow-hidden rounded-xl border border-primary/50 bg-card transition-colors hover:border-primary md:grid-cols-[minmax(0,1fr)_180px]">
        <div className="relative z-10 flex flex-1 flex-col justify-center p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wider">
            <span className="flex items-center gap-1 rounded bg-primary px-2 py-1 text-primary-foreground">
              <Pin size={10} className="fill-current" /> Pinned
            </span>
            <time dateTime={post.date} className="text-muted-foreground tracking-normal text-xs font-medium">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
            <span className="text-border">•</span>
            <span className="text-muted-foreground tracking-normal text-xs">{post.readingTime}</span>
          </div>

          <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight text-foreground group-hover:text-primary">
            {post.title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>

          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded border border-border bg-card/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="relative hidden overflow-hidden border-l border-border bg-primary/5 md:block" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 aspect-square w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/35 bg-[repeating-radial-gradient(circle,transparent_0_5px,color-mix(in_srgb,var(--foreground)_10%,transparent)_6px_7px)]">
            <span className="absolute left-1/2 top-1/2 aspect-square w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
          </div>
          <span className="absolute bottom-5 left-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Featured recording</span>
        </div>
      </article>
    </Link>
  )
}
