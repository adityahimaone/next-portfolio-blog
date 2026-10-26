'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Pause, Play, X } from 'lucide-react'
import type { Project } from '../../types'
import { getLenis } from '../../scroll/smooth-scroll'
import { padIndex } from '../../lib/format'

/**
 * The expanded release.
 *
 * A dialog rather than a page, because the shelf is the context and leaving it
 * to read a paragraph is a worse experience than dimming it. Everything the
 * card cannot hold lives here: the summary, the shipped details, the stack and
 * the links — plus the preview, which is a real audio element and a real
 * transport, not a decorative hover state.
 *
 * The main rotation keeps playing underneath; opening a release does not
 * interrupt the room.
 */

function Preview({
  src,
  title,
  duration,
}: {
  src: string
  title: string
  duration: string
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const element = audioRef.current
    return () => {
      element?.pause()
    }
  }, [])

  const toggle = () => {
    const element = audioRef.current
    if (!element) return
    if (playing) {
      element.pause()
      return
    }
    void element.play().catch(() => setPlaying(false))
  }

  return (
    <div className="lg-glass lg-glass--flat flex items-center gap-3 rounded-2xl p-3">
      <button
        type="button"
        onClick={toggle}
        className="lg-play h-10 w-10 shrink-0"
        data-playing={playing}
        aria-label={
          playing ? `Pause preview of ${title}` : `Play preview of ${title}`
        }
      >
        {playing ? (
          <Pause size={11} fill="currentColor" strokeWidth={2} />
        ) : (
          <Play
            size={10}
            fill="currentColor"
            strokeWidth={2}
            className="-ml-[1px]"
          />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className="lg-mono lg-mono--sm text-[var(--lg-ink-faint)]">
          Preview
        </p>
        <p className="mt-1 flex items-baseline gap-2 text-[12px] text-[var(--lg-ink)]">
          <span className="truncate">{title}</span>
          <span className="lg-mono shrink-0 text-[9px] text-[var(--lg-ink-faint)]">
            {duration}
          </span>
        </p>
      </div>

      <div className="flex items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <span
            key={index}
            className="w-[2px] rounded-full bg-white/40"
            style={{
              height: `${6 + ((index * 7) % 16)}px`,
              animation: playing
                ? `lg-eq ${0.7 + (index % 5) * 0.12}s ease-in-out ${index * 0.05}s infinite alternate`
                : 'none',
              opacity: playing ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  )
}

export function ProjectDialog({
  project,
  onClose,
}: {
  project: Project | null
  onClose: () => void
}) {
  const reduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Escape, scroll lock, and returning focus to whatever opened the dialog.
  useEffect(() => {
    if (!project) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const lenis = getLenis()
    lenis?.stop()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKey)
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      lenis?.start()
      previouslyFocused?.focus?.()
    }
  }, [onClose, project])

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.32 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-dialog-title"
        >
          <motion.button
            type="button"
            className="fixed inset-0 cursor-default bg-black/65 backdrop-blur-[10px]"
            onClick={onClose}
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className="lg-glass lg-glass--heavy relative z-10 my-auto w-full max-w-[720px] overflow-hidden rounded-[28px] p-6 outline-none sm:p-9"
            initial={
              reduced ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background: `radial-gradient(70% 55% at 8% 0%, ${project.accent}26, transparent 68%)`,
              }}
              aria-hidden="true"
            />

            <div className="relative flex items-start justify-between gap-6">
              <div>
                <p className="lg-mono text-[var(--lg-ink-faint)]">
                  {padIndex(project.order)} / {project.category} ·{' '}
                  {project.year}
                </p>
                <h2
                  id="project-dialog-title"
                  className="lg-display mt-3 text-[clamp(1.9rem,4.4vw,2.9rem)]"
                >
                  {project.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="lg-icon-button h-9 w-9 shrink-0"
                aria-label="Close project"
              >
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>

            <p className="lg-body relative mt-5 text-[15px]">
              {project.summary}
            </p>

            <div className="relative mt-6 grid gap-6 sm:grid-cols-[1.15fr_1fr]">
              <div>
                <p className="lg-mono mb-3 text-[var(--lg-ink-faint)]">
                  Shipped
                </p>
                <ul className="flex flex-col gap-2.5">
                  {project.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-2.5 text-[13px] leading-[1.5] text-[var(--lg-ink-dim)]"
                    >
                      <span
                        className="mt-[9px] h-px w-3 shrink-0"
                        style={{ background: project.accent, opacity: 0.8 }}
                        aria-hidden="true"
                      />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <p className="lg-mono mb-2 text-[var(--lg-ink-faint)]">
                    Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span key={tech} className="lg-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="lg-mono mb-2 text-[var(--lg-ink-faint)]">
                    Role
                  </p>
                  <p className="text-[13px] text-[var(--lg-ink-dim)]">
                    {project.role}
                  </p>
                </div>

                {project.preview ? (
                  <Preview
                    src={project.preview.src}
                    title={project.preview.title}
                    duration={project.preview.duration}
                  />
                ) : null}
              </div>
            </div>

            <div className="relative mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
              <div className="flex flex-wrap gap-4">
                {project.links.map((link) =>
                  link.href.startsWith('http') ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group inline-flex items-center gap-2 text-[13px] font-medium text-[var(--lg-ink)]"
                    >
                      {link.label}
                      <ArrowRight
                        size={13}
                        className="transition-transform duration-500 group-hover:translate-x-0.5"
                      />
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className="group inline-flex items-center gap-2 text-[13px] font-medium text-[var(--lg-ink)]"
                    >
                      {link.label}
                      <ArrowRight
                        size={13}
                        className="transition-transform duration-500 group-hover:translate-x-0.5"
                      />
                    </Link>
                  ),
                )}
              </div>

              <p className="lg-mono text-[var(--lg-ink-faint)]">
                Signal Records · {project.year}
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
