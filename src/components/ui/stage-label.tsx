'use client'

import { cn } from '@/lib/utils'

interface StageLabelProps {
  num: string
  name: string
  glowing?: boolean
}

export function StageLabel({ num, name, glowing = false }: StageLabelProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'h-2 w-2 rounded-full bg-red',
          glowing && 'animate-pulse',
        )}
        style={glowing ? { boxShadow: '0 0 6px #E10600, 0 0 12px #8A0400' } : undefined}
      />
      <span className="t-hud text-white-dim">
        STAGE-{num} // {name}
      </span>
    </div>
  )
}
