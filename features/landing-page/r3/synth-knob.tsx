'use client'

/**
 * Ravemped 4.0 — Hardware-style rotary knob.
 *
 * Drag vertical (up = +, down = −) to change the value.
 * Clamp to [min, max]. Emits onChange continuously while dragging.
 * Visual: deep-radial-gradient cap with a pointer line + glow ring.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface SynthKnobProps {
  label: string
  value: number
  min?: number
  max?: number
  /** Pixel sensitivity — px of drag per full sweep. Default 160. */
  sensitivity?: number
  /** Display formatter for the readout (default rounds × 100). */
  format?: (v: number) => string
  /** r3 token color for the indicator ring. */
  accent?: string
  size?: 'sm' | 'md' | 'lg'
  onChange: (v: number) => void
}

export function SynthKnob({
  label,
  value,
  min = 0,
  max = 1,
  sensitivity = 160,
  format,
  accent = 'var(--r3-signal)',
  size = 'md',
  onChange,
}: SynthKnobProps) {
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null)

  const range = max - min
  const norm = Math.max(0, Math.min(1, (value - min) / range))
  // -135deg to +135deg sweep (270° usable)
  const angle = -135 + norm * 270

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      dragRef.current = { startY: e.clientY, startVal: value }
      setDragging(true)
    },
    [value],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return
      const dy = dragRef.current.startY - e.clientY
      const next = dragRef.current.startVal + (dy / sensitivity) * range
      onChange(Math.max(min, Math.min(max, next)))
    },
    [max, min, onChange, range, sensitivity],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    dragRef.current = null
    setDragging(false)
  }, [])

  // Wheel adjustment for desktop precision
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const step = range * 0.02 * (e.deltaY < 0 ? 1 : -1)
      onChange(Math.max(min, Math.min(max, value + step)))
    },
    [max, min, onChange, range, value],
  )

  // Keyboard for a11y
  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? range * 0.1 : range * 0.02
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault()
        onChange(Math.min(max, value + step))
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault()
        onChange(Math.max(min, value - step))
      } else if (e.key === 'Home') {
        e.preventDefault()
        onChange(min)
      } else if (e.key === 'End') {
        e.preventDefault()
        onChange(max)
      }
    },
    [max, min, onChange, range, value],
  )

  const dim = size === 'sm' ? 44 : size === 'lg' ? 80 : 60
  const readout = format ? format(value) : Math.round(norm * 100).toString().padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={readout}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onKeyDown={onKey}
        className={cn(
          'relative cursor-grab touch-none rounded-full outline-none transition-shadow',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--r3-console)]',
          dragging && 'cursor-grabbing',
        )}
        style={{
          width: dim,
          height: dim,
          background:
            'radial-gradient(circle at 30% 30%, #2a2a40 0%, #15151f 55%, #0a0a14 100%)',
          boxShadow: dragging
            ? `0 0 0 1px ${accent}, 0 0 14px ${accent}55, inset 0 -4px 6px rgba(0,0,0,0.6)`
            : `0 0 0 1px var(--r3-edge), inset 0 -4px 6px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Tick ring */}
        <svg
          className="absolute inset-0 pointer-events-none"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="var(--r3-edge)"
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity="0.5"
          />
          {/* Active arc */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${norm * 207} 999`}
            transform="rotate(135 50 50)"
            opacity="0.7"
          />
        </svg>
        {/* Indicator pointer */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{
            width: 2,
            height: dim * 0.42,
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            transformOrigin: '50% 100%',
            background: `linear-gradient(to top, ${accent}, ${accent}66)`,
            boxShadow: `0 0 6px ${accent}88`,
          }}
        />
        {/* Center cap */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: dim * 0.22,
            height: dim * 0.22,
            background: 'radial-gradient(circle, #1a1a28 0%, #0a0a14 100%)',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)',
          }}
        />
      </div>
      <div className="flex flex-col items-center">
        <span
          className="r3-mono text-[10px] tabular-nums text-[var(--r3-text)] leading-none"
          style={{ textShadow: dragging ? `0 0 6px ${accent}` : undefined }}
        >
          {readout}
        </span>
        <span className="r3-label text-[8px] mt-0.5">{label}</span>
      </div>
    </div>
  )
}
