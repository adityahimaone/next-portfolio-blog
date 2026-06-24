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
import { HeroControlRail } from './hero-control-rail'
import { Screw } from '@/components/screw'

export function HeroSectionV2() {
  const [baseDelay, setBaseDelay] = useState(1)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { isPlaying, playbackRate } = useAudio()
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
      <Screw className="absolute top-20 left-4 z-40 opacity-60 text-zinc-400 dark:text-zinc-650 hover:rotate-12 transition-transform duration-300" />
      <Screw className="absolute top-20 right-4 z-40 opacity-60 text-zinc-400 dark:text-zinc-650 hover:-rotate-12 transition-transform duration-300" />
      <Screw className="absolute bottom-16 left-4 z-40 opacity-60 text-zinc-400 dark:text-zinc-650 hover:-rotate-12 transition-transform duration-300" />
      <Screw className="absolute bottom-16 right-4 z-40 opacity-60 text-zinc-400 dark:text-zinc-650 hover:rotate-12 transition-transform duration-300" />

      {/* Horizontal Chassis Faceplate Seams */}
      <div className="absolute top-16 left-0 right-0 border-b border-zinc-200/50 dark:border-zinc-850/50 z-30 pointer-events-none" />
      <div className="absolute bottom-12.5 left-0 right-0 border-t border-zinc-200/50 dark:border-zinc-850/50 z-30 pointer-events-none" />

      {/* Layer 0: Background pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Grid / dot pattern */}
        <div
          className={cn(
            'absolute inset-0',
            isDark
              ? 'bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)]'
              : 'bg-[radial-gradient(circle,_rgba(0,0,0,0.06)_1px,_transparent_1px)]',
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
        className="relative z-20 flex h-full w-full items-center justify-center flex-col"
      >
        {/* Status Badges Row above typography */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: baseDelay + 0.7 }}
          className="flex flex-wrap gap-2.5 mb-6 justify-center pointer-events-none"
        >
          <StatusBadge label="Online" color="green" />
          <StatusBadge label={`BPM ${bpm}`} color="amber" />
          <StatusBadge label="48kHz" color="cyan" />
        </motion.div>

        {/* Massive Centered Name */}
        <HeroName
          name="ADITYA"
          subtitle="HIMAWAN"
          role="Frontend Developer · Sound Designer"
          baseDelay={baseDelay}
        />

        {/* Sleek Horizontal Control Rail directly below name */}
        <HeroControlRail />
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
        transition={{ duration: 0.7, delay: baseDelay + 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroTransport />
      </motion.div>
    </section>
  )
}
