'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X, RefreshCw } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'
import { BlogCard } from './blog-card'
import { TagChip } from '@/components/tag-chip'
import { SignalArchiveHeader } from '@/features/layout'
import styles from '../blog.module.css'

type SortOrder = 'desc' | 'asc'

/** Rows per side of the record. */
const SIDE_SIZE = 6

export function BlogList({ posts }: { posts: BlogMeta[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const tag = searchParams.get('tag')
  const sort = (
    searchParams.get('sort') === 'asc' ? 'asc' : 'desc'
  ) as SortOrder

  const isFiltered = Boolean(query || tag)

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const search = next.toString()
    router.replace(search ? `${pathname}?${search}` : pathname, {
      scroll: false,
    })
  }

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of posts) {
      for (const t of post.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    }
    return [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )
  }, [posts])

  const sorted = useMemo(() => {
    const list = [...posts]
    list.sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime()
      return sort === 'desc' ? diff : -diff
    })
    return list
  }, [posts, sort])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return sorted.filter((post) => {
      if (tag && !post.tags.includes(tag)) return false
      if (!q) return true
      return (
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [sorted, query, tag])

  const showLeads = !isFiltered
  const leadPosts = showLeads ? filtered.filter((p) => p.pinned) : []
  const tracks = showLeads ? filtered.filter((p) => !p.pinned) : filtered

  const sideA = tracks.slice(0, SIDE_SIZE)
  const sideB = tracks.slice(SIDE_SIZE)

  return (
    <div className={styles.main}>
      <SignalArchiveHeader
        activeSection="blog"
        meterCount={posts.length}
        label="Notes 03 / Recorded ideas"
        title="Field notes"
        description="Practical writing about frontend engineering, interface systems, and the decisions behind the work."
      />

      <div className={`${styles.dock} glass-2`}>
        <div className={styles.dockTop}>
          <div className={styles.search}>
            <Search
              className={styles.searchIcon}
              size={16}
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => updateParam('q', event.target.value || null)}
              className={styles.searchInput}
              aria-label="Search notes"
              placeholder="Search titles, descriptions and tags…"
            />
            {query && (
              <button
                type="button"
                onClick={() => updateParam('q', null)}
                className={styles.clear}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              updateParam('sort', sort === 'desc' ? 'asc' : 'desc')
            }
            className={`${styles.sort} glass-1`}
          >
            {sort === 'desc' ? 'Latest' : 'Oldest'}
          </button>
        </div>

        <div className={styles.tagRow}>
          <span className={styles.tagLead}>Filter</span>
          <TagChip
            tag="All"
            active={!tag}
            onClick={() => updateParam('tag', null)}
          />
          {tagCounts.map(([name, count]) => (
            <TagChip
              key={name}
              tag={name}
              count={count}
              active={tag === name}
              onClick={() => updateParam('tag', tag === name ? null : name)}
            />
          ))}
        </div>
      </div>

      {leadPosts.length > 0 && (
        <section>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Lead singles</h2>
            <span className={`${styles.sectionCount} silkscreen`}>
              {leadPosts.length} pinned
            </span>
          </div>
          <div className={styles.tracks}>
            {leadPosts.map((post) => (
              <BlogCard key={post.slug} post={post} code="LEAD" lead />
            ))}
          </div>
        </section>
      )}

      {tracks.length > 0 ? (
        <>
          <TrackSide
            title="Side A"
            posts={sideA}
            offset={0}
            code="A"
            total={filtered.length}
          />
          {sideB.length > 0 && (
            <TrackSide
              title="Side B"
              posts={sideB}
              offset={SIDE_SIZE}
              code="B"
              total={filtered.length}
            />
          )}
        </>
      ) : (
        leadPosts.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No notes match that filter</p>
            <p>
              {filtered.length === 0 && posts.length > 0
                ? 'Try another search, or clear the filters to see all notes.'
                : 'There are no published notes yet.'}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={() => router.replace(pathname, { scroll: false })}
                className={`${styles.reset} glass-1`}
              >
                <RefreshCw size={14} />
                Clear filters
              </button>
            )}
          </div>
        )
      )}
    </div>
  )
}

function TrackSide({
  title,
  posts,
  offset,
  code,
  total,
}: {
  title: string
  posts: BlogMeta[]
  offset: number
  code: string
  total: number
}) {
  if (posts.length === 0) return null

  return (
    <section>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={`${styles.sectionCount} silkscreen`}>
          {posts.length} of {total} tracks
        </span>
      </div>
      <div className={styles.tracks}>
        {posts.map((post, index) => (
          <BlogCard
            key={post.slug}
            post={post}
            code={`${code}${offset + index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
