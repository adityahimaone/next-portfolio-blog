'use client'

import { motion } from 'motion/react'

interface StatsCardProps {
  number: string
  label: string
  sublabel: string
}

export function StatsCard({ number, label, sublabel }: StatsCardProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-6 bg-[var(--color-smoke)] rounded-[var(--radius-card)] transition-all duration-300 cursor-default"
      whileHover={{
        y: -4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-[var(--text-lg)] font-display font-bold text-[var(--color-ink)] mb-1">
        {number}
      </div>
      <div className="text-[var(--text-xs)] font-ui uppercase tracking-[0.1em] text-[var(--color-accent-grey)] mb-0.5">
        {label}
      </div>
      <div className="text-[var(--text-xs)] font-ui text-[var(--color-ink)] opacity-80">
        {sublabel}
      </div>
    </motion.div>
  )
}