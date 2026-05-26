'use client'

/**
 * The Record Groove — connective tissue across the page.
 *
 * A continuous glowing line fixed to the left edge that tracks scroll progress.
 * Physically connects every section so the concept-album narrative never breaks.
 *
 * Behaviour:
 *  - Track: vertical rail (semi-transparent console-color)
 *  - Fill: violet glow that grows with scrollYProgress (origin-top scaleY)
 *  - Playhead: pulsing dot positioned at the current scroll percentage
 *  - Respects prefers-reduced-motion
 */
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

export function RecordGroove() {
  const { scrollYProgress } = useScroll()
  const prefersReduced = useReducedMotion()

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Position the playhead by mapping 0..1 → 0%..100%
  const headTop = useTransform(scaleY, (v) => `${v * 100}%`)

  if (prefersReduced) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 bottom-0 left-3 z-40 hidden w-[2px] bg-console/80 md:left-6 md:block"
    >
      <motion.div
        className="origin-top bg-accent shadow-[0_0_12px_var(--color-accent)]"
        style={{ scaleY, height: '100%', width: '100%' }}
      />
      <motion.div
        className="absolute -left-[5px] h-3 w-3 rounded-full bg-white shadow-[0_0_10px_white,0_0_20px_var(--color-accent)]"
        style={{ top: headTop }}
      />
    </div>
  )
}
