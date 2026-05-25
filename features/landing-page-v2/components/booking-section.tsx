'use client'

import { motion } from 'motion/react'
import { BOOKING_V2 } from '../constants'

const fade = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.4, ease: 'easeOut' },
} as const

export function BookingSection() {
  return (
    <section
      id="booking"
      className="px-6 py-20 md:px-12 md:py-28"
      style={{ borderTop: '1px solid var(--v2-border)' }}
      aria-labelledby="v2-booking-heading"
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        <motion.header {...fade} className="md:col-span-5">
          <div className="v2-mono mb-3" style={{ color: 'var(--v2-accent)' }}>
            {BOOKING_V2.kicker}
          </div>
          <h2
            id="v2-booking-heading"
            className="v2-display"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.05,
              fontWeight: 500,
            }}
          >
            {BOOKING_V2.headline}
          </h2>
          <p
            className="v2-prose mt-6 text-base leading-relaxed md:text-[1.0625rem]"
            style={{ color: 'var(--v2-foreground)' }}
          >
            {BOOKING_V2.intro}
          </p>

          {/* Available for tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {BOOKING_V2.availableFor.map((tag) => (
              <span
                key={tag}
                className="v2-mono inline-flex items-center rounded-md px-3 py-1.5"
                style={{
                  border: '1px solid var(--v2-border)',
                  color: 'var(--v2-foreground)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.header>

        {/* Tabular booking sheet */}
        <motion.div
          {...fade}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
          className="md:col-span-7"
        >
          <div
            className="overflow-hidden rounded-lg"
            style={{ border: '1px solid var(--v2-border)' }}
          >
            {/* Email row */}
            <a
              href={`mailto:${BOOKING_V2.email}`}
              className="group grid grid-cols-12 items-center gap-3 px-5 py-5 transition-colors md:px-6"
              style={{
                borderBottom: '1px solid var(--v2-border)',
                background: 'var(--v2-background)',
              }}
            >
              <span
                className="v2-mono col-span-3"
                style={{ color: 'var(--v2-foreground-muted)' }}
              >
                Email
              </span>
              <span
                className="v2-display col-span-8 truncate"
                style={{
                  fontSize: 'var(--v2-step-1)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                {BOOKING_V2.email}
              </span>
              <span
                className="v2-mono col-span-1 text-right transition-colors group-hover:text-[var(--v2-accent)]"
                aria-hidden
              >
                →
              </span>
            </a>

            {/* Social rows */}
            {BOOKING_V2.social.map((s, i) => (
              <a
                key={s.label}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid grid-cols-12 items-center gap-3 px-5 py-4 transition-colors hover:bg-[var(--v2-muted)] md:px-6"
                style={{
                  borderBottom:
                    i === BOOKING_V2.social.length - 1
                      ? 'none'
                      : '1px solid var(--v2-paper-line)',
                }}
              >
                <span
                  className="v2-mono col-span-3"
                  style={{ color: 'var(--v2-foreground-muted)' }}
                >
                  {s.label}
                </span>
                <span
                  className="col-span-8 truncate text-sm md:text-base"
                  style={{ color: 'var(--v2-foreground)' }}
                >
                  {s.link.replace(/^https?:\/\//, '')}
                </span>
                <span
                  className="v2-mono col-span-1 text-right transition-colors group-hover:text-[var(--v2-accent)]"
                  aria-hidden
                >
                  ↗
                </span>
              </a>
            ))}
          </div>

          {/* Primary CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${BOOKING_V2.email}`}
              className="v2-btn v2-btn-primary"
            >
              Start a conversation
            </a>
            <span
              className="v2-mono"
              style={{ color: 'var(--v2-foreground-muted)' }}
            >
              Replies within 48h
            </span>
          </div>
        </motion.div>
      </div>

      {/* Colophon */}
      <div
        className="mt-20 grid grid-cols-1 items-end gap-4 pt-8 md:mt-28 md:grid-cols-12"
        style={{ borderTop: '1px solid var(--v2-border)' }}
      >
        <div
          className="v2-mono md:col-span-6"
          style={{ color: 'var(--v2-foreground-muted)' }}
        >
          © {new Date().getFullYear()} ADITYA HIMAONE — ALL RIGHTS RESERVED
        </div>
        <div
          className="v2-mono md:col-span-6 md:text-right"
          style={{ color: 'var(--v2-foreground-muted)' }}
        >
          SET IN FRAUNCES, INTER TIGHT, GEIST MONO
        </div>
      </div>
    </section>
  )
}

export default BookingSection
