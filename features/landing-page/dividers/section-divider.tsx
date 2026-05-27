'use client'
import { motion } from 'motion/react'

export function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-6 gap-3">
      {/* Left LED */}
      <motion.div
        className="h-2 w-2 rounded-full bg-amber-500"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          boxShadow: '0 0 8px rgba(217, 119, 6, 0.6)',
        }}
      />
      
      {/* Center line with gradient */}
      <motion.div
        className="h-px flex-1 max-w-xs"
        style={{
          background: 'linear-gradient(90deg, transparent, #a1a1aa 50%, transparent)',
          boxShadow: '0 0 8px rgba(161, 161, 170, 0.3)',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      
      {/* Center dot */}
      <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
      
      {/* Right line with gradient */}
      <motion.div
        className="h-px flex-1 max-w-xs"
        style={{
          background: 'linear-gradient(90deg, transparent, #a1a1aa 50%, transparent)',
          boxShadow: '0 0 8px rgba(161, 161, 170, 0.3)',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      />
      
      {/* Right LED */}
      <motion.div
        className="h-2 w-2 rounded-full bg-amber-500"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        style={{
          boxShadow: '0 0 8px rgba(217, 119, 6, 0.6)',
        }}
      />
    </div>
  )
}
