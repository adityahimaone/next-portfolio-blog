'use client'

import { AnimatePresence, motion } from 'motion/react'
import styles from './booth.module.css'

/**
 * The room: the ambient ground the whole booth sits in.
 *
 * Glass needs colour behind it to have anything to refract, which is why
 * this is a channel-driven wash rather than flat black. The wash is CSS
 * gradients, so it costs no image bytes and almost no GPU.
 */
export function Room({ hue }: { hue: string }) {
  return (
    <div className={styles.room} aria-hidden="true">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={hue}
          className={styles.wash}
          style={{
            opacity: 'var(--wash-opacity)',
            background: `
              radial-gradient(60% 50% at 20% 25%, ${hue}, transparent 70%),
              radial-gradient(45% 45% at 85% 70%, ${hue}, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </AnimatePresence>
      <div className={styles.grain} />
      <div className={styles.vignette} />
    </div>
  )
}
