'use client'
import { motion } from 'motion/react'
import { Disc3 } from 'lucide-react'

export function VinylDivider() {
  return (
    <div className="flex items-center justify-center py-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        <Disc3 className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
      </motion.div>
    </div>
  )
}
