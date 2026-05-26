'use client'

/**
 * Track 01 — Overture.
 *
 * The venue lights dim. A typewriter greeting ticks on like a step
 * sequencer locking into a grid. Behind it: a slow, audio-reactive-
 * looking shimmer of stage haze and laser violet.
 *
 * No external audio context, no Tone.js. Pure CSS + Motion.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown } from 'lucide-react'

const GREETING_LINES = [
  '> booting set list…',
  '> tuning instruments…',
  '> sound check : OK',
  '> lights dimming…',
  '> the show begins.',
]

export function HeroSection() {
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const prefersReduced = useReducedMotion()

  // Step-sequencer typewriter
  useEffect(() => {
    if (prefersReduced) {
      setLineIdx(GREETING_LINES.length - 1)
      setCharIdx(GREETING_LINES[GREETING_LINES.length - 1].length)
      return
    }
    if (lineIdx >= GREETING_LINES.length) return
    const current = GREETING_LINES[lineIdx]
    if (charIdx < current.length) {
      const t = setTimeout(() => setCharIdx(charIdx + 1), 40)
      return () => clearTimeout(t)
    }
    const next = setTimeout(() => {
      if (lineIdx < GREETING_LINES.length - 1) {
        setLineIdx(lineIdx + 1)
        setCharIdx(0)
      }
    }, 700)
    return () => clearTimeout(next)
  }, [lineIdx, charIdx, prefersReduced])

  return (
    <section
      id="overture"
      className="stage-haze relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-24 md:px-12"
    >
      {/* Laser strobe lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
      >
        <motion.div
          className="absolute top-1/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-accent to-transparent"
          animate={prefersReduced ? {} : { opacity: [0.1, 0.5, 0.1], scaleX: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-2/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-accent-alt to-transparent"
          animate={prefersReduced ? {} : { opacity: [0.05, 0.3, 0.05], scaleX: [0.4, 1, 0.4] }}
          transition={{ duration: 8, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Spotlight gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[140vh] w-[140vh] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl">
        {/* Track number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="meta-label flex items-center gap-2 text-accent"
        >
          <span className="led-dot" aria-hidden="true" />
          Trk 01 // Overture · A0:00
        </motion.div>

        {/* Display name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="display-heading mt-6 text-5xl md:text-7xl lg:text-[8.5rem]"
        >
          ADITYA
          <br />
          <span className="text-accent">HIMAONE</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-6 max-w-2xl text-lg text-text-muted md:text-2xl"
        >
          A frontend developer mixing code, motion, and design.
          <br className="hidden md:block" />
          This portfolio is a live concert. You set the tempo by scrolling.
        </motion.p>

        {/* Step-sequencer console */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="console-card mt-12 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-edge px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500/80" aria-hidden="true" />
              <span className="h-2 w-2 rounded-full bg-yellow-500/80" aria-hidden="true" />
              <span className="h-2 w-2 rounded-full bg-green-500/80" aria-hidden="true" />
            </div>
            <span className="meta-label">CH 01 // STAGE LOG</span>
          </div>
          <div className="px-4 py-5 font-mono text-sm md:text-base">
            {GREETING_LINES.slice(0, lineIdx).map((l, i) => (
              <div key={i} className="text-text-muted">
                {l}
              </div>
            ))}
            <div className="text-accent">
              {GREETING_LINES[lineIdx]?.slice(0, charIdx) ?? ''}
              <span
                className="ml-0.5 inline-block h-4 w-2 align-middle bg-accent"
                style={{ animation: prefersReduced ? 'none' : 'blink 1s steps(2) infinite' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 md:-bottom-20"
        >
          <Link
            href="#about"
            className="group flex flex-col items-center gap-2 text-text-dim transition-colors hover:text-accent"
            aria-label="Scroll to next track"
          >
            <span className="meta-label">DROP THE NEEDLE</span>
            <motion.div
              animate={prefersReduced ? {} : { y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown size={18} />
            </motion.div>
          </Link>
        </motion.div>
      </div>

      <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
    </section>
  )
}
