'use client'

import { motion } from 'motion/react'
import { HERO_V2 } from '../constants'

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-between px-6 pt-10 pb-12 md:px-12 md:pt-16 md:pb-16"
      aria-labelledby="v2-hero-name"
    >
      {/* Top metadata strip — like a record sleeve corner */}
      <motion.header
        {...fade}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="grid grid-cols-2 items-start gap-4 md:grid-cols-12"
      >
        <div className="v2-mono col-span-1 md:col-span-3">
          {HERO_V2.sideALabel} — {HERO_V2.release}
        </div>
        <div className="v2-mono text-right md:col-span-3 md:col-start-10">
          {HERO_V2.catalog}
        </div>
      </motion.header>

      {/* Display name — the centerpiece */}
      <motion.div
        {...fade}
        transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-6"
      >
        <h1
          id="v2-hero-name"
          className="v2-display v2-hero-name col-span-1 md:col-span-9"
        >
          {HERO_V2.name.split('\n').map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h1>

        {/* Right side caption rail */}
        <aside
          className="col-span-1 flex flex-col gap-3 md:col-span-3 md:items-end md:text-right"
          aria-label="hero metadata"
        >
          <div className="v2-mono">{HERO_V2.role}</div>
          <div
            className="v2-mono"
            style={{ color: 'var(--v2-foreground-muted)' }}
          >
            {HERO_V2.location}
          </div>
          <div
            className="mt-2 hidden h-px w-16 md:block"
            style={{ background: 'var(--v2-border)' }}
            aria-hidden
          />
          <p
            className="hidden max-w-[26ch] text-sm leading-relaxed md:block"
            style={{ color: 'var(--v2-foreground-muted)' }}
          >
            A small body of work, made with care, for the modern web.
          </p>
        </aside>
      </motion.div>

      {/* Footer: single primary CTA + secondary, plus scroll cue */}
      <motion.footer
        {...fade}
        transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
        className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div className="flex flex-wrap items-center gap-3">
          <a href={HERO_V2.primaryCta.href} className="v2-btn v2-btn-primary">
            {HERO_V2.primaryCta.label}
          </a>
          <a href={HERO_V2.secondaryCta.href} className="v2-btn v2-btn-ghost">
            {HERO_V2.secondaryCta.label}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="block h-px w-10"
            style={{ background: 'var(--v2-border)' }}
            aria-hidden
          />
          <span className="v2-mono">{HERO_V2.scrollCue}</span>
        </div>
      </motion.footer>
    </section>
  )
}

export default HeroSection
