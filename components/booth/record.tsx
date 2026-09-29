'use client'

import styles from './record.module.css'

interface RecordProps {
  /** Disc label colour. Falls back to the signal channel. */
  label?: string
  className?: string
  /** Adds the slow rotation used while the record is "playing". */
  spinning?: boolean
  style?: React.CSSProperties
}

/**
 * The CSS record, drawn rather than imaged so it costs nothing and can take
 * a label colour from the active project's palette.
 */
export function Record({
  label,
  className,
  spinning = false,
  style,
}: RecordProps) {
  return (
    <div
      className={`${styles.record} ${className ?? ''}`}
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
