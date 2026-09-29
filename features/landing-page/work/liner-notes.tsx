'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { trackLabel } from '../constants'
import { lockScroll, unlockScroll } from '../lib/smooth-scroll'
import { LIBRARY_TRACKS, type LibraryTrack } from './library-data'
import { GlassPanel } from './glass-panel'
import styles from './work.module.css'

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

type LinerNotesProps = {
  project: LibraryTrack | null
  refract: boolean
  returnFocusTo: HTMLElement | null
  onClose: () => void
}

export function LinerNotes({
  project,
  refract,
  returnFocusTo,
  onClose,
}: LinerNotesProps) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!project) return

    lockScroll()

    // `overflow: hidden` alone does not stop Lenis, so the page would keep
    // scrolling behind the panel. lockScroll() handles both cases.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable =
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      unlockScroll()
    }
  }, [project, onClose])

  const handleClose = useCallback(() => {
    onClose()
    returnFocusTo?.focus()
  }, [onClose, returnFocusTo])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          className={styles.linerBackdrop}
          role="presentation"
          onMouseDown={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`liner-title-${project.id}`}
            onMouseDown={(event) => event.stopPropagation()}
            /* Modals are exempt from origin-aware scaling: they are centred in
               the viewport, not anchored to a trigger. */
            style={{ transformOrigin: 'center' }}
            initial={{
              opacity: 0,
              transform: 'translate3d(0, 16px, 0) scale(0.96)',
            }}
            animate={{ opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }}
            exit={{
              opacity: 0,
              transform: 'translate3d(0, 8px, 0) scale(0.98)',
            }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassPanel refract={refract} className={styles.liner}>
              <button
                type="button"
                className={styles.linerClose}
                onClick={handleClose}
                aria-label="Close liner notes"
              >
                <X size={17} strokeWidth={1.8} />
              </button>

              <div className={styles.linerArt}>
                <Image
                  src={project.cover}
                  alt={`${project.title} cover`}
                  fill
                  sizes="(max-width: 768px) 70vw, 360px"
                />
              </div>

              <div className={styles.linerBody}>
                <span className={styles.silkscreen}>
                  {trackLabel(
                    LIBRARY_TRACKS.findIndex((item) => item.id === project.id),
                  )}{' '}
                  · {project.album}
                </span>
                <h3 id={`liner-title-${project.id}`}>{project.title}</h3>
                <p>{project.description}</p>

                <h4>Tracklist</h4>
                <ol className={styles.linerList}>
                  {project.lyrics.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ol>

                <h4>Personnel</h4>
                <p className={styles.linerRole}>{project.role}</p>
                <ul className={styles.chips}>
                  {project.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.linerLink}
                >
                  Open project <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
