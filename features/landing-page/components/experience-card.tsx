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
        'relative w-full max-w-[420px]',
        side === 'left' ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12',
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      {/* Timeline dot */}
      <div
        className={cn(
          'absolute top-8 hidden md:block',
          side === 'left'
            ? 'right-[-6px] md:right-[-8px]'
            : 'left-[-6px] md:left-[-8px]',
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[var(--color-slate)] animate-ping opacity-20" />
          <div className="relative w-3 h-3 rounded-full bg-[var(--color-slate)] border-2 border-[var(--color-canvas)]" />
        </div>
      </div>

      {/* Card */}
      <div
        className="bg-[var(--color-smoke)] rounded-[9px] p-8 border border-[var(--color-slate)]/10"
        data-cursor="hover-card"
      >
        {/* Number */}
        <div className="mb-4">
          <span className="font-display text-[16px] text-[var(--color-ink)] opacity-50">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Role */}
        <h3 className="font-display text-[24px] text-[var(--color-ink)] mb-2">
          {role}
        </h3>

        {/* Company */}
        <p className="font-ui text-[13px] uppercase tracking-[0.1em] text-[var(--color-accent-grey)] mb-1">
          {company}
        </p>

        {/* Period & Location */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-ui text-[12px] text-[var(--color-accent-grey)]">
            {period}
          </span>
          <span className="h-1 w-1 rounded-full bg-[var(--color-accent-grey)] opacity-50" />
          <span className="font-ui text-[12px] text-[var(--color-accent-grey)]">
            {location}
          </span>
        </div>

        {/* Description */}
        {description && description.length > 0 && (
          <div className="space-y-2">
            {description.map((item, i) => (
              <p
                key={i}
                className="font-ui text-[15px] text-[var(--color-ink)] leading-[1.6]"
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