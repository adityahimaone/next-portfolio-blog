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

      {/* Layer 2: Main content (name + badges) */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 flex h-full flex-col items-center justify-center"
      >
        {/* Floating status badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: baseDelay + 0.7 }}
          className="pointer-events-none"
        >
          <StatusBadge
            label="Online"
            color="green"
            className="absolute top-[18%] left-[5%] md:left-[8%]"
          />
          <StatusBadge
            label={`BPM ${bpm}`}
            color="amber"
            className="absolute top-[14%] right-[15%] md:right-[18%]"
          />
          <StatusBadge
            label="48kHz"
            color="cyan"
            className="absolute top-[14%] right-[3%] md:right-[8%]"
          />
        </motion.div>

        {/* The Name */}
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
        transition={{ duration: 0.7, delay: baseDelay + 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroTransport />
      </motion.div>
    </section>
  )
}
