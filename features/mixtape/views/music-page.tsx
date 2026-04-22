'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ReactiveVisualizer } from '../components/reactive-visualizer'
import { useAudioFrequency } from '../hooks/use-audio-frequency'
import { cn } from '@/lib/utils'
import { SubpageHeader } from '@/features/layout'
import { useTheme } from 'next-themes'

// --- MOCK DATA ---
const MIXTAPES = [
  {
    id: 'loc_1',
    title: 'Deep Focus',
    artist: 'Late night coding',
    cover: '/nwjns.jpeg',
    src: '/music/attention.mp3',
    color: 'bg-amber-500',
  },
  {
    id: 'loc_2',
    title: 'Live at Jakarta',
    artist: 'TWICE Tour vibes',
    cover: '/cover.jpg',
    src: '/music/edge-of-desire-sunrise-mix.weba',
    color: 'bg-blue-500',
  },
]

const YOUTUBE_TRACKS = [
  {
    id: 'ygYPwsjyCzQ',
    title: "'Who is she'",
    artist: 'KISS OF LIFE',
    color: 'bg-red-500',
  },
  {
    id: 'dtKQfCr7N7I',
    title: 'RIGHT HAND',
    artist: 'TWICE',
    color: 'bg-red-500',
  },
]

export function MusicPageView() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Audio States
  const [activeDeck, setActiveDeck] = useState<'local' | 'youtube'>('local')
  const [localTrack, setLocalTrack] = useState(MIXTAPES[0])
  const [ytTrack, setYtTrack] = useState(YOUTUBE_TRACKS[0])
  const [isPlayingLocal, setIsPlayingLocal] = useState(false)
  const [isPlayingYt, setIsPlayingYt] = useState(false)
  const frequencyData = useAudioFrequency(audioRef.current)
  const [simulatedData, setSimulatedData] = useState<Uint8Array>(new Uint8Array(24))
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Simulated frequency data for YouTube
  useEffect(() => {
    if (isPlayingYt && activeDeck === 'youtube') {
      const interval = setInterval(() => {
        const newData = new Uint8Array(24).map(() => Math.floor(Math.random() * 255))
        setSimulatedData(newData)
      }, 100)
      return () => clearInterval(interval)
    } else {
      setSimulatedData(new Uint8Array(24))
    }
  }, [isPlayingYt, activeDeck])

  // Sync YouTube Player Play/Pause
  useEffect(() => {
    const iframe = document.getElementById('youtube-player') as HTMLIFrameElement
    if (iframe?.contentWindow) {
      const command = isPlayingYt ? 'playVideo' : 'pauseVideo'
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*'
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

      {/* --- FLAGSHIP HARDWARE CONSOLE (Upscaled) --- */}
      <div className="relative w-full max-w-[1850px] rounded-[2.5rem] border border-[#222] bg-[#111] p-3 shadow-[0_60px_120px_rgba(0,0,0,0.9),inset_0_2px_6px_rgba(255,255,255,0.1)] sm:p-5">
        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-[url('/noise.png')] opacity-[0.08] mix-blend-overlay" />

        <div className="relative flex h-full flex-col gap-4 xl:flex-row">
          {/* =======================
              DECK 1 (LOCAL)
          ======================= */}
          <div className="flex flex-[1.3] flex-col gap-4 rounded-3xl border border-[#2c2c2e] bg-[#18181a] p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] sm:p-6">
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
                  NEEDLE SEARCH
                </span>
              </div>
            </div>

            {/* Main Deck Body */}
            <div className="flex h-full flex-1 gap-4">
              {/* Left Column */}
              <div className="flex w-20 flex-col justify-between py-2">
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
                    {[...Array(6)].map((_, i) => (
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
              <div className="flex w-20 flex-col items-center justify-between rounded-2xl border border-[#222] bg-[#0a0a0a] p-3 shadow-inner">
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
            </div>
          </div>

          {/* =======================
              MIXER (CENTER) - Enlarged
          ======================= */}
          <div className="flex flex-1 flex-col gap-4 xl:max-w-[500px]">
            {/* Master Screen (Enlarged) */}
            <div className="rounded-[2rem] border-2 border-[#1a1a1c] bg-[#0a0a0a] p-3 shadow-[inset_0_12px_24px_rgba(0,0,0,0.9)] transition-all">
              <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black">
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
                    src={`https://www.youtube.com/embed/${ytTrack.id}?autoplay=1&controls=0&modestbranding=1&rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    style={{ pointerEvents: isPlayingYt ? 'none' : 'auto' }}
                  />
                )}
              </div>
            </div>

            {/* Mixer Controls (Upscaled Strip) */}
            <div className="flex flex-1 flex-col rounded-3xl border border-[#2c2c2e] bg-[#18181a] p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] sm:p-5">
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
                {/* CH1 Strip (Two Column Layout) */}
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

                {/* Center Strip (Grouped Knobs & Horizontal VU) */}
                <div className="flex flex-1 flex-col items-center gap-3 rounded-xl border border-white/5 bg-[#0a0a0a] px-2 py-3 shadow-inner">
                  {/* Master & Booth Group */}
                  <div className="flex w-full flex-col gap-2.5 rounded-lg border border-white/5 bg-black/40 p-2 shadow-inner">
                    <div className="flex w-full justify-around">
                      <InteractiveKnob label="MASTER" size="sm" />
                      <InteractiveKnob label="BOOTH" size="sm" />
                    </div>
                  </div>

                  {/* Horizontal VU Meters */}
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

                  {/* FX Controls Group */}
                  <div className="mt-auto flex w-full flex-col items-center gap-2 rounded-lg border border-white/5 bg-black/40 p-2 shadow-inner">
                    <InteractiveKnob label="FX LVL" size="sm" />
                    <MiniButton label="ON" color="zinc" />
                  </div>
                </div>

                {/* CH2 Strip (Two Column Layout) */}
                <div className="grid w-24 grid-cols-2 gap-x-1.5 gap-y-3 rounded-xl border border-white/5 bg-[#0a0a0a] p-2 shadow-inner">
                  <div className="col-span-2 flex flex-col items-center gap-1.5">
                    <InteractiveKnob label="TRIM" size="sm" />
                    <div className="h-[1px] w-full bg-white/10" />
                  </div>
                  <InteractiveKnob label="HI" size="sm" />
                  <InteractiveKnob label="MID" size="sm" />
                  <InteractiveKnob label="LOW" size="sm" />
                  <InteractiveKnob
                    label="COLOR"
                    size="sm"
                    ringColor="shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                  />
                  <div className="col-span-2 mt-auto w-full pt-1">
                    <MiniButton label="CUE" color="red" />
                  </div>
                </div>
              </div>

              {/* Upfaders & Crossfader (Upscaled) */}
              <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#0a0a0a] p-4 shadow-inner">
                <div className="flex h-20 items-end justify-between px-12">
                  <VerticalFader
                    label="CH 1"
                    value={volA}
                    onChange={(e) => setVolA(Number(e.target.value))}
                    height="h-20"
                    hideValue
                  />
                  <VerticalFader
                    label="CH 2"
                    value={volB}
                    onChange={(e) => setVolB(Number(e.target.value))}
                    height="h-20"
                    hideValue
                  />
                </div>
                <div className="px-10">
                  <HorizontalFader
                    label="CROSSFADER"
                    value={crossfader}
                    onChange={(e) => setCrossfader(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =======================
              DECK 2 (YOUTUBE) - Upscaled
          ======================= */}
          <div className="flex flex-[1.3] flex-col gap-4 rounded-3xl border border-[#2c2c2e] bg-[#18181a] p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] sm:p-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2 rounded-xl border border-[#222] bg-[#0a0a0a] p-2">
                <MiniButton label="IN / 4BEAT" color="red" />
                <MiniButton label="OUT" color="red" />
                <MiniButton label="RELOOP" color="zinc" />
              </div>
              <div className="group relative h-8 flex-1 cursor-pointer overflow-hidden rounded-full border border-white/5 bg-[#050505] shadow-inner">
                <div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-zinc-800" />
                <div className="absolute top-0 bottom-0 left-2/3 w-2 bg-red-500 opacity-50 shadow-[0_0_15px_#ef4444] transition-opacity group-hover:opacity-100" />
                <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] font-bold tracking-[0.4em] text-zinc-600">
                  NEEDLE SEARCH
                </span>
              </div>
            </div>

            {/* Main Deck Body */}
            <div className="flex h-full flex-1 flex-row-reverse gap-4">
              {/* Left Column (Flipped) */}
              <div className="flex w-20 flex-col justify-between py-2">
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
                    cover="/noise.png"
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
                    {[...Array(6)].map((_, i) => (
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
              <div className="flex w-20 flex-col items-center justify-between rounded-2xl border border-[#222] bg-[#0a0a0a] p-3 shadow-inner">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- HARDWARE UI COMPONENTS ---

// Fully Interactive Knob
function InteractiveKnob({
  label,
  size = 'sm',
  color = 'zinc',
  defaultValue = 50,
  ringColor = '',
}: {
  label: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  defaultValue?: number
  ringColor?: string
}) {
  const [val, setVal] = useState(defaultValue)
  const rotation = -135 + (val / 100) * 270
  const sizeMap = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-12 h-12' }
  const markerMap = { sm: 'h-1/2', md: 'h-[55%]', lg: 'h-[60%]' }

  return (
    <div className="group relative flex flex-col items-center gap-1.5">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full border-b-2 border-zinc-800 bg-[#050505] p-[2px] shadow-[0_5px_10px_rgba(0,0,0,0.8)]',
          sizeMap[size],
          ringColor,
        )}
      >
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#333] to-[#151515] shadow-inner"
        >
          <div
            className={cn(
              'absolute top-[2px] left-1/2 w-[1.5px] origin-bottom -translate-x-1/2 rounded-full bg-white',
              markerMap[size],
            )}
            style={{ boxShadow: '0 0 5px rgba(255,255,255,0.5)' }}
          />
        </motion.div>
        <input
          type="range"
          min="0"
          max="100"
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <span className="font-mono text-[7px] font-bold tracking-widest whitespace-nowrap text-zinc-500 uppercase transition-colors group-hover:text-zinc-300">
        {label}
      </span>
    </div>
  )
}

function JogWheel({
  cover,
  isPlaying,
  color,
  ringColor,
  isYoutube = false,
}: {
  cover: string
  isPlaying: boolean
  color: string
  ringColor: string
  isYoutube?: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex aspect-square w-64 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-[#050505] p-2 sm:w-72 lg:w-80 xl:w-96',
        color,
      )}
    >
      <motion.div
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[15px] border-[#151515] border-t-[#222] shadow-inner"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{
          rotate: isPlaying
            ? { repeat: Infinity, duration: 1.8, ease: 'linear' }
            : { duration: 0 },
        }}
      >
        <div className="absolute inset-2 rounded-full border-[2px] border-white/5" />
        <div className="absolute inset-8 rounded-full border border-white/5" />
        <div className="absolute inset-14 rounded-full border border-white/5" />
        <div className="absolute inset-20 rounded-full border border-white/5" />

        <div
          className={cn(
            'absolute inset-0 rounded-full border-[4px] opacity-40',
            ringColor,
          )}
        />

        <div className="relative h-28 w-28 overflow-hidden rounded-full border-[6px] border-[#2a2a2c] bg-black">
          <Image
            src={cover}
            alt="center"
            fill
            className={cn(
              'object-cover saturate-50',
              isYoutube ? 'opacity-30 mix-blend-screen' : 'opacity-70',
            )}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="h-4 w-4 rounded-full border border-zinc-700 bg-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function VuMeter({ horizontal = false }: { horizontal?: boolean }) {
  const [level, setLevel] = useState(0)

  // Smoother VU animation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setLevel(prev => {
        const next = Math.random() * 0.8 + 0.2
        return next > prev ? next : prev * 0.7
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        'flex gap-[1px] overflow-hidden rounded-[2px] bg-[#000] p-[1px]',
        horizontal
          ? 'h-2 w-full flex-row items-center'
          : 'h-full w-2.5 flex-col items-center', // Vertical
      )}
    >
      {[...Array(20)].map((_, i) => {
        // For vertical Top-to-Bottom: i=0 is top, level fills starting from 0
        const isRed = horizontal ? i > 16 : i > 16 // Reverse vertical: red at the bottom
        const isAmber = horizontal ? i > 12 && i <= 16 : i > 12 && i <= 16
        const color = isRed
          ? 'bg-red-500'
          : isAmber
            ? 'bg-amber-500'
            : 'bg-green-500'
        
        // Directional logic: Top to Bottom for vertical
        const isLit = i <= level * 20

        return (
          <div
            key={i}
            className={cn(
              'rounded-[1px] transition-all duration-75',
              horizontal ? 'h-full flex-1' : 'w-full flex-1',
              color,
              isLit
                ? 'opacity-100 shadow-[0_0_5px_currentColor]'
                : 'opacity-10',
            )}
          />
        )
      })}
    </div>
  )
}

function Pad({
  label,
  isActive,
  color,
  onClick,
}: {
  label: string
  isActive: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded border-b-[3px] py-3 transition-all active:translate-y-[2px] active:border-b-0',
        isActive
          ? 'border-[#111] bg-[#2a2a2c] shadow-inner'
          : 'border-[#111] bg-[#222] shadow-[0_4px_6px_rgba(0,0,0,0.5)] hover:bg-[#2c2c2e]',
      )}
    >
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          color,
          isActive ? 'opacity-40' : 'opacity-0',
        )}
      />
      <span
        className={cn(
          'relative z-10 px-1 text-center font-mono text-[8px] leading-tight font-bold tracking-widest drop-shadow-md transition-colors',
          isActive ? 'text-white' : 'text-zinc-500',
        )}
      >
        {label}
      </span>
      {isActive && (
        <div
          className={cn(
            'absolute top-1 right-1 h-1 w-1 rounded-full shadow-[0_0_8px_currentColor]',
            color.replace('bg-', 'text-'),
          )}
        />
      )}
    </button>
  )
}

function PadMode({ label, isActive }: { label: string; isActive: boolean }) {
  return (
    <button
      className={cn(
        'flex-1 rounded border border-transparent py-1 font-mono text-[7px] font-bold tracking-widest shadow-sm transition-colors',
        isActive
          ? 'bg-white text-black'
          : 'border-[#222] bg-[#18181a] text-zinc-500 hover:border-zinc-700',
      )}
    >
      {label}
    </button>
  )
}

function TransportButton({
  label,
  color,
  isActive,
  onClick,
}: {
  label: string
  color: 'amber' | 'red' | 'zinc'
  isActive: boolean
  onClick: () => void
}) {
  const colorMap = {
    amber:
      'bg-amber-500 border-amber-700 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    red: 'bg-red-500 border-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    zinc: 'bg-[#222] border-[#111] text-zinc-400 shadow-[0_4px_10px_rgba(0,0,0,0.5)]',
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex aspect-square w-full items-center justify-center rounded-full border-b-[5px] font-mono text-[9px] font-black tracking-widest transition-all active:translate-y-1 active:border-b-0',
        isActive ? colorMap[color] : colorMap.zinc,
      )}
    >
      {label}
    </button>
  )
}

function MiniButton({
  label,
  color,
}: {
  label: string
  color: 'amber' | 'red' | 'zinc'
}) {
  const isColor = color !== 'zinc'
  return (
    <button className="flex w-full flex-1 items-center justify-center rounded border border-[#333] bg-[#18181a] px-1 py-1.5 font-mono text-[7px] font-bold whitespace-nowrap text-zinc-500 shadow-inner transition-colors active:bg-zinc-800">
      <span
        className={
          isColor ? `text-${color}-500 drop-shadow-[0_0_5px_currentColor]` : ''
        }
      >
        {label}
      </span>
    </button>
  )
}

function VerticalFader({
  label,
  value,
  onChange,
  height = 'h-24',
  hideValue = false,
}: {
  label: string
  value: number
  onChange: (e: any) => void
  height?: string
  hideValue?: boolean
}) {
  return (
    <div className="flex h-full w-full flex-col items-center">
      <div
        className={cn(
          'relative mb-1 flex w-8 flex-1 items-center justify-center',
          height,
        )}
      >
        <div className="absolute h-full w-2 rounded-full border border-[#222] bg-[#050505] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)]" />
        <div className="absolute top-1/2 left-1/2 h-[1px] w-4 -translate-x-1/2 -translate-y-1/2 bg-white/20" />
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={onChange}
          className="absolute h-6 w-[120%] -rotate-90 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border-y-[1.5px] [&::-webkit-slider-thumb]:border-[#111] [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-[#555] [&::-webkit-slider-thumb]:to-[#222] [&::-webkit-slider-thumb]:shadow-[0_5px_10px_rgba(0,0,0,0.8)]"
          style={{ width: height.replace('h-', '') + 'px' }}
        />
      </div>
      {!hideValue && (
        <span className="font-mono text-[7px] font-bold tracking-widest text-zinc-500">
          {label}
        </span>
      )}
    </div>
  )
}

function HorizontalFader({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (e: any) => void
}) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative flex h-8 w-full items-center justify-center">
        <div className="absolute h-2.5 w-full rounded-full border border-[#222] bg-[#050505] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)]" />
        <div className="absolute top-1/2 left-1/2 h-4 w-[1px] -translate-x-1/2 -translate-y-1/2 bg-white/20" />
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={onChange}
          className="absolute w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-12 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border-x-[1.5px] [&::-webkit-slider-thumb]:border-[#111] [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#555] [&::-webkit-slider-thumb]:to-[#222] [&::-webkit-slider-thumb]:shadow-[0_5px_10px_rgba(0,0,0,0.8)]"
        />
      </div>
      <span className="mt-1 font-mono text-[8px] font-bold tracking-[0.4em] text-zinc-600">
        {label}
      </span>
    </div>
  )
}
