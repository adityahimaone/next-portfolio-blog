'use client'

import type { ReactNode } from 'react'
import styles from './booth.module.css'

interface PageHeaderProps {
  /** Rack section index, e.g. `02`. */
  index: string
  eyebrow: string
  title: string
  description?: string
  /** Right-hand mono readouts: counts, side labels, actions. */
  hint?: ReactNode
}

/**
 * The rack's section heading, extracted so every booth page speaks the same
 * opening line as the landing page.
 */
export function PageHeader({
  index,
  eyebrow,
  title,
  description,
  hint,
}: PageHeaderProps) {
  return (
    <header className={styles.headRow}>
      <div>
        <div className={styles.headRule} />
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowIndex}>{index}</span>
          <span>{eyebrow}</span>
        </p>
        <h1 className={styles.headTitle}>{title}</h1>
        {description && <p className={styles.headSub}>{description}</p>}
      </div>
      {hint && <div className={styles.headHint}>{hint}</div>}
    </header>
  )
}
