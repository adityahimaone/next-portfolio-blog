'use client'

import { useRef, useState, useEffect } from 'react'
import { m as motion, AnimatePresence } from 'motion/react'
import { Play, Pause, SkipForward, Radio, Sliders, Volume2, Music, Sparkles } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { Syne } from 'next/font/google'
import { FlowingLinesBackground } from '@/components/flowing-lines-background'
import { cn } from '@/lib/utils'

const syne = Syne({ weight: ['700', '800'], subsets: ['latin'] })

export function HeroSection() {
  const [baseDelay, setBaseDelay] = useState(1)
  const [eqHigh, setEqHigh] = useState(80)
  const [eqMid, setEqMid] = useState(65)
  const [eqBass, setEqBass] = useState(90)
  const [eqVolume, setEqVolume] = useState(75)

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
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-[#09090b] py-24"
    >
      {/* Premium Flowing Lines Background */}
      <FlowingLinesBackground className="absolute inset-0 z-0 opacity-50 dark:opacity-70" lineCount={12}>
        <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%) dark:bg-radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)" />
        <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-8 mix-blend-overlay" />
      </FlowingLinesBackground>

      {/* Main Asymmetric Grid Layout */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 mt-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Big Editorial Typography & Intro */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Live Session Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: baseDelay }}
              className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-black text-blue-600 dark:text-blue-400 shadow-sm"
            >
              <Music className="h-3.5 w-3.5 animate-pulse" />
              PORTFOLIO MIXER STAGE
            </motion.div>

            {/* Editorial Name Header */}
            <div className={cn(syne.className, "space-y-1")}>
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: baseDelay + 0.1 }}
                className="text-6xl sm:text-8xl font-extrabold tracking-tighter leading-none text-zinc-900 dark:text-white"
              >
                ADITYA
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: baseDelay + 0.2 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-4xl sm:text-5xl font-light text-zinc-400 dark:text-zinc-650 tracking-widest font-mono">/</span>
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-none bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent italic dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                  HIMAONE
                </h1>
              </motion.div>
            </div>

            {/* Premium Bio */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: baseDelay + 0.3 }}
              className="text-base sm:text-lg text-zinc-650 dark:text-zinc-400 font-medium max-w-xl leading-relaxed"
            >
              Bridging robust Next.js server logic and high-fidelity client animations. Just as a producer structures rhythms, I assemble clean React architecture to create memorable digital user interfaces.
            </motion.p>

            {/* Custom Interactive Quick Action */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: baseDelay + 0.5 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              {[
                { label: 'STACK CORE', val: 'Next.js App Router' },
                { label: 'DESIGN SYS', val: 'Tailwind + HSL' },
                { label: 'ANIMATIONS', val: 'Motion / React Bits' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-zinc-300 bg-white/40 px-4 py-2 backdrop-blur-md dark:border-zinc-800 dark:bg-black/40 shadow-xs text-left"
                >
                  <div className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">{item.label}</div>
                  <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{item.val}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: High-Fidelity Synthesizer / Studio Controller */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: baseDelay + 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-3xl border-2 border-zinc-300 bg-linear-to-b from-zinc-100 to-zinc-200 p-6 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950"
            >
              {/* Rack mount details */}
              <div className="absolute top-4 left-4 h-2 w-2 rounded-full bg-zinc-450 dark:bg-zinc-700 shadow-inner border border-black/10" />
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-zinc-450 dark:bg-zinc-700 shadow-inner border border-black/10" />
              <div className="absolute bottom-4 left-4 h-2 w-2 rounded-full bg-zinc-450 dark:bg-zinc-700 shadow-inner border border-black/10" />
              <div className="absolute bottom-4 right-4 h-2 w-2 rounded-full bg-zinc-450 dark:bg-zinc-700 shadow-inner border border-black/10" />

              <div className="flex flex-col gap-6">
                
                {/* Console header */}
                <div className="flex items-center justify-between border-b border-zinc-350 dark:border-zinc-800 pb-2">
                  <span className="font-mono text-[9px] font-black text-zinc-550 dark:text-zinc-450 tracking-wider flex items-center gap-1.5 uppercase">
                    <Radio className="h-4 w-4 text-blue-500 animate-pulse" />
                    Eurorack Controller Deck
                  </span>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                </div>

                {/* Synth Param Faders Matrix (Fully interactive local sliders) */}
                <div className="rounded-2xl border border-zinc-300 bg-zinc-50 p-5 dark:border-zinc-850 dark:bg-black/40 shadow-inner flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] font-black text-zinc-500 uppercase tracking-widest">Console EQ Parameters</span>
                    <Sliders className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  
                  {/* EQ Channels */}
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'HIGH', val: eqHigh, setVal: setEqHigh, color: 'bg-blue-500' },
                      { label: 'MID', val: eqMid, setVal: setEqMid, color: 'bg-indigo-500' },
                      { label: 'BASS', val: eqBass, setVal: setEqBass, color: 'bg-purple-500' },
                      { label: 'GAIN', val: eqVolume, setVal: setEqVolume, color: 'bg-emerald-500' },
                    ].map((ch) => (
                      <div key={ch.label} className="flex items-center gap-4">
                        <span className="w-8 text-[10px] font-black text-zinc-500 font-mono tracking-wider">{ch.label}</span>
                        <div className="relative flex-1 h-6 flex items-center">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={ch.val}
                            onChange={(e) => ch.setVal(Number(e.target.value))}
                            className="w-full h-1 bg-zinc-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>
                        <span className="w-8 font-mono text-[10px] font-bold text-right text-zinc-700 dark:text-zinc-300">{ch.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Receiver / Track Display */}
                <div className="flex flex-col gap-1.5 rounded-xl border border-zinc-300 bg-zinc-900 p-4 shadow-inner dark:border-zinc-800 dark:bg-black">
                  <div className="flex justify-between items-center text-[8px] font-black text-zinc-500 font-mono tracking-widest">
                    <span>RECEIVER STATUS: {isPlaying ? 'ACTIVE' : 'STANDBY'}</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-2 w-2 text-amber-500" />
                      44.1 KHZ
                    </span>
                  </div>
                  <div className="border-t border-white/5 pt-2">
                    <p className="font-mono text-xs font-bold text-amber-500 tracking-wider truncate text-left shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                      {isPlaying ? currentTrack : 'SYSTEM GATE: STANDBY'}
                    </p>
                  </div>
                </div>

                {/* Transport Buttons / Catalog link */}
                <div className="flex items-center justify-between gap-4">
                  <Magnetic intensity={0.2}>
                    <button
                      onClick={togglePlay}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-zinc-100 to-zinc-350 shadow-md border border-zinc-400 text-zinc-800 dark:from-zinc-700 dark:to-zinc-800 dark:border-zinc-700 dark:text-zinc-200 cursor-pointer active:scale-95 transition-transform"
                    >
                      {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                    </button>
                  </Magnetic>

                  <div className="h-8 w-px bg-zinc-350 dark:bg-zinc-800" />

                  <Magnetic intensity={0.2}>
                    <a
                      href="#projects"
                      className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-350 bg-zinc-350 text-xs font-black text-zinc-850 hover:bg-zinc-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-750 transition-colors shadow-sm"
                    >
                      EXPLORE RELEASES
                      <SkipForward size={14} />
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
