'use client'
import { motion } from 'motion/react'

export function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-4">
      <motion.div
        className="h-[3px] w-24 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)]"
        style={{
          background: 'linear-gradient(90deg, transparent, #a1a1aa 50%, transparent)',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}
