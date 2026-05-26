'use client'

/**
 * Ravemped 3.0 — Projects Section
 * Concept: Projects = audio clips in an arrangement timeline.
 * Horizontal snap-scroll on mobile, grid on md+.
 */

import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import { SectionFrame } from '../r3'
import { PROJECTS_SHOWCASE, type ProjectShowcaseItem } from '../constants'

// ─── Clip Card ────────────────────────────────────────────────────────────────

function ClipCard({
  project,
  index,
  isInView,
}: {
  project: ProjectShowcaseItem
  index: number
  isInView: boolean
}) {
  const prefersReduced = useReducedMotion()

  return (
    <m.article
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative flex w-[70vw] max-w-[320px] shrink-0 snap-center flex-col md:w-full md:max-w-none"
    >
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="r3-panel relative flex flex-col overflow-hidden transition-transform duration-300 group-hover:-translate-y-1"
        style={{
          boxShadow: 'none',
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 20px 2px color-mix(in srgb, var(--r3-signal) 40%, transparent)`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--r3-rack)]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 70vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--r3-studio)]/80 via-transparent to-transparent" />

          {/* Overlay info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="r3-display text-sm font-semibold text-[var(--r3-text)] sm:text-base">
              {project.title}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="r3-mono text-[10px] text-[var(--r3-text-mute)]">
                {project.genre}
              </span>
              <span className="h-1 w-1 rounded-full bg-[var(--r3-edge)]" />
              <span className="r3-mono text-[10px] tabular-nums text-[var(--r3-text-mute)]">
                {project.year}
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between border-t border-[var(--r3-edge)] bg-[var(--r3-rack)] px-3 py-2.5 sm:px-4">
          <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
            View case
          </span>
          <ArrowUpRight
            className="h-3.5 w-3.5 text-[var(--r3-text-mute)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--r3-signal)]"
            aria-hidden
          />
        </div>
      </a>
    </m.article>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function ProjectsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <SectionFrame
      id="projects"
      track="03"
      name="WORK"
      device="Arrangement View / Clips"
      color="signal"
    >
      <div ref={ref}>
        {/* Mobile: horizontal snap scroll */}
        <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto scroll-smooth px-4 snap-x snap-mandatory md:hidden">
          {PROJECTS_SHOWCASE.map((project, index) => (
            <ClipCard
              key={project.id}
              project={project}
              index={index}
              isInView={isInView}
            />
          ))}
          {/* Spacer for last card peek */}
          <div className="w-4 shrink-0" aria-hidden />
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
          {PROJECTS_SHOWCASE.map((project, index) => (
            <ClipCard
              key={project.id}
              project={project}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Scroll hint (mobile only) */}
        <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
          <span className="h-px w-6 bg-[var(--r3-edge)]" />
          <span className="r3-mono text-[9px] tracking-widest text-[var(--r3-text-mute)]">
            SWIPE →
          </span>
          <span className="h-px w-6 bg-[var(--r3-edge)]" />
        </div>
      </div>
    </SectionFrame>
  )
}
