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
    <div className="relative mx-auto w-full max-w-5xl px-3 py-2 sm:px-4 sm:py-3">
      <div
        className="instrument-module mx-auto flex w-full max-w-none items-center gap-2 px-2 py-2 sm:gap-3 sm:px-3"
        role="img"
        aria-label={`${from} to ${to}: ${story}`}
      >
        <span className="instrument-screw shrink-0" aria-hidden="true" />
        <div className="hidden min-w-16 sm:block">
          <p className="instrument-label text-[10px] text-[var(--ko-route)]">
            source · 信号
          </p>
          <p className="mt-0.5 truncate font-mono text-[8px] font-bold tracking-[0.1em] text-[var(--daw-display-bg)] uppercase">
            {from}
          </p>
        </div>
        <div className="instrument-plate relative flex h-10 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[var(--ko-display-bg)] px-2 sm:h-11">
          <div className="pointer-events-none absolute inset-x-3 top-1/2 h-px bg-[var(--ko-accent)]/30" />
          <svg
            viewBox="0 0 180 48"
            className="relative h-full w-full overflow-visible"
          >
            <PatchCable
              from={{ x: 8, y: 24 }}
              to={{ x: 172, y: 24 }}
              color="var(--ko-accent)"
              taut
              animated
              thickness={2.5}
              ariaLabel={`${from} signal cable to ${to}`}
            />
          </svg>
          <span className="absolute bottom-0.5 left-1/2 max-w-[70%] -translate-x-1/2 truncate font-mono text-[6px] font-bold tracking-[0.12em] whitespace-nowrap text-white/55 uppercase">
            {story}
          </span>
        </div>
        <div className="min-w-16 text-right">
          <p className="instrument-label text-[10px] text-[var(--ko-led-green)]">
            destination · 出力
          </p>
          <p className="mt-0.5 truncate font-mono text-[8px] font-bold tracking-[0.1em] text-[var(--daw-display-bg)] uppercase">
            {to}
          </p>
        </div>
        <span className="instrument-screw shrink-0" aria-hidden="true" />
        <span
          className="led-glow hidden h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--daw-led-green)] sm:block"
          aria-hidden="true"
        />
      </div>
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
        stroke="var(--ko-key-dark)"
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
          stroke="var(--ko-accent-light)"
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
        fill="var(--ko-key-dark)"
        stroke="var(--ko-display-bg)"
        strokeWidth={1}
      />
      <circle
        cx={point.x}
        cy={point.y}
        r={5.5}
        fill="none"
        stroke="var(--ko-key-mid)"
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
