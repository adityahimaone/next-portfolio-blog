'use client'

import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface QuestCardProps {
  title: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PLANNED'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  description: string
  tech: string[]
  link: string | null
}

const STATUS_COLORS = {
  IN_PROGRESS: 'text-yellow-400',
  COMPLETED: 'text-green-400',
  PLANNED: 'text-white-dim',
}

const DIFFICULTY_COLORS = {
  EASY: 'bg-green-400/20 text-green-400',
  MEDIUM: 'bg-yellow-400/20 text-yellow-400',
  HARD: 'bg-red/20 text-red',
}

export function QuestCard({
  title,
  status,
  difficulty,
  description,
  tech,
  link,
}: QuestCardProps) {
  return (
    <div className="border-2 border-gray bg-gray-deep p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="t-heading-m text-white-bone">{title}</h3>
            <span className={cn('t-hud-xs', STATUS_COLORS[status])}>
              [{status}]
            </span>
            <span className={cn('t-hud-xs px-2 py-0.5', DIFFICULTY_COLORS[difficulty])}>
              {difficulty}
            </span>
          </div>

          <p className="t-body-m mb-4 text-white-dim">{description}</p>

          <div className="flex flex-wrap gap-2">
            {tech.map((t) => (
              <span
                key={t}
                className="t-hud-xs border border-gray-light bg-black-true px-2 py-1 text-white-dim"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 self-start border border-white-bone bg-black-true px-4 py-2 text-white-bone transition-colors hover:border-red hover:text-red"
          >
            <span className="t-hud-xs">VIEW</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  )
}
