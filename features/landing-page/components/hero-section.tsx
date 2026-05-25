'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import {
  m as motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react'
import { Play, Pause, SkipForward } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'

export function HeroSection() {
  const [baseDelay, setBaseDelay] = useState(1)
  const [tapeCounter, setTapeCounter] = useState('00:00:00')

  useEffect(() => {
    if (sessionStorage.getItem('preloaderShown')) {
      setBaseDelay(0.1)
    }
  }, [])

  // Tape counter animation - counts up from 00:00:00
  useEffect(() => {
    let startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 100) // Update every 100ms
      const minutes = Math.floor(elapsed / 600)
      const seconds = Math.floor((elapsed % 600) / 10)
      const frames = elapsed % 10
      setTapeCounter(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`
      )
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const { isPlaying, togglePlay, currentTrack } = useAudio()
  const prefersReducedMotion = useReducedMotion()

  const containerRef = useRef<HTMLDivElement>(null)

  const marqueeDuration = useMemo(
    () => Math.max(8, currentTrack.length * 0.2),
    [currentTrack],
  )

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--color-charcoal)' }}
    >
      {/* CSS Scroll-Driven Animations */}
      <style jsx>{`
        @supports (animation-timeline: scroll()) {
          @keyframes hero-parallax {
            from {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            to {
              transform: translateY(150px) scale(0.95);
              opacity: 0;
            }
          }

          .hero-content-enhanced {
            animation: hero-parallax linear;
            animation-timeline: scroll();
            animation-range: 0vh 100vh;
          }

          .hero-content-enhanced > * {
            transform: none !important;
          }
        }

        @keyframes tape-reel-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .tape-reel {
          animation: tape-reel-spin 3s linear infinite;
          animation-play-state: ${isPlaying ? 'running' : 'paused'};
        }

        .tape-reel-slow {
          animation: tape-reel-spin 4s linear infinite;
          animation-play-state: ${isPlaying ? 'running' : 'paused'};
        }
      `}</style>

      {/* Background: Deep charcoal with noise texture */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />
      </div>

      {/* Tape Reel Animation - Decorative */}
      <div className="absolute top-20 left-10 z-10 hidden opacity-20 md:block" aria-hidden="true">
        <div className="tape-reel relative h-24 w-24">
          <div
            className="absolute inset-0 rounded-full border-4"
            style={{
              borderColor: 'var(--color-ochre)',
              background: 'radial-gradient(circle, var(--color-surface) 30%, transparent 30%)',
            }}
          />
          <div className="absolute inset-4 rounded-full border-2" style={{ borderColor: 'var(--color-ochre)' }} />
          <div className="absolute inset-8 rounded-full" style={{ backgroundColor: 'var(--color-surface)' }} />
        </div>
      </div>

      <div className="absolute top-20 right-10 z-10 hidden opacity-20 md:block" aria-hidden="true">
        <div className="tape-reel-slow relative h-24 w-24">
          <div
            className="absolute inset-0 rounded-full border-4"
            style={{
              borderColor: 'var(--color-ochre)',
              background: 'radial-gradient(circle, var(--color-surface) 30%, transparent 30%)',
            }}
          />
          <div className="absolute inset-4 rounded-full border-2" style={{ borderColor: 'var(--color-ochre)' }} />
          <div className="absolute inset-8 rounded-full" style={{ backgroundColor: 'var(--color-surface)' }} />
        </div>
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className="hero-content-enhanced relative z-20 container mx-auto mt-24 flex flex-col items-center px-4 text-center md:px-6"
      >
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
          {/* New Release Badge - Ochre pill with terracotta dot */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: baseDelay,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="mb-8 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--color-ochre)',
              color: 'var(--color-charcoal)',
              fontFamily: 'var(--font-display)',
            }}
            role="status"
            aria-label="New release available"
          >
            <span
              className="relative flex h-2 w-2"
              style={{ backgroundColor: 'var(--color-terracotta)' }}
              aria-hidden="true"
            >
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: 'var(--color-terracotta)' }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-terracotta)' }} />
            </span>
            New Release
          </motion.div>

          {/* Main Title - Space Grotesk, warm cream */}
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: baseDelay + 0.1 }}
            className="mb-4 text-center text-[14vw] font-bold leading-[0.9] tracking-tight sm:text-[12vw] md:text-[10vw] lg:text-[8vw]"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-highlight)',
            }}
          >
            ADITYA
            <br />
            <span className="text-[10vw] tracking-[0.2em] sm:text-[8vw] md:text-[6vw] lg:text-[5vw]">HIMAONE</span>
          </motion.h1>

          {/* Subtitle - EB Garamond italic */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.6, delay: baseDelay + 0.3 }}
            className="mb-12 max-w-2xl text-center text-lg italic leading-relaxed sm:text-xl md:text-2xl"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-slate)',
            }}
          >
            Orchestrating code and rhythm into immersive digital experiences.
            <br className="hidden sm:block" />
            Frontend Developer & Audio Enthusiast.
          </motion.p>

          {/* Simplified Transport Controls */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: baseDelay + 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="flex w-full max-w-[90vw] items-center gap-4 sm:max-w-md sm:gap-5"
          >
            {/* Play/Pause Button - Simplified */}
            <Magnetic intensity={0.2}>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause tape' : 'Press record'}
                className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 sm:h-20 sm:w-20"
                style={{
                  backgroundColor: 'var(--color-ochre)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                {isPlaying ? (
                  <Pause fill="currentColor" className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: 'var(--color-charcoal)' }} />
                ) : (
                  <Play fill="currentColor" className="ml-1 h-7 w-7 sm:h-8 sm:w-8" style={{ color: 'var(--color-charcoal)' }} />
                )}
              </button>
            </Magnetic>

            {/* Simplified Info Display */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {/* Tape Counter - Subtle */}
              <div
                className="text-sm font-bold tabular-nums tracking-wider opacity-60"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-ochre)',
                }}
                aria-live="polite"
                aria-label={`Tape counter: ${tapeCounter}`}
              >
                {tapeCounter}
              </div>

              {/* Track Info - Simplified */}
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-3 shrink-0 items-end gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 rounded-[1px]"
                      style={{ backgroundColor: 'var(--color-ochre)' }}
                      animate={{
                        height: isPlaying ? [4, 10, 6, 8] : 4,
                        opacity: isPlaying ? 0.8 : 0.3,
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
                    className="whitespace-nowrap text-sm"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-highlight)',
                    }}
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                      repeat: Infinity,
                      ease: 'linear',
                      duration: marqueeDuration,
                    }}
                  >
                    <span className="mr-8">{currentTrack}</span>
                    <span className="mr-8">{currentTrack}</span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Skip Button - Simplified */}
            <Magnetic intensity={0.2}>
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex h-12 shrink-0 items-center gap-2 rounded-lg px-4 text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 active:translate-y-0 sm:h-14 sm:px-5"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-ochre)',
                  border: '1px solid var(--color-border-subtle)',
                  fontFamily: 'var(--font-display)',
                }}
                aria-label="Skip to projects section"
              >
                <span className="hidden sm:inline">TRACKS</span>
                <SkipForward size={16} aria-hidden="true" />
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
