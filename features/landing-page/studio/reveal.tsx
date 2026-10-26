'use client'

import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import styles from './studio.module.css'
import { useInView } from './use-in-view'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

/**
 * One reveal for the whole page: a short rise out of the paper, never a scale
 * from nothing. The visible state is the default; only elements below the fold
 * are armed and hidden. Reduced motion, a failed hydration and a no-JS read all
 * get the finished page.
 */
export function Reveal({ children, className, delay = 0, y = 26 }: Props) {
  const { ref, armed, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn(styles.reveal, className)}
      data-armed={armed}
      data-shown={inView}
      style={
        {
          '--reveal-y': `${y}px`,
          '--reveal-delay': `${delay}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

/** A line that rises out of a mask, for headings that deserve their own beat. */
export function RevealLine({
  children,
  className,
  delay = 0,
}: Omit<Props, 'y' | 'once'>) {
  const { ref, armed, inView } = useInView<HTMLSpanElement>()

  return (
    <span
      ref={ref}
      className={styles.revealLine}
      data-armed={armed}
      data-shown={inView}
    >
      <span
        className={cn(styles.revealLineInner, className)}
        style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
      >
        {children}
      </span>
    </span>
  )
}
