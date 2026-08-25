'use client'

import { useState } from 'react'
import { Tag, Calendar, ArrowDown, ArrowUp, Search } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'
import { BlogCard } from './blog-card'
import { BlogCardPinned } from './blog-card-pinned'
import { SignalArchiveHeader } from '@/features/layout'

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
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-0">
      <SignalArchiveHeader
        activeSection="blog"
        label="Notes 03 / Recorded ideas"
        title="Field notes"
        description="Practical writing about frontend engineering, interface systems, and the decisions behind the work."
      />

      {/* Filter and Search System */}
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
        {/* Search Bar */}
        <div className="relative w-full max-w-md rounded-lg transition-shadow focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Search articles, tags, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-card pr-4 pl-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tag size={16} />
            </div>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`inline-flex h-11 items-center rounded-lg border px-4 text-xs font-semibold transition-[color,background-color,border-color,transform] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                selectedTag === null
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-foreground hover:border-primary/50 hover:bg-primary/10'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex h-11 items-center gap-1.5 rounded-lg border border-border bg-muted px-4 text-xs font-bold text-foreground transition-[color,background-color,border-color,transform] hover:border-primary/50 hover:bg-primary/10 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <Calendar size={14} className="hidden sm:block" />
              {sortOrder === 'desc' ? 'Latest' : 'Oldest'}
              {sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`inline-flex h-11 items-center rounded-lg border px-4 text-xs font-semibold transition-[color,background-color,border-color,transform] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  selectedTag === tag
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted text-foreground hover:border-primary/50 hover:bg-primary/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid List matching projects layout */}
      <div className="flex flex-col gap-8">
        {pinnedPosts.length > 0 && selectedTag === null && searchQuery === '' && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
              Featured 
            </h2>
            <div className="grid gap-3">
              {pinnedPosts.map((post) => <BlogCardPinned key={post.slug} post={post} />)}
            </div>
          </div>
        )}

        <div>
          {((pinnedPosts.length > 0 && selectedTag === null && searchQuery === '') || pinnedPosts.length > 0) && (
             <h2 className="mb-4 mt-2 flex items-center gap-2 border-t border-border pt-6 text-xl font-semibold tracking-tight text-foreground">
               All Posts
             </h2>
          )}
          <div className="grid gap-3">
            {regularPosts.length > 0 || (pinnedPosts.length > 0 && (selectedTag !== null || searchQuery !== '')) ? (
              [...((selectedTag !== null || searchQuery !== '') ? pinnedPosts : []), ...regularPosts].map((post, index) => <BlogCard key={post.slug} post={post} index={index} />)
            ) : (
              <p className="col-span-full text-muted-foreground">
                No posts found for the selected filter.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
