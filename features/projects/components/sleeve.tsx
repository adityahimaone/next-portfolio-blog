'use client'

import { Cover } from '@/features/booth/cover'
import { Record } from '@/features/booth/record'
import type { WorkProject } from '@/data/projects'
import { trackLabel } from '@/data/projects'
import styles from '../crate.module.css'

interface SleeveProps {
  project: WorkProject
  index: number
  active: boolean
  onPromote: () => void
}

/**
 * A 1:1 sleeve in the crate grid. Hovering lifts it and slides the record
 * out from behind; clicking promotes it into Now Spinning, so the common
 * path never needs a modal.
 *
 * A plain button, not a motion one: motion writes an inline `transform`,
 * which would win over the CSS hover lift and stop the sleeve moving.
 */
export function Sleeve({ project, index, active, onPromote }: SleeveProps) {
  const catalog = `AH-${String(index + 1).padStart(3, '0')}`

  return (
    <button
      type="button"
      onClick={onPromote}
      data-active={active || undefined}
      className={styles.sleeve}
      style={{ ['--sleeve-accent' as string]: project.palette.accent }}
      aria-label={`Play ${project.title}`}
    >
      <span className={styles.sleeveArtWrap}>
        <Record
          className={styles.sleevePeek}
          label={project.palette.b}
          position="absolute"
          spinning={active}
        />
        <Cover
          seed={project.slug}
          title={project.title}
          catalog={catalog}
          src={project.cover}
          sizes="(max-width: 640px) 45vw, (max-width: 1100px) 30vw, 18vw"
        />
        <span className={styles.sleeveTag}>{trackLabel(index)}</span>
      </span>
      <span className={styles.sleeveName}>{project.title}</span>
    </button>
  )
}
