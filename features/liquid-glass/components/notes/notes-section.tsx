'use client'

import Link from 'next/link'
import { ArrowRight, Rss } from 'lucide-react'
import type { Note } from '../../types'
import { NoteRow } from './note-row'
import { Parallax, Reveal } from '../motion/reveal'
import { formatNoteDate, padIndex } from '../../lib/format'
import { useSpotlight } from '../../interactive/use-pointer'

function LeadNote({ note }: { note: Note }) {
  const ref = useSpotlight<HTMLAnchorElement>()

  return (
    <Link
      ref={ref}
      href={`/notes/${note.slug}`}
      className="lg-glass group block overflow-hidden rounded-[26px] p-7 sm:p-9"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="lg-mono text-[var(--lg-amber)]">Lead note</span>
        <span className="h-2.5 w-px bg-white/15" aria-hidden="true" />
        <span className="lg-mono text-[var(--lg-ink-faint)]">
          {formatNoteDate(note.publishedAt)}
        </span>
        <span className="lg-mono text-[var(--lg-ink-faint)]">
          {note.duration}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <h3 className="lg-title text-[clamp(1.6rem,3.6vw,2.5rem)] text-[var(--lg-ink)]">
            {note.title}
          </h3>
          <p className="lg-body mt-3 max-w-[52ch] text-[14px]">
            {note.excerpt}
          </p>
        </div>

        <div className="flex items-center gap-3 lg:justify-end">
          <span className="lg-mono text-[var(--lg-ink-faint)]">
            {note.readingMinutes} min read
          </span>
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 text-[12px] font-medium text-[var(--lg-ink)] transition-colors duration-500 group-hover:bg-white/[0.09]">
            Read
            <ArrowRight
              size={13}
              className="transition-transform duration-500 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function NotesSection({ notes }: { notes: Note[] }) {
  const lead = notes.find((note) => note.lead) ?? notes[0]
  const rest = notes.filter((note) => note.id !== lead.id)

  return (
    <section id="notes" className="relative pb-[clamp(80px,10vw,128px)]">
      <div className="lg-page">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6 pb-9">
            <div>
              <p className="lg-eyebrow lg-mono text-[var(--lg-ink-faint)]">
                Side A — Liner notes
              </p>
              <h2 className="lg-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)]">
                Liner notes
              </h2>
              <p className="lg-body mt-4 max-w-[54ch] text-[15px]">
                Notes on shipping software, listening closely, and the boring
                middle of craft.
              </p>
            </div>

            <div className="flex items-center gap-3 pb-2">
              <span className="lg-mono hidden text-[var(--lg-ink-faint)] sm:inline">
                {padIndex(notes.length)} entries · weekly
              </span>
              <a
                href="/rss.xml"
                className="lg-icon-button h-10 w-10"
                aria-label="Subscribe to the RSS feed"
                title="RSS"
              >
                <Rss size={14} strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          {/* A shallow scroll-linked drift. Two panes moving at slightly
              different rates is what makes the shelf read as layered glass
              rather than as a flat list of plates. */}
          <Parallax from={22} to={-22}>
            <LeadNote note={lead} />
          </Parallax>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-10 flex items-center justify-between pb-1">
            <p className="lg-mono text-[var(--lg-ink-faint)]">
              LP 01 / Side A · 33⅓
            </p>
            <p className="lg-mono hidden text-[var(--lg-ink-faint)] sm:block">
              # · Title · Tags · Date · Length
            </p>
          </div>

          <div className="lg-glass lg-glass--flat mt-3 rounded-[24px] px-2 py-1 sm:px-3">
            {rest.map((note) => (
              <NoteRow key={note.id} note={note} />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="lg-mono text-[var(--lg-ink-faint)]">
              {padIndex(notes.length)} entries · last played{' '}
              {formatNoteDate(notes[0]?.publishedAt ?? '2026-01-01')}
            </p>
            <Link
              href="/notes"
              className="group inline-flex items-center gap-2 text-[13px] font-medium text-[var(--lg-ink-dim)] transition-colors hover:text-[var(--lg-ink)]"
            >
              All liner notes
              <ArrowRight
                size={13}
                className="transition-transform duration-500 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
