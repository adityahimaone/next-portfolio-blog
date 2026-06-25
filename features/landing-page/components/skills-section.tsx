'use client'

import React, { useState, useEffect, useRef } from 'react'
import { m as motion, AnimatePresence } from 'motion/react'
import { useInView } from 'motion/react'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'
import { Keyboard } from 'lucide-react'
import { MIXER_DATA } from '../constants'

// Note frequency map for 25 keys: C3 to C5
interface PianoKey {
  note: string
  freq: number
  isBlack: boolean
  leftOffset?: string
}

const PIANO_KEYS: PianoKey[] = [
  { note: 'C3', freq: 130.81, isBlack: false },
  { note: 'C#3', freq: 138.59, isBlack: true, leftOffset: 'calc((1 / 15) * 100% - 6px)' },
  { note: 'D3', freq: 146.83, isBlack: false },
  { note: 'D#3', freq: 155.56, isBlack: true, leftOffset: 'calc((2 / 15) * 100% - 6px)' },
  { note: 'E3', freq: 164.81, isBlack: false },
  { note: 'F3', freq: 174.61, isBlack: false },
  { note: 'F#3', freq: 185.00, isBlack: true, leftOffset: 'calc((4 / 15) * 100% - 6px)' },
  { note: 'G3', freq: 196.00, isBlack: false },
  { note: 'G#3', freq: 207.65, isBlack: true, leftOffset: 'calc((5 / 15) * 100% - 6px)' },
  { note: 'A3', freq: 220.00, isBlack: false },
  { note: 'A#3', freq: 233.08, isBlack: true, leftOffset: 'calc((6 / 15) * 100% - 6px)' },
  { note: 'B3', freq: 246.94, isBlack: false },
  { note: 'C4', freq: 261.63, isBlack: false },
  { note: 'C#4', freq: 277.18, isBlack: true, leftOffset: 'calc((8 / 15) * 100% - 6px)' },
  { note: 'D4', freq: 293.66, isBlack: false },
  { note: 'D#4', freq: 311.13, isBlack: true, leftOffset: 'calc((9 / 15) * 100% - 6px)' },
  { note: 'E4', freq: 329.63, isBlack: false },
  { note: 'F4', freq: 349.23, isBlack: false },
  { note: 'F#4', freq: 369.99, isBlack: true, leftOffset: 'calc((11 / 15) * 100% - 6px)' },
  { note: 'G4', freq: 392.00, isBlack: false },
  { note: 'G#4', freq: 415.30, isBlack: true, leftOffset: 'calc((12 / 15) * 100% - 6px)' },
  { note: 'A4', freq: 440.00, isBlack: false },
  { note: 'A#4', freq: 466.16, isBlack: true, leftOffset: 'calc((13 / 15) * 100% - 6px)' },
  { note: 'B4', freq: 493.88, isBlack: false },
  { note: 'C5', freq: 523.25, isBlack: false },
]

// Web Audio API Retro synth pluck helper
function playSynthNote(freq: number, type: OscillatorType = 'triangle') {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    // Quick Attack, decay/release pluck envelope
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch (e) {
    console.error('Synth sound failure:', e)
  }
}

// Velocity Drum Pad Hit sound (Kick-like synth)
function playPadHit(freq: number) {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12)

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.18)
  } catch (e) {
    console.error('Pad sound failure:', e)
  }
}

export function SkillsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isSectionInView = useInView(sectionRef, { amount: 0.25 })
  const [isOn, setIsOn] = useState(false)
  const [activeMessage, setActiveMessage] = useState<string>('SYSTEM OFF')
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [padActive, setPadActive] = useState<number | null>(null)
  const [bootScanIndex, setBootScanIndex] = useState<number | null>(null)

  // Central channel levels state synchronized across controls and visualizer
  const [channelLevels, setChannelLevels] = useState<Record<string, number>>(() => {
    const levels: Record<string, number> = {}
    MIXER_DATA.forEach((group) => {
      group.channels.forEach((ch) => {
        levels[ch.name] = ch.level
      })
    })
    return levels
  })

  // Auto boot-up sequence on scroll enter viewport
  useEffect(() => {
    if (isSectionInView) {
      if (!isOn) {
        const timer = setTimeout(() => {
          setIsOn(true)
          setActiveMessage('SYSTEM ON: BOOTING...')
          setTimeout(() => setActiveMessage('MIDI CONTROL 25 v1.0'), 400)
          setTimeout(() => setActiveMessage('MIDI KEYBOARD READY'), 800)
        }, 800)
        return () => clearTimeout(timer)
      }
    } else {
      setIsOn(false)
      setActiveMessage('SYSTEM OFF')
    }
  }, [isSectionInView])

  // LED sequence sweep scan on power ON
  useEffect(() => {
    if (isOn) {
      setBootScanIndex(0)
    } else {
      setBootScanIndex(null)
    }
  }, [isOn])

  useEffect(() => {
    if (bootScanIndex === null || bootScanIndex >= PIANO_KEYS.length) return
    const timer = setTimeout(() => {
      setBootScanIndex((idx) => (idx !== null ? idx + 1 : null))
    }, 20)
    return () => clearTimeout(timer)
  }, [bootScanIndex])

  const handlePlayKey = (key: PianoKey) => {
    if (!isOn) return
    setActiveKey(key.note)
    setActiveMessage(`PLAY NOTE: ${key.note} (${Math.round(key.freq)} Hz)`)
    playSynthNote(key.freq)
    setTimeout(() => setActiveKey(null), 300)
  }

  const handlePadHit = (skill: { name: string; level: number }, index: number) => {
    if (!isOn) return
    setPadActive(index)
    setActiveMessage(`PAD HIT: ${skill.name} — LEVEL: ${skill.level}%`)
    playPadHit(150 - index * 10)

    // Spike the visualizer level on hit
    setChannelLevels((prev) => ({ ...prev, [skill.name]: 100 }))

    // Decay back to base level
    setTimeout(() => {
      setPadActive(null)
      setChannelLevels((prev) => ({ ...prev, [skill.name]: skill.level }))
    }, 200)
  }

  const handleKnobChange = (name: string, val: number) => {
    if (!isOn) return
    setActiveMessage(`KNOB: ${name} — VALUE: ${val}%`)
    setChannelLevels((prev) => ({ ...prev, [name]: val }))
  }

  const handleFaderChange = (name: string, val: number) => {
    if (!isOn) return
    setActiveMessage(`SLIDER: ${name} — VALUE: ${val}%`)
    setChannelLevels((prev) => ({ ...prev, [name]: val }))
  }

  const allSkills = MIXER_DATA.flatMap((group) => group.channels)

  return (
    <section ref={sectionRef} id="skills" className="overflow-hidden py-24">
      <div className="container mx-auto px-4">
        {/* Headings */}
        <div className="mb-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 flex items-center gap-2 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 px-4 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400"
          >
            <Keyboard className="h-4 w-4" />
            <span>INTERACTIVE MIDI CONTROLLER</span>
          </motion.div>
          <h2 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
            Sonic Arsenal
          </h2>
        </div>

        {/* MIDI Keyboard Chassis */}
        <div className="relative mx-auto max-w-5xl rounded-2xl p-4 shadow-2xl transition-all duration-300 border border-black/10 dark:border-black/50 bg-[var(--daw-chassis)] dark:bg-[var(--daw-chassis)]">
          {/* Chassis screws */}
          <Screw className="absolute top-8 left-8 hover:rotate-12 transition-transform" />
          <Screw className="absolute top-8 right-8 hover:-rotate-12 transition-transform" />
          <Screw className="absolute bottom-8 left-8 hover:-rotate-12 transition-transform" />
          <Screw className="absolute right-8 bottom-8 hover:rotate-12 transition-transform" />

          {/* Brushed Metal horizontal chassis lines */}
          <div className="pointer-events-none absolute top-14 right-0 left-0 border-b border-black/15 dark:border-black/35" />

          {/* Faceplate body */}
          <div className="relative rounded-xl border border-black/20 bg-zinc-300/40 dark:bg-black/15 p-6 md:p-8 pt-12 md:pt-14 shadow-inner">
            
            {/* TOP PANEL: Branding, LCD, Controls */}
            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-black/10 dark:border-white/5 pb-6">
              
              {/* Device Branding */}
              <div>
                <h3 className="text-lg font-black tracking-widest text-black/60 dark:text-white/60 uppercase">
                  MIDI-CONTROL <span className="text-[#C9A447] font-bold">25</span>
                </h3>
                <p className="font-mono text-[9px] text-black/40 dark:text-white/30 uppercase tracking-widest mt-0.5">
                  Interactive Skills & Synthesizer Interface
                </p>
              </div>

              {/* Top Panel Controls: LCD, VU Meter, Power Switch */}
              <div className="flex flex-wrap items-center gap-4 justify-between w-full md:w-auto">
                {/* Horizontal VU Meter */}
                <HorizontalVUMeter isOn={isOn} />

                {/* LCD Display Readout */}
                <div className="flex h-12 w-48 shrink-0 flex-col justify-center rounded-[3px] border border-black/40 bg-[#0A0A0C] px-3.5 py-1.5 font-mono text-[9px] text-emerald-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                  <div className="flex justify-between text-[7px] text-emerald-600 tracking-wider font-bold">
                    <span>CHANNEL: 01</span>
                    <span>OCTAVE: 0</span>
                  </div>
                  <div className="truncate font-black uppercase tracking-widest text-emerald-300 mt-0.5 text-shadow-glow">
                    {isOn ? activeMessage : 'SYSTEM OFF'}
                  </div>
                </div>

                {/* Power Switch */}
                <div className="flex items-center gap-2 rounded border border-black/20 bg-zinc-400/30 p-2 dark:bg-black/20">
                  <div className="flex flex-col items-center gap-0.5">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full transition-all duration-300',
                        isOn
                          ? 'bg-green-500 shadow-[0_0_8px_#22c55e]'
                          : 'bg-zinc-800',
                      )}
                    />
                    <span className="text-[7px] font-bold tracking-wider text-black/50 dark:text-white/35">
                      PWR
                    </span>
                  </div>

                  <div className="h-6 w-px bg-black/10 dark:bg-white/10 mx-1" />

                  {/* Tactile rocker switch */}
                  <button
                    onClick={() => {
                      if (isOn) {
                        setIsOn(false)
                        setActiveMessage('SYSTEM OFF')
                      } else {
                        setIsOn(true)
                        setActiveMessage('SYSTEM ON: BOOTING...')
                        setTimeout(() => setActiveMessage('MIDI KEYBOARD READY'), 800)
                      }
                    }}
                    aria-label={isOn ? 'Power Off' : 'Power On'}
                    className={cn(
                      'relative h-9 w-6 cursor-pointer rounded border border-black bg-zinc-950 p-[1px] flex flex-col justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] outline-none',
                    )}
                  >
                    {/* Toggle slider cap */}
                    <div
                      className={cn(
                        'h-4 w-full rounded-[1px] bg-gradient-to-b from-[#B8B9C4] to-[#7B7C84] border border-black/30 shadow-md flex items-center justify-center transition-all duration-200',
                        isOn ? 'translate-y-0' : 'translate-y-4',
                      )}
                    >
                      <div className="h-px w-3 bg-black/20" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* METER BRIDGE: Stripe Audio Visualizer */}
            <div className="mb-8 rounded-lg border border-black/30 dark:border-white/10 bg-zinc-950/40 p-4 shadow-inner">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[8px] font-black tracking-widest text-black/50 dark:text-white/40 uppercase flex items-center gap-2">
                  <span>METER BRIDGE — SPECTRUM ANALYZER (14-CH)</span>
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all duration-300",
                    isOn ? "bg-amber-500 shadow-[0_0_4px_#f59e0b]" : "bg-zinc-800"
                  )} />
                </span>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-2 bg-green-500 rounded-[1px] opacity-80" />
                    <span className="font-mono text-[6px] text-black/40 dark:text-white/30">SIG</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-2 bg-yellow-500 rounded-[1px] opacity-80" />
                    <span className="font-mono text-[6px] text-black/40 dark:text-white/30">MID</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-2 bg-red-500 rounded-[1px] opacity-80" />
                    <span className="font-mono text-[6px] text-black/40 dark:text-white/30">CLIP</span>
                  </div>
                </div>
              </div>

              {/* Audio Stripe Columns Container */}
              <div className="flex h-32 items-end justify-between gap-1.5 rounded border border-black/50 bg-[#0E0F12] p-3 shadow-inner overflow-x-auto no-scrollbar">
                {allSkills.map((skill, idx) => (
                  <VisualizerColumn
                    key={skill.name}
                    name={skill.name}
                    level={channelLevels[skill.name] ?? skill.level}
                    index={idx}
                    isOn={isOn}
                  />
                ))}
              </div>
            </div>

            {/* CONTROLLER SECTION: Pads, Knobs, Faders */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8 items-stretch mb-8">
              
              {/* Group 1: velocity Drum Pads (Languages) */}
              <div className="lg:col-span-5 rounded-md border border-black/15 dark:border-white/5 bg-[var(--daw-chassis-mid)] p-4 shadow-inner">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-mono text-[8px] font-black tracking-wider text-black/40 dark:text-white/30 uppercase">
                    PAD BANK A: LANGUAGES
                  </h4>
                  <div className="h-1.5 w-1.5 rounded-full bg-[#C84B4B] shadow-[0_0_4px_#C84B4B]" />
                </div>
                {/* 2x3 Drum Pad Grid */}
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                  {MIXER_DATA[0].channels.map((skill, idx) => (
                    <DrumPad
                      key={skill.name}
                      name={skill.name}
                      level={channelLevels[skill.name] ?? skill.level}
                      index={idx}
                      isOn={isOn}
                      isActive={padActive === idx}
                      onHit={() => handlePadHit(skill, idx)}
                    />
                  ))}
                </div>
              </div>

              {/* Group 2: Rotary Encoders (Frameworks) */}
              <div className="lg:col-span-4 rounded-md border border-black/15 dark:border-white/5 bg-[var(--daw-chassis-mid)] p-4 shadow-inner">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-mono text-[8px] font-black tracking-wider text-black/40 dark:text-white/30 uppercase">
                    PARAM BANK B: FRAMEWORKS
                  </h4>
                  <div className="h-1.5 w-1.5 rounded-full bg-[#7ABB5E] shadow-[0_0_4px_#7ABB5E]" />
                </div>
                <div className="grid grid-cols-2 gap-4 h-36 items-center">
                  {MIXER_DATA[1].channels.map((skill, idx) => (
                    <FrameworkKnob
                      key={skill.name}
                      name={skill.name}
                      level={channelLevels[skill.name] ?? skill.level}
                      index={idx}
                      isOn={isOn}
                      onChange={(v) => handleKnobChange(skill.name, v)}
                    />
                  ))}
                </div>
              </div>

              {/* Group 3: Slider Faders (Tools & FX) */}
              <div className="lg:col-span-3 rounded-md border border-black/15 dark:border-white/5 bg-[var(--daw-chassis-mid)] p-4 shadow-inner">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-mono text-[8px] font-black tracking-wider text-black/40 dark:text-white/30 uppercase">
                    FADERS C: TOOLS
                  </h4>
                  <div className="h-1.5 w-1.5 rounded-full bg-[#4A9EC9] shadow-[0_0_4px_#4A9EC9]" />
                </div>
                <div className="flex justify-between items-center gap-1">
                  {MIXER_DATA[2].channels.map((skill, idx) => (
                    <ToolsFader
                      key={skill.name}
                      name={skill.name}
                      level={channelLevels[skill.name] ?? skill.level}
                      index={idx}
                      isOn={isOn}
                      onChange={(v) => handleFaderChange(skill.name, v)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* KEYBED SECTION: Wheels + Piano Keys */}
            <div className="flex items-end gap-4 border-t border-black/15 dark:border-white/5 pt-6 select-none overflow-hidden">
              
              {/* Pitch Bend / Mod Wheels */}
              <div className="hidden sm:flex shrink-0 items-end gap-2.5 pb-2">
                <MidiWheel
                  label="PITCH"
                  isOn={isOn}
                  onChange={(v) => setActiveMessage(`PITCH WHEEL: ${v > 0 ? '+' : ''}${v}`)}
                />
                <MidiWheel
                  label="MOD"
                  isOn={isOn}
                  onChange={(v) => setActiveMessage(`MOD WHEEL DEPTH: ${v}%`)}
                />
              </div>

              {/* Scrollable keybed container */}
              <div className="flex-1 overflow-x-auto no-scrollbar rounded-md shadow-lg border border-black/30">
                
                {/* LED indicator line directly above keys */}
                <div className="relative w-full h-2.5 bg-zinc-950 flex px-[1px] border-b border-black">
                  {PIANO_KEYS.map((key, i) => {
                    const isScanning = bootScanIndex !== null && bootScanIndex === i
                    const isActive = (isOn && activeKey === key.note) || isScanning
                    return (
                      <div
                        key={key.note}
                        className="flex-1 flex justify-center items-center h-full"
                      >
                        <div
                          className={cn(
                            'h-1.5 w-1.5 rounded-full transition-all duration-100',
                            isActive
                              ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                              : 'bg-zinc-800/80',
                          )}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Piano keybed row */}
                <div className={cn("relative flex w-full min-w-[560px] bg-zinc-900 py-0.5 transition-opacity duration-300", !isOn && "opacity-60 pointer-events-none")}>
                  {/* White keys */}
                  {PIANO_KEYS.filter((k) => !k.isBlack).map((key) => {
                    const isActive = activeKey === key.note
                    return (
                      <button
                        key={key.note}
                        onPointerDown={() => handlePlayKey(key)}
                        disabled={!isOn}
                        className={cn(
                          'flex-1 h-32 rounded-b-[4px] border-b-[3px] border-x border-t border-black/35 select-none transition-all outline-none',
                          isActive
                            ? 'bg-zinc-200 border-zinc-400 pt-2 border-b-2 shadow-inner'
                            : 'bg-white hover:bg-zinc-50 border-zinc-300 shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_2px_4px_rgba(0,0,0,0.15)]',
                        )}
                      />
                    )
                  })}

                  {/* Black keys overlaid absolutely */}
                  {PIANO_KEYS.filter((k) => k.isBlack).map((key) => {
                    const isActive = activeKey === key.note
                    return (
                      <button
                        key={key.note}
                        onPointerDown={() => handlePlayKey(key)}
                        disabled={!isOn}
                        className={cn(
                          'absolute h-20 w-3 rounded-b-[3px] bg-gradient-to-b from-zinc-800 to-black select-none border border-black outline-none transition-all shadow-[0_2px_4px_rgba(0,0,0,0.4)] z-20',
                          isActive
                            ? 'from-zinc-900 to-zinc-950 scale-y-95 border-zinc-700 shadow-inner'
                            : 'hover:from-zinc-700 hover:to-zinc-900',
                        )}
                        style={{ left: key.leftOffset }}
                      />
                    )
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Sub-component: Visualizer column for Meter Bridge ── */
interface VisualizerColumnProps {
  name: string
  level: number
  index: number
  isOn: boolean
}

function VisualizerColumn({ name, level, index, isOn }: VisualizerColumnProps) {
  const [dynamicVal, setDynamicVal] = useState(level)

  useEffect(() => {
    if (!isOn) {
      setDynamicVal(level)
      return
    }

    const interval = setInterval(() => {
      // Bouncing audio frequency wave on top of the skill level
      const wave = Math.sin(Date.now() * 0.005 + index * 0.7) * 12
      const noise = (Math.random() - 0.5) * 6
      const nextVal = Math.min(100, Math.max(0, level + wave + noise))
      setDynamicVal(nextVal)
    }, 60 + (index % 4) * 15)

    return () => clearInterval(interval)
  }, [isOn, level, index])

  const totalSegments = 14

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-[15px] md:min-w-[20px]">
      <div className="flex w-2.5 md:w-3 flex-col-reverse gap-[1px] h-[82px] items-end justify-start">
        {[...Array(totalSegments)].map((_, i) => {
          const threshold = (i / totalSegments) * 100
          const isLit = dynamicVal >= threshold

          // Color bands: green (bottom 8), yellow (middle 3), red (top 3)
          const isRed = i >= 11
          const isYellow = i >= 8 && i < 11
          const colorClass = isRed
            ? 'bg-red-500'
            : isYellow
              ? 'bg-yellow-500'
              : 'bg-green-500'

          // Opacity configuration (lit is bright, unlit is dim background)
          const opacity = isLit
            ? isRed
              ? 0.95
              : isYellow
                ? 0.85
                : 0.75
            : 0.15

          return (
            <div
              key={i}
              className={cn(
                'h-[4px] w-full rounded-[0.5px] transition-all duration-75',
                colorClass
              )}
              style={{
                opacity: opacity,
                boxShadow: isLit && opacity > 0.3 ? `0 0 3px ${isRed ? '#ef4444' : isYellow ? '#eab308' : '#22c55e'}60` : 'none',
              }}
            />
          )
        })}
      </div>
      <span className="font-mono text-[5px] md:text-[6px] font-extrabold text-black/40 dark:text-white/35 truncate w-full text-center uppercase tracking-tighter mt-1 select-none">
        {name}
      </span>
    </div>
  )
}

/* ── Sub-component: Drum velocity Pad ── */
interface DrumPadProps {
  name: string
  level: number
  index: number
  isActive: boolean
  onHit: () => void
}

function DrumPad({ name, level, index, isActive, onHit, isOn }: DrumPadProps & { isOn: boolean }) {
  const colors = ['#C84B4B', '#D4864A', '#C9A447', '#7ABB5E', '#4A9EC9', '#8A5FC9']
  const color = colors[index % colors.length]
  const isLit = isOn && isActive

  return (
    <button
      onPointerDown={isOn ? onHit : undefined}
      disabled={!isOn}
      className={cn(
        'relative h-[68px] w-20 rounded-md border flex flex-col justify-between p-2 transition-all select-none outline-none',
        isOn ? 'cursor-pointer' : 'cursor-not-allowed opacity-30',
        isLit
          ? 'scale-95 bg-zinc-800'
          : 'bg-zinc-900 border-zinc-950/80 shadow-[0_3px_5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]',
      )}
      style={{
        boxShadow: isLit
          ? `0 0 14px ${color}, inset 0 0 8px ${color}`
          : 'none',
        borderColor: isLit ? '#ffffff' : isOn ? `${color}40` : 'transparent',
      }}
    >
      <div className="flex w-full justify-between items-center">
        <span className="font-mono text-[5px] text-white/30 uppercase font-bold">PAD {index + 1}</span>
        <div
          className="h-1.5 w-1.5 rounded-full transition-all duration-300"
          style={{
            background: isOn ? color : 'rgba(255,255,255,0.05)',
            boxShadow: isLit ? `0 0 5px ${color}` : 'none',
          }}
        />
      </div>
      <span className="font-mono text-[7px] font-black text-center w-full truncate text-white uppercase tracking-wider">
        {name}
      </span>
      <span className="font-mono text-[6px] font-bold text-center w-full text-white/50">
        {`${level}%`}
      </span>
    </button>
  )
}

/* ── Sub-component: Rotary dial parameter ── */
interface FrameworkKnobProps {
  name: string
  level: number
  index: number
  onChange: (val: number) => void
}

function FrameworkKnob({ name, level, index, onChange, isOn }: FrameworkKnobProps & { isOn: boolean }) {
  const [val, setVal] = useState(level)
  const colors = ['#7ABB5E', '#4A9EC9', '#8A5FC9', '#C95FAA']
  const color = colors[index % colors.length]
  const isDragging = useRef(false)
  const lastY = useRef(0)

  useEffect(() => {
    setVal(level)
  }, [level])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isOn) return
    e.preventDefault()
    isDragging.current = true
    lastY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const deltaY = lastY.current - e.clientY
    lastY.current = e.clientY
    const deltaVal = Math.round(deltaY * 0.7)
    const newVal = Math.min(100, Math.max(0, val + deltaVal))
    setVal(newVal)
    onChange(newVal)
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  // Active level calculation: always show val, but animate style opacity when off
  const rot = (val / 100) * 270 - 135

  return (
    <div className={cn("flex flex-col items-center gap-1 select-none transition-opacity duration-300", !isOn && "opacity-35")}>
      <motion.div
        animate={{ rotate: rot }}
        transition={{ type: 'spring', stiffness: 100, damping: 14 }}
        className={cn(
          "relative h-12 w-12 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 border-2 border-black/40 shadow-md flex items-center justify-center",
          isOn ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Ridge marker */}
        {isOn && (
          <div
            className="absolute top-1 w-0.5 h-3.5 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
        )}
      </motion.div>
      <span className="font-mono text-[7px] font-bold text-black/50 dark:text-white/40 uppercase tracking-wider mt-1 truncate w-full text-center">
        {name}
      </span>
      <span className="font-mono text-[6px] font-bold text-black/30 dark:text-white/20 mt-0.5">
        {val}%
      </span>
    </div>
  )
}

/* ── Sub-component: Recessed sliding Fader ── */
interface ToolsFaderProps {
  name: string
  level: number
  index: number
  onChange: (val: number) => void
}

function ToolsFader({ name, level, index, onChange, isOn }: ToolsFaderProps & { isOn: boolean }) {
  const [val, setVal] = useState(level)
  const colors = ['#C84B4B', '#D4864A', '#C9A447', '#5FC9C9']
  const color = colors[index % colors.length]
  const railRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    setVal(level)
  }, [level])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isOn) return
    e.preventDefault()
    isDragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !railRef.current) return
    const rail = railRef.current.getBoundingClientRect()
    const pct = 1 - (e.clientY - rail.top) / rail.height
    const newVal = Math.min(100, Math.max(0, Math.round(pct * 100)))
    setVal(newVal)
    onChange(newVal)
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  // Smooth slide tracking
  const targetLevel = val

  return (
    <div className={cn("flex flex-col items-center gap-1 select-none h-36 py-1 flex-1 transition-opacity duration-300", !isOn && "opacity-35")}>
      <div
        ref={railRef}
        className={cn("relative w-4 flex-1 flex justify-center", isOn ? "cursor-ns-resize" : "cursor-not-allowed")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Recessed track slot */}
        <div className="absolute top-0 bottom-0 w-1 bg-zinc-950 rounded-full shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85)] border border-black/10" />

        {/* Level indicator track fill */}
        <motion.div
          animate={{ height: `${targetLevel}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
          className="absolute bottom-0 w-1 rounded-full"
          style={{
            background: `linear-gradient(to top, ${color}80, ${color}15)`,
          }}
        />

        {/* Fader slider cap */}
        <motion.div
          animate={{ top: `${100 - targetLevel}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
          className="absolute h-5 w-6 rounded-[2px] bg-gradient-to-b from-[#B8B9C4] to-[#6B6C74] border border-black/45 shadow-md flex flex-col justify-center items-center gap-[2px] pointer-events-none"
          style={{ transform: 'translateY(-50%)' }}
        >
          <div className="w-4 h-[1px] bg-black/30" />
          {isOn && (
            <div className="w-full h-px" style={{ background: color, boxShadow: `0 0 3px ${color}` }} />
          )}
          <div className="w-4 h-[1px] bg-black/30" />
        </motion.div>
      </div>
      <span className="font-mono text-[7px] font-bold text-black/50 dark:text-white/40 uppercase tracking-wider truncate w-full text-center mt-1">
        {name}
      </span>
      <span className="font-mono text-[6px] font-bold text-black/30 dark:text-white/20 mt-0.5">
        {targetLevel}%
      </span>
    </div>
  )
}

/* ── Sub-component: Recessed slide wheel (Pitch / Mod) ── */
interface MidiWheelProps {
  label: string
  isOn: boolean
  onChange: (val: number) => void
}

function MidiWheel({ label, isOn, onChange }: MidiWheelProps) {
  const min = label === 'PITCH' ? -50 : 0
  const max = label === 'PITCH' ? 50 : 100
  const defaultVal = label === 'PITCH' ? 0 : 20

  const [val, setVal] = useState(defaultVal)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Calibration Wobble on power ON
  useEffect(() => {
    if (isOn) {
      if (label === 'PITCH') {
        setTimeout(() => setVal(20), 100)
        setTimeout(() => setVal(-20), 300)
        setTimeout(() => setVal(0), 500)
      } else {
        setVal(defaultVal)
      }
    } else {
      setVal(0)
    }
  }, [isOn])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isOn) return
    e.preventDefault()
    isDragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const pct = 1 - (e.clientY - rect.top) / rect.height
    const clampedPct = Math.min(1, Math.max(0, pct))
    const rawVal = Math.round(clampedPct * (max - min) + min)
    setVal(rawVal)
    onChange(rawVal)
  }

  const handlePointerUp = () => {
    isDragging.current = false
    if (label === 'PITCH') {
      setVal(0)
      onChange(0)
    }
  }

  // Smooth slide tracking
  const displayVal = isOn ? val : 0
  const topPct = 100 - ((displayVal - min) / (max - min)) * 100

  return (
    <div className={cn("flex flex-col items-center gap-1 select-none transition-opacity duration-300", !isOn && "opacity-30")}>
      <div
        ref={trackRef}
        className={cn(
          "relative h-28 w-6 rounded-[3px] bg-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-black/40 overflow-hidden",
          isOn ? "cursor-ns-resize" : "cursor-not-allowed"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Roller cylinder cap */}
        <motion.div
          animate={{ top: `${topPct}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 13 }}
          className="absolute left-0.5 right-0.5 h-7 rounded-[1px] bg-gradient-to-b from-[#B8B9C4] via-[#7B7C84] to-[#4B4C52] border border-black/45 shadow-md"
          style={{ transform: 'translateY(-50%)' }}
        >
          <div className="absolute top-1/2 left-0.5 right-0.5 h-px bg-black/40" />
          <div className="absolute top-1/4 left-0.5 right-0.5 h-px bg-white/20" />
          <div className="absolute bottom-1/4 left-0.5 right-0.5 h-px bg-black/20" />
          {/* Internal LED indicator */}
          {isOn && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[3px] w-2 bg-[#C9A447] rounded-full shadow-[0_0_3px_#C9A447]" />
          )}
        </motion.div>
      </div>
      <span className="font-mono text-[5px] font-black tracking-widest text-black/45 dark:text-white/30 uppercase mt-0.5">
        {label}
      </span>
    </div>
  )
}

/* ── Sub-component: Horizontal stereo VU Meter ── */
function HorizontalVUMeter({ isOn }: { isOn: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[3px] border border-black/40 bg-[#0A0A0C] p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] w-44 justify-center">
      {[...Array(2)].map((_, ch) => (
        <div key={ch} className="flex gap-[1.5px] items-center w-full">
          {[...Array(15)].map((_, i) => {
            const isRed = i >= 13
            const isYellow = i >= 10 && i < 13
            const color = isRed
              ? 'bg-red-500'
              : isYellow
                ? 'bg-yellow-500'
                : 'bg-green-500'

            return (
              <VUSegment key={i} index={i} color={color} isOn={isOn} ch={ch} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function VUSegment({ index, color, isOn, ch }: { index: number; color: string; isOn: boolean; ch: number }) {
  const [opacity, setOpacity] = useState(0.1)

  useEffect(() => {
    if (!isOn) {
      setOpacity(0.1)
      return
    }

    const interval = setInterval(() => {
      // Generate stereo level pulse
      const level = Math.sin(Date.now() * 0.005 + ch * 1.5) * 6 + 8
      const threshold = index
      if (threshold <= level) {
        setOpacity(threshold >= 13 ? 0.95 : threshold >= 10 ? 0.85 : 0.75)
      } else {
        setOpacity(0.1)
      }
    }, 80 + index * 4)

    return () => clearInterval(interval)
  }, [isOn, index, ch])

  return (
    <div
      className={cn("h-3 w-[7px] rounded-[1px] transition-all duration-75", color)}
      style={{
        opacity: opacity,
        boxShadow: opacity > 0.3 ? `0 0 4px ${color}80` : 'none',
      }}
    />
  )
}
