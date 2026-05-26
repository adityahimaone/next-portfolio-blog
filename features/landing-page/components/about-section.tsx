'use client'

/**
 * Ravemped 4.0 — About Section (FL Studio Piano Roll)
 *
 * Concept: Hidup Adit sebagai komposisi MIDI. Sumbu X = tahun (2020–2026),
 * Sumbu Y = 4 kategori lane (LEARNING, PROJECTS, CAREER, PIVOTS).
 * Hover note → tooltip detail. Toolbar visual props (select/draw/zoom).
 * Mobile: vertical card stack fallback.
 */

import { useState, useMemo } from 'react'
import { m, useReducedMotion, AnimatePresence } from 'motion/react'
import { Pointer, Pencil, Eraser, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionFrame } from '../r3/section-frame'
import { EXPERIENCES } from '../constants'
import type { ExperienceItem } from '../constants'

// ─── Piano Roll Config ────────────────────────────────────

const YEAR_START = 2020
const YEAR_END = 2026
const TOTAL_YEARS = YEAR_END - YEAR_START + 1 // 7 years

type LaneType = 'learning' | 'projects' | 'career' | 'pivots'

type NoteData = {
  id: number
  role: string
  company: string
  period: string
  lane: LaneType
  startYear: number
  endYear: number
  description?: string
}

function parseYear(periodStr: string): { start: number; end: number } {
  const parts = periodStr.split(' - ')
  const startMatch = parts[0]?.match(/(\d{4})/)
  const endMatch = parts[1]?.match(/(\d{4})/)
  const start = startMatch ? parseInt(startMatch[1]) : YEAR_START
  const end = parts[1]?.includes('PRESENT') ? YEAR_END : endMatch ? parseInt(endMatch[1]) : start
  return { start, end }
}

function getLane(exp: ExperienceItem): LaneType {
  // Map experience type to lane
  if (exp.type === 'Education') return 'learning'
  if (exp.type === 'Full Time') return 'career'
  if (exp.type === 'Part Time') return 'projects'
  return 'pivots'
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
          lane: 'learning',
          startYear: start,
          endYear: end,
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
        lane: getLane(exp),
        startYear: start,
        endYear: end,
        description: exp.description?.[0],
      })
    }
  }

  return notes
}

// ─── Lane config ─────────────────────────────────────────
const LANES: Record<LaneType, { label: string; color: string; token: string }> = {
  learning: { label: 'LEARNING', color: 'bg-[var(--r3-beat)]', token: 'var(--r3-beat)' },
  projects: { label: 'PROJECTS', color: 'bg-[var(--r3-clip)]', token: 'var(--r3-clip)' },
  career: { label: 'CAREER', color: 'bg-[var(--r3-signal)]', token: 'var(--r3-signal)' },
  pivots: { label: 'PIVOTS', color: 'bg-[var(--r3-melody)]', token: 'var(--r3-melody)' },
}

const LANE_ORDER: LaneType[] = ['learning', 'projects', 'career', 'pivots']

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
  const laneConfig = LANES[note.lane]

  // Calculate position as percentage
  const leftPct = ((note.startYear - YEAR_START) / TOTAL_YEARS) * 100
  const widthPct = ((note.endYear - note.startYear + 0.5) / TOTAL_YEARS) * 100
  const laneIndex = LANE_ORDER.indexOf(note.lane)

  return (
    <m.div
      className={cn(
        'absolute h-10 sm:h-11 rounded-sm cursor-pointer transition-shadow',
        laneConfig.color,
        'shadow-[0_0_8px_var(--r3-edge)]',
        isHovered && 'ring-1 ring-white/40 z-10 shadow-[0_0_12px_currentColor]',
      )}
      style={{
        left: `${leftPct}%`,
        width: `${Math.max(widthPct, 4)}%`,
        top: `${laneIndex * 52 + 8}px`,
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
      <span className="r3-mono text-[9px] sm:text-[10px] text-[var(--r3-studio)] px-2 py-1 truncate block leading-10 sm:leading-11 font-semibold">
        {note.company}
      </span>
    </m.div>
  )
}

// ─── Tooltip ──────────────────────────────────────────────
function NoteTooltip({ note }: { note: NoteData }) {
  const laneConfig = LANES[note.lane]

  return (
    <m.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="r3-panel p-3 sm:p-4 max-w-xs"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: laneConfig.token }}
        />
        <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] uppercase">
          {laneConfig.label}
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
  const laneConfig = LANES[note.lane]

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
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: laneConfig.token }}
        />
        <span className="h-full w-px bg-[var(--r3-edge)]" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] uppercase">
            {laneConfig.label}
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

// ─── Toolbar (visual props only) ──────────────────────────
function PianoToolbar() {
  const tools = [
    { icon: Pointer, label: 'SELECT' },
    { icon: Pencil, label: 'DRAW' },
    { icon: Eraser, label: 'ERASE' },
    { icon: ZoomIn, label: 'ZOOM IN' },
    { icon: ZoomOut, label: 'ZOOM OUT' },
  ]

  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--r3-edge)]">
      {tools.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-1.5 px-2 py-1.5">
          <Icon size={14} className="text-[var(--r3-text-mute)]" />
          <span className="r3-mono text-[8px] text-[var(--r3-label)] tracking-widest uppercase">
            {label}
          </span>
        </div>
      ))}
    </div>
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
      track="02"
      name="ABOUT"
      device="Piano Roll / Timeline"
      color="clip"
    >
      {/* Intro prose */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-8 sm:mb-12"
      >
        <p className="r3-prose text-sm sm:text-base text-[var(--r3-text-mute)] max-w-2xl leading-relaxed">
          Enam tahun. Setiap milestone adalah satu note — ada yang staccato pendek,
          ada yang sustained chord panjang. Hover piano roll untuk dengar ceritanya.
        </p>
      </m.div>

      {/* ─── Desktop Piano Roll ─────────────────────────── */}
      <div className="hidden sm:block">
        <div className="r3-panel-rack p-4 sm:p-6 overflow-x-auto">
          {/* Toolbar */}
          <PianoToolbar />

          {/* Year axis (top) */}
          <div className="flex mb-2 ml-16">
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
            {/* Y-axis lane labels */}
            <div className="w-16 shrink-0 flex flex-col justify-around">
              {LANE_ORDER.map((lane) => (
                <span
                  key={lane}
                  className="r3-mono text-[9px] text-[var(--r3-label)] text-right pr-2 h-[52px] flex items-center"
                >
                  {LANES[lane].label}
                </span>
              ))}
            </div>

            {/* Note area */}
            <div className="flex-1 relative min-h-[220px] border border-[var(--r3-edge)] rounded-sm bg-[var(--r3-studio)]/50">
              {/* Grid lines (vertical per year) */}
              {Array.from({ length: TOTAL_YEARS - 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-[var(--r3-edge)]/50"
                  style={{ left: `${((i + 1) / TOTAL_YEARS) * 100}%` }}
                />
              ))}

              {/* Horizontal lane dividers */}
              {Array.from({ length: LANE_ORDER.length - 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 w-full h-px bg-[var(--r3-edge)]/30"
                  style={{ top: `${(i + 1) * 52 + 8}px` }}
                />
              ))}

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
          <div className="flex items-center gap-4 mt-4 ml-16 flex-wrap">
            {LANE_ORDER.map((lane) => (
              <div key={lane} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-6 rounded-sm"
                  style={{ backgroundColor: LANES[lane].token }}
                />
                <span className="r3-mono text-[10px] text-[var(--r3-text-mute)]">
                  {LANES[lane].label}
                </span>
              </div>
            ))}
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

      {/* ─── Liner Notes (Prose) ─────────────────────────── */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-12 sm:mt-16 max-w-2xl"
      >
        <p className="r3-prose text-sm sm:text-base text-[var(--r3-text-mute)] leading-relaxed mb-4">
          Gw mulai dari self-taught, belajar dari YouTube, dokumentasi, dan trial-error.
          Enam tahun jadi frontend developer, dari freelance kecil-kecilan sampai full-time
          di perusahaan yang serius. Tapi yang paling gw suka adalah bikin tools yang gw
          butuh sendiri — tools yang terasa kayak extension dari otak gw. Gw percaya design
          dan engineering harus jalan bareng, bukan terpisah. Setiap pixel, setiap interaction,
          harus punya alasan.
        </p>
        <p className="r3-prose text-sm sm:text-base text-[var(--r3-text-mute)] leading-relaxed">
          Sekarang gw kejar sesuatu yang lebih ambitious: bikin produk yang terasa kayak
          alat musik — tactile, responsive, opinionated. Passion gw ke audio dan music
          production bukan cuma hobi, tapi filosofi cara gw design. Gw juga sedang build
          Hermes Agent, sebuah autonomous AI system untuk produktivitas. Semua ini adalah
          satu journey: mencari cara terbaik untuk collaborate dengan tools, dengan AI,
          dengan orang lain. Setiap project adalah satu chapter dalam komposisi yang lebih besar.
        </p>
      </m.div>
    </SectionFrame>
  )
}
