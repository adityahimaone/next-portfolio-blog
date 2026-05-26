'use client'

/**
 * Track 05 — Crate Digging (the A-Sides).
 *
 * Horizontal scrolling crate of vinyl sleeves. Selecting a project pulls
 * the record halfway out of its sleeve to reveal genre + year + links.
 * Reuses PROJECTS_SHOWCASE from constants.
 */
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Disc3 } from 'lucide-react'
import { TrackSection } from '@/components/track-section'
import { PROJECTS_SHOWCASE } from '../constants'

export function ProjectsSection() {
  const [activeId, setActiveId] = useState<number | null>(null)
  const prefersReduced = useReducedMotion()

  return (
    <TrackSection
      trackNumber="05"
      id="projects"
      title="Crate Digging"
      subtitle="Selected A-sides. Tap a sleeve, slide the record halfway out, see what&rsquo;s on the label."
    >
      {/* Crate scroller */}
      <div
        role="list"
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 md:-mx-12 md:gap-6 md:px-12"
        style={{ scrollbarWidth: 'thin' }}
      >
        {PROJECTS_SHOWCASE.map((project) => {
          const isActive = activeId === project.id
          const Icon = project.vinylIcon
          return (
            <motion.article
              key={project.id}
              role="listitem"
              onClick={() => setActiveId(isActive ? null : project.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveId(isActive ? null : project.id)
                }
              }}
              tabIndex={0}
              role-button="true"
              aria-pressed={isActive}
              className="group relative flex shrink-0 snap-start cursor-pointer flex-col"
              style={{ width: 'min(80vw, 320px)' }}
            >
              {/* Sleeve + record container */}
              <div className="relative aspect-square overflow-hidden">
                {/* Record (behind sleeve, slides out) */}
                <motion.div
                  initial={false}
                  animate={{
                    x: isActive ? '40%' : '0%',
                    rotate: isActive && !prefersReduced ? 360 : 0,
                  }}
                  transition={{
                    x: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                    rotate: { duration: 8, repeat: isActive ? Infinity : 0, ease: 'linear' },
                  }}
                  className={`absolute inset-0 z-0 vinyl-grooves rounded-full bg-gradient-to-br ${project.vinylColor}`}
                  aria-hidden="true"
                >
                  {/* Center label */}
                  <div className="absolute top-1/2 left-1/2 flex h-[35%] w-[35%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-base text-text-main">
                    <Icon size={20} className="text-accent" />
                    <span className="mt-1 font-mono text-[8px] tracking-widest text-text-muted">
                      {project.year}
                    </span>
                  </div>
                  {/* Spindle */}
                  <div className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-base" />
                </motion.div>

                {/* Sleeve (front) */}
                <div className="relative z-10 h-full w-full bg-elevated">
                  <div className="relative h-full w-full">
                    {project.image && (
                      <img
                        src={project.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-base via-base/60 to-transparent" />
                    <div className="absolute inset-0 border border-edge" />

                    {/* Sleeve metadata */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="meta-label text-accent">
                        {project.genre ?? 'Side A'}
                      </span>
                      <h3 className="display-heading mt-1 text-lg md:text-2xl">
                        {project.title}
                      </h3>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute top-3 right-3 led-dot" aria-hidden="true" />
                    )}
                  </div>
                </div>
              </div>

              {/* Description (revealed on active) */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-x border-b border-edge bg-elevated/40 p-4">
                      <p className="text-sm leading-relaxed text-text-muted">
                        {project.description}
                      </p>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs tracking-widest text-accent hover:text-accent-bright"
                      >
                        VISIT SET
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title strip (always visible, replaces card heading when not active) */}
              {!isActive && (
                <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                  <span className="font-mono tracking-widest">
                    {String(project.id).padStart(2, '0')} · {project.year ?? ''}
                  </span>
                  <Disc3
                    size={12}
                    className="opacity-50 transition-opacity group-hover:opacity-100"
                  />
                </div>
              )}
            </motion.article>
          )
        })}
      </div>

      {/* Crate footer hint */}
      <div className="mt-6 flex items-center justify-between border-t border-edge pt-4 md:mt-8">
        <span className="meta-label">Drag sideways · or use arrow keys</span>
        <span className="meta-label text-accent">{PROJECTS_SHOWCASE.length} CUTS</span>
      </div>
    </TrackSection>
  )
}
