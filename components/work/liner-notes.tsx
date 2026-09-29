'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, X } from 'lucide-react'
import { trackLabel, type WorkProject } from '@/data/projects'
import { GlassPanel } from './glass-panel'
import styles from './work.module.css'

interface LinerNotesProps {
  project: WorkProject | null
  index: number
  onClose: () => void
}

/** The back of the album: tracklist, personnel, and the way out. */
export function LinerNotes({ project, index, onClose }: LinerNotesProps) {
  useEffect(() => {
    if (!project) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className={styles.linerBackdrop}
          role="presentation"
          onMouseDown={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="liner-title"
            onMouseDown={(event) => event.stopPropagation()}
            initial={{ scale: 0.96, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
          >
            <GlassPanel className={styles.liner}>
              <button
                type="button"
                className={styles.linerClose}
                onClick={onClose}
                aria-label="Close liner notes"
              >
                <X size={17} strokeWidth={1.8} />
              </button>

              <motion.div layoutId={`work-cover-${project.slug}`}>
                <div className={styles.linerArt}>
                  <Image
                    src={project.cover}
                    alt={`${project.title} cover`}
                    fill
                    sizes="(max-width: 768px) 70vw, 360px"
                  />
                </div>
              </motion.div>

              <div>
                <span className={styles.linerKicker}>
                  {trackLabel(index)} · {project.genre} · {project.year}
                </span>
                <h3 className={styles.linerTitle} id="liner-title">
                  {project.title}
                </h3>
                <p className={styles.linerDesc}>{project.description}</p>

                <h4 className={styles.linerLabel}>Tracklist</h4>
                <ol className={styles.linerList}>
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ol>

                <h4 className={styles.linerLabel}>Personnel</h4>
                <p className={styles.linerRole}>{project.role}</p>
                <ul className={styles.chips}>
                  {project.stack.map((tool) => (
                    <li key={tool} className={styles.chip}>
                      {tool}
                    </li>
                  ))}
                </ul>

                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.npLink}
                >
                  Open project
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
