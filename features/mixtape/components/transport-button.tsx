'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface TransportButtonProps {
  label: string
  color: 'amber' | 'red' | 'zinc'
  isActive: boolean
  onClick: () => void
}

export const TransportButton = memo(
  ({
    label,
    color,
    isActive,
    onClick,
  }: TransportButtonProps) => {
    const colorMap = {
      amber:
        'bg-amber-500 border-amber-700 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]',
      red: 'bg-red-500 border-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]',
      zinc: 'bg-[#222] border-[#111] text-zinc-400 shadow-[0_4px_10px_rgba(0,0,0,0.5)]',
    }
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex aspect-square w-full items-center justify-center rounded-full border-b-[5px] font-mono text-[9px] font-black tracking-widest transition-all active:translate-y-1 active:border-b-0',
          isActive ? colorMap[color] : colorMap.zinc,
        )}
      >
        {label}
      </button>
    )
  },
)

TransportButton.displayName = 'TransportButton'
