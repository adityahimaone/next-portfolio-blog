'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface ProjectCardV4Props {
  number: string
  title: string
  category: string
  year: string
  url: string
  featured?: boolean
}

export function ProjectCardV4({
  number,
  title,
  category,
  year,
  url,
  featured = false,
}: ProjectCardV4Props) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group relative block overflow-hidden rounded-[9px]',
        featured ? 'aspect-[16/7]' : 'aspect-[4/5]',
      )}
      data-cursor="hover-project"
      whileHover="hover"
      initial="rest"
    >
      {/* Background image placeholder — gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: featured
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #0a0a0a 100%)'
            : 'linear-gradient(160deg, #3a3a3a 0%, #1f1f1f 50%, #0f0f0f 100%)',
          scale: 1.1,
        }}
        variants={{
          rest: { y: 0, scale: 1.1 },
          hover: { y: -10, scale: 1.05 },
        }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      {/* Overlay gradient */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-70"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.85) 40%, transparent 100%)',
          opacity: 0.9,
        }}
      />

      {/* Text panel */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col gap-2 z-10">
        {/* Top row: number + category/year */}
        <div className="flex items-center justify-between">
          <span className="font-display text-[16px] text-[var(--color-off-white)] opacity-50">
            {number}
          </span>
          <span className="font-ui text-[12px] uppercase tracking-[0.05em] text-[var(--color-off-white)] opacity-70">
            {category} / {year}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-[24px] text-[var(--color-off-white)] leading-tight">
          {title}
        </h3>

        {/* CTA */}
        <div className="flex items-center justify-end mt-2">
          <span className="font-ui text-[13px] text-[var(--color-off-white)] opacity-80 group-hover:opacity-100 transition-opacity">
            VIEW →
          </span>
        </div>
      </div>
    </motion.a>
  )
}
