'use client'

/**
 * Ravemped 4.0 — Music Section (Reference Monitor + DAP)
 *
 * Concept: DAP device visual (kiri) — album art display + scrolling track info.
 * Waveform monitor (kanan) — FFT spectrum analyzer.
 * Transport buttons. Level meter L/R.
 * Caption: "Reference track. Playing while everything above was being built."
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { m, useInView, useReducedMotion } from 'motion/react'
import {
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionFrame } from '../r3/section-frame'

// ─── FFT Spectrum Bars ────────────────────────────────────

const SPECTRUM_BARS = 32

function SpectrumAnalyzer({ active }: { active: boolean }) {
  const prefersReduced = useReducedMotion()
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: SPECTRUM_BARS }, () => 10 + Math.random() * 30),
  )

  useEffect(() => {
    if (!active || prefersReduced) return
    const interval = setInterval(() => {
      setBars(
        Array.from({ length: SPECTRUM_BARS }, (_, i) => {
          // Simulate frequency distribution — bass heavier, treble lighter
          const bassBias = 1 - i / SPECTRUM_BARS
          return 10 + Math.random() * (50 + bassBias * 40)
        }),
      )
    }, 80)
    return () => clearInterval(interval)
  }, [active, prefersReduced])

  return (
    <div className="flex items-end gap-[1px] h-full w-full" aria-hidden>
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[1px] transition-all duration-75"
          style={{
            height: `${height}%`,
            background: `linear-gradient(to top, var(--r3-filament), color-mix(in srgb, var(--r3-filament) ${30 + (height / 100) * 70}%, transparent))`,
            opacity: 0.4 + (height / 100) * 0.6,
          }}
        />
      ))}
    </div>
  )
}

// ─── Level Meter (L/R) ────────────────────────────────────

function LevelMeter({ label, level }: { label: string; level: number }) {
  const segments = 12

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex flex-col-reverse gap-[1px]">
        {Array.from({ length: segments }).map((_, i) => {
          const threshold = ((i + 1) / segments) * 100
          const lit = level >= threshold
          const isClip = i >= segments - 2
          const isWarn = i >= segments - 4 && i < segments - 2

          return (
            <div
              key={i}
              className={cn(
                'w-3 h-[5px] rounded-[1px] transition-all duration-100',
                lit
                  ? isClip
                    ? 'bg-[var(--r3-melody)] shadow-[0_0_4px_var(--r3-melody)]'
                    : isWarn
                      ? 'bg-[var(--r3-filament)] shadow-[0_0_3px_var(--r3-filament)]'
                      : 'bg-[var(--r3-signal)] shadow-[0_0_3px_var(--r3-signal)]'
                  : 'bg-[var(--r3-edge)]/30',
              )}
            />
          )
        })}
      </div>
      <span className="r3-mono text-[7px] text-[var(--r3-label)]">{label}</span>
    </div>
  )
}

// ─── DAP Device ───────────────────────────────────────────

function DapDevice({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  const prefersReduced = useReducedMotion()

  return (
    <div className="r3-panel-rack p-4 sm:p-5 flex flex-col items-center gap-4 max-w-[280px] mx-auto lg:mx-0">
      {/* Screen */}
      <div className="w-full aspect-square max-w-[200px] rounded-sm border border-[var(--r3-edge)] bg-[var(--r3-studio)] overflow-hidden relative">
        {/* Album art placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 rounded-sm bg-gradient-to-br from-[var(--r3-filament)]/20 to-[var(--r3-melody)]/20 border border-[var(--r3-edge)] flex items-center justify-center">
            <Headphones size={32} className="text-[var(--r3-filament)]/60" />
          </div>
        </div>

        {/* Scrolling track info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--r3-studio)] to-transparent p-3">
          <m.div
            animate={playing && !prefersReduced ? { x: [0, -100, 0] } : {}}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="whitespace-nowrap"
          >
            <span className="r3-mono text-[10px] text-[var(--r3-text)]">
              NOW PLAYING — Reference Track · Studio Session 2026
            </span>
          </m.div>
          <span className="r3-mono text-[8px] text-[var(--r3-label)] mt-1 block">
            {playing ? '▶ PLAYING' : '⏸ PAUSED'}
          </span>
        </div>

        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      </div>

      {/* Transport controls */}
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-full border border-[var(--r3-edge)] hover:border-[var(--r3-text-mute)] transition-colors"
          aria-label="Previous track"
        >
          <SkipBack size={14} className="text-[var(--r3-text-mute)]" />
        </button>
        <button
          onClick={onToggle}
          className={cn(
            'p-3 rounded-full border transition-all',
            playing
              ? 'border-[var(--r3-filament)] bg-[var(--r3-filament)]/10 shadow-[0_0_12px_var(--r3-filament)]/20'
              : 'border-[var(--r3-edge)] hover:border-[var(--r3-filament)]',
          )}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <Pause size={18} className="text-[var(--r3-filament)]" />
          ) : (
            <Play size={18} className="text-[var(--r3-text-mute)]" />
          )}
        </button>
        <button
          className="p-2 rounded-full border border-[var(--r3-edge)] hover:border-[var(--r3-text-mute)] transition-colors"
          aria-label="Next track"
        >
          <SkipForward size={14} className="text-[var(--r3-text-mute)]" />
        </button>
      </div>

      {/* Volume indicator */}
      <div className="flex items-center gap-2 w-full">
        <Volume2 size={12} className="text-[var(--r3-label)] shrink-0" />
        <div className="flex-1 h-1 rounded-full bg-[var(--r3-edge)]">
          <div className="h-full w-3/4 rounded-full bg-[var(--r3-filament)]" />
        </div>
        <span className="r3-mono text-[8px] text-[var(--r3-label)]">75%</span>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────

export function MusicSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const prefersReduced = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [levelL, setLevelL] = useState(30)
  const [levelR, setLevelR] = useState(25)

  // Animate levels when playing
  useEffect(() => {
    if (!playing || prefersReduced) return
    const interval = setInterval(() => {
      setLevelL(20 + Math.random() * 60)
      setLevelR(20 + Math.random() * 60)
    }, 150)
    return () => clearInterval(interval)
  }, [playing, prefersReduced])

  return (
    <SectionFrame
      id="music"
      track="05"
      name="PLAY"
      device="Reference Monitor / DAP"
      color="filament"
      className="bg-[var(--r3-rack)]"
    >
      <div
        ref={ref}
        className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-6"
      >
        {/* Left: DAP Device */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="lg:w-[300px] shrink-0"
        >
          <DapDevice playing={playing} onToggle={() => setPlaying(!playing)} />
        </m.div>

        {/* Right: Waveform Monitor + Level Meters */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex-1 flex flex-col gap-4"
        >
          {/* Spectrum analyzer */}
          <div className="r3-panel-rack p-4 flex-1 min-h-[160px] sm:min-h-[200px]">
            <div className="flex items-center justify-between mb-3">
              <span className="r3-mono text-[9px] tracking-widest text-[var(--r3-filament)]">
                FFT SPECTRUM
              </span>
              <span className="r3-mono text-[8px] text-[var(--r3-label)]">
                44.1kHz / 16bit
              </span>
            </div>
            <div className="h-32 sm:h-40">
              <SpectrumAnalyzer active={playing && isInView} />
            </div>
            {/* Frequency labels */}
            <div className="flex justify-between mt-2">
              <span className="r3-mono text-[7px] text-[var(--r3-label)]">20Hz</span>
              <span className="r3-mono text-[7px] text-[var(--r3-label)]">200Hz</span>
              <span className="r3-mono text-[7px] text-[var(--r3-label)]">2kHz</span>
              <span className="r3-mono text-[7px] text-[var(--r3-label)]">20kHz</span>
            </div>
          </div>

          {/* Level meters + caption */}
          <div className="flex items-end gap-4">
            <div className="flex gap-2">
              <LevelMeter label="L" level={playing ? levelL : 0} />
              <LevelMeter label="R" level={playing ? levelR : 0} />
            </div>
            <div className="flex-1">
              <p className="r3-prose text-xs sm:text-sm text-[var(--r3-text-mute)] leading-relaxed italic">
                &ldquo;Reference track. Playing while everything above was being built.&rdquo;
              </p>
              <div className="r3-panel-rack flex items-center gap-2 px-2 py-1.5 mt-2 w-fit">
                <span className="r3-led r3-led--filament r3-pulse" aria-hidden />
                <span className="r3-mono text-[9px] text-[var(--r3-text-mute)]">
                  Now playing via global player ↗
                </span>
              </div>
            </div>
          </div>
        </m.div>
      </div>
    </SectionFrame>
  )
}
