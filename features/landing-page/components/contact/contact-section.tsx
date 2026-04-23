'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { Music, Radio, Square, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'
import { useAudioEngine } from '@/features/landing-page/spotify/use-audio-engine'
import { functionalPads, dummyColors } from './data/pads'
import { presets } from './data/presets'

export function ContactSection() {
  const [activePad, setActivePad] = useState<string | null>(null)
  const [playingPads, setPlayingPads] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [currentPreset, setCurrentPreset] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const { toneRef, startAudio, isLoaded } = useAudioEngine()

  const synthsRef = useRef<Record<string, any>>({})
  const partRef = useRef<any>(null)
  const isInitializedRef = useRef(false)
  const padTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // ─── Initialize Synths ──────────────────────────────────────────
  const initializeSynths = useCallback(async () => {
    if (isInitializedRef.current || !toneRef.current) return
    const Tone = toneRef.current

    try {
      const melody = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.3 },
      }).toDestination()
      melody.volume.value = -4

      const chord = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.6 },
      }).toDestination()
      chord.volume.value = -6

      const bass = new Tone.MonoSynth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
        filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
      }).toDestination()
      bass.volume.value = -2

      const padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.3, decay: 0.3, sustain: 0.5, release: 1.2 },
      }).toDestination()
      padSynth.volume.value = -12

      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
      }).toDestination()
      kick.volume.value = -2

      const snare = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.2, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      }).toDestination()
      snare.volume.value = -6

      const hihat = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.08, sustain: 0 },
      }).toDestination()
      hihat.volume.value = -12

      const clap = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.15, release: 0.05 },
        harmonicity: 3,
        modulationIndex: 20,
        resonance: 3000,
        octaves: 1,
      }).toDestination()
      clap.volume.value = -8

      synthsRef.current = {
        melody, synth: melody, chord, bass,
        pad: padSynth, kick, snare, hihat, clap,
      }
      isInitializedRef.current = true
    } catch (e) {
      console.error('Failed to initialize synths:', e)
    }
  }, [toneRef])

  // Cleanup
  useEffect(() => {
    return () => {
      stopAllPlayback()
      Object.values(synthsRef.current).forEach((s) => s?.dispose?.())
      synthsRef.current = {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── One-shot Pad Trigger ───────────────────────────────────────
  const triggerPad = useCallback(async (
    padId: string,
    note?: string,
    synthType?: string,
    _rhythm?: string,
  ) => {
    const audioStarted = await startAudio()
    if (!audioStarted || !isLoaded) return
    await initializeSynths()

    const Tone = toneRef.current
    if (!Tone || !isInitializedRef.current) return

    const type = synthType || 'melody'
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
    const finalNote = note || notes[padId.length % notes.length]

    const synth = synthsRef.current[type]
    if (!synth) return

    // Visual feedback
    setPlayingPads((prev) => new Set(prev).add(padId))
    setActivePad(padId)

    const clearVisual = () => {
      setPlayingPads((prev) => {
        const n = new Set(prev)
        n.delete(padId)
        return n
      })
      setActivePad((curr) => (curr === padId ? null : curr))
    }

    if (['kick', 'snare', 'clap'].includes(type)) {
      synth.triggerAttackRelease(finalNote, '8n')
      padTimeoutsRef.current.set(padId, setTimeout(clearVisual, 150))
    } else if (type === 'hihat') {
      synth.triggerAttackRelease('16n')
      padTimeoutsRef.current.set(padId, setTimeout(clearVisual, 80))
    } else if (type === 'chord' || type === 'pad') {
      const chordNotes = [finalNote, Tone.Frequency(finalNote).transpose(4), Tone.Frequency(finalNote).transpose(7)]
      synth.triggerAttackRelease(chordNotes, '4n')
      padTimeoutsRef.current.set(padId, setTimeout(clearVisual, 300))
    } else {
      synth.triggerAttackRelease(finalNote, '8n')
      padTimeoutsRef.current.set(padId, setTimeout(clearVisual, 200))
    }
  }, [startAudio, isLoaded, initializeSynths, toneRef])

  // ─── Preset Playback (Tone.Part + Transport) ────────────────────
  const playPreset = useCallback(async (presetId: string) => {
    // Stop any existing playback first
    stopAllPlayback()

    const preset = presets.find((p) => p.id === presetId)
    if (!preset) return

    const audioStarted = await startAudio()
    if (!audioStarted || !isLoaded) return
    await initializeSynths()

    const Tone = toneRef.current
    if (!Tone || !isInitializedRef.current) return

    // Clear previous part
    if (partRef.current) {
      partRef.current.dispose()
      partRef.current = null
    }

    // Reset transport
    Tone.Transport.stop()
    Tone.Transport.position = 0
    Tone.Transport.cancel()

    // Build events array: [timeInSeconds, eventData]
    const events = preset.pads.map((pad) => [
      pad.delay / 1000,
      pad,
    ])

    // Create Part
    const part = new Tone.Part((time: number, event: any) => {
      const synth = synthsRef.current[event.type]
      if (!synth) return

      const dur = event.duration || '8n'

      if (event.type === 'hihat') {
        synth.triggerAttackRelease(dur, time)
      } else if (['kick', 'snare', 'clap'].includes(event.type)) {
        synth.triggerAttackRelease(event.note, dur, time)
      } else if (event.type === 'chord' || event.type === 'pad') {
        const chordNotes = [event.note, Tone.Frequency(event.note).transpose(4), Tone.Frequency(event.note).transpose(7)]
        synth.triggerAttackRelease(chordNotes, dur, time)
      } else {
        synth.triggerAttackRelease(event.note, dur, time)
      }

      // Visual feedback synced to audio
      Tone.Draw.schedule(() => {
        setActivePad(event.id)
        setPlayingPads((prev) => new Set(prev).add(event.id))

        // For melody notes, auto-clear visual after short duration
        if ((preset as any).isMelody) {
          setTimeout(() => {
            setActivePad(null)
            setPlayingPads((prev) => {
              const n = new Set(prev)
              n.delete(event.id)
              return n
            })
          }, 200)
        }
      }, time)
    }, events)

    part.start(0)
    partRef.current = part

    Tone.Transport.start()
    setCurrentPreset(presetId)
    setIsPlaying(true)
    setIsPaused(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAudio, isLoaded, initializeSynths, toneRef])

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
    // Clear all visual timeouts
    padTimeoutsRef.current.forEach((t) => clearTimeout(t))
    padTimeoutsRef.current.clear()

    setPlayingPads(new Set())
    setActivePad(null)
    setCurrentPreset(null)
    setIsPlaying(false)
    setIsPaused(false)
  }, [toneRef])

  // ─── Pause / Resume ─────────────────────────────────────────────
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

  // ─── Transport Position UI ──────────────────────────────────────
  const [transportTime, setTransportTime] = useState('0:00')
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!isPlaying && !isPaused) return

    const updateTime = () => {
      const Tone = toneRef.current
      if (Tone) {
        const pos = Tone.Transport.position
        const [bars, beats] = pos.toString().split(':').map(Number)
        setTransportTime(`${bars || 0}:${String(Math.floor(beats || 0)).padStart(2, '0')}`)
      }
      rafRef.current = requestAnimationFrame(updateTime)
    }
    rafRef.current = requestAnimationFrame(updateTime)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, isPaused, toneRef])

  // ─── Handle Pad Click ───────────────────────────────────────────
  const handlePadClick = useCallback(async (pad: any) => {
    // Functional pads (email, github, etc.)
    if (!pad.id.startsWith('dummy')) {
      // Trigger one-shot sound
      await triggerPad(pad.id, undefined, pad.id === 'email' ? 'chord' : 'melody')

      // Execute action
      if (pad.action === 'copy' && pad.value) {
        navigator.clipboard.writeText(pad.value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else if (pad.href) {
        window.open(pad.href, '_blank')
      }
      return
    }

    // Dummy pads → one-shot drum/melody
    const typePool = ['kick', 'snare', 'hihat', 'clap', 'melody', 'bass']
    const notePool = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4']
    const type = typePool[(pad.x + pad.y) % typePool.length]
    const note = notePool[(pad.x * 3 + pad.y) % notePool.length]

    await triggerPad(pad.id, note, type)
  }, [triggerPad])

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
      {items.map((pad) => (
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
          {/* Glow */}
          <div className={cn('absolute inset-0 z-0 transition-opacity duration-150', pad.color, activePad === pad.id || playingPads.has(pad.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')} />

          {/* Content */}
          {pad.type === 'functional' && 'icon' in pad && (
            <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
              <pad.icon className={cn('h-5 w-5 transition-colors duration-200 sm:h-8 sm:w-8', activePad === pad.id || playingPads.has(pad.id) ? 'text-white' : 'text-zinc-500')} />
              <div className="hidden flex-col items-center sm:flex">
                <span className={cn('text-[10px] font-bold tracking-wider transition-colors duration-200 sm:text-xs', activePad === pad.id || playingPads.has(pad.id) ? 'text-white' : 'text-zinc-400')}>
                  {pad.id === 'copy' && copied ? 'COPIED!' : (pad as any).label}
                </span>
                {(pad as any).subLabel && (
                  <span className={cn('font-mono text-[8px] transition-colors duration-200 sm:text-[10px]', activePad === pad.id || playingPads.has(pad.id) ? 'text-white/80' : 'text-zinc-600')}>
                    {(pad as any).subLabel}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* LED */}
          <div className={cn('absolute top-1 right-1 h-1 w-1 rounded-full transition-colors duration-200 sm:top-2 sm:right-2 sm:h-1.5 sm:w-1.5', activePad === pad.id || playingPads.has(pad.id) ? 'bg-white' : 'bg-zinc-900')} />
        </m.button>
      ))}
    </div>
  ), [activePad, playingPads, copied, handlePadClick])

  return (
    <>
      <section id="contact" className="overflow-hidden py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 flex flex-col items-center text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-2 rounded-full bg-zinc-200/50 px-4 py-1.5 text-sm font-medium text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400"
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
              Launch Collaboration
            </m.h2>
            <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Hit a pad to start a conversation.
            </p>
          </div>

          {/* Launchpad Board */}
          <div className="relative mx-auto max-w-6xl rounded-3xl bg-zinc-800 p-2 shadow-2xl sm:p-4 dark:bg-zinc-950">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />

            <div className="relative rounded-2xl border border-zinc-700 bg-zinc-900 p-4 shadow-inner sm:p-6 md:p-10">
              <Screw className="absolute top-2 left-2 sm:top-4 sm:left-4" />
              <Screw className="absolute top-2 right-2 sm:top-4 sm:right-4" />
              <Screw className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4" />
              <Screw className="absolute right-2 bottom-2 sm:right-4 sm:bottom-4" />

              {/* Branding */}
              <div className="mb-4 flex items-center justify-between px-2 sm:mb-8">
                <div className="flex items-center gap-2">
                  <div className={cn('h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2', isPlaying ? 'animate-pulse bg-red-500' : 'bg-zinc-600')} />
                  <span className="font-mono text-[10px] tracking-widest text-zinc-500 sm:text-xs">REC</span>
                </div>
                <span className="text-[10px] font-black tracking-[0.3em] text-zinc-600 sm:text-xs dark:text-zinc-400">LAUNCHPAD PRO</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-500">{transportTime}</span>
                </div>
              </div>

              {/* Control Panel */}
              <div className="mb-4 space-y-3 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-zinc-500">SONG PRESETS:</span>

                  {/* Transport Controls */}
                  <div className="flex items-center gap-2">
                    {currentPreset && (
                      <>
                        <m.button
                          whileTap={{ scale: 0.9 }}
                          onClick={togglePause}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded border shadow-sm transition-colors',
                            isPlaying
                              ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                              : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                          )}
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </m.button>

                        <m.button
                          whileTap={{ scale: 0.9 }}
                          onClick={stopAllPlayback}
                          className="flex h-8 w-8 items-center justify-center rounded border border-red-300 bg-red-50 text-red-600 shadow-sm dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                        >
                          <Square size={12} />
                        </m.button>
                      </>
                    )}

                    {!currentPreset && (
                      <m.button
                        whileTap={{ scale: 0.9 }}
                        onClick={stopAllPlayback}
                        disabled={playingPads.size === 0 && !activePad}
                        className={cn(
                          'flex items-center gap-1.5 rounded border px-3 py-1.5 text-[10px] font-bold transition-all',
                          playingPads.size > 0 || activePad
                            ? 'border-red-500 bg-red-500/20 text-red-400 hover:scale-105 hover:bg-red-500/30'
                            : 'cursor-not-allowed border-zinc-700 bg-zinc-900/50 text-zinc-600',
                        )}
                      >
                        <Square className="h-3 w-3" />
                        STOP ALL
                      </m.button>
                    )}
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {presets.map((preset) => (
                    <m.button
                      key={preset.id}
                      onClick={() => playPreset(preset.id)}
                      aria-label={`Load preset ${preset.name}`}
                      className={cn(
                        'group relative overflow-hidden rounded-lg border p-2 text-left transition-all hover:scale-105',
                        currentPreset === preset.id
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-zinc-600 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800',
                      )}
                      whileTap={{ scale: 0.95 }}
                      title={preset.description}
                    >
                      <div className="relative z-10">
                        <div className="mb-1 flex items-center justify-between">
                          <span className={cn('text-[10px] font-bold', currentPreset === preset.id ? 'text-green-400' : 'text-zinc-400 group-hover:text-zinc-300')}>
                            {preset.name.toUpperCase()}
                          </span>
                          {currentPreset === preset.id && (
                            <m.div className="h-1.5 w-1.5 rounded-full bg-green-500" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                          )}
                        </div>
                        <p className={cn('text-[8px]', currentPreset === preset.id ? 'text-green-500/80' : 'text-zinc-500 group-hover:text-zinc-400')}>
                          {preset.description}
                        </p>
                      </div>
                      {currentPreset === preset.id && (
                        <m.div className="absolute inset-0 bg-green-500/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                      )}
                    </m.button>
                  ))}
                </div>

                {/* Now Playing Indicator */}
                <AnimatePresence>
                  {currentPreset && (
                    <m.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 rounded border border-green-500/30 bg-green-500/10 px-3 py-1.5"
                    >
                      <Music className="h-3 w-3 text-green-500" />
                      <span className="text-[10px] font-medium text-green-400">
                        Now Playing: {presets.find((p) => p.id === currentPreset)?.name}
                        {isPaused && ' (PAUSED)'}
                      </span>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Grids */}
              <div className="hidden md:block">
                <LaunchpadGrid items={desktopGrid} cols={8} rows={4} />
              </div>
              <div className="md:hidden">
                <LaunchpadGrid items={mobileGrid} cols={4} rows={6} />
              </div>

              {/* Cable */}
              <div className="-mt-0.5 flex justify-center">
                <div className="flex h-8 w-24 items-end justify-center rounded-b-xl border-x border-b border-zinc-700 bg-zinc-800 pb-1 shadow-lg sm:h-12 sm:w-32 sm:pb-2">
                  <span className="font-mono text-[8px] text-zinc-500 sm:text-[10px]">USB-C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
