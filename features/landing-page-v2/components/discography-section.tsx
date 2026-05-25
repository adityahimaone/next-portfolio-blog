'use client'

import { motion } from 'motion/react'
import { DISCOGRAPHY_V2 } from '../constants'

const fade = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.4, ease: 'easeOut' },
} as const

export function DiscographySection() {
  return (
    <section
      id="discography"
      className="px-6 py-20 md:px-12 md:py-28"
      style={{ borderTop: '1px solid var(--v2-border)' }}
      aria-labelledby="v2-discography-heading"
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        <motion.header {...fade} className="md:col-span-3">
          <div className="v2-mono mb-3" style={{ color: 'var(--v2-accent)' }}>
            DISCOGRAPHY
          </div>
          <h2
            id="v2-discography-heading"
            className="v2-display"
            style={{
              fontSize: 'var(--v2-step-2)',
              lineHeight: 1.1,
              fontWeight: 500,
            }}
          >
            A working catalog.
          </h2>
          <p
            className="mt-4 max-w-[34ch] text-sm leading-relaxed"
            style={{ color: 'var(--v2-foreground-muted)' }}
          >
            Roles, releases, and residencies — listed in reverse chronology.
          </p>
        </motion.header>

        <ol className="md:col-span-9">
          {DISCOGRAPHY_V2.map((entry, i) => (
            <motion.li
              key={entry.id}
              {...fade}
              transition={{
                duration: 0.4,
                delay: 0.05 * i,
                ease: 'easeOut',
              }}
              className="grid grid-cols-1 gap-4 py-8 md:grid-cols-12 md:gap-6 md:py-10"
              style={{
                borderTop:
                  i === 0 ? 'none' : '1px solid var(--v2-paper-line)',
              }}
            >
              {/* Year */}
              <div className="md:col-span-2">
                <div
                  className="v2-mono"
                  style={{ color: 'var(--v2-foreground-muted)' }}
                >
                  {entry.year}
                </div>
              </div>

              {/* Label / company / role */}
              <div className="md:col-span-4">
                <div
                  className="v2-display"
                  style={{
                    fontSize: 'var(--v2-step-1)',
                    lineHeight: 1.15,
                    fontWeight: 500,
                  }}
                >
                  {entry.label}
                </div>
                <div className="v2-mono mt-2">{entry.role}</div>
                <div
                  className="v2-mono mt-1"
                  style={{ color: 'var(--v2-foreground-muted)' }}
                >
                  {entry.type} · {entry.location}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-6">
                <ul className="space-y-2">
                  {entry.description.map((d, di) => (
                    <li
                      key={di}
                      className="text-sm leading-relaxed md:text-[0.95rem]"
                      style={{ color: 'var(--v2-foreground)' }}
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default DiscographySection
