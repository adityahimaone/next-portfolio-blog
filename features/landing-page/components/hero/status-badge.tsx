'use client'

import { cn } from '@/lib/utils'
import styles from './hero.module.css'

interface StatusBadgeProps {
  label: string
  color?: 'green' | 'amber' | 'cyan' | 'rose'
  className?: string
}

const colorMap = {
  green: { bg: 'bg-emerald-500', text: 'text-emerald-500' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-500' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-500' },
}

export function StatusBadge({ label, color = 'green', className }: StatusBadgeProps) {
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm',
        'border-zinc-200/50 bg-white/60 dark:border-zinc-800/50 dark:bg-zinc-900/60',
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
      <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium tracking-widest uppercase text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
    </div>
  )
}
