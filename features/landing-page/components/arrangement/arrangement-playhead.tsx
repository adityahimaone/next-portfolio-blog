import styles from './arrangement.module.css'

/**
 * The playhead — one instance per arrangement, and it is the seam's contract.
 *
 * Its position comes from a single custom property on the track area, so it
 * cannot drift from the ruler or the clips. Nothing resets or re-mounts it.
 */
export function ArrangementPlayhead() {
  return (
    <div
      className={styles.playhead}
      data-flight-source="playhead"
      aria-hidden="true"
    />
  )
}
