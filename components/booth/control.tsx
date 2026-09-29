'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import styles from './control.module.css'

interface BoothControlProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Marks the single active state in a group — a lit pill, not a blur. */
  active?: boolean
  children: ReactNode
}

/**
 * The booth's control surface: chips, filters, small buttons.
 *
 * These intentionally use `--flat-fill` rather than `backdrop-filter`.
 * The spec allows two blurred layers per view, and a page with a filter row
 * would otherwise spend the entire budget on chips. They still read as the
 * same material because they are translucent with the same rim.
 */
export function BoothControl({
  active,
  children,
  className,
  ...props
}: BoothControlProps) {
  return (
    <button
      type="button"
      data-on={active || undefined}
      className={cn(styles.boothControl, className)}
      {...props}
    >
      {children}
    </button>
  )
}
