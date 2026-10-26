'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Link2, Printer } from 'lucide-react'
import type { Note, NoteBlock } from '../../types'
import { Atmosphere } from '../../components/atmosphere'
import { formatLongDate, formatNoteDate, padIndex } from '../../lib/format'
import { useMagnetic } from '../../interactive/use-pointer'
import { useNote } from '../../lib/use-content'

/**
 * The reader.
 *
 * Distraction-free by subtraction: one column of prose, one rail of utility,
 * and the dock at the bottom doing its job. The only chrome above the text is a
 * hairline progress rule, because a long note needs a sense of remaining length
 * and nothing else.
 *
 * Nothing here owns audio, so navigating into a note does not touch the
 * rotation that is already playing.
 */

function headingId(index: number) {
  return `section-${index}`
}

function Block({ block, index }: { block: NoteBlock; index: number }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 id={headingId(index)} className="scroll-mt-28">
          {block.text}
        </h2>
      )
    case 'quote':
      return <blockquote>{block.text}</blockquote>
    case 'list':
      return (
        <ul>
          {(block.items ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    case 'code':
      return (
        <pre>
          <code data-language={block.language}>{block.code}</code>
        </pre>
      )
    default:
      return <p>{block.text}</p>
  }
}

export function NoteReaderView({
  note: initialNote,
  previous,
  next,
}: {
  note: Note
  previous: Note | null
  next: Note | null
}) {
  // Server-rendered note first; the hook only refreshes it if a remote content
  // endpoint is configured (see lib/use-content.ts).
  const note = useNote(initialNote, initialNote.slug) ?? initialNote
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const magnetic = useMagnetic<HTMLAnchorElement>(0.14, 60)

  const headings = useMemo(
    () =>
      note.body
        .map((block, index) => ({ block, index }))
        .filter(({ block }) => block.type === 'heading' && block.text),
    [note.body],
  )

  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0)
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const share = useCallback(async () => {
    const url = window.location.href
    const payload = {
      title: note.title,
      text: note.excerpt,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(payload)
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* the user dismissed the share sheet */
    }
  }, [note.excerpt, note.title])

  return (
    <div className="lg-root relative min-h-[100svh] overflow-x-clip pb-32">
      <Atmosphere />

      <div
        className="fixed inset-x-0 top-0 z-40 h-px origin-left bg-gradient-to-r from-[var(--lg-cyan)] via-white/70 to-[var(--lg-amber)]"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />

      <article className="lg-page relative z-10 pt-8 sm:pt-12">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/#notes"
            className="group inline-flex items-center gap-2 text-[12px] font-medium text-[var(--lg-ink-dim)] transition-colors hover:text-[var(--lg-ink)]"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-500 group-hover:-translate-x-0.5"
            />
            Liner notes
          </Link>
          <span className="lg-mono text-[var(--lg-ink-faint)]">
            Side A · {padIndex(note.order)}
          </span>
        </div>

        <header className="mt-12 max-w-[900px]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="lg-mono text-[var(--lg-amber)]">
              Liner note {padIndex(note.order)}
            </span>
            <span className="h-2.5 w-px bg-white/15" aria-hidden="true" />
            <span className="lg-mono text-[var(--lg-ink-faint)]">
              {formatNoteDate(note.publishedAt)}
            </span>
            <span className="lg-mono text-[var(--lg-ink-faint)]">
              {note.duration}
            </span>
          </div>

          <h1 className="lg-display mt-6 text-[clamp(2.1rem,5.4vw,3.9rem)] text-[var(--lg-ink)]">
            {note.title}
          </h1>

          <p className="lg-body mt-6 max-w-[60ch] text-[16px] text-[var(--lg-ink-dim)]">
            {note.excerpt}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-between gap-6 border-y border-white/[0.08] py-5">
            <div className="flex items-center gap-3">
              <span className="lg-glass flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-medium tracking-[0.06em]">
                AH
              </span>
              <div>
                <p className="text-[13px] font-medium tracking-[-0.01em]">
                  Aditya Himawan
                </p>
                <p className="lg-mono mt-0.5 text-[9px] text-[var(--lg-ink-faint)]">
                  {note.readingMinutes} min read · written{' '}
                  {formatLongDate(note.publishedAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {note.tags.map((tag) => (
                <span key={tag} className="lg-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_248px] lg:gap-20">
          <div className="lg-prose">
            {note.body.map((block, index) => (
              <Block key={index} block={block} index={index} />
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-14 flex flex-col gap-8">
              <div>
                <p className="lg-mono mb-3 text-[var(--lg-ink-faint)]">
                  In this note
                </p>
                <nav className="flex flex-col gap-2">
                  {headings.map(({ block, index }) => (
                    <a
                      key={index}
                      href={`#${headingId(index)}`}
                      className="group flex items-start gap-2 text-[12.5px] leading-[1.45] text-[var(--lg-ink-dim)] transition-colors hover:text-[var(--lg-ink)]"
                    >
                      <span className="mt-[7px] h-px w-3 shrink-0 bg-current opacity-40 transition-all duration-500 group-hover:w-4 group-hover:opacity-100" />
                      {block.text}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="h-px w-full bg-white/[0.08]" />

              <div>
                <p className="lg-mono mb-3 text-[var(--lg-ink-faint)]">Note</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => void share()}
                    className="inline-flex items-center gap-2 text-left text-[12.5px] text-[var(--lg-ink-dim)] transition-colors hover:text-[var(--lg-ink)]"
                  >
                    {copied ? <Check size={13} /> : <Link2 size={13} />}
                    {copied ? 'Link copied' : 'Share'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 text-left text-[12.5px] text-[var(--lg-ink-dim)] transition-colors hover:text-[var(--lg-ink)]"
                  >
                    <Printer size={13} />
                    Print
                  </button>
                </div>
              </div>

              <div className="h-px w-full bg-white/[0.08]" />

              <div>
                <p className="lg-mono mb-2 text-[var(--lg-ink-faint)]">
                  Progress
                </p>
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10">
                    <span
                      className="block h-px origin-left bg-[var(--lg-cyan)]"
                      style={{ transform: `scaleX(${progress})` }}
                    />
                  </span>
                  <span className="lg-mono text-[var(--lg-ink-dim)]">
                    {Math.round(progress * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-20 border-t border-white/[0.08] pt-10">
          <p className="lg-mono text-[var(--lg-ink-faint)]">
            End of side A · Liner note {padIndex(note.order)}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {previous ? (
              <Link
                href={`/notes/${previous.slug}`}
                className="lg-glass group flex flex-col gap-2 rounded-2xl p-5 transition-transform duration-500 hover:-translate-y-0.5"
              >
                <span className="lg-mono flex items-center gap-2 text-[var(--lg-ink-faint)]">
                  <ArrowLeft size={12} />
                  Previous · {previous.duration}
                </span>
                <span className="text-[14px] leading-[1.4] font-medium text-[var(--lg-ink)]">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}

            {next ? (
              <Link
                ref={magnetic}
                href={`/notes/${next.slug}`}
                className="lg-glass group flex flex-col gap-2 rounded-2xl p-5 text-right transition-transform duration-500 hover:-translate-y-0.5 sm:items-end"
              >
                <span className="lg-mono flex items-center gap-2 text-[var(--lg-ink-faint)]">
                  Next · {next.duration}
                  <ArrowRight size={12} />
                </span>
                <span className="text-[14px] leading-[1.4] font-medium text-[var(--lg-ink)]">
                  {next.title}
                </span>
              </Link>
            ) : (
              <Link
                href="/notes"
                className="lg-glass group flex flex-col gap-2 rounded-2xl p-5 text-right transition-transform duration-500 hover:-translate-y-0.5 sm:items-end"
              >
                <span className="lg-mono text-[var(--lg-ink-faint)]">
                  End of side A
                </span>
                <span className="text-[14px] font-medium text-[var(--lg-ink)]">
                  All liner notes
                </span>
              </Link>
            )}
          </div>
        </footer>
      </article>
    </div>
  )
}
