import Link from 'next/link'
import { Pin } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'

export function BlogCardPinned({ post }: { post: BlogMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="relative flex h-full flex-col xl:flex-row gap-4 overflow-hidden rounded-xl border-2 border-primary/20 bg-primary/5 p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-primary/10 dark:bg-primary/5 dark:hover:border-primary/30">
        
        {/* Decorative Tape Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.03]">
          <div className="absolute inset-0 bg-[radial-gradient(#808080_1.5px,transparent_1.5px)]" style={{ backgroundSize: '12px 12px' }} />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wider">
            <span className="flex items-center gap-1 bg-primary text-white px-2 py-0.5 rounded shadow-sm">
              <Pin size={10} className="fill-white" /> Pinned
            </span>
            <time dateTime={post.date} className="text-zinc-500 dark:text-zinc-400 tracking-normal text-xs font-medium">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-zinc-500 tracking-normal text-xs dark:text-zinc-400">{post.readingTime}</span>
          </div>

          <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary-light">
            {post.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
            {post.description}
          </p>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded bg-white/60 backdrop-blur-sm border border-zinc-200/50 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-zinc-700 dark:bg-black/20 dark:border-white/5 dark:text-zinc-300"
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
