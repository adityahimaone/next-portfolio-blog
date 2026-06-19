'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { Music, Radio, Square, Play, Pause, Volume2, Mail, Linkedin, Github, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'
import { useAudioEngine } from '@/features/landing-page/spotify/use-audio-engine'
import { functionalPads, dummyColors } from './data/pads'
import { presets } from './data/presets'

export function ContactSection() {
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle')
  const [activePads, setActivePads] = useState<Set<string>>(new Set())
  const [loopingPads, setLoopingPads] = useState<Set<string>>(new Set())
  const [currentPreset, setCurrentPreset] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [bpm, setBpm] = useState(96)
  const [transportTime, setTransportTime] = useState('0:00')
  const [masterVol, setMasterVol] = useState(-6)

  const { toneRef, startAudio, isLoaded } = useAudioEngine()

  const synthsRef = useRef<Record<string, any>>({})
  const padLoopsRef = useRef<Map<string, any>>(new Map())
  const partRef = useRef<any>(null)
  const isInitializedRef = useRef(false)
  const masterVolRef = useRef<any>(null)
  const rafRef = useRef<number>(0)
  const activeTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // ─── Initialize Synths ──────────────────────────────────────────
  const initializeSynths = useCallback(async () => {
    if (isInitializedRef.current || !toneRef.current) return
    const Tone = toneRef.current

    try {
      // Master volume
      masterVolRef.current = new Tone.Volume(masterVol).toDestination()

      const melody = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.3 },
      }).connect(masterVolRef.current)

      const chord = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.6 },
      }).connect(masterVolRef.current)

      const bass = new Tone.MonoSynth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
        filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
      }).connect(masterVolRef.current)

      const padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.3, decay: 0.3, sustain: 0.5, release: 1.2 },
      }).connect(masterVolRef.current)
      padSynth.volume.value = -12

      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
      }).connect(masterVolRef.current)

      const snare = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.2, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      }).connect(masterVolRef.current)
      snare.volume.value = -6

      const hihat = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.08, sustain: 0 },
      }).connect(masterVolRef.current)
      hihat.volume.value = -12

      const clap = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.15, release: 0.05 },
        harmonicity: 3,
        modulationIndex: 20,
        resonance: 3000,
        octaves: 1,
      }).connect(masterVolRef.current)
      clap.volume.value = -8

      synthsRef.current = {
        melody, synth: melody, chord, bass,
        pad: padSynth, kick, snare, hihat, clap,
      }
      isInitializedRef.current = true
    } catch (e) {
      console.error('Failed to initialize synths:', e)
    }
  }, [toneRef, masterVol])

  // Update master volume
  useEffect(() => {
    if (masterVolRef.current) {
      masterVolRef.current.volume.value = masterVol
    }
  }, [masterVol])

  // Cleanup
  useEffect(() => {
    return () => {
      stopAllPlayback()
      Object.values(synthsRef.current).forEach((s) => s?.dispose?.())
      masterVolRef.current?.dispose?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Transport Time UI ──────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying && !isPaused) return
    const update = () => {
      const Tone = toneRef.current
      if (Tone) {
        const pos = Tone.Transport.position
        const [bars = 0, beats = 0] = pos.toString().split(':').map(Number)
        setTransportTime(`${bars}:${String(Math.floor(beats)).padStart(2, '0')}`)
      }
      rafRef.current = requestAnimationFrame(update)
    }
    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, isPaused, toneRef])

  // ─── Stop All ───────────────────────────────────────────────────
  const stopAllPlayback = useCallback(() => {
    const Tone = toneRef.current
    if (Tone) {
      Tone.Transport.stop()
      Tone.Transport.cancel()
      Tone.Transport.position = 0
    }
    if (partRef.current) {
      partRef.current.dispose()
      partRef.current = null
    }
    padLoopsRef.current.forEach((loop) => {
      loop?.stop?.()
      loop?.dispose?.()
    })
    padLoopsRef.current.clear()

    activeTimeoutsRef.current.forEach((t) => clearTimeout(t))
    activeTimeoutsRef.current.clear()

    setLoopingPads(new Set())
    setActivePads(new Set())
    setCurrentPreset(null)
    setIsPlaying(false)
    setIsPaused(false)
    setTransportTime('0:00')
  }, [toneRef])

  // ─── Toggle Pad Loop ────────────────────────────────────────────
  const togglePadLoop = useCallback(async (pad: any) => {
    const audioStarted = await startAudio()
    if (!audioStarted || !isLoaded) return
    await initializeSynths()

    const Tone = toneRef.current
    if (!Tone || !isInitializedRef.current) return

    const isLooping = padLoopsRef.current.has(pad.id)

    if (isLooping) {
      // Stop loop
      const loop = padLoopsRef.current.get(pad.id)
      if (loop) {
        loop.stop()
        loop.dispose()
      }
      padLoopsRef.current.delete(pad.id)
      setLoopingPads((prev) => {
        const n = new Set(prev)
        n.delete(pad.id)
        return n
      })
      return
    }

    // Start loop
    setLoopingPads((prev) => new Set(prev).add(pad.id))
    setActivePads((prev) => new Set(prev).add(pad.id))
    const t = setTimeout(() => {
      setActivePads((prev) => {
        const n = new Set(prev)
        n.delete(pad.id)
        return n
      })
    }, 150)
    activeTimeoutsRef.current.set(pad.id, t)

    // Determine synth type and note
    const typePool = ['kick', 'snare', 'hihat', 'clap', 'melody', 'bass']
    const notePool = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4']
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']

    let type: string
    let note: string
    let interval: string
    let duration: string

    if (pad.type === 'functional') {
      // Functional pads get assigned a specific sound
      switch (pad.id) {
        case 'email': type = 'chord'; note = 'C4'; interval = '2n'; duration = '4n'; break
        case 'linkedin': type = 'melody'; note = 'E4'; interval = '4n'; duration = '8n'; break
        case 'github': type = 'bass'; note = 'C2'; interval = '2n'; duration = '4n'; break
        case 'spotify': type = 'hihat'; note = 'C2'; interval = '8n'; duration = '16n'; break
        case 'resume': type = 'clap'; note = 'D2'; interval = '2n'; duration = '8n'; break
        default: type = 'melody'; note = notes[0]; interval = '4n'; duration = '8n'
      }
    } else {
      type = typePool[(pad.x + pad.y) % typePool.length]
      note = notePool[(pad.x * 3 + pad.y) % notePool.length]
      interval = type === 'hihat' ? '8n' : type === 'kick' ? '4n' : type === 'snare' ? '2n' : type === 'clap' ? '2n' : type === 'bass' ? '2n' : '4n'
      duration = type === 'hihat' ? '16n' : type === 'kick' ? '8n' : '8n'
    }

    const synth = synthsRef.current[type]
    if (!synth) return

    let loop: any

    if (type === 'hihat') {
      loop = new Tone.Loop((time: number) => {
        synth.triggerAttackRelease(duration, time)
      }, interval).start(0)
    } else if (type === 'chord' || type === 'pad') {
      const chordNotes = [note, Tone.Frequency(note).transpose(4), Tone.Frequency(note).transpose(7)]
      loop = new Tone.Loop((time: number) => {
        synth.triggerAttackRelease(chordNotes, duration, time)
      }, interval).start(0)
    } else {
      loop = new Tone.Loop((time: number) => {
        synth.triggerAttackRelease(note, duration, time)
      }, interval).start(0)
    }

    padLoopsRef.current.set(pad.id, loop)

    // Start transport if not already running
    if (!isPlaying && !isPaused) {
      Tone.Transport.start()
      setIsPlaying(true)
    }
  }, [startAudio, isLoaded, initializeSynths, toneRef, isPlaying, isPaused])

  // ─── Play Preset ────────────────────────────────────────────────
  const playPreset = useCallback(async (presetId: string) => {
    stopAllPlayback()

    const preset = presets.find((p) => p.id === presetId)
    if (!preset) return

    const audioStarted = await startAudio()
    if (!audioStarted || !isLoaded) return
    await initializeSynths()

    const Tone = toneRef.current
    if (!Tone || !isInitializedRef.current) return

    // Set BPM
    if (preset.bpm) {
      Tone.Transport.bpm.value = preset.bpm
      setBpm(preset.bpm)
    }

    if (partRef.current) {
      partRef.current.dispose()
      partRef.current = null
    }

    Tone.Transport.stop()
    Tone.Transport.position = 0
    Tone.Transport.cancel()

    // Build Part from events or pads
    const events: any[] = []

    if (preset.events && preset.events.length > 0) {
      // New format: events with beat times
      preset.events.forEach((evt) => {
        events.push([evt.time, evt])
      })
    } else if (preset.pads && preset.pads.length > 0) {
      // Legacy format: pads with ms delays
      preset.pads.forEach((pad) => {
        events.push([pad.delay / 1000, pad])
      })
    }

    if (events.length === 0) return

    const part = new Tone.Part((time: number, event: any) => {
      const synth = synthsRef.current[event.type || 'melody']
      if (!synth) return

      const dur = event.duration || '8n'
      const note = event.note

      if (event.type === 'hihat') {
        synth.triggerAttackRelease(dur, time)
      } else if (['kick', 'snare', 'clap'].includes(event.type)) {
        synth.triggerAttackRelease(note, dur, time)
      } else if (event.type === 'chord' || event.type === 'pad') {
        const chordNotes = [note, Tone.Frequency(note).transpose(4), Tone.Frequency(note).transpose(7)]
        synth.triggerAttackRelease(chordNotes, dur, time)
      } else {
        synth.triggerAttackRelease(note, dur, time)
      }

      // Visual feedback synced to audio
      Tone.Draw.schedule(() => {
        const padId = event.padId || event.id
        if (!padId || padId === 'preset') return
        setActivePads((prev) => new Set(prev).add(padId))
        const t = setTimeout(() => {
          setActivePads((prev) => {
            const n = new Set(prev)
            n.delete(padId)
            return n
          })
        }, 200)
        activeTimeoutsRef.current.set(padId, t)
      }, time)
    }, events)

    part.start(0)
    partRef.current = part

    Tone.Transport.start()
    setCurrentPreset(presetId)
    setIsPlaying(true)
    setIsPaused(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAudio, isLoaded, initializeSynths, toneRef, stopAllPlayback])

  // ─── Transport Controls ─────────────────────────────────────────
  const togglePause = useCallback(() => {
    const Tone = toneRef.current
    if (!Tone) return
    if (isPaused) {
      Tone.Transport.start()
      setIsPaused(false)
      setIsPlaying(true)
    } else {
      Tone.Transport.pause()
      setIsPaused(true)
      setIsPlaying(false)
    }
  }, [isPaused, toneRef])

  // ─── BPM Change ─────────────────────────────────────────────────
  const handleBpmChange = useCallback((value: number) => {
    setBpm(value)
    const Tone = toneRef.current
    if (Tone) {
      Tone.Transport.bpm.value = value
    }
  }, [toneRef])

  // ─── Handle Pad Click ───────────────────────────────────────────
  const handlePadClick = useCallback(async (pad: any) => {
    // Toggle loop for all pads
    await togglePadLoop(pad)

    // Functional actions
    if (!pad.id.startsWith('dummy')) {
      if (pad.href) {
        window.open(pad.href, '_blank')
      }
    }
  }, [togglePadLoop])

  // ─── Generate Grid ──────────────────────────────────────────────
  const { desktopGrid, mobileGrid } = useMemo(() => {
    const generateGridItems = (rows: number, cols: number, isMobile: boolean) => {
      const items: any[] = []
      const occupied = new Set<string>()

      functionalPads.forEach((pad) => {
        const config = isMobile ? pad.mobile : pad
        for (let i = 0; i < config.w; i++) {
          for (let j = 0; j < config.h; j++) {
            occupied.add(`${config.x + i},${config.y + j}`)
          }
        }
      })

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (occupied.has(`${x},${y}`)) {
            const pad = functionalPads.find((p) => {
              const config = isMobile ? p.mobile : p
              return x >= config.x && x < config.x + config.w && y >= config.y && y < config.y + config.h
            })
            if (pad && (isMobile ? pad.mobile.x === x && pad.mobile.y === y : pad.x === x && pad.y === y)) {
              items.push({ ...pad, type: 'functional', w: isMobile ? pad.mobile.w : pad.w, h: isMobile ? pad.mobile.h : pad.h })
            }
          } else {
            items.push({ id: `dummy-${x}-${y}`, x, y, w: 1, h: 1, type: 'dummy', color: dummyColors[(x + y) % dummyColors.length] })
          }
        }
      }
      return items
    }
    return { desktopGrid: generateGridItems(4, 8, false), mobileGrid: generateGridItems(6, 4, true) }
  }, [])

  // ─── Launchpad Grid Component ───────────────────────────────────
  const LaunchpadGrid = useCallback(({ items, cols, rows }: { items: any[]; cols: number; rows: number }) => (
    <div
      className="grid gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, aspectRatio: `${cols}/${rows}` }}
    >
      {items.map((pad) => {
        const isLooping = loopingPads.has(pad.id)
        const isActive = activePads.has(pad.id)
        return (
          <m.button
            key={pad.id}
            onClick={() => handlePadClick(pad)}
            aria-label={pad.type === 'functional' && 'label' in pad ? `Pad ${(pad as any).label}` : `Pad ${pad.id}`}
            className={cn(
              'group relative flex flex-col items-center justify-center overflow-hidden rounded-md border-b-4 border-zinc-950 bg-zinc-800 transition-all duration-100 active:translate-y-1 active:scale-95 active:border-b-0 sm:rounded-lg',
              pad.type === 'functional' ? 'z-10' : 'z-0',
            )}
            style={{ gridColumn: `span ${pad.w}`, gridRow: `span ${pad.h}` }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Glow — persistent when looping, brief on active */}
            <div className={cn('absolute inset-0 z-0 transition-opacity duration-150', pad.color, isLooping ? 'opacity-80' : isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60')} />

            {/* Content */}
            {pad.type === 'functional' && 'icon' in pad && (
              <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                <pad.icon className={cn('h-5 w-5 transition-colors duration-200 sm:h-8 sm:w-8', isLooping || isActive ? 'text-white' : 'text-zinc-500')} />
                <div className="hidden flex-col items-center sm:flex">
                  <span className={cn('text-[10px] font-bold tracking-wider transition-colors duration-200 sm:text-xs', isLooping || isActive ? 'text-white' : 'text-zinc-400')}>
                    {(pad as any).label}
                  </span>
                  {(pad as any).subLabel && (
                    <span className={cn('font-mono text-[8px] transition-colors duration-200 sm:text-[10px]', isLooping || isActive ? 'text-white/80' : 'text-zinc-600')}>
                      {(pad as any).subLabel}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* LED — pulse when looping */}
            <div className={cn('absolute top-1 right-1 h-1.5 w-1.5 rounded-full transition-colors duration-200 sm:top-2 sm:right-2', isLooping ? 'animate-pulse bg-white' : isActive ? 'bg-white' : 'bg-zinc-900')} />

            {/* Loop indicator */}
            {isLooping && (
              <div className="absolute bottom-1 left-1 h-1 w-1 rounded-full bg-white/50 sm:bottom-2 sm:left-2" />
            )}
          </m.button>
        )
      })}
    </div>
  ), [loopingPads, activePads, handlePadClick])
  const handleSubmitForm = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formEmail || !formMessage) return

    setFormStatus('sending')

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Audio confirmation if tone is loaded
    const audioStarted = await startAudio()
    if (audioStarted && isLoaded) {
      await initializeSynths()
      const Tone = toneRef.current
      if (Tone && isInitializedRef.current) {
        const melody = synthsRef.current.melody
        const bass = synthsRef.current.bass
        const now = Tone.now()
        // Synthesize nice celebratory arpeggio
        melody.triggerAttackRelease("C4", "8n", now)
        melody.triggerAttackRelease("E4", "8n", now + 0.1)
        melody.triggerAttackRelease("G4", "8n", now + 0.2)
        melody.triggerAttackRelease("C5", "4n", now + 0.3)
        bass.triggerAttackRelease("C3", "2n", now)
      }
    }

    setFormStatus('success')
  }, [formName, formEmail, formMessage, startAudio, isLoaded, initializeSynths, toneRef])

  return (
    <>
      <section id="contact" className="overflow-hidden py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 flex flex-col items-center text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-2 rounded-full bg-zinc-200/50 px-4 py-1.5 text-sm font-medium text-zinc-650 dark:bg-zinc-800/50 dark:text-zinc-400"
            >
              <Radio className="h-4 w-4" />
              <span>SESSION BOOKING</span>
            </m.div>
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-5xl dark:text-white"
            >
              Connect & Collaborate
            </m.h2>
            <p className="mt-4 max-w-2xl text-lg text-zinc-650 dark:text-zinc-400">
              Stack some loops to build a beat on the right, and transmit your message on the left.
            </p>
          </div>

          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Form Console (5/12 width) */}
            <div className="relative lg:col-span-5 w-full rounded-3xl bg-zinc-200 p-4 shadow-2xl dark:bg-zinc-900 flex flex-col justify-between min-h-[500px]">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />
              
              <div className="relative flex-1 rounded-2xl border border-zinc-400/50 bg-zinc-300 p-6 shadow-inner md:p-8 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between">
                <Screw className="absolute top-3 left-3 sm:top-4 sm:left-4" />
                <Screw className="absolute top-3 right-3 sm:top-4 sm:right-4" />
                <Screw className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4" />
                <Screw className="absolute right-3 bottom-3 sm:right-4 sm:right-4" />

                <div>
                  {/* Branding Panel */}
                  <div className="mb-6 flex items-center justify-between border-b border-zinc-400/30 pb-4 dark:border-zinc-800">
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] tracking-widest text-zinc-500">SYSTEM OUT</span>
                      <h3 className="text-base font-black tracking-widest text-zinc-700 uppercase dark:text-zinc-300">
                        TRANSMITTER <span className="text-amber-500">TX-1</span>
                      </h3>
                    </div>
                    {/* Signal status LED */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-zinc-500">SIGNAL</span>
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]",
                        formStatus === 'idle' ? 'bg-zinc-500 text-zinc-500/50' :
                        formStatus === 'sending' ? 'bg-yellow-500 text-yellow-500/80 animate-pulse' :
                        'bg-green-500 text-green-500/80 animate-pulse'
                      )} />
                    </div>
                  </div>

                  {/* Form Content */}
                  {formStatus === 'success' ? (
                    <m.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center py-10 px-2"
                    >
                      <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500 flex items-center justify-center text-green-500 mb-5 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        <Radio className="h-6 w-6 animate-pulse" />
                      </div>
                      <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">
                        TRANSMISSION SUCCESS
                      </h4>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-normal">
                        Your message was successfully synthesized and transmitted. I'll review it and get back to you shortly.
                      </p>
                      <button
                        onClick={() => {
                          setFormStatus('idle')
                          setFormName('')
                          setFormEmail('')
                          setFormMessage('')
                        }}
                        className="mt-6 rounded-lg border border-zinc-400 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-5 py-2 text-xs font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 transition-all active:scale-95 shadow-md"
                      >
                        Reset Console
                      </button>
                    </m.div>
                  ) : (
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                      <div>
                        <label className="block font-mono text-[9px] font-bold text-zinc-500 uppercase mb-1">
                          [01] Sender Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Your name"
                          disabled={formStatus === 'sending'}
                          className="w-full rounded-md border border-zinc-400 dark:border-zinc-800 bg-zinc-200 dark:bg-black p-2.5 font-mono text-xs text-zinc-800 dark:text-amber-500 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[9px] font-bold text-zinc-500 uppercase mb-1">
                          [02] Return Frequency (Email)
                        </label>
                        <input
                          type="email"
                          required
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="Your email address"
                          disabled={formStatus === 'sending'}
                          className="w-full rounded-md border border-zinc-400 dark:border-zinc-800 bg-zinc-200 dark:bg-black p-2.5 font-mono text-xs text-zinc-800 dark:text-amber-500 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[9px] font-bold text-zinc-500 uppercase mb-1">
                          [03] Transmission Payload (Message)
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={formMessage}
                          onChange={(e) => setFormMessage(e.target.value)}
                          placeholder="Type your message..."
                          disabled={formStatus === 'sending'}
                          className="w-full rounded-md border border-zinc-400 dark:border-zinc-800 bg-zinc-200 dark:bg-black p-2.5 font-mono text-xs text-zinc-800 dark:text-amber-500 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                        />
                      </div>

                      <div className="pt-2">
                        <m.button
                          type="submit"
                          disabled={formStatus === 'sending'}
                          whileTap={{ scale: 0.97 }}
                          className={cn(
                            "w-full rounded-xl py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow-lg flex items-center justify-center gap-2 border border-red-400/25",
                            formStatus === 'sending' 
                              ? "bg-red-700 opacity-60 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-500 hover:scale-[1.01] shadow-[0_4px_15px_rgba(220,38,38,0.3)] active:bg-red-700"
                          )}
                        >
                          <Radio className={cn("h-3.5 w-3.5", formStatus === 'sending' && "animate-spin")} />
                          <span>{formStatus === 'sending' ? 'TRANSMITTING...' : 'TRANSMIT SIGNAL'}</span>
                        </m.button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Launchpad Board (7/12 width) */}
            <div className="relative lg:col-span-7 w-full rounded-3xl bg-zinc-800 p-2 shadow-2xl sm:p-4 dark:bg-zinc-950 flex flex-col justify-between">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />

              <div className="relative flex-1 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 shadow-inner sm:p-6 md:p-8">
                <Screw className="absolute top-2 left-2 sm:top-4 sm:left-4" />
                <Screw className="absolute top-2 right-2 sm:top-4 sm:right-4" />
                <Screw className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4" />
                <Screw className="absolute right-2 bottom-2 sm:right-4 sm:bottom-4" />

                {/* Top Panel */}
                <div className="mb-4 flex items-center justify-between px-2 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2', isPlaying ? 'animate-pulse bg-red-500' : 'bg-zinc-600')} />
                    <span className="font-mono text-[9px] tracking-widest text-zinc-500 sm:text-xs">REC</span>
                  </div>
                  <span className="text-[9px] font-black tracking-[0.3em] text-zinc-650 sm:text-xs dark:text-zinc-400">LAUNCHPAD PRO</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-zinc-500">{transportTime}</span>
                    <span className="text-[9px] text-zinc-605">{bpm}BPM</span>
                  </div>
                </div>

                {/* Control Panel */}
                <div className="mb-4 space-y-3 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                  {/* Top row: Presets + Transport */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[9px] font-bold text-zinc-500">SONG PRESETS:</span>

                    <div className="flex items-center gap-2">
                      {/* BPM */}
                      <div className="hidden items-center gap-1.5 sm:flex">
                        <span className="text-[8px] text-zinc-500">BPM</span>
                        <input
                          type="range"
                          min={60}
                          max={140}
                          value={bpm}
                          onChange={(e) => handleBpmChange(Number(e.target.value))}
                          className="h-1 w-14 cursor-pointer appearance-none rounded-full bg-zinc-600 accent-primary"
                        />
                      </div>

                      {/* Volume */}
                      <div className="hidden items-center gap-1.5 sm:flex">
                        <Volume2 size={9} className="text-zinc-500" />
                        <input
                          type="range"
                          min={-30}
                          max={0}
                          value={masterVol}
                          onChange={(e) => setMasterVol(Number(e.target.value))}
                          className="h-1 w-12 cursor-pointer appearance-none rounded-full bg-zinc-600 accent-primary"
                        />
                      </div>

                      {/* Transport */}
                      {currentPreset && (
                        <>
                          <m.button
                            whileTap={{ scale: 0.9 }}
                            onClick={togglePause}
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded border shadow-sm transition-colors',
                              isPlaying
                                ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                            )}
                          >
                            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                          </m.button>

                          <m.button
                            whileTap={{ scale: 0.9 }}
                            onClick={stopAllPlayback}
                            className="flex h-7 w-7 items-center justify-center rounded border border-red-300 bg-red-50 text-red-600 shadow-sm dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                          >
                            <Square size={10} />
                          </m.button>
                        </>
                      )}

                      {!currentPreset && (
                        <m.button
                          whileTap={{ scale: 0.9 }}
                          onClick={stopAllPlayback}
                          disabled={loopingPads.size === 0}
                          className={cn(
                            'flex items-center gap-1 rounded border px-2.5 py-1 text-[9px] font-bold transition-all',
                            loopingPads.size > 0
                              ? 'border-red-500 bg-red-500/20 text-red-400 hover:scale-105 hover:bg-red-500/30'
                              : 'cursor-not-allowed border-zinc-700 bg-zinc-900/50 text-zinc-600',
                          )}
                        >
                          <Square className="h-2.5 w-2.5" />
                          STOP ALL
                        </m.button>
                      )}
                    </div>
                  </div>

                  {/* Mobile BPM + Vol */}
                  <div className="flex items-center gap-3 sm:hidden">
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-zinc-500">BPM</span>
                      <input
                        type="range"
                        min={60}
                        max={140}
                        value={bpm}
                        onChange={(e) => handleBpmChange(Number(e.target.value))}
                        className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-zinc-600 accent-primary"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Volume2 size={9} className="text-zinc-500" />
                      <input
                        type="range"
                        min={-30}
                        max={0}
                        value={masterVol}
                        onChange={(e) => setMasterVol(Number(e.target.value))}
                        className="h-1 w-14 cursor-pointer appearance-none rounded-full bg-zinc-600 accent-primary"
                      />
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {presets.map((preset) => (
                      <m.button
                        key={preset.id}
                        onClick={() => playPreset(preset.id)}
                        aria-label={`Load preset ${preset.name}`}
                        className={cn(
                          'group relative overflow-hidden rounded-md border p-1.5 text-left transition-all hover:scale-105',
                          currentPreset === preset.id
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-zinc-600 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800',
                        )}
                        whileTap={{ scale: 0.95 }}
                        title={preset.description}
                      >
                        <div className="relative z-10">
                          <div className="mb-0.5 flex items-center justify-between">
                            <span className={cn('text-[9px] font-bold', currentPreset === preset.id ? 'text-green-400' : 'text-zinc-400 group-hover:text-zinc-300')}>
                              {preset.name.toUpperCase()}
                            </span>
                            {currentPreset === preset.id && (
                              <m.div className="h-1 w-1 rounded-full bg-green-500" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                            )}
                          </div>
                          <p className={cn('text-[7px]', currentPreset === preset.id ? 'text-green-500/80' : 'text-zinc-500 group-hover:text-zinc-400')}>
                            {preset.description}
                          </p>
                        </div>
                        {currentPreset === preset.id && (
                          <m.div className="absolute inset-0 bg-green-500/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                        )}
                      </m.button>
                    ))}
                  </div>

                  {/* Now Playing */}
                  <AnimatePresence>
                    {currentPreset && (
                      <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-1.5 rounded border border-green-500/30 bg-green-500/10 px-2 py-1"
                      >
                        <Music className="h-2.5 w-2.5 text-green-500" />
                        <span className="text-[9px] font-medium text-green-400">
                          Now Playing: {presets.find((p) => p.id === currentPreset)?.name}
                          {isPaused && ' (PAUSED)'}
                        </span>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:block">
                  <LaunchpadGrid items={desktopGrid} cols={8} rows={4} />
                </div>
                {/* Mobile Grid */}
                <div className="md:hidden">
                  <LaunchpadGrid items={mobileGrid} cols={4} rows={6} />
                </div>

                {/* Cable */}
                <div className="-mt-0.5 flex justify-center">
                  <div className="flex h-8 w-20 items-end justify-center rounded-b-xl border-x border-b border-zinc-700 bg-zinc-800 pb-1 shadow-lg sm:h-10 sm:w-28 sm:pb-1.5">
                    <span className="font-mono text-[7px] text-zinc-500 sm:text-[9px]">USB-C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Panel underneath the main interfaces */}
          <div className="mx-auto mt-12 max-w-4xl grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 px-4">
            <a
              href="mailto:adityahimaone@gmail.com"
              className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 hover:border-red-500 group"
            >
              <Mail className="h-8 w-8 text-zinc-650 dark:text-zinc-400 group-hover:text-red-500 transition-colors mb-3" />
              <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">Email</span>
              <span className="mt-1 font-bold text-zinc-800 dark:text-zinc-200 text-xs truncate max-w-full">adityahimaone@gmail.com</span>
            </a>
            <a
              href="https://linkedin.com/in/adityahimaone"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 hover:border-blue-500 group"
            >
              <Linkedin className="h-8 w-8 text-zinc-650 dark:text-zinc-400 group-hover:text-blue-500 transition-colors mb-3" />
              <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">LinkedIn</span>
              <span className="mt-1 font-bold text-zinc-800 dark:text-zinc-200 text-xs">adityahimaone</span>
            </a>
            <a
              href="https://github.com/adityahimaone"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 hover:border-zinc-500 group"
            >
              <Github className="h-8 w-8 text-zinc-650 dark:text-zinc-400 group-hover:text-amber-500 dark:group-hover:text-white transition-colors mb-3" />
              <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">GitHub</span>
              <span className="mt-1 font-bold text-zinc-800 dark:text-zinc-200 text-xs">@adityahimaone</span>
            </a>
            <a
              href="https://drive.google.com/file/d/13Ym0zbrZyi8oOkvUp0r9GBCM_Acsk2XM/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 hover:border-amber-500 group"
            >
              <FileText className="h-8 w-8 text-zinc-650 dark:text-zinc-400 group-hover:text-amber-500 transition-colors mb-3" />
              <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">Resume</span>
              <span className="mt-1 font-bold text-zinc-800 dark:text-zinc-200 text-xs">Curriculum Vitae</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
