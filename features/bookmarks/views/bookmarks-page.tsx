'use client'

import { useState, useMemo, useEffect } from 'react'
import { Bookmark, BookmarkCategory, BookmarkFormData } from '../types'
import { BOOKMARK_CATEGORIES, CATEGORY_COLORS } from '../constants/categories'
import { BookmarkHero } from '../components/bookmark-hero'
import { BookmarkFilter, SortOption } from '../components/bookmark-filter'
import { BookmarkCard } from '../components/bookmark-card'
import { BookmarkAdminModal } from '../components/bookmark-admin-modal'
import { SubpageHeader, Footer } from '@/features/layout'
import { RefreshCw, FolderSearch } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookmarksPageProps {
  initialBookmarks: Bookmark[]
}

export function BookmarksPage({ initialBookmarks }: BookmarksPageProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)

  // View Mode: 'list' (DEFAULT) or 'grid'
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Sorting & Grouping States (Default: Grouped by Category, Sorted by Date Newest)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [groupByCategory, setGroupByCategory] = useState(true)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<BookmarkCategory>('All')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [featuredOnly, setFeaturedOnly] = useState(false)

  // Fetch updated bookmarks from API on mount
  useEffect(() => {
    fetch('/api/bookmarks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.bookmarks)) {
          setBookmarks(data.bookmarks)
        }
      })
      .catch(() => {})
  }, [])

  // Collect all unique available tags
  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>()
    bookmarks.forEach((b) => b.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet)
  }, [bookmarks])

  // Filter Bookmarks logic
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      if (selectedCategory !== 'All' && b.category !== selectedCategory) {
        return false
      }
      if (featuredOnly && !b.featured) {
        return false
      }
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((st) => b.tags.includes(st))
        if (!hasAllTags) return false
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = b.title.toLowerCase().includes(q)
        const matchDesc = b.description.toLowerCase().includes(q)
        const matchUrl = b.url.toLowerCase().includes(q)
        const matchCategory = b.category.toLowerCase().includes(q)
        const matchTag = b.tags.some((t) => t.toLowerCase().includes(q))
        return matchTitle || matchDesc || matchUrl || matchCategory || matchTag
      }
      return true
    })
  }, [bookmarks, selectedCategory, featuredOnly, selectedTags, searchQuery])

  // Sort Bookmarks logic
  const sortedBookmarks = useMemo(() => {
    const list = [...filteredBookmarks]
    list.sort((a, b) => {
      if (sortBy === 'a-z') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'z-a') {
        return b.title.localeCompare(a.title)
      }
      if (sortBy === 'oldest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateA - dateB
      }
      // 'newest' (default)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
    return list
  }, [filteredBookmarks, sortBy])

  // Group Bookmarks by Category logic
  const groupedBookmarks = useMemo(() => {
    if (!groupByCategory || selectedCategory !== 'All') return null
    const groups: { category: string; items: Bookmark[] }[] = []
    const categoriesToGroup = BOOKMARK_CATEGORIES.filter((c) => c !== 'All')

    categoriesToGroup.forEach((cat) => {
      const items = sortedBookmarks.filter((b) => b.category === cat)
      if (items.length > 0) {
        groups.push({ category: cat, items })
      }
    })

    // Also include any custom category items not in standard list
    const knownCats = new Set<string>(categoriesToGroup)
    const extraItems = sortedBookmarks.filter((b) => !knownCats.has(b.category))
    if (extraItems.length > 0) {
      groups.push({ category: 'Other', items: extraItems })
    }

    return groups
  }, [sortedBookmarks, groupByCategory, selectedCategory])

  // Handlers
  const handleTagClick = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag])
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedTags([])
    setFeaturedOnly(false)
    setSortBy('newest')
  }

  const handleOpenAddModal = () => {
    setEditingBookmark(null)
    setIsAdminModalOpen(true)
  }

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
    setIsAdminModalOpen(true)
  }

  const handleDeleteBookmark = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return
    try {
      const res = await fetch(`/api/bookmarks?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id))
      } else {
        alert(data.message || 'Failed to delete bookmark')
      }
    } catch {
      alert('Error deleting bookmark')
    }
  }

  const handleSaveBookmark = async (formData: BookmarkFormData, id?: string): Promise<boolean> => {
    try {
      const method = id ? 'PUT' : 'POST'
      const payload = id ? { ...formData, id } : formData

      const res = await fetch('/api/bookmarks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success && data.bookmark) {
        if (id) {
          setBookmarks((prev) => prev.map((b) => (b.id === id ? data.bookmark : b)))
        } else {
          setBookmarks((prev) => [data.bookmark, ...prev])
        }
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return (
    <>
      {/* DAW Header (same as Projects subpage) */}
      <SubpageHeader />

      <main className="mx-auto max-w-7xl px-4 py-20 pt-28 min-h-screen">
        {/* Header Hero */}
        <BookmarkHero
          bookmarks={bookmarks}
          isAdmin={isAdmin}
          onOpenAdminModal={handleOpenAddModal}
          onToggleAdminLogin={() => {
            if (isAdmin) {
              setIsAdmin(false)
            } else {
              setIsAdminModalOpen(true)
            }
          }}
        />

        {/* Filters, Sort, Group Toggle, View Switch */}
        <BookmarkFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          selectedTags={selectedTags}
          onRemoveTag={handleRemoveTag}
          allAvailableTags={allAvailableTags}
          onSelectTag={handleTagClick}
          featuredOnly={featuredOnly}
          onToggleFeatured={() => setFeaturedOnly((prev) => !prev)}
          onResetFilters={handleResetFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          groupByCategory={groupByCategory}
          onToggleGroupByCategory={() => setGroupByCategory((prev) => !prev)}
          totalCount={bookmarks.length}
          filteredCount={filteredBookmarks.length}
        />

        {/* Bookmarks Display: Grouped or Flat */}
        {sortedBookmarks.length > 0 ? (
          groupedBookmarks && groupedBookmarks.length > 0 ? (
            /* GROUPED BY CATEGORY VIEW */
            <div className="space-y-10">
              {groupedBookmarks.map(({ category, items }) => {
                const theme = CATEGORY_COLORS[category] || {
                  bg: 'bg-zinc-800',
                  text: 'text-zinc-200',
                  border: 'border-zinc-700',
                }

                return (
                  <section key={category} className="space-y-3.5">
                    {/* Category Group Header */}
                    <div className="flex items-center gap-3 pb-1 border-b border-zinc-800/80">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider shadow-sm',
                          theme.bg,
                          theme.text,
                          theme.border
                        )}
                      >
                        {category}
                      </span>
                      <span className="text-xs font-mono text-zinc-200 font-bold">
                        ({items.length} {items.length === 1 ? 'bookmark' : 'bookmarks'})
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 via-zinc-800/40 to-transparent" />
                    </div>

                    {/* Category Items List / Grid */}
                    <div
                      className={cn(
                        viewMode === 'list'
                          ? 'flex flex-col space-y-2.5'
                          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                      )}
                    >
                      {items.map((bookmark) => (
                        <BookmarkCard
                          key={bookmark.id}
                          bookmark={bookmark}
                          viewMode={viewMode}
                          isAdmin={isAdmin}
                          onTagClick={handleTagClick}
                          onEdit={handleEditBookmark}
                          onDelete={handleDeleteBookmark}
                        />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            /* FLAT VIEW */
            <div
              className={cn(
                viewMode === 'list'
                  ? 'flex flex-col space-y-2.5'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              )}
            >
              {sortedBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  viewMode={viewMode}
                  isAdmin={isAdmin}
                  onTagClick={handleTagClick}
                  onEdit={handleEditBookmark}
                  onDelete={handleDeleteBookmark}
                />
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-12 text-center my-8">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400">
                <FolderSearch className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Bookmarks Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              No curated web resources match your current filter settings or search query.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset All Filters
            </button>
          </div>
        )}

        {/* Admin Authorization & Add/Edit Modal */}
        <BookmarkAdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          isAdmin={isAdmin}
          onLoginSuccess={() => {
            setIsAdmin(true)
            setIsAdminModalOpen(false)
          }}
          editingBookmark={editingBookmark}
          onSaveBookmark={handleSaveBookmark}
        />
      </main>

      {/* Global Footer */}
      <Footer />
    </>
  )
}

