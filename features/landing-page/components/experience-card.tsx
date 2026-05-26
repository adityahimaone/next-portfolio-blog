'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface ExperienceCardProps {
  role: string
  company: string
  period: string
  location: string
  description?: string[]
  side: 'left' | 'right'
  index: number
}

export function ExperienceCard({
  role,
  company,
  period,
  location,
  description,
  side,
  index,
}: ExperienceCardProps) {
  return (
    <motion.div
      className={cn(
        'relative w-full max-w-[380px]',
        side === 'left' ? 'md:mr-auto md:pr-10' : 'md:ml-auto md:pl-10',
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      {/* Timeline dot */}
      <div
        className={cn(
          'absolute top-6 hidden md:block',
          side === 'left'
            ? 'right-[-5px] md:right-[-6px]'
            : 'left-[-5px] md:left-[-6px]',
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[var(--color-slate)] animate-ping opacity-20" />
          <div className="relative w-2.5 h-2.5 rounded-full bg-[var(--color-slate)] border-2 border-[var(--color-canvas)]" />
        </div>
      </div>

      {/* Card */}
      <div
        className="bg-[var(--color-smoke)] rounded-[9px] p-6 border border-[var(--color-slate)]/10"
        data-cursor="hover-card"
      >
        {/* Number */}
        <div className="mb-3">
          <span className="font-display text-[14px] text-[var(--color-ink)] opacity-50">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Role */}
        <h3 className="font-display text-[20px] text-[var(--color-ink)] mb-1.5">
          {role}
        </h3>

        {/* Company */}
        <p className="font-ui text-[12px] uppercase tracking-[0.1em] text-[var(--color-accent-grey)] mb-1">
          {company}
        </p>

        {/* Period & Location */}
        <div className="flex items-center gap-2.5 mb-3">
          <span className="font-ui text-[11px] text-[var(--color-accent-grey)]">
            {period}
          </span>
          <span className="h-0.5 w-0.5 rounded-full bg-[var(--color-accent-grey)] opacity-50" />
          <span className="font-ui text-[11px] text-[var(--color-accent-grey)]">
            {location}
          </span>
        </div>

        {/* Description */}
        {description && description.length > 0 && (
          <div className="space-y-1.5">
            {description.map((item, i) => (
              <p
                key={i}
                className="font-ui text-[14px] text-[var(--color-ink)] leading-[1.6]"
              >
                {item}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
