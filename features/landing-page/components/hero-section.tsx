'use client'

import { useRef, useEffect, useState } from 'react'
import { m as motion, useScroll, useTransform } from 'motion/react'
import { Play, Pause } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { Syne } from 'next/font/google'

const syne = Syne({ weight: ['700', '800'], subsets: ['latin'] })

function WaveformCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const draw = () => {
      time += 0.02
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      ctx.beginPath()
      ctx.strokeStyle = 'var(--accent-cyan)'
      ctx.lineWidth = 2
      ctx.shadowColor = 'var(--accent-cyan)'
      ctx.shadowBlur = 15

      for (let x = 0; x < w; x++) {
        const freq = 0.02 + Math.sin(time * 0.5) * 0.005
        const amp = 0.3 + Math.sin(time * 0.3) * 0.1
        const y = h / 2 + Math.sin(x * freq + time * 1.5) * h * amp
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Second waveform (subtle, offset)
      ctx.beginPath()
      ctx.strokeStyle = 'var(--accent-amber)'
      ctx.lineWidth = 1.5
      ctx.shadowColor = 'var(--accent-amber)'
      ctx.shadowBlur = 8
      ctx.globalAlpha = 0.4

      for (let x = 0; x < w; x++) {
        const freq = 0.015 + Math.sin(time * 0.4 + 1) * 0.003
        const amp = 0.2 + Math.sin(time * 0.2 + 1) * 0.08
        const y = h / 2 + Math.sin(x * freq + time * 2 + 1) * h * amp
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={120}
      className="absolute inset-0 z-0 h-full w-full object-cover opacity-80"
    />
  )
}

function SignalMeter({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = `${Math.round(value * 100)}%`
  return (
    <div className="flex flex-col items-center gap-1 min-w-[60px]">
      <span className="text-[8px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
        {label}
      </span>
      <div
        className="h-3 w-full rounded-full overflow-hidden"
        style={{ boxShadow: 'var(--nm-inset)', background: 'var(--nm-bg)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          initial={{ width: 0 }}
          whileInView={{ width: pct }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
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

  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--nm-bg)' }}
    >
      {/* Studio Monitor Outer Bezel */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 container mx-auto mt-24 flex flex-col items-center px-4 md:px-6"
      >
        {/* Monitor Cabinet */}
        <div
          className="relative w-full max-w-3xl rounded-3xl p-8 sm:p-12"
          style={{ boxShadow: 'var(--nm-raised)' }}
        >
          {/* Screen Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[var(--accent-red)]" />
                <div className="h-3 w-3 rounded-full bg-[var(--accent-amber)]" />
                <div className="h-3 w-3 rounded-full bg-[var(--accent-green)]" />
              </div>
              <span className="ml-4 text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
                STUDIO MONITOR PRO v2.6
              </span>
            </div>
            <div className="flex items-center gap-2 rounded px-2 py-1" style={{ boxShadow: 'var(--nm-flat)' }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-red)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-red)]" />
              </span>
              <span className="text-[8px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                LIVE
              </span>
            </div>
          </div>

          {/* Screen Area */}
          <div className="relative mb-10 flex flex-col items-center overflow-hidden rounded-2xl py-16 sm:py-20" style={{ boxShadow: 'var(--nm-inset)' }}>
            {/* Waveform Background */}
            <WaveformCanvas />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Name - Outlined */}
              <div className={`mb-4 flex flex-col items-center ${syne.className}`}>
                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: baseDelay + 0.1 }}
                  className="text-center text-[15vw] leading-[0.85] font-extrabold tracking-tighter italic md:text-[10vw] lg:text-[8vw]"
                  style={{
                    color: 'transparent',
                    WebkitTextStroke: '2px var(--accent-cyan)',
                    textShadow: '0 0 30px var(--accent-cyan)',
                  }}
                >
                  ADITYA
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: baseDelay + 0.2 }}
                  className="text-[6vw] font-bold tracking-[0.3em] md:text-[3vw] lg:text-[2.5vw]"
                  style={{
                    color: 'var(--accent-cyan)',
                    textShadow: '0 0 20px var(--accent-cyan), 0 0 40px var(--accent-cyan)',
                  }}
                >
                  HIMAONE
                </motion.h1>
              </div>

              {/* Subtitle */}
              <p className="animate-hero-desc mb-10 max-w-2xl text-center text-sm font-light sm:text-base md:text-lg text-zinc-500">
                Frontend Developer & Audio Enthusiast
              </p>

              {/* Play Button */}
              <Magnetic intensity={0.2}>
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause Session' : 'Play Session'}
                  className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all active:scale-95"
                  style={{ boxShadow: 'var(--nm-raised)' }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: isPlaying ? '0 0 20px var(--accent-green)' : 'none' }}
                  />
                  {isPlaying ? (
                    <Pause fill="currentColor" className="text-zinc-300 relative z-10" size={20} />
                  ) : (
                    <Play
                      fill="currentColor"
                      className="ml-1 text-zinc-300 relative z-10"
                      size={20}
                    />
                  )}
                </button>
              </Magnetic>
            </div>

            {/* Track Info */}
            <div className="mt-8 w-full max-w-md px-4">
              <div className="rounded-lg px-4 py-2 text-center" style={{ boxShadow: 'var(--nm-inset)' }}>
                <span className="text-[10px] font-mono text-[var(--accent-amber)]">
                  {isPlaying ? `PLAYING: ${currentTrack}` : 'STANDBY'}
                </span>
              </div>
            </div>
          </div>

          {/* Signal Meters */}
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <SignalMeter label="SIGNAL" value={0.85} color="var(--accent-green)" />
            <SignalMeter label="OUTPUT" value={0.65} color="var(--accent-cyan)" />
            <SignalMeter label="DRIVE" value={0.4} color="var(--accent-amber)" />
          </div>

          {/* Rotary Knob CTA */}
          <div className="mt-10 flex justify-center">
            <Magnetic intensity={0.15}>
              <a
                href="#projects"
                className="group relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full transition-all"
                style={{ boxShadow: 'var(--nm-raised)' }}
              >
                <motion.span
                  className="text-[8px] font-mono font-bold tracking-wider text-zinc-400"
                  whileHover={{ rotate: 90 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  EXPLORE
                </motion.span>
              </a>
            </Magnetic>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
