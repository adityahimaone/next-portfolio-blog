'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Pause, SkipForward, Cpu, Volume2, RefreshCw } from 'lucide-react'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { WaveformVisualizer } from './waveform-visualizer'
import { Screw } from '@/components/screw'
import { Magnetic } from '@/components/magnetic'

// ----------------------------------------------------
// 1. WaveformHero (Oscilloscope / Waveform Identity)
// ----------------------------------------------------
export function WaveformHero() {
  const { isPlaying, togglePlay } = useAudio()
  const analyserNode = null

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 text-center">
      {/* Dynamic Background Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />

      {/* Main Container */}
      <div className="z-10 flex w-full max-w-4xl flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex h-48 w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-[0_0_50px_rgba(16,185,129,0.05)] backdrop-blur-md"
        >
          {/* Oscilloscope Grid Background */}
          <div className="absolute inset-0 rounded-xl bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40" />

          {/* Center line */}
          <div className="absolute right-0 left-0 h-px bg-zinc-800/80" />

          {/* Screws */}
          <div className="absolute top-2 left-2">
            <Screw className="text-zinc-700" />
          </div>
          <div className="absolute top-2 right-2">
            <Screw className="text-zinc-700" />
          </div>
          <div className="absolute bottom-2 left-2">
            <Screw className="text-zinc-700" />
          </div>
          <div className="absolute right-2 bottom-2">
            <Screw className="text-zinc-700" />
          </div>

          {/* Name & Waveform overlay */}
          <div className="relative z-10 text-center">
            <h1 className="font-mono text-5xl font-black tracking-widest text-zinc-100 sm:text-7xl">
              ADITYA
            </h1>
            <p className="mt-2 font-sans text-sm font-bold tracking-[0.4em] text-emerald-400 uppercase">
              Waveform Identity / Frontend Developer
            </p>
          </div>

          {/* Real-time Oscilloscope SVG / Canvas overlay */}
          <div className="pointer-events-none absolute inset-x-4 inset-y-8">
            {analyserNode ? (
              <WaveformVisualizer
                analyser={analyserNode}
                color="#10b981"
                className="opacity-70"
                lineWidth={2}
              />
            ) : (
              <motion.div
                className="flex h-full w-full items-center justify-center"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="h-0.5 w-full bg-zinc-800" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Console Controls */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={togglePlay}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 font-mono text-xs font-bold tracking-widest text-emerald-400 uppercase shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all hover:bg-emerald-500/20"
          >
            {isPlaying ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
            {isPlaying ? 'PAUSE SIGNAL' : 'INIT AUDIO'}
          </button>

          <div className="font-mono text-xs text-zinc-500 uppercase">
            STATUS: {isPlaying ? 'PLAYING BACK' : 'STANDBY'} / ANALYSER: ON
          </div>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 2. ColdTypeRevealHero (Cold Type -> Hardware Reveal)
// ----------------------------------------------------
export function ColdTypeRevealHero() {
  const [stage, setStage] = useState<'cold' | 'reveal'>('cold')
  const { isPlaying, togglePlay, currentTrack } = useAudio()

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('reveal')
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* Hardware reveals glow */}
      <AnimatePresence>
        {stage === 'reveal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25)_0%,transparent_70%)]"
          />
        )}
      </AnimatePresence>

      {/* Main Card */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        {/* The chrome frame / pre-amp box */}
        <motion.div
          animate={
            stage === 'reveal'
              ? {
                  padding: '2rem',
                  backgroundColor: '#0c0a09', // stone-950
                  borderColor: '#292524', // stone-800
                  borderRadius: '16px',
                  boxShadow:
                    '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
                  borderWidth: '1px',
                }
              : {
                  padding: '0rem',
                  backgroundColor: 'transparent',
                  borderColor: 'transparent',
                  boxShadow: 'none',
                  borderWidth: '0px',
                }
          }
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative flex w-full flex-col overflow-hidden transition-all"
        >
          {/* Decorative Pre-amp screws */}
          {stage === 'reveal' && (
            <>
              <div className="absolute top-3 left-3">
                <Screw className="text-zinc-650" />
              </div>
              <div className="absolute top-3 right-3">
                <Screw className="text-zinc-650" />
              </div>
              <div className="absolute bottom-3 left-3">
                <Screw className="text-zinc-650" />
              </div>
              <div className="absolute right-3 bottom-3">
                <Screw className="text-zinc-650" />
              </div>
            </>
          )}

          {/* Preloader or Header line in Pre-amp mode */}
          <AnimatePresence>
            {stage === 'reveal' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-3 font-mono text-[9px] tracking-[0.2em] text-zinc-500 uppercase"
              >
                <span>CHASSIS TYPE: ST-002</span>
                <span className="text-blue-400">STAGE PRE-AMP ENABLED</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Typography */}
          <div className="py-6 text-center md:text-left">
            <motion.h1
              layout
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="font-serif text-4xl font-extrabold tracking-tight text-stone-100 sm:text-6xl"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Aditya Himawan
            </motion.h1>
            <motion.p
              layout
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="mt-3 font-serif text-xl text-stone-400 italic sm:text-2xl"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Frontend Developer
            </motion.p>
          </div>

          {/* Interactive features inside the Pre-amp reveal */}
          <AnimatePresence>
            {stage === 'reveal' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-6 md:flex-row"
              >
                <div className="text-left font-mono text-xs text-zinc-400">
                  <div className="flex gap-2">
                    <span className="text-zinc-650">GAIN:</span>{' '}
                    <span>+12.4dB</span>
                  </div>
                  <div className="mt-1 flex gap-2">
                    <span className="text-zinc-650">TRACK:</span>{' '}
                    <span className="truncate text-blue-400">
                      {currentTrack}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={togglePlay}
                    className="hover:bg-zinc-750 flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-zinc-300 transition-all active:translate-y-0.5"
                  >
                    {isPlaying ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} className="ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setStage('cold')}
                    className="flex cursor-pointer items-center gap-1.5 rounded border border-zinc-800 px-4 py-2 font-mono text-[10px] font-bold text-zinc-500 uppercase hover:bg-zinc-900"
                  >
                    <RefreshCw size={10} /> Reset Reveal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 3. DapDeviceHero (Physical DAP Device Mockup)
// ----------------------------------------------------
export function DapDeviceHero() {
  const { isPlaying, togglePlay, currentTrack } = useAudio()
  const [screenIdx, setScreenIdx] = useState(0)

  const screens = [
    {
      title: 'BIO.DAT',
      line1: 'ADITYA HIMAWAN',
      line2: 'FRONTEND DEV',
      line3: 'JAKARTA, IND',
    },
    {
      title: 'TECH.CFG',
      line1: 'NEXTJS / REACT',
      line2: 'TYPESCRIPT',
      line3: 'TAILWIND / GSAP',
    },
    {
      title: 'STATUS.SYS',
      line1: 'WARMING TUBES...',
      line2: 'AMP STAGE: ON',
      line3: 'DAC: LADDER R2R',
    },
  ]

  const handleNextScreen = () => {
    setScreenIdx((prev) => (prev + 1) % screens.length)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-900 px-4 py-20">
      {/* OP-1 Style Pocket Synthesizer / DAP Chassis */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="border-zinc-750 flex w-full max-w-[480px] flex-col gap-6 rounded-3xl border-4 bg-zinc-800 p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8),inset_0_2px_1px_rgba(255,255,255,0.15)]"
      >
        {/* Device Brand Logo and Status LED */}
        <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
          <span className="font-mono text-[10px] font-black tracking-widest text-zinc-400">
            SHANLING M6 PRO
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[8px] text-zinc-500 uppercase">
              SYS POWER
            </span>
            <div
              className={`h-2.5 w-2.5 rounded-full border border-black/40 ${isPlaying ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-red-950'}`}
            />
          </div>
        </div>

        {/* OLED Screen */}
        <div className="relative aspect-16/10 overflow-hidden rounded-xl border-4 border-zinc-950 bg-black p-4 text-emerald-400 shadow-[inset_0_3px_10px_rgba(0,0,0,0.9)]">
          {/* LCD Grid lines */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:100%_4px]" />

          {/* Screen Content */}
          <div className="relative z-0 flex h-full flex-col justify-between font-mono text-xs tracking-wider">
            <div className="flex justify-between border-b border-emerald-950 pb-1 text-[9px] font-bold text-emerald-600">
              <span>{screens[screenIdx].title}</span>
              <span>PAGE {screenIdx + 1}/3</span>
            </div>

            <div className="flex flex-col gap-1 py-3 text-emerald-200">
              <div className="text-sm font-bold tracking-widest">
                {screens[screenIdx].line1}
              </div>
              <div>{screens[screenIdx].line2}</div>
              <div className="text-[10px] text-emerald-400/80">
                {screens[screenIdx].line3}
              </div>
            </div>

            <div className="flex justify-between border-t border-emerald-950 pt-1 text-[8px] text-emerald-600">
              <span>NOW: {isPlaying ? 'PLAYING' : 'PAUSED'}</span>
              <span>192KHZ / 24BIT</span>
            </div>
          </div>
        </div>

        {/* Hardware Wheel & Tactile Controls */}
        <div className="flex items-center justify-between gap-6 pt-2">
          {/* Jog Dial Scroll Wheel */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleNextScreen}
              className="bg-radial-gradient relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-4 border-zinc-900 from-zinc-700 via-zinc-800 to-zinc-900 shadow-md transition-transform duration-300 hover:brightness-110 active:rotate-45"
            >
              <div className="absolute h-8 w-8 rounded-full border-2 border-zinc-950 bg-zinc-900/60 shadow-inner" />
              {/* Wheel notch */}
              <div className="absolute top-2 h-2 w-2 rounded-full bg-zinc-950" />
            </button>
            <span className="font-mono text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
              DIAL SCREEN
            </span>
          </div>

          {/* Playback Buttons */}
          <div className="flex flex-1 flex-col items-end gap-3">
            <div className="flex gap-3">
              <button
                onClick={togglePlay}
                className="to-zinc-850 flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-zinc-900 bg-linear-to-b from-zinc-700 text-zinc-300 shadow transition-all hover:brightness-110 active:translate-y-px"
              >
                {isPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} className="ml-0.5" />
                )}
              </button>
              <button
                onClick={handleNextScreen}
                className="to-zinc-850 flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-zinc-900 bg-linear-to-b from-zinc-700 text-zinc-300 shadow transition-all hover:brightness-110 active:translate-y-px"
              >
                <SkipForward size={16} />
              </button>
            </div>
            <div className="text-right font-mono text-[9px] text-zinc-500">
              <div>TRACK:</div>
              <div className="max-w-[200px] truncate font-bold text-zinc-400">
                {currentTrack}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
