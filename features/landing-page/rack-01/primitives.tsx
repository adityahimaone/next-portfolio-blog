'use client'

import styles from './rack-01.module.css'

/**
 * Small shared parts of the rack: the printed labels, the LED readouts
 * and the rotary control. They are not sections of their own — they exist to
 * be composed into Hero, Skills and Experience.
 */

export function SilkscreenLabel({ children }: { children: React.ReactNode }) {
  return <span className={styles.silkscreen}>{children}</span>
}

export function SegmentCounter({ value }: { value: string }) {
  return (
    <div className={`${styles.silkscreen} ${styles.segmentCounter}`}>
      {value}
    </div>
  )
}

export function VenLogo() {
  return (
    <svg
      className={styles.venLogo}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Aditya Himawan loading mark"
    >
      <defs>
        <clipPath id="ven-disc">
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <linearGradient id="ven-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity=".8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity=".16" />
        </linearGradient>
      </defs>
      <g clipPath="url(#ven-disc)">
        {Array.from({ length: 9 }, (_, index) => (
          <rect
            className={styles.venSlat}
            key={index}
            x="-2"
            y={index * 7.11}
            width="68"
            height="7.11"
            style={{ '--i': index } as React.CSSProperties}
          />
        ))}
      </g>
    </svg>
  )
}

export function Knob({
  color,
  label,
  value,
  onChange,
}: {
  color: string
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const rotation = -125 + value * 2.5

  return (
    <div className={styles.knobControl}>
      <div className={styles.knobScale} aria-hidden="true" />
      <button
        type="button"
        data-skill-sequence="param"
        className={styles.knob}
        style={{ '--knob-color': color } as React.CSSProperties}
        aria-label={`${label}: ${value}. Press to increase`}
        onClick={() => onChange(value >= 100 ? 0 : value + 10)}
      >
        <span
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
      </button>
      <SilkscreenLabel>{label}</SilkscreenLabel>
    </div>
  )
}
