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
import { HeroConsoleDeck } from './hero-console-deck'

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
      className="relative min-h-screen lg:h-screen w-full overflow-hidden select-none pb-20 lg:pb-0"
    >
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

      {/* Layer 2: Main content (name + badges + console deck) */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 flex min-h-screen lg:h-full w-full items-center justify-center pt-24 pb-12 lg:py-0"
      >
        <div className="w-full max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-14">
          {/* Left Column: Name & Details */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative w-full lg:w-auto">
            {/* Status Badges anchored relative to name container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: baseDelay + 0.7 }}
              className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start pointer-events-none"
            >
              <StatusBadge label="Online" color="green" />
              <StatusBadge label={`BPM ${bpm}`} color="amber" />
              <StatusBadge label="48kHz" color="cyan" />
            </motion.div>

            {/* The Name */}
            <HeroName
              name="ADITYA"
              subtitle="HIMAWAN"
              role="Frontend Developer · Sound Designer"
              baseDelay={baseDelay}
            />
          </div>

          {/* Right Column: Interactive Hardware Console Deck */}
          <div className="flex justify-center w-full lg:w-auto relative z-30">
            <HeroConsoleDeck />
          </div>
        </div>
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
