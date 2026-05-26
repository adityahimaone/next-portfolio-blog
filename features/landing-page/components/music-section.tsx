'use client'

/**
 * Ravemped 3.0 — Music Section (Reference Track)
 * Concept: A narrative pause — "this is what's playing while everything
 * above was being built." Visual waveform + copy. The actual Spotify
 * player lives globally in layout; this is the visual/narrative beat.
 */

import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'motion/react'
import { Headphones } from 'lucide-react'

import { SectionFrame } from '../r3'

// ─── Fake Waveform Bars ───────────────────────────────────────────────────────

const BAR_COUNT = 48

function WaveformVisual() {
  return (
    <div className="flex h-32 items-end gap-[2px] sm:h-40 lg:h-48" aria-hidden>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        // Deterministic pseudo-random heights for visual interest
        const seed = ((i * 7 + 13) % 17) / 17
        const height = 20 + seed * 80 // 20% to 100%
        const delay = i * 0.04

        return (
          <m.div
            key={i}
            className="flex-1 rounded-t-[1px] bg-[var(--r3-filament)]"
            style={{ opacity: 0.3 + seed * 0.7 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              duration: 0.6,
              delay,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              className="w-full origin-bottom rounded-t-[1px]"
              style={{
                height: `${height}%`,
                background: `linear-gradient(to top, var(--r3-filament), color-mix(in srgb, var(--r3-filament) 40%, transparent))`,
                animation: `r3-waveform-breathe ${1.8 + seed * 1.2}s ease-in-out ${delay}s infinite alternate`,
              }}
            />
          </m.div>
        )
      })}
    </div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function MusicSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const prefersReduced = useReducedMotion()

  return (
    <SectionFrame
      id="music"
      track="04"
      name="PLAY"
      device="Reference Monitor / Spotify"
      color="filament"
      className="bg-[var(--r3-rack)]"
    >
      <div
        ref={ref}
        className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12"
      >
        {/* Left: Waveform visual */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative flex-1 overflow-hidden rounded-sm border border-[var(--r3-edge)] bg-[var(--r3-console)] p-4 sm:p-6"
        >
          {/* Playhead line */}
          <div className="pointer-events-none absolute top-4 bottom-4 left-[62%] w-px bg-[var(--r3-filament)] opacity-60 sm:top-6 sm:bottom-6">
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--r3-filament)] shadow-[0_0_8px_var(--r3-filament)]" />
          </div>

          {/* Waveform */}
          {isInView && <WaveformVisual />}

          {/* Timeline ruler */}
          <div className="mt-3 flex items-center justify-between border-t border-[var(--r3-edge)] pt-2">
            <span className="r3-mono text-[9px] tabular-nums text-[var(--r3-text-mute)]">
              0:00
            </span>
            <span className="r3-mono text-[9px] tabular-nums text-[var(--r3-text-mute)]">
              1:30
            </span>
            <span className="r3-mono text-[9px] tabular-nums text-[var(--r3-text-mute)]">
              3:00
            </span>
            <span className="r3-mono text-[9px] tabular-nums text-[var(--r3-text-mute)]">
              4:30
            </span>
          </div>
        </m.div>

        {/* Right: Narrative copy */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col gap-5 lg:max-w-[380px]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--r3-filament)]/30 bg-[var(--r3-filament)]/10">
              <Headphones
                className="h-4 w-4 text-[var(--r3-filament)]"
                aria-hidden
              />
            </div>
            <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-filament)]">
              REFERENCE MONITOR
            </span>
          </div>

          <h3 className="r3-display text-xl font-semibold leading-snug text-[var(--r3-text)] sm:text-2xl">
            This is what&apos;s playing while everything above was being built.
          </h3>

          <p className="r3-prose text-sm leading-relaxed text-[var(--r3-text-mute)] sm:text-base">
            Every session has a reference track. Music shapes the rhythm of the
            code — the tempo of iteration, the dynamics of focus. The Spotify
            widget in the corner is always running.
          </p>

          <div className="r3-panel-rack flex items-center gap-3 px-3 py-2.5">
            <span className="r3-led r3-led--filament r3-pulse" aria-hidden />
            <span className="r3-mono text-[10px] text-[var(--r3-text-mute)]">
              Now playing via global player ↗
            </span>
          </div>
        </m.div>
      </div>

      {/* Inline keyframes for waveform breathing animation */}
      <style jsx global>{`
        @keyframes r3-waveform-breathe {
          from {
            transform: scaleY(1);
          }
          to {
            transform: scaleY(0.6);
          }
        }
      `}</style>
    </SectionFrame>
  )
}
