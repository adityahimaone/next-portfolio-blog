'use client'

import { useRef, useState, useEffect } from 'react'
import { m as motion, useScroll, useTransform } from 'motion/react'
import { useTheme } from 'next-themes'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { cn } from '@/lib/utils'
import { HeroName } from './hero-name'
import { HeroWaveform } from './hero-waveform'
import { HeroEqBars } from './hero-eq-bars'
import { HeroTransport } from './hero-transport'
import { StatusBadge } from './status-badge'
import { Screw } from '@/components/screw'

export function HeroSectionV2() {
  const [baseDelay, setBaseDelay] = useState(1)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { playbackRate } = useAudio()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  useEffect(() => {
    if (sessionStorage.getItem('preloaderShown')) {
      setBaseDelay(0.1)
    }
  }, [])

  const bpm = Math.round(playbackRate * 128)

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden select-none"
    >
      {/* Viewport Mounting Screws (Concept 1 Synth Faceplate Frame) */}
      <Screw className="text-slate/50 dark:text-graphite absolute top-20 left-4 z-40 opacity-60 transition-transform duration-300 hover:rotate-12" />
      <Screw className="text-slate/50 dark:text-graphite absolute top-20 right-4 z-40 opacity-60 transition-transform duration-300 hover:-rotate-12" />
      <Screw className="text-slate/50 dark:text-graphite absolute bottom-16 left-4 z-40 opacity-60 transition-transform duration-300 hover:-rotate-12" />
      <Screw className="text-slate/50 dark:text-graphite absolute right-4 bottom-16 z-40 opacity-60 transition-transform duration-300 hover:rotate-12" />

      {/* Horizontal Chassis Faceplate Seams */}
      <div className="border-graphite/15 dark:border-graphite/40 pointer-events-none absolute top-16 right-0 left-0 z-30 border-b" />
      <div className="border-graphite/15 dark:border-graphite/40 pointer-events-none absolute right-0 bottom-12.5 left-0 z-30 border-t" />

      {/* Layer 0: Background pattern */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Grid / dot pattern */}
        <div
          className={cn(
            'absolute inset-0',
            isDark
              ? 'bg-[radial-gradient(circle,_var(--color-iris)_1px,_transparent_1px)] opacity-[0.05]'
              : 'bg-[radial-gradient(circle,_var(--color-plum)_1px,_transparent_1px)] opacity-[0.04]',
          )}
          style={{ backgroundSize: '24px 24px' }}
        />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Layer 1: Waveform BEHIND text */}
      <HeroWaveform layer="behind" />

      {/* Layer 2: Centered main content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 flex h-full w-full flex-col items-center justify-center"
      >
        {/* Status Badges Row above typography */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: baseDelay + 0.7 }}
          className="pointer-events-none mb-6 flex flex-wrap justify-center gap-2.5"
        >
          <StatusBadge label="Online" />
          <StatusBadge label={`BPM ${bpm}`} />
          <StatusBadge label="48kHz" />
        </motion.div>

        {/* Massive Centered Name */}
        <HeroName
          name="ADITYA"
          subtitle="HIMAWAN"
          role="Frontend Developer · Sound Designer"
          baseDelay={baseDelay}
        />
      </motion.div>

      {/* Layer 3: Waveform IN FRONT of text (subtle overlay) */}
      <HeroWaveform layer="front" />

      {/* Layer 4: EQ bars from bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: baseDelay + 0.8 }}
      >
        <HeroEqBars barCount={50} />
      </motion.div>

      {/* Layer 5: Transport bar at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay: baseDelay + 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <HeroTransport />
      </motion.div>
    </section>
  )
}
