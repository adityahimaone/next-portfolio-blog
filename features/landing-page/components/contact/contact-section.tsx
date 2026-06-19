'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { Music, Radio, Square, Play, Pause, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'
import { useAudioEngine } from '@/features/landing-page/spotify/use-audio-engine'
import { functionalPads, dummyColors } from './data/pads'
import { presets } from './data/presets'

export function ContactSection() {
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
              'group relative flex flex-col items-center justify-center overflow-hidden rounded border transition-all duration-100 cursor-pointer',
              pad.type === 'functional' ? 'z-10 shadow-sm' : 'z-0 border-dashed opacity-40',
              isLooping || isActive
                ? 'bg-[#eaeae6] border-zinc-500 dark:bg-[#222] dark:border-zinc-400'
                : 'bg-[#f8f8f6] border-[#d4d4d0] hover:bg-[#eaeae6] dark:bg-[#161616] dark:border-[#27272a] dark:hover:bg-[#202020]'
            )}
            style={{ gridColumn: `span ${pad.w}`, gridRow: `span ${pad.h}` }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Minimal orange tint on active */}
            {(isLooping || isActive) && (
              <div className="absolute inset-0 bg-[#f05523]/5 pointer-events-none" />
            )}

            {/* Content */}
            {pad.type === 'functional' && 'icon' in pad && (
              <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                <pad.icon className={cn('h-5 w-5 transition-colors duration-200 sm:h-7 sm:w-7', isLooping || isActive ? 'text-[#f05523]' : 'text-zinc-500')} />
                <div className="hidden flex-col items-center sm:flex">
                  <span className={cn('font-mono text-[9px] font-bold uppercase transition-colors duration-200', isLooping || isActive ? 'text-zinc-950 dark:text-white' : 'text-zinc-500')}>
                    {(pad as any).label.toLowerCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Micro signal LED */}
            <div className={cn('absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full transition-colors duration-200', isLooping ? 'bg-[#f05523] animate-pulse shadow-[0_0_4px_rgba(240,85,35,0.8)]' : isActive ? 'bg-[#f05523]' : 'bg-[#d8d8d0] dark:bg-zinc-800')} />
          </m.button>
        )
      })}
    </div>
  ), [loopingPads, activePads, handlePadClick])

  return (
    <>
      <section id="contact" className="overflow-hidden py-24 bg-[#f5f5f3] dark:bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="mb-16 flex flex-col items-center text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-2 rounded bg-[#e8e8e4] border border-[#d4d4d0] px-3 py-1 font-mono text-[9px] font-bold text-zinc-600 uppercase tracking-widest dark:bg-[#1a1a1a] dark:border-[#27272a] dark:text-zinc-400"
            >
              <Radio className="h-3 w-3" />
              <span>collaboration console</span>
            </m.div>
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-sans text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white"
            >
              Launch Collaboration
            </m.h2>
            <p className="mt-4 max-w-xl font-mono text-xs text-zinc-500 lowercase tracking-tight">
              click a pad to trigger a module loop. combine signals to calibrate a beat.
            </p>
          </div>

          {/* Braun Control Case */}
          <div className="relative mx-auto max-w-5xl rounded-lg border border-[#d4d4d0] bg-[#f4f4f0] p-6 shadow-xl dark:border-[#27272a] dark:bg-[#121212]">
            <Screw className="absolute top-4 left-4" />
            <Screw className="absolute top-4 right-4" />
            <Screw className="absolute bottom-4 left-4" />
            <Screw className="absolute right-4 bottom-4" />

            {/* Top Status Panel */}
            <div className="mb-6 flex items-center justify-between border-b border-[#e4e4e0] pb-4 px-2 dark:border-[#202020]">
              <div className="flex items-center gap-2">
                <div className={cn('h-1.5 w-1.5 rounded-full', isPlaying ? 'bg-[#f05523] animate-ping' : 'bg-zinc-400')} />
                <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase">rec mode</span>
              </div>
              <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-zinc-800 uppercase dark:text-zinc-300">launchpad console / model-02</span>
              <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-500">
                <span>{transportTime}</span>
                <span className="text-[#d4d4d0]">|</span>
                <span>{bpm} bpm</span>
              </div>
            </div>

            {/* Controls panel */}
            <div className="mb-6 space-y-4 rounded border border-[#d4d4d0] bg-[#eaeae6] p-4 dark:border-[#202020] dark:bg-[#181818]">
              {/* Presets and System Volume */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase">system presets</span>

                <div className="flex items-center gap-4">
                  {/* BPM slider */}
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">bpm</span>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      value={bpm}
                      onChange={(e) => handleBpmChange(Number(e.target.value))}
                      className="h-1 cursor-pointer appearance-none rounded bg-[#d8d8d0] dark:bg-[#2c2c2c] accent-[#f05523] w-20"
                    />
                  </div>

                  {/* Volume slider */}
                  <div className="hidden items-center gap-2 sm:flex">
                    <Volume2 size={10} className="text-zinc-500" />
                    <input
                      type="range"
                      min={-30}
                      max={0}
                      value={masterVol}
                      onChange={(e) => setMasterVol(Number(e.target.value))}
                      className="h-1 cursor-pointer appearance-none rounded bg-[#d8d8d0] dark:bg-[#2c2c2c] accent-[#f05523] w-20"
                    />
                  </div>

                  {/* Playhead controllers */}
                  <div className="flex items-center gap-2">
                    {currentPreset ? (
                      <>
                        <button
                          onClick={togglePause}
                          className={cn(
                            'flex h-7 w-7 cursor-pointer items-center justify-center rounded border transition-all shadow-sm',
                            isPlaying
                              ? 'bg-[#f05523] border-[#c03d15] text-white shadow-inner'
                              : 'bg-white border-[#d4d4d0] text-zinc-700 dark:bg-[#202020] dark:border-[#2c2c2c] dark:text-zinc-300'
                          )}
                        >
                          {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                        </button>

                        <button
                          onClick={stopAllPlayback}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-[#d4d4d0] bg-white text-zinc-600 hover:bg-[#f4f4f0] active:scale-95 dark:border-[#27272a] dark:bg-[#1a1a1a] dark:text-zinc-400"
                        >
                          <Square size={8} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={stopAllPlayback}
                        disabled={loopingPads.size === 0}
                        className={cn(
                          'flex items-center gap-1.5 rounded border px-3 py-1.5 font-mono text-[9px] font-bold transition-all cursor-pointer',
                          loopingPads.size > 0
                            ? 'border-[#c03d15] bg-[#f05523] text-white shadow-sm'
                            : 'cursor-not-allowed border-[#d4d4d0] bg-[#f8f8f6] text-zinc-400 dark:border-[#27272a] dark:bg-[#161616]'
                        )}
                      >
                        <Square className="h-2.5 w-2.5" />
                        <span>stop signals</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => playPreset(preset.id)}
                    aria-label={`Load preset ${preset.name}`}
                    className={cn(
                      'group relative overflow-hidden rounded border p-2.5 text-left transition-all cursor-pointer',
                      currentPreset === preset.id
                        ? 'border-[#f05523] bg-[#eaeae6] dark:bg-[#222]'
                        : 'border-[#d4d4d0] bg-[#f8f8f6] hover:bg-[#eaeae6] dark:border-[#27272a] dark:bg-[#161616] dark:hover:bg-[#202020]'
                    )}
                  >
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="mb-1 flex items-center justify-between">
                        <span className={cn('font-mono text-[9px] font-bold uppercase', currentPreset === preset.id ? 'text-[#f05523]' : 'text-zinc-600 dark:text-zinc-400')}>
                          {preset.name.toLowerCase()}
                        </span>
                        {currentPreset === preset.id && (
                          <div className="h-1.5 w-1.5 rounded-full bg-[#f05523]" />
                        )}
                      </div>
                      <p className="font-mono text-[8px] text-zinc-500 lowercase leading-tight">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Status display */}
              <AnimatePresence>
                {currentPreset && (
                  <m.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 rounded border border-[#d4d4d0] bg-white px-3 py-1.5 dark:border-[#2c2c2c] dark:bg-[#1a1a1a]"
                  >
                    <Music className="h-3 w-3 text-[#f05523]" />
                    <span className="font-mono text-[9px] font-bold text-zinc-600 uppercase dark:text-zinc-400">
                      active calibration: {presets.find((p) => p.id === currentPreset)?.name.toLowerCase()}
                      {isPaused && ' (suspended)'}
                    </span>
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Launchpad */}
            <div className="hidden md:block">
              <LaunchpadGrid items={desktopGrid} cols={8} rows={4} />
            </div>
            {/* Mobile Launchpad */}
            <div className="md:hidden">
              <LaunchpadGrid items={mobileGrid} cols={4} rows={6} />
            </div>

            {/* Bottom socket (USB port decoration) */}
            <div className="-mt-0.5 flex justify-center">
              <div className="flex h-8 w-24 items-end justify-center rounded-b border-x border-b border-[#d4d4d0] bg-[#f8f8f6] pb-1 shadow-sm sm:h-10 sm:w-28 sm:pb-2 dark:border-[#27272a] dark:bg-[#161616]">
                <span className="font-mono text-[7px] font-bold tracking-wider text-zinc-500 uppercase">system-c</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
