'use client'

import { m as motion } from 'motion/react'
import { Music } from 'lucide-react'
import { ModernDap } from '@/features/landing-page/spotify'

export function DapSection() {
  return (
    <section
      id="dap"
      className="relative w-full overflow-hidden bg-zinc-950 py-20 md:py-32"
    >
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.05) 0%, transparent 40%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <div className="mb-4 flex items-center gap-3">
            <Music size={18} className="text-violet-400" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              Now Playing
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
            The Soundtrack
          </h2>
          <p className="mt-4 max-w-md text-sm text-zinc-500">
            Music is the invisible thread running through everything I build.
            Press play and scroll.
          </p>
        </motion.div>

        {/* DAP Component — centered card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto max-w-md"
        >
          <ModernDap />
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-10 flex justify-center"
        >
          <a
            href="/music"
            className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-zinc-500 transition-all hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-zinc-300"
          >
            <span>Explore Mixtape</span>
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
