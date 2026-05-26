'use client'

/**
 * Ravemped 3.0 — Hero Section
 * Concept: an empty FL Studio arrangement view with a PLAY button.
 *
 * Layout:
 *  - Title bar (project file name)
 *  - Toolbar (BPM, time signature, transport controls)
 *  - Empty arrangement: track lanes + bar ruler + cursor blink
 *  - PLAY button — primary CTA. Clicking arms the page (broadcasts
 *    `r3:armed` event). The rest of the page reacts on its own.
 */

import { useEffect, useState } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { ArrowRight, Mail, Play, Pause } from 'lucide-react'
import { useBpmClock } from '../r3/use-bpm-clock'
import { EMAIL } from '../constants'

const BAR_COUNT = 16
const TRACK_LANES = [
  { name: '01 ABOUT', color: 'var(--r3-clip)' },
  { name: '02 SKILLS', color: 'var(--r3-beat)' },
  { name: '03 PROJECTS', color: 'var(--r3-signal)' },
  { name: '04 MUSIC', color: 'var(--r3-filament)' },
  { name: '05 BLOG', color: 'var(--r3-filament)' },
  { name: '06 CONTACT', color: 'var(--r3-melody)' },
]

export function HeroSection() {
  const prefersReduced = useReducedMotion()
  const [armed, setArmed] = useState(false)
  const { beat, bar } = useBpmClock(120)

  useEffect(() => {
    const onArm = () => setArmed(true)
    window.addEventListener('r3:armed', onArm)
    return () => window.removeEventListener('r3:armed', onArm)
  }, [])

  const handlePlay = () => {
    if (!armed) {
      window.dispatchEvent(new CustomEvent('r3:armed'))
    } else {
      window.dispatchEvent(new CustomEvent('r3:disarmed'))
      setArmed(false)
    }
  }

  return (
    <section
      id="home"
      className="relative min-h-[100svh] w-full overflow-hidden px-4 pt-20 pb-10 sm:px-6 sm:pt-24 sm:pb-16 lg:px-10"
    >
      {/* DAW-style title bar */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="r3-panel mx-auto mb-3 flex max-w-7xl items-center justify-between gap-4 px-3 py-2 sm:px-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex shrink-0 gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--r3-clip)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--r3-filament)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--r3-signal)]" />
          </span>
          <span className="r3-mono text-[11px] truncate text-[var(--r3-text-mute)]">
            aditya_himawan_2026.flp
          </span>
          <span className="hidden sm:inline-block h-3 w-px bg-[var(--r3-edge)]" />
          <span className="hidden sm:inline r3-mono text-[10px] text-[var(--r3-text-mute)]">
            unsaved changes · session 001
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="r3-mono text-[10px] tabular-nums text-[var(--r3-text-mute)]">
            {String(bar).padStart(3, '0')}.{beat}.0
          </span>
          <span className="r3-led r3-pulse" aria-hidden />
        </div>
      </m.div>

      {/* Toolbar */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="r3-panel-rack mx-auto mb-6 flex max-w-7xl flex-wrap items-center gap-3 px-3 py-2 sm:px-4"
      >
        <div className="flex items-center gap-2">
          <span className="r3-label">BPM</span>
          <span className="r3-mono text-sm font-semibold text-[var(--r3-text)] tabular-nums">120</span>
        </div>
        <span className="h-3 w-px bg-[var(--r3-edge)]" />
        <div className="flex items-center gap-2">
          <span className="r3-label">SIG</span>
          <span className="r3-mono text-xs text-[var(--r3-text)]">4/4</span>
        </div>
        <span className="h-3 w-px bg-[var(--r3-edge)]" />
        <div className="flex items-center gap-2">
          <span className="r3-label">KEY</span>
          <span className="r3-mono text-xs text-[var(--r3-text)]">C MIN</span>
        </div>
        <span className="hidden sm:block h-3 w-px bg-[var(--r3-edge)]" />
        <div className="hidden sm:flex items-center gap-2">
          <span className="r3-label">SAMPLE</span>
          <span className="r3-mono text-xs text-[var(--r3-text-mute)]">48 kHz / 24-bit</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`r3-led ${armed ? '' : 'r3-led--off'}`} aria-hidden />
          <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
            {armed ? 'PLAYING' : 'STOPPED'}
          </span>
        </div>
      </m.div>

      {/* Hero grid: arrangement + intro */}
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_auto] lg:gap-10">
        {/* Empty arrangement (visual chrome) */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="r3-panel relative overflow-hidden order-2 lg:order-1"
        >
          {/* Bar ruler */}
          <div className="flex border-b border-[var(--r3-edge)] bg-[var(--r3-rack)]">
            <div className="w-[110px] shrink-0 border-r border-[var(--r3-edge)] px-3 py-1.5">
              <span className="r3-label">BARS</span>
            </div>
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${BAR_COUNT}, minmax(0, 1fr))` }}>
              {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="border-r border-[var(--r3-edge)] px-1 py-1.5 text-center r3-mono text-[9px] text-[var(--r3-text-mute)] tabular-nums"
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>

          {/* Track lanes (empty regions) */}
          <div>
            {TRACK_LANES.map((lane, idx) => (
              <div key={lane.name} className="flex border-b border-[var(--r3-edge)] last:border-b-0">
                <div className="w-[110px] shrink-0 border-r border-[var(--r3-edge)] bg-[var(--r3-rack)] px-3 py-2.5 flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: lane.color, boxShadow: `0 0 6px ${lane.color}` }}
                  />
                  <span className="r3-mono text-[10px] truncate text-[var(--r3-text-mute)]">
                    {lane.name}
                  </span>
                </div>
                <div
                  className="relative flex-1 grid h-12 sm:h-14"
                  style={{ gridTemplateColumns: `repeat(${BAR_COUNT}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: BAR_COUNT }).map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-[var(--r3-edge)]/60"
                    />
                  ))}
                  {/* Empty placeholder hint */}
                  <div className="pointer-events-none absolute inset-0 r3-grid-fine opacity-40" />
                </div>
              </div>
            ))}
          </div>

          {/* Playhead at bar 1 (animates when armed) */}
          <m.div
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-[var(--r3-signal)] [box-shadow:0_0_12px_rgba(57,255,110,0.5)]"
            initial={{ left: 'calc(110px + 1.5%)' }}
            animate={
              prefersReduced || !armed
                ? { left: 'calc(110px + 1.5%)' }
                : { left: ['calc(110px + 1.5%)', 'calc(100% - 1.5%)'] }
            }
            transition={
              prefersReduced || !armed
                ? { duration: 0 }
                : { duration: 32, ease: 'linear', repeat: Infinity }
            }
          />

          {/* Caption */}
          <div className="border-t border-[var(--r3-edge)] bg-[var(--r3-rack)] flex items-center justify-between px-3 py-1.5">
            <span className="r3-label">arrangement.view</span>
            <span className="r3-mono text-[9px] text-[var(--r3-text-mute)]">
              {armed ? 'rendering preview…' : 'awaiting input'}
            </span>
          </div>
        </m.div>

        {/* Right rail: intro + PLAY */}
        <div className="order-1 lg:order-2 lg:max-w-[420px]">
          <div className="r3-panel p-5 sm:p-6 lg:p-7">
            <div className="r3-label mb-3">track 01 · render</div>
            <h1 className="r3-display text-3xl font-bold leading-[1.05] text-[var(--r3-text)] sm:text-4xl lg:text-[2.7rem]">
              <span className="block text-[var(--r3-text-mute)] text-[0.55em] r3-mono tracking-widest mb-2">
                ADITYA HIMAWAN
              </span>
              Frontend developer who builds and ships.
            </h1>
            <p className="r3-prose mt-5 text-sm leading-relaxed text-[var(--r3-text-mute)] sm:text-base">
              Six years writing interfaces. One session, end to end —
              from boot screen to bounced render.
            </p>

            <button
              type="button"
              onClick={handlePlay}
              className="mt-6 group inline-flex items-center gap-3 rounded-sm border border-[var(--r3-signal)] bg-[var(--r3-signal)]/10 px-5 py-3 text-sm font-semibold text-[var(--r3-signal)] transition-colors hover:bg-[var(--r3-signal)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--r3-signal)]/60 cursor-pointer"
              aria-pressed={armed}
            >
              {armed ? (
                <Pause className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              ) : (
                <Play className="h-4 w-4 fill-current" strokeWidth={0} aria-hidden />
              )}
              <span className="r3-mono tracking-widest">{armed ? 'PAUSE SESSION' : 'PLAY SESSION'}</span>
            </button>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-sm border border-[var(--r3-edge)] bg-[var(--r3-rack)] px-3 py-2 r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] transition-colors hover:border-[var(--r3-text-mute)] hover:text-[var(--r3-text)]"
              >
                JUMP TO WORK <ArrowRight className="h-3 w-3" aria-hidden />
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-sm border border-[var(--r3-edge)] bg-[var(--r3-rack)] px-3 py-2 r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] transition-colors hover:border-[var(--r3-text-mute)] hover:text-[var(--r3-text)]"
              >
                <Mail className="h-3 w-3" aria-hidden /> CONTACT
              </a>
            </div>
          </div>

          {/* Lower meta panel */}
          <div className="r3-panel-rack mt-3 p-3 grid grid-cols-2 gap-3">
            <div>
              <div className="r3-label">status</div>
              <div className="r3-mono text-xs text-[var(--r3-text)] mt-1">Open to work</div>
            </div>
            <div>
              <div className="r3-label">based</div>
              <div className="r3-mono text-xs text-[var(--r3-text)] mt-1">Jakarta · GMT+7</div>
            </div>
            <div>
              <div className="r3-label">stack</div>
              <div className="r3-mono text-xs text-[var(--r3-text)] mt-1">React · Next · TS</div>
            </div>
            <div>
              <div className="r3-label">years</div>
              <div className="r3-mono text-xs text-[var(--r3-text)] mt-1">6+</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint to scroll */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mx-auto mt-8 flex max-w-7xl items-center gap-3"
      >
        <span className="h-px flex-1 bg-[var(--r3-edge)]" />
        <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
          ↓ SCROLL · session continues
        </span>
        <span className="h-px flex-1 bg-[var(--r3-edge)]" />
      </m.div>
    </section>
  )
}
