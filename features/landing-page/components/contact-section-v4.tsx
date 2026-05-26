'use client'

/**
 * Editorial v4 — Contact Section
 *
 * Full-viewport (100vh) dark section with:
 * - Multi-layer parallax (illustration gradient, vignette, content)
 * - Ghost button mailto
 * - Social links (GitHub, LinkedIn, Email)
 * - Footer at absolute bottom
 */

import { motion, useReducedMotion } from 'motion/react'
import { ParallaxLayer } from './parallax-layer'

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/adityahimaone' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/adityahimaone' },
  { label: 'Email', href: 'mailto:halo@adityahimaone.space' },
]

export function ContactSectionV4() {
  const prefersReduced = useReducedMotion()

  return (
    <section
      id="contact"
      className="relative min-h-screen overflow-hidden bg-[var(--color-ink)] flex items-center justify-center"
    >
      {/* [z:0] Classical illustration placeholder — dark gradient */}
      <ParallaxLayer
        speed={0.15}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div
          className="w-full h-full opacity-45"
          style={{
            background:
              'linear-gradient(135deg, rgba(30,30,28,1) 0%, rgba(15,15,15,1) 40%, rgba(40,38,35,0.8) 70%, rgba(10,10,10,1) 100%)',
          }}
          aria-hidden="true"
        />
      </ParallaxLayer>

      {/* [z:1] Radial gradient overlay (vignette) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.75) 90%)',
        }}
        aria-hidden="true"
      />

      {/* [z:2] Content — centered */}
      <div className="relative z-[2] flex flex-col items-center text-center px-6 py-24">
        {/* Label */}
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="font-ui text-[11px] uppercase tracking-[0.2em] text-[var(--color-accent-grey)] mb-4"
        >
          Let&apos;s Work Together
        </motion.p>

        {/* Divider line */}
        <motion.div
          initial={prefersReduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-px w-16 bg-[var(--color-accent-grey)] mb-8 origin-center"
        />

        {/* Heading */}
        <motion.h2
          initial={prefersReduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-display text-2xl md:text-2xl text-[var(--color-off-white)] leading-tight mb-5"
          style={{ fontSize: 'clamp(48px, 7vw, 72px)' }}
        >
          Get in touch
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="font-ui text-[14px] text-[var(--color-off-white)]/75 max-w-[380px] mb-8 leading-relaxed"
        >
          Open for freelance, full-time roles, and interesting collaborations.
        </motion.p>

        {/* Ghost button — mailto */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-10"
        >
          <a
            href="mailto:halo@adityahimaone.space"
            className="inline-block border border-[var(--color-off-white)] bg-transparent px-8 py-4 font-ui text-[13px] text-[var(--color-off-white)] tracking-[0.05em] transition-colors hover:bg-[var(--color-off-white)] hover:text-[var(--color-ink)]"
            style={{ borderRadius: 'var(--radius-button)' }}
          >
            halo@adityahimaone.space
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex items-center gap-6"
        >
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('mailto') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              className="font-ui text-[13px] uppercase tracking-[0.08em] text-[var(--color-off-white)] transition-opacity hover:opacity-60"
            >
              {link.label}
            </a>
          ))}
        </motion.div>
      </div>

      {/* Footer — absolute bottom */}
      <footer className="absolute bottom-0 left-0 right-0 z-[2] pb-8 text-center">
        <p className="font-ui text-xs text-[var(--color-accent-grey)]">
          © 2026 Aditya Himawan — Website by Adit
        </p>
      </footer>
    </section>
  )
}
