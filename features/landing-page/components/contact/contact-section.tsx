'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { LazyMotion, domMax, m } from 'motion/react'
import { Music, Radio, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'
import { useAudioEngine } from '@/features/landing-page/spotify/use-audio-engine'
import { functionalPads, dummyColors } from './data/pads'
import { presets } from './data/presets'

export function ContactSection() {
  const [activePad, setActivePad] = useState<string | null>(null)
  const [activeLoops, setActiveLoops] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [currentPreset, setCurrentPreset] = useState<string | null>(null)

  // Audio Engine (Lazy Loaded)
  const { toneRef, startAudio, isLoaded } = useAudioEngine()

  // Audio Refs - Store instances, don't trigger re-renders
  const synthsRef = useRef<Record<string, any>>({})
  const loopsRef = useRef<Map<string, any>>(new Map())
  const isInitializedRef = useRef(false)

  // Initialize Synths (Only after Tone.js is loaded)
  const initializeSynths = useCallback(async () => {
    if (isInitializedRef.current || !toneRef.current) return

    const Tone = toneRef.current

    try {
      // Synth for melodies and leads
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 1 },
      }).toDestination()

      // PolySynth for chords
      const polySynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 },
      }).toDestination()

      // Bass synth
      const bass = new Tone.MonoSynth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 1.2 },
        filterEnvelope: {
          attack: 0.05,
          decay: 0.3,
          sustain: 0.4,
          release: 1.2,
        },
      }).toDestination()

      // Pad synth for ambient sounds
      const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 1, decay: 0.5, sustain: 0.7, release: 2 },
      }).toDestination()
      pad.volume.value = -10

      // Membrane for kicks
      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
      }).toDestination()

      // Metal for snares
      const snare = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.2, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      }).toDestination()
      snare.volume.value = -5

      // Noise for hi-hats
      const hihat = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
      }).toDestination()
      hihat.volume.value = -10

      // Metal for claps
      const clap = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.15, release: 0.05 },
        harmonicity: 3,
        modulationIndex: 20,
        resonance: 3000,
        octaves: 1,
      }).toDestination()
      clap.volume.value = -8

      synthsRef.current = {
        melody: synth,
        synth: synth,
        chord: polySynth,
        bass: bass,
        pad: pad,
        kick: kick,
        snare: snare,
        hihat: hihat,
        clap: clap,
      }
      isInitializedRef.current = true
    } catch (error) {
      console.error('Failed to initialize synths:', error)
    }
  }, [toneRef])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      loopsRef.current.forEach((loop) => loop?.dispose?.())
      Object.values(synthsRef.current).forEach((synth) => synth?.dispose?.())
    }
  }, [])

  const toggleLoop = useCallback(
    (
      padId: string,
      x: number,
      y: number,
      note?: string,
      synthType?: string,
      rhythm?: string,
    ) => {
      if (!toneRef.current || !isInitializedRef.current) return

      const Tone = toneRef.current

      // Check current state from ref to avoid stale closure
      const isCurrentlyActive = loopsRef.current.has(padId)

      if (isCurrentlyActive) {
        // Stop Loop
        const loop = loopsRef.current.get(padId)
        if (loop) {
          loop.stop()
          loop.dispose()
          loopsRef.current.delete(padId)
        }
        setActiveLoops((prev) => {
          const newLoops = new Set(prev)
          newLoops.delete(padId)
          return newLoops
        })
      } else {
        // Start Loop - Update state immediately
        setActiveLoops((prev) => {
          const newLoops = new Set(prev)
          newLoops.add(padId)
          return newLoops
        })

        // Use provided note or fallback to coordinate-based
        const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
        const finalNote = note || notes[(x + y) % notes.length]
        const finalRhythm = rhythm || `${(x % 4) + 1}n`
        const finalType =
          synthType || (y % 3 === 0 ? 'kick' : y % 3 === 1 ? 'melody' : 'hihat')

        let loop: any
        const synth = synthsRef.current[finalType]

        if (!synth) {
          // If synth doesn't exist, remove from active loops
          setActiveLoops((prev) => {
            const newLoops = new Set(prev)
            newLoops.delete(padId)
            return newLoops
          })
          return
        }

        // Different trigger methods for different synth types
        if (['kick', 'snare', 'clap'].includes(finalType)) {
          loop = new Tone.Loop((time: number) => {
            synth.triggerAttackRelease(finalNote, '8n', time)
          }, finalRhythm).start(0)
        } else if (finalType === 'hihat') {
          loop = new Tone.Loop((time: number) => {
            synth.triggerAttackRelease('8n', time)
          }, finalRhythm).start(0)
        } else if (finalType === 'chord' || finalType === 'pad') {
          // For chords, play multiple notes
          const chordNotes = [
            finalNote,
            Tone.Frequency(finalNote).transpose(4),
            Tone.Frequency(finalNote).transpose(7),
          ]
          loop = new Tone.Loop((time: number) => {
            synth.triggerAttackRelease(chordNotes, '4n', time)
          }, finalRhythm).start(0)
        } else {
          // Melody, synth, bass
          loop = new Tone.Loop((time: number) => {
            synth.triggerAttackRelease(finalNote, '8n', time)
          }, finalRhythm).start(0)
        }

        loopsRef.current.set(padId, loop)
      }
    },
    [toneRef],
  )

  const handlePadClick = useCallback(
    async (pad: any) => {
      // OPTIMISTIC UI: Visual feedback FIRST (0ms latency)
      setActivePad(pad.id)
      setTimeout(() => setActivePad(null), 200)

      // THEN: Load audio lazily if needed
      const audioStarted = await startAudio()
      if (audioStarted && isLoaded) {
        await initializeSynths()
        toggleLoop(pad.id, pad.x, pad.y)
      }

      // Functional Actions
      if (!pad.id.startsWith('dummy')) {
        if (pad.action === 'copy' && pad.value) {
          navigator.clipboard.writeText(pad.value)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } else if (pad.href) {
          window.open(pad.href, '_blank')
        }
      }
    },
    [startAudio, isLoaded, initializeSynths, toggleLoop],
  )

  // Clear all active loops
  const clearAllLoops = useCallback(() => {
    loopsRef.current.forEach((loop) => {
      loop?.stop()
      loop?.dispose()
    })
    loopsRef.current.clear()
    setActiveLoops(new Set())
    setCurrentPreset(null)
  }, [])

  // Generate Grids (Memoized for performance)
  const { desktopGrid, mobileGrid } = useMemo(() => {
    const generateGridItems = (
      rows: number,
      cols: number,
      isMobile: boolean,
    ) => {
      const items = []
      const occupied = new Set<string>()

      // Mark occupied cells
      functionalPads.forEach((pad) => {
        const config = isMobile ? pad.mobile : pad
        for (let i = 0; i < config.w; i++) {
          for (let j = 0; j < config.h; j++) {
            occupied.add(`${config.x + i},${config.y + j}`)
          }
        }
      })

      // Build grid items
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (occupied.has(`${x},${y}`)) {
            const pad = functionalPads.find((p) => {
              const config = isMobile ? p.mobile : p
              return (
                x >= config.x &&
                x < config.x + config.w &&
                y >= config.y &&
                y < config.y + config.h
              )
            })
            if (
              pad &&
              (isMobile
                ? pad.mobile.x === x && pad.mobile.y === y
                : pad.x === x && pad.y === y)
            ) {
              items.push({
                ...pad,
                type: 'functional',
                w: isMobile ? pad.mobile.w : pad.w,
                h: isMobile ? pad.mobile.h : pad.h,
              })
            }
          } else {
            items.push({
              id: `dummy-${x}-${y}`,
              x,
              y,
              w: 1,
              h: 1,
              type: 'dummy',
              color: dummyColors[(x + y) % dummyColors.length],
            })
          }
        }
      }
      return items
    }

    return {
      desktopGrid: generateGridItems(4, 8, false),
      mobileGrid: generateGridItems(6, 4, true),
    }
  }, []) // Empty deps - static data

  // Load preset pattern (defined after grids are available)
  const loadPreset = useCallback(
    async (presetId: string) => {
      // Clear existing loops first
      clearAllLoops()

      const preset = presets.find((p) => p.id === presetId)
      if (!preset) return

      // Start audio if needed
      const audioStarted = await startAudio()
      if (!audioStarted || !isLoaded) return

      await initializeSynths()

      // Check if this is a melody preset (single notes, not loops)
      const isMelodyPreset = (preset as any).isMelody === true

      if (isMelodyPreset) {
        // For melody presets: play single notes with visual feedback
        preset.pads.forEach((padConfig) => {
          setTimeout(() => {
            const allItems = [...desktopGrid, ...mobileGrid]
            const gridPad = allItems.find((item) => item.id === padConfig.id)
            if (gridPad && toneRef.current) {
              const Tone = toneRef.current
              const synth = synthsRef.current[padConfig.type]

              if (synth) {
                // Visual feedback ON
                setActivePad(padConfig.id)
                setActiveLoops((prev) => {
                  const newLoops = new Set(prev)
                  newLoops.add(padConfig.id)
                  return newLoops
                })

                // Play single note
                const duration = (padConfig as any).duration || '4n'
                synth.triggerAttackRelease(padConfig.note, duration)

                // Visual feedback OFF after note duration
                setTimeout(() => {
                  setActiveLoops((prev) => {
                    const newLoops = new Set(prev)
                    newLoops.delete(padConfig.id)
                    return newLoops
                  })
                  setActivePad(null)
                }, 350) // Note duration
              }
            }
          }, padConfig.delay)
        })
      } else {
        // For loop presets: use toggleLoop as before
        preset.pads.forEach((padConfig) => {
          setTimeout(() => {
            const allItems = [...desktopGrid, ...mobileGrid]
            const gridPad = allItems.find((item) => item.id === padConfig.id)
            if (gridPad) {
              toggleLoop(
                padConfig.id,
                gridPad.x,
                gridPad.y,
                padConfig.note,
                padConfig.type,
                (padConfig as any).rhythm,
              )
            }
          }, padConfig.delay)
        })
      }

      setCurrentPreset(presetId)
    },
    [
      clearAllLoops,
      startAudio,
      isLoaded,
      initializeSynths,
      toggleLoop,
      desktopGrid,
      mobileGrid,
      toneRef,
    ],
  )

  const LaunchpadGrid = useCallback(
    ({ items, cols, rows }: { items: any[]; cols: number; rows: number }) => (
      <div
        className="grid gap-2 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          aspectRatio: `${cols}/${rows}`,
        }}
      >
        {items.map((pad) => (
          <m.button
            key={pad.id}
            onClick={() => handlePadClick(pad)}
            aria-label={pad.type === 'functional' && 'label' in pad ? `Pad ${(pad as any).label}` : `Empty Pad ${pad.id}`}
            className={cn(
              'group relative flex flex-col items-center justify-center overflow-hidden rounded-md border-b-4 border-zinc-950 bg-zinc-800 transition-all duration-100 active:translate-y-1 active:scale-95 active:border-b-0 sm:rounded-lg',
              pad.type === 'functional' ? 'z-10' : 'z-0',
            )}
            style={{
              gridColumn: `span ${pad.w}`,
              gridRow: `span ${pad.h}`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Active/Hover State Glow */}
            <div
              className={cn(
                'absolute inset-0 z-0 transition-opacity duration-200',
                pad.color,
                activePad === pad.id || activeLoops.has(pad.id)
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100',
              )}
            />

            {/* Content (Only for functional pads) */}
            {pad.type === 'functional' && 'icon' in pad && (
              <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                <pad.icon
                  className={cn(
                    'h-5 w-5 transition-colors duration-200 sm:h-8 sm:w-8',
                    activePad === pad.id ||
                      activeLoops.has(pad.id) ||
                      'group-hover:text-white'
                      ? 'text-white'
                      : 'text-zinc-500',
                    pad.id === 'copy' && copied ? 'text-green-500' : '',
                  )}
                />
                <div className="hidden flex-col items-center sm:flex">
                  <span
                    className={cn(
                      'text-[10px] font-bold tracking-wider transition-colors duration-200 sm:text-xs',
                      activePad === pad.id ||
                        activeLoops.has(pad.id) ||
                        'group-hover:text-white'
                        ? 'text-white'
                        : 'text-zinc-400',
                    )}
                  >
                    {pad.id === 'copy' && copied
                      ? 'COPIED!'
                      : (pad as any).label}
                  </span>
                  {(pad as any).subLabel && (
                    <span
                      className={cn(
                        'font-mono text-[8px] transition-colors duration-200 sm:text-[10px]',
                        activePad === pad.id ||
                          activeLoops.has(pad.id) ||
                          'group-hover:text-white/80'
                          ? 'text-white/80'
                          : 'text-zinc-600',
                      )}
                    >
                      {(pad as any).subLabel}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Corner LED (All pads) */}
            <div
              className={cn(
                'absolute top-1 right-1 h-1 w-1 rounded-full transition-colors duration-200 sm:top-2 sm:right-2 sm:h-1.5 sm:w-1.5',
                activePad === pad.id ||
                  activeLoops.has(pad.id) ||
                  'group-hover:bg-white'
                  ? 'bg-white'
                  : 'bg-zinc-900',
              )}
            />
          </m.button>
        ))}
      </div>
    ),
    [activePad, activeLoops, copied, handlePadClick],
  )

  return (
    <LazyMotion features={domMax}>
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

          {/* The Launchpad Board */}
          <div className="relative mx-auto max-w-6xl rounded-3xl bg-zinc-800 p-2 shadow-2xl sm:p-4 dark:bg-zinc-950">
            {/* Metallic Texture Overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />

            {/* Inner Casing */}
            <div className="relative rounded-2xl border border-zinc-700 bg-zinc-900 p-4 shadow-inner sm:p-6 md:p-10">
              {/* Screws */}
              <Screw className="absolute top-2 left-2 sm:top-4 sm:left-4" />
              <Screw className="absolute top-2 right-2 sm:top-4 sm:right-4" />
              <Screw className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4" />
              <Screw className="absolute right-2 bottom-2 sm:right-4 sm:bottom-4" />

              {/* Top Panel: Branding */}
              <div className="mb-4 flex items-center justify-between px-2 sm:mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 sm:h-2 sm:w-2" />
                  <span className="font-mono text-[10px] tracking-widest text-zinc-500 sm:text-xs">
                    REC
                  </span>
                </div>
                <span className="text-[10px] font-black tracking-[0.3em] text-zinc-600 sm:text-xs dark:text-zinc-400">
                  LAUNCHPAD PRO
                </span>
              </div>

              {/* Control Panel: Presets & Clear */}
              <div className="mb-4 space-y-3 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-zinc-500">
                    SONG PRESETS:
                  </span>
                  <m.button
                    onClick={clearAllLoops}
                    disabled={activeLoops.size === 0}
                    aria-label="Stop All Loops"
                    className={cn(
                      'flex items-center gap-1.5 rounded border px-3 py-1 text-[10px] font-bold transition-all',
                      activeLoops.size > 0
                        ? 'border-red-500 bg-red-500/20 text-red-400 hover:scale-105 hover:bg-red-500/30'
                        : 'cursor-not-allowed border-zinc-700 bg-zinc-900/50 text-zinc-600',
                    )}
                    whileTap={activeLoops.size > 0 ? { scale: 0.95 } : {}}
                  >
                    <Square className="h-3 w-3" />
                    STOP ALL
                  </m.button>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {presets.map((preset) => (
                    <m.button
                      key={preset.id}
                      onClick={() => loadPreset(preset.id)}
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
                          <span
                            className={cn(
                              'text-[10px] font-bold',
                              currentPreset === preset.id
                                ? 'text-green-400'
                                : 'text-zinc-400 group-hover:text-zinc-300',
                            )}
                          >
                            {preset.name.toUpperCase()}
                          </span>
                          {currentPreset === preset.id && (
                            <m.div
                              className="h-1.5 w-1.5 rounded-full bg-green-500"
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </div>
                        <p
                          className={cn(
                            'text-[8px]',
                            currentPreset === preset.id
                              ? 'text-green-500/80'
                              : 'text-zinc-500 group-hover:text-zinc-400',
                          )}
                        >
                          {preset.description}
                        </p>
                      </div>
                      {currentPreset === preset.id && (
                        <m.div
                          className="absolute inset-0 bg-green-500/10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </m.button>
                  ))}
                </div>

                {currentPreset && (
                  <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded border border-green-500/30 bg-green-500/10 px-3 py-1.5"
                  >
                    <Music className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] font-medium text-green-400">
                      Now Playing:{' '}
                      {presets.find((p) => p.id === currentPreset)?.name}
                    </span>
                  </m.div>
                )}
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:block">
                <LaunchpadGrid items={desktopGrid} cols={8} rows={4} />
              </div>

              {/* Mobile Grid */}
              <div className="md:hidden">
                <LaunchpadGrid items={mobileGrid} cols={4} rows={6} />
              </div>

              {/* Cable decoration */}
              <div className="-mt-0.5 flex justify-center">
                <div className="flex h-8 w-24 items-end justify-center rounded-b-xl border-x border-b border-zinc-700 bg-zinc-800 pb-1 shadow-lg sm:h-12 sm:w-32 sm:pb-2">
                  <span className="font-mono text-[8px] text-zinc-500 sm:text-[10px]">
                    USB-C
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  )
}
