import styles from './arrangement.module.css'

/**
 * The playhead — one instance per arrangement, and it is the seam's contract.
 *
 * Its position comes from a single custom property on the track area, so it
 * cannot drift from the ruler or the clips: all three read the same numbers.
 * Nothing here resets or re-mounts it, because any code that did would destroy
 * the illusion that both zoom levels are one timeline.
 */
export function ArrangementPlayhead() {
  return <div className={styles.playhead} aria-hidden="true" />
}
