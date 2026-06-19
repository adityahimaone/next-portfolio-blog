'use client'

import { useRef, useState, useEffect } from 'react'
import { m as motion, useScroll, useTransform } from 'motion/react'
import { Play, Pause, SkipForward } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { Syne } from 'next/font/google'

const syne = Syne({ weight: ['700', '800'], subsets: ['latin'] })

export function HeroSection() {
  const [baseDelay, setBaseDelay] = useState(1)

  useEffect(() => {
    if (sessionStorage.getItem('preloaderShown')) {
      setBaseDelay(0.1)
    }
  }, [])

  const { isPlaying, togglePlay, currentTrack } = useAudio()
  const containerRef = useRef<HTMLDivElement>(null)

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
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#f5f5f3] transition-colors dark:bg-[#121212]"
    >
      {/* Braun Vent Line Background Pattern */}
      <div className="absolute inset-0 z-0 flex flex-col justify-between py-24 px-10 opacity-30 dark:opacity-10 pointer-events-none">
        <div className="flex flex-col gap-2 w-full">
          <div className="h-[1px] w-full bg-zinc-300 dark:bg-zinc-800" />
          <div className="h-[1px] w-full bg-zinc-300 dark:bg-zinc-800" />
          <div className="h-[1px] w-full bg-zinc-300 dark:bg-zinc-800" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="h-[1px] w-full bg-zinc-300 dark:bg-zinc-800" />
          <div className="h-[1px] w-full bg-zinc-300 dark:bg-zinc-800" />
          <div className="h-[1px] w-full bg-zinc-300 dark:bg-zinc-800" />
        </div>
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 container mx-auto mt-16 flex flex-col items-center px-4 text-center md:px-6"
      >
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
          {/* Status Label */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: baseDelay }}
            className="mb-8 flex items-center gap-2 rounded bg-[#e8e8e4] border border-[#d4d4d0] px-3 py-1 font-mono text-[9px] font-bold text-zinc-600 tracking-wider dark:bg-[#1a1a1a] dark:border-[#27272a] dark:text-zinc-400"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className={isPlaying ? 'absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f05523] opacity-75' : ''}></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#f05523]"></span>
            </span>
            SYSTEM ONLINE
          </motion.div>

          {/* Logo / Brand Name */}
          <div className={`mb-10 flex flex-col items-center ${syne.className}`}>
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: baseDelay + 0.1 }}
              className="text-center text-[12vw] leading-[0.9] font-extrabold tracking-tighter text-zinc-900 md:text-[8vw] lg:text-[7vw] dark:text-white"
            >
              <span className="block bg-linear-to-b from-zinc-800 to-black bg-clip-text text-transparent dark:from-white dark:to-zinc-300">
                ADITYA
              </span>
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: baseDelay + 0.2 }}
              className="text-[#f05523] text-[4vw] font-bold tracking-[0.6em] md:text-[2vw] lg:text-[1.8vw] mt-2 uppercase"
            >
              himaone
            </motion.h1>
          </div>

          {/* Subtitle */}
          <p className="animate-hero-desc mb-12 max-w-xl text-center text-sm font-light text-zinc-600 sm:text-base dark:text-zinc-400 font-mono tracking-tight lowercase">
            architecting clean code and minimal interfaces.
            <br className="hidden sm:block" /> frontend developer & industrial design enthusiast.
          </p>

          {/* Braun T 3 Styled Control Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: baseDelay + 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex w-full max-w-md flex-col gap-4 rounded border border-[#d4d4d0] bg-[#f4f4f0] p-4 shadow-lg dark:border-[#27272a] dark:bg-[#161616]"
          >
            {/* Metadata Section */}
            <div className="flex items-center justify-between border-b border-[#e4e4e0] pb-2 dark:border-[#202020]">
              <span className="font-mono text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                audio status: {isPlaying ? 'playing' : 'standby'}
              </span>
              <span className="font-mono text-[8px] font-bold text-[#f05523] truncate max-w-[200px]">
                {currentTrack.toLowerCase()}
              </span>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-4">
              {/* Play Plunger Button */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className={isPlaying
                  ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#c03d15] bg-[#f05523] text-white shadow-inner transition-all'
                  : 'flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#b8b8b0] bg-[#e8e8e4] text-zinc-700 hover:bg-[#eaeae6] active:translate-y-[1px] dark:border-[#2c2c2c] dark:bg-[#202020] dark:text-zinc-300 dark:hover:bg-[#282828]'}
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
              </button>

              {/* Progress Slider (Braun linear pointer design) */}
              <div className="relative flex-1 h-2 flex items-center">
                <div className="w-full h-[1px] bg-[#d8d8d0] dark:bg-[#2c2c2c]" />
                <motion.div
                  className="absolute h-4 w-1 bg-[#f05523]"
                  animate={{
                    left: isPlaying ? ['0%', '100%'] : '15%',
                  }}
                  transition={{
                    duration: isPlaying ? 30 : 0.5,
                    repeat: isPlaying ? Infinity : 0,
                    ease: 'linear',
                  }}
                />
              </div>

              {/* Jump to work */}
              <a
                href="#projects"
                className="flex h-10 shrink-0 items-center justify-center gap-1 rounded border border-[#b8b8b0] bg-[#e8e8e4] px-4 font-mono text-[9px] font-bold text-zinc-700 hover:bg-[#eaeae6] dark:border-[#2c2c2c] dark:bg-[#202020] dark:text-zinc-300 dark:hover:bg-[#282828]"
              >
                <span>tracks</span>
                <SkipForward size={10} />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
