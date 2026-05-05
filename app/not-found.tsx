'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Home, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* DAW waveform visualization */}
      <motion.div
        className="relative mb-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-[3px] h-24">
          {Array.from({ length: 40 }).map((_, i) => {
            const height = Math.sin((i / 40) * Math.PI * 4) * 44 + 36
            const isActive = i <= 20
            return (
              <motion.div
                key={i}
                className="w-[3px] rounded-full"
                style={{
                  height: `${height}px`,
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--secondary)',
                  opacity: isActive ? 1 : 0.35,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.03,
                  ease: 'easeOut',
                }}
              />
            )
          })}
        </div>

        {/* Playhead */}
        <motion.div
          className="absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-accent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <div className="absolute -left-[4px] top-0 h-2.5 w-[10px] rounded-full bg-accent shadow-[0_0_8px_rgba(230,168,23,0.6)]" />
        </motion.div>
      </motion.div>

      {/* 404 */}
      <motion.div
        className="mb-4 font-mono text-8xl font-bold tracking-tighter text-primary/15 dark:text-primary/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        404
      </motion.div>

      {/* Heading */}
      <motion.h2
        className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        Track Not Found
      </motion.h2>

      <motion.p
        className="mb-8 max-w-md text-zinc-600 dark:text-zinc-400"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        This track seems to have been removed from the playlist, or maybe the
        URL is offbeat. Let's get you back to the main mix.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        className="flex gap-4 flex-wrap justify-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]"
        >
          <Home size={16} />
          Back to Home
        </Link>

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 dark:border-primary/40 dark:text-primary-light dark:hover:bg-primary/20"
        >
          <BookOpen size={16} />
          Read Blog
        </Link>
      </motion.div>

      {/* DAW status footer */}
      <motion.p
        className="mt-12 font-mono text-xs tracking-widest text-primary/40 dark:text-primary/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        [ SIGNAL LOST · CHECK ROUTING ]
      </motion.p>
    </div>
  )
}
