'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'
import { BlogCard } from './blog-card'

export function BlogList({ posts }: { posts: BlogMeta[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Extract all unique tags
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort()

  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 pt-8">
      {/* Header matching projects-page layout */}
      <div className="mb-12">
        <Link
          href="/"
          className="hover:text-primary dark:hover:text-primary-light mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors dark:text-zinc-400"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Blog
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          Thoughts on frontend development, design, and code.
        </p>
      </div>

      {/* Filter System */}
      {allTags.length > 0 && (
        <div className="mb-12 flex flex-wrap items-center gap-3">
          <div className="mr-2 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Tag size={16} />
            <span>Filter:</span>
          </div>
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              selectedTag === null
                ? 'bg-primary text-white shadow-md'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                selectedTag === tag
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid List matching projects layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <BlogCard key={post.slug} post={post} />)
        ) : (
          <p className="col-span-full text-zinc-500 dark:text-zinc-400">
            No posts found for the selected filter.
          </p>
        )}
      </div>
    </div>
  )
}
