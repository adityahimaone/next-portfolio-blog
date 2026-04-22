'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface PadProps {
  label: string
  isActive: boolean
  color: string
  onClick: () => void
}

export const Pad = memo(
  ({
    label,
    isActive,
    color,
    onClick,
  }: PadProps) => {
    return (
      <button
        onClick={onClick}
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded border-b-[3px] py-3 transition-all active:translate-y-[2px] active:border-b-0',
          isActive
            ? 'border-[#111] bg-[#2a2a2c] shadow-inner'
            : 'border-[#111] bg-[#222] shadow-[0_4px_6px_rgba(0,0,0,0.5)] hover:bg-[#2c2c2e]',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            color,
            isActive ? 'opacity-40' : 'opacity-0',
          )}
        />
        <span
          className={cn(
            'relative z-10 px-1 text-center font-mono text-[8px] leading-tight font-bold tracking-widest drop-shadow-md transition-colors',
            isActive ? 'text-white' : 'text-zinc-500',
          )}
        >
          {label}
        </span>
        {isActive && (
          <div
            className={cn(
              'absolute top-1 right-1 h-1 w-1 rounded-full shadow-[0_0_8px_currentColor]',
              color.replace('bg-', 'text-'),
            )}
          />
        )}
      </button>
    )
  },
)

Pad.displayName = 'Pad'
