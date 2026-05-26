'use client'

/**
 * TrackSection — the album-track wrapper for landing-page sections.
 *
 * Frames every section as a numbered "track" on the live set, with a
 * mono metadata label, an uppercase display heading, and an optional
 * subtitle. Replaces hard dividers — the visual flow is carried by
 * RecordGroove instead.
 */
import { motion, useReducedMotion } from 'motion/react'

interface TrackSectionProps {
  /** "01", "02", … */
  trackNumber: string
  /** Section title (will be uppercased via class) */
  title: string
  /** Optional poetic descriptor under the title */
  subtitle?: string
  /** DOM id used by header anchor links */
  id: string
  /** Section content */
  children: React.ReactNode
  /** Optional extra wrapper classname */
  className?: string
}

export function TrackSection({
  trackNumber,
  title,
  subtitle,
  id,
  children,
  className,
}: TrackSectionProps) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.section
      id={id}
      initial={prefersReduced ? false : { opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`relative scroll-mt-24 px-4 py-24 md:px-12 md:py-32 ${className ?? ''}`}
    >
      <header className="mb-12 max-w-3xl md:mb-16">
        <span className="meta-label flex items-center gap-2 text-accent">
          <span className="led-dot" aria-hidden="true" />
          Trk {trackNumber} //
        </span>
        <h2 className="display-heading mt-3 text-4xl md:text-6xl lg:text-7xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-4 max-w-xl text-lg text-text-muted md:text-xl">{subtitle}</p>
        ) : null}
      </header>
      <div>{children}</div>
    </motion.section>
  )
}
