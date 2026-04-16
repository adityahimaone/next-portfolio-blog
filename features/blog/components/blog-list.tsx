'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Tag, Calendar, ArrowDown, ArrowUp, Search } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'
import { BlogCard } from './blog-card'
import { BlogCardPinned } from './blog-card-pinned'

export function BlogList({ posts }: { posts: BlogMeta[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  // Extract all unique tags
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort()

  // Filter by tag and search query
  const filteredPosts = posts.filter((post) => {
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = searchLower === '' || 
      post.title.toLowerCase().includes(searchLower) || 
      post.description.toLowerCase().includes(searchLower) ||
      post.tags.some(t => t.toLowerCase().includes(searchLower))
      
    return matchesTag && matchesSearch
  })

  // Sort by date
  const sortedFilteredPosts = [...filteredPosts].sort((a, b) => {
    const timeA = new Date(a.date).getTime()
    const timeB = new Date(b.date).getTime()
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
  })

  // Separate pinned vs regular
  const pinnedPosts = sortedFilteredPosts.filter(p => p.pinned)
  const regularPosts = sortedFilteredPosts.filter(p => !p.pinned)

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

      {/* Filter and Search System */}
      <div className="mb-12 flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative max-w-md w-full focus-within:ring-2 focus-within:ring-primary/20 rounded-full transition-shadow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Search articles, tags, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:border-primary-light text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <Tag size={16} />
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
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <Calendar size={14} className="hidden sm:block" />
              {sortOrder === 'desc' ? 'Latest' : 'Oldest'}
              {sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
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
      </div>

      {/* Grid List matching projects layout */}
      <div className="flex flex-col gap-12">
        {pinnedPosts.length > 0 && selectedTag === null && searchQuery === '' && (
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Featured 
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {pinnedPosts.map((post) => <BlogCardPinned key={post.slug} post={post} />)}
            </div>
          </div>
        )}

        <div>
          {((pinnedPosts.length > 0 && selectedTag === null && searchQuery === '') || pinnedPosts.length > 0) && (
             <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
               All Posts
             </h2>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.length > 0 || (pinnedPosts.length > 0 && (selectedTag !== null || searchQuery !== '')) ? (
              [...((selectedTag !== null || searchQuery !== '') ? pinnedPosts : []), ...regularPosts].map((post) => <BlogCard key={post.slug} post={post} />)
            ) : (
              <p className="col-span-full text-zinc-500 dark:text-zinc-400">
                No posts found for the selected filter.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
