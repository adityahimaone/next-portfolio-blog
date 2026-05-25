'use client'

import { motion } from 'motion/react'
import { useInView } from '../hooks/use-in-view'
import { PROFILE_V3 } from '../constants'

/**
 * ProfileSection (02) — long-form bio with reveal-on-scroll.
 * Editorial layout: kicker, big headline, prose column, pull quote, signal grid.
 */
export function ProfileSection() {
  const { ref, inView } = useInView({ once: true, threshold: 0.2 })

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="profile"
      className="relative px-6 py-24 md:px-12 md:py-32"
      aria-labelledby="v3-profile-headline"
      style={{ background: 'var(--v3-space)' }}
    >
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        {/* Kicker rail */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-1 md:col-span-3"
        >
          <div className="v3-mono" style={{ color: 'var(--v3-iris-2)' }}>
            {PROFILE_V3.kicker}
          </div>
          <div
            className="mt-3 h-px w-16"
            style={{ background: 'var(--v3-fog)' }}
            aria-hidden
          />
        </motion.div>

        {/* Headline */}
        <h2
          id="v3-profile-headline"
          className="v3-display col-span-1 md:col-span-9"
          style={{
            fontSize: 'var(--v3-display-md)',
            lineHeight: 0.92,
          }}
        >
          {PROFILE_V3.headline.split('\n').map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span
                initial={{ y: '105%' }}
                animate={inView ? { y: '0%' } : {}}
                transition={{
                  duration: 1.1,
                  delay: 0.15 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>
      </div>

      {/* Prose + pull quote */}
      <div className="mt-16 grid grid-cols-1 gap-12 md:mt-24 md:grid-cols-12 md:gap-8">
        <div className="col-span-1 md:col-span-3 md:col-start-1">
          {/* Spacer / signals on desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden flex-col gap-6 md:flex"
          >
            {PROFILE_V3.signals.map((s) => (
              <div key={s.id}>
                <div
                  className="v3-mono"
                  style={{ color: 'var(--v3-fg-muted)' }}
                >
                  {s.label}
                </div>
                <div className="mt-1 text-base">{s.value}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Prose */}
        <div className="col-span-1 md:col-span-6">
          <div
            className="space-y-6"
            style={{
              maxWidth: '64ch',
              lineHeight: 1.7,
              fontSize: 'var(--v3-step-1)',
            }}
          >
            {PROFILE_V3.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.9,
                  delay: 0.3 + i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Pull quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.9,
            delay: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="col-span-1 md:col-span-3"
        >
          <div
            className="border-l-2 pl-6"
            style={{ borderColor: 'var(--v3-iris-1)' }}
          >
            <p
              className="v3-display text-2xl md:text-3xl"
              style={{
                lineHeight: 1.2,
                color: 'var(--v3-bright)',
              }}
            >
              {PROFILE_V3.pullQuote}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mobile signals */}
      <div className="mt-12 grid grid-cols-2 gap-6 md:hidden">
        {PROFILE_V3.signals.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.4 + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div
              className="v3-mono"
              style={{ color: 'var(--v3-fg-muted)' }}
            >
              {s.label}
            </div>
            <div className="mt-1 text-base">{s.value}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default ProfileSection
