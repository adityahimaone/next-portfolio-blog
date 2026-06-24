'use client'

import { cn } from '@/lib/utils'
import styles from './hero.module.css'

interface HeroEqBarsProps {
  barCount?: number
  className?: string
}

export function HeroEqBars({ barCount = 40, className }: HeroEqBarsProps) {
  return (
    <div
      className={cn(
        'absolute bottom-12 left-0 right-0 z-10 flex items-end justify-center gap-[3px] px-4 pointer-events-none',
        className,
      )}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const center = barCount / 2
        const distFromCenter = Math.abs(i - center) / center
        const maxHeight = Math.round(20 + (1 - distFromCenter) * 35)
        const duration = 0.8 + Math.sin(i * 0.7) * 0.4
        const delay = (i * 0.05) % 1.2

        return (
          <div
            key={i}
            className={cn(
              styles.eqBar,
              'w-[3px] rounded-t-sm md:w-[4px]',
              'bg-gradient-to-t from-amber-500/60 via-amber-400/40 to-cyan-400/30',
              'dark:from-amber-500/40 dark:via-amber-400/25 dark:to-cyan-400/20',
            )}
            style={{
              height: `${maxHeight}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}
