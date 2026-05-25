'use client'

import { motion } from 'motion/react'
import { CREDITS_V2 } from '../constants'

const fade = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.4, ease: 'easeOut' },
} as const

export function CreditsSection() {
  return (
    <section
      id="credits"
      className="px-6 py-20 md:px-12 md:py-28"
      style={{ borderTop: '1px solid var(--v2-border)' }}
      aria-labelledby="v2-credits-heading"
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        <motion.header {...fade} className="md:col-span-3">
          <div className="v2-mono mb-3" style={{ color: 'var(--v2-accent)' }}>
            CREDITS
          </div>
          <h2
            id="v2-credits-heading"
            className="v2-display"
            style={{
              fontSize: 'var(--v2-step-2)',
              lineHeight: 1.1,
              fontWeight: 500,
            }}
          >
            Players, instruments, and tools.
          </h2>
          <p
            className="mt-4 max-w-[32ch] text-sm leading-relaxed"
            style={{ color: 'var(--v2-foreground-muted)' }}
          >
            A working set, listed plainly. No stars, no levels.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 gap-10 md:col-span-9 md:grid-cols-3 md:gap-8">
          {CREDITS_V2.map((group, gi) => (
            <motion.div
              key={group.id}
              {...fade}
              transition={{
                duration: 0.4,
                delay: 0.06 * gi,
                ease: 'easeOut',
              }}
            >
              <h3
                className="v2-mono mb-4 pb-3"
                style={{
                  borderBottom: '1px solid var(--v2-border)',
                  color: 'var(--v2-foreground)',
                }}
              >
                {group.label}
              </h3>
              <ul className="space-y-2.5">
                {group.entries.map((entry) => (
                  <li
                    key={entry}
                    className="v2-mono flex items-baseline justify-between"
                    style={{
                      color: 'var(--v2-foreground)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span>{entry}</span>
                    <span
                      className="ml-3 flex-1 border-b border-dotted"
                      style={{ borderColor: 'var(--v2-border)' }}
                      aria-hidden
                    />
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CreditsSection
