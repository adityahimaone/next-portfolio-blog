'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FolderSearch, Plus, RefreshCw, Shuffle, Unlock, X } from 'lucide-react'
import type { Bookmark, BookmarkCategory, BookmarkFormData } from '../types'
import { BOOKMARK_CATEGORIES, channelColor } from '../constants/categories'
import { FilterRow, PageHeader, useRoomChannel } from '@/features/booth'
import { useDockSlot } from '@/features/booth/dock-slot'
import { FaviconCell } from '../components/favicon-cell'
import { TrackRow } from '../components/track-row'
import { BookmarkAdminModal } from '../components/bookmark-admin-modal'
import { useListKeys, useGlobalShortcuts } from '../hooks/use-list-keys'
import styles from '../library.module.css'

// The crate's own wash. It matches the /bookmarks entry in the booth layout so
// the room does not flip colour on mount, and it doubles as the 'All' channel
// colour — the one the room falls back to before a channel is picked.
const DEFAULT_HUE = '#2dd4bf'

/** Featured first, then alphabetical — an index reads best in a fixed order. */
function indexOrder(a: Bookmark, b: Bookmark): number {
  if (Boolean(b.featured) !== Boolean(a.featured)) {
    return Boolean(b.featured) ? 1 : -1
  }
  return a.title.localeCompare(b.title)
}

export function BookmarksPage({
  initialBookmarks,
}: {
  initialBookmarks: Bookmark[]
}) {
  const router = useRouter()
  const setHue = useRoomChannel()

  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [editing, setEditing] = useState<Bookmark | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Bookmark | null>(null)
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const [channel, setChannel] = useState<BookmarkCategory>('All')

  const searchRef = useRef<HTMLInputElement>(null)

  // One listener for the whole list. The row preview needs a pointer that can
  // rest before it opens, which touch never provides.
  const [canHover, setCanHover] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(hover: hover)')
    setCanHover(query.matches)
    const onChange = (event: MediaQueryListEvent) => setCanHover(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    fetch('/api/bookmarks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.bookmarks)) {
          setBookmarks(data.bookmarks)
        }
      })
      .catch(() =>
        setStatus('Could not refresh the library. Showing the saved copy.'),
      )
  }, [])

  useEffect(() => {
    if (!deleteTarget && !isAdminOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (deleteTarget) setDeleteTarget(null)
      else setIsAdminOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteTarget, isAdminOpen])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const bookmark of bookmarks) {
      map.set(bookmark.category, (map.get(bookmark.category) ?? 0) + 1)
    }
    return map
  }, [bookmarks])

  const channels = useMemo(
    () =>
      BOOKMARK_CATEGORIES.filter(
        (name) => name === 'All' || (counts.get(name) ?? 0) > 0,
      ),
    [counts],
  )

  const tracks = useMemo(() => {
    const q = query.toLowerCase().trim()
    return bookmarks
      .filter((bookmark) => channel === 'All' || bookmark.category === channel)
      .filter((bookmark) => {
        if (!q) return true
        return (
          bookmark.title.toLowerCase().includes(q) ||
          bookmark.description.toLowerCase().includes(q) ||
          bookmark.url.toLowerCase().includes(q) ||
          bookmark.category.toLowerCase().includes(q) ||
          bookmark.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      })
      .sort(indexOrder)
  }, [bookmarks, channel, query])

  const pinned = useMemo(
    () => bookmarks.filter((bookmark) => bookmark.featured).sort(indexOrder),
    [bookmarks],
  )

  // The room retints to whichever playlist is open.
  useEffect(() => {
    setHue(channel === 'All' ? DEFAULT_HUE : channelColor(channel))
  }, [channel, setHue])

  // The third argument is the list's identity, not its length. Category and
  // query both rebuild `tracks`, so the keyboard selection has to be dropped
  // when either changes — an index into the old list points at a different
  // bookmark in the new one, and Enter would open the wrong link.
  const { active } = useListKeys(
    tracks.length,
    (index) => {
      const target = tracks[index]
      if (target) window.open(target.url, '_blank', 'noopener,noreferrer')
    },
    `${channel}::${query}`,
  )

  const shuffle = useCallback(() => {
    if (tracks.length === 0) return
    const pick = tracks[Math.floor(Math.random() * tracks.length)]
    window.open(pick.url, '_blank', 'noopener,noreferrer')
  }, [tracks])

  useDockSlot(
    <button type="button" onClick={shuffle} className={styles.chip}>
      <Shuffle size={15} aria-hidden="true" />
      Shuffle
      <span className={styles.playlistCount}>{tracks.length}</span>
    </button>,
    [tracks.length, shuffle],
  )

  useGlobalShortcuts(
    useMemo(
      () => (key: string) => {
        if (key === '/') {
          searchRef.current?.focus()
        } else if (key === 'p') router.push('/projects')
        else if (key === 'b') router.push('/blog')
        else if (key === 'l') router.push('/bookmarks')
        // The admin panel has no visible entry point; `g` then `e` reaches it.
        // The modal still asks for the password, so the chord is only a
        // shortcut, never the credential.
        else if (key === 'e') {
          setEditing(null)
          setIsAdminOpen(true)
        }
      },
      [router],
    ),
  )

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/bookmarks?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== deleteTarget.id))
        setDeleteTarget(null)
      } else {
        setStatus(data.message || 'Could not delete that bookmark')
      }
    } catch {
      setStatus('Could not reach the bookmarks API')
    }
  }

  async function saveBookmark(
    formData: BookmarkFormData,
    id?: string,
  ): Promise<boolean> {
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
      <main className={styles.page} id="main-content">
        <PageHeader
          index="02"
          eyebrow="Library"
          title="Things worth keeping."
          description="Tools, references and ideas collected while building. Sorted featured first, then A to Z."
          hint={
            <>
              <Shuffle size={14} aria-hidden="true" />
              {bookmarks.length} saved
            </>
          }
        />

        <div className={styles.library}>
          <aside className={`${styles.sidebar} glass`} aria-label="Playlists">
            <p className={styles.sidebarTitle}>Playlists</p>
            <div className={styles.sidebarScroll}>
              {channels.map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={channel === name}
                  onClick={() => {
                    setChannel(name)
                    // No setActive here: the listKey effect in useListKeys
                    // already clears the selection when the list is replaced.
                    // Calling setActive(0) re-lit row one on every category
                    // switch, which is the bug this replaced.
                  }}
                  className={styles.playlist}
                  style={{
                    ['--led' as string]:
                      name === 'All' ? DEFAULT_HUE : channelColor(name),
                  }}
                >
                  <span className={styles.playlistLed} aria-hidden="true" />
                  <span className={styles.playlistName}>{name}</span>
                  <span className={styles.playlistCount}>
                    {name === 'All'
                      ? bookmarks.length
                      : (counts.get(name) ?? 0)}
                  </span>
                </button>
              ))}
            </div>

            {isAdmin && (
              <div className={styles.adminRow} style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null)
                    setIsAdminOpen(true)
                  }}
                  className={`${styles.adminButton} ${styles.solidButton}`}
                >
                  <Plus size={15} aria-hidden="true" />
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdmin(false)}
                  className={styles.adminButton}
                  title="Lock the panel"
                >
                  <Unlock size={14} aria-hidden="true" />
                  Lock
                </button>
              </div>
            )}
          </aside>

          <div>
            <div className={styles.chipRow}>
              <FilterRow
                label="Channels"
                value={channel}
                onChange={(next) => {
                  setChannel((next || 'All') as BookmarkCategory)
                }}
                options={channels.map((name) => ({
                  value: name,
                  label: name,
                  count:
                    name === 'All' ? bookmarks.length : (counts.get(name) ?? 0),
                }))}
              />
            </div>

            {pinned.length > 0 && (
              <section style={{ marginTop: '1.5rem' }}>
                <p className={styles.pinnedHead}>Pinned</p>
                <div className={styles.pinned}>
                  {pinned.map((bookmark) => (
                    <a
                      key={bookmark.id}
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={bookmark.title}
                      className={styles.pinnedTile}
                    >
                      <FaviconCell
                        url={bookmark.url}
                        faviconUrl={bookmark.faviconUrl}
                        alt={bookmark.title}
                        className={styles.pinnedFavicon}
                      />
                      <span className={styles.pinnedStar} aria-hidden="true">
                        ★
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            <div className={styles.searchWrap}>
              <svg
                className={styles.searchIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={styles.search}
                aria-label="Search bookmarks"
                placeholder="Search title, domain, tag…  ( / )"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className={styles.searchClear}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {status && (
              <p className={styles.status} role="status" aria-live="polite">
                {status}
              </p>
            )}

            {tracks.length > 0 ? (
              <section>
                <div className={styles.trackHead}>
                  <h2 className={styles.trackTitle}>
                    {channel === 'All' ? 'All saved' : channel}
                  </h2>
                  <span className={styles.trackCount}>
                    {tracks.length} {tracks.length === 1 ? 'link' : 'links'}
                  </span>
                </div>
                <ul className={styles.trackList}>
                  {tracks.map((bookmark, index) => (
                    <TrackRow
                      key={bookmark.id}
                      bookmark={bookmark}
                      index={index}
                      active={index === active}
                      isAdmin={isAdmin}
                      canHover={canHover}
                      onEdit={() => {
                        setEditing(bookmark)
                        setIsAdminOpen(true)
                      }}
                      onDelete={() => setDeleteTarget(bookmark)}
                    />
                  ))}
                </ul>
              </section>
            ) : (
              <div className={styles.empty}>
                <FolderSearch size={26} color="var(--booth-ink-muted)" />
                <h2 className={styles.emptyTitle}>Nothing in this playlist</h2>
                <p className={styles.emptyText}>
                  Clear the search to see everything, or pick another playlist.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setChannel('All')
                  }}
                  className={styles.adminButton}
                >
                  <RefreshCw size={14} />
                  Show everything
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <BookmarkAdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        isAdmin={isAdmin}
        onLoginSuccess={() => {
          setIsAdmin(true)
          setIsAdminOpen(false)
        }}
        editingBookmark={editing}
        onSaveBookmark={saveBookmark}
      />

      {deleteTarget && (
        <div className={styles.dialogBackdrop} role="presentation">
          <div
            className={`${styles.modal} glass`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-bookmark"
          >
            <h2 id="delete-bookmark" className={styles.modalTitle}>
              Delete “{deleteTarget.title}”?
            </h2>
            <p className={styles.modalHint}>
              This removes the bookmark from the library.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className={styles.ghost}
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className={styles.submit}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
