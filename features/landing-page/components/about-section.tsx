'use client'

/**
 * Track 02 — Liner Notes.
 *
 * The acoustic breakdown. Editorial typography on a vinyl-sleeve gatefold.
 * A 3D-feeling stylus tracks down the side of the paragraphs as the user
 * scrolls. Heavy emphasis on whitespace and reading rhythm.
 */
import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { TrackSection } from '@/components/track-section'

export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Stylus rides from 0% → 100% of the paragraph block
  const stylusY = useTransform(scrollYProgress, [0, 1], ['5%', '85%'])
  const stylusRotate = useTransform(scrollYProgress, [0, 1], [-8, 4])

  return (
    <TrackSection
      trackNumber="02"
      id="about"
      title="Liner Notes"
      subtitle="The acoustic breakdown — who, where, and how this set was put together."
    >
      <div ref={ref} className="relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Stylus column (left) */}
        <div className="hidden lg:col-span-1 lg:flex lg:justify-center">
          <div className="relative h-full w-px bg-edge">
            <motion.div
              aria-hidden="true"
              style={{
                top: stylusY,
                rotate: prefersReduced ? -4 : stylusRotate,
              }}
              className="absolute -left-3 origin-top"
            >
              {/* Stylus arm + needle */}
              <div className="flex items-start gap-1">
                <div className="h-px w-12 bg-gradient-to-r from-zinc-400 to-zinc-600 mt-2" />
                <div className="h-3 w-3 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent),0_0_16px_rgba(139,92,246,0.6)]" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Editorial body */}
        <div className="lg:col-span-11 lg:pl-4">
          <article className="max-w-3xl space-y-8 text-text-main">
            <p className="text-2xl leading-relaxed text-text-main md:text-3xl md:leading-snug">
              I&rsquo;m <span className="text-accent">Adit</span> — a frontend
              developer based in Jakarta, currently part of the engineering
              floor at Fast 8 People Hub.
            </p>

            <p className="text-lg leading-relaxed text-text-muted md:text-xl">
              I came up the way a lot of bedroom producers do: by ripping things
              apart and putting them back together. jQuery. PHP. Then React,
              Next.js, the App Router, the type system. The tools changed; the
              instinct didn&rsquo;t. Build the thing, listen to it, mix it,
              ship it.
            </p>

            <p className="text-lg leading-relaxed text-text-muted md:text-xl">
              Today my main rig is{' '}
              <span className="text-text-main">React, Next.js, Tailwind v4,
              shadcn/ui, and the TanStack family</span>. I lean on PHP and
              jQuery when the job calls for it. I care about pixel rhythm,
              motion that respects the user, and interfaces that feel
              sound-checked before going live.
            </p>

            <p className="text-lg leading-relaxed text-text-muted md:text-xl">
              When I&rsquo;m not on stage with a code editor, I&rsquo;m
              probably scrolling through orderbook prints, designing micro-
              interactions for fun, or trying to recreate album art in CSS.
            </p>

            {/* Sleeve metadata */}
            <dl className="mt-12 grid grid-cols-2 gap-y-6 gap-x-8 border-t border-edge pt-8 md:grid-cols-4">
              <Meta label="Based in" value="Jakarta, ID" />
              <Meta label="Status" value="Open to gigs" accent />
              <Meta label="Workflow" value="Hybrid · WFO" />
              <Meta label="Side B" value="Jazz / Lo-fi" />
            </dl>
          </article>
        </div>
      </div>
    </TrackSection>
  )
}

function Meta({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <dt className="meta-label">{label}</dt>
      <dd
        className={`mt-1 font-mono text-sm tracking-wide ${
          accent ? 'text-accent' : 'text-text-main'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
