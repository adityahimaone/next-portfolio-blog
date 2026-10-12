import { ARRANGEMENT_LANES } from './arrangement-data'
import styles from './arrangement.module.css'

/**
 * The lane rail — the track-header column.
 *
 * Hidden until the rail reveal, then slid in from the left edge. That is the
 * DAW's own idiom: you always zoom with the rail present, and revealing it is
 * what turns a rectangle into a track.
 *
 * Its rows use the same heights and the same gap as the lanes, so the two
 * columns line up by construction rather than by two numbers agreeing.
 */
export function ArrangementRail() {
  return (
    <div className={styles.rail} aria-hidden="true">
      {ARRANGEMENT_LANES.map((lane) => (
        <span key={lane.id}>{lane.label}</span>
      ))}
    </div>
  )
}
