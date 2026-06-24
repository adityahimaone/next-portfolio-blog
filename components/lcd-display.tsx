'use client'

import { cn } from '@/lib/utils'

interface LCDDisplayProps {
  variant?: 'green' | 'amber' | 'blue'
  label?: string
  children: React.ReactNode
  className?: string
}

const variantConfig = {
  green: {
    text: '#4ade80',
    bg: 'rgba(74,222,128,0.03)',
    glow: 'rgba(74,222,128,0.05)',
  },
  amber: {
    text: '#fbbf24',
    bg: 'rgba(251,191,36,0.03)',
    glow: 'rgba(251,191,36,0.05)',
  },
  blue: {
    text: '#60a5fa',
    bg: 'rgba(96,165,250,0.03)',
    glow: 'rgba(96,165,250,0.05)',
  },
} as const

export function LCDDisplay({
  variant = 'green',
  label,
  children,
  className,
}: LCDDisplayProps) {
  const config = variantConfig[variant]

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <span className="mb-1.5 pl-1 font-mono text-[9px] tracking-[0.2em] text-zinc-500 uppercase">
          {label}
        </span>
      )}

      {/* LCD bezel */}
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
        {/* LCD screen */}
        <div
          className="relative rounded-md p-4 md:p-6"
          style={
            {
              '--lcd-text': config.text,
              color: 'var(--lcd-text)',
              backgroundColor: config.bg,
              boxShadow: `inset 0 0 30px ${config.glow}`,
            } as React.CSSProperties
          }
        >
          {children}
        </div>

        {/* Scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-lg opacity-60"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
          }}
        />
      </div>
    </div>
  )
}
