'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface HorizontalFaderProps {
  label: string
  value: number
  onChange: (e: any) => void
}

export const HorizontalFader = memo(
  ({
    label,
    value,
    onChange,
  }: HorizontalFaderProps) => {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="relative flex h-8 w-full items-center justify-center">
          <div className="absolute h-2.5 w-full rounded-full border border-[#222] bg-[#050505] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)]" />
          <div className="absolute top-1/2 left-1/2 h-4 w-[1px] -translate-x-1/2 -translate-y-1/2 bg-white/20" />
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={onChange}
            className="absolute w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-12 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border-x-[1.5px] [&::-webkit-slider-thumb]:border-[#111] [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#555] [&::-webkit-slider-thumb]:to-[#222] [&::-webkit-slider-thumb]:shadow-[0_5px_10px_rgba(0,0,0,0.8)]"
          />
        </div>
        <span className="mt-1 font-mono text-[8px] font-bold tracking-[0.4em] text-zinc-600">
          {label}
        </span>
      </div>
    )
  },
)

HorizontalFader.displayName = 'HorizontalFader'
