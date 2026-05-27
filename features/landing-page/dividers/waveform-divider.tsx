'use client'
import { motion } from 'motion/react'

export function WaveformDivider() {
  return (
    <div className="flex items-center justify-center py-4 overflow-hidden">
      <svg width="200" height="20" viewBox="0 0 200 20" className="text-zinc-300 dark:text-zinc-700">
        <motion.path
          d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  )
}
