import type { CSSProperties } from 'react'
import { ARRANGEMENT_CLIPS, ARRANGEMENT_LANES } from './arrangement-data'
import styles from './arrangement.module.css'

/** Empty tracks under the real ones, the way a project always has more. */
export const GHOST_TRACKS = 8

/**
 * The track-header column. Each header carries its lane's colour, number and
 * name; the lane's colour is its clip's colour, so the header and the clip it
 * heads are the same hue. Rows use the same heights and gap as the lanes, so
 * the two columns line up by construction.
 */
export function ArrangementRail() {
  const offset = ARRANGEMENT_LANES.length
  return (
    <div className={styles.rail} aria-hidden="true">
      {ARRANGEMENT_LANES.map((lane, index) => {
        const clip = ARRANGEMENT_CLIPS.find((item) => item.laneId === lane.id)
        return (
          <span
            key={lane.id}
            className={lane.height === 'tall' ? styles.railTall : ''}
            style={
              { '--lane-color': clip?.color ?? '#8e928e' } as CSSProperties
            }
          >
            <i className={styles.railLed} />
            <b>{String(index + 1).padStart(2, '0')}</b>
            <em>{lane.label}</em>
          </span>
        )
      })}
      {Array.from({ length: GHOST_TRACKS }, (_, index) => (
        <span key={index} className={styles.railGhost}>
          <b>{String(offset + index + 1).padStart(2, '0')}</b>
          <em>TRACK</em>
        </span>
      ))}
    </div>
  )
}
