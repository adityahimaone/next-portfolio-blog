'use client'

import { cn } from '@/lib/utils'

interface ItemCardProps {
  name: string
  level: string
  icon: string
}

const LEVEL_COLORS: Record<string, string> = {
  MASTER: 'border-red text-red',
  EXPERT: 'border-yellow-400 text-yellow-400',
  VETERAN: 'border-blue-400 text-blue-400',
  INTERMEDIATE: 'border-green-400 text-green-400',
  APPRENTICE: 'border-white-dim text-white-dim',
}

export function ItemCard({ name, level, icon }: ItemCardProps) {
  const colorClass = LEVEL_COLORS[level] || LEVEL_COLORS.APPRENTICE

  return (
    <div
      className={cn(
        'group relative border-2 bg-black-true p-4 transition-all hover:bg-gray-deep',
        colorClass.split(' ')[0],
      )}
    >
      {/* Icon */}
      <div className="mb-3 text-2xl">{icon}</div>

      {/* Name */}
      <h4 className="t-heading-xs text-white-bone">{name}</h4>

      {/* Level badge */}
      <span className={cn('t-hud-xs mt-1 inline-block', colorClass.split(' ')[1])}>
        {level}
      </span>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none border border-white/10" />
    </div>
  )
}
