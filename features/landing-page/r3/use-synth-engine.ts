'use client'

/**
 * Ravemped 4.0 — Synth Engine
 *
 * Single shared Tone.js engine for the Hero synthesizer workstation.
 * - Lazy-loads Tone (only when user first interacts)
 * - One PolySynth → Filter → Volume → Analyzer → Destination
 * - Exposes imperative controls (setCutoff, setResonance, setVolume, setOscillator)
 * - Exposes a Float32Array waveform buffer for the oscilloscope canvas
 *
 * Audio context only starts on first user gesture (Tone.start()) — required
 * by browser autoplay policy. The hook returns `armed` to reflect this.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

type ToneNs = typeof import('tone')

let _tone: ToneNs | null = null
async function loadTone(): Promise<ToneNs> {
  if (!_tone) _tone = await import('tone')
  return _tone
}

export type OscillatorType = 'sawtooth' | 'square' | 'sine' | 'triangle'

export interface SynthControls {
  /** 0..1 normalised cutoff (mapped to ~80Hz–8000Hz logarithmic) */
  setCutoff: (v: number) => void
  /** 0..1 normalised resonance (Q) */
  setResonance: (v: number) => void
  /** 0..1 normalised master volume */
  setVolume: (v: number) => void
  /** -12..12 semitones */
  setPitchBend: (semitones: number) => void
  setOscillator: (t: OscillatorType) => void
  /** Trigger a single note (e.g. 'C4') */
  triggerNote: (note: string, durationSec?: number) => Promise<void>
  /** Toggle the ambient drone */
  toggleAmbient: () => Promise<void>
}

export interface SynthState {
  armed: boolean
  ambient: boolean
  oscillator: OscillatorType
  cutoff: number
  resonance: number
  volume: number
  pitchBend: number
}

const INITIAL_STATE: SynthState = {
  armed: false,
  ambient: false,
  oscillator: 'sawtooth',
  cutoff: 0.55,
  resonance: 0.25,
  volume: 0.55,
  pitchBend: 0,
}

/** Map normalised 0..1 → 80Hz..8000Hz log scale (musical filter feel). */
function cutoffToHz(v: number): number {
  const min = Math.log(80)
  const max = Math.log(8000)
  return Math.exp(min + (max - min) * Math.max(0, Math.min(1, v)))
}

/** Map normalised 0..1 → -40dB..0dB. */
function volumeToDb(v: number): number {
  return -40 + 40 * Math.max(0, Math.min(1, v))
}

export function useSynthEngine() {
  const [state, setState] = useState<SynthState>(INITIAL_STATE)
  const stateRef = useRef(state)
  stateRef.current = state

  // Tone.js node refs — created on first arm
  const synthRef = useRef<InstanceType<ToneNs['PolySynth']> | null>(null)
  const filterRef = useRef<InstanceType<ToneNs['Filter']> | null>(null)
  const volumeRef = useRef<InstanceType<ToneNs['Volume']> | null>(null)
  const analyserRef = useRef<InstanceType<ToneNs['Waveform']> | null>(null)
  const droneRef = useRef<InstanceType<ToneNs['MonoSynth']> | null>(null)

  /** Lazily build the audio graph. Idempotent. */
  const ensureGraph = useCallback(async () => {
    const Tone = await loadTone()
    if (!synthRef.current) {
      // Audio context start (must be in a user gesture)
      if (Tone.getContext().state !== 'running') {
        await Tone.start()
      }

      const volume = new Tone.Volume(volumeToDb(stateRef.current.volume))
      const filter = new Tone.Filter({
        type: 'lowpass',
        frequency: cutoffToHz(stateRef.current.cutoff),
        Q: 1 + stateRef.current.resonance * 14,
      })
      const analyser = new Tone.Waveform(256)

      // PolySynth wired through filter → volume → destination + analyser tap
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: stateRef.current.oscillator },
        envelope: { attack: 0.02, decay: 0.18, sustain: 0.6, release: 0.6 },
      })

      synth.chain(filter, volume, Tone.getDestination())
      volume.connect(analyser)

      synthRef.current = synth
      filterRef.current = filter
      volumeRef.current = volume
      analyserRef.current = analyser

      // Ambient drone — separate softer mono synth, off by default
      const drone = new Tone.MonoSynth({
        oscillator: { type: 'sine' },
        envelope: { attack: 1.2, decay: 0.3, sustain: 0.7, release: 1.5 },
        filter: { Q: 0.5, type: 'lowpass' },
        filterEnvelope: { attack: 0.6, decay: 0.4, sustain: 0.5, release: 1.5, baseFrequency: 200, octaves: 2 },
      })
      drone.volume.value = -22
      drone.chain(filter, volume, Tone.getDestination())
      droneRef.current = drone

      setState((s) => ({ ...s, armed: true }))
    }
    return Tone
  }, [])

  // ─── Imperative controls ─────────────────────────────────
  const setCutoff = useCallback((v: number) => {
    setState((s) => ({ ...s, cutoff: v }))
    if (filterRef.current) {
      filterRef.current.frequency.rampTo(cutoffToHz(v), 0.05)
    }
  }, [])

  const setResonance = useCallback((v: number) => {
    setState((s) => ({ ...s, resonance: v }))
    if (filterRef.current) {
      filterRef.current.Q.rampTo(1 + v * 14, 0.05)
    }
  }, [])

  const setVolume = useCallback((v: number) => {
    setState((s) => ({ ...s, volume: v }))
    if (volumeRef.current) {
      volumeRef.current.volume.rampTo(volumeToDb(v), 0.05)
    }
  }, [])

  const setPitchBend = useCallback((semitones: number) => {
    setState((s) => ({ ...s, pitchBend: semitones }))
    if (synthRef.current) {
      // PolySynth doesn't have a single detune — but we can set per-voice
      // via .set; in semitones the Tone way is detune (cents)
      synthRef.current.set({ detune: semitones * 100 })
    }
    if (droneRef.current) {
      droneRef.current.detune.rampTo(semitones * 100, 0.05)
    }
  }, [])

  const setOscillator = useCallback((t: OscillatorType) => {
    setState((s) => ({ ...s, oscillator: t }))
    if (synthRef.current) {
      synthRef.current.set({ oscillator: { type: t } })
    }
  }, [])

  const triggerNote = useCallback(
    async (note: string, durationSec = 0.4) => {
      await ensureGraph()
      synthRef.current?.triggerAttackRelease(note, durationSec)
    },
    [ensureGraph],
  )

  const toggleAmbient = useCallback(async () => {
    await ensureGraph()
    const drone = droneRef.current
    if (!drone) return
    if (stateRef.current.ambient) {
      drone.triggerRelease()
      setState((s) => ({ ...s, ambient: false }))
      // Broadcast disarm so other sections (mixer header etc) can react
      window.dispatchEvent(new CustomEvent('r3:disarmed'))
    } else {
      drone.triggerAttack('C2')
      setState((s) => ({ ...s, ambient: true }))
      window.dispatchEvent(new CustomEvent('r3:armed'))
    }
  }, [ensureGraph])

  /** Read current waveform samples — call from a rAF loop in the canvas. */
  const readWaveform = useCallback((): Float32Array | null => {
    return analyserRef.current ? (analyserRef.current.getValue() as Float32Array) : null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        droneRef.current?.dispose()
        synthRef.current?.dispose()
        filterRef.current?.dispose()
        volumeRef.current?.dispose()
        analyserRef.current?.dispose()
      } catch {
        /* no-op */
      }
    }
  }, [])

  const controls: SynthControls = {
    setCutoff,
    setResonance,
    setVolume,
    setPitchBend,
    setOscillator,
    triggerNote,
    toggleAmbient,
  }

  return { state, controls, readWaveform, ensureGraph }
}
