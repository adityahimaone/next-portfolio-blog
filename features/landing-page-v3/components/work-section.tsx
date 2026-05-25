'use client'

import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { useInView } from '../hooks/use-in-view'
import { WORK_V3 } from '../constants'

/**
 * WorkSection (03) — horizontal drag-scroll catalog with tilt cards.
 * Each card responds to cursor position with subtle 3D tilt (perspective).
 * Cursor over images = "VIEW" pill.
 */
export function WorkSection() {
  const { ref, inView } = useInView({ once: true, threshold: 0.15 })

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="work"
      className="relative overflow-hidden py-24 md:py-32"
      aria-labelledby="v3-work-headline"
      style={{ background: 'var(--v3-void)' }}
    >
      {/* Header */}
      <div className="px-6 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 md:col-span-3"
          >
            <div className="v3-mono" style={{ color: 'var(--v3-iris-2)' }}>
              WORK — 03
            </div>
            <div
              className="mt-3 h-px w-16"
              style={{ background: 'var(--v3-fog)' }}
              aria-hidden
            />
          </motion.div>

          <h2
            id="v3-work-headline"
            className="col-span-1 md:col-span-9"
            style={{
              fontSize: 'var(--v3-display-md)',
              lineHeight: 0.92,
            }}
          >
            <span className="v3-display-sans block overflow-hidden">
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
                Selected
              </motion.span>
            </span>
            <span className="v3-display block overflow-hidden">
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
                releases.
              </motion.span>
            </span>
          </h2>
        </div>

        {/* Sub label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex items-center justify-between"
        >
          <p className="v3-mono" style={{ color: 'var(--v3-fg-muted)' }}>
            {WORK_V3.length.toString().padStart(2, '0')} releases
          </p>
          <p className="v3-mono" style={{ color: 'var(--v3-fg-muted)' }}>
            ← drag · swipe →
          </p>
        </motion.div>
      </div>

      {/* Drag scroller */}
      <div
        className="v3-no-scrollbar mt-12 flex gap-6 overflow-x-auto px-6 md:gap-10 md:px-12"
        style={{ scrollSnapType: 'x mandatory' }}
        data-cursor="drag"
      >
        {WORK_V3.map((release, i) => (
          <WorkCard
            key={release.id}
            release={release}
            inView={inView}
            index={i}
          />
        ))}
        {/* Trailing spacer */}
        <div
          className="shrink-0"
          style={{ width: '20vw' }}
          aria-hidden
        />
      </div>
    </section>
  )
}

/* ─── Internal: card with 3D tilt on hover ─────────────────────── */
function WorkCard({
  release,
  inView,
  index,
}: {
  release: (typeof WORK_V3)[number]
  inView: boolean
  index: number
}) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -8, y: x * 12 })
  }

  const handleLeave = () => setTilt({ x: 0, y: 0 })

  return (
    <motion.a
      ref={cardRef}
      href={release.url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      data-cursor="view"
      data-cursor-label="VIEW"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.9,
        delay: 0.2 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative block shrink-0 will-change-transform"
      style={{
        scrollSnapAlign: 'start',
        width: 'min(85vw, 540px)',
        perspective: '1200px',
      }}
    >
      <div
        className="v3-card overflow-hidden"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 360ms cubic-bezier(0.16,1,0.3,1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Image */}
        <div
          className="relative aspect-[4/5] overflow-hidden"
          style={{ background: 'var(--v3-shade)' }}
        >
          <Image
            src={release.image}
            alt={release.title}
            fill
            sizes="(min-width: 768px) 540px, 85vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Iridescent overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-30"
            style={{
              background:
                'conic-gradient(from 0deg, var(--v3-iris-1), var(--v3-iris-2), var(--v3-iris-3), var(--v3-iris-4), var(--v3-iris-1))',
            }}
            aria-hidden
          />
          {/* Catalog number floating */}
          <div className="absolute top-4 left-4">
            <span
              className="v3-mono inline-block rounded-full px-3 py-1"
              style={{
                background: 'oklch(0.06 0.012 260 / 0.7)',
                color: 'var(--v3-paper)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {release.catalogNumber}
            </span>
          </div>
          <div className="absolute right-4 bottom-4">
            <span
              className="v3-mono inline-block rounded-full px-3 py-1"
              style={{
                background: 'oklch(0.06 0.012 260 / 0.7)',
                color: 'var(--v3-paper)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {release.year}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6 md:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <span
              className="v3-mono"
              style={{ color: 'var(--v3-fg-muted)' }}
            >
              {release.index}
            </span>
            <span
              className="v3-mono"
              style={{ color: 'var(--v3-iris-2)' }}
            >
              {release.genre}
            </span>
          </div>
          <h3
            className="v3-display-sans mt-3 text-2xl md:text-3xl"
            style={{ lineHeight: 1.05 }}
          >
            {release.title}
          </h3>
          <p
            className="mt-3 line-clamp-3 text-sm md:text-base"
            style={{ color: 'var(--v3-fg-muted)' }}
          >
            {release.description}
          </p>
          <div
            className="mt-6 flex items-center justify-between text-xs"
            style={{ color: 'var(--v3-fg-muted)' }}
          >
            <span className="v3-mono">View case →</span>
            <span className="v3-mono">{release.tags.join(' · ')}</span>
          </div>
        </div>
      </div>
    </motion.a>
  )
}

export default WorkSection
