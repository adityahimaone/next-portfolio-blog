'use client'

import { motion } from 'motion/react'
import { ABOUT_V2 } from '../constants'

const fade = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.4, ease: 'easeOut' },
} as const

export function AboutSection() {
  const [first, ...rest] = ABOUT_V2.paragraphs

  return (
    <section
      id="about"
      className="px-6 py-20 md:px-12 md:py-28"
      aria-labelledby="v2-about-heading"
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        {/* Kicker rail */}
        <motion.div {...fade} className="md:col-span-3">
          <div className="v2-mono mb-3" style={{ color: 'var(--v2-accent)' }}>
            {ABOUT_V2.kicker}
          </div>
          <h2
            id="v2-about-heading"
            className="v2-display"
            style={{
              fontSize: 'var(--v2-step-2)',
              lineHeight: 1.1,
              fontWeight: 500,
            }}
          >
            {ABOUT_V2.headline}
          </h2>
        </motion.div>

        {/* Body — 60/40 asymmetric: prose + metadata column */}
        <motion.div
          {...fade}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
          className="md:col-span-6"
        >
          <p className="v2-prose v2-dropcap text-base leading-relaxed md:text-[1.0625rem]">
            {first}
          </p>
          <div className="v2-prose mt-6">
            {rest.map((p, i) => (
              <p key={i} className="text-base leading-relaxed md:text-[1.0625rem]">
                {p}
              </p>
            ))}
          </div>

          {/* Pull quote */}
          <motion.blockquote
            {...fade}
            transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
            className="v2-pullquote mt-10 border-l pl-6 md:mt-12 md:pl-8"
            style={{
              borderColor: 'var(--v2-accent)',
              fontSize: 'var(--v2-step-2)',
              color: 'var(--v2-foreground)',
            }}
          >
            “{ABOUT_V2.pullQuote}”
          </motion.blockquote>
        </motion.div>

        {/* Right: metadata column (40-ish) */}
        <motion.aside
          {...fade}
          transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
          className="md:col-span-3"
          aria-label="about metadata"
        >
          <dl className="space-y-4">
            {ABOUT_V2.metadata.map((m) => (
              <div
                key={m.label}
                className="border-t pt-3"
                style={{ borderColor: 'var(--v2-border)' }}
              >
                <dt
                  className="v2-mono mb-1"
                  style={{ color: 'var(--v2-foreground-muted)' }}
                >
                  {m.label}
                </dt>
                <dd className="text-sm md:text-base">{m.value}</dd>
              </div>
            ))}
          </dl>
        </motion.aside>
      </div>
    </section>
  )
}

export default AboutSection
