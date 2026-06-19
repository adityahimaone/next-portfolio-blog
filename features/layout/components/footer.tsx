'use client'

import { motion, useInView } from 'motion/react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import {
  Play,
  Volume2,
  Radio,
  SkipBack,
  SkipForward,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import { Screw } from '@/components/screw'
import { SOCIAL_LINKS, FOOTER_NAVIGATION, TECH_STACK } from '../constants'

export function Footer() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isPlaying, setIsPlaying] = useState(true)

  const currentYear = new Date().getFullYear()

  return (
    <footer
      ref={ref}
      className="relative overflow-hidden bg-zinc-200 dark:bg-zinc-950 py-16 border-t border-zinc-300 dark:border-zinc-900 text-zinc-850 dark:text-zinc-300"
    >
      {/* Subtle Grid and Pattern spanning full screen width */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none opacity-40 dark:opacity-100" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-3 mix-blend-overlay" />

      {/* Decorative Screws at the outer edges of the screen */}
      <Screw className="absolute top-4 left-4 opacity-40 dark:opacity-60" />
      <Screw className="absolute top-4 right-4 opacity-40 dark:opacity-60" />
      <Screw className="absolute bottom-4 left-4 opacity-40 dark:opacity-60" />
      <Screw className="absolute right-4 bottom-4 opacity-40 dark:opacity-60" />

      {/* Standard Centered Container */}
      <div className="relative container mx-auto px-4 md:px-6 flex flex-col gap-8">
        
        {/* Top Board Rails */}
        <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-900 pb-4 font-mono text-[9px] text-zinc-500 tracking-[0.2em] uppercase">
          <span>DAW OUTPUT STAGE : SYSTEM CONTROL</span>
          <div className="flex gap-2">
            <span className="text-zinc-400 dark:text-zinc-700">•</span>
            <span>STEREO MONITORS</span>
            <span className="text-zinc-400 dark:text-zinc-700">•</span>
            <span className="text-green-600 dark:text-green-500 animate-pulse font-bold">READY</span>
          </div>
        </div>

        {/* Main Controls Deck */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          
          {/* Left: Track Information / Waveform */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-300 border border-zinc-400 shadow-md dark:bg-zinc-900 dark:border-zinc-850">
                <Radio className={`h-5 w-5 ${isPlaying ? 'text-primary animate-pulse' : 'text-zinc-500 dark:text-zinc-650'}`} />
              </div>
              <div className="min-w-0 text-left">
                <h3 className="truncate font-mono text-sm font-bold text-zinc-800 dark:text-zinc-200 tracking-wider">
                  ADITYAHIMAONE.MIX
                </h3>
                <p className="font-mono text-[9px] text-zinc-500 uppercase">
                  Master Out // 44.1 kHz 24-bit
                </p>
              </div>
            </div>

            {/* Decorative Audio Waveform */}
            <div className="h-10 flex items-end gap-[2px] bg-zinc-300/40 rounded border border-zinc-350 dark:bg-zinc-900/40 dark:border-zinc-900/80 px-3 py-1.5 overflow-hidden">
              {[...Array(32)].map((_, i) => {
                const heights = [20, 45, 30, 60, 25, 75, 40, 90, 35, 50, 70, 40, 20, 50, 85, 30, 40, 60, 20, 80, 50, 30, 70, 90, 40, 25, 60, 35, 55, 45, 30, 15]
                return (
                  <motion.div
                    key={i}
                    className="flex-1 bg-zinc-500 dark:bg-zinc-800 rounded-t-[1px]"
                    animate={isPlaying ? {
                      height: [`${heights[i] * 0.3}%`, `${heights[i]}%`, `${heights[i] * 0.3}%`]
                    } : { height: '10%' }}
                    transition={{
                      duration: 1.2 + (i % 3) * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.02
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Middle: DAP Tape Deck Transport Controls */}
          <div className="lg:col-span-4 flex flex-col items-center gap-4">
            {/* Transport Control Buttons */}
            <div className="flex items-center gap-4 rounded-full bg-zinc-300/80 border border-zinc-400/50 dark:bg-zinc-900/60 dark:border-zinc-850 p-2 shadow-inner">
              <button
                onClick={() => setIsPlaying(false)}
                className="p-2 rounded-full text-zinc-600 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors hover:bg-zinc-400/20 dark:hover:bg-zinc-855"
                title="Stop"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                className="p-2 rounded-full text-zinc-600 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors hover:bg-zinc-400/20 dark:hover:bg-zinc-855"
                title="Previous Track"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              
              {/* Master Play Switch */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-3.5 rounded-full shadow-lg border transition-all duration-300 ${
                  isPlaying 
                    ? 'bg-primary border-primary/20 text-white shadow-primary/30 scale-105' 
                    : 'bg-zinc-400/30 border-zinc-400 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                }`}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <Play className={`h-5 w-5 ${isPlaying ? 'fill-white' : ''}`} />
              </button>

              <button
                className="p-2 rounded-full text-zinc-600 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors hover:bg-zinc-400/20 dark:hover:bg-zinc-855"
                title="Next Track"
              >
                <SkipForward className="h-4 w-4" />
              </button>
              <div className="h-8 w-px bg-zinc-400 dark:bg-zinc-850" />
              <div className="px-2 flex items-center gap-1.5 font-mono">
                <Volume2 className="h-4 w-4 text-zinc-600 dark:text-zinc-650" />
                <span className="text-[9px] text-zinc-600 dark:text-zinc-500 font-bold">0dB</span>
              </div>
            </div>

            {/* Labeled Controls Grid */}
            <div className="flex gap-4 font-mono text-[8px] text-zinc-500 font-bold tracking-widest uppercase">
              <span className={isPlaying ? 'text-primary animate-pulse' : ''}>• L-PLAY</span>
              <span>• R-SYNC</span>
              <span>• AUTO-GAIN</span>
            </div>
          </div>

          {/* Right: Sockets Mixer (Social Channels) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="font-mono text-[9px] font-bold text-zinc-500 tracking-wider uppercase text-left">
              Routing Terminals (Social Connections)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded border border-zinc-350 bg-zinc-300/30 hover:bg-zinc-300/80 hover:border-zinc-400 dark:border-zinc-900 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/80 dark:hover:border-zinc-800 transition-all font-mono"
                >
                  <div className="min-w-0 text-left">
                    <span className="block text-[8px] text-zinc-550 dark:text-zinc-500 uppercase tracking-widest">
                      {link.name}
                    </span>
                    <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 truncate">
                      {link.label}
                    </span>
                  </div>
                  {/* Glowing LED Socket */}
                  <div className="h-4 w-4 rounded-full bg-zinc-200 border border-zinc-350 dark:bg-zinc-950 dark:border-zinc-900 flex items-center justify-center shrink-0">
                    <div className={`h-2 w-2 rounded-full transition-all duration-300 ${isPlaying ? 'bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.8)]' : 'bg-zinc-400 dark:bg-zinc-850'}`} />
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Sub Navigation and Technical Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-zinc-300 dark:border-zinc-900 pt-6">
          
          {/* Nav Items */}
          <div className="flex flex-col gap-2 text-left">
            <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
              Console Index Channels
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {FOOTER_NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-xs font-bold text-zinc-600 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                  {item.name.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-col gap-2 text-left md:col-span-2">
            <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
              Active Console Technical Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="rounded bg-zinc-300/80 border border-zinc-350 dark:bg-zinc-900 dark:border-zinc-850 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-650 dark:text-zinc-500 uppercase tracking-tight"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Metatags Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-300 dark:border-zinc-900 pt-6 text-[10px] text-zinc-550 dark:text-zinc-650 font-mono gap-4">
          <span>
            © {currentYear} ADITYAHIMAONE // PORTFOLIO MIXER STAGE
          </span>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>OUT STAGE ACTIVE // LO-CUT FILTERS ENABLED</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
