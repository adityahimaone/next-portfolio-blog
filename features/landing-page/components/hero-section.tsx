'use client'

import { useRef, useState, useEffect } from 'react'
import { m as motion, useScroll, useTransform, useSpring } from 'motion/react'
import { Play, Pause, SkipForward } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { cn } from '@/lib/utils'

// --- 1. EqBackground Component (Pure CSS GPU-driven EQ) ---
const EQ_VARIANTS = ['variant-a', 'variant-b', 'variant-c', 'variant-d', 'variant-e']

function EqBackground() {
  const bars = Array.from({ length: 60 }, (_, i) => ({
    variant: EQ_VARIANTS[i % 5],
    delay: `${(i * 0.04).toFixed(2)}s`,
    opacity: 0.12 + (i % 3) * 0.04,
  }))

  const secondaryBars = Array.from({ length: 30 }, (_, i) => ({
    variant: EQ_VARIANTS[(i * 2) % 5],
    delay: `${(i * 0.08).toFixed(2)}s`,
    opacity: 0.04,
  }))

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Primary Cyan EQ Bars */}
      <div className="absolute bottom-0 inset-x-0 h-48 flex items-end justify-between px-2 gap-[3px]">
        {bars.map((bar, i) => (
          <div
            key={`bar-p-${i}`}
            className={cn(
              'flex-1 w-[2px] bg-cyan-400 dark:bg-cyan-500 rounded-t origin-bottom',
              bar.variant === 'variant-a' && 'animate-[eq-a_0.8s_ease-in-out_infinite_alternate]',
              bar.variant === 'variant-b' && 'animate-[eq-b_1.1s_ease-in-out_infinite_alternate]',
              bar.variant === 'variant-c' && 'animate-[eq-c_0.75s_ease-in-out_infinite_alternate]',
              bar.variant === 'variant-d' && 'animate-[eq-d_1.3s_ease-in-out_infinite_alternate]',
              bar.variant === 'variant-e' && 'animate-[eq-e_0.95s_ease-in-out_infinite_alternate]'
            )}
            style={{
              animationDelay: bar.delay,
              opacity: bar.opacity,
            }}
          />
        ))}
      </div>

      {/* Background/Depth EQ Bars */}
      <div className="absolute bottom-0 inset-x-0 h-72 flex items-end justify-around px-8 gap-3 blur-xs">
        {secondaryBars.map((bar, i) => (
          <div
            key={`bar-s-${i}`}
            className={cn(
              'w-[4px] bg-cyan-400 dark:bg-cyan-600 rounded-t origin-bottom',
              bar.variant === 'variant-a' && 'animate-[eq-a_1.4s_ease-in-out_infinite_alternate]',
              bar.variant === 'variant-b' && 'animate-[eq-b_1.8s_ease-in-out_infinite_alternate]',
              bar.variant === 'variant-c' && 'animate-[eq-c_1.2s_ease-in-out_infinite_alternate]',
              bar.variant === 'variant-d' && 'animate-[eq-d_2.1s_ease-in-out_infinite_alternate]',
              bar.variant === 'variant-e' && 'animate-[eq-e_1.6s_ease-in-out_infinite_alternate]'
            )}
            style={{
              animationDelay: bar.delay,
              opacity: bar.opacity,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// --- 2. AlbumArt Component (CSS-conic gradient) ---
function AlbumArt({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="relative group h-32 w-32 shrink-0 md:h-36 md:w-36 overflow-hidden rounded-xl border border-white/10 shadow-2xl transition-transform duration-300 hover:scale-105 active:scale-95">
      
      {/* Conic Gradient Rotator */}
      <div
        className="absolute inset-0"
        style={{
          background: 'conic-gradient(from var(--hue-rotate, 0deg), #22D3EE 0deg, #0F1118 90deg, #F59E0B 180deg, #0F1118 270deg, #22D3EE 360deg)',
          animation: `album-spin ${isPlaying ? '20s' : '60s'} linear infinite`,
          boxShadow: isPlaying ? 'inset 0 0 20px rgba(34,211,238,0.4)' : 'none',
        }}
      />

      {/* Bevel Corner Overlay via clip path */}
      <div className="absolute inset-0 border border-white/20 rounded-xl" />

      {/* Grid Scanlines Overlay */}
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

      {/* Inner vinyl grooves detail */}
      <div className="absolute inset-2 rounded-full border border-white/5 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] opacity-80" />
      <div className="absolute inset-8 rounded-full border border-white/10" />
      <div className="absolute inset-12 rounded-full border border-white/15 bg-black/40 flex items-center justify-center">
        {/* Glowing peak center */}
        <div className={cn("h-3 w-3 rounded-full transition-colors", isPlaying ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" : "bg-zinc-700")} />
      </div>
    </div>
  )
}

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

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  // Progress bar scroll mapping
  const scrollSpring = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#05060A] py-20 select-none"
    >
      {/* Background EQ Columns */}
      <EqBackground />

      {/* Subtle orbs glow */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 container mx-auto px-4 md:px-8 mt-12 flex justify-center max-w-5xl"
      >
        {/* DAP "Now Playing" Display Card */}
        <div className="w-full rounded-2xl border border-white/[0.06] bg-[#0F1118]/85 p-6 md:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
          
          {/* Card Header Rails */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6 font-mono text-[9px] text-[#94A3B8] tracking-[0.2em] uppercase">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
              <span>Input Stage: active</span>
            </div>
            <span>[AH-SP3000]</span>
          </div>

          {/* Main Info Body Block */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-8 text-left">
            
            {/* Left: Conic Album Artwork */}
            <AlbumArt isPlaying={isPlaying} />

            {/* Right: Space Grotesk Names & JetBrains Mono Metadata */}
            <div className="flex-1 flex flex-col justify-between h-full min-w-0">
              <div>
                <span className="font-mono text-[9px] tracking-widest text-[#94A3B8]/60 uppercase">Now Playing</span>
                <h1 className="font-sans font-black text-5xl md:text-6xl tracking-tighter text-[#E2E8F0] mt-1 font-[family-name:var(--font-space-grotesk)]">
                  ADITYA
                </h1>
                <h2 className="font-sans font-normal text-3xl md:text-4xl tracking-[0.18em] text-[#22D3EE] font-[family-name:var(--font-space-grotesk)] leading-tight uppercase">
                  HIMAONE
                </h2>
              </div>

              {/* Monospace Metadata console grid */}
              <div className="grid grid-cols-1 gap-y-1.5 mt-6 border-t border-white/[0.04] pt-4 font-mono text-[10px] tracking-wide">
                <div className="flex items-baseline">
                  <span className="w-24 text-[#3D4A5C] font-bold">FREQUENCY  :</span>
                  <span className="text-[#94A3B8] font-bold">FULL-STACK FRONTEND</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-24 text-[#3D4A5C] font-bold">SAMPLE RATE:</span>
                  <span className="text-[#94A3B8]">NEXT.JS · REACT · TS</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-24 text-[#3D4A5C] font-bold">BITRATE    :</span>
                  <span className="text-[#94A3B8]">2021 – PRESENT · JAKARTA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Scroll Progress Bar */}
          <div className="flex flex-col gap-1.5 mb-8">
            <div className="relative w-full h-1 bg-[#161B26] rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#22D3EE] to-cyan-500 rounded-full"
                style={{ width: useTransform(scrollSpring, [0, 1], ['0%', '100%']) }}
              />
            </div>
            <div className="flex justify-between font-mono text-[8px] text-[#3D4A5C] tracking-widest font-black uppercase">
              <span>00:00 [INTRO]</span>
              <span>SCROLL INDEX TO LOAD</span>
              <span>06:42 [OUTRO]</span>
            </div>
          </div>

          {/* Controller buttons (Cyan and Amber colors) */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Play trigger button */}
            <Magnetic intensity={0.2}>
              <button
                onClick={togglePlay}
                className="w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2.5 rounded-lg border border-[#22D3EE] bg-transparent py-3 text-xs font-bold tracking-widest text-[#22D3EE] hover:bg-[#22D3EE]/10 cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all font-mono uppercase"
              >
                {isPlaying ? (
                  <>
                    <Pause size={13} fill="currentColor" />
                    PAUSE OUT
                  </>
                ) : (
                  <>
                    <Play size={13} fill="currentColor" className="ml-0.5" />
                    PLAY PATH
                  </>
                )}
              </button>
            </Magnetic>

            {/* Skip tracks project redirection */}
            <Magnetic intensity={0.2}>
              <a
                href="#projects"
                className="w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2.5 rounded-lg bg-[#F59E0B] py-3 text-xs font-bold tracking-widest text-[#05060A] hover:brightness-110 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_16px_rgba(245,158,11,0.4)] transition-all font-mono uppercase"
              >
                SKIP TRACKS
                <SkipForward size={13} className="stroke-[2.5]" />
              </a>
            </Magnetic>

            {/* Inactive details track status */}
            <div className="hidden sm:block ml-auto font-mono text-[9px] text-[#3D4A5C] font-bold tracking-widest uppercase">
              DE-EMPHASIS: AUTO // DAC: RESISTOR_LADDER
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  )
}
