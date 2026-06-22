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
  Cable,
  Activity,
  Sliders,
} from 'lucide-react'
import { Screw } from '@/components/screw'
import { SOCIAL_LINKS, FOOTER_NAVIGATION, TECH_STACK } from '../constants'

export function Footer() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isPlaying, setIsPlaying] = useState(true)
  const [selectedJack, setSelectedJack] = useState<string | null>(null)
  const [limiterGain, setLimiterGain] = useState(85) // default 85%

  const currentYear = new Date().getFullYear()

  // Dynamic degrees for decorative knobs
  const knobRotation = (limiterGain / 100) * 270 - 135 // -135deg to +135deg

  return (
    <footer
      ref={ref}
      className="relative overflow-hidden bg-zinc-200 dark:bg-[#0c0c0e] py-20 border-t-4 border-zinc-450 dark:border-zinc-900 text-zinc-800 dark:text-zinc-300 shadow-[inset_0_4px_20px_rgba(0,0,0,0.15)]"
    >
      {/* Subtle Grid and Pattern spanning full screen width */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40 dark:opacity-100" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-3 mix-blend-overlay" />

      {/* Decorative Screws at the outer edges of the screen */}
      <Screw className="absolute top-6 left-6 opacity-50 dark:opacity-70" />
      <Screw className="absolute top-6 right-6 opacity-50 dark:opacity-70" />
      <Screw className="absolute bottom-6 left-6 opacity-50 dark:opacity-70" />
      <Screw className="absolute right-6 bottom-6 opacity-50 dark:opacity-70" />

      {/* Outer steel frame borders (Eurorack look) */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-zinc-300 via-zinc-450 to-zinc-300 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 opacity-60" />
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-zinc-300 via-zinc-450 to-zinc-300 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 opacity-60" />

      {/* Standard Centered Container */}
      <div className="relative container mx-auto px-4 md:px-8 flex flex-col gap-10">
        
        {/* Top Board Rails */}
        <div className="flex items-center justify-between border-b border-zinc-350 dark:border-zinc-850 pb-4 font-mono text-[9px] text-zinc-550 dark:text-zinc-500 tracking-[0.25em] uppercase">
          <span className="flex items-center gap-1.5 font-bold">
            <Activity className="h-3 w-3 text-primary animate-pulse" />
            EURORACK PORTFOLIO OUTPUT MODULE v4.0
          </span>
          <div className="flex gap-3">
            <span>MONO FILTER: OFF</span>
            <span className="text-zinc-400 dark:text-zinc-700">|</span>
            <span>OUT GAIN: +0.2dB</span>
            <span className="text-zinc-400 dark:text-zinc-700">|</span>
            <span className="text-emerald-600 dark:text-emerald-400 animate-pulse font-black">Ready</span>
          </div>
        </div>

        {/* Main Controls Deck */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
          
          {/* Left Block: Master Channel Strip (VU Meter & Waves) */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-zinc-350 bg-zinc-300/40 p-5 dark:border-zinc-900 dark:bg-zinc-950/40 shadow-inner">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-350 border border-zinc-400 shadow-md dark:bg-zinc-900 dark:border-zinc-850">
                  <Radio className={`h-5 w-5 ${isPlaying ? 'text-blue-500 dark:text-blue-400 animate-pulse' : 'text-zinc-500'}`} />
                </div>
                <div className="min-w-0 text-left">
                  <h3 className="truncate font-mono text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-wider">
                    MASTER_OUT.MIX
                  </h3>
                  <p className="font-mono text-[9px] text-zinc-500 uppercase font-bold">
                    44.1 kHz // 32-Bit Float
                  </p>
                </div>
              </div>

              {/* Limiter knob slider controller */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  className="relative h-10 w-10 rounded-full border border-zinc-400 bg-gradient-to-b from-zinc-100 to-zinc-350 shadow-md dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 cursor-pointer flex items-center justify-center select-none"
                  style={{ transform: `rotate(${knobRotation}deg)` }}
                  onClick={() => setLimiterGain(prev => prev >= 100 ? 20 : prev + 20)}
                  title="Click to dial Master Volume"
                >
                  {/* Notch */}
                  <div className="absolute top-0.5 h-3 w-1 rounded bg-blue-500 dark:bg-blue-400" />
                </div>
                <span className="font-mono text-[8px] font-black text-zinc-550 dark:text-zinc-450">LIMITER</span>
              </div>
            </div>

            {/* Segmented LED VU Meter Waveform */}
            <div className="mt-4 flex flex-col gap-1 bg-zinc-950 p-3 rounded-lg border-2 border-zinc-400/30 dark:border-zinc-850">
              <div className="flex justify-between font-mono text-[7px] text-zinc-650 font-bold select-none border-b border-white/5 pb-1">
                <span>-40dB</span>
                <span>-20dB</span>
                <span>-6dB</span>
                <span>0dB (CLIP)</span>
              </div>
              <div className="h-12 flex items-end gap-[2px] pt-1 overflow-hidden">
                {[...Array(32)].map((_, i) => {
                  // Real-looking spectrum analyzer curves
                  const baseH = [15, 30, 45, 60, 40, 75, 55, 90, 80, 70, 85, 60, 50, 70, 95, 80, 65, 85, 45, 75, 60, 40, 65, 80, 50, 35, 55, 40, 48, 32, 20, 10]
                  const h = isPlaying ? baseH[i] * (limiterGain / 100) : 8

                  // Colors: green for low, yellow for mid, red for high
                  const barColor = i > 27 
                    ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]' 
                    : i > 20 
                    ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]' 
                    : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'

                  return (
                    <motion.div
                      key={i}
                      className={`flex-1 ${barColor} rounded-t-[1px]`}
                      animate={isPlaying ? {
                        height: [`${h * 0.4}%`, `${h}%`, `${h * 0.4}%`]
                      } : { height: '10%' }}
                      transition={{
                        duration: 1.0 + (i % 4) * 0.15,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.015
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Middle Block: Synthesizer Tape Controls & Param Faders */}
          <div className="lg:col-span-4 flex flex-col justify-between items-center rounded-2xl border border-zinc-350 bg-zinc-300/40 p-5 dark:border-zinc-900 dark:bg-zinc-950/40 shadow-inner gap-4">
            <span className="font-mono text-[9px] font-black text-zinc-550 dark:text-zinc-500 tracking-widest uppercase">
              TRANSPORT CONTROL // GATE SYNC
            </span>

            {/* Transport Panel */}
            <div className="flex items-center gap-4 rounded-full bg-zinc-350/90 border border-zinc-400/50 dark:bg-zinc-900 dark:border-zinc-850 p-2.5 shadow-lg relative">
              <button
                onClick={() => setIsPlaying(false)}
                className="p-2.5 rounded-full text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors hover:bg-zinc-400/20 dark:hover:bg-zinc-800"
                title="Stop Out"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                className="p-2.5 rounded-full text-zinc-655 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors hover:bg-zinc-400/20 dark:hover:bg-zinc-800"
                title="Prev Channel"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              
              {/* Massive Center Play Toggle */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-4 rounded-full shadow-2xl border transition-all duration-300 cursor-pointer ${
                  isPlaying 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/25 scale-105 hover:bg-blue-500' 
                    : 'bg-zinc-400/30 border-zinc-450 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                }`}
                title={isPlaying ? 'Mute Console' : 'Activate Console'}
              >
                <Play className={`h-5 w-5 ${isPlaying ? 'fill-white' : ''}`} />
              </button>

              <button
                className="p-2.5 rounded-full text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors hover:bg-zinc-400/20 dark:hover:bg-zinc-800"
                title="Next Channel"
              >
                <SkipForward className="h-4 w-4" />
              </button>
              
              <div className="h-8 w-px bg-zinc-400 dark:bg-zinc-800" />
              <div className="px-2 flex items-center gap-1 font-mono">
                <Volume2 className="h-4 w-4 text-zinc-650 dark:text-zinc-550 animate-pulse" />
                <span className="text-[9px] text-zinc-900 dark:text-zinc-100 font-bold">{limiterGain}%</span>
              </div>
            </div>

            {/* Signal Control Indicators */}
            <div className="flex gap-6 font-mono text-[8px] text-zinc-550 dark:text-zinc-400 font-black tracking-widest uppercase">
              <span className={isPlaying ? 'text-blue-500 dark:text-blue-400 animate-pulse' : ''}>• OSC-ON</span>
              <span>• MIDI-ACTIVE</span>
              <span className="flex items-center gap-1">
                <Sliders className="h-3 w-3" />
                AUTO-MIX
              </span>
            </div>
          </div>

          {/* Right Block: Sockets Patchbay (Social Channels) */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-zinc-350 bg-zinc-300/40 p-5 dark:border-zinc-900 dark:bg-zinc-950/40 shadow-inner">
            <span className="font-mono text-[9px] font-black text-zinc-550 dark:text-zinc-500 tracking-wider uppercase text-left flex items-center gap-1.5">
              <Cable className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              Patchbay routing jacks
            </span>
            
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              {SOCIAL_LINKS.map((link) => {
                const isActive = selectedJack === link.name

                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setSelectedJack(link.name)}
                    className={`flex items-center justify-between rounded-xl border p-3 font-mono transition-all relative overflow-hidden cursor-pointer ${
                      isActive 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-400 shadow-md'
                        : 'border-zinc-350 bg-zinc-300/30 hover:bg-zinc-300/60 dark:border-zinc-900 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60 text-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    <div className="min-w-0 text-left relative z-10">
                      <span className="block text-[8px] text-zinc-500 uppercase tracking-widest font-black">
                        {link.name}
                      </span>
                      <span className="block text-xs font-black truncate">
                        {link.label}
                      </span>
                    </div>

                    {/* Jack input socket graphic */}
                    <div className={`h-6 w-6 rounded-full bg-zinc-900 border-2 flex items-center justify-center shrink-0 relative transition-colors ${
                      isActive ? 'border-blue-500 dark:border-blue-400 bg-blue-900' : 'border-zinc-400 dark:border-zinc-800'
                    }`}>
                      <div className={`h-3 w-3 rounded-full bg-black ${isPlaying ? 'shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)]' : ''}`} />
                      <div className={`absolute h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        isPlaying 
                          ? 'bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]' 
                          : 'bg-zinc-650'
                      }`} style={{ top: '-2px', right: '-2px' }} />
                    </div>
                  </a>
                )
              })}
            </div>
          </div>

        </div>

        {/* Sub Navigation and Technical Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-zinc-350 dark:border-zinc-900 pt-6">
          
          {/* Nav Items */}
          <div className="flex flex-col gap-2.5 text-left">
            <span className="font-mono text-[9px] font-black text-zinc-550 dark:text-zinc-500 uppercase tracking-wider">
              Console Index Channels
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {FOOTER_NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-xs font-bold text-zinc-650 hover:text-zinc-905 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                  {item.name.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-col gap-2.5 text-left md:col-span-2">
            <span className="font-mono text-[9px] font-black text-zinc-550 dark:text-zinc-500 uppercase tracking-wider">
              Rack Console Specs Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-zinc-350 bg-zinc-300/60 dark:bg-zinc-900 dark:border-zinc-850 px-2 py-0.5 font-mono text-[9px] font-black text-zinc-650 dark:text-zinc-550 uppercase tracking-tight shadow-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Metatags Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-350 dark:border-zinc-900 pt-6 text-[10px] text-zinc-550 dark:text-zinc-600 font-mono gap-4">
          <span>
            © {currentYear} ADITYAHIMAONE // PORTFOLIO MIXER STAGE ACTIVE
          </span>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 animate-pulse" />
            <span>STEREO MONITORS ACTIVE // DE-ESSER ENABLED</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
