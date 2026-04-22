'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import {
  ReactiveVisualizer,
  Pad,
  PadMode,
  TransportButton,
  MiniButton,
  VerticalFader,
  HorizontalFader,
  JogWheel,
  InteractiveKnob,
  VuMeter,
} from '../components'
import { useAudioFrequency } from '../hooks/use-audio-frequency'
import { cn } from '@/lib/utils'
import { SubpageHeader } from '@/features/layout'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { Eye, EyeOff, Home } from 'lucide-react'

import { MIXTAPES, YOUTUBE_TRACKS } from '../constants/music-data'

export function MusicPageView() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Audio States
  const [activeDeck, setActiveDeck] = useState<'local' | 'youtube'>('local')
  const [localTrack, setLocalTrack] = useState(MIXTAPES[0])
  const [ytTrack, setYtTrack] = useState(YOUTUBE_TRACKS[0])
  const [isPlayingLocal, setIsPlayingLocal] = useState(false)
  const [isPlayingYt, setIsPlayingYt] = useState(false)
  const frequencyData = useAudioFrequency(audioRef.current)
  const [simulatedData, setSimulatedData] = useState<Uint8Array>(
    new Uint8Array(24),
  )
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isScreenExpanded, setIsScreenExpanded] = useState(false)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle Navbar Visibility (Stealth Mode)
  useEffect(() => {
    const header = document.querySelector('header')
    if (header) {
      header.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      header.style.transform = isNavbarVisible
        ? 'translateY(0)'
        : 'translateY(-120%)'
      header.style.opacity = isNavbarVisible ? '1' : '0'
      header.style.pointerEvents = isNavbarVisible ? 'auto' : 'none'
    }
  }, [isNavbarVisible])

  // Simulated frequency data for YouTube
  useEffect(() => {
    if (isPlayingYt && activeDeck === 'youtube') {
      const interval = setInterval(() => {
        const newData = new Uint8Array(24).map(() =>
          Math.floor(Math.random() * 255),
        )
        setSimulatedData(newData)
      }, 200) // Throttled from 100ms for performance
      return () => clearInterval(interval)
    } else {
      setSimulatedData(new Uint8Array(24))
    }
  }, [isPlayingYt, activeDeck])

  // Sync YouTube Player Play/Pause
  useEffect(() => {
    const iframe = document.getElementById(
      'youtube-player',
    ) as HTMLIFrameElement
    if (iframe?.contentWindow) {
      const command = isPlayingYt ? 'playVideo' : 'pauseVideo'
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*',
      )
    }
  }, [isPlayingYt])

  // Optimized playback effect for track switching
  useEffect(() => {
    if (audioRef.current && isPlayingLocal && activeDeck === 'local') {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented, might need user interaction if state out of sync
          setIsPlayingLocal(false)
        })
      }
    }
  }, [localTrack.id, isPlayingLocal, activeDeck])

  // Hardware Fader States
  const [crossfader, setCrossfader] = useState(50)
  const [volA, setVolA] = useState(80)
  const [volB, setVolB] = useState(80)
  const [pitchA, setPitchA] = useState(50)
  const [pitchB, setPitchB] = useState(50)

  const handlePlayLocal = () => {
    setActiveDeck('local')
    if (audioRef.current) {
      if (isPlayingLocal) {
        audioRef.current.pause()
        setIsPlayingLocal(false)
      } else {
        audioRef.current.play().then(() => setIsPlayingLocal(true))
      }
    }
  }

  const handlePlayYoutube = () => {
    setActiveDeck('youtube')
    setIsPlayingYt(!isPlayingYt)
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setIsPlayingLocal(false)
    }
  }

  const loadLocalTrack = (track: (typeof MIXTAPES)[0]) => {
    setActiveDeck('local')
    if (audioRef.current) {
      // Pause current before switching to avoid audio glitches
      audioRef.current.pause()
      setLocalTrack(track)
      // The useEffect will pick up the ID change and trigger play() if isPlayingLocal is true
    }
  }

  return (
    <div
      className={cn(
        'relative flex min-h-screen items-center justify-center overflow-x-hidden p-2 pt-32 pb-24 font-sans transition-colors duration-700 selection:bg-amber-500/30 sm:p-4 lg:p-6',
        mounted && theme === 'light' ? 'bg-zinc-200' : 'bg-[#050505]',
      )}
    >
      {/* Bottom Left Utility Controls - Vertical Stack */}
      <div className="fixed bottom-10 left-6 z-[100] flex flex-col-reverse items-center gap-4">
        {/* Toggle Navbar Button */}
        <div className="group relative">
          <button
            onClick={() => setIsNavbarVisible(!isNavbarVisible)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 shadow-lg backdrop-blur-md transition-all',
              isNavbarVisible
                ? mounted && theme === 'light'
                  ? 'border-zinc-200 bg-white/80 text-zinc-600 shadow-sm hover:bg-zinc-50'
                  : 'bg-zinc-900/50 text-zinc-500 hover:bg-zinc-800'
                : 'border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:bg-amber-500/20',
            )}
          >
            {isNavbarVisible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          {/* Tooltip */}
          <div className="pointer-events-none absolute left-full ml-3 rounded-md border border-white/5 bg-[#18181b] px-2 py-1 text-[9px] font-bold tracking-widest whitespace-nowrap text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
            {isNavbarVisible ? 'HIDE INTERFACE' : 'SHOW INTERFACE'}
          </div>
        </div>

        {/* Home Button (Visible only when Navbar is hidden) */}
        <AnimatePresence>
          {!isNavbarVisible && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="group relative"
            >
              <Link
                href="/"
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 shadow-lg backdrop-blur-md transition-all',
                  mounted && theme === 'light'
                    ? 'border-zinc-200 bg-white/80 text-[#273281] shadow-sm hover:bg-zinc-50'
                    : 'bg-zinc-900/80 text-[#273281] hover:bg-zinc-800 dark:text-amber-500',
                )}
              >
                <Home size={16} />
              </Link>
              {/* Tooltip */}
              <div className="pointer-events-none absolute left-full ml-3 rounded-md border border-white/5 bg-[#18181b] px-2 py-1 text-[9px] font-bold tracking-widest whitespace-nowrap text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
                RETURN HOME
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SubpageHeader />
      <div
        className={cn(
          'pointer-events-none fixed inset-0 opacity-100 transition-opacity duration-700',
          mounted && theme === 'light'
            ? 'bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px]'
            : 'bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]',
        )}
      />

      {/* Dynamic Background Visualizer (Local / YouTube) */}
      <div className="absolute inset-x-0 bottom-0 z-0 h-[600px] opacity-30 blur-md transition-opacity">
        <ReactiveVisualizer
          frequencyData={activeDeck === 'local' ? frequencyData : simulatedData}
        />
      </div>

      <audio
        ref={audioRef}
        src={localTrack.src}
        crossOrigin="anonymous"
        onPause={() => setIsPlayingLocal(false)}
        onPlay={() => setIsPlayingLocal(true)}
        loop
      />

      <div className="relative flex h-auto w-full max-w-[1850px] flex-col gap-4 overflow-y-auto rounded-[2.5rem] border border-[#222] bg-[#111] p-3 shadow-[0_60px_120px_rgba(0,0,0,0.9),inset_0_2px_6px_rgba(255,255,255,0.1)] sm:p-5 lg:h-[750px] lg:flex-row lg:overflow-hidden">
        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-[url('/noise.png')] opacity-[0.08] mix-blend-overlay" />

        {/* =======================
              DECK 1 (LOCAL)
          ======================= */}
        <motion.div
          layout
          initial={false}
          animate={{
            flex: isScreenExpanded ? 0.2 : 1.3,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          className="relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-[#2c2c2e] bg-[#18181a] p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] sm:p-6"
        >
          {/* Top Bar: Needle Drop & Loop */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 rounded-xl border border-[#222] bg-[#0a0a0a] p-2">
              <MiniButton label="IN / 4BEAT" color="amber" />
              <MiniButton label="OUT" color="amber" />
              <MiniButton label="RELOOP" color="zinc" />
            </div>
            <div className="group relative h-8 flex-1 cursor-pointer overflow-hidden rounded-full border border-white/5 bg-[#050505] shadow-inner">
              <div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-zinc-800" />
              <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-amber-500 opacity-50 shadow-[0_0_15px_#f59e0b] transition-opacity group-hover:opacity-100" />
              <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] font-bold tracking-[0.4em] text-zinc-600">
                {isScreenExpanded ? 'DECK 1' : 'NEEDLE SEARCH'}
              </span>
            </div>
          </div>

          {/* Main Deck Body (Stays mounted but fades) */}
          <motion.div
            animate={{
              opacity: isScreenExpanded ? 0 : 1,
              pointerEvents: isScreenExpanded ? 'none' : 'auto',
            }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-1 gap-4"
          >
            {/* Left Column */}
            <div className="flex w-16 flex-col justify-between py-2">
              <div className="flex flex-col gap-3">
                <InteractiveKnob label="VINYL" size="md" />
                <MiniButton label="SLIP" color="amber" />
                <MiniButton label="QNTZ" color="amber" />
                <div className="h-4" />
                <MiniButton label="CUE CALL" color="zinc" />
                <div className="flex gap-1.5">
                  <MiniButton label="<" color="zinc" />
                  <MiniButton label=">" color="zinc" />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <TransportButton
                  label="CUE"
                  color="zinc"
                  isActive={false}
                  onClick={() => {}}
                />
                <TransportButton
                  label="PLAY"
                  color="amber"
                  isActive={isPlayingLocal}
                  onClick={handlePlayLocal}
                />
              </div>
            </div>

            {/* Center Column (Enlarged Jog) */}
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex flex-1 items-center justify-center py-4">
                <JogWheel
                  cover={localTrack.cover}
                  isPlaying={isPlayingLocal}
                  color="shadow-[0_0_50px_rgba(245,158,11,0.15)]"
                  ringColor="border-amber-500/40"
                />
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-[#0a0a0a] p-3 shadow-inner">
                <div className="flex gap-1.5">
                  <PadMode label="HOT CUE" isActive />
                  <PadMode label="PAD FX1" isActive={false} />
                  <PadMode label="BEAT JUMP" isActive={false} />
                  <PadMode label="SAMPLER" isActive={false} />
                </div>
                <div className="grid grid-cols-4 grid-rows-2 gap-2">
                  {MIXTAPES.map((t, i) => (
                    <Pad
                      key={t.id}
                      label={`TRK ${i + 1}`}
                      isActive={localTrack.id === t.id}
                      color="bg-amber-500"
                      onClick={() => loadLocalTrack(t)}
                    />
                  ))}
                  {[...Array(8 - MIXTAPES.length)].map((_, i) => (
                    <Pad
                      key={`dummyA${i}`}
                      label="CUE"
                      isActive={false}
                      color="bg-amber-500"
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex w-16 flex-col items-center justify-between rounded-2xl border border-[#222] bg-[#0a0a0a] p-3 shadow-inner">
              <div className="flex w-full flex-col gap-2">
                <MiniButton label="SYNC" color="zinc" />
                <MiniButton label="KEY" color="zinc" />
              </div>
              <div className="w-full flex-1 py-6">
                <VerticalFader
                  label="TEMPO"
                  value={pitchA}
                  onChange={(e) => setPitchA(Number(e.target.value))}
                  height="h-full"
                  hideValue
                />
              </div>
              <MiniButton label="MT" color="amber" />
            </div>
          </motion.div>
        </motion.div>

        {/* =======================
              MIXER (CENTER) - Enlarged
          ======================= */}
        <motion.div
          layout
          initial={false}
          animate={{
            flex: isScreenExpanded ? 3 : 1,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          className="relative flex h-auto min-h-[400px] flex-col gap-4 lg:h-full"
        >
          {/* Master Screen (Enlarged) */}
          <div
            className={cn(
              'group relative overflow-clip rounded-[2.5rem] border-2 border-[#1a1a1c] bg-[#0a0a0a] p-3 shadow-[inset_0_12px_24px_rgba(0,0,0,0.9)] transition-all hover:border-amber-500/50',
              isScreenExpanded ? 'flex flex-1 flex-col' : 'cursor-pointer',
            )}
            onClick={() => !isScreenExpanded && setIsScreenExpanded(true)}
          >
            <motion.div
              layout
              initial={false}
              animate={{
                height: isScreenExpanded ? '100%' : 'auto',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className={cn(
                'relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black',
                isScreenExpanded ? 'flex-1' : 'aspect-[16/8]',
              )}
            >
              {activeDeck === 'local' ? (
                <div className="absolute inset-0 flex flex-col justify-between">
                  <Image
                    src={localTrack.cover}
                    alt="bg"
                    fill
                    className="object-cover opacity-30 blur-2xl saturate-150"
                  />
                  <div className="relative z-10 flex h-full items-end justify-between p-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={localTrack.cover}
                        alt="art"
                        width={54}
                        height={54}
                        className="rounded-lg border-2 border-white/20 shadow-2xl"
                      />
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-xs font-black tracking-tighter text-white uppercase">
                          {localTrack.title}
                        </h3>
                        <p className="font-mono text-[9px] font-bold text-amber-500">
                          {localTrack.artist}
                        </p>
                        <div className="mt-1 flex gap-1.5">
                          <span className="rounded border border-white/10 bg-black/80 px-1.5 py-0.5 font-mono text-[8px] text-white">
                            128.0
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-10 w-24 opacity-90">
                      <ReactiveVisualizer frequencyData={frequencyData} />
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  id="youtube-player"
                  className="absolute inset-0 h-full w-full border-0"
                  src={`https://www.youtube.com/embed/${ytTrack.id}?autoplay=1&controls=1&modestbranding=1&rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  style={{
                    pointerEvents: isScreenExpanded ? 'auto' : 'none',
                  }}
                />
              )}
            </motion.div>

            {/* Corner Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsScreenExpanded(!isScreenExpanded)
              }}
              className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10"
            >
              <span className="text-[12px] font-bold">
                {isScreenExpanded ? '−' : '+'}
              </span>
            </button>
          </div>

          {/* Mixer Controls (Hidden if Enlarged) */}
          {!isScreenExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-[#2c2c2e] bg-[#18181a] p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] sm:p-5"
            >
              {/* Browse Section */}
              <div className="mb-4 flex items-center justify-between rounded-xl border border-white/5 bg-[#0a0a0a] px-4 py-3 shadow-inner">
                <button className="rounded-lg border border-[#444] bg-[#222] px-4 py-2 font-mono text-[10px] font-bold text-zinc-300 shadow-md transition-all hover:border-amber-500 active:bg-zinc-700">
                  LOAD 1
                </button>
                <InteractiveKnob
                  label="BROWSE"
                  size="lg"
                  color="zinc"
                  defaultValue={50}
                />
                <button className="rounded-lg border border-[#444] bg-[#222] px-4 py-2 font-mono text-[10px] font-bold text-zinc-300 shadow-md transition-all hover:border-red-500 active:bg-zinc-700">
                  LOAD 2
                </button>
              </div>

              {/* Main Console Grid */}
              <div className="mb-4 flex flex-1 justify-between gap-3 px-1">
                {/* CH1 Strip */}
                <div className="grid w-28 grid-cols-2 gap-x-2 gap-y-4 rounded-xl border border-white/5 bg-[#0a0a0a] p-3 shadow-inner">
                  <div className="col-span-2 flex flex-col items-center gap-2">
                    <InteractiveKnob label="TRIM" size="md" />
                    <div className="h-[1px] w-full bg-white/10" />
                  </div>
                  <InteractiveKnob label="HI" size="md" />
                  <InteractiveKnob label="MID" size="md" />
                  <InteractiveKnob label="LOW" size="md" />
                  <InteractiveKnob
                    label="COLOR"
                    size="md"
                    ringColor="shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                  />
                  <div className="col-span-2 mt-auto w-full pt-1">
                    <MiniButton label="CUE" color="amber" />
                  </div>
                </div>

                {/* Center Strip */}
                <div className="flex flex-1 flex-col items-center gap-3 rounded-xl border border-white/5 bg-[#0a0a0a] px-2 py-3 shadow-inner">
                  <div className="flex w-full flex-col gap-2.5 rounded-lg border border-white/5 bg-black/40 p-2 shadow-inner">
                    <div className="flex w-full justify-around">
                      <InteractiveKnob label="MASTER" size="md" />
                      <InteractiveKnob label="BOOTH" size="md" />
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-1.5 rounded border border-[#222] bg-[#050505] p-1.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                    <div className="flex flex-col gap-1">
                      <VuMeter horizontal />
                      <VuMeter horizontal />
                    </div>
                    <div className="mx-auto h-[1px] w-2/3 bg-white/5" />
                    <div className="flex flex-col gap-1">
                      <VuMeter horizontal />
                      <VuMeter horizontal />
                    </div>
                  </div>
                  <div className="mt-auto flex w-full flex-col items-center gap-2 rounded-lg border border-white/5 bg-black/40 p-2 shadow-inner">
                    <InteractiveKnob label="FX LVL" size="md" />
                    <MiniButton label="ON" color="zinc" />
                  </div>
                </div>

                {/* CH2 Strip */}
                <div className="grid w-24 grid-cols-2 gap-x-1.5 gap-y-3 rounded-xl border border-white/5 bg-[#0a0a0a] p-2 shadow-inner">
                  <div className="col-span-2 flex flex-col items-center gap-1.5">
                    <InteractiveKnob label="TRIM" size="md" />
                    <div className="h-[1px] w-full bg-white/10" />
                  </div>
                  <InteractiveKnob label="HI" size="md" />
                  <InteractiveKnob label="MID" size="md" />
                  <InteractiveKnob label="LOW" size="md" />
                  <InteractiveKnob
                    label="COLOR"
                    size="md"
                    ringColor="shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                  />
                  <div className="col-span-2 mt-auto w-full pt-1">
                    <MiniButton label="CUE" color="red" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* =======================
              DECK 2 (YOUTUBE) - Upscaled
          ======================= */}
        <motion.div
          layout
          initial={false}
          animate={{
            flex: isScreenExpanded ? 0.2 : 1.3,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          className="relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-[#2c2c2e] bg-[#18181a] p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] sm:p-6"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 rounded-xl border border-[#222] bg-[#0a0a0a] p-2">
              <MiniButton label="IN / 4BEAT" color="red" />
              <MiniButton label="OUT" color="red" />
              <MiniButton label="RELOOP" color="zinc" />
            </div>
            <div className="group relative h-8 flex-1 cursor-pointer overflow-hidden rounded-full border border-white/5 bg-[#050505] shadow-inner">
              <div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-zinc-800" />
              <div className="absolute top-0 bottom-0 left-2/3 w-2 bg-red-500 opacity-50 shadow-[0_0_15_#ef4444] transition-opacity group-hover:opacity-100" />
              <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] font-bold tracking-[0.4em] text-zinc-600">
                {isScreenExpanded ? 'DECK 2' : 'NEEDLE SEARCH'}
              </span>
            </div>
          </div>

          {/* Main Deck Body (Animated visibility) */}
          <motion.div
            animate={{
              opacity: isScreenExpanded ? 0 : 1,
              pointerEvents: isScreenExpanded ? 'none' : 'auto',
            }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-1 flex-row-reverse gap-4"
          >
            {/* Left Column (Flipped) */}
            <div className="flex w-16 flex-col justify-between py-2">
              <div className="flex flex-col gap-3">
                <InteractiveKnob label="VINYL" size="md" />
                <MiniButton label="SLIP" color="red" />
                <MiniButton label="QNTZ" color="red" />
                <div className="h-4" />
                <MiniButton label="CUE CALL" color="zinc" />
                <div className="flex gap-1.5">
                  <MiniButton label="<" color="zinc" />
                  <MiniButton label=">" color="zinc" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <TransportButton
                  label="CUE"
                  color="zinc"
                  isActive={false}
                  onClick={() => {}}
                />
                <TransportButton
                  label="PLAY"
                  color="red"
                  isActive={isPlayingYt && activeDeck === 'youtube'}
                  onClick={handlePlayYoutube}
                />
              </div>
            </div>

            {/* Center Column (Enlarged Jog) */}
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex flex-1 items-center justify-center py-4">
                <JogWheel
                  cover={ytTrack.cover}
                  isPlaying={isPlayingYt && activeDeck === 'youtube'}
                  color="shadow-[0_0_50px_rgba(239,68,68,0.15)]"
                  ringColor="border-red-500/40"
                  isYoutube
                />
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-[#0a0a0a] p-3 shadow-inner">
                <div className="flex flex-row-reverse gap-1.5">
                  <PadMode label="HOT CUE" isActive />
                  <PadMode label="PAD FX1" isActive={false} />
                  <PadMode label="BEAT JUMP" isActive={false} />
                  <PadMode label="SAMPLER" isActive={false} />
                </div>
                <div className="grid grid-cols-4 grid-rows-2 gap-2">
                  {YOUTUBE_TRACKS.map((t, i) => (
                    <Pad
                      key={t.id}
                      label={`VID ${i + 1}`}
                      isActive={ytTrack.id === t.id}
                      color="bg-red-500"
                      onClick={() => {
                        setYtTrack(t)
                        setActiveDeck('youtube')
                        setIsPlayingYt(true)
                      }}
                    />
                  ))}
                  {[...Array(8 - YOUTUBE_TRACKS.length)].map((_, i) => (
                    <Pad
                      key={`dummyB${i}`}
                      label="CUE"
                      isActive={false}
                      color="bg-red-500"
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex w-16 flex-col items-center justify-between rounded-2xl border border-[#222] bg-[#0a0a0a] p-3 shadow-inner">
              <div className="flex w-full flex-col gap-2">
                <MiniButton label="SYNC" color="zinc" />
                <MiniButton label="KEY" color="zinc" />
              </div>
              <div className="w-full flex-1 py-6">
                <VerticalFader
                  label="TEMPO"
                  value={pitchB}
                  onChange={(e) => setPitchB(Number(e.target.value))}
                  height="h-full"
                  hideValue
                />
              </div>
              <MiniButton label="MT" color="red" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
