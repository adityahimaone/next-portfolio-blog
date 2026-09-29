'use client'

import { useState, useMemo, useEffect } from 'react'
import { FolderSearch, RefreshCw } from 'lucide-react'
import type { Bookmark, BookmarkFormData } from '../types'
import { CHANNEL_CATEGORIES, channelColor } from '../constants/categories'
import { BookmarkHero } from '../components/bookmark-hero'
import { BookmarkDock } from '../components/bookmark-dock'
import { BookmarkRow } from '../components/bookmark-row'
import { BookmarkAdminModal } from '../components/bookmark-admin-modal'
import { TopBar, Footer } from '@/features/layout'
import styles from '../bookmarks.module.css'

interface BookmarksPageProps {
  initialBookmarks: Bookmark[]
}

/** An index reads best featured-first, then alphabetical. */
function indexOrder(a: Bookmark, b: Bookmark): number {
  if (Boolean(b.featured) !== Boolean(a.featured)) {
    return Boolean(b.featured) ? 1 : -1
  }
  return a.title.localeCompare(b.title)
}

export function BookmarksPage({ initialBookmarks }: BookmarksPageProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Bookmark | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch updated bookmarks from API on mount
  useEffect(() => {
    fetch('/api/bookmarks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.bookmarks)) {
          setBookmarks(data.bookmarks)
        }
      })
      .catch(() =>
        setStatusMessage(
          'Could not refresh the archive. Showing the saved snapshot.',
        ),
      )
  }, [])

  useEffect(() => {
    if (!deleteTarget && !isAdminModalOpen) return
    function handleKeydown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (deleteTarget) setDeleteTarget(null)
      else setIsAdminModalOpen(false)
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [deleteTarget, isAdminModalOpen])

  const filteredBookmarks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return bookmarks
    return bookmarks.filter((b) => {
      return (
        b.title.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query) ||
        b.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
  }, [bookmarks, searchQuery])

  const groups = useMemo(() => {
    const known = new Set<string>(CHANNEL_CATEGORIES)
    return CHANNEL_CATEGORIES.map((category) => ({
      category: category as string,
      items: filteredBookmarks
        .filter((b) => b.category === category)
        .sort(indexOrder),
    }))
      .filter((group) => group.items.length > 0)
      .concat(
        filteredBookmarks.filter((b) => !known.has(b.category)).length > 0
          ? [
              {
                category: 'Other',
                items: filteredBookmarks
                  .filter((b) => !known.has(b.category))
                  .sort(indexOrder),
              },
            ]
          : [],
      )
  }, [filteredBookmarks])

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

  const handleSaveBookmark = async (
    formData: BookmarkFormData,
    id?: string,
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { ...formData, id } : formData),
      })
      const data = await res.json()

      if (data.success && data.bookmark) {
        setBookmarks((prev) =>
          id
            ? prev.map((b) => (b.id === id ? data.bookmark : b))
            : [data.bookmark, ...prev],
        )
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return (
    <>
      <TopBar />

      <div className={styles.page}>
        <main id="main-content" className={styles.main}>
          <BookmarkHero
            bookmarks={bookmarks}
            isAdmin={isAdmin}
            onOpenAdminModal={handleOpenAddModal}
            onToggleAdminLogin={() => setIsAdmin((prev) => !prev)}
          />

          <BookmarkDock
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalCount={bookmarks.length}
            filteredCount={filteredBookmarks.length}
          />

          {statusMessage && (
            <p className={styles.status} role="status" aria-live="polite">
              {statusMessage}
            </p>
          )}

          {groups.length > 0 ? (
            <div className={styles.groups}>
              {groups.map(({ category, items }) => (
                <section key={category} className={styles.group}>
                  <div
                    className={styles.groupHeader}
                    style={{
                      ['--channel' as string]: channelColor(category),
                    }}
                  >
                    <span className={styles.groupDot} aria-hidden="true" />
                    <h2 className={styles.groupName}>{category}</h2>
                    <span className={styles.groupCount}>
                      {items.length} {items.length === 1 ? 'link' : 'links'}
                    </span>
                  </div>
                  <ul className={styles.rows}>
                    {items.map((bookmark) => (
                      <BookmarkRow
                        key={bookmark.id}
                        bookmark={bookmark}
                        channelColor={channelColor(bookmark.category)}
                        isAdmin={isAdmin}
                        onEdit={handleEditBookmark}
                        onDelete={handleDeleteBookmark}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <FolderSearch className={styles.emptyIcon} size={28} />
              <h2 className={styles.emptyTitle}>Nothing matches that search</h2>
              <p className={styles.emptyText}>
                Clear the search to see all {bookmarks.length} saved signals, or
                add one from the admin panel.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`${styles.reset} glass-1`}
              >
                <RefreshCw size={14} />
                Clear search
              </button>
            </div>
          )}

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
              <div
                className={`${styles.confirmDialog} glass-2`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-bookmark-title"
              >
                <span className={`${styles.eyebrow} silkscreen`}>
                  Remove signal
                </span>
                <h2 id="delete-bookmark-title">
                  Delete “{deleteTarget.title}”?
                </h2>
                <p>This removes the bookmark from the archive.</p>
                <div className={styles.dialogActions}>
                  <button
                    type="button"
                    className={styles.ghost}
                    onClick={() => setDeleteTarget(null)}
                  >
                    Keep it
                  </button>
                  <button
                    type="button"
                    className={styles.submit}
                    onClick={confirmDeleteBookmark}
                  >
                    Delete bookmark
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  )
}
