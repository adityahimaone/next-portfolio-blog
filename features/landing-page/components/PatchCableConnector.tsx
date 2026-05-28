'use client'

import { useRef } from 'react'
import { m, useInView } from 'motion/react'

interface PatchCableProps {
  color?: string
  thickness?: number
  curveDirection?: 'down' | 'up'
  label?: string
  className?: string
}

/**
 * PatchCableConnector — SVG cable that draws itself on scroll.
 * Connects one section to the next, like a studio patch cable.
 */
export function PatchCableConnector({
  color = '#FF5500',
  thickness = 3,
  curveDirection = 'down',
  label,
  className = '',
}: PatchCableProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const h = 80
  const viewBox = `0 0 100 ${h}`

  // Bezier curve: left to right with a droop/rise
  const curveOffset = curveDirection === 'down' ? 40 : -40
  const path = `M 10,5 C 10,${h / 2 + curveOffset} 90,${h / 2 + curveOffset} 90,${h - 5}`

  return (
    <div
      ref={ref}
      className={`pointer-events-none relative flex w-full items-center justify-center py-2 ${className}`}
    >
      <svg
        viewBox={viewBox}
        className="h-16 w-full max-w-md"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        {/* Cable shadow */}
        <m.path
          d={path}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={thickness + 1}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{ translate: '1px 1px' }}
        />
        {/* Main cable */}
        <m.path
          d={path}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
        {/* Cable sheen highlight */}
        <m.path
          d={path}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.1 }}
          style={{ translate: '-0.5px -0.5px' }}
        />

        {/* Plug left */}
        <m.rect
          x={5}
          y={0}
          width={10}
          height={10}
          rx={2}
          fill="#333"
          stroke={color}
          strokeWidth={1}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3 }}
        />
        {/* Plug right */}
        <m.rect
          x={85}
          y={h - 10}
          width={10}
          height={10}
          rx={2}
          fill="#333"
          stroke={color}
          strokeWidth={1}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.9 }}
        />
      </svg>

      {/* Optional label */}
      {label && (
        <m.span
          className="absolute -top-1 text-[8px] font-bold tracking-[0.2em]"
          style={{
            color: 'rgba(255,255,255,0.2)',
            fontFamily: 'var(--sc-font-mono)',
          }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6 }}
        >
          {label}
        </m.span>
      )}
    </div>
  )
}
