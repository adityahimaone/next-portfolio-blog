'use client'

import { useRef, useState, useEffect } from 'react'
import { m as motion, useScroll, useTransform } from 'motion/react'
import { Play, Pause, SkipForward } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { useTheme } from 'next-themes'
import { Syne } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'
import { SpectrumAnalyzer } from '@/components/spectrum-analyzer'
import { LCDDisplay } from '@/components/lcd-display'

const syne = Syne({ weight: ['700', '800'], subsets: ['latin'] })

// --- InteractiveKnob Component (Draggable circular dial) ---
interface InteractiveKnobProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (val: number) => void
  resolvedTheme: string
}

function InteractiveKnob({
  label,
  value,
  min,
  max,
  onChange,
  resolvedTheme,
}: InteractiveKnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const startValue = useRef(0)

  const handleStart = (y: number) => {
    setIsDragging(true)
    startY.current = y
    startValue.current = value
  }

  const handleMove = (y: number) => {
    if (!isDragging) return
    const delta = (startY.current - y) * 0.5
    const range = max - min
    const newValue = Math.max(min, Math.min(max, startValue.current + (delta / 100) * range))
    onChange(newValue)
  }

  const handleEnd = () => setIsDragging(false)

  useEffect(() => {
    if (isDragging) {
      const onMouseMove = (e: MouseEvent) => handleMove(e.clientY)
      const onMouseUp = () => handleEnd()
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      return () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }
    }
  }, [isDragging, value])

  const percentage = ((value - min) / (max - min)) * 100
  const angle = -135 + (percentage / 100) * 270

  return (
    <div className="flex flex-col items-center gap-1 select-none shrink-0">
      <div
        className={cn(
          'relative flex h-10 w-10 cursor-grab items-center justify-center rounded-full border shadow-sm active:cursor-grabbing transition-colors duration-300',
          resolvedTheme === 'dark'
            ? 'border-zinc-700 bg-zinc-800 shadow-[inset_0_1px_3px_rgba(255,255,255,0.08)]'
            : 'border-zinc-300 bg-zinc-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)]'
        )}
        onMouseDown={(e) => {
          e.preventDefault()
          handleStart(e.clientY)
        }}
      >
        {/* Pointer line */}
        <div
          className="absolute h-2.5 w-0.5 rounded-full bg-amber-500"
          style={{
            transform: `rotate(${angle}deg) translateY(-8px)`,
            transformOrigin: 'center 10px',
          }}
        />
        {/* Central dial cap */}
        <div className={cn(
          "h-2 w-2 rounded-full shadow-inner",
          resolvedTheme === 'dark' ? "bg-zinc-900" : "bg-zinc-300"
        )} />
      </div>
      <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
        {label}
      </span>
      <span className="font-mono text-[7px] text-zinc-400">
        {Math.round(value)}
      </span>
    </div>
  )
}

// --- HeroSection ---
export function HeroSection() {
  const [baseDelay, setBaseDelay] = useState(1)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (sessionStorage.getItem('preloaderShown')) {
      setBaseDelay(0.1)
    }
  }, [])

  const {
    isPlaying,
    togglePlay,
    currentTrack,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
  } = useAudio()

  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Parallax transforms
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])

  const resolvedThemeStr = resolvedTheme || 'dark'
  const isDark = resolvedThemeStr === 'dark'

  // Knob states for EQ cluster
  const [gain, setGain] = useState(65)
  const [bass, setBass] = useState(50)
  const [treble, setTreble] = useState(55)
  const [output, setOutput] = useState(80)

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden select-none chassis-panel chassis-texture"
    >
      {/* Background layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Grille dot pattern */}
        <div
          className={cn(
            "absolute inset-0",
            isDark
              ? "bg-[radial-gradient(#333_1px,transparent_1px)] opacity-[0.08]"
              : "bg-[radial-gradient(#000_1px,transparent_1px)] opacity-[0.03]"
          )}
          style={{ backgroundSize: '6px 6px' }}
        />
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay" />
      </div>

      {/* Main Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-24 mt-16"
      >
        {/* Asymmetric Grid: LEFT ~5/12, RIGHT ~7/12 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ===== LEFT COLUMN ===== */}
          <div className="lg:col-span-5 flex flex-col gap-5 order-2 lg:order-1">

            {/* 1. Spectrum Analyzer Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: baseDelay + 0.1, ease: 'easeOut' }}
              className={cn(
                "relative rounded-lg border p-3 shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)]",
                isDark
                  ? "bg-zinc-900/80 border-zinc-800"
                  : "bg-zinc-100/90 border-zinc-300"
              )}
            >
              {/* Screws */}
              <div className="absolute top-2 left-2">
                <Screw className="text-[var(--screw-color)]" />
              </div>
              <div className="absolute top-2 right-2">
                <Screw className="text-[var(--screw-color)]" />
              </div>

              {/* Panel label */}
              <div className="text-center mb-2 mt-1">
                <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-zinc-500">
                  Spectrum · Analyzer
                </span>
              </div>

              {/* Spectrum Analyzer */}
              <div className="h-20 md:h-24">
                <SpectrumAnalyzer isPlaying={isPlaying} barCount={24} />
              </div>
            </motion.div>

            {/* 2. Status Readout Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: baseDelay + 0.25, ease: 'easeOut' }}
              className={cn(
                "rounded-lg border p-3",
                isDark
                  ? "bg-zinc-950/80 border-zinc-800"
                  : "bg-zinc-100 border-zinc-300"
              )}
            >
              <div className="space-y-1.5 font-mono text-[10px] tracking-wider">
                {[
                  { label: 'SAMPLE RATE', value: '192kHz' },
                  { label: 'BIT DEPTH', value: '24-bit' },
                  { label: 'BUFFER', value: '256 smp' },
                  { label: 'LATENCY', value: '2.4ms' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className={isDark ? "text-zinc-600" : "text-zinc-400"}>
                      {item.label}
                    </span>
                    <span className={isDark ? "text-zinc-300" : "text-zinc-700"}>
                      {item.value}
                    </span>
                  </div>
                ))}

                {/* LED Status */}
                <div className={cn(
                  "flex items-center gap-2 pt-2 mt-2 border-t",
                  isDark ? "border-zinc-800" : "border-zinc-300"
                )}>
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isPlaying
                        ? "bg-green-500 led-pulse text-green-500"
                        : "bg-amber-500 text-amber-500"
                    )}
                  />
                  <span className={cn(
                    "text-[9px] tracking-widest uppercase",
                    isPlaying ? "text-green-500" : "text-amber-500"
                  )}>
                    {isPlaying ? '● LIVE' : '○ STANDBY'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 3. Knob Cluster - Channel EQ (hidden on mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: baseDelay + 0.4, ease: 'easeOut' }}
              className={cn(
                "hidden md:block rounded-lg border p-4",
                isDark
                  ? "bg-zinc-900/60 border-zinc-800"
                  : "bg-zinc-100/80 border-zinc-300"
              )}
            >
              <span className="block font-mono text-[9px] tracking-[0.25em] uppercase text-zinc-500 mb-4 text-center">
                Channel EQ
              </span>
              <div className="grid grid-cols-2 gap-4 place-items-center">
                <InteractiveKnob
                  label="GAIN"
                  value={gain}
                  min={0}
                  max={100}
                  onChange={setGain}
                  resolvedTheme={resolvedThemeStr}
                />
                <InteractiveKnob
                  label="BASS"
                  value={bass}
                  min={0}
                  max={100}
                  onChange={setBass}
                  resolvedTheme={resolvedThemeStr}
                />
                <InteractiveKnob
                  label="TREBLE"
                  value={treble}
                  min={0}
                  max={100}
                  onChange={setTreble}
                  resolvedTheme={resolvedThemeStr}
                />
                <InteractiveKnob
                  label="OUTPUT"
                  value={output}
                  min={0}
                  max={100}
                  onChange={setOutput}
                  resolvedTheme={resolvedThemeStr}
                />
              </div>
            </motion.div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="lg:col-span-7 flex flex-col gap-5 order-1 lg:order-2">

            {/* 1. Main LCD Display (centerpiece) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: baseDelay, ease: 'easeOut' }}
            >
              <LCDDisplay variant="green" label="MASTER OUTPUT">
                {/* Top bar */}
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[9px] tracking-widest opacity-50">
                    CH01 · MASTER
                  </span>
                  <span className="font-mono text-[9px] tracking-widest opacity-50">
                    {isPlaying ? '▶ REC' : '■ IDLE'}
                  </span>
                </div>

                {/* Main name */}
                <div className={cn("flex flex-col items-center text-center", syne.className)}>
                  <h1
                    className="text-[12vw] md:text-[8vw] lg:text-[6vw] font-extrabold tracking-tighter leading-[0.85]"
                    style={{ color: 'var(--lcd-text)' }}
                  >
                    ADITYA
                  </h1>
                  <h2
                    className="text-[4vw] md:text-[2.5vw] lg:text-[1.8vw] font-bold tracking-[0.3em] mt-1"
                    style={{ color: 'var(--accent-knob)' }}
                  >
                    HIMAWAN
                  </h2>
                </div>

                {/* Role */}
                <p className="text-center font-mono text-[10px] md:text-xs tracking-wider opacity-60 mt-3">
                  Frontend Developer · Music Technologist
                </p>

                {/* Animated sine wave */}
                <svg className="w-full h-6 mt-4" viewBox="0 0 400 30" preserveAspectRatio="none">
                  <path
                    d="M0,15 Q25,5 50,15 Q75,25 100,15 Q125,5 150,15 Q175,25 200,15 Q225,5 250,15 Q275,25 300,15 Q325,5 350,15 Q375,25 400,15"
                    fill="none"
                    stroke="var(--lcd-text)"
                    strokeWidth="1.5"
                    opacity="0.4"
                    className="[animation:lcd-wave_3s_ease-in-out_infinite]"
                  />
                </svg>

                {/* Bottom status */}
                <div className="flex justify-between items-center mt-2 font-mono text-[8px] tracking-wider opacity-40">
                  <span>
                    {isPlaying ? `NOW PLAYING: ${currentTrack}` : 'STANDBY MODE'}
                  </span>
                  <span>BPM: {Math.round(playbackRate * 128)}</span>
                </div>
              </LCDDisplay>
            </motion.div>

            {/* 2. Transport Controls Bar */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: baseDelay + 0.2, ease: 'easeOut' }}
              className={cn(
                "flex flex-wrap md:flex-nowrap items-center gap-3 rounded-lg border p-3",
                isDark
                  ? "bg-zinc-900/70 border-zinc-800"
                  : "bg-zinc-100/90 border-zinc-300"
              )}
            >
              {/* Play/Pause */}
              <Magnetic intensity={0.15}>
                <button
                  onClick={togglePlay}
                  className={cn(
                    "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md active:scale-95 transition-all border cursor-pointer",
                    isPlaying
                      ? "bg-green-500/15 border-green-500 text-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                      : isDark
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                        : "bg-zinc-200 border-zinc-300 text-zinc-600"
                  )}
                >
                  {isPlaying
                    ? <Pause size={14} fill="currentColor" />
                    : <Play size={14} fill="currentColor" className="ml-0.5" />
                  }
                </button>
              </Magnetic>

              {/* Scrolling track name LCD readout */}
              <div className={cn(
                "flex-1 min-w-0 h-9 flex items-center rounded border px-2 font-mono text-[9px] overflow-hidden",
                "bg-zinc-950 border-zinc-800 text-green-400"
              )}>
                <div className="flex gap-0.5 items-end h-3 shrink-0 mr-2">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-green-500"
                      animate={{
                        height: isPlaying ? [1, 8, 3, 6, 1] : 1,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.06,
                      }}
                    />
                  ))}
                </div>
                <div className="relative flex-1 overflow-hidden">
                  <motion.div
                    className="flex w-fit whitespace-nowrap"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                      repeat: Infinity,
                      ease: 'linear',
                      duration: 12,
                    }}
                  >
                    <span className="mr-8">{currentTrack}</span>
                    <span className="mr-8">{currentTrack}</span>
                  </motion.div>
                </div>
              </div>

              {/* Volume Knob */}
              <InteractiveKnob
                label="VOL"
                value={Math.round(volume * 100)}
                min={0}
                max={100}
                onChange={(val) => setVolume(val / 100)}
                resolvedTheme={resolvedThemeStr}
              />

              {/* Vertical separator */}
              <div className={cn(
                "hidden md:block w-px h-8",
                isDark ? "bg-zinc-700" : "bg-zinc-300"
              )} />

              {/* Pitch fader */}
              <div className="flex items-center gap-2 select-none shrink-0">
                <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest">
                  Pitch
                </span>
                <div className="relative w-20 h-4 flex items-center justify-center">
                  <div className={cn(
                    "absolute w-full h-1 rounded-full shadow-inner border",
                    isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-200 border-zinc-300"
                  )} />
                  <input
                    type="range"
                    min="80"
                    max="120"
                    value={Math.round(playbackRate * 100)}
                    onChange={(e) => setPlaybackRate(Number(e.target.value) / 100)}
                    className="absolute w-full h-4 opacity-0 cursor-ew-resize z-20"
                  />
                  {/* Visual slider handle */}
                  <div
                    className={cn(
                      "absolute w-3.5 h-2.5 rounded shadow-sm pointer-events-none z-10 border",
                      isDark ? "bg-zinc-700 border-zinc-600" : "bg-zinc-300 border-zinc-400"
                    )}
                    style={{ left: `calc(${((playbackRate - 0.8) / 0.4) * 100}% - 7px)` }}
                  >
                    <div className="w-0.5 h-full bg-amber-500 mx-auto" />
                  </div>
                </div>
              </div>

              {/* Skip button */}
              <Magnetic intensity={0.15}>
                <a
                  href="#projects"
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm active:scale-95 transition-all border cursor-pointer",
                    isDark
                      ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                      : "bg-zinc-200 border-zinc-300 text-zinc-500 hover:text-black"
                  )}
                >
                  <SkipForward size={11} />
                </a>
              </Magnetic>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
