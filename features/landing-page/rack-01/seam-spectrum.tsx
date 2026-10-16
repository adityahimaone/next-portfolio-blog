import type { CSSProperties } from 'react'
import { SEAM_COLUMNS } from './seam-frame'
import styles from './seam-spectrum.module.css'

/**
 * The wall of equaliser columns the Experience → Work seam is made of.
 *
 * It is a plain server-renderable component with no state and no effects: the
 * seam's timeline (`use-rack-animations.ts`) finds it by its `data-seam-*`
 * markers and writes every transform, so React never re-renders it while the
 * reader scrolls. It is `aria-hidden` end to end — it is a transition, and the
 * label inside it names a move the page is already making in words.
 *
 * It sits at the end of `<main>` and is `position: fixed`, which is what lets
 * the same wall cover the Experience section on the way in and the Work section
 * on the way out; living inside either would put it under the other.
 */
export function SeamSpectrum() {
  const columns = Array.from({ length: SEAM_COLUMNS }, (_, i) => i)
  return (
    <div
      className={styles.wall}
      data-seam-wall
      aria-hidden="true"
      style={{ '--n': SEAM_COLUMNS } as CSSProperties}
    >
      {columns.map((i) => (
        <i
          key={`col-${i}`}
          className={styles.col}
          data-seam-col
          style={{ '--i': i } as CSSProperties}
        />
      ))}
      {columns.map((i) => (
        <i
          key={`cap-${i}`}
          className={styles.cap}
          data-seam-cap
          style={{ '--i': i } as CSSProperties}
        />
      ))}
      <div className={styles.label} data-seam-label>
        <small>Signal locked</small>
        <strong>Selected work</strong>
      </div>
    </div>
  )
}
