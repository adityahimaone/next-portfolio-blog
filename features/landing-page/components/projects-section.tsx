'use client'

/**
 * Ravemped 4.0 — Projects Section (DAW Arrangement View)
 *
 * Concept: Projects = clips dalam arrangement grid. Multi-track horizontal timeline.
 * Tracks: FEATURED (star), WEB APP, TOOLS, SKETCHES.
 * Click clip → expand detail panel. Playhead highlight clip yang sedang "di bawah".
 * Mobile: vertical card stack. Desktop: horizontal scroll arrangement.
 */

import { useState, useMemo, useEffect } from 'react'
import { m, useReducedMotion, AnimatePresence } from 'motion/react'
import { Star, Github, ExternalLink, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { SectionFrame } from '../r3/section-frame'
import { PROJECTS_SHOWCASE, type ProjectShowcaseItem } from '../constants'

// ─── Track Config ─────────────────────────────────────────

interface TrackConfig {
  id: string
  label: string
  color: string
  icon?: JSX.Element
}

const TRACKS: TrackConfig[] = [
  { id: 'featured', label: 'FEATURED', color: 'var(--r3-filament)' },
  { id: 'webapp', label: 'WEB APP', color: 'var(--r3-signal)' },
  { id: 'tools', label: 'TOOLS', color: 'var(--r3-beat)' },
  { id: 'sketches', label: 'SKETCHES', color: 'var(--r3-clip)' },
]

// ─── Categorize projects ──────────────────────────────────

function categorizeProjects(projects: ProjectShowcaseItem[]) {
  const featured = projects.filter((p) => p.id === 1) // Primarindo = featured
  const webapp = projects.filter((p) => [2, 3].includes(p.id)) // Habit Tracker, Frontend Resources
  const tools = projects.filter((p) => [4, 5].includes(p.id)) // SeaPhantom, SeaPhantom P2P
  const sketches = projects.filter((p) => [6].includes(p.id)) // Labgrownbeasts

  return { featured, webapp, tools, sketches }
}

// ─── Clip Component ───────────────────────────────────────

function ArrangementClip({
  project,
  track,
  onSelect,
  isSelected,
  playheadPos,
}: {
  project: ProjectShowcaseItem
  track: TrackConfig
  onSelect: (p: ProjectShowcaseItem) => void
  isSelected: boolean
  playheadPos: number // 0-100%
}) {
  const prefersReduced = useReducedMotion()
  // Simulate clip position based on project ID (for demo)
  const clipStart = (project.id * 12) % 80
  const clipLength = 15

  const isUnderPlayhead =
    playheadPos >= clipStart && playheadPos <= clipStart + clipLength

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="absolute h-12 sm:h-14 rounded-sm cursor-pointer transition-all group"
      style={{
        left: `${clipStart}%`,
        width: `${clipLength}%`,
        backgroundColor: track.color,
        opacity: isUnderPlayhead ? 1 : 0.7,
        boxShadow: isUnderPlayhead
          ? `0 0 12px ${track.color}, inset 0 0 8px rgba(255,255,255,0.1)`
          : `0 2px 4px rgba(0,0,0,0.3)`,
      }}
      onClick={() => onSelect(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(project)
        }
      }}
      aria-label={`${project.title} — ${project.genre}`}
    >
      <div className="h-full px-2 py-1 flex flex-col justify-between overflow-hidden">
        <span className="r3-mono text-[8px] sm:text-[9px] font-semibold text-[var(--r3-studio)] truncate leading-tight">
          {project.title}
        </span>
        <span className="r3-mono text-[7px] text-[var(--r3-studio)]/70 truncate">
          {project.genre}
        </span>
      </div>

      {/* Hover highlight */}
      <div className="absolute inset-0 rounded-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </m.div>
  )
}

// ─── Track Row ────────────────────────────────────────────

function TrackRow({
  track,
  projects,
  onSelectClip,
  selectedProject,
  playheadPos,
}: {
  track: TrackConfig
  projects: ProjectShowcaseItem[]
  onSelectClip: (p: ProjectShowcaseItem) => void
  selectedProject: ProjectShowcaseItem | null
  playheadPos: number
}) {
  return (
    <div className="flex items-stretch gap-2 mb-2">
      {/* Track label */}
      <div className="w-24 sm:w-32 shrink-0 flex items-center px-2 py-1 r3-panel-rack">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: track.color }}
          />
          <span className="r3-mono text-[9px] sm:text-[10px] font-semibold text-[var(--r3-text)] tracking-wider">
            {track.label}
          </span>
        </div>
      </div>

      {/* Clips area */}
      <div className="flex-1 relative h-12 sm:h-14 r3-panel-rack rounded-sm overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-[var(--r3-edge)]"
              style={{ left: `${(i + 1) * 12.5}%` }}
            />
          ))}
        </div>

        {/* Clips */}
        {projects.map((project) => (
          <ArrangementClip
            key={project.id}
            project={project}
            track={track}
            onSelect={onSelectClip}
            isSelected={selectedProject?.id === project.id}
            playheadPos={playheadPos}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Detail Panel ─────────────────────────────────────────

function DetailPanel({
  project,
  onClose,
}: {
  project: ProjectShowcaseItem
  onClose: () => void
}) {
  const prefersReduced = useReducedMotion()

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3 }}
      className="r3-panel p-4 sm:p-6 mt-4"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="r3-display text-lg sm:text-xl font-semibold text-[var(--r3-text)]">
              {project.title}
            </h3>
            {project.id === 1 && (
              <Star
                size={16}
                className="text-[var(--r3-filament)]"
                fill="currentColor"
              />
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="r3-mono text-[10px] text-[var(--r3-text-mute)]">
              {project.genre}
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--r3-edge)]" />
            <span className="r3-mono text-[10px] tabular-nums text-[var(--r3-label)]">
              {project.year}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[var(--r3-rack)] rounded transition-colors"
          aria-label="Close"
        >
          <X size={16} className="text-[var(--r3-text-mute)]" />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-[16/9] w-full mb-4 rounded-sm overflow-hidden bg-[var(--r3-rack)]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 50vw, 90vw"
          className="object-cover object-top"
        />
      </div>

      {/* Description */}
      <p className="r3-prose text-sm text-[var(--r3-text-mute)] leading-relaxed mb-4">
        {project.description}
      </p>

      {/* CTA buttons */}
      <div className="flex items-center gap-2">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 r3-panel hover:bg-[var(--r3-rack)] transition-colors"
        >
          <ExternalLink size={14} className="text-[var(--r3-text-mute)]" />
          <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
            VISIT
          </span>
        </a>
        {project.url.includes('github') && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 r3-panel hover:bg-[var(--r3-rack)] transition-colors"
          >
            <Github size={14} className="text-[var(--r3-text-mute)]" />
            <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
              REPO
            </span>
          </a>
        )}
      </div>
    </m.div>
  )
}

// ─── Main Export ──────────────────────────────────────────

export function ProjectsSection() {
  const prefersReduced = useReducedMotion()
  const [selectedProject, setSelectedProject] = useState<ProjectShowcaseItem | null>(null)
  const [playheadPos, setPlayheadPos] = useState(0)

  const categorized = useMemo(() => categorizeProjects(PROJECTS_SHOWCASE), [])

  // ─── Playhead animation ───────────────────────────────────
  // Simulate playhead moving across arrangement (0-100%)
  useEffect(() => {
    if (prefersReduced) return
    let frame = 0
    const interval = setInterval(() => {
      frame = (frame + 1) % 200 // 200 frames = full cycle
      setPlayheadPos((frame / 200) * 100)
    }, 50)
    return () => clearInterval(interval)
  }, [prefersReduced])

  return (
    <SectionFrame
      id="projects"
      track="04"
      name="WORK"
      device="Arrangement View / Clips"
      color="signal"
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
          Setiap project adalah satu clip dalam arrangement. Hover atau klik untuk lihat detail.
          Playhead bergerak terus — ini timeline dari semua yang udah gw build.
        </p>
      </m.div>

      {/* ─── Desktop: Arrangement Grid ──────────────────── */}
      <div className="hidden sm:block">
        <div className="r3-panel p-4 overflow-x-auto">
          {/* Timeline ruler */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-24 sm:w-32 shrink-0" />
            <div className="flex-1 relative h-6">
              <div className="absolute inset-0 flex">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex-1 flex items-end justify-start px-1">
                    <span className="r3-mono text-[8px] text-[var(--r3-label)]">
                      {i * 10}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Playhead */}
          <div className="flex items-center gap-2 mb-3 relative">
            <div className="w-24 sm:w-32 shrink-0" />
            <div className="flex-1 relative h-1 bg-[var(--r3-edge)]/30 rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 w-1 bg-[var(--r3-signal)] shadow-[0_0_8px_var(--r3-signal)]"
                style={{ left: `${playheadPos}%` }}
              />
            </div>
          </div>

          {/* Tracks */}
          <div className="space-y-2">
            <TrackRow
              track={TRACKS[0]}
              projects={categorized.featured}
              onSelectClip={setSelectedProject}
              selectedProject={selectedProject}
              playheadPos={playheadPos}
            />
            <TrackRow
              track={TRACKS[1]}
              projects={categorized.webapp}
              onSelectClip={setSelectedProject}
              selectedProject={selectedProject}
              playheadPos={playheadPos}
            />
            <TrackRow
              track={TRACKS[2]}
              projects={categorized.tools}
              onSelectClip={setSelectedProject}
              selectedProject={selectedProject}
              playheadPos={playheadPos}
            />
            <TrackRow
              track={TRACKS[3]}
              projects={categorized.sketches}
              onSelectClip={setSelectedProject}
              selectedProject={selectedProject}
              playheadPos={playheadPos}
            />
          </div>
        </div>
      </div>

      {/* ─── Mobile: Vertical Card Stack ────────────────── */}
      <div className="sm:hidden space-y-3">
        {PROJECTS_SHOWCASE.map((project, index) => (
          <m.div
            key={project.id}
            initial={prefersReduced ? false : { opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="r3-panel overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedProject(project)}
          >
            <div className="flex gap-3">
              {/* Thumbnail */}
              <div className="relative w-24 h-24 shrink-0 bg-[var(--r3-rack)] rounded-sm overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="96px"
                  className="object-cover object-top"
                />
              </div>

              {/* Info */}
              <div className="flex-1 py-2 pr-2 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <h4 className="r3-display text-sm font-semibold text-[var(--r3-text)] truncate">
                      {project.title}
                    </h4>
                    {project.id === 1 && (
                      <Star
                        size={12}
                        className="text-[var(--r3-filament)] shrink-0"
                        fill="currentColor"
                      />
                    )}
                  </div>
                  <p className="r3-mono text-[9px] text-[var(--r3-text-mute)] line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="r3-mono text-[8px] text-[var(--r3-label)]">
                    {project.genre}
                  </span>
                  <span className="h-px w-1 bg-[var(--r3-edge)]" />
                  <span className="r3-mono text-[8px] tabular-nums text-[var(--r3-label)]">
                    {project.year}
                  </span>
                </div>
              </div>
            </div>
          </m.div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selectedProject && (
          <DetailPanel
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      {/* Status bar */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="r3-panel mt-6 sm:mt-8 flex items-center justify-between px-3 py-2 sm:px-4"
      >
        <div className="flex items-center gap-3">
          <span className="r3-led" aria-hidden />
          <span className="r3-mono text-[10px] text-[var(--r3-text-mute)]">
            {PROJECTS_SHOWCASE.length} projects in arrangement
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="r3-mono text-[10px] text-[var(--r3-label)]">
            PLAYHEAD: {Math.round(playheadPos)}%
          </span>
          <span className="h-3 w-px bg-[var(--r3-edge)]" />
          <span className="r3-mono text-[10px] text-[var(--r3-signal)]">
            RECORDING
          </span>
        </div>
      </m.div>
    </SectionFrame>
  )
}
