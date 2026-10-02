'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowLeft, List, X } from 'lucide-react'
import { Cover } from '@/features/booth'
import { ViewCounter } from '@/features/blog/components/view-counter'
import { formatDate } from '@/lib/date'
import { getWaveformBars } from '@/lib/waveform-data'
import {
  guideChoices,
  guideFaq,
  guideReadingTime,
  guideSections,
  guideSteps,
  guideTable,
  type GuideMeta,
  type GuideTable,
} from '../lib/guides'
import styles from '@/features/blog/releases.module.css'

/**
 * The guide reader, wearing the blog detail's clothes.
 *
 * The two guides used to be standalone `max-w-3xl` Tailwind columns with their
 * own breadcrumb, heading scale and section spacing. They sat in the nav
 * directly beside the blog, so a reader moving between the two had to relearn
 * the page furniture. Every class here comes from the blog's own
 * `releases.module.css` — the crumbs, the cover block, the headline stack, the
 * body prose, the track list, the chapter rail — so the match is structural
 * rather than a hand-tuned approximation that would drift the next time the
 * blog moves a padding value.
 *
 * Reusing the module rather than copying it is safe because it declares no
 * local custom properties: every token it reads (`--room-base`, `--booth-ink`,
 * `--hairline`, `--font-space-grotesk`) is defined globally in `globals.css`,
 * so the styles mean the same thing here as they do on `/blog/[slug]`.
 *
 * Two things are deliberately not carried over:
 *
 *  - The dock scrubber. `useDockSlot` writes into a context that only exists
 *    under `<BoothShell>`, and the reader's own progress trace stands in for
 *    it at the top of the viewport.
 *  - Paper mode. It is a reading-surface treatment for markdown, and a guide
 *    renders structured sections rather than one document.
 *
 * The route lives under `app/(booth)/guides/` rather than `app/guides/` so it
 * mounts inside `<BoothShell>`. That is what puts the room's wash, grain and
 * vignette behind the page: `.page` paints an opaque `--room-base`, so a
 * background set locally could only ever have covered the room rather than
 * sat in it. The wash hue comes from the route map in `(booth)/layout.tsx`.
 */

/**
 * Sentence-length copy riding in `.trackMeta`.
 *
 * That class resolves to `--booth-ink-dim`, which is sized for a date or a
 * view count. A whole sentence in it measures about 1.5:1 on the cream
 * surface, so anything longer than a short label steps up to
 * `--booth-ink-muted` — the token the blog already uses for secondary prose.
 */
const READABLE_META: CSSProperties = { color: 'var(--booth-ink-muted)' }

interface Chapter {
  id: string
  title: string
  top: number
}

export function GuidePage({ meta }: { meta: GuideMeta }) {
  const articleRef = useRef<HTMLElement>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)

  const readingTime = guideReadingTime(meta.slug)
  const sections = guideSections(meta.slug)
  const steps = guideSteps(meta.slug)
  const choices = guideChoices(meta.slug)
  const table = guideTable(meta.slug)
  const faq = guideFaq(meta.slug)

  // Unused locally, but the seeded trace is what makes the section count and
  // the page feel like one of the archive's own objects rather than a
  // different kind of page that happens to share a stylesheet.
  const bars = useMemo(
    () => getWaveformBars(meta.slug, 40, { minHeight: 0.25, maxHeight: 1 }),
    [meta.slug],
  )

  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })
  const percent = useTransform(smooth, (value) => `${value * 100}%`)

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
  }, [meta.slug])

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

  return (
    <>
      <motion.div
        className={styles.scrubWave}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 60,
          margin: 0,
        }}
      >
        {bars.map((h, i) => (
          <span key={i} style={{ ['--h' as string]: `${h * 100}%` }} />
        ))}
        <motion.div className={styles.scrubFill} style={{ width: percent }}>
          {bars.map((h, i) => (
            <span key={i} style={{ ['--h' as string]: `${h * 100}%` }} />
          ))}
        </motion.div>
        <motion.span className={styles.scrubHead} style={{ left: percent }} />
      </motion.div>

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
          <article ref={articleRef} className={styles.article}>
            <div className={styles.headlineCover}>
              <Cover
                seed={meta.slug}
                title={meta.title}
                catalog={meta.eyebrow}
                sizes="84px"
                priority
              />
            </div>

            <p className={styles.headlineMeta}>
              {/*
                The byline was missing entirely: a guide showed a title and an
                eyebrow, but nothing identifying who wrote it. The Person
                JSON-LD says "Aditya Himawan" and the page never did, so the
                on-page authorship signal and the structured one disagreed.
                Links to the contact page, which gives the name an internal link
                of its own.
              */}
              <Link href="/#contact" className={styles.tag}>
                Aditya Himawan
              </Link>
              <span>·</span>
              {formatDate(meta.updated, 'long')}
              <span>·</span>
              <span>{readingTime}</span>
              <span>·</span>
              <ViewCounter slug={meta.slug} />
            </p>

            <h1 className={styles.headlineTitle}>{meta.title}</h1>
            <p className={styles.headlineDesc}>{meta.standfirst}</p>

            <div className={styles.body}>
              {sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>

                  {section.intro ? <p>{section.intro}</p> : null}

                  {section.kind === 'prose'
                    ? section.paragraphs?.map((paragraph) => (
                        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                      ))
                    : null}

                  {section.kind === 'steps' ? (
                    <ol className={styles.trackList}>
                      {steps.map((step, index) => (
                        <li key={step.slug}>
                          <Link
                            href={`/blog/${step.slug}`}
                            className={styles.track}
                          >
                            <span className={styles.trackIndex}>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className={styles.trackArt}>
                              <Cover
                                seed={step.slug}
                                title={step.title}
                                sizes="44px"
                              />
                            </span>
                            <span className={styles.trackBody}>
                              <span
                                className={styles.trackTitle}
                                title={step.summary}
                              >
                                {step.title}
                              </span>
                              {/*
                                The summary is the part that tells a reader
                                whether the step is worth opening, so it rides
                                along in the body's own meta line the way the
                                blog puts a date and a view count there. It is
                                clamped to one line: `.track` is a fixed-56px
                                row and `.trackMeta` wraps freely, so an
                                unclamped sentence grew the row to four lines
                                and broke the list's rhythm.

                                `.trackMeta`'s own colour is `--booth-ink-dim`,
                                which is tuned for a short date or a view
                                count. Carrying a whole sentence in it measured
                                about 1.5:1 against the cream surface, so the
                                ink steps up to `--booth-ink-muted`, the token
                                the blog already uses for readable secondary
                                prose.
                              */}
                              <span
                                className={styles.trackMeta}
                                style={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  ...READABLE_META,
                                }}
                              >
                                {step.summary}
                              </span>
                            </span>
                            <span className={styles.wave} aria-hidden="true">
                              {getWaveformBars(step.slug, 12, {
                                minHeight: 0.2,
                                maxHeight: 1,
                              }).map((h, i) => (
                                <span
                                  key={i}
                                  style={{ height: `${h * 100}%` }}
                                />
                              ))}
                            </span>
                            <span className={styles.runtime}>Read</span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  ) : null}

                  {section.kind === 'table' && table ? (
                    <GuideTableBlock table={table} />
                  ) : null}

                  {section.kind === 'choices' ? (
                    <dl className={styles.trackList}>
                      {choices.map((choice) => (
                        <div key={choice.pick}>
                          <h3>{choice.pick}</h3>
                          <p className={styles.trackMeta} style={READABLE_META}>
                            {choice.when}
                          </p>
                          <p>{choice.why}</p>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {section.kind === 'faq' ? (
                    <dl className={styles.trackList}>
                      {faq.map((entry) => (
                        <div key={entry.question}>
                          <h3>{entry.question}</h3>
                          <p className={styles.trackMeta} style={READABLE_META}>
                            {entry.answer}
                          </p>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </section>
              ))}

              {/*
                The one inline link the copy needs. It used to be a `Link`
                inside a paragraph; the sections carry plain strings so the
                structured data and the visible page cannot disagree, so the
                cross-reference is placed here instead.
              */}
              {meta.slug === 'vps-vs-vercel' ? (
                <p>
                  If you want the job,{' '}
                  <Link
                    href="/guides/self-hosting-nextjs"
                    className={styles.tag}
                    style={{ textDecoration: 'none' }}
                  >
                    the self-hosting guide
                  </Link>{' '}
                  is the path.
                </p>
              ) : null}
            </div>

            <div className={styles.leadMeta} style={{ marginTop: '1.5rem' }}>
              <Link
                href="/blog"
                className={styles.tag}
                style={{ textDecoration: 'none' }}
              >
                More notes
              </Link>
              <span className={styles.tag}>{meta.tag}</span>
            </div>

            <p
              className={styles.leadMeta}
              style={{ marginTop: '2rem', paddingTop: '1.5rem' }}
            >
              {meta.slug === 'self-hosting-nextjs'
                ? 'Something here out of date? '
                : 'Disagree with something here? '}
              <Link href="/#contact" className={styles.tag}>
                {meta.correction}
              </Link>
              {meta.slug === 'self-hosting-nextjs'
                ? ' — corrections are welcome.'
                : '.'}
            </p>
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
                      className={`${styles.chapter} ${
                        chapter.id.includes('-') &&
                        !chapter.id.match(/^chapter-\d+$/)
                          ? styles.chapterSub
                          : ''
                      }`}
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

/**
 * The comparison matrix.
 *
 * The blog's body styles a `table` already, so this only supplies the
 * structure and lets `.body table` / `.body th` do the typography. The blank
 * leading header cell is what lets the first column be a row header without a
 * column title, and `scope` on every cell is what makes a screen reader
 * announce "Background jobs: Yes" instead of just the cell text.
 */
function GuideTableBlock({ table }: { table: GuideTable }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th scope="col">
              {/* Visually blank, so the first column can be a row header
                  without inventing a column title — but "Criterion" still
                  reaches a screen reader rather than an empty header cell. */}
              <span
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  overflow: 'hidden',
                  clipPath: 'inset(50%)',
                }}
              >
                Criterion
              </span>
            </th>
            {table.columns.map((column) => (
              <th scope="col" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.cells.map((cell, index) => (
                <td key={`${row.label}-${index}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
