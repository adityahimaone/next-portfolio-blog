'use client'
import { motion } from 'motion/react'

export function TapeReelDivider() {
  return (
    <div className="flex items-center justify-center py-4 gap-2">
      <motion.div
        className="h-8 w-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700"
        style={{ borderTopColor: 'var(--color-primary)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <div className="w-16 h-px bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-300 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700" />
      <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
      <div className="w-16 h-px bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-300 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700" />
      <motion.div
        className="h-8 w-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700"
        style={{ borderTopColor: 'var(--color-primary)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
