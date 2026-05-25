'use client'

import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { useInView } from '../hooks/use-in-view'
import { WORK_V3 } from '../constants'

/**
 * WorkSection (03) — responsive catalog grid.
 * - Mobile: horizontal snap-scroll (compact cards, 70vw wide)
 * - Tablet: 2-col grid
 * - Desktop: 3-col grid with subtle 3D tilt on hover
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
          <p
            className="v3-mono md:hidden"
            style={{ color: 'var(--v3-fg-muted)' }}
          >
            ← swipe →
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="px-6 md:px-12">
        {/* Mobile: horizontal scroll */}
        <div
          className="v3-no-scrollbar mt-10 -mx-6 flex gap-4 overflow-x-auto px-6 md:hidden"
          style={{ scrollSnapType: 'x mandatory' }}
          data-cursor="drag"
        >
          {WORK_V3.map((release, i) => (
            <div
              key={release.id}
              className="shrink-0"
              style={{
                width: '70vw',
                maxWidth: '320px',
                scrollSnapAlign: 'start',
              }}
            >
              <WorkCard release={release} inView={inView} index={i} />
            </div>
          ))}
          <div className="shrink-0" style={{ width: '10vw' }} aria-hidden />
        </div>

        {/* Tablet+: grid */}
        <div className="mt-10 hidden md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {WORK_V3.map((release, i) => (
            <WorkCard
              key={release.id}
              release={release}
              inView={inView}
              index={i}
            />
          ))}
        </div>
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
    setTilt({ x: y * -5, y: x * 8 })
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
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: 0.2 + index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative block w-full will-change-transform"
      style={{ perspective: '1200px' }}
    >
      <div
        className="v3-card overflow-hidden"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 360ms cubic-bezier(0.16,1,0.3,1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Image — 16:10 ratio (more compact than 4:5) */}
        <div
          className="relative aspect-[16/10] overflow-hidden"
          style={{ background: 'var(--v3-shade)' }}
        >
          <Image
            src={release.image}
            alt={release.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 70vw"
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
          {/* Catalog number */}
          <div className="absolute top-3 left-3">
            <span
              className="v3-mono inline-block rounded-full px-2.5 py-1 text-[10px]"
              style={{
                background: 'oklch(0.06 0.012 260 / 0.7)',
                color: 'var(--v3-paper)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {release.catalogNumber}
            </span>
          </div>
          <div className="absolute right-3 bottom-3">
            <span
              className="v3-mono inline-block rounded-full px-2.5 py-1 text-[10px]"
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

        {/* Card body — compact */}
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-3">
            <span
              className="v3-mono text-[10px]"
              style={{ color: 'var(--v3-fg-muted)' }}
            >
              {release.index}
            </span>
            <span
              className="v3-mono text-[10px]"
              style={{ color: 'var(--v3-iris-2)' }}
            >
              {release.genre}
            </span>
          </div>
          <h3
            className="v3-display-sans mt-2 text-lg lg:text-xl"
            style={{ lineHeight: 1.15 }}
          >
            {release.title}
          </h3>
          <p
            className="mt-2 line-clamp-2 text-sm"
            style={{
              color: 'var(--v3-fg-muted)',
              lineHeight: 1.5,
            }}
          >
            {release.description}
          </p>
          <div
            className="mt-4 flex items-center justify-between text-[10px]"
            style={{ color: 'var(--v3-fg-muted)' }}
          >
            <span className="v3-mono inline-flex items-center gap-1.5">
              View case <ArrowUpRight className="h-3 w-3" aria-hidden />
            </span>
            <span className="v3-mono">{release.tags.join(' · ')}</span>
          </div>
        </div>
      </div>
    </motion.a>
  )
}

export default WorkSection
