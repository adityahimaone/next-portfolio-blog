'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { m as motion, useScroll, useTransform } from 'motion/react'
import { Play, Pause, SkipForward } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { useTheme } from 'next-themes'
import { Syne } from 'next/font/google'
import { cn } from '@/lib/utils'

const syne = Syne({ weight: ['700', '800'], subsets: ['latin'] })

// --- 1. InteractiveKnob Component (Draggable circular dial) ---
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
    <div className="flex flex-col items-center gap-0.5 select-none shrink-0">
      <div
        className={cn(
          'relative flex h-8 w-8 cursor-grab items-center justify-center rounded-full border shadow-sm active:cursor-grabbing transition-colors duration-300',
          resolvedTheme === 'dark'
            ? 'border-zinc-700 bg-zinc-800 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]'
            : 'border-zinc-300 bg-zinc-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]'
        )}
        onMouseDown={(e) => {
          e.preventDefault()
          handleStart(e.clientY)
        }}
      >
        {/* Pointer line */}
        <div
          className="absolute h-2 w-0.5 rounded-full bg-amber-500"
          style={{
            transform: `rotate(${angle}deg) translateY(-6px)`,
            transformOrigin: 'center 8px',
          }}
        />
        {/* Central dial cap */}
        <div className={cn(
          "h-1.5 w-1.5 rounded-full shadow-inner",
          resolvedTheme === 'dark' ? "bg-zinc-900" : "bg-zinc-300"
        )} />
      </div>
      <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest">
        {label}: {Math.round(value)}
      </span>
    </div>
  )
}

// --- 2. Interactive Canvas Waveform Stage (Full-Width lines) ---
function CanvasWaveform({
  isPlaying,
  playbackRate,
  resolvedTheme,
}: {
  isPlaying: boolean
  playbackRate: number
  resolvedTheme: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const isDarkMode = !mounted || resolvedTheme === 'dark'

  const colors = useMemo(
    () => ({
      primary: isDarkMode ? 'rgba(39, 50, 129, 0.4)' : 'rgba(39, 50, 129, 0.2)',
      secondary: isDarkMode ? 'rgba(61, 70, 139, 0.4)' : 'rgba(61, 70, 139, 0.2)',
      accent: isDarkMode ? 'rgba(230, 168, 23, 0.4)' : 'rgba(230, 168, 23, 0.2)',
    }),
    [isDarkMode],
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const lineCount = 10
    const lines: {
      phase: number
      speed: number
      amplitude: number
      frequency: number
      color: string
      yOffset: number
    }[] = []

    const initLines = () => {
      const height = canvas.height
      lines.length = 0

      for (let i = 0; i < lineCount; i++) {
        lines.push({
          phase: Math.random() * Math.PI * 2,
          speed: 0.0008 + Math.random() * 0.0012,
          amplitude: 15 + Math.random() * 45,
          frequency: 0.0008 + Math.random() * 0.0012,
          color:
            i % 3 === 0
              ? colors.primary
              : i % 3 === 1
                ? colors.secondary
                : colors.accent,
          yOffset: (height / lineCount) * i + (Math.random() * 30 - 15),
        })
      }
    }

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
      initLines()
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    let time = 0
    let animationFrameId: number

    const render = () => {
      if (!ctx || !canvas) return

      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)

      ctx.clearRect(0, 0, width, height)

      // Time advances faster when playing
      time += isPlaying ? 2.2 * playbackRate : 0.8

      lines.forEach((line) => {
        ctx.beginPath()

        // Modify wave dimensions based on audio playing status
        const ampFactor = isPlaying ? 1.6 : 0.5
        const currentAmp = line.amplitude * ampFactor

        for (let x = 0; x <= width; x += 15) {
          const y =
            line.yOffset +
            Math.sin(x * line.frequency + time * line.speed + line.phase) * currentAmp +
            Math.sin(x * line.frequency * 1.8 + time * line.speed * 1.3) * (currentAmp * 0.4)

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.strokeStyle = line.color
        ctx.lineWidth = 1.5

        // Glowing filter
        ctx.shadowBlur = isPlaying ? 8 : 2
        ctx.shadowColor = line.color

        ctx.stroke()
        ctx.shadowBlur = 0
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mounted, colors, isPlaying, playbackRate])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60 dark:opacity-40" />
}

export function HeroSection() {
  const [baseDelay, setBaseDelay] = useState(1)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (sessionStorage.getItem('preloaderShown')) {
      setBaseDelay(0.1)
    }
  }, [])

  const { isPlaying, togglePlay, currentTrack, volume, setVolume, playbackRate, setPlaybackRate, audioRef } = useAudio()

  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Parallax shifts
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])

  const resolvedThemeStr = resolvedTheme || 'dark'

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden transition-colors duration-500 py-24 select-none",
        resolvedThemeStr === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-800'
      )}
    >
      {/* Background Grille Texture & Active Soundwave Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle hardware grille dots */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#000_1.5px,transparent_1.5px)] opacity-5 dark:bg-[radial-gradient(#333_1.5px,transparent_1.5px)] dark:opacity-20"
          style={{ backgroundSize: '6px 6px' }}
        />
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay dark:opacity-[0.08]" />
        
        {/* Audio React Waves */}
        <CanvasWaveform
          isPlaying={isPlaying}
          playbackRate={playbackRate}
          resolvedTheme={resolvedThemeStr}
        />
      </div>

      {/* Main Content Layout */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 container mx-auto mt-20 flex flex-col items-center px-4 text-center md:px-6 w-full max-w-4xl"
      >
        {/* Top Glowing Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: baseDelay }}
          className={cn(
            "mb-8 flex items-center gap-3 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider shadow-md backdrop-blur-md",
            resolvedThemeStr === 'dark'
              ? 'border-white/10 bg-black/40 text-zinc-300 shadow-black/40'
              : 'border-zinc-200 bg-white/40 text-zinc-700 shadow-zinc-200/50'
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              isPlaying ? "bg-green-500" : "bg-amber-500"
            )} />
            <span className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              isPlaying ? "bg-green-500" : "bg-amber-500"
            )} />
          </span>
          {isPlaying ? "LIVE AUDIO STREAMING" : "CONSOLE STANDBY"}
        </motion.div>

        {/* Master Name Display Logo */}
        <div className={`mb-8 flex flex-col items-center ${syne.className}`}>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: baseDelay + 0.1 }}
            className="text-center text-[13vw] leading-[0.85] font-extrabold tracking-tighter italic drop-shadow-sm md:text-[10vw] lg:text-[8.5vw]"
          >
            <span className="block bg-linear-to-b from-zinc-700 via-zinc-900 to-black dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
              ADITYA
            </span>
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: baseDelay + 0.2 }}
            className="text-amber-500 dark:text-amber-400 text-[5.5vw] font-bold tracking-[0.55em] md:text-[3vw] lg:text-[2.2vw]"
          >
            HIMAONE
          </motion.h1>
        </div>

        {/* Subtitle */}
        <p className="animate-hero-desc mb-10 max-w-2xl text-center text-sm md:text-base font-light text-zinc-500 dark:text-zinc-400 tracking-wide">
          Orchestrating code and soundwaves into premium digital environments.
          <br className="hidden sm:block" /> Full-Stack Frontend Architect & Music Technologist.
        </p>

        {/* Floating Horizontal Glassmorphic Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: baseDelay + 0.4 }}
          className={cn(
            "relative flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-500 select-none z-30",
            resolvedThemeStr === 'dark'
              ? "bg-black/35 border-white/5 shadow-black/80"
              : "bg-white/35 border-zinc-200/50 shadow-zinc-400/10"
          )}
        >
          {/* Play/Pause Button */}
          <Magnetic intensity={0.15}>
            <button
              onClick={togglePlay}
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md active:scale-95 transition-all border cursor-pointer select-none",
                isPlaying
                  ? "bg-green-500/15 border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  : resolvedThemeStr === 'dark'
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                    : "bg-zinc-100 border-zinc-200 text-zinc-700"
              )}
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
              <div className={cn(
                "absolute top-1 right-1 h-1.5 w-1.5 rounded-full",
                isPlaying ? "bg-green-500 animate-pulse" : "bg-zinc-400"
              )} />
            </button>
          </Magnetic>

          {/* LCD Track Screen & Waveform */}
          <div className="flex-1 flex flex-col justify-between bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-[9px] text-green-500 shadow-inner h-11 min-w-0 select-none">
            <div className="flex justify-between items-center text-[7px] opacity-60">
              <span>SYSTEM STREAMING</span>
              <span>BPM: {Math.round(playbackRate * 128)}</span>
            </div>
            
            <div className="flex items-center gap-2 overflow-hidden">
              {/* Mini CSS Equalizer Waveform */}
              <div className="flex gap-0.5 items-end h-3.5 shrink-0">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-green-500"
                    animate={{
                      height: isPlaying ? [1, 10, 4, 8, 1] : 1,
                    }}
                    transition={{
                      duration: 0.55,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
              
              {/* Scrolling text */}
              <div className="relative flex-1 overflow-hidden">
                <motion.div
                  className="flex w-fit font-mono whitespace-nowrap text-green-400"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{
                    repeat: Infinity,
                    ease: 'linear',
                    duration: 10,
                  }}
                >
                  <span className="mr-8">{currentTrack}</span>
                  <span className="mr-8">{currentTrack}</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Draggable Circular Volume Knob */}
          <InteractiveKnob
            label="VOL"
            value={Math.round(volume * 100)}
            min={0}
            max={100}
            onChange={(val) => setVolume(val / 100)}
            resolvedTheme={resolvedThemeStr}
          />

          {/* Horizontal Pitch control fader */}
          <div className="flex items-center gap-2 select-none shrink-0 border-l border-zinc-300/30 dark:border-zinc-800/40 pl-3">
            <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest">Pitch</span>
            <div className="relative w-20 h-4 flex items-center justify-center">
              <div className={cn(
                "absolute w-full h-1 rounded-full shadow-inner border",
                resolvedThemeStr === 'dark' ? "bg-zinc-950 border-zinc-800" : "bg-zinc-200 border-zinc-300"
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
                  resolvedThemeStr === 'dark' ? "bg-zinc-700 border-zinc-600" : "bg-zinc-300 border-zinc-400"
                )}
                style={{ left: `calc(${((playbackRate - 0.8) / 0.4) * 100}% - 7px)` }}
              >
                <div className="w-0.5 h-full bg-amber-500 mx-auto" />
              </div>
            </div>
          </div>

          {/* Directly Skip Projects Key */}
          <Magnetic intensity={0.15}>
            <a
              href="#projects"
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-md active:scale-95 transition-all border cursor-pointer",
                resolvedThemeStr === 'dark'
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                  : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-black"
              )}
            >
              <SkipForward size={12} />
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>
    </section>
  )
}
