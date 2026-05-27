'use client'
import { motion } from 'motion/react'

export function CassetteDivider() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="neu-flat flex items-center gap-3 rounded-xl border border-zinc-200 bg-[#f0f0f3] px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <motion.div
          className="h-5 w-5 rounded-full border border-zinc-300 dark:border-zinc-700"
          style={{ borderTopColor: 'var(--color-primary)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <div className="flex gap-0.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-3 w-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          ))}
        </div>
        <motion.div
          className="h-5 w-5 rounded-full border border-zinc-300 dark:border-zinc-700"
          style={{ borderTopColor: 'var(--color-primary)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}
