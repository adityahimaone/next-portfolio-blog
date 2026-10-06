'use client'

import { useRef } from 'react'

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
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const rotation = -125 + value * 2.5
  const draggingRef = useRef(false)
  const draggedRef = useRef(false)
  const dragStartY = useRef(0)
  const dragStartValue = useRef(0)

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggingRef.current = true
    draggedRef.current = false
    dragStartY.current = e.clientY
    dragStartValue.current = value
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return
    const delta = dragStartY.current - e.clientY
    if (Math.abs(delta) > 4) draggedRef.current = true
    const next = Math.max(
      0,
      Math.min(100, Math.round(dragStartValue.current + delta * 0.75)),
    )
    if (next !== value) onChange(next)
  }

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (draggingRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* The capture is already gone on cancel. */
      }
    }
    draggingRef.current = false
  }

  return (
    <div className={styles.knobControl}>
      <div className={styles.knobScale} aria-hidden="true" />
      <button
        type="button"
        data-skill-sequence="param"
        className={styles.knob}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${value}%`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={() => {
          /* A drag always ends in a click. Only a press that never
             travelled steps the value, so dragging to a position
             never bumps it again afterwards. */
          if (draggedRef.current) {
            draggedRef.current = false
            return
          }
          onChange(value >= 100 ? 0 : value + 10)
        }}
        onKeyDown={(e) => {
          const step = (delta: number) =>
            onChange(Math.max(0, Math.min(100, value + delta)))
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault()
            step(5)
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault()
            step(-5)
          } else if (e.key === 'Home') {
            e.preventDefault()
            onChange(0)
          } else if (e.key === 'End') {
            e.preventDefault()
            onChange(100)
          }
        }}
      >
        <span
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
      </button>
      <SilkscreenLabel>{label}</SilkscreenLabel>
    </div>
  )
}
