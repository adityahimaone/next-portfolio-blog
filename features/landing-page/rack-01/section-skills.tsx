'use client'

import { useEffect, useRef, useState } from 'react'
import { Knob, SegmentCounter, SilkscreenLabel } from './primitives'
import styles from './rack-01.module.css'
import { SectionHeading } from './section-heading'
import { Screw } from '@/components/ui/screw'
import { EMAIL, EXPERIENCES, MIXER_DATA } from '../constants'

/** Note frequency map for the 36 chromatic piano keys, C3 to B5. */
const KEYBOARD_SHORTCUTS: Record<
  string,
  { type: 'pad' | 'key'; index: number }
> = {
  '1': { type: 'pad', index: 0 },
  '2': { type: 'pad', index: 1 },
  '3': { type: 'pad', index: 2 },
  '4': { type: 'pad', index: 3 },
  '5': { type: 'pad', index: 4 },
  '6': { type: 'pad', index: 5 },
  // White keys on the home row, C3 upward.
  a: { type: 'key', index: 0 },
  s: { type: 'key', index: 1 },
  d: { type: 'key', index: 2 },
  f: { type: 'key', index: 3 },
  g: { type: 'key', index: 4 },
  h: { type: 'key', index: 5 },
  j: { type: 'key', index: 6 },
  k: { type: 'key', index: 7 },
  l: { type: 'key', index: 8 },
  ';': { type: 'key', index: 9 },
  "'": { type: 'key', index: 10 },
  // Black keys on the row above, in the gaps between them.
  w: { type: 'key', index: 21 },
  e: { type: 'key', index: 22 },
  t: { type: 'key', index: 24 },
  y: { type: 'key', index: 25 },
  u: { type: 'key', index: 26 },
  o: { type: 'key', index: 27 },
  p: { type: 'key', index: 28 },
  '[': { type: 'key', index: 30 },
  ']': { type: 'key', index: 31 },
}

const SKILLS = MIXER_DATA.flatMap((group) => group.channels)

/* Three octaves, C3 to B5.

   This started at two octaves. Fourteen white keys across a 1169px keybed is
   83px of width per key against 112px of length — nearly square, and a square
   key is not a piano key. Keys are long and narrow in proportion (roughly 1:6
   on a real full-size board), so widening the range is what lets each key stay
   narrow enough to read as a key at this width. Adding an octave bought the
   proportion; it was not for extra range on its own.

   The count is used to position the black keys and to bound the keyboard
   shortcuts, so it is stated once here rather than repeated as a literal 14 or
   24 in three places — those are what silently drift apart when the range
   changes. */
const WHITE_KEY_NOTES = [
  { note: 'C3', freq: 130.81 },
  { note: 'D3', freq: 146.83 },
  { note: 'E3', freq: 164.81 },
  { note: 'F3', freq: 174.61 },
  { note: 'G3', freq: 196.0 },
  { note: 'A3', freq: 220.0 },
  { note: 'B3', freq: 246.94 },
  { note: 'C4', freq: 261.63 },
  { note: 'D4', freq: 293.66 },
  { note: 'E4', freq: 329.63 },
  { note: 'F4', freq: 349.23 },
  { note: 'G4', freq: 392.0 },
  { note: 'A4', freq: 440.0 },
  { note: 'B4', freq: 493.88 },
  { note: 'C5', freq: 523.25 },
  { note: 'D5', freq: 587.33 },
  { note: 'E5', freq: 659.25 },
  { note: 'F5', freq: 698.46 },
  { note: 'G5', freq: 783.99 },
  { note: 'A5', freq: 880.0 },
  { note: 'B5', freq: 987.77 },
]

/** How many white keys are drawn. Every layout figure keys off this. */
const WHITE_KEY_COUNT = WHITE_KEY_NOTES.length

const BLACK_KEY_NOTES = [
  { note: 'C#3', freq: 138.59, whiteIndex: 0 },
  { note: 'D#3', freq: 155.56, whiteIndex: 1 },
  { note: 'F#3', freq: 185.0, whiteIndex: 3 },
  { note: 'G#3', freq: 207.65, whiteIndex: 4 },
  { note: 'A#3', freq: 233.08, whiteIndex: 5 },
  { note: 'C#4', freq: 277.18, whiteIndex: 7 },
  { note: 'D#4', freq: 311.13, whiteIndex: 8 },
  { note: 'F#4', freq: 369.99, whiteIndex: 10 },
  { note: 'G#4', freq: 415.3, whiteIndex: 11 },
  { note: 'A#4', freq: 466.16, whiteIndex: 12 },
  { note: 'C#5', freq: 554.37, whiteIndex: 14 },
  { note: 'D#5', freq: 622.25, whiteIndex: 15 },
  { note: 'F#5', freq: 739.99, whiteIndex: 17 },
  { note: 'G#5', freq: 830.61, whiteIndex: 18 },
  { note: 'A#5', freq: 932.33, whiteIndex: 19 },
]

/* Shortcut indices count through the CHROMATIC scale, which is every key in
   playing order — whites and blacks interleaved, exactly as they sit on the
   board. So a shortcut has to be an index into that, not into a white-key
   list: index 21 is C#4, and mapping it against `WHITE_KEY_NOTES` would have
   played C4-sharp a whole tone off.

   Black keys are addressed by the chromatic index of the white key they sit
   *after*, which is why the ranges below are 21..31 and not contiguous: a
   black key occupies every index whose white key is not B or E, and E-F have
   none. */
const BLACK_KEY_CHROMATIC_OFFSET = WHITE_KEY_COUNT

const PAD_SOUND_TYPES = [
  { type: 'kick', baseFreq: 160, dropFreq: 42, decay: 0.28 }, // HTML (808 Kick)
  { type: 'snare', baseFreq: 240, dropFreq: 110, decay: 0.22 }, // CSS (Snare)
  { type: 'tom', baseFreq: 320, dropFreq: 90, decay: 0.25 }, // JS (Synth Tom)
  { type: 'rim', baseFreq: 880, dropFreq: 440, decay: 0.16 }, // TS (FM Rimshot)
  { type: 'sub', baseFreq: 65, dropFreq: 38, decay: 0.35 }, // GO (Sub Drop)
  { type: 'hat', baseFreq: 1200, dropFreq: 600, decay: 0.12 }, // SQL (Metallic Hat)
]

export function Skills() {
  const [activeSkill, setActiveSkill] = useState(SKILLS[0])
  const [levels, setLevels] = useState<Record<string, number>>(() =>
    Object.fromEntries(SKILLS.map((skill) => [skill.name, skill.level])),
  )
  const [activeKey, setActiveKey] = useState<number | null>(null)
  const [hitPadIndex, setHitPadIndex] = useState<number | null>(null)
  const [pitch, setPitch] = useState(0)
  const [mod, setMod] = useState(25)
  const [isOn, setIsOn] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isArpPlaying, setIsArpPlaying] = useState(false)
  const [displayMode, setDisplayMode] = useState<'WAVE' | 'SPECTRUM' | 'TEL'>(
    'WAVE',
  )
  const [activeFrequency, setActiveFrequency] = useState<number>(440)
  const [vuLevel, setVuLevel] = useState<number>(3)
  const [skillSequenceProgress, setSkillSequenceProgress] = useState(1)

  const pitchDragRef = useRef(false)
  const modDragRef = useRef(false)
  const pitchOriginY = useRef(0)
  const modOriginY = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const waveEnergyRef = useRef(0)
  const arpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const scrollRatioRef = useRef(0)

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx()
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  // Play Drum Pad Hit
  const playPadSound = (skillName: string, padIndex: number) => {
    if (!isOn || isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    const sound = PAD_SOUND_TYPES[padIndex % PAD_SOUND_TYPES.length]
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = padIndex === 1 ? 'sawtooth' : 'sine'
    const now = ctx.currentTime

    osc.frequency.setValueAtTime(sound.baseFreq, now)
    osc.frequency.exponentialRampToValueAtTime(
      sound.dropFreq,
      now + sound.decay,
    )

    gain.gain.setValueAtTime(0.32, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + sound.decay)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + sound.decay)

    waveEnergyRef.current = 1.0
    setActiveFrequency(Math.round(sound.baseFreq))
    setVuLevel(Math.min(8, 5 + Math.floor(Math.random() * 4)))
    setHitPadIndex(padIndex)
    setTimeout(() => setHitPadIndex(null), 180)
  }

  // Play Chromatic Synth Note
  const playKeySound = (
    noteName: string,
    baseFreq: number,
    keyIndex: number,
  ) => {
    if (!isOn || isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    const pitchFactor = Math.pow(2, pitch / 60)
    const effectiveFreq = baseFreq * pitchFactor

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()

    const now = ctx.currentTime

    // Modulation Vibrato LFO
    const modDepth = (mod / 100) * 8
    lfo.frequency.setValueAtTime(6.5, now)
    lfoGain.gain.setValueAtTime(modDepth, now)
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)

    osc.type = keyIndex >= 14 ? 'sawtooth' : 'triangle'
    osc.frequency.setValueAtTime(effectiveFreq, now)

    // ADSR Pluck envelope
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.24, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

    lfo.start(now)
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.6)
    lfo.stop(now + 0.6)

    waveEnergyRef.current = 1.0
    setActiveFrequency(Math.round(effectiveFreq))
    setVuLevel(Math.min(8, 4 + Math.floor(Math.random() * 5)))
    setActiveKey(keyIndex)
    setTimeout(() => setActiveKey(null), 250)
  }

  const handlePadClick = (
    skill: { name: string; level: number },
    index: number,
  ) => {
    setActiveSkill(skill)
    playPadSound(skill.name, index)
  }

  const handleKeyClick = (note: string, freq: number, index: number) => {
    playKeySound(note, freq, index)
  }

  const updateLevel = (name: string, value: number) => {
    setLevels((current) => ({ ...current, [name]: value }))
    const skill = SKILLS.find((item) => item.name === name)
    if (skill) setActiveSkill({ ...skill, level: value })
  }

  // Pitch & Mod Wheel handlers
  const handlePitchDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pitchDragRef.current = true
    pitchOriginY.current = e.clientY
  }
  const handlePitchMove = (e: React.PointerEvent) => {
    if (!pitchDragRef.current) return
    const delta = pitchOriginY.current - e.clientY
    const clamped = Math.max(-50, Math.min(50, Math.round(delta * 1.4)))
    setPitch(clamped)
  }
  const handlePitchUp = () => {
    pitchDragRef.current = false
    setPitch(0)
  }

  const handleModDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    modDragRef.current = true
    modOriginY.current = e.clientY
  }
  const handleModMove = (e: React.PointerEvent) => {
    if (!modDragRef.current) return
    const delta = (modOriginY.current - e.clientY) * 1.1
    setMod((prev) => Math.max(0, Math.min(100, Math.round(prev + delta))))
    modOriginY.current = e.clientY
  }
  const handleModUp = () => {
    modDragRef.current = false
  }

  // Arpeggiator / Auto Demo Loop
  const toggleArp = () => {
    if (isArpPlaying) {
      if (arpTimerRef.current) clearInterval(arpTimerRef.current)
      setIsArpPlaying(false)
      return
    }

    setIsArpPlaying(true)
    let step = 0
    const sequencePads = [0, 2, 3, 1, 4, 3, 5, 2]
    const sequenceKeys = [0, 4, 7, 11, 7, 4, 2, 9]

    arpTimerRef.current = setInterval(() => {
      const padIdx = sequencePads[step % sequencePads.length]
      const keyIdx = sequenceKeys[step % sequenceKeys.length]
      const skill = MIXER_DATA[0].channels[padIdx]
      const keyObj = WHITE_KEY_NOTES[keyIdx]

      if (skill) {
        setActiveSkill(skill)
        playPadSound(skill.name, padIdx)
      }
      if (keyObj && step % 2 === 0) {
        playKeySound(keyObj.note, keyObj.freq, keyIdx)
      }

      step++
    }, 240)
  }

  useEffect(() => {
    return () => {
      if (arpTimerRef.current) clearInterval(arpTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const handleSequence = (event: Event) => {
      const progress = (event as CustomEvent<number>).detail
      if (progress < 0) {
        setSkillSequenceProgress(0)
        setDisplayMode('WAVE')
        return
      }
      setSkillSequenceProgress(progress)
      setDisplayMode(
        progress < 0.4 ? 'WAVE' : progress < 0.68 ? 'SPECTRUM' : 'TEL',
      )
    }
    section.addEventListener('skills-sequence', handleSequence)
    return () => section.removeEventListener('skills-sequence', handleSequence)
  }, [])

  // Physical Computer Keyboard Bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return
      const key = e.key.toLowerCase()
      const mapping = KEYBOARD_SHORTCUTS[key]
      if (mapping) {
        e.preventDefault()
        if (mapping.type === 'pad') {
          const skill = MIXER_DATA[0].channels[mapping.index]
          if (skill) handlePadClick(skill, mapping.index)
        } else if (mapping.type === 'key') {
          /* One chromatic scale, resolved through a single lookup rather than
             a white/black split at a hardcoded 14. The index below 14 is a
             white key and above it a black one, so the previous
             `index < 14 ? WHITE_KEY_NOTES[index] : BLACK_KEY_NOTES[index - 14]`
             was only ever correct while the range was exactly two octaves —
             and it would have silently read the wrong note the moment the
             range changed, with no type to catch it. */
          const note =
            mapping.index < BLACK_KEY_CHROMATIC_OFFSET
              ? WHITE_KEY_NOTES[mapping.index]
              : BLACK_KEY_NOTES[mapping.index - BLACK_KEY_CHROMATIC_OFFSET - 1]
          if (note) {
            handleKeyClick(note.note, note.freq, mapping.index)
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOn, isMuted, pitch, mod])

  // Track section scroll ratio for oscilloscope frequency modulation
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const total = rect.height + windowHeight
      const current = windowHeight - rect.top
      const progress = Math.max(0, Math.min(1, current / total))
      scrollRatioRef.current = progress
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth VU meter decay
  useEffect(() => {
    const interval = setInterval(() => {
      setVuLevel((prev) => (prev > 1 ? prev - 1 : 1))
    }, 180)
    return () => clearInterval(interval)
  }, [])

  // Oscilloscope & Spectrum Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // The backing store is sized to the device pixel ratio. At 1x the CSS
    // width already matches, but on a 2x or 3x phone a 260px store stretched
    // into the same 260px of layout is a permanent blur — the phosphor grid and
    // the readouts are the only moving thing in the whole section, so it has to
    // be sharp. The element's layout size never changes; only the store does.
    let dpr = 1
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const next = Math.min(window.devicePixelRatio || 1, 3)
      const w = Math.max(1, Math.round((rect.width || 260) * next))
      const h = Math.max(1, Math.round((rect.height || 52) * next))
      if (canvas.width === w && canvas.height === h) return
      dpr = next
      canvas.width = w
      canvas.height = h
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    let animId: number
    let phase = 0
    let observer: ResizeObserver | undefined

    const render = () => {
      // Drawing happens in CSS pixels — the context transform above carries the
      // device pixel ratio — so the geometry below is the same numbers it was
      // before the store grew, just on a denser grid.
      const width = canvas.width / dpr
      const height = canvas.height / dpr
      ctx.clearRect(0, 0, width, height)

      // CRT phosphor grid
      ctx.strokeStyle = 'rgba(92, 214, 163, 0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x < width; x += 20) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = 0; y < height; y += 14) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      // Center baseline
      ctx.strokeStyle = 'rgba(92, 214, 163, 0.22)'
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      const energy = waveEnergyRef.current
      waveEnergyRef.current = Math.max(0, energy * 0.93)
      const scrollMod = scrollRatioRef.current

      if (displayMode === 'WAVE') {
        // Glowing CRT oscilloscope waveform
        ctx.strokeStyle = '#5cd6a3'
        ctx.shadowColor = '#5cd6a3'
        ctx.shadowBlur = isOn ? 8 : 0
        ctx.lineWidth = 1.8

        ctx.beginPath()
        for (let x = 0; x < width; x++) {
          const normX = x / width
          const baseWave =
            Math.sin(normX * (8 + scrollMod * 8) + phase) * (6 + scrollMod * 5)
          const spikeWave =
            Math.sin(normX * 24 + phase * 2.5) *
            Math.cos(normX * 12) *
            energy *
            (height * 0.42)
          const noise = (Math.random() - 0.5) * (energy * 4 + 1.2)
          const y = height / 2 + (isOn ? baseWave + spikeWave + noise : 0)

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0
      } else if (displayMode === 'SPECTRUM') {
        // 16-band Spectrum Analyzer
        const numBars = 16
        const barWidth = width / numBars - 3
        ctx.fillStyle = '#5cd6a3'
        ctx.shadowColor = '#5cd6a3'
        ctx.shadowBlur = isOn ? 6 : 0

        for (let i = 0; i < numBars; i++) {
          const barEnergy =
            Math.sin(i * 0.6 + phase) * 0.4 +
            0.5 +
            energy * (0.6 + Math.sin(i * 1.2) * 0.4)
          const barHeight = isOn ? Math.max(4, barEnergy * (height * 0.78)) : 2
          const x = i * (barWidth + 3) + 2
          const y = height - barHeight - 2

          ctx.fillRect(x, y, barWidth, barHeight)
        }
        ctx.shadowBlur = 0
      } else {
        // Digital Matrix Telemetry
        ctx.fillStyle = '#5cd6a3'
        ctx.font = '8px var(--font-geist-mono), monospace'
        const hex = (Math.floor(phase * 100) % 0xffff)
          .toString(16)
          .toUpperCase()
          .padStart(4, '0')
        ctx.fillText(`SIG: 0x${hex} // LOCKED`, 8, 18)
        ctx.fillText(`FREQ: ${activeFrequency} Hz // 48kHz`, 8, 32)
        ctx.fillText(
          `VEL: ${levels[activeSkill.name] ?? 90}% · PB: ${pitch > 0 ? '+' : ''}${pitch}`,
          8,
          46,
        )
      }

      phase += 0.08 + scrollMod * 0.06
      animId = requestAnimationFrame(render)
    }

    render()

    // The wrapper is a clamp()ed width, so a rotate or a resize can change it
    // after mount. Re-deriving the store keeps the scope sharp on the same
    // terms as the layout.
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => resize())
      observer.observe(canvas)
    }

    return () => {
      cancelAnimationFrame(animId)
      observer?.disconnect()
    }
  }, [isOn, displayMode, activeFrequency, activeSkill.name, levels, pitch])

  return (
    <section
      ref={sectionRef}
      id="skills"
      className={`${styles.section} ${styles.skills}`}
      data-rack-section
    >
      <div className={styles.skillsStage}>
        <div className={styles.skillsBackdrop} aria-hidden="true">
          SKILLS
        </div>
        <div className={styles.skillsIntro}>
          <SectionHeading index="03" eyebrow="Toolkit">
            The tools behind shipped product work.
          </SectionHeading>
          <p>
            A practical stack for building interfaces, connecting data, and
            getting products into the hands of users.
          </p>
        </div>
        <div className={styles.controller}>
          <Screw className={styles.screwTopLeft} />
          <Screw className={styles.screwTopRight} />
          <Screw className={styles.screwBottomLeft} />
          <Screw className={styles.screwBottomRight} />

          {/* TOPBAR: Branding, Interactive Screen, Actions */}
          <div className={styles.controllerTopbar}>
            <div className={styles.controllerBrand}>
              <strong>AH / STACK CONTROL</strong>
              <SilkscreenLabel>FRONTEND / APP / INFRA</SilkscreenLabel>
            </div>

            {/* CRT Oscilloscope Screen */}
            <div className={styles.controllerDisplay} aria-live="polite">
              <div className={styles.displayHeader}>
                <span>STATUS: {isOn ? 'LIVE STACK' : 'OFFLINE'}</span>
                <div className={styles.displayModeTags}>
                  {(['WAVE', 'SPECTRUM', 'TEL'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      data-skill-sequence="display"
                      className={`${styles.modeTag} ${
                        displayMode === mode ? styles.modeTagActive : ''
                      }`}
                      onClick={() => setDisplayMode(mode)}
                      aria-label={`Switch display to ${mode}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.displayBody}>
                <div className={styles.screenCanvasWrapper}>
                  <canvas
                    ref={canvasRef}
                    width={260}
                    height={52}
                    className={styles.screenCanvas}
                  />
                  <div className={styles.canvasScanline} aria-hidden="true" />
                </div>

                <div className={styles.programReadout}>
                  <span>ACTIVE PROGRAM</span>
                  <strong>{activeSkill.name}</strong>
                </div>
              </div>

              <div className={styles.displayTelemetry}>
                <div className={styles.meterStack}>
                  <div className={styles.vuBars} aria-hidden="true">
                    {Array.from({ length: 8 }, (_, i) => {
                      const isLit = i < vuLevel
                      const colorClass =
                        i >= 6
                          ? styles.vuLitRed
                          : i >= 4
                            ? styles.vuLitOrange
                            : styles.vuLitGreen
                      return (
                        <i key={i} className={isLit ? colorClass : undefined} />
                      )
                    })}
                  </div>
                  <div className={styles.telemetryStats}>
                    <span>
                      FREQ: <b>{activeFrequency}Hz</b>
                    </span>
                    <br />
                    <span>
                      PB: <b>{pitch > 0 ? `+${pitch}` : pitch}</b>
                    </span>
                  </div>
                </div>

                <SegmentCounter
                  value={`${String(levels[activeSkill.name] ?? activeSkill.level).padStart(3, '0')}%`}
                />
              </div>
            </div>

            {/* Controller Controls: Arpeggiator & Power Toggle */}
            <div className={styles.controllerActions}>
              <button
                type="button"
                className={`${styles.arpButton} ${
                  isArpPlaying ? styles.arpActive : ''
                }`}
                onClick={toggleArp}
                aria-pressed={isArpPlaying}
                aria-label="Toggle Arpeggiator demo jam"
              >
                <i />
                <span>{isArpPlaying ? 'STOP ARP' : 'ARP / DEMO'}</span>
              </button>

              <button
                type="button"
                className={`${styles.powerToggle} ${!isOn ? styles.powerOff : ''}`}
                onClick={() => setIsOn((prev) => !prev)}
                aria-label={isOn ? 'Power Off' : 'Power On'}
              >
                <i /> {isOn ? 'PWR ON' : 'PWR OFF'}
              </button>
            </div>
          </div>

          {/* BANKS: Drum Pads, Knobs, Faders */}
          <div className={styles.controllerBanks}>
            <div className={`${styles.controlBank} ${styles.padBank}`}>
              <SilkscreenLabel>
                PAD BANK A / FRONTEND (KEYS 1-6)
              </SilkscreenLabel>
              <div>
                {MIXER_DATA[0].channels.map((skill, index) => (
                  <button
                    type="button"
                    key={skill.name}
                    data-skill-sequence="pad"
                    aria-pressed={activeSkill.name === skill.name}
                    onClick={() => handlePadClick(skill, index)}
                    className={`${
                      activeSkill.name === skill.name ? styles.padActive : ''
                    } ${hitPadIndex === index ? styles.padHit : ''}`}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.padShortcutHint}>{index + 1}</span>
                    <strong>{skill.name}</strong>
                    <i
                      style={
                        {
                          '--level': `${levels[skill.name]}%`,
                        } as React.CSSProperties
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className={`${styles.controlBank} ${styles.encoderBank}`}>
              <SilkscreenLabel>PARAM BANK B / APP + DATA</SilkscreenLabel>
              <div>
                {MIXER_DATA[1].channels.map((skill) => (
                  <Knob
                    key={skill.name}
                    label={skill.name}
                    value={Math.round(
                      levels[skill.name] *
                        Math.max(
                          0,
                          Math.min(1, (skillSequenceProgress - 0.18) / 0.22),
                        ),
                    )}
                    onChange={(value) => updateLevel(skill.name, value)}
                  />
                ))}
              </div>
            </div>

            <div className={`${styles.controlBank} ${styles.faderBank}`}>
              <SilkscreenLabel>FADERS C / DELIVERY + INFRA</SilkscreenLabel>
              <div>
                {MIXER_DATA[2].channels.map((skill) => (
                  <label key={skill.name}>
                    <output>{levels[skill.name]}</output>
                    <input
                      type="range"
                      data-skill-sequence="fader"
                      min="0"
                      max="100"
                      value={Math.round(
                        levels[skill.name] *
                          Math.max(
                            0,
                            Math.min(1, (skillSequenceProgress - 0.4) / 0.22),
                          ),
                      )}
                      onChange={(event) =>
                        updateLevel(skill.name, Number(event.target.value))
                      }
                      aria-label={`${skill.name} level`}
                    />
                    <span>{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* KEYBOARD BED: Pitch & Mod Wheels + 24 Playable Piano Keys */}
          <div
            className={styles.keyboardBed}
            aria-label="Playable skill keyboard (Keys A-L)"
          >
            <div className={styles.pitchControls}>
              <div className={styles.wheelGroup}>
                <span className={styles.wheelLabel}>PITCH</span>
                <div
                  className={styles.wheelWell}
                  onPointerDown={handlePitchDown}
                  onPointerMove={handlePitchMove}
                  onPointerUp={handlePitchUp}
                  onPointerCancel={handlePitchUp}
                  aria-label="Pitch Bend Wheel"
                  role="slider"
                  aria-valuenow={pitch}
                >
                  <div
                    className={styles.wheelCylinder}
                    style={{ transform: `translateY(${-pitch * 0.4}px)` }}
                  >
                    <span className={styles.wheelCenterRidge} />
                  </div>
                  <div className={styles.wheelTensionIndicator}>
                    <span>+</span>
                    <span className={styles.wheelTickCenter}>0</span>
                    <span>-</span>
                  </div>
                </div>
              </div>
              <div className={styles.wheelGroup}>
                <span className={styles.wheelLabel}>MOD</span>
                <div
                  className={styles.wheelWell}
                  onPointerDown={handleModDown}
                  onPointerMove={handleModMove}
                  onPointerUp={handleModUp}
                  onPointerCancel={handleModUp}
                  aria-label="Modulation Wheel"
                  role="slider"
                  aria-valuenow={mod}
                >
                  <div
                    className={styles.wheelCylinder}
                    style={{ transform: `translateY(${-(mod - 25) * 0.35}px)` }}
                  >
                    <span className={styles.wheelModRidge} />
                  </div>
                  <div className={styles.wheelTensionIndicator}>
                    <span>MAX</span>
                    <span className={styles.wheelTickCenter}>-</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={styles.controllerKeys}
              /* The white-key count lives in the note table, but the grid
                 columns and the black keys' width are CSS, and CSS cannot read
                 a JS array's length. Stated here as the one place both read
                 it, so the two can never disagree — a hardcoded `14` in either
                 sheet silently produces a board whose black keys are out of
                 position the moment the range changes. */
              style={
                {
                  '--white-key-count': String(WHITE_KEY_COUNT),
                } as React.CSSProperties
              }
            >
              <div className={styles.whiteKeys}>
                {WHITE_KEY_NOTES.map((keyObj, index) => (
                  <button
                    type="button"
                    key={keyObj.note}
                    aria-label={`Play ${keyObj.note} key`}
                    aria-pressed={activeKey === index}
                    onPointerDown={() =>
                      handleKeyClick(keyObj.note, keyObj.freq, index)
                    }
                  />
                ))}
              </div>
              <div
                className={styles.blackKeys}
                aria-label="Sharp and flat keys"
              >
                {BLACK_KEY_NOTES.map((blackObj, index) => {
                  /* The chromatic index of this black key: one past the white
                     key it follows, plus one for every black key already
                     passed. Positioning and shortcut lookup both key off this
                     same number, so the shortcut for C#4 lights the C#4 key
                     rather than the nearest white one. */
                  const chromatic = BLACK_KEY_CHROMATIC_OFFSET + index + 1
                  /* Where it sits: on the boundary between two white keys, as
                     a real black key does — not over the centre of the one it
                     sharpens. Derived from the white-key count so the board
                     cannot drift when the range changes. */
                  const position =
                    ((blackObj.whiteIndex + 1) / WHITE_KEY_COUNT) * 100
                  return (
                    <button
                      type="button"
                      key={blackObj.note}
                      aria-label={`Play ${blackObj.note} key`}
                      aria-pressed={activeKey === chromatic}
                      style={
                        {
                          '--key-position': `${position}%`,
                        } as React.CSSProperties
                      }
                      onPointerDown={() =>
                        handleKeyClick(blackObj.note, blackObj.freq, chromatic)
                      }
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
