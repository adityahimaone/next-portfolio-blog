'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronDown,
  FolderSearch,
  Plus,
  RefreshCw,
  Shuffle,
  Unlock,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { Bookmark, BookmarkFormData } from '../types'
import type { BookmarkPage } from '../lib/bookmarks'
import { PAGE_SIZE } from '../lib/bookmarks'
import { channelColor } from '../constants/categories'
import { FilterRow, PageHeader, useRoomChannel } from '@/features/booth'
import { useDockSlot } from '@/features/booth/dock-slot'
import { FaviconCell } from '../components/favicon-cell'
import { TrackRow } from '../components/track-row'
import { SharedLayoutBg } from '../components/shared-layout-bg'
import { BookmarkAdminModal } from '../components/bookmark-admin-modal'
import { useListKeys, useGlobalShortcuts } from '../hooks/use-list-keys'
import { useIsMobile } from '@/hooks/use-media'
import styles from '../library.module.css'

// The crate's own wash. It matches the /bookmarks entry in the booth layout so
// the room does not flip colour on mount, and it doubles as the 'All' channel
// colour — the one the room falls back to before a channel is picked.
const DEFAULT_HUE = '#2dd4bf'

// How long the search box waits after a keystroke before it asks the server for
// a new list. Filtering used to be a local array scan, so every keystroke was
// free; now each one is a server round trip, and without this a five-letter
// word fires five navigations.
const SEARCH_DEBOUNCE_MS = 250

export function BookmarksPage({ page }: { page: BookmarkPage }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const setHue = useRoomChannel()
  const [isPending, startTransition] = useTransition()

  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [editing, setEditing] = useState<Bookmark | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Bookmark | null>(null)
  const [status, setStatus] = useState('')

  // Below 1024px the vertical playlist panel gives way to a sheet behind a
  // trigger in the filter row. Above it, the panel stays and the trigger is
  // never rendered — so there is exactly one channel list on screen at a time,
  // not the two the old markup showed side by side under 1024px.
  const isMobile = useIsMobile()
  const [isChannelSheetOpen, setIsChannelSheetOpen] = useState(false)
  const channelSheetTriggerRef = useRef<HTMLButtonElement>(null)
  const channelSheetRef = useRef<HTMLDivElement>(null)

  // The filters live in the URL, so a filtered view stays shareable and the
  // back button steps through it the way it does on /blog.
  const channel = searchParams.get('category') ?? 'All'
  const urlQuery = searchParams.get('q') ?? ''

  const searchRef = useRef<HTMLInputElement>(null)

  // Adopt the server's rows when the route re-renders. Filtered views are
  // held one page per entry rather than as a flat list, because "Load more"
  // appends a page and the back button has to be able to *remove* one again —
  // with a single flat array there is no way to tell "page 3 arrived" from
  // "the reader went back to page 1".
  const filterKey = `${channel}::${urlQuery}`

  // Rows already on screen, one entry per loaded page so a step backwards
  // through the history can drop the page it added.
  //
  // A filter change does not go through an effect. When the key no longer
  // matches, the server has already sent the new first page, so the stale
  // accumulation is simply not read — deriving during render is the React
  // documented way to reset state on a changed input, and an effect here would
  // paint the previous filter's rows for a frame first.
  const [accumulated, setAccumulated] = useState<{
    key: string
    pages: Bookmark[][]
  }>({ key: filterKey, pages: [page.items] })

  const loaded = useMemo(
    () =>
      accumulated.key === filterKey
        ? accumulated
        : { key: filterKey, pages: [page.items] },
    [accumulated, filterKey, page.items],
  )

  const tracks = useMemo(() => loaded.pages.flat(), [loaded])

  // The next page is one past the highest page already on screen, not one past
  // `page.page`. After two auto-appends the reader is looking at pages 1-3
  // while the URL still names page one, and a reader who lands on ?page=5
  // from a shared link is already past four — `loaded.pages.length` alone would
  // ask for page 2, skip everything between, and then keep re-requesting the
  // same page forever. `Math.max` covers both cases with one number.
  const highestPage = Math.max(loaded.pages.length, page.page)
  const hasMore = highestPage < page.pageCount
  const nextPage = highestPage + 1

  // The search box keeps its own draft so typing stays responsive, but the
  // draft is only trusted while it belongs to the current URL. Change the
  // filter in the sidebar and the box reverts to what the URL says, without an
  // effect and without the reader's half-typed word reappearing.
  const [draft, setDraft] = useState({ base: urlQuery, value: urlQuery })
  const queryInput = draft.base === urlQuery ? draft.value : urlQuery
  function setQueryInput(next: string) {
    setDraft({ base: urlQuery, value: next })
  }

  function updateParams(next: { q?: string; category?: string }) {
    const params = new URLSearchParams(searchParams.toString())
    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q)
      else params.delete('q')
    }
    if (next.category !== undefined) {
      if (next.category && next.category !== 'All') {
        params.set('category', next.category)
      } else {
        params.delete('category')
      }
    }
    // Any filter change returns to the first page: page 4 of the old result set
    // is meaningless against the new one, and silently clamping would show a
    // half-empty page with no explanation.
    params.delete('page')
    const search = params.toString()
    startTransition(() => {
      router.push(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      })
    })
  }

  // Debounce the search box into the URL. The raw keystrokes stay in local
  // state so typing stays responsive; only the settled value is requested.
  useEffect(() => {
    if (queryInput === urlQuery) return
    const timer = setTimeout(
      () => updateParams({ q: queryInput }),
      SEARCH_DEBOUNCE_MS,
    )
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput])

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
    if (!deleteTarget && !isAdminOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (deleteTarget) setDeleteTarget(null)
      else setIsAdminOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteTarget, isAdminOpen])

  // The channel sheet is a modal surface, so it owns Escape and returns focus
  // to the control that opened it. Focus moves in on open so a keyboard or
  // screen-reader user lands inside the list rather than behind it.
  useEffect(() => {
    if (!isChannelSheetOpen) return

    channelSheetRef.current?.focus()
    const trigger = channelSheetTriggerRef.current

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsChannelSheetOpen(false)
        trigger?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      trigger?.focus()
    }
  }, [isChannelSheetOpen])

  // The channel sheet is a modal layer, and the dock is not: the dock sits at
  // z-index 60 under the sheet's z-index 70 backdrop, so it was being dimmed
  // rather than dismissed, leaving a dead capsule on top of the dim that a tap
  // could land on and route out of an open dialog. A body attribute is what
  // lets two unrelated component trees agree on one modal's state, and the
  // attribute is cleared on unmount so a closed sheet cannot strand it.
  useEffect(() => {
    if (!isChannelSheetOpen) return

    document.body.dataset.channelSheet = 'open'
    return () => {
      delete document.body.dataset.channelSheet
    }
  }, [isChannelSheetOpen])

  // The sidebar lists every channel that holds rows, each with the count it
  // holds in total. Those counts come from the server over the whole catalogue,
  // so they stay correct on page 7 instead of describing the visible slice.
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const facet of page.facets) map.set(facet.name, facet.count)
    return map
  }, [page.facets])

  const channels = useMemo(
    () => ['All', ...page.facets.map((facet) => facet.name)],
    [page.facets],
  )

  const pinned = page.pinned

  // The room retints to whichever playlist is open.
  useEffect(() => {
    setHue(channel === 'All' ? DEFAULT_HUE : channelColor(channel))
  }, [channel, setHue])

  // The third argument is the list's identity, not its length. Category and
  // query both rebuild the rows, so the keyboard selection has to be dropped
  // when either changes — an index into the old list points at a different
  // bookmark in the new one, and Enter would open the wrong link. Appending a
  // page deliberately leaves this key alone: the list is extended, not
  // replaced, so a selection mid-list should survive a "Load more".
  const { active } = useListKeys(
    tracks.length,
    (index) => {
      const target = tracks[index]
      if (target) window.open(target.url, '_blank', 'noopener,noreferrer')
    },
    filterKey,
  )

  // One in-flight request at a time, tagged with the filter it was issued for
  // so a filter change mid-fetch does not splice the old results into the new
  // list.
  const loadingRef = useRef<{ key: string } | null>(null)

  const loadMore = useCallback(() => {
    // The sentinel and the button can both fire on a fast scroll. Without this
    // a second request goes out mid-flight and the same page lands in the list
    // twice, so the reader sees 120 rows with 60 of them duplicated and the
    // deduped React keys warn.
    if (loadingRef.current || !hasMore) return
    loadingRef.current = { key: filterKey }

    const params = new URLSearchParams()
    if (urlQuery) params.set('q', urlQuery)
    if (channel !== 'All') params.set('category', channel)
    params.set('page', String(nextPage))

    setStatus('')
    startTransition(async () => {
      try {
        // Fetched rather than navigated. A navigation would re-render the
        // whole route to hand back rows we already have, and its RSC payload
        // is the same 200KB the page cost to begin with. The API answers with
        // just the next slice.
        //
        // The URL is deliberately left alone. It keeps naming the page the
        // reader arrived on, so a refresh or a shared link reproduces that
        // page exactly rather than dropping them on page seven of ten.
        const res = await fetch(`/api/bookmarks?${params.toString()}`)
        const data = await res.json()
        if (!data.success || !Array.isArray(data.bookmarks)) {
          setStatus('Could not load more links. Try again in a moment.')
          return
        }
        if (data.bookmarks.length === 0) {
          // A short read means the catalogue shrank underneath us. Appending
          // an empty page would leave the sentinel permanently visible and the
          // observer would refire on every scroll event.
          setStatus('That is the whole library.')
          return
        }
        setAccumulated((prev) =>
          prev.key === filterKey
            ? { key: filterKey, pages: [...prev.pages, data.bookmarks] }
            : { key: filterKey, pages: [page.items, data.bookmarks] },
        )
      } catch {
        setStatus('Could not reach the bookmarks API.')
      } finally {
        // Released only if this is still the request the list is waiting on.
        // A filter change that cleared `loadingRef` has already armed a fresh
        // fetch, and unconditionally nulling here would let that one overlap
        // with the next trigger.
        if (loadingRef.current?.key === filterKey) loadingRef.current = null
      }
    })
  }, [
    hasMore,
    filterKey,
    nextPage,
    urlQuery,
    channel,
    page.items,
    loadingRef,
    setAccumulated,
    setStatus,
    startTransition,
  ])

  // The list appends itself as the reader approaches the end. The observer is
  // the only trigger; the button below stays for anyone on a keyboard, a
  // screen reader, or a browser where the observer never fires.
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore()
      },
      // A screen early rather than at the true bottom. The fetch is ~15KB of
      // JSON and the append is a re-render, not a navigation, so there is time
      // to have the rows in place before the reader arrives — bottom-triggered
      // loading shows an empty patch to anyone who scrolls faster than the
      // network.
      { rootMargin: '600px 0px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
    // Re-arms whenever `loadMore` does, which is on every change to the filter
    // and to the page it would fetch. Without this the observer holds the
    // first render's closure and keeps appending page N of a search the reader
    // has already replaced.
  }, [hasMore, loadMore])

  // A filter change invalidates any request still in flight: its rows belong to
  // a list that no longer exists, and the lock it holds would otherwise block
  // the new filter's first append until the stale response landed. The stale
  // response is still discarded on arrival — `setAccumulated`'s functional
  // update writes only when the key matches.
  useEffect(() => {
    loadingRef.current = null
  }, [filterKey])

  // The `rel="next"` target. Built the same way the server builds its
  // canonical, so the link a crawler follows and the canonical it then reads
  // describe the same document.
  const crawlParams = useMemo(() => {
    const params = new URLSearchParams()
    if (urlQuery) params.set('q', urlQuery)
    if (channel !== 'All') params.set('category', channel)
    params.set('page', String(nextPage))
    return params.toString()
  }, [urlQuery, channel, nextPage])

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

  // Appends or replaces a single row across every loaded page, so an edit
  // lands in the right place in the accumulated list instead of needing a
  // refetch. Ids are unique across pages, so this cannot hit two rows at once.
  function patchRow(id: string, update: (row: Bookmark) => Bookmark) {
    setAccumulated((prev) =>
      prev.key === filterKey
        ? {
            key: prev.key,
            pages: prev.pages.map((rows) =>
              rows.map((row) => (row.id === id ? update(row) : row)),
            ),
          }
        : prev,
    )
  }

  function removeRow(id: string) {
    setAccumulated((prev) =>
      prev.key === filterKey
        ? {
            key: prev.key,
            pages: prev.pages
              .map((rows) => rows.filter((row) => row.id !== id))
              .filter((rows) => rows.length > 0),
          }
        : prev,
    )
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/bookmarks?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        removeRow(deleteTarget.id)
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
        if (id) {
          patchRow(id, () => data.bookmark)
        } else {
          setAccumulated((prev) =>
            prev.key === filterKey
              ? { key: prev.key, pages: [data.bookmark, ...prev.pages[0]] }
              : prev,
          )
        }
        return true
      }
      return false
    } catch {
      return false
    }
  }

  // The two row actions, defined once rather than inline in the map. TrackRow is
  // memoized, and a fresh arrow function per row per render would give every
  // row a new prop identity on every append — which is the same as not
  // memoizing it at all. Each reads only setter state, so it never needs to be
  // rebuilt when a page arrives.
  const handleEdit = useCallback((bookmark: Bookmark) => {
    setEditing(bookmark)
    setIsAdminOpen(true)
  }, [])

  const handleDelete = useCallback((bookmark: Bookmark) => {
    setDeleteTarget(bookmark)
  }, [])

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
              {page.totalAll} saved
            </>
          }
        />

        <div className={styles.library}>
          <aside className={`${styles.sidebar} glass`} aria-label="Playlists">
            <p className={styles.sidebarTitle}>Playlists</p>
            <div className={styles.sidebarScroll}>
              {/* The pill glides between rows on hover, so the row backgrounds
                  themselves must stay transparent — see `.playlist`. */}
              <SharedLayoutBg inset={4}>
                {channels.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={channel === name}
                    onClick={() => updateParams({ category: name })}
                    className={styles.playlist}
                    style={{
                      ['--led' as string]:
                        name === 'All' ? DEFAULT_HUE : channelColor(name),
                    }}
                  >
                    <span className={styles.playlistLed} aria-hidden="true" />
                    <span className={styles.playlistName}>{name}</span>
                    <span className={styles.playlistCount}>
                      {name === 'All' ? page.totalAll : (counts.get(name) ?? 0)}
                    </span>
                  </button>
                ))}
              </SharedLayoutBg>
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
                onChange={(next) => updateParams({ category: next || 'All' })}
                options={channels.map((name) => ({
                  value: name,
                  label: name,
                  count:
                    name === 'All' ? page.totalAll : (counts.get(name) ?? 0),
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
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                className={styles.search}
                aria-label="Search bookmarks"
                placeholder="Search title, domain, tag… ( / )"
              />
              {queryInput && (
                <button
                  type="button"
                  onClick={() => setQueryInput('')}
                  className={styles.searchClear}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* The full channel list, with the counts the desktop panel
                carries, behind one control. Its own row rather than a control
                inside the search field, which at 360px is already down to ~230px
                of text. Not rendered at all from 1024px up, where the panel
                itself is on screen. */}
            {isMobile && (
              <button
                ref={channelSheetTriggerRef}
                type="button"
                onClick={() => setIsChannelSheetOpen(true)}
                className={styles.channelTrigger}
                aria-haspopup="dialog"
                aria-expanded={isChannelSheetOpen}
              >
                <span className={styles.channelTriggerName}>
                  {channel === 'All' ? 'All channels' : channel}
                </span>
                <span className={styles.channelTriggerCount}>
                  {channel === 'All'
                    ? page.totalAll
                    : (counts.get(channel) ?? 0)}
                </span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>
            )}

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
                    {page.total} {page.total === 1 ? 'link' : 'links'}
                  </span>
                </div>
                {/*
                  The pill replaces the row's frosted ::after, so the list is
                  the shared-layout root. `disabled` on touch: `:hover` sticks
                  after the first tap, so the pill would stay lit over one row
                  while the reader scrolls the rest of the list past it.
                */}
                <SharedLayoutBg
                  as="ul"
                  className={styles.trackList}
                  pillClassName={styles.trackPill}
                  disabled={!canHover}
                  // No inset. The playlist rows are inset pills, but these
                  // rows are full-width: the pill already spans the whole row,
                  // and the default 20px overhang pushed it past both edges of
                  // the list.
                  inset={0}
                  // No blur. The blur is the one part of the pill that costs
                  // real frames here. A `filter` does not stay inside the pill:
                  // a gaussian blur re-samples everything painted behind it in
                  // the same backdrop root, and this pill is 920x44 — four
                  // times the sidebar's area — sitting beside the sidebar's
                  // blur(18px) glass. Measured with the same protocol in the
                  // production build (4 warm-up sweeps discarded, 6 measured,
                  // each read off the DOM's inline filter to confirm the build):
                  // 24 dropped frames per sweep with the blur, 15 without. The
                  // sidebar's own pill keeps its blur and still measures 2.
                  blur={false}
                >
                  {tracks.map((bookmark, index) => (
                    <TrackRow
                      key={bookmark.id}
                      bookmark={bookmark}
                      index={index}
                      active={index === active}
                      isAdmin={isAdmin}
                      canHover={canHover}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SharedLayoutBg>

                {hasMore && (
                  <div className={styles.loadMore}>
                    {/*
                      The observer watches this, not the list. It is the one
                      node that reliably reaches the viewport only when the
                      reader nears the end of the rows above it.
                    */}
                    <div ref={sentinelRef} aria-hidden="true" />

                    {/*
                      The crawl path. Appends happen without touching the URL,
                      so without this nothing anywhere links to `?page=2` and
                      every page past the first becomes unreachable to a
                      crawler — the rows are real and server-rendered, but
                      undiscoverable. `rel="next"` is the signal, and it is in
                      the raw HTML rather than injected after hydration.

                      Visually hidden, but focusable: a keyboard reader can
                      still reach it and jump to a real page, which is the
                      same reason the Load more button below stays.
                    */}
                    <a
                      href={`${pathname}?${crawlParams}`}
                      rel="next"
                      className={styles.srOnly}
                    >
                      Next page of bookmarks
                    </a>

                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={isPending}
                      className={styles.loadMoreButton}
                    >
                      {isPending
                        ? 'Loading…'
                        : `Load ${Math.min(
                            PAGE_SIZE,
                            page.total - tracks.length,
                          )} more`}
                    </button>
                    <p className={styles.loadMoreMeta} aria-live="polite">
                      Showing {tracks.length} of {page.total}
                    </p>
                  </div>
                )}
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
                    setQueryInput('')
                    updateParams({ q: '', category: 'All' })
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

      {/* The channel list as a bottom sheet, for widths where the desktop panel
          is not on screen. Same list, same counts, same LEDs and same
          updateParams call the panel makes — the panel is a different frame
          around one list, not a different list.

          Gated on isMobile as well as on the open flag: a rotate or a resize
          across the breakpoint must not strand a dialog above a panel that is
          already back on screen. The flag is left set, so rotating back brings
          the sheet straight up again. */}
      <AnimatePresence>
        {isChannelSheetOpen && isMobile && (
          <>
            <motion.div
              className={styles.channelSheetBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsChannelSheetOpen(false)}
              role="presentation"
            />
            <motion.div
              ref={channelSheetRef}
              className={`${styles.channelSheet} glass`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="channel-sheet-title"
              tabIndex={-1}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            >
              <div className={styles.channelSheetHead}>
                <p
                  id="channel-sheet-title"
                  className={styles.channelSheetTitle}
                >
                  Channels
                </p>
                <button
                  type="button"
                  onClick={() => setIsChannelSheetOpen(false)}
                  className={styles.channelSheetClose}
                  aria-label="Close channels"
                >
                  <X size={18} />
                </button>
              </div>
              <div className={styles.channelSheetList}>
                <SharedLayoutBg inset={4}>
                  {channels.map((name) => (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={channel === name}
                      onClick={() => {
                        updateParams({ category: name })
                        setIsChannelSheetOpen(false)
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
                          ? page.totalAll
                          : (counts.get(name) ?? 0)}
                      </span>
                    </button>
                  ))}
                </SharedLayoutBg>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
