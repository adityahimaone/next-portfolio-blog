'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface MiniButtonProps {
  label: string
  color: 'amber' | 'red' | 'zinc'
}

export const MiniButton = memo(
  ({ label, color }: MiniButtonProps) => {
    const isColor = color !== 'zinc'
    return (
      <button className="flex w-full flex-1 items-center justify-center rounded border border-[#333] bg-[#18181a] px-1 py-1.5 font-mono text-[7px] font-bold whitespace-nowrap text-zinc-500 shadow-inner transition-colors active:bg-zinc-800">
        <span
          className={
            isColor
              ? `text-${color}-500 drop-shadow-[0_0_5px_currentColor]`
              : ''
          }
        >
          {label}
        </span>
      </button>
    )
  },
)

MiniButton.displayName = 'MiniButton'
