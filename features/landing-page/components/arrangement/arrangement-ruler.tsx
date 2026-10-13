import type { CSSProperties } from 'react'
import { ARRANGEMENT_BARS, RULER_LABELS } from './arrangement-data'
import styles from './arrangement.module.css'

/**
 * The ruler: two rows, the way a DAW's is. The top row carries the five stage
 * markers (flags on the timeline); the bottom row counts bars.
 *
 * It sits **outside** the scaled camera, so it is the camera's sibling and reads
 * the same properties the clips do. Writing those on `.camera` instead would
 * leave it blind to them and it would print an unzoomed scale across a zoomed
 * arrangement. The bar grid is one repeating gradient sized from the camera's
 * zoom, so it cannot drift from the lane grid under it.
 *
 * There is no `live` switch any more: every tick reads the camera's transform
 * directly, so the static overview rule it used to toggle away from is gone.
 */
export function ArrangementRuler() {
  const last = RULER_LABELS.length - 1
  return (
    <div className={styles.ruler} aria-hidden="true" data-arr-ruler>
      <span className={styles.rulerGrid} />
      {RULER_LABELS.map((label, index) => (
        <span
          key={label}
          className={`${styles.tick} ${index === last ? styles.tickLast : ''}`}
          style={{ '--tick': index / last } as CSSProperties}
        >
          {label}
        </span>
      ))}
      {Array.from({ length: ARRANGEMENT_BARS }, (_, index) => (
        <span
          key={index}
          className={styles.barNum}
          style={{ '--tick': index / ARRANGEMENT_BARS } as CSSProperties}
        >
          {index + 1}
        </span>
      ))}
      <span className={styles.rulerCorner}>SNAP · BAR</span>
    </div>
  )
}
