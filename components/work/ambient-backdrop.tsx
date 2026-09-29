'use client'

import { AnimatePresence, motion } from 'motion/react'
import type { ProjectPalette } from '@/data/projects'
import styles from './work.module.css'

/**
 * Black base plus a palette wash, grain and vignette. The wash is CSS
 * gradients rather than a blurred cover image, so the ambience costs almost
 * no GPU — glass needs colour behind it, but not an expensive one.
 */
export function AmbientBackdrop({ palette }: { palette: ProjectPalette }) {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <AnimatePresence mode="popLayout">
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
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </AnimatePresence>
      <div className={styles.grain} />
      <div className={styles.vignette} />
    </div>
  )
}
