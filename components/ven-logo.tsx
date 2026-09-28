'use client'

import { useId } from 'react'
import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import styles from './ven-logo.module.css'

export function VenLogo({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const clipId = `ven-disc-${uid}`
  const faceId = `ven-face-${uid}`

  return (
    <svg
      className={cn(styles.venLogo, className)}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="AH Studio"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <linearGradient id={faceId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: 9 }, (_, index) => (
          <rect
            key={index}
            className={styles.venSlat}
            x="-2"
            y={index * 7.11}
            width="68"
            height="7.11"
            style={
              {
                '--i': index,
                fill: `url(#${faceId})`,
              } as CSSProperties
            }
          />
        ))}
      </g>
    </svg>
  )
}
