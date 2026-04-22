'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface PadModeProps {
  label: string
  isActive: boolean
}

export const PadMode = memo(
  ({ label, isActive }: PadModeProps) => {
    return (
      <button
        className={cn(
          'flex-1 rounded border border-transparent py-1 font-mono text-[7px] font-bold tracking-widest shadow-sm transition-colors',
          isActive
            ? 'bg-white text-black'
            : 'border-[#222] bg-[#18181a] text-zinc-500 hover:border-zinc-700',
        )}
      >
        {label}
      </button>
    )
  },
)

PadMode.displayName = 'PadMode'
