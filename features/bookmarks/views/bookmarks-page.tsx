'use client'

import { useState, useMemo, useEffect } from 'react'
import { Bookmark, BookmarkCategory, BookmarkFormData } from '../types'
import { BOOKMARK_CATEGORIES } from '../constants/categories'
import { BookmarkHero } from '../components/bookmark-hero'
import { BookmarkFilter, SortOption } from '../components/bookmark-filter'
import { BookmarkCard } from '../components/bookmark-card'
import { BookmarkAdminModal } from '../components/bookmark-admin-modal'
import { SubpageHeader, Footer } from '@/features/layout'
import { RefreshCw, FolderSearch } from 'lucide-react'
import styles from '../bookmarks.module.css'

interface BookmarksPageProps {
  initialBookmarks: Bookmark[]
}

export function BookmarksPage({ initialBookmarks }: BookmarksPageProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Bookmark | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

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
      .catch(() => setStatusMessage('Could not refresh the archive. Showing the saved snapshot.'))
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

  const handleDeleteBookmark = (id: string) => {
    setDeleteTarget(bookmarks.find((bookmark) => bookmark.id === id) ?? null)
  }

  const confirmDeleteBookmark = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    try {
      const res = await fetch(`/api/bookmarks?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id))
        setDeleteTarget(null)
      } else {
        setStatusMessage(data.message || 'Failed to delete bookmark')
      }
    } catch {
      setStatusMessage('Error deleting bookmark')
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

      <div className={styles.page}>
      <main className={styles.main}>
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
        {statusMessage && <p className={styles.status} role="status" aria-live="polite">{statusMessage}</p>}

        {/* Bookmarks Display: Grouped or Flat */}
        {sortedBookmarks.length > 0 ? (
          groupedBookmarks && groupedBookmarks.length > 0 ? (
            /* GROUPED BY CATEGORY VIEW */
            <div className={styles.groups}>
              {groupedBookmarks.map(({ category, items }) => {
                return (
                  <section key={category} className={styles.group}>
                    {/* Category Group Header */}
                    <div className={styles.groupHeader}>
                      <span className={styles.groupName}>{category}</span>
                      <span className={styles.groupCount}>
                        ({items.length} {items.length === 1 ? 'bookmark' : 'bookmarks'})
                      </span>
                    </div>

                    {/* Category Items List / Grid */}
                    <div
                      className={viewMode === 'list' ? styles.list : styles.grid}
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
              className={viewMode === 'list' ? styles.list : styles.grid}
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
          <div className={styles.empty}>
            <FolderSearch className={styles.emptyIcon} size={28} />
            <h3 className={styles.emptyTitle}>No bookmarks on this channel</h3>
            <p className={styles.emptyText}>
              Nothing matches the current search or filter settings.
            </p>
            <button
              onClick={handleResetFilters}
              className={styles.reset}
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
        {deleteTarget && (
          <div className={styles.dialogBackdrop} role="presentation">
            <div className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="delete-bookmark-title">
              <span className={styles.eyebrow}>Remove signal</span>
              <h2 id="delete-bookmark-title">Delete “{deleteTarget.title}”?</h2>
              <p>This removes the bookmark from the archive.</p>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.reset} onClick={() => setDeleteTarget(null)}>Keep it</button>
                <button type="button" className={styles.adminButton} onClick={confirmDeleteBookmark}>Delete bookmark</button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Global Footer */}
      <Footer />
    </>
  )
}
