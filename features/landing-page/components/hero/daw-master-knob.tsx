'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import styles from './daw-hero.module.css'

interface DawMasterKnobProps {
  label?: string
  defaultAngle?: number  // degrees, -140 to +140
}

export function DawMasterKnob({ label = 'MASTER', defaultAngle = 30 }: DawMasterKnobProps) {
  const [angle, setAngle] = useState(defaultAngle) // -140 (min) to +140 (max)
  const centerRef = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !centerRef.current) return
    const dx = e.clientX - centerRef.current.x
    const dy = e.clientY - centerRef.current.y
    const rawAngle = Math.atan2(dx, -dy) * (180 / Math.PI)
    setAngle(clamp(rawAngle, -140, 140))
  }, [])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Map angle (-140 to +140) to 0–100 display value
  const pct = Math.round(((angle + 140) / 280) * 100)

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Knob housing */}
      <div
        className={cn(
          'relative cursor-grab active:cursor-grabbing',
          'h-16 w-16 rounded-full',
          // Dark burgundy body like Console 1's master knob
          'bg-gradient-to-br from-[#4A1515] via-[#6B1F1F] to-[#3A0F0F]',
          'border-2 border-black/40',
          'shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_3px_rgba(0,0,0,0.3)]',
          // Not using styles.masterKnob here — applying via inline for accurate angle
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ transform: `rotate(${angle}deg)` }}
        aria-label={`${label} volume: ${pct}%`}
        role="slider"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Grip texture radial lines */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <div
            key={deg}
            className="absolute left-1/2 top-1/2 origin-bottom"
            style={{
              width: '1px',
              height: '28%',
              background: 'rgba(255,255,255,0.06)',
              transform: `rotate(${deg}deg) translateX(-50%) translateY(-100%)`,
              transformOrigin: '50% 100%',
            }}
          />
        ))}

        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[#8B2020] to-[#4A0F0F] border border-black/30 shadow-inner" />
        </div>

        {/* Position indicator line */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: '8%',
            width: '2px',
            height: '30%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.2))',
            borderRadius: '1px',
          }}
        />
      </div>

      {/* Arc indicators (like a hardware knob's printed scale) */}
      <div className="relative h-3 w-20">
        {/* Min / Max ticks */}
        <div className="absolute left-1 top-0 h-2 w-0.5 rotate-[-45deg] bg-black/30 dark:bg-white/20" />
        <div className="absolute right-1 top-0 h-2 w-0.5 rotate-[45deg] bg-black/30 dark:bg-white/20" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-2 w-0.5 bg-black/20 dark:bg-white/15" />
      </div>

      {/* Value readout */}
      <div className="font-mono text-[8px] tabular-nums text-black/40 dark:text-white/30">
        {pct}%
      </div>

      {/* Label */}
      <div className="font-mono text-[7px] tracking-[0.2em] text-black/40 dark:text-white/25 uppercase">
        {label}
      </div>
    </div>
  )
}
