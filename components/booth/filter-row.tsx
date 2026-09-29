'use client'

import type { ReactNode } from 'react'
import styles from './filter-row.module.css'

export interface FilterOption {
  /** The value compared against; also the accessible name unless given. */
  value: string
  label: string
  /** Optional count rendered in silkscreen after the label. */
  count?: number
}

interface FilterRowProps {
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  /** Rendered before the options — a search field, say. */
  leading?: ReactNode
}

/**
 * The category filter row, shared by /blog, /projects and /bookmarks.
 *
 * These three rows were separate implementations that had drifted apart: the
 * blog chips carried a border and a background the projects genre buttons did
 * not, and the bookmarks chips used a different radius again. They are one
 * control, so they are now one component — the radius in particular comes from
 * a single `--booth-r-filter` token rather than three hand-picked values.
 *
 * The active state is a lit fill, matching `.booth-control[data-on]`, so a
 * selected filter reads the same on every page. `aria-pressed` carries it for
 * assistive tech; the fill is not the only signal, since the label stays put
 * and only the fill changes.
 */
export function FilterRow({
  label,
  options,
  value,
  onChange,
  leading,
}: FilterRowProps) {
  return (
    <div className={styles.row} role="group" aria-label={label}>
      {leading}
      <div className={styles.scroller}>
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? '' : option.value)}
              className={styles.chip}
              data-on={active || undefined}
            >
              {option.label}
              {option.count != null && (
                <span className={styles.count}>{option.count}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
