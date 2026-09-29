'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface VerticalFaderProps {
  label: string
  value: number
  onChange: (e: any) => void
  height?: string
  hideValue?: boolean
}

export const VerticalFader = memo(
  ({
    label,
    value,
    onChange,
    height = 'h-24',
    hideValue = false,
  }: VerticalFaderProps) => {
    return (
      <div className="flex h-full w-full flex-col items-center">
        <div
          className={cn(
            'relative mb-1 flex w-8 flex-1 items-center justify-center',
            height,
          )}
        >
          <div className="absolute h-full w-2 rounded-full border border-[#222] bg-[#050505] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)]" />
          <div className="absolute top-1/2 left-1/2 h-[1px] w-4 -translate-x-1/2 -translate-y-1/2 bg-white/20" />
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={onChange}
            className="absolute h-6 w-[120%] -rotate-90 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border-y-[1.5px] [&::-webkit-slider-thumb]:border-[#111] [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-[#555] [&::-webkit-slider-thumb]:to-[#222] [&::-webkit-slider-thumb]:shadow-[0_5px_10px_rgba(0,0,0,0.8)]"
            style={{ width: height.replace('h-', '') + 'px' }}
          />
        </div>
        {!hideValue && (
          <span className="font-mono text-[7px] font-bold tracking-widest text-zinc-500">
            {label}
          </span>
        )}
      </div>
    )
  },
)

VerticalFader.displayName = 'VerticalFader'
