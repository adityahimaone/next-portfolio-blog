'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { MANIFESTO_V3 } from '../constants'
import { V3ShaderBackground } from './_shared/v3-shader-background'

/**
 * ManifestoSection (01) — full-screen pinned hero with shader background.
 * Massive multi-line typography, mixed sans + italic serif + iridescent gradient text.
 * Subtle parallax: text drifts slightly slower than scroll for depth.
 */
export function ManifestoSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96])

  return (
    <section
      ref={ref}
      id="manifesto"
      className="v3-grain relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-6 pt-10 pb-12 md:px-12 md:pt-16 md:pb-16"
      aria-labelledby="v3-manifesto-headline"
    >
      <V3ShaderBackground intensity={0.7} />

      {/* Top metadata strip */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 grid grid-cols-2 items-start gap-4 md:grid-cols-12"
      >
        <div className="v3-mono col-span-1 md:col-span-3">
          {MANIFESTO_V3.scene} · {MANIFESTO_V3.release}
        </div>
        <div className="v3-mono col-span-1 text-right md:col-span-3 md:col-start-10">
          <span style={{ color: 'var(--v3-iris-1)' }}>●</span>{' '}
          {MANIFESTO_V3.status}
        </div>
      </motion.header>

      {/* Massive hero block — parallax scroll */}
      <motion.div
        style={{ opacity, y, scale }}
        className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-12"
      >
        <h1
          id="v3-manifesto-headline"
          className="col-span-1 md:col-span-12"
          style={{ lineHeight: 0.9 }}
        >
          {MANIFESTO_V3.lines.map((line, i) => (
            <ManifestoLine
              key={line.id}
              text={line.text}
              tone={line.tone}
              delay={i * 0.12}
            />
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="col-span-1 grid grid-cols-1 gap-8 md:col-span-12 md:grid-cols-12"
        >
          <p
            className="col-span-1 max-w-[44ch] text-base md:col-span-5 md:text-lg"
            style={{ color: 'var(--v3-fg-muted)' }}
          >
            {MANIFESTO_V3.subline}
          </p>

          <div className="col-span-1 flex flex-col gap-2 md:col-span-3 md:col-start-10 md:items-end md:text-right">
            <span className="v3-mono">{MANIFESTO_V3.role}</span>
            <span
              className="v3-mono"
              style={{ color: 'var(--v3-fg-muted)' }}
            >
              {MANIFESTO_V3.location}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer: CTAs + scroll cue */}
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.9,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={MANIFESTO_V3.primaryCta.href}
            className="v3-btn v3-btn-primary"
            data-cursor="link"
          >
            <span>{MANIFESTO_V3.primaryCta.label}</span>
            <span aria-hidden>→</span>
          </a>
          <a
            href={MANIFESTO_V3.secondaryCta.href}
            className="v3-btn v3-btn-ghost"
            data-cursor="link"
          >
            {MANIFESTO_V3.secondaryCta.label}
          </a>
        </div>

        <ScrollCue />
      </motion.footer>
    </section>
  )
}

/* ─── Internal: animated word-line ─────────────────────────────── */
function ManifestoLine({
  text,
  tone,
  delay,
}: {
  text: string
  tone: 'sans' | 'serif-italic' | 'iris'
  delay: number
}) {
  const cls =
    tone === 'serif-italic'
      ? 'v3-display'
      : tone === 'iris'
        ? 'v3-display-sans v3-iris-text'
        : 'v3-display-sans'

  return (
    <span
      className={`block ${cls}`}
      style={{
        fontSize: 'var(--v3-display-lg)',
        overflow: 'hidden',
      }}
    >
      <motion.span
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{
          duration: 1.1,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{ display: 'inline-block', willChange: 'transform' }}
      >
        {text}
      </motion.span>
    </span>
  )
}

function ScrollCue() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span
        className="block h-px w-10"
        style={{ background: 'var(--v3-fog)' }}
      />
      <motion.span
        animate={{ y: [0, 4, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="v3-mono"
      >
        SCROLL ↓
      </motion.span>
    </div>
  )
}

export default ManifestoSection
