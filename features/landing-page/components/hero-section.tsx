'use client'

import { useRef, useState, useEffect } from 'react'
import { m as motion, AnimatePresence } from 'motion/react'
import { Play, Pause, SkipForward, Radio, Settings, Disc, Volume2 } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { Syne } from 'next/font/google'
import { OscilloscopeBackground } from '@/components/oscilloscope-background'
import { cn } from '@/lib/utils'

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

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-[#08080a] py-20"
    >
      {/* Background Oscilloscope */}
      <OscilloscopeBackground className="absolute inset-0 z-0 opacity-40 dark:opacity-60">
        <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.15)_100%) dark:bg-radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)" />
        <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
      </OscilloscopeBackground>

      {/* Main Structural Asymmetric Layout (Hallmark Editorial Grid) */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 mt-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Huge typography and System parameters */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Session Indicator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: baseDelay }}
              className="flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white/60 px-3.5 py-1 text-xs font-bold text-zinc-800 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-black/60 dark:text-zinc-200"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              CONSOLE ONLINE // DECK_01
            </motion.div>

            {/* Massive Heading (Syne font) */}
            <div className={syne.className}>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: baseDelay + 0.1 }}
                className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-none text-zinc-900 dark:text-white"
              >
                ADITYA
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: baseDelay + 0.2 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[0.2em] leading-none text-blue-600 dark:text-blue-400 mt-2"
              >
                HIMAONE
              </motion.h1>
            </div>

            {/* Descriptive subhead */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: baseDelay + 0.4 }}
              className="text-lg sm:text-xl text-zinc-655 dark:text-zinc-400 font-medium max-w-xl leading-relaxed"
            >
              Orchestrating robust React architecture and interactive design patterns into premium digital instruments.
            </motion.p>

            {/* Tech Readouts / Knobs Matrix */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: baseDelay + 0.6 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              {[
                { label: 'ROLE', val: 'FRONTEND ENG.' },
                { label: 'GENRE', val: 'INTERACTIVE UI' },
                { label: 'STATUS', val: 'OPERATIONAL' },
              ].map((spec) => (
                <div
                  key={spec.label}
                  className="flex flex-col border-l-2 border-blue-500/50 bg-zinc-200/20 px-3.5 py-1.5 backdrop-blur-xs dark:bg-black/30"
                >
                  <span className="text-[9px] font-bold tracking-widest text-zinc-550 dark:text-zinc-500">{spec.label}</span>
                  <span className="font-mono text-xs font-black text-zinc-900 dark:text-zinc-150">{spec.val}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: VST Synthesizer Hardware Console */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: baseDelay + 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-2xl border-2 border-zinc-400 bg-zinc-200/90 p-6 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90"
            >
              {/* Metal Corner Screws */}
              <div className="absolute top-3 left-3 h-2 w-2 rounded-full bg-zinc-450 dark:bg-zinc-700 shadow-inner border border-black/20" />
              <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-zinc-450 dark:bg-zinc-700 shadow-inner border border-black/20" />
              <div className="absolute bottom-3 left-3 h-2 w-2 rounded-full bg-zinc-450 dark:bg-zinc-700 shadow-inner border border-black/20" />
              <div className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-zinc-450 dark:bg-zinc-700 shadow-inner border border-black/20" />

              <div className="flex flex-col gap-5">
                
                {/* Hardware header */}
                <div className="flex justify-between items-center border-b border-zinc-350 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-blue-500 animate-pulse" />
                    <span className="font-mono text-[9px] font-bold text-zinc-600 dark:text-zinc-400 tracking-wider">
                      RECEIVER MODEL DECK_01
                    </span>
                  </div>
                  <Settings className="h-3.5 w-3.5 text-zinc-500 hover:rotate-90 transition-transform cursor-pointer" />
                </div>

                {/* Cassette Tape Spindle Reels */}
                <div className="flex justify-center gap-8 bg-zinc-950 p-6 rounded-lg border-2 border-zinc-350 dark:border-zinc-850 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
                  
                  {/* Reel 1 */}
                  <motion.div
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-zinc-800 bg-black shadow-md shrink-0"
                  >
                    <Disc className="h-10 w-10 text-zinc-650" />
                    <div className="absolute h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-900 border" />
                  </motion.div>

                  {/* Reel 2 */}
                  <motion.div
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-zinc-800 bg-black shadow-md shrink-0"
                  >
                    <Disc className="h-10 w-10 text-zinc-650" />
                    <div className="absolute h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-900 border" />
                  </motion.div>
                </div>

                {/* LCD Display */}
                <div className="flex flex-col items-start gap-1.5 rounded border border-zinc-400 bg-zinc-900 p-3 shadow-inner dark:border-zinc-800 dark:bg-black">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-mono text-[8px] font-black text-zinc-500 tracking-widest uppercase">
                      STATUS: {isPlaying ? 'PLAYING' : 'STANDBY'}
                    </span>
                    <div className="flex gap-1">
                      <div className={cn("h-1.5 w-1.5 rounded-full", isPlaying ? "bg-green-500 animate-pulse" : "bg-zinc-700")} />
                      <div className={cn("h-1.5 w-1.5 rounded-full", isPlaying ? "bg-blue-500 animate-pulse" : "bg-zinc-700")} />
                    </div>
                  </div>

                  {/* Track text */}
                  <div className="w-full overflow-hidden border-t border-white/5 pt-1.5">
                    <motion.p
                      className="font-mono text-xs font-bold text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] truncate text-left"
                      animate={isPlaying ? { opacity: [0.8, 1, 0.8] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {currentTrack || 'NO SIGNAL // STANDBY'}
                    </motion.p>
                  </div>
                </div>

                {/* Deck Action buttons */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <Magnetic intensity={0.25}>
                    <button
                      onClick={togglePlay}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-zinc-100 to-zinc-300 shadow-md border border-zinc-400 dark:from-zinc-700 dark:to-zinc-800 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer active:scale-95 transition-transform"
                    >
                      {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </button>
                  </Magnetic>

                  {/* Faux Equalizer Slider */}
                  <div className="flex-1 flex items-center gap-3">
                    <Volume2 className="h-4 w-4 text-zinc-500" />
                    <div className="relative flex-1 h-6 flex items-center">
                      <div className="w-full h-1 bg-zinc-400 dark:bg-zinc-850 rounded" />
                      <div className="absolute h-1 bg-blue-500 rounded" style={{ width: isPlaying ? '75%' : '15%' }} />
                      <div className="absolute h-4 w-2 rounded bg-zinc-100 border border-zinc-400 dark:bg-zinc-750 dark:border-zinc-650 cursor-pointer" style={{ left: isPlaying ? '75%' : '15%' }} />
                    </div>
                  </div>

                  <Magnetic intensity={0.25}>
                    <a
                      href="#projects"
                      className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-350 bg-zinc-300 px-4 text-[10px] font-black text-zinc-850 hover:bg-zinc-350 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-250 dark:hover:bg-zinc-750 transition-colors"
                    >
                      CATALOG
                      <SkipForward size={12} />
                    </a>
                  </Magnetic>
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
