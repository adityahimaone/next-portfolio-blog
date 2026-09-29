'use client'

import { useId } from 'react'
import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import styles from './scan-loader.module.css'

type ScanLoaderProps = {
  className?: string
  /**
   * Multiplies every duration. The packets are deliberately out of phase with
   * one another, so the whole disc never pulses in lockstep.
   */
  rate?: number
  label?: string
}

/**
 * A circular buffer being rewritten in place: rule lines, a few packets
 * running across them, and a sweep that drifts down the disc.
 *
 * The animation lives in a CSS module rather than an inline `<style>` so the
 * keyframes are namespaced and cannot leak. Ink and rate are the only knobs —
 * colour comes from `currentColor`, so light and dark need no separate branch.
 */
export function ScanLoader({
  className,
  rate = 1,
  label = 'Loading',
}: ScanLoaderProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const clipId = `scan-disc-${uid}`
  const sweepId = `scan-sweep-${uid}`

  // Every packet is snapped to the rule grid (4px rows) so the run reads as
  // one buffer line being rewritten, not as random motion.
  const packets = [
    { y: 8, width: 14.08, dur: '1.9s', delay: '-0.2s', dir: 1 },
    { y: 16, width: 9.6, dur: '2.6s', delay: '-1.4s', dir: 1 },
    { y: 24, width: 19.2, dur: '2.2s', delay: '-0.7s', dir: -1 },
    { y: 32, width: 7.68, dur: '1.6s', delay: '-1.1s', dir: 1 },
    { y: 40, width: 16.64, dur: '2.9s', delay: '-2s', dir: 1 },
    { y: 44, width: 10.88, dur: '2.1s', delay: '-0.4s', dir: -1 },
    { y: 52, width: 12.8, dur: '2.4s', delay: '-1.7s', dir: 1 },
  ] as const

  return (
    <svg
      className={cn(styles.scan, className)}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={label}
      style={{ '--rate': rate } as CSSProperties}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <linearGradient id={sweepId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: 17 }, (_, index) => (
          <line
            key={index}
            className={styles.rule}
            x1="0"
            y1={index * 4}
            x2="64"
            y2={index * 4}
          />
        ))}

        {packets.map((packet) => (
          <rect
            key={packet.y}
            className={styles.packet}
            x="0"
            y={packet.y}
            width={packet.width}
            height="3.28"
            rx="0.6"
            style={
              {
                '--dur': packet.dur,
                '--delay': packet.delay,
                '--dir': packet.dir,
              } as CSSProperties
            }
          />
        ))}

        <rect
          className={styles.glow}
          x="0"
          y="-32"
          width="64"
          height="128"
          fill={`url(#${sweepId})`}
        />
      </g>
    </svg>
  )
}
