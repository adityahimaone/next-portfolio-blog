'use client'

import { useId } from 'react'

type Point = { x: number; y: number }

interface PatchCableProps {
  from: Point
  to: Point
  /** Signal color — defaults to an indigo-to-cyan gradient if omitted. */
  color?: string
  /** Draw a straight cable instead of a sagging curve. */
  taut?: boolean
  /** Show the animated signal-flow dash. */
  animated?: boolean
  /** Thickness of the cable body in px. */
  thickness?: number
  className?: string
  ariaLabel?: string
}

interface StudioSignalConnectorProps {
  from: string
  to: string
  story: string
}

/**
 * A modular-synth patch cable used as the visual bridge between sections.
 * The wrapper keeps the existing section connector API while the cable itself
 * remains reusable for other SVG-based signal paths.
 */
export function StudioSignalConnector({
  from,
  to,
  story,
}: StudioSignalConnectorProps) {
  return (
    <div className="mx-auto flex h-36 w-full items-center justify-center py-4 sm:h-44 sm:py-6">
      <svg
        viewBox="0 0 48 160"
        className="h-full w-16 overflow-visible sm:w-20"
        role="img"
        aria-label={`${from} to ${to}: ${story}`}
      >
        <PatchCable
          from={{ x: 24, y: 8 }}
          to={{ x: 24, y: 152 }}
          color="#c9a447"
          animated
          thickness={3}
          className="transition-opacity duration-300"
        />
      </svg>
    </div>
  )
}

export function PatchCable({
  from,
  to,
  color,
  taut = false,
  animated = true,
  thickness = 3,
  className = '',
  ariaLabel,
}: PatchCableProps) {
  const id = useId().replace(/:/g, '')
  const gradId = `patch-gradient-${id}`
  const glowId = `patch-glow-${id}`
  const sheenId = `patch-sheen-${id}`

  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.hypot(dx, dy)
  const sag = taut ? 0 : Math.min(60, dist * 0.35)
  const c1 = { x: from.x + dx * 0.3, y: from.y + dy * 0.3 + sag }
  const c2 = { x: from.x + dx * 0.7, y: from.y + dy * 0.7 + sag }
  const path = `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`
  const stroke = color ? color : `url(#${gradId})`
  const endpointColor = color ?? '#818CF8'

  return (
    <g className={className} aria-label={ariaLabel}>
      <defs>
        {!color && (
          <linearGradient
            id={gradId}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        )}
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={thickness + 5}
        strokeLinecap="round"
        opacity={0.25}
        filter={`url(#${glowId})`}
      />
      <path
        d={path}
        fill="none"
        stroke="#1e1e24"
        strokeWidth={thickness + 2}
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={thickness}
        strokeLinecap="round"
      />

      {animated && (
        <path
          d={path}
          fill="none"
          stroke="#ffffff"
          strokeWidth={Math.max(1, thickness - 1.5)}
          strokeLinecap="round"
          className="patchcable-flow"
          strokeDasharray="2 14"
          opacity={0.85}
          style={{ animation: 'patchcable-flow 1.1s linear infinite' }}
        />
      )}

      <JackEnd point={from} color={endpointColor} sheenId={sheenId} />
      <JackEnd point={to} color={color ?? '#22D3EE'} sheenId={sheenId} />

      <style>{`
        @keyframes patchcable-flow {
          from { stroke-dashoffset: 16; }
          to { stroke-dashoffset: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .patchcable-flow { animation: none !important; }
        }
      `}</style>
    </g>
  )
}

function JackEnd({
  point,
  color,
  sheenId,
}: {
  point: Point
  color: string
  sheenId: string
}) {
  return (
    <g>
      <circle
        cx={point.x}
        cy={point.y}
        r={7}
        fill="#2a2a30"
        stroke="#0d0d10"
        strokeWidth={1}
      />
      <circle
        cx={point.x}
        cy={point.y}
        r={5.5}
        fill="none"
        stroke="#c9cad0"
        strokeWidth={1.2}
      />
      <circle cx={point.x} cy={point.y} r={3} fill={color} />
      <circle
        cx={point.x}
        cy={point.y}
        r={3}
        fill={`url(#${sheenId})`}
        opacity={0.5}
      />
    </g>
  )
}
