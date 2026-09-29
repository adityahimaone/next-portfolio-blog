'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowLeft, ChevronLeft, ChevronRight, List, X } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'
import { Cover, useDockSlot, useRoomChannel } from '@/features/booth'
import {
  formatRuntime,
  getWaveformBars,
  minutesFromReadingTime,
} from '@/lib/waveform-data'
import { formatDate } from '@/lib/date'
import { ViewCounter } from './view-counter'
import { Markdown } from './markdown'
import styles from '../releases.module.css'

interface Chapter {
  id: string
  title: string
  top: number
}

const COVER_HUES = [
  '#ff5a1f',
  '#5cd6a3',
  '#c9a574',
  '#9b6cff',
  '#d9895b',
  '#2e3f5c',
]

export function BlogPost({
  meta,
  content,
  relatedPosts = [],
  prevPost,
  nextPost,
}: {
  meta: BlogMeta
  content: string
  relatedPosts?: BlogMeta[]
  prevPost?: BlogMeta
  nextPost?: BlogMeta
}) {
  const setHue = useRoomChannel()
  const articleRef = useRef<HTMLElement>(null)
  const [paper, setPaper] = useState(false)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)

  const minutes = minutesFromReadingTime(meta.readingTime)
  const bars = useMemo(
    () => getWaveformBars(meta.slug, 40, { minHeight: 0.25, maxHeight: 1 }),
    [meta.slug],
  )

  useEffect(() => {
    setHue(COVER_HUES[(meta.tags.length || 1) % COVER_HUES.length])
  }, [meta.tags.length, setHue])

  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })
  const percent = useTransform(smooth, (value) => `${value * 100}%`)

  // Chapter ticks are measured once the headings exist and ids are assigned.
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = articleRef.current
      if (!el) return

      let h2 = 0
      let h3 = 0
      let lastH2 = 0
      const next: Chapter[] = []

      el.querySelectorAll('h2').forEach((node) => {
        h2 += 1
        h3 = 0
        lastH2 = h2
        const id = `chapter-${h2}`
        node.id = id
        next.push({
          id,
          title: node.textContent ?? '',
          top: node.getBoundingClientRect().top + window.scrollY,
        })
      })

      el.querySelectorAll('h3').forEach((node) => {
        h3 += 1
        const id = `chapter-${lastH2}-${h3}`
        node.id = id
        next.push({
          id,
          title: node.textContent ?? '',
          top: node.getBoundingClientRect().top + window.scrollY,
        })
      })

      setChapters(next)
    }, 120)

    return () => clearTimeout(timer)
  }, [content])

  // The readouts update a few times a second, not on every scroll frame.
  useEffect(() => {
    let last = 0
    return smooth.on('change', (value) => {
      const now = Date.now()
      if (now - last < 220) return
      last = now
      setProgress(value)
    })
  }, [smooth])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const jumpTo = useCallback((top: number) => {
    window.scrollTo({ top, behavior: 'smooth' })
    setOpen(false)
  }, [])

  const current = useMemo(() => {
    let found: Chapter | null = null
    for (const chapter of chapters) {
      if (chapter.top - 120 <= window.scrollY + 200) found = chapter
    }
    return found
  }, [chapters, progress])

  useDockSlot(
    <div className={styles.scrubber} role="group" aria-label="Reading progress">
      {prevPost && (
        <Link
          href={`/blog/${prevPost.slug}`}
          className={styles.scrubBtn}
          aria-label="Previous note"
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      <div className={styles.scrubWave} aria-hidden="true">
        {bars.map((h, i) => (
          <span key={i} style={{ ['--h' as string]: `${h * 100}%` }} />
        ))}
        <motion.div className={styles.scrubFill} style={{ width: percent }}>
          {bars.map((h, i) => (
            <span key={i} style={{ ['--h' as string]: `${h * 100}%` }} />
          ))}
        </motion.div>
        <motion.span className={styles.scrubHead} style={{ left: percent }} />
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            className={styles.scrubTick}
            style={{
              left: `${(chapter.top / Math.max(1, document.body.scrollHeight)) * 100}%`,
            }}
            onClick={() => jumpTo(chapter.top)}
            tabIndex={-1}
            aria-label={`Jump to ${chapter.title}`}
          />
        ))}
      </div>

      <span className={styles.scrubMeta}>
        {current?.title ?? 'Intro'} · {formatRuntime(progress * minutes)} /{' '}
        {formatRuntime(minutes)}
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={styles.scrubBtn}
        aria-label="Chapters"
        aria-expanded={open}
      >
        <List size={16} />
      </button>

      {nextPost && (
        <Link
          href={`/blog/${nextPost.slug}`}
          className={styles.scrubBtn}
          aria-label="Next note"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </div>,
    [
      bars,
      chapters,
      current,
      meta.slug,
      minutes,
      nextPost,
      open,
      prevPost,
      progress,
    ],
  )

  return (
    <>
      <main className={styles.page} id="main-content">
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/blog" className={styles.crumbBack}>
            <ArrowLeft size={14} aria-hidden="true" />
            All notes
          </Link>
          <span className={styles.crumbSep} aria-hidden="true">
            /
          </span>
          <span className={styles.crumbHere} aria-current="page">
            {meta.title}
          </span>
        </nav>

        <div className={styles.reader}>
          <article
            ref={articleRef}
            className={`${styles.article} ${paper ? styles.paper : ''}`}
          >
            <div className={styles.headlineCover}>
              <Cover
                seed={meta.slug}
                title={meta.title}
                sizes="84px"
                priority
              />
            </div>

            <p className={styles.headlineMeta}>
              {formatDate(meta.date, 'long')}
              <span>·</span>
              <span>{meta.readingTime}</span>
              <span>·</span>
              <ViewCounter slug={meta.slug} />
            </p>

            <h1 className={styles.headlineTitle}>{meta.title}</h1>
            <p className={styles.headlineDesc}>{meta.description}</p>

            <div className={styles.body}>
              <Markdown content={content} />
            </div>

            <div className={styles.leadMeta} style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setPaper((v) => !v)}
                aria-pressed={paper}
                className={styles.tag}
              >
                Paper mode
              </button>
              {meta.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className={styles.tag}
                  style={{ textDecoration: 'none' }}
                >
                  {tag}
                </Link>
              ))}
            </div>

            {relatedPosts.length > 0 && (
              <section className={styles.related}>
                <h2 className={styles.sideTitle}>Next in the crate</h2>
                <ul
                  className={styles.trackList}
                  style={{ marginTop: '0.75rem' }}
                >
                  {relatedPosts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className={styles.track}
                      >
                        <span className={styles.trackIndex}>→</span>
                        <span className={styles.trackArt}>
                          <Cover
                            seed={post.slug}
                            title={post.title}
                            sizes="44px"
                          />
                        </span>
                        <span className={styles.trackBody}>
                          <span className={styles.trackTitle}>
                            {post.title}
                          </span>
                          <span className={styles.trackMeta}>
                            {formatDate(post.date)} · {post.readingTime}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          {chapters.length > 0 && (
            <nav className={`${styles.chapters} glass`} aria-label="Chapters">
              <p className={styles.chapterTitle}>Chapters</p>
              <ul className={styles.chapterList}>
                {chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(chapter.top)}
                      aria-current={current?.id === chapter.id || undefined}
                      className={`${styles.chapter} ${chapter.id.includes('-') && !chapter.id.match(/^chapter-\d+$/) ? styles.chapterSub : ''}`}
                    >
                      {chapter.title}
                    </button>
                  </li>
                ))}
              </ul>
              <p className={styles.chapterFoot}>{chapters.length} chapters</p>
            </nav>
          )}

          {chapters.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={styles.chapterFab}
              aria-label="Open chapters"
            >
              <List size={15} aria-hidden="true" />
              {chapters.length}
            </button>
          )}
        </div>
      </main>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 70,
                background: 'rgba(0,0,0,0.55)',
              }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Chapters"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className={`${styles.chapterDrawer} glass`}
            >
              <div className={styles.chapterDrawerHead}>
                <p className={styles.chapterTitle}>Chapters</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={styles.drawerClose}
                  aria-label="Close chapters"
                >
                  <X size={18} />
                </button>
              </div>
              <ul className={styles.chapterList}>
                {chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(chapter.top)}
                      className={styles.chapter}
                    >
                      {chapter.title}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
