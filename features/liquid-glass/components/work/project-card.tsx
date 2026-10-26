'use client'

import { ArrowUpRight, Play } from 'lucide-react'
import type { Project } from '../../types'
import { padIndex } from '../../lib/format'
import { useSpotlight } from '../../interactive/use-pointer'

/**
 * A release on the shelf.
 *
 * Two card bodies share one frame: releases with artwork show it under a scrim,
 * releases without get a generated sleeve — a chromatic wash keyed to the
 * project's accent with the catalogue number set large. The second variant
 * exists because a stock photograph would be a worse lie than a gradient.
 */
export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project
  onOpen: (project: Project) => void
}) {
  const ref = useSpotlight<HTMLButtonElement>()

  const spanClass =
    project.span === 'feature'
      ? 'min-h-[380px] lg:min-h-[520px]'
      : project.span === 'wide'
        ? 'min-h-[300px] lg:min-h-[260px]'
        : 'min-h-[300px] lg:min-h-[240px]'

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpen(project)}
      className={`lg-glass lg-card group h-full w-full ${spanClass}`}
      aria-label={`Open ${project.title}`}
    >
      {project.cover ? (
        <div className="lg-card__media">
          {/* The artwork is already sized for the card; next/image would add a
              wrapper and a loader for a file that is served unoptimised anyway
              (see next.config.mjs). */}
          {}
          <img src={project.cover} alt={project.coverAlt} loading="lazy" />
        </div>
      ) : (
        <div
          className="lg-card__media"
          style={{
            background: `
              radial-gradient(120% 90% at 22% 12%, ${project.accent}3d 0%, transparent 58%),
              radial-gradient(90% 90% at 82% 88%, ${project.accent}26 0%, transparent 62%),
              conic-gradient(from 150deg at 50% 50%, transparent 0deg, ${project.accent}14 90deg, transparent 190deg, ${project.accent}10 300deg, transparent 360deg)
            `,
          }}
          aria-hidden="true"
        >
          {/* Sleeve furniture: two concentric rings and an oversized catalogue
              number. Enough structure that a card without photography still
              reads as an artefact rather than an empty panel. */}
          <span
            className="pointer-events-none absolute top-[6%] right-[-14%] aspect-square w-[74%] rounded-full border"
            style={{ borderColor: `${project.accent}2b` }}
          />
          <span
            className="pointer-events-none absolute top-[28%] right-[6%] aspect-square w-[34%] rounded-full border"
            style={{ borderColor: `${project.accent}3d` }}
          />
          <span
            className="pointer-events-none absolute -right-[4%] -bottom-[12%] leading-none font-semibold tracking-[-0.06em]"
            style={{
              fontSize: 'clamp(9rem, 20vw, 16rem)',
              color: `${project.accent}26`,
            }}
          >
            {padIndex(project.order)}
          </span>
        </div>
      )}

      <span className="lg-card__scrim" aria-hidden="true" />

      <span className="lg-card__index lg-mono">
        {padIndex(project.order)} / {project.category}
      </span>

      {project.span === 'feature' ? (
        <span className="lg-mono absolute top-5 right-5 z-10 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[9px] text-[var(--lg-ink-dim)] backdrop-blur-md">
          Featured · {project.year}
        </span>
      ) : null}

      {project.preview ? (
        <span className="lg-card__badge lg-mono lg-mono--sm text-[var(--lg-ink)]">
          <span className="flex h-[10px] items-end gap-[1.5px]">
            {[0, 1, 2].map((bar) => (
              <span
                key={bar}
                className="w-[1.5px] origin-bottom rounded-full bg-[var(--lg-amber)]"
                style={{
                  height: 8,
                  animation: `lg-eq 1.1s ease-in-out ${bar * 0.16}s infinite`,
                  opacity: 0.9,
                }}
              />
            ))}
          </span>
          Audio
          <Play size={8} fill="currentColor" strokeWidth={0} />
        </span>
      ) : null}

      <div className="relative z-10 mt-auto flex w-full items-end justify-between gap-6">
        <div className="min-w-0">
          <h3 className="lg-title text-[clamp(1.35rem,2.4vw,1.9rem)] text-[var(--lg-ink)]">
            {project.title}
          </h3>
          <p className="mt-2 max-w-[38ch] text-[13px] leading-[1.55] text-[var(--lg-ink-dim)]">
            {project.tagline}
          </p>

          {project.span === 'feature' ? (
            <p className="mt-3 line-clamp-2 max-w-[56ch] text-[12.5px] leading-[1.6] text-[var(--lg-ink-faint)]">
              {project.summary}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 3).map((tech) => (
              <span key={tech} className="lg-tag">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <span className="lg-card__arrow shrink-0">
          <ArrowUpRight size={14} strokeWidth={1.75} />
        </span>
      </div>
    </button>
  )
}
