'use client'

import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/use-in-view'
import { STACK_V3 } from '../constants'

/**
 * StackSection (04) — orbital floating tag cloud.
 * Tags drift in 2D space with subtle physics; mouse pulls them gently.
 * Filter pills (Languages / Frameworks / Tools) restyle the view.
 */
type Filter = 'all' | 'language' | 'framework' | 'tool'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'language', label: 'Languages' },
  { id: 'framework', label: 'Frameworks' },
  { id: 'tool', label: 'Tools' },
]

export function StackSection() {
  const { ref, inView } = useInView({ once: true, threshold: 0.2 })
  const [filter, setFilter] = useState<Filter>('all')

  const filtered =
    filter === 'all'
      ? STACK_V3
      : STACK_V3.filter((s) => s.group === filter)

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="stack"
      className="relative overflow-hidden px-6 py-24 md:px-12 md:py-32"
      aria-labelledby="v3-stack-headline"
      style={{ background: 'var(--v3-deep)' }}
    >
      {/* Header */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-1 md:col-span-3"
        >
          <div className="v3-mono" style={{ color: 'var(--v3-iris-3)' }}>
            STACK — 04
          </div>
          <div
            className="mt-3 h-px w-16"
            style={{ background: 'var(--v3-fog)' }}
            aria-hidden
          />
        </motion.div>

        <h2
          id="v3-stack-headline"
          className="v3-display-sans col-span-1 md:col-span-9"
          style={{
            fontSize: 'var(--v3-display-md)',
            lineHeight: 0.92,
          }}
        >
          <span className="block overflow-hidden">
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
              The instruments
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
              I play with.
            </motion.span>
          </span>
        </h2>
      </div>

      {/* Filter pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-12 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Stack filter"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            data-cursor="link"
            className="v3-mono inline-flex items-center rounded-full border px-4 py-2 transition-all duration-300"
            style={{
              borderColor:
                filter === f.id
                  ? 'var(--v3-paper)'
                  : 'var(--v3-fog)',
              background:
                filter === f.id
                  ? 'var(--v3-paper)'
                  : 'transparent',
              color:
                filter === f.id ? 'var(--v3-void)' : 'var(--v3-fg-muted)',
            }}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Tag cloud */}
      <FloatingTags items={filtered} inView={inView} />

      {/* Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-16 flex items-center justify-between"
      >
        <span className="v3-mono" style={{ color: 'var(--v3-fg-muted)' }}>
          {filtered.length.toString().padStart(2, '0')} entries
        </span>
        <span className="v3-mono" style={{ color: 'var(--v3-fg-muted)' }}>
          hover to interact
        </span>
      </motion.div>
    </section>
  )
}

/* ─── Floating tag cloud ───────────────────────────────────────── */
function FloatingTags({
  items,
  inView,
}: {
  items: typeof STACK_V3
  inView: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handle = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      setMouse({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      })
    }
    el.addEventListener('pointermove', handle)
    el.addEventListener('pointerleave', () => setMouse({ x: 0, y: 0 }))
    return () => el.removeEventListener('pointermove', handle)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative mt-12 min-h-[400px] md:min-h-[520px]"
    >
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {items.map((item, i) => {
          // Pseudo-random but stable per id for layout drift
          const seed = item.id
            .split('')
            .reduce((a, c) => a + c.charCodeAt(0), 0)
          const driftX = ((seed * 7) % 20) - 10
          const driftY = ((seed * 13) % 16) - 8
          const pull = 0.012
          const tx = mouse.x * pull + driftX
          const ty = mouse.y * pull + driftY

          const accent =
            item.group === 'language'
              ? 'var(--v3-iris-1)'
              : item.group === 'framework'
                ? 'var(--v3-iris-2)'
                : 'var(--v3-iris-3)'

          const Icon = item.icon

          return (
            <motion.span
              key={item.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={
                inView
                  ? {
                      opacity: 1,
                      scale: 1,
                      x: tx,
                      y: ty,
                    }
                  : {}
              }
              transition={{
                opacity: {
                  duration: 0.5,
                  delay: i * 0.025,
                  ease: [0.16, 1, 0.3, 1],
                },
                scale: {
                  duration: 0.5,
                  delay: i * 0.025,
                  ease: [0.16, 1, 0.3, 1],
                },
                x: {
                  type: 'spring',
                  stiffness: 80,
                  damping: 20,
                  mass: 0.7,
                },
                y: {
                  type: 'spring',
                  stiffness: 80,
                  damping: 20,
                  mass: 0.7,
                },
              }}
              data-cursor="link"
              className="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-300 will-change-transform md:px-5 md:py-2.5 md:text-base"
              style={{
                borderColor: 'var(--v3-fog)',
                color: 'var(--v3-paper)',
                background: 'oklch(0.10 0.018 260 / 0.6)',
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
              }}
            >
              <Icon
                className="h-3.5 w-3.5 transition-colors duration-300 md:h-4 md:w-4"
                style={{ color: accent }}
                aria-hidden
                strokeWidth={1.75}
              />
              {item.name}
            </motion.span>
          )
        })}
      </div>
    </div>
  )
}

export default StackSection
