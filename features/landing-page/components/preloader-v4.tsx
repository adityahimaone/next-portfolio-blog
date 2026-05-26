'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export function PreloaderV4() {
  const [phase, setPhase] = useState<'title' | 'subtitle' | 'line' | 'done'>(
    'title'
  )
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // 200ms: title fade in
    const titleTimer = setTimeout(() => setPhase('subtitle'), 200)
    // 600ms: subtitle fade in
    const subtitleTimer = setTimeout(() => setPhase('line'), 600)
    // 900ms: line extends
    const lineTimer = setTimeout(() => setPhase('done'), 900)
    // 1200ms: fade out entire preloader
    const fadeTimer = setTimeout(() => setIsVisible(false), 1200)

    return () => {
      clearTimeout(titleTimer)
      clearTimeout(subtitleTimer)
      clearTimeout(lineTimer)
      clearTimeout(fadeTimer)
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
          style={{ backgroundColor: 'var(--color-ink)' }}
        >
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === 'title' || phase === 'subtitle' || phase === 'line' || phase === 'done' ? 1 : 0,
              y: 0,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="font-display text-center"
            style={{
              fontSize: '52px',
              color: 'var(--color-off-white)',
              letterSpacing: '-0.009em',
            }}
          >
            ADITYA HIMAONE
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: phase === 'subtitle' || phase === 'line' || phase === 'done' ? 1 : 0,
              y: phase === 'subtitle' || phase === 'line' || phase === 'done' ? 0 : 8,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="font-ui mt-4"
            style={{
              fontSize: '12px',
              color: 'var(--color-off-white)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            Frontend Developer
          </motion.p>

          {/* Horizontal line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{
              scaleX: phase === 'line' || phase === 'done' ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mt-6 origin-center"
            style={{
              width: '120px',
              height: '1px',
              backgroundColor: 'var(--color-off-white)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
