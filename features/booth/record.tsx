'use client'

import styles from './record.module.css'

interface RecordProps {
  /** Disc label colour. Falls back to the signal channel. */
  label?: string
  className?: string
  /**
   * How the disc is placed by its container. `absolute` layers it over a
   * cover, `flow` lets it take part in layout.
   *
   * This is an explicit prop rather than something the container's stylesheet
   * is expected to override. The base `.record` rule ships in the shared layout
   * bundle while every override lives in a page's CSS module, so relying on
   * stylesheet order meant `position: relative` silently won and the disc
   * dropped below the cover instead of layering over it.
   */
  position?: 'absolute' | 'flow'
  /** Adds the slow rotation used while the record is "playing". */
  spinning?: boolean
  style?: React.CSSProperties
}

/**
 * The CSS record, drawn rather than imaged so it costs nothing and can take a
 * label colour from the active project's palette.
 */
export function Record({
  label,
  className,
  position = 'flow',
  spinning = false,
  style,
}: RecordProps) {
  return (
    <div
      className={`${styles.record} ${className ?? ''}`}
      data-position={position}
      data-spinning={spinning || undefined}
      style={{ ['--record-label' as string]: label, ...style }}
      aria-hidden="true"
    >
      <span className={styles.grooves} />
      <span className={styles.label} />
      <span className={styles.spindle} />
    </div>
  )
}
