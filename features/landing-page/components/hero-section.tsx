'use client'

import { useRef } from 'react'
import { m as motion, useScroll, useTransform } from 'motion/react'
import { Play, Pause, SkipForward } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { Space_Grotesk } from 'next/font/google'

import { useState, useEffect } from 'react'

const spaceGroteskHero = Space_Grotesk({ weight: ['700'], subsets: ['latin'] })

// Character-by-character reveal animation config
const nameChars = 'ADITYA'.split('')
const lastNameChars = 'HIMAONE'.split('')

export function HeroSection() {
  const [baseDelay, setBaseDelay] = useState(1)

  useEffect(() => {
    if (sessionStorage.getItem('preloaderShown')) {
      setBaseDelay(0.1)
    }
  }, [])

  const { isPlaying, togglePlay, currentTrack, audioRef } = useAudio()

  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-stone-50 transition-colors dark:bg-stone-950"
    >
      {/* Amp Cabinet Background — enhanced with warm tones */}
      <div className="absolute inset-0 z-0">
        {/* Dot grid (speaker grille) */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#78716c_1px,transparent_1px)] opacity-[0.06] dark:bg-[radial-gradient(#44403c_1.5px,transparent_1.5px)] dark:opacity-40"
          style={{ backgroundSize: '4px 4px' }}
        />
        {/* Noise texture */}
        <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.08] mix-blend-overlay dark:opacity-20" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(28,25,23,0.08)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
        {/* Warm ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(224,124,36,0.04)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(224,124,36,0.08)_0%,transparent_60%)]" />
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 container mx-auto mt-24 flex flex-col items-center px-4 text-center md:px-6"
      >
        {/* Content Wrapper */}
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
          {/* Top Label — LIVE SESSION */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: baseDelay }}
            className="mb-8 flex items-center gap-3 rounded-full border border-stone-200 bg-white/50 px-4 py-1.5 text-sm font-medium text-stone-700 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/40 dark:text-stone-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal shadow-[0_0_6px_rgba(34,197,94,0.6)]"></span>
            </span>
            <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em]">LIVE SESSION</span>
          </motion.div>

          {/* Brand Logo — Character-by-character reveal */}
          <div className={`mb-10 flex flex-col items-center ${spaceGroteskHero.className}`}>
            {/* First name — character reveal */}
            <div className="flex overflow-hidden">
              {nameChars.map((char, i) => (
                <motion.span
                  key={`first-${i}`}
                  initial={{ opacity: 0, y: 60, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: baseDelay + 0.1 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block text-center text-[13vw] leading-[0.85] font-bold tracking-tighter text-stone-900 md:text-[10vw] lg:text-[8vw] dark:text-white"
                >
                  <span className="block bg-gradient-to-b from-stone-700 via-stone-900 to-stone-950 bg-clip-text text-transparent dark:from-white dark:via-stone-200 dark:to-stone-500">
                    {char}
                  </span>
                </motion.span>
              ))}
            </div>

            {/* Last name — copper accent, wider tracking */}
            <div className="flex overflow-hidden">
              {lastNameChars.map((char, i) => (
                <motion.span
                  key={`last-${i}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: baseDelay + 0.4 + i * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block text-[5vw] font-bold tracking-[0.5em] text-copper/80 md:text-[3vw] lg:text-[2.5vw] dark:text-copper-light/80"
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Subtitle / Description */}
          <p className="animate-hero-desc mb-10 max-w-2xl text-center text-base font-light text-stone-600 sm:text-lg md:text-xl dark:text-stone-400">
            Orchestrating code and rhythm into immersive digital experiences.
            <br className="hidden sm:block" /> Frontend Developer & Audio
            Enthusiast.
          </p>

          {/* Player Controls / CTA — Hardware Style */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 0.8,
              delay: baseDelay + 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex w-full max-w-[90vw] items-center gap-4 rounded-lg border-t border-white/20 bg-stone-200 p-2 shadow-2xl sm:max-w-lg sm:gap-6 sm:p-3 dark:border-white/5 dark:bg-stone-900"
          >
            {/* Inset Shadow for depth */}
            <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_4px_10px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_4px_10px_rgba(0,0,0,0.5)]" />

            <Magnetic intensity={0.2}>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause Session' : 'Play Session'}
                className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-stone-100 to-stone-300 shadow-[0_2px_5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.1)] transition-all active:scale-95 active:shadow-inner sm:h-14 sm:w-14 dark:from-stone-700 dark:to-stone-800 dark:shadow-[0_2px_5px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,0,0,0.5)]"
              >
                <div className="bg-primary/5 absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                {isPlaying ? (
                  <Pause
                    fill="currentColor"
                    className="text-stone-700 dark:text-stone-200"
                  />
                ) : (
                  <Play
                    fill="currentColor"
                    className="ml-1 text-stone-700 dark:text-stone-200"
                  />
                )}
                {/* LED Indicator on button */}
                <div
                  className={`absolute top-2 right-2 h-1.5 w-1.5 rounded-full transition-colors ${isPlaying ? 'bg-signal shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-stone-400 dark:bg-stone-600'}`}
                />
              </button>
            </Magnetic>

            {/* LCD Display — enhanced with warm copper text */}
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1 rounded border-b border-white/10 bg-stone-800 p-2 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] dark:bg-black">
              <div className="flex w-full items-center justify-between px-1">
                <span className="font-[family-name:var(--font-mono)] text-[7px] font-bold tracking-widest text-stone-500 uppercase">
                  STATUS: {isPlaying ? 'PLAYING' : 'STANDBY'}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-1 rounded-full ${isPlaying ? 'animate-pulse bg-signal' : 'bg-stone-700'}`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex w-full items-center gap-3 overflow-hidden px-1">
                <div className="flex h-3 shrink-0 items-end gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-[1px] bg-copper/80"
                      animate={{
                        height: isPlaying ? [2, 10, 5, 8, 2] : 2,
                        opacity: isPlaying ? 1 : 0.5,
                      }}
                      transition={{
                        duration: 0.4,
                        repeat: Infinity,
                        delay: i * 0.05,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
                <div className="relative flex-1 overflow-hidden">
                  <motion.div
                    className="flex w-fit font-[family-name:var(--font-mono)] text-xs whitespace-nowrap text-copper shadow-[0_0_8px_rgba(224,124,36,0.4)] sm:text-sm"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                      repeat: Infinity,
                      ease: 'linear',
                      duration: Math.max(8, currentTrack.length * 0.2),
                    }}
                  >
                    <span className="mr-8">{currentTrack}</span>
                    <span className="mr-8">{currentTrack}</span>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="h-8 w-px shrink-0 bg-stone-300 dark:bg-stone-800" />

            <Magnetic intensity={0.2}>
              <a
                href="#projects"
                className="flex h-10 shrink-0 items-center gap-2 rounded bg-stone-300 px-3 text-xs font-bold text-stone-700 shadow-[0_1px_0_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-inner sm:px-4 dark:bg-stone-800 dark:text-stone-300 dark:shadow-[0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)]"
              >
                <span className="hidden sm:inline">TRACKS</span>
                <SkipForward size={14} />
              </a>
            </Magnetic>
          </motion.div>

          {/* Decorative "LIVE" Badge — replaces "New Release" */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 12 }}
            transition={{
              delay: baseDelay + 0.2,
              type: 'spring',
              stiffness: 200,
            }}
            className="absolute -top-4 -right-4 flex rotate-12 transform items-center gap-1.5 border-2 border-white/20 bg-signal px-4 py-1.5 text-xs font-black tracking-wider text-white uppercase shadow-[0_0_20px_rgba(34,197,94,0.3)] md:top-10 md:-right-10"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white"></span>
            </span>
            LIVE
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
