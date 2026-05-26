'use client'

/**
 * Playhead — vertical line that travels left→right based on scroll progress.
 * Fixed-position, full viewport height, low opacity, behind content.
 *
 * Visual: the "play position" of the entire portfolio session.
 * Reads scroll from the document; respects prefers-reduced-motion.
 */

import { useScroll, useTransform, useSpring, m, useReducedMotion } from 'motion/react'

export function Playhead() {
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24 })
  const left = useTransform(smooth, [0, 1], ['0%', '100%'])

  if (prefersReduced) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] hidden md:block"
    >
      <m.div
        style={{ left }}
        className="absolute top-0 bottom-0 w-px"
      >
        <div className="absolute inset-0 bg-[var(--r3-signal)]/0 [box-shadow:0_0_18px_rgba(57,255,110,0.18)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--r3-signal)]/35 to-transparent" />
      </m.div>
    </div>
  )
}
