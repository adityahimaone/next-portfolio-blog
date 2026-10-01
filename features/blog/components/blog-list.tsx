'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { RefreshCw, X } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'
import {
  BoothControl,
  Cover,
  FilterRow,
  PageHeader,
  useDockSlot,
  useRoomChannel,
} from '@/features/booth'
import {
  formatRuntime,
  minutesFromReadingTime,
  waveformFromReadingTime,
} from '@/lib/waveform-data'
import { formatDate } from '@/lib/date'
import { ViewCounter } from './view-counter'
import styles from '../releases.module.css'

const SIDE_SIZE = 6
const COVER_HUES = [
  '#ff5a1f',
  '#5cd6a3',
  '#c9a574',
  '#9b6cff',
  '#d9895b',
  '#2e3f5c',
]

type Sort = 'desc' | 'asc'

/**
 * The guide paths, surfaced on the blog index rather than behind their own
 * route. The guide pages themselves stay — the links below resolve to them —
 * but the index no longer treats them as somewhere else to go.
 */
const GUIDES = [
  {
    href: '/guides/self-hosting-nextjs',
    title: 'Self-hosting a Next.js app on a VPS',
    description:
      'From an empty server to a monitored production app: Nginx, PM2, SSL, and the deployment pipeline.',
    steps: 4,
  },
  {
    href: '/guides/vps-vs-vercel',
    title: 'VPS vs Vercel vs Netlify',
    description:
      'Side by side, including the case for not self-hosting at all. Most projects should not.',
    steps: 3,
  },
] as const

/**
 * The questions these notes keep getting asked, answered on the page rather
 * than behind a separate route. `details`/`summary` means the answer is in the
 * DOM for a crawler and for anyone reading with JS disabled, without paying for
 * an accordion component in a file that is already a client component.
 */
const BLOG_FAQ = [
  {
    question: 'How much does it cost to self-host Next.js on a VPS?',
    answer:
      'A $5/month VPS with 1GB RAM and 1 vCPU comfortably serves a typical Next.js app and a few side services. Equivalent traffic on Vercel Pro starts around $20/month, and the gap widens with scale.',
  },
  {
    question: 'Is a VPS cheaper than Vercel?',
    answer:
      'At small scale, roughly comparable. A VPS wins when you need custom middleware, specific Node flags, background jobs, or when you want to avoid vendor lock-in. You trade the platform fee for being the operations team.',
  },
  {
    question: 'Should I self-host at all?',
    answer:
      'For most projects, no. Managed platforms are cheaper in time and the failure modes you take on are real. It is worth it when you need custom middleware, specific Node flags, or persistent background jobs. This site runs on a VPS, which is the exception rather than the rule.',
  },
  {
    question: 'Why write about DevOps on a frontend site?',
    answer:
      'Because the frontend is what breaks when the infrastructure is wrong, and because the alternative is pretending the deployment is someone else’s problem. Every post here is something that actually went wrong and got written down.',
  },
] as const

export function BlogList({ posts }: { posts: BlogMeta[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const setHue = useRoomChannel()

  // Filters live in the URL, so a filtered view stays shareable.
  const query = searchParams.get('q') ?? ''
  const tag = searchParams.get('tag')
  const sort: Sort = searchParams.get('sort') === 'asc' ? 'asc' : 'desc'

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

  const isFiltered = Boolean(query || tag)
  const leads = isFiltered ? [] : filtered.filter((post) => post.pinned)
  const tracks = isFiltered ? filtered : filtered.filter((post) => !post.pinned)

  // The room takes a colour from the post currently in focus.
  useEffect(() => {
    const source = leads[0] ?? tracks[0]
    if (!source) return
    setHue(COVER_HUES[source.tags.length % COVER_HUES.length])
  }, [leads, tracks, setHue])

  useDockSlot(
    <span className={styles.scrubMeta}>
      {posts.length} posts · {tagCounts.length} tags
    </span>,
    [posts.length, tagCounts.length],
  )

  return (
    <>
      <main className={styles.page} id="main-content">
        <PageHeader
          index="03"
          eyebrow="Releases"
          title="Notes from the build."
          description="Frontend engineering, interface systems, and the decisions behind the work."
          hint={
            <>
              {posts.length} posts · {tagCounts.length} tags
            </>
          }
        />

        <div className={styles.releases}>
          <div className={`${styles.dock} glass`}>
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
                type="search"
                value={query}
                onChange={(event) =>
                  updateParam('q', event.target.value || null)
                }
                className={styles.search}
                aria-label="Search notes"
                placeholder="Search titles and tags…"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => updateParam('q', null)}
                  className={styles.searchClear}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <BoothControl
              onClick={() =>
                updateParam('sort', sort === 'desc' ? 'asc' : 'desc')
              }
              className={styles.sortBtn}
            >
              {sort === 'desc' ? 'Latest' : 'Oldest'}
            </BoothControl>
          </div>

          <FilterRow
            label="Filter by tag"
            value={tag ?? ''}
            onChange={(next) => updateParam('tag', next || null)}
            options={[
              { value: '', label: 'All' },
              ...tagCounts.map(([name, count]) => ({
                value: name,
                label: name,
                count,
              })),
            ]}
          />

          {/*
                    The guide cluster that used to live on a standalone `/guides` route,
                    surfaced here because the posts it assembles are on this page. The
                    links still resolve to the guide pages — only the index moved.

                    Hidden while a filter is active: a filtered list of two posts sitting
                    under a block of unrelated guides reads as broken rather than as
                    context, and the filter's own empty state already explains itself.
                  */}
          {!isFiltered && (
            <section className={styles.guides} aria-labelledby="guides-title">
              <div className={styles.guidesHead}>
                <h2 id="guides-title" className={styles.guidesTitle}>
                  Start here
                </h2>
                <p className={styles.guidesNote}>
                  Ordered paths through the notes, for when a search is not the
                  thing you want.
                </p>
              </div>
              <ul className={styles.guidesList}>
                {GUIDES.map((guide) => (
                  <li key={guide.href}>
                    <Link href={guide.href} className={styles.guide}>
                      <span className={styles.guideMeta}>
                        {guide.steps} steps
                      </span>
                      <b>{guide.title}</b>
                      <span className={styles.guideDesc}>
                        {guide.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {leads.map((post) => (
            <LeadRelease key={post.slug} post={post} />
          ))}

          <Side
            title="Side A"
            posts={tracks.slice(0, SIDE_SIZE)}
            offset={0}
            code="A"
            total={filtered.length}
          />
          <Side
            title="Side B"
            posts={tracks.slice(SIDE_SIZE)}
            offset={SIDE_SIZE}
            code="B"
            total={filtered.length}
          />

          {/*
            The questions that were answering "should I self-host?" on a
            separate page, asked on the page where the writing is. Native
            `<details>` rather than a state-driven accordion: it works before
            hydration, is keyboard-reachable for free, and needs no client
            state in a list that is already a client component.
          */}
          {!isFiltered && (
            <section className={styles.faq} aria-labelledby="faq-title">
              <h2 id="faq-title" className={styles.faqTitle}>
                Common questions
              </h2>
              <dl className={styles.faqList}>
                {BLOG_FAQ.map((entry) => (
                  <div key={entry.question} className={styles.faqItem}>
                    <dt>
                      <details className={styles.faqDetails}>
                        <summary className={styles.faqSummary}>
                          {entry.question}
                        </summary>
                        <dd className={styles.faqAnswer}>{entry.answer}</dd>
                      </details>
                    </dt>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {filtered.length === 0 && (
            <div className={styles.empty}>
              <h2 className={styles.emptyTitle}>No notes match that filter</h2>
              <p className={styles.emptyText}>
                Try another search or tag, or clear the filters to see all
                notes.
              </p>
              <button
                type="button"
                onClick={() => router.replace(pathname, { scroll: false })}
                className={styles.resetBtn}
              >
                <RefreshCw size={14} />
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function LeadRelease({ post }: { post: BlogMeta }) {
  const minutes = minutesFromReadingTime(post.readingTime)
  return (
    <section className={styles.lead}>
      <div className={styles.leadArt}>
        <Cover
          seed={post.slug}
          title={post.title}
          catalog="LEAD"
          sizes="(max-width: 820px) 40vw, 190px"
          priority
        />
      </div>
      <div>
        <p className={styles.leadKicker}>Lead release · {post.readingTime}</p>
        <h2 className={styles.leadTitle}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className={styles.leadDesc}>{post.description}</p>
        <p className={styles.leadMeta}>
          <span>{formatDate(post.date)}</span>
          <span className={styles.wave} aria-hidden="true">
            {waveformFromReadingTime(post.readingTime).map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </span>
          <span>{formatRuntime(minutes)}</span>
          <ViewCounter slug={post.slug} />
        </p>
      </div>
    </section>
  )
}

function Side({
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
      <div className={styles.sideHead}>
        <h2 className={styles.sideTitle}>{title}</h2>
        <span className={styles.sideCount}>
          {posts.length} of {total} tracks
        </span>
      </div>
      <ul className={styles.trackList}>
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className={styles.track}>
              <span className={styles.trackIndex}>
                {code}
                {offset + index + 1}
              </span>
              <span className={styles.trackArt}>
                <Cover seed={post.slug} title={post.title} sizes="44px" />
              </span>
              <span className={styles.trackBody}>
                <span className={styles.trackTitle} title={post.title}>
                  {post.title}
                </span>
                <span className={styles.trackMeta}>
                  {formatDate(post.date)}
                  <ViewCounter slug={post.slug} />
                </span>
              </span>
              <span className={styles.wave} aria-hidden="true">
                {waveformFromReadingTime(post.readingTime).map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </span>
              <span className={styles.runtime}>{post.readingTime}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
