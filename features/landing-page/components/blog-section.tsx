'use client'

import Link from 'next/link'
import { StageLabel, BlogCard } from '@/components/ui'

const RECENT_POSTS = [
  {
    title: 'Building a Retro Console Portfolio',
    slug: 'retro-console-portfolio',
    date: '2026-05-14',
    excerpt: 'How I redesigned my portfolio with a Famicom/PS1 aesthetic using Next.js and Tailwind CSS.',
    readTime: 8,
  },
  {
    title: 'React Performance Optimization Tips',
    slug: 'react-performance-tips',
    date: '2026-05-10',
    excerpt: 'Practical techniques to improve React app performance: memoization, code splitting, and more.',
    readTime: 12,
  },
  {
    title: 'TypeScript Best Practices in 2026',
    slug: 'typescript-best-practices',
    date: '2026-05-05',
    excerpt: 'Essential TypeScript patterns and practices for building scalable frontend applications.',
    readTime: 10,
  },
]

export function BlogSection() {
  return (
    <section
      id="blog"
      className="relative py-32 bg-gray-deep"
      data-stage-num="05"
      data-stage-name="ARCHIVES"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <StageLabel num="05" name="ARCHIVES" glowing />

        <div className="mt-8">
          <h2 className="t-heading-l mb-6 text-white-bone">ARCHIVES</h2>
          <p className="t-body-m mb-12 max-w-2xl text-white-dim">
            Thoughts on frontend development, design systems, and web performance.
          </p>

          <div className="space-y-4">
            {RECENT_POSTS.map((post) => (
              <BlogCard key={post.slug} {...post} />
            ))}
          </div>

          <Link
            href="/blog"
            className="t-heading-m mt-8 inline-block border-2 border-white-bone bg-black-true px-6 py-3 text-white-bone transition-colors hover:border-red hover:bg-red/10 hover:text-red"
          >
            VIEW ALL POSTS
          </Link>
        </div>
      </div>
    </section>
  )
}
