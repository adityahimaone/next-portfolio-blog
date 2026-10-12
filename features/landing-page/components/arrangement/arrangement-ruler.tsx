import type { CSSProperties } from 'react'
import { RULER_LABELS } from './arrangement-data'
import styles from './arrangement.module.css'

/**
 * The ruler — one component, used by the hero and by About.
 *
 * It sits **outside** the scaled camera, so it is the camera's sibling and reads
 * the same properties the clips do. Writing those properties on `.camera`
 * instead would leave this blind to them, and the ruler would print an unzoomed
 * scale across a zoomed arrangement — silently, with nothing thrown.
 *
 * `live` switches the ticks from the static overview rule to the camera's own
 * transform. There is no "re-render with fewer ticks" step: ticks that fall
 * outside the frame simply are outside it. What the quarter ticks add is the
 * opposite — the ruler shows *more* of its scale as you zoom in, which is what a
 * DAW does. They are always in the DOM and switched by the phase attribute, so
 * the reveal costs no render.
 */
export function ArrangementRuler({
  live = false,
  detail = false,
}: {
  live?: boolean
  detail?: boolean
}) {
  const last = RULER_LABELS.length - 1
  const quarters = Array.from({ length: last * 3 - 1 }, (_, index) => {
    const step = (index + 1) / 3
    return Number.isInteger(step) ? null : step / last
  }).filter((value): value is number => value !== null)

  return (
    <div
      className={`${styles.ruler} ${live ? styles.rulerLive : ''}`}
      aria-hidden="true"
      data-arr-ruler
    >
      {RULER_LABELS.map((label, index) => (
        <span
          key={label}
          className={`${styles.tick} ${index === last ? styles.tickLast : ''}`}
          style={{ '--tick': index / last } as CSSProperties}
        >
          {label}
        </span>
      ))}
      {detail ? (
        <span className={styles.rulerDetail}>
          {quarters.map((fraction, index) => (
            <i key={index} style={{ '--tick': fraction } as CSSProperties} />
          ))}
        </span>
      ) : null}
    </div>
  )
}
