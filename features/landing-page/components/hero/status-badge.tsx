'use client'

import { cn } from '@/lib/utils'
import styles from './hero.module.css'

interface StatusBadgeProps {
  label: string
  color?: 'green' | 'amber' | 'cyan' | 'rose' | 'brand'
  className?: string
}

const colorMap = {
  green: { bg: 'bg-emerald-500', text: 'text-emerald-500' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-500' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-500' },
  brand: { bg: 'bg-primary', text: 'text-primary' },
}

export function StatusBadge({
  label,
  color = 'brand',
  className,
}: StatusBadgeProps) {
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm',
        'border-graphite/25 bg-bone-white/80 dark:border-graphite/45 dark:bg-void/70',
        className,
      )}
    >
      <div
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          colors.bg,
          colors.text,
          styles.ledPulse,
        )}
      />
      <span className="text-slate dark:text-ash/70 font-[family-name:var(--font-whyte-inktrap-mono)] text-[10px] font-medium tracking-widest uppercase">
        {label}
      </span>
    </div>
  )
}
