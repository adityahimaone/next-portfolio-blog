'use client'

import { useRef } from 'react'
import {
  m as motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  MotionValue,
} from 'motion/react'

interface CableConnectorProps {
  /** Color of the cable body and LED indicators (hex). Default: '#1a1a1a' */
  color?: string
  /** Label for the output jack. Example: 'ABOUT' */
  fromLabel?: string
  /** Label for the input jack. Example: 'SKILLS' */
  toLabel?: string
  /** Disable scroll animation (for mobile). Renders a static cable. Default: false */
  disabled?: boolean
}

interface JackSocketProps {
  ledColor: string
  ledOpacity: MotionValue<number> | number
}

function JackSocket({ ledColor, ledOpacity }: JackSocketProps) {
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black/25 dark:border-white/10 bg-[var(--daw-chassis-deep)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
      <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-black/80 shadow-inner">
        <motion.div
          className="h-1 w-1 rounded-full"
          style={{
            backgroundColor: ledColor,
            opacity: ledOpacity,
            boxShadow: `0 0 6px ${ledColor}, 0 0 2px ${ledColor}`,
          }}
        />
      </div>
    </div>
  )
}

export function CableConnector({
  color = '#1a1a1a',
  fromLabel,
  toLabel,
  disabled = false,
}: CableConnectorProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Set up transforms unconditionally to follow the rules of React Hooks
  const rawDroop = useTransform(scrollYProgress, [0, 0.5, 1], [35, 8, 35])
  const rawCableOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.3, 1, 1, 0.3]
  )
  const rawLedOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.2, 1, 1, 0.2]
  )

  // Subtracted value for cubic bezier (120 - droop)
  const rawSubtracted = useTransform(rawDroop, (v) => 120 - v)

  // Dynamic template for motion path
  const dynamicPathD = useMotionTemplate`M 100 0 C 70 ${rawDroop}, 130 ${rawSubtracted}, 100 120`

  // Select values depending on disabled flag
  const cableOpacity = disabled ? 0.6 : rawCableOpacity
  const ledOpacity = disabled ? 0.5 : rawLedOpacity
  const staticPathD = 'M 100 0 C 70 25, 130 95, 100 120'
  const pathD = disabled ? staticPathD : dynamicPathD

  return (
    <div
      ref={ref}
      className="flex flex-col items-center py-2 select-none"
    >
      {/* Top Socket Label */}
      {fromLabel && (
        <span className="mb-1 font-mono text-[7px] font-bold tracking-widest text-black/30 dark:text-white/20 uppercase">
          {fromLabel} · OUT
        </span>
      )}

      {/* Top Jack Socket */}
      <JackSocket ledColor={color} ledOpacity={ledOpacity} />

      {/* SVG Cable */}
      <svg
        width={200}
        height={120}
        viewBox="0 0 200 120"
        className="overflow-visible my-1"
      >
        {/* Shadow Path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={7}
          strokeLinecap="round"
          style={{ opacity: cableOpacity }}
        />
        {/* Cable Body Path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          style={{ opacity: cableOpacity }}
        />
        {/* Highlight Path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={2}
          strokeLinecap="round"
          style={{ opacity: cableOpacity }}
        />
      </svg>

      {/* Bottom Jack Socket */}
      <JackSocket ledColor={color} ledOpacity={ledOpacity} />

      {/* Bottom Socket Label */}
      {toLabel && (
        <span className="mt-1 font-mono text-[7px] font-bold tracking-widest text-black/30 dark:text-white/20 uppercase">
          {toLabel} · IN
        </span>
      )}
    </div>
  )
}
