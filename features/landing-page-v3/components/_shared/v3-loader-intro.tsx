'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'

/**
 * V3LoaderIntro — cinematic intro overlay (max 2.4s).
 * Fades to reveal hero. Skipped if user has prefers-reduced-motion.
 */
export function V3LoaderIntro() {
  const [show, setShow] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduced) {
      setShow(false)
      return
    }

    const total = 2400
    const start = performance.now()
    let raf = 0

    const tick = (t: number) => {
      const elapsed = t - start
      const p = Math.min(elapsed / total, 1)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else {
        // Hold for a tick then fade out
        setTimeout(() => setShow(false), 220)
      }
    }
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: 'var(--v3-void)' }}
        >
          {/* Counter */}
          <div className="absolute right-6 bottom-8 left-6 flex items-end justify-between md:right-12 md:bottom-12 md:left-12">
            <div>
              <div
                className="v3-mono"
                style={{ color: 'var(--v3-fg-muted)' }}
              >
                LOADING SCENE
              </div>
              <div
                className="v3-display-sans mt-2 text-5xl md:text-7xl"
                style={{ color: 'var(--v3-paper)' }}
              >
                {String(Math.floor(progress * 100)).padStart(3, '0')}
              </div>
            </div>
            <div className="text-right">
              <div
                className="v3-mono"
                style={{ color: 'var(--v3-fg-muted)' }}
              >
                PORTFOLIO 2026
              </div>
              <div
                className="v3-mono mt-2"
                style={{ color: 'var(--v3-paper)' }}
              >
                V3 / SPATIAL
              </div>
            </div>
          </div>

          {/* Center: signature */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-center"
          >
            <div
              className="v3-mono"
              style={{ color: 'var(--v3-iris-2)' }}
            >
              AH-026
            </div>
            <div
              className="v3-display mt-3 text-4xl md:text-6xl"
              style={{ color: 'var(--v3-paper)' }}
            >
              Aditya
              <span className="v3-iris-text"> Himaone</span>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div
            className="absolute right-6 bottom-0 left-6 h-px md:right-12 md:left-12"
            style={{ background: 'var(--v3-fog)' }}
          >
            <motion.div
              className="h-full"
              style={{
                background:
                  'linear-gradient(to right, var(--v3-iris-1), var(--v3-iris-2), var(--v3-iris-3))',
                width: `${progress * 100}%`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default V3LoaderIntro
