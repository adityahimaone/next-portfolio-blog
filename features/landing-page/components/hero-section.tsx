'use client'

/**
 * Ravemped 4.0 — Hero: Synthesizer Workstation.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  Title bar — preset / project file / status        │
 *   ├─────────────────────────────────────────────────────┤
 *   │                                                     │
 *   │   ┌──────────── LCD Display ────────────┐           │
 *   │   │  PRESET, name, tagline, readouts    │           │
 *   │   └─────────────────────────────────────┘           │
 *   │                                                     │
 *   │   ┌─ Knobs ──┐  ┌─ Wave switch + Transport ─┐       │
 *   │   │ CUTOFF   │  │ SAW/SQR/SINE/TRI          │       │
 *   │   │ RES      │  │ PLAY · PITCH BEND         │       │
 *   │   │ VOL      │  └───────────────────────────┘       │
 *   │   └──────────┘                                      │
 *   │                                                     │
 *   │   ┌─ Pads (8 cells) ──┐                             │
 *   │   └───────────────────┘                             │
 *   │                                                     │
 *   │   ▼ scroll to play the session                      │
 *   └─────────────────────────────────────────────────────┘
 *
 * Tone.js audio context starts on first user gesture (knob drag, pad press,
 * or PLAY click). All other sections of the page key off `r3:armed` events.
 */

import { useEffect, useState } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { Pause, Play } from 'lucide-react'

import { useBpmClock } from '../r3/use-bpm-clock'
import { useSynthEngine, type OscillatorType } from '../r3/use-synth-engine'
import { SynthDisplay } from '../r3/synth-display'
import { SynthKnob } from '../r3/synth-knob'
import { SynthPad } from '../r3/synth-pad'
import { SynthOscilloscope } from '../r3/synth-oscilloscope'
import { cn } from '@/lib/utils'

const OSC_TYPES: { value: OscillatorType; label: string; symbol: string }[] = [
  { value: 'sawtooth', label: 'SAW', symbol: '◢' },
  { value: 'square', label: 'SQR', symbol: '⬓' },
  { value: 'sine', label: 'SIN', symbol: '∿' },
  { value: 'triangle', label: 'TRI', symbol: '△' },
]

export function HeroSection() {
  const prefersReduced = useReducedMotion()
  const { beat, bar } = useBpmClock(120)
  const { state, controls, readWaveform, ensureGraph } = useSynthEngine()
  const [vuLevel, setVuLevel] = useState(0)

  // Listen for the legacy r3:armed event to stay in sync if other code dispatches
  useEffect(() => {
    const onArm = () => {
      // ensure the audio graph is built when other code arms us
      ensureGraph()
    }
    window.addEventListener('r3:armed', onArm)
    return () => window.removeEventListener('r3:armed', onArm)
  }, [ensureGraph])

  // Cheap VU meter from waveform RMS
  useEffect(() => {
    if (prefersReduced) return
    let raf: number
    const tick = () => {
      const w = readWaveform()
      if (w && w.length) {
        let sum = 0
        for (let i = 0; i < w.length; i++) sum += w[i] * w[i]
        const rms = Math.sqrt(sum / w.length)
        setVuLevel((prev) => prev * 0.7 + rms * 0.3)
      } else {
        setVuLevel((prev) => prev * 0.92)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [prefersReduced, readWaveform])

  return (
    <section
      id="home"
      className="relative min-h-[100svh] w-full overflow-hidden px-3 pt-20 pb-10 sm:px-6 sm:pt-24 sm:pb-16 lg:px-10"
    >
      {/* Ambient oscilloscope behind everything (low opacity) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
        <SynthOscilloscope readWaveform={readWaveform} />
      </div>

      {/* Title bar */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="r3-panel mx-auto mb-3 flex max-w-7xl items-center justify-between gap-4 px-3 py-2 sm:px-4"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex shrink-0 gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--r3-clip)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--r3-filament)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--r3-signal)]" />
          </span>
          <span className="r3-mono truncate text-[11px] text-[var(--r3-text-mute)]">
            ah_synth_workstation_v4.0
          </span>
          <span className="hidden h-3 w-px bg-[var(--r3-edge)] sm:inline-block" />
          <span className="r3-mono hidden text-[10px] text-[var(--r3-text-mute)] sm:inline">
            preset · INIT · session 001
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="r3-mono text-[10px] tabular-nums text-[var(--r3-text-mute)]">
            {String(bar).padStart(3, '0')}.{beat}.0
          </span>
          <span className={cn('r3-led', state.ambient ? 'r3-pulse' : 'r3-led--off')} aria-hidden />
        </div>
      </m.div>

      {/* Grid: LCD + intro panel ··· then controls below */}
      <div className="relative z-[2] mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* LCD display */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <SynthDisplay
            preset="INIT.001"
            title="Frontend developer who builds and ships."
            tagline="Six years writing interfaces. One session, end to end — from boot screen to bounced render."
            oscillator={state.oscillator}
            cutoff={state.cutoff}
            resonance={state.resonance}
            bpm={120}
            ambient={state.ambient}
          />
        </m.div>

        {/* Identity / meta side panel */}
        <m.aside
          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="r3-panel grid grid-cols-2 gap-3 p-4 sm:p-5"
        >
          <div>
            <div className="r3-label">status</div>
            <div className="r3-mono mt-1 text-xs text-[var(--r3-text)]">Open to work</div>
          </div>
          <div>
            <div className="r3-label">based</div>
            <div className="r3-mono mt-1 text-xs text-[var(--r3-text)]">Jakarta · GMT+7</div>
          </div>
          <div>
            <div className="r3-label">stack</div>
            <div className="r3-mono mt-1 text-xs text-[var(--r3-text)]">React · Next · TS</div>
          </div>
          <div>
            <div className="r3-label">years</div>
            <div className="r3-mono mt-1 text-xs text-[var(--r3-text)]">6+</div>
          </div>

          {/* VU mini-meter — visual proof of audio context */}
          <div className="col-span-2 mt-1">
            <div className="r3-label mb-1.5">output</div>
            <div className="flex h-2 overflow-hidden rounded-sm border border-[var(--r3-edge)] bg-[var(--r3-rack)]">
              {Array.from({ length: 14 }).map((_, i) => {
                const lit = vuLevel * 28 > i
                return (
                  <span
                    key={i}
                    className="h-full flex-1"
                    style={{
                      background:
                        i < 9
                          ? lit
                            ? 'var(--r3-signal)'
                            : 'transparent'
                          : i < 12
                            ? lit
                              ? 'var(--r3-filament)'
                              : 'transparent'
                            : lit
                              ? 'var(--r3-clip)'
                              : 'transparent',
                      boxShadow: lit ? '0 0 6px currentColor' : 'none',
                      opacity: lit ? 1 : 0.18,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </m.aside>
      </div>

      {/* Control rack: knobs + wave switch + transport */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.24 }}
        className="r3-panel-rack relative z-[2] mx-auto mt-3 max-w-7xl p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          {/* Knobs */}
          <div className="flex items-end gap-4 sm:gap-5">
            <SynthKnob
              label="CUTOFF"
              value={state.cutoff}
              onChange={controls.setCutoff}
              accent="var(--r3-signal)"
              size="md"
            />
            <SynthKnob
              label="RES"
              value={state.resonance}
              onChange={controls.setResonance}
              accent="var(--r3-clip)"
              size="md"
            />
            <SynthKnob
              label="VOL"
              value={state.volume}
              onChange={controls.setVolume}
              accent="var(--r3-filament)"
              size="md"
            />
            <SynthKnob
              label="BEND"
              value={state.pitchBend}
              min={-12}
              max={12}
              onChange={controls.setPitchBend}
              format={(v) =>
                v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0)
              }
              accent="var(--r3-melody)"
              size="md"
            />
          </div>

          {/* Divider */}
          <span className="hidden h-14 w-px self-center bg-[var(--r3-edge)] sm:block" />

          {/* Oscillator selector */}
          <div className="flex flex-col gap-1.5">
            <span className="r3-label">OSC TYPE</span>
            <div className="flex gap-1">
              {OSC_TYPES.map((osc) => {
                const active = state.oscillator === osc.value
                return (
                  <button
                    key={osc.value}
                    type="button"
                    onClick={() => controls.setOscillator(osc.value)}
                    className={cn(
                      'r3-mono flex h-8 min-w-[44px] items-center justify-center gap-1 rounded-sm border px-2 text-[10px] font-bold tracking-widest transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--r3-signal)]/60',
                      active
                        ? 'border-[var(--r3-signal)] bg-[var(--r3-signal)]/15 text-[var(--r3-signal)]'
                        : 'border-[var(--r3-edge)] bg-[var(--r3-console)] text-[var(--r3-text-mute)] hover:border-[var(--r3-text-mute)] hover:text-[var(--r3-text)]',
                    )}
                    style={{
                      boxShadow: active
                        ? '0 0 10px rgba(57,255,110,0.25)'
                        : undefined,
                    }}
                    aria-pressed={active}
                  >
                    <span className="text-sm leading-none">{osc.symbol}</span>
                    <span>{osc.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <span className="hidden h-14 w-px self-center bg-[var(--r3-edge)] sm:block" />

          {/* Transport */}
          <div className="ml-auto flex items-end gap-3">
            <button
              type="button"
              onClick={() => controls.toggleAmbient()}
              aria-pressed={state.ambient}
              className={cn(
                'group inline-flex items-center gap-2 rounded-sm border px-4 py-3 r3-mono text-xs font-semibold tracking-widest transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--r3-signal)]/60',
                state.ambient
                  ? 'border-[var(--r3-signal)] bg-[var(--r3-signal)]/15 text-[var(--r3-signal)]'
                  : 'border-[var(--r3-edge)] bg-[var(--r3-console)] text-[var(--r3-text)] hover:border-[var(--r3-signal)]/60 hover:text-[var(--r3-signal)]',
              )}
            >
              {state.ambient ? (
                <Pause className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} aria-hidden />
              )}
              <span>{state.ambient ? 'STOP' : 'PLAY SESSION'}</span>
            </button>
          </div>
        </div>
      </m.div>

      {/* Pads */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.32 }}
        className="r3-panel relative z-[2] mx-auto mt-3 max-w-7xl p-4 sm:p-5"
      >
        <div className="mb-2.5 flex items-center justify-between">
          <span className="r3-label">PADS · click or press 1–8</span>
          <span className="r3-mono text-[10px] text-[var(--r3-text-mute)]">
            {state.armed ? '● armed' : '○ tap to arm audio'}
          </span>
        </div>
        <SynthPad
          onTrigger={(pad) => {
            controls.triggerNote(pad.note, 0.45)
          }}
        />
      </m.div>

      {/* Scroll hint */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative z-[2] mx-auto mt-6 flex max-w-7xl items-center gap-3"
      >
        <span className="h-px flex-1 bg-[var(--r3-edge)]" />
        <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
          ▼ scroll to play the session
        </span>
        <span className="h-px flex-1 bg-[var(--r3-edge)]" />
      </m.div>
    </section>
  )
}
