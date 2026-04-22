'use client'

import { memo, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface VuMeterProps {
  horizontal?: boolean
}

export const VuMeter = memo(({ horizontal = false }: VuMeterProps) => {
  const [level, setLevel] = useState(0)

  // Smoother VU animation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setLevel((prev) => {
        const next = Math.random() * 0.8 + 0.2
        return next > prev ? next : prev * 0.7
      })
    }, 150) // Reduced frequency to 150ms for performance
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        'flex gap-[1px] overflow-hidden rounded-[2px] bg-[#000] p-[1px]',
        horizontal
          ? 'h-2 w-full flex-row items-center'
          : 'h-full w-2.5 flex-col items-center', // Vertical
      )}
    >
      {[...Array(20)].map((_, i) => {
        const isRed = i > 16
        const isAmber = i > 12 && i <= 16
        const color = isRed
          ? 'bg-red-500'
          : isAmber
            ? 'bg-amber-500'
            : 'bg-green-500'

        const isLit = i <= level * 20

        return (
          <div
            key={i}
            className={cn(
              'rounded-[1px] transition-all duration-100',
              horizontal ? 'h-full flex-1' : 'w-full flex-1',
              color,
              isLit
                ? 'opacity-100 shadow-[0_0_5px_currentColor]'
                : 'opacity-10',
            )}
          />
        )
      })}
    </div>
  )
})

VuMeter.displayName = 'VuMeter'
