'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Note } from '../types'
import { Atmosphere } from '../components/atmosphere'
import { NoteRow } from '../components/notes/note-row'
import { Reveal } from '../components/motion/reveal'
import { formatNoteDate, padIndex } from '../lib/format'
import { useNotes } from '../lib/use-content'

const totalMinutes = (notes: Note[]) =>
  notes.reduce((sum, note) => sum + note.readingMinutes, 0)

/** The full tracklist, for when the dock's Notes link is used from a note. */
export function NotesIndexView({ notes }: { notes: Note[] }) {
  const { data } = useNotes(notes)

  return (
    <div className="lg-root relative min-h-[100svh] overflow-x-clip pb-32">
      <Atmosphere />

      <main className="lg-page relative z-10 pt-8 sm:pt-12">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-[12px] font-medium text-[var(--lg-ink-dim)] transition-colors hover:text-[var(--lg-ink)]"
        >
          <ArrowLeft
            size={14}
            className="transition-transform duration-500 group-hover:-translate-x-0.5"
          />
          Index
        </Link>

        <header className="mt-12 max-w-[820px]">
          <p className="lg-eyebrow lg-mono text-[var(--lg-ink-faint)]">
            Side A — Complete tracklist
          </p>
          <h1 className="lg-display mt-4 text-[clamp(2.2rem,5.6vw,4rem)]">
            Liner notes
          </h1>
          <p className="lg-body mt-5 max-w-[56ch] text-[15px]">
            {padIndex(data.length)} entries on shipping software, listening
            closely, and the boring middle of craft.
          </p>
        </header>

        <Reveal delay={0.06}>
          <div className="mt-12 flex items-center justify-between pb-2">
            <p className="lg-mono text-[var(--lg-ink-faint)]">
              LP 01 / Side A · 33⅓
            </p>
            <p className="lg-mono hidden text-[var(--lg-ink-faint)] sm:block">
              {totalMinutes(data)} min total · last played{' '}
              {formatNoteDate(data[0]?.publishedAt ?? '2026-01-01')}
            </p>
          </div>

          <div className="lg-glass lg-glass--flat mt-3 rounded-[24px] px-2 py-1 sm:px-3">
            {data.map((note) => (
              <NoteRow key={note.id} note={note} />
            ))}
          </div>
        </Reveal>
      </main>
    </div>
  )
}
