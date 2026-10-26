'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Note } from '../../types'
import { formatNoteDate, padIndex } from '../../lib/format'
import { useSpotlight } from '../../interactive/use-pointer'

/**
 * One line of the tracklist.
 *
 * Index, title, tags, date, runtime — in that order, left to right, because
 * that is how a sleeve is read. The runtime is the reading time formatted like
 * a track length, which is the whole conceit: a blog post you can put a
 * duration on.
 */
export function NoteRow({ note }: { note: Note }) {
  const ref = useSpotlight<HTMLAnchorElement>()

  return (
    <Link
      ref={ref}
      href={`/notes/${note.slug}`}
      className="lg-note-row group"
      aria-label={`${note.title} — ${note.duration}`}
    >
      <span className="lg-note-row__index">{padIndex(note.order)}</span>

      <span className="min-w-0">
        <span className="lg-note-row__title block">{note.title}</span>

        <span className="lg-note-row__tags mt-2.5 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span key={tag} className="lg-tag">
              {tag}
            </span>
          ))}
        </span>
      </span>

      <span className="lg-note-row__meta">
        <span>{formatNoteDate(note.publishedAt)}</span>
        <span className="text-[var(--lg-ink-dim)]">{note.duration}</span>
        <ArrowUpRight
          size={13}
          className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </Link>
  )
}
