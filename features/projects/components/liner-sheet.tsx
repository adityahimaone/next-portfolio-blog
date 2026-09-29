'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Github, X } from 'lucide-react'
import { Cover } from '@/components/booth/cover'
import type { WorkProject } from '@/data/projects'
import { trackLabel } from '@/data/projects'
import styles from '../crate.module.css'

interface LinerSheetProps {
  project: WorkProject | null
  index: number
  onClose: () => void
}

/**
 * The back of the album: tracklist of highlights, personnel, and the link
 * out. Optional by design — a project with no extra data simply has no
 * "Details" affordance and the sheet never opens.
 */
export function LinerSheet({ project, index, onClose }: LinerSheetProps) {
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
          className={styles.sheetBackdrop}
          role="presentation"
          onMouseDown={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`${styles.sheet} glass`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="liner-title"
            onMouseDown={(event) => event.stopPropagation()}
            initial={{ scale: 0.97, y: 14, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              className={styles.sheetClose}
              aria-label="Close liner notes"
            >
              <X size={18} />
            </button>

            <motion.div layoutId={`cover-${project.slug}`}>
              <div className={styles.sheetArt}>
                <Cover
                  seed={project.slug}
                  title={project.title}
                  src={project.cover}
                  sizes="(max-width: 720px) 70vw, 280px"
                />
              </div>
            </motion.div>

            <div>
              <p className={styles.sheetKicker}>
                {trackLabel(index)} · {project.genre} · {project.year}
              </p>
              <h2 className={styles.sheetTitle} id="liner-title">
                {project.title}
              </h2>
              <p className={styles.sheetDesc}>{project.description}</p>

              <h3 className={styles.sheetLabel}>Tracklist</h3>
              <ol className={styles.sheetList}>
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ol>

              <h3 className={styles.sheetLabel}>Personnel</h3>
              <p className={styles.sheetDesc}>{project.role}</p>
              <ul className={styles.chips}>
                {project.stack.map((tool) => (
                  <li key={tool} className={styles.chip}>
                    {tool}
                  </li>
                ))}
              </ul>

              <div className={styles.nsActions}>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.genre}
                  style={{ textDecoration: 'none' }}
                >
                  <ArrowUpRight size={14} aria-hidden="true" />
                  Open project
                </a>
                {project.url.includes('github.com') && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.genre}
                    style={{ textDecoration: 'none' }}
                  >
                    <Github size={14} aria-hidden="true" />
                    Source
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
