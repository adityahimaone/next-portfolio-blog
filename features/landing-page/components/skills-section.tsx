'use client'

import React, { useRef } from 'react'
import { m, useReducedMotion, useInView } from 'motion/react'
import { cn } from '@/lib/utils'

import { MIXER_DATA } from '../constants'

// --- Simplified Knob (decorative, non-interactive) ---

const MiniKnob = ({ level = 50 }: { level?: number }) => {
  const deg = (level / 100) * 270 - 135
  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
      aria-hidden="true"
    >
      <div
        className="h-5 w-5 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 35%, var(--color-surface), var(--color-charcoal))',
          transform: `rotate(${deg}deg)`,
        }}
      >
        <div className="mx-auto mt-0.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-ochre)' }} />
      </div>
    </div>
  )
}

// --- Skill Card ---

const SkillCard = ({
  group,
  index,
}: {
  group: (typeof MIXER_DATA)[number]
  index: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const prefersReduced = useReducedMotion()

  return (
    <m.div
      ref={ref}
      initial={prefersReduced ? false : { opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: index * 0.1,
      }}
      className="relative rounded-xl p-5 md:p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Card Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: i === 2 ? 'var(--color-ochre)' : 'var(--color-moss)' }}
              />
            ))}
          </div>
          <h4
            className="text-base font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-highlight)' }}
          >
            {group.label}
          </h4>
        </div>
        <span
          className="text-[10px] uppercase tracking-widest opacity-50"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate)' }}
        >
          {group.type === 'fader' ? 'LEVEL' : 'TONE'}
        </span>
      </div>

      {/* Skills as simple chips */}
      <div className="flex flex-wrap gap-2">
        {group.channels.map((skill) => (
          <div
            key={skill.name}
            className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:translate-x-0.5"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-ochre) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-ochre) 15%, transparent)',
            }}
          >
            <div className="flex flex-col gap-0.5">
              <span
                className="text-sm font-medium leading-tight"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-highlight)' }}
              >
                {skill.name}
              </span>
              {/* Level bar */}
              <div className="flex h-1 w-16 items-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-ochre) 20%, transparent)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${skill.level}%`,
                    backgroundColor: 'var(--color-ochre)',
                  }}
                />
              </div>
            </div>
            <MiniKnob level={skill.level} />
          </div>
        ))}
      </div>
    </m.div>
  )
}

// --- Main Section Export ---

export function SkillsSection() {
  const prefersReduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative overflow-hidden py-20 md:py-24"
      style={{ backgroundColor: 'var(--color-charcoal)' }}
    >
      <div className="container relative mx-auto px-4">
        {/* Section Header - Refined */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-ochre)',
              border: '1px solid var(--color-border-subtle)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-ochre)' }} />
            <span>TOOLKIT</span>
          </div>
          <h2
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{
              color: 'var(--color-highlight)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Skills &amp; Expertise
          </h2>
          <p
            className="mt-3 max-w-md text-sm leading-relaxed"
            style={{
              color: 'var(--color-slate)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Each card represents a category &mdash; the bar shows proficiency level.
          </p>
        </m.div>

        {/* Card Grid */}
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 md:gap-6">
          {MIXER_DATA.map((group, i) => (
            <SkillCard key={group.id} group={group} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
