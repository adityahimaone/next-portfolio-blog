'use client'

import { m } from 'motion/react'

interface SectionConnectorProps {
  from: string
  to: string
  color?: string
}

function PatchJack({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ boxShadow: 'var(--nm-inset)' }}
      >
        <div
          className="h-3 w-3 rounded-full"
          style={{ boxShadow: '0 0 6px var(--accent-cyan)' }}
        >
          <div className="h-full w-full rounded-full bg-[#00e5ff]/60" />
        </div>
      </div>
      <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-zinc-500 uppercase">
        {label}
      </span>
    </div>
  )
}

export function SectionConnector({
  from,
  to,
  color = '#00e5ff',
}: SectionConnectorProps) {
  return (
    <m.div
      initial={{ opacity: 0, scaleY: 0.8 }}
      whileInView={{ opacity: 1, scaleY: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="relative my-2 flex flex-col items-center gap-3 py-4"
    >
      {/* Top Jack */}
      <PatchJack label={from} />

      {/* Cable SVG */}
      <div className="relative h-16 w-px overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 4 64"
          preserveAspectRatio="none"
        >
          <line
            x1="2"
            y1="0"
            x2="2"
            y2="64"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-16"
              dur="1s"
              repeatCount="indefinite"
            />
          </line>

          {/* Traveling dot */}
          <circle r="2" fill={color} opacity="0.8">
            <animate
              attributeName="cy"
              from="-2"
              to="66"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0.8;0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        {/* Glow pulse */}
        <div
          className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 blur-md"
          style={{
            background: `radial-gradient(ellipse at center, ${color}40, transparent 70%)`,
          }}
        />
      </div>

      {/* Bottom Jack */}
      <PatchJack label={to} />
    </m.div>
  )
}
