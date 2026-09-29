'use client'

import { AnimatePresence, motion } from 'motion/react'
import type { ProjectPalette } from '@/data/projects'
import styles from './work.module.css'

/**
 * Black base, a palette wash, grain, and a vignette.
 *
 * The wash is gradients rather than a blurred copy of the cover: glass needs
 * colour behind it to refract, and two radial gradients cost nothing at runtime
 * where an 80px image blur would re-rasterise on every frame.
 */
export function AmbientBackdrop({ palette }: { palette: ProjectPalette }) {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.div
          key={`${palette.a}-${palette.b}`}
          className={styles.wash}
          style={{
            background: `
              radial-gradient(60% 55% at 28% 42%, ${palette.a}, transparent 70%),
              radial-gradient(50% 50% at 74% 58%, ${palette.b}, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.38 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
      <div className={styles.grain} />
      <div className={styles.vignette} />
      {/* Breathing bloom keyed to the active palette. Two slow, offset pulses
          rather than one fast one, so the light never reads as a loop. */}
      <div
        className={styles.bloom}
        style={{
          background: `
            radial-gradient(46% 42% at 24% 34%, ${palette.a}, transparent 68%),
            radial-gradient(40% 38% at 76% 66%, ${palette.b}, transparent 68%)`,
        }}
      />
    </div>
  )
}
