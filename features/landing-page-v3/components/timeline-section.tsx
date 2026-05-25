'use client'

import { motion } from 'motion/react'
import { useInView } from '../hooks/use-in-view'
import { TIMELINE_V3 } from '../constants'

/**
 * TimelineSection (05) — vertical work timeline with sticky year markers.
 * Each entry slides in from the side with a staggered reveal.
 */
export function TimelineSection() {
  const { ref, inView } = useInView({ once: true, threshold: 0.1 })

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="timeline"
      className="relative px-6 py-24 md:px-12 md:py-32"
      aria-labelledby="v3-timeline-headline"
      style={{ background: 'var(--v3-space)' }}
    >
      {/* Header */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-1 md:col-span-3"
        >
          <div className="v3-mono" style={{ color: 'var(--v3-iris-4)' }}>
            TIMELINE — 05
          </div>
          <div
            className="mt-3 h-px w-16"
            style={{ background: 'var(--v3-fog)' }}
            aria-hidden
          />
        </motion.div>

        <h2
          id="v3-timeline-headline"
          className="col-span-1 md:col-span-9"
          style={{
            fontSize: 'var(--v3-display-md)',
            lineHeight: 0.92,
          }}
        >
          <span className="v3-display block overflow-hidden">
            <motion.span
              initial={{ y: '105%' }}
              animate={inView ? { y: '0%' } : {}}
              transition={{
                duration: 1.1,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ display: 'inline-block' }}
            >
              A working
            </motion.span>
          </span>
          <span className="v3-display-sans block overflow-hidden">
            <motion.span
              initial={{ y: '105%' }}
              animate={inView ? { y: '0%' } : {}}
              transition={{
                duration: 1.1,
                delay: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ display: 'inline-block' }}
            >
              chronology.
            </motion.span>
          </span>
        </h2>
      </div>

      {/* Timeline entries */}
      <div className="mt-16 md:mt-24">
        <ul className="relative space-y-12 md:space-y-16">
          {/* Vertical rail */}
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-3 w-px md:left-[calc(25%-0.5px)]"
            style={{ background: 'var(--v3-fog)' }}
          />

          {TIMELINE_V3.map((entry, i) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              index={i}
              inView={inView}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}

function TimelineEntry({
  entry,
  index,
  inView,
}: {
  entry: (typeof TIMELINE_V3)[number]
  index: number
  inView: boolean
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.9,
        delay: 0.2 + index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative grid grid-cols-1 gap-4 pl-10 md:grid-cols-12 md:gap-8 md:pl-0"
    >
      {/* Year + dot */}
      <div className="relative col-span-1 md:col-span-3">
        {/* Dot */}
        <span
          aria-hidden
          className="absolute top-2 -left-[31px] block h-3 w-3 rounded-full md:left-[calc(100%-6px)]"
          style={{
            background: 'var(--v3-paper)',
            boxShadow: '0 0 0 4px var(--v3-space)',
          }}
        />
        <div className="v3-mono" style={{ color: 'var(--v3-iris-1)' }}>
          {entry.year}
        </div>
        <div
          className="v3-mono mt-2"
          style={{ color: 'var(--v3-fg-muted)' }}
        >
          {entry.location}
        </div>
      </div>

      {/* Content */}
      <div className="col-span-1 md:col-span-9 md:pl-12">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3
            className="v3-display-sans text-2xl md:text-3xl"
            style={{ lineHeight: 1.1 }}
          >
            {entry.role}
          </h3>
          <span
            className="v3-mono"
            style={{ color: 'var(--v3-fg-muted)' }}
          >
            · {entry.type}
          </span>
        </div>
        <p
          className="v3-display mt-1 text-xl md:text-2xl"
          style={{ color: 'var(--v3-iris-2)' }}
        >
          {entry.company}
        </p>
        {entry.description.length > 0 && (
          <ul
            className="mt-4 space-y-2 text-sm md:text-base"
            style={{ color: 'var(--v3-fg-muted)' }}
          >
            {entry.description.map((d, i) => (
              <li
                key={i}
                className="relative pl-4"
                style={{ lineHeight: 1.6 }}
              >
                <span
                  aria-hidden
                  className="absolute top-2.5 left-0 block h-1 w-1 rounded-full"
                  style={{ background: 'var(--v3-iris-3)' }}
                />
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.li>
  )
}

export default TimelineSection
