'use client'

/**
 * Ravemped 3.0 — About Section (Piano Roll / Timeline)
 *
 * Concept: Timeline hidup Adit sebagai MIDI notes di piano roll horizontal.
 * X-axis = tahun (2020–2026), Y-axis = significance (low/mid/high).
 * Hover note → tooltip detail (role, company, period).
 * Mobile: vertical stack cards fallback.
 */

import { useState, useMemo } from 'react'
import { m, useReducedMotion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { SectionFrame } from '../r3/section-frame'
import { EXPERIENCES } from '../constants'
import type { ExperienceItem } from '../constants'

// ─── Piano Roll Config ────────────────────────────────────

const YEAR_START = 2020
const YEAR_END = 2026
const TOTAL_YEARS = YEAR_END - YEAR_START + 1 // 7 years

type NoteData = {
  id: number
  role: string
  company: string
  period: string
  type: 'work' | 'education'
  startYear: number
  endYear: number
  significance: 'high' | 'mid' | 'low'
  description?: string
}

function parseYear(periodStr: string): { start: number; end: number } {
  // Formats: "OCT 2022 - PRESENT", "APR 2024 - SEP 2024", "FEB 2022 - JUL 2022"
  const parts = periodStr.split(' - ')
  const startMatch = parts[0]?.match(/(\d{4})/)
  const endMatch = parts[1]?.match(/(\d{4})/)
  const start = startMatch ? parseInt(startMatch[1]) : YEAR_START
  const end = parts[1]?.includes('PRESENT') ? YEAR_END : endMatch ? parseInt(endMatch[1]) : start
  return { start, end }
}

function getSignificance(exp: ExperienceItem): 'high' | 'mid' | 'low' {
  if (exp.type === 'Full Time') return 'high'
  if (exp.type === 'Part Time') return 'mid'
  return 'low'
}

function buildNotes(experiences: readonly ExperienceItem[]): NoteData[] {
  const notes: NoteData[] = []

  for (const exp of experiences) {
    if (exp.isGroup && exp.items) {
      for (const item of exp.items) {
        const { start, end } = parseYear(item.period)
        notes.push({
          id: notes.length + 100,
          role: item.role,
          company: item.company,
          period: item.period,
          type: 'education',
          startYear: start,
          endYear: end,
          significance: 'low',
          description: item.description,
        })
      }
    } else {
      const { start, end } = parseYear(exp.period)
      notes.push({
        id: exp.id,
        role: exp.role,
        company: exp.company,
        period: exp.period,
        type: exp.type === 'Education' ? 'education' : 'work',
        startYear: start,
        endYear: end,
        significance: getSignificance(exp),
        description: exp.description?.[0],
      })
    }
  }

  return notes
}

// ─── Significance → row position ─────────────────────────
const SIG_ROW: Record<string, number> = { high: 0, mid: 1, low: 2 }
const SIG_LABELS = ['HIGH', 'MID', 'LOW']

// ─── Note Component (Desktop) ─────────────────────────────
function PianoNote({
  note,
  onHover,
  isHovered,
}: {
  note: NoteData
  onHover: (n: NoteData | null) => void
  isHovered: boolean
}) {
  const prefersReduced = useReducedMotion()

  // Calculate position as percentage
  const leftPct = ((note.startYear - YEAR_START) / TOTAL_YEARS) * 100
  const widthPct = ((note.endYear - note.startYear + 0.5) / TOTAL_YEARS) * 100
  const row = SIG_ROW[note.significance]

  const colorClass = note.type === 'work'
    ? 'bg-[var(--r3-clip)] shadow-[0_0_8px_var(--r3-clip)]'
    : 'bg-[var(--r3-beat)] shadow-[0_0_8px_var(--r3-beat)]'

  const hoverColor = note.type === 'work'
    ? 'bg-[var(--r3-clip)]/90'
    : 'bg-[var(--r3-beat)]/90'

  return (
    <m.div
      className={cn(
        'absolute h-8 sm:h-9 rounded-sm cursor-pointer transition-shadow',
        colorClass,
        isHovered && 'ring-1 ring-white/40 z-10',
      )}
      style={{
        left: `${leftPct}%`,
        width: `${Math.max(widthPct, 4)}%`,
        top: `${row * 44 + 8}px`,
      }}
      initial={prefersReduced ? false : { opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: note.id * 0.05 }}
      onMouseEnter={() => onHover(note)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(note)}
      onBlur={() => onHover(null)}
      tabIndex={0}
      role="button"
      aria-label={`${note.role} at ${note.company}, ${note.period}`}
    >
      <span className="r3-mono text-[9px] sm:text-[10px] text-[var(--r3-studio)] px-2 py-1 truncate block leading-8 sm:leading-9 font-semibold">
        {note.company}
      </span>
    </m.div>
  )
}

// ─── Tooltip ──────────────────────────────────────────────
function NoteTooltip({ note }: { note: NoteData }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="r3-panel p-3 sm:p-4 max-w-xs"
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            'h-2 w-2 rounded-full shrink-0',
            note.type === 'work' ? 'bg-[var(--r3-clip)]' : 'bg-[var(--r3-beat)]',
          )}
        />
        <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] uppercase">
          {note.type}
        </span>
      </div>
      <h4 className="r3-display text-sm font-semibold text-[var(--r3-text)]">
        {note.role}
      </h4>
      <p className="r3-mono text-xs text-[var(--r3-text-mute)] mt-0.5">
        {note.company}
      </p>
      <p className="r3-mono text-[10px] text-[var(--r3-label)] mt-1">
        {note.period}
      </p>
      {note.description && (
        <p className="r3-prose text-xs text-[var(--r3-text-mute)] mt-2 leading-relaxed">
          {note.description}
        </p>
      )}
    </m.div>
  )
}

// ─── Mobile Card ──────────────────────────────────────────
function MobileNoteCard({ note }: { note: NoteData }) {
  const prefersReduced = useReducedMotion()

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="r3-panel p-4 flex gap-3"
    >
      <div className="flex flex-col items-center gap-1 shrink-0">
        <span
          className={cn(
            'h-3 w-3 rounded-full',
            note.type === 'work' ? 'bg-[var(--r3-clip)]' : 'bg-[var(--r3-beat)]',
          )}
        />
        <span className="h-full w-px bg-[var(--r3-edge)]" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] uppercase">
            {note.type}
          </span>
          <span className="r3-mono text-[10px] text-[var(--r3-label)]">
            {note.period}
          </span>
        </div>
        <h4 className="r3-display text-sm font-semibold text-[var(--r3-text)] truncate">
          {note.role}
        </h4>
        <p className="r3-mono text-xs text-[var(--r3-text-mute)] mt-0.5">
          {note.company}
        </p>
        {note.description && (
          <p className="r3-prose text-xs text-[var(--r3-text-mute)] mt-2 leading-relaxed line-clamp-2">
            {note.description}
          </p>
        )}
      </div>
    </m.div>
  )
}

// ─── Main Export ──────────────────────────────────────────
export function AboutSection() {
  const prefersReduced = useReducedMotion()
  const [hoveredNote, setHoveredNote] = useState<NoteData | null>(null)

  const notes = useMemo(() => buildNotes(EXPERIENCES), [])

  return (
    <SectionFrame
      id="about"
      track="01"
      name="ABOUT"
      device="Piano Roll / Timeline"
      color="clip"
    >
      {/* Prose intro */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-8 sm:mb-12"
      >
        <p className="r3-prose text-sm sm:text-base text-[var(--r3-text-mute)] max-w-2xl leading-relaxed">
          Six years. Every milestone is a note — some short staccato bursts,
          others long sustained chords. Hover the piano roll to hear the story.
        </p>
      </m.div>

      {/* ─── Desktop Piano Roll ─────────────────────────── */}
      <div className="hidden sm:block">
        <div className="r3-panel-rack p-4 sm:p-6 overflow-x-auto">
          {/* Year axis (top) */}
          <div className="flex mb-2 ml-12">
            {Array.from({ length: TOTAL_YEARS }).map((_, i) => (
              <div
                key={i}
                className="flex-1 text-center r3-mono text-[10px] text-[var(--r3-text-mute)] tabular-nums"
              >
                {YEAR_START + i}
              </div>
            ))}
          </div>

          {/* Grid area */}
          <div className="flex">
            {/* Y-axis labels */}
            <div className="w-12 shrink-0 flex flex-col justify-around">
              {SIG_LABELS.map((label) => (
                <span
                  key={label}
                  className="r3-mono text-[9px] text-[var(--r3-label)] text-right pr-2"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Note area */}
            <div className="flex-1 relative min-h-[140px] border border-[var(--r3-edge)] rounded-sm bg-[var(--r3-studio)]/50">
              {/* Grid lines (vertical per year) */}
              {Array.from({ length: TOTAL_YEARS - 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-[var(--r3-edge)]/50"
                  style={{ left: `${((i + 1) / TOTAL_YEARS) * 100}%` }}
                />
              ))}

              {/* Horizontal row dividers */}
              <div className="absolute left-0 right-0 top-[44px] h-px bg-[var(--r3-edge)]/30" />
              <div className="absolute left-0 right-0 top-[88px] h-px bg-[var(--r3-edge)]/30" />

              {/* Notes */}
              {notes.map((note) => (
                <PianoNote
                  key={note.id}
                  note={note}
                  onHover={setHoveredNote}
                  isHovered={hoveredNote?.id === note.id}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 ml-12">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-6 rounded-sm bg-[var(--r3-clip)]" />
              <span className="r3-mono text-[10px] text-[var(--r3-text-mute)]">Work</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-6 rounded-sm bg-[var(--r3-beat)]" />
              <span className="r3-mono text-[10px] text-[var(--r3-text-mute)]">Education</span>
            </div>
            <div className="ml-auto r3-mono text-[10px] text-[var(--r3-label)]">
              hover notes for details
            </div>
          </div>
        </div>

        {/* Tooltip */}
        <div className="h-28 mt-4">
          <AnimatePresence mode="wait">
            {hoveredNote && (
              <NoteTooltip key={hoveredNote.id} note={hoveredNote} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Mobile: Vertical Stack ─────────────────────── */}
      <div className="sm:hidden space-y-3">
        {notes.map((note) => (
          <MobileNoteCard key={note.id} note={note} />
        ))}
      </div>
    </SectionFrame>
  )
}
