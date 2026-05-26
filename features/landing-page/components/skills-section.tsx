'use client'

/**
 * Track 03 — The Patch Bay & Pedalboard.
 *
 * The tech stack laid out as a modular synth patch bay. Hovering over a
 * skill activates a subtle LED glow on the "pedal". Reuses the existing
 * MIXER_DATA so we don't duplicate skill data.
 */
import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { TrackSection } from '@/components/track-section'
import { MIXER_DATA } from '../constants'

const PEDAL_GROUPS = [
  {
    id: 'languages',
    label: 'Languages',
    description: 'Daily-driven',
  },
  {
    id: 'frameworks',
    label: 'Frameworks',
    description: 'Stage-tested',
  },
  {
    id: 'tools',
    label: 'Tools & FX',
    description: 'Routing',
  },
] as const

export function SkillsSection() {
  const [hovered, setHovered] = useState<string | null>(null)
  const prefersReduced = useReducedMotion()

  return (
    <TrackSection
      trackNumber="03"
      id="skills"
      title="Patch Bay"
      subtitle="The signal chain. Every pedal, every cable, every preset I reach for."
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {PEDAL_GROUPS.map((group, gIdx) => {
          const data = MIXER_DATA.find((m) => m.id === group.id)
          if (!data) return null

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: gIdx * 0.1 }}
              className="console-card relative p-5"
            >
              {/* Group header */}
              <div className="mb-4 flex items-center justify-between border-b border-edge pb-3">
                <div>
                  <h3 className="font-mono text-sm font-bold tracking-widest text-text-main">
                    {group.label.toUpperCase()}
                  </h3>
                  <p className="meta-label mt-0.5">{group.description}</p>
                </div>
                <span className="led-dot" aria-hidden="true" />
              </div>

              {/* Pedals — each skill */}
              <ul className="space-y-2.5">
                {data.channels.map((skill, sIdx) => {
                  const key = `${group.id}-${skill.name}`
                  const isHover = hovered === key
                  return (
                    <li
                      key={key}
                      onMouseEnter={() => setHovered(key)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(key)}
                      onBlur={() => setHovered(null)}
                      tabIndex={0}
                      className="group relative flex items-center gap-3 rounded-sm border border-edge bg-base/60 px-3 py-2.5 transition-all hover:border-accent focus-visible:border-accent"
                    >
                      {/* LED indicator */}
                      <motion.span
                        initial={false}
                        animate={{
                          backgroundColor: isHover
                            ? 'var(--color-accent)'
                            : 'rgba(139,92,246,0.3)',
                          boxShadow: isHover
                            ? '0 0 8px var(--color-accent), 0 0 16px rgba(139,92,246,0.6)'
                            : '0 0 0px transparent',
                        }}
                        transition={{ duration: 0.2 }}
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full"
                      />

                      {/* Skill label */}
                      <span className="flex-1 font-mono text-xs tracking-widest text-text-main md:text-sm">
                        {skill.name}
                      </span>

                      {/* Level meter */}
                      <span className="flex items-center gap-px" aria-label={`${skill.level}%`}>
                        {Array.from({ length: 10 }).map((_, i) => {
                          const lit = i < Math.round(skill.level / 10)
                          return (
                            <span
                              key={i}
                              className={`h-3 w-0.5 ${
                                lit
                                  ? i >= 8
                                    ? 'bg-accent-warm'
                                    : i >= 6
                                      ? 'bg-accent-alt'
                                      : 'bg-accent'
                                  : 'bg-edge'
                              }`}
                            />
                          )
                        })}
                      </span>

                      {/* Patch cable on hover */}
                      {!prefersReduced && isHover && sIdx < data.channels.length - 1 && (
                        <motion.svg
                          aria-hidden="true"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.6 }}
                          exit={{ opacity: 0 }}
                          className="pointer-events-none absolute -bottom-2.5 left-3 z-10 h-3 w-3 overflow-visible"
                        >
                          <motion.path
                            d="M 0 0 Q 1.5 6 3 0"
                            className="patch-cable"
                          />
                        </motion.svg>
                      )}
                    </li>
                  )
                })}
              </ul>

              {/* Channel routing label */}
              <div className="mt-4 flex items-center justify-between border-t border-edge pt-3">
                <span className="meta-label">CH {String(gIdx + 1).padStart(2, '0')}</span>
                <span className="meta-label text-accent-alt">ROUTED</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </TrackSection>
  )
}
