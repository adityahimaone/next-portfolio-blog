'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { m, useInView } from 'motion/react'
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

  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  const synthsRef = useRef<Record<string, any>>({})
  const padLoopsRef = useRef<Map<string, any>>(new Map())
  const partRef = useRef<any>(null)
  const isInitializedRef = useRef(false)
  const masterVolRef = useRef<any>(null)
  const rafRef = useRef<number>(0)
  const activeTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

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

  // ─── Initialize Synths ──────────────────────────────────────────
  const initializeSynths = useCallback(async () => {
    if (isInitializedRef.current || !toneRef.current) return
    const Tone = toneRef.current

    try {
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

    const typePool = ['kick', 'snare', 'hihat', 'clap', 'melody', 'bass']
    const notePool = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4']
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']

    let type: string
    let note: string
    let interval: string
    let duration: string

    if (pad.type === 'functional') {
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

    const events: any[] = []

    if (preset.events && preset.events.length > 0) {
      preset.events.forEach((evt) => {
        events.push([evt.time, evt])
      })
    } else if (preset.pads && preset.pads.length > 0) {
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
    await togglePadLoop(pad)
    if (!pad.id.startsWith('dummy')) {
      if (pad.href) {
        window.open(pad.href, '_blank')
      }
    }
  }, [togglePadLoop])

  // ─── Keyboard shortcuts: QWERTY layout maps to port grid ────────
  useEffect(() => {
    const keyMap: Record<string, { x: number; y: number }> = {
      '1': { x: 0, y: 0 }, '2': { x: 1, y: 0 }, '3': { x: 2, y: 0 }, '4': { x: 3, y: 0 },
      '5': { x: 4, y: 0 }, '6': { x: 5, y: 0 }, '7': { x: 6, y: 0 }, '8': { x: 7, y: 0 },
      'q': { x: 0, y: 1 }, 'w': { x: 1, y: 1 }, 'e': { x: 2, y: 1 }, 'r': { x: 3, y: 1 },
      't': { x: 4, y: 1 }, 'y': { x: 5, y: 1 }, 'u': { x: 6, y: 1 }, 'i': { x: 7, y: 1 },
      'a': { x: 0, y: 2 }, 's': { x: 1, y: 2 }, 'd': { x: 2, y: 2 }, 'f': { x: 3, y: 2 },
      'g': { x: 4, y: 2 }, 'h': { x: 5, y: 2 }, 'j': { x: 6, y: 2 }, 'k': { x: 7, y: 2 },
      'z': { x: 0, y: 3 }, 'x': { x: 1, y: 3 }, 'c': { x: 2, y: 3 }, 'v': { x: 3, y: 3 },
      'b': { x: 4, y: 3 }, 'n': { x: 5, y: 3 }, 'm': { x: 6, y: 3 }, ',': { x: 7, y: 3 },
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const pos = keyMap[e.key.toLowerCase()]
      if (!pos) return
      e.preventDefault()
      const pad = desktopGrid.find((p) => p.x === pos.x && p.y === pos.y)
      if (pad) handlePadClick(pad)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [desktopGrid, handlePadClick])

  // ─── Port Grid: Patch Bay ───────────────────────────────────────
  const PortGrid = useCallback(({ items, cols, rows }: { items: any[]; cols: number; rows: number }) => (
    <div
      className="grid gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, aspectRatio: `${cols}/${rows}` }}
    >
      {items.map((pad, index) => {
        const isLooping = loopingPads.has(pad.id)
        const isActive = activePads.has(pad.id)
        const isFunctional = pad.type === 'functional'
        const isEmail = pad.id === 'email'
        const isSocial = isFunctional && !isEmail
        const portLabel = isFunctional && 'label' in pad ? (pad as any).label : ''

        // Sequential scroll animation delay
        const scrollDelay = 0.08 * index

        return (
          <m.button
            key={pad.id}
            onClick={() => handlePadClick(pad)}
            aria-label={isFunctional && 'label' in pad ? `Patch ${(pad as any).label}` : `Port ${pad.id}`}
            aria-pressed={isLooping}
            className={cn(
              'group relative flex min-h-[48px] flex-col items-center justify-center overflow-hidden',
              'rounded-full transition-all duration-200 select-none',
              isFunctional ? 'z-10' : 'z-0',
              !isFunctional && 'opacity-60',
            )}
            style={{
              gridColumn: `span ${pad.w}`,
              gridRow: `span ${pad.h}`,
              minWidth: isFunctional ? (isEmail ? 80 : 56) : 48,
              minHeight: 48,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 18,
              delay: scrollDelay,
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* ── Jack Port Ring ── */}
            <div
              className={cn(
                'absolute inset-0 rounded-full transition-all duration-300',
                // Warm metal border ring
                'border-2',
                isEmail
                  ? 'border-[var(--color-ochre)]' // Email = main output jack
                  : isFunctional
                    ? 'border-[var(--color-border-subtle)] group-hover:border-[var(--color-ochre)]' // Social = small jack
                    : 'border-[var(--color-border-subtle)] opacity-30', // Dummy ports
                (isLooping || isActive) && 'border-[var(--color-ochre)]',
              )}
            />

            {/* ── Active Glow ── */}
            {(isLooping || isActive) && (
              <m.div
                className={cn(
                  'absolute inset-0 rounded-full',
                  isEmail
                    ? 'bg-[var(--color-terracotta)]/30' // Email = terracotta glow
                    : 'bg-[var(--color-ochre)]/20', // Others = ochre glow
                )}
                layoutId={`glow-${pad.id}`}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}

            {/* ── Port Center (dark inner circle) ── */}
            <div
              className={cn(
                'absolute z-[1] rounded-full',
                'bg-[var(--color-charcoal)]',
                isEmail ? 'h-10 w-10' : 'h-7 w-7',
                (isLooping || isActive) && 'bg-[var(--color-surface)]',
              )}
            />

            {/* ── Inner highlight dot ── */}
            <div
              className={cn(
                'absolute z-[2] rounded-full transition-colors duration-200',
                isEmail ? 'h-3 w-3' : 'h-2 w-2',
                isLooping || isActive
                  ? isEmail
                    ? 'bg-[var(--color-terracotta)]'
                    : 'bg-[var(--color-ochre)]'
                  : 'bg-[var(--color-slate)]',
              )}
            />

            {/* ── Port Label ── */}
            {isFunctional && (
              <div
                className={cn(
                  'absolute z-[3] flex flex-col items-center',
                  // Position label below port
                  'top-full mt-1.5',
                  'pointer-events-none',
                )}
              >
                <span
                  className={cn(
                    'text-[9px] font-bold tracking-wider whitespace-nowrap',
                    'font-mono',
                    'transition-colors duration-200',
                    isLooping || isActive
                      ? 'text-[var(--color-ochre)]'
                      : isFunctional
                        ? 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-ochre)]'
                        : 'text-[var(--color-text-tertiary)]',
                  )}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {portLabel}
                </span>
                {(pad as any).subLabel && (
                  <span
                    className="text-[7px] tracking-wider text-[var(--color-text-tertiary)] whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {(pad as any).subLabel}
                  </span>
                )}
              </div>
            )}

            {/* ── Patch Cable Line (social links only) ── */}
            {isSocial && !isEmail && pad.href && (
              <m.div
                className={cn(
                  'absolute z-0',
                  // Line from port to bottom-right destination
                  'h-px w-8 sm:w-12',
                  'bottom-0 right-0 origin-right',
                  'translate-x-full translate-y-1/2',
                )}
                initial={{ scaleX: 0 }}
                animate={isLooping || isActive ? { scaleX: 1 } : {}}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="h-full w-full bg-gradient-to-r from-[var(--color-ochre)]/60 to-transparent" />
                {/* Cable end dot */}
                <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--color-ochre)]/40" />
              </m.div>
            )}

            {/* ── Active LED ── */}
            <div
              className={cn(
                'absolute top-1 right-1 h-1.5 w-1.5 rounded-full transition-colors duration-200 sm:top-2 sm:right-2 z-[4]',
                isLooping
                  ? 'bg-[var(--color-ochre)] shadow-[0_0_6px_var(--color-ochre)]'
                  : isActive
                    ? 'bg-[var(--color-ochre)]'
                    : 'bg-[var(--color-interactive-disabled)]',
              )}
            />

            {/* ── Loop indicator ── */}
            {isLooping && (
              <div className="absolute bottom-1 left-1 h-1 w-1 rounded-full bg-[var(--color-ochre)]/50 sm:bottom-2 sm:left-2 z-[4]" />
            )}
          </m.button>
        )
      })}
    </div>
  ), [loopingPads, activePads, handlePadClick, isInView])

  return (
    <>
      <section id="contact" ref={sectionRef} className="overflow-hidden py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 flex flex-col items-center text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-ochre)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <Radio className="h-4 w-4" />
              <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.15em' }}>PATCH IN</span>
            </m.div>
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-black tracking-tight sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              Connect to the Studio
            </m.h2>
            <p
              className="mt-4 max-w-2xl text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Plug into the patch bay. Tap a jack to connect — stack signals to build your mix.
            </p>
          </div>

          {/* ── Patch Bay Board ── */}
          <div
            className="relative mx-auto max-w-6xl rounded-2xl p-2 shadow-2xl sm:p-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border-default)',
              boxShadow: '0 0 40px rgba(0,0,0,0.5)',
              // Rack panel texture: subtle horizontal lines
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.015) 1px, rgba(255,255,255,0.015) 2px)',
            }}
          >
            {/* Noise overlay */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.03] mix-blend-overlay"
              style={{ backgroundImage: "url('/noise.png')" }}
            />

            <div
              className="relative rounded-xl p-4 shadow-inner sm:p-6 md:p-10"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <Screw className="absolute top-2 left-2 sm:top-4 sm:left-4" />
              <Screw className="absolute top-2 right-2 sm:top-4 sm:right-4" />
              <Screw className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4" />
              <Screw className="absolute right-2 bottom-2 sm:right-4 sm:bottom-4" />

              {/* ── Top Panel: Transport ── */}
              <div
                className="mb-4 flex items-center justify-between px-2 sm:mb-8"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2',
                      isPlaying ? 'animate-pulse' : '',
                    )}
                    style={{
                      backgroundColor: isPlaying ? 'var(--color-terracotta)' : 'var(--color-interactive-disabled)',
                      boxShadow: isPlaying ? '0 0 6px var(--color-terracotta)' : 'none',
                    }}
                  />
                  <span
                    className="text-[10px] tracking-widest sm:text-xs"
                    style={{ color: isPlaying ? 'var(--color-terracotta)' : 'var(--color-text-tertiary)' }}
                  >
                    REC
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold tracking-[0.3em] sm:text-xs"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  PATCH BAY
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: 'var(--color-slate)' }}>
                    {transportTime}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: 'var(--color-ochre)' }}
                  >
                    {bpm} BPM
                  </span>
                </div>
              </div>

              {/* ── Control Panel ── */}
              <div
                className="mb-4 space-y-3 rounded-lg p-3"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                {/* Presets + Transport Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="text-[10px] font-bold tracking-wider"
                    style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
                  >
                    PATCH MEMORY:
                  </span>

                  <div className="flex items-center gap-2">
                    {/* BPM — warm metal knob */}
                    <div className="hidden items-center gap-1.5 sm:flex">
                      <span
                        className="text-[9px]"
                        style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
                      >
                        BPM
                      </span>
                      <div
                        className="flex h-6 w-16 items-center justify-center rounded-sm"
                        style={{
                          background: 'linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-charcoal) 100%)',
                          border: '1px solid var(--color-border-default)',
                        }}
                      >
                        <input
                          type="range"
                          min={60}
                          max={140}
                          value={bpm}
                          onChange={(e) => handleBpmChange(Number(e.target.value))}
                          className="h-1 w-12 cursor-pointer appearance-none rounded-full accent-[var(--color-ochre)]"
                          style={{ backgroundColor: 'var(--color-border-subtle)' }}
                        />
                      </div>
                    </div>

                    {/* Volume — warm metal knob */}
                    <div className="hidden items-center gap-1.5 sm:flex">
                      <Volume2 size={10} style={{ color: 'var(--color-text-tertiary)' }} />
                      <div
                        className="flex h-6 w-14 items-center justify-center rounded-sm"
                        style={{
                          background: 'linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-charcoal) 100%)',
                          border: '1px solid var(--color-border-default)',
                        }}
                      >
                        <input
                          type="range"
                          min={-30}
                          max={0}
                          value={masterVol}
                          onChange={(e) => setMasterVol(Number(e.target.value))}
                          className="h-1 w-10 cursor-pointer appearance-none rounded-full accent-[var(--color-ochre)]"
                          style={{ backgroundColor: 'var(--color-border-subtle)' }}
                        />
                      </div>
                    </div>

                    {/* Transport buttons — warm metal */}
                    {currentPreset && (
                      <>
                        <m.button
                          whileTap={{ scale: 0.9 }}
                          onClick={togglePause}
                          className="flex h-7 w-7 items-center justify-center rounded-sm sm:h-8 sm:w-8"
                          style={{
                            background: isPlaying
                              ? 'linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-charcoal) 100%)'
                              : 'linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-charcoal) 100%)',
                            border: `1px solid ${isPlaying ? 'var(--color-ochre)' : 'var(--color-border-default)'}`,
                            color: isPlaying ? 'var(--color-ochre)' : 'var(--color-text-tertiary)',
                          }}
                        >
                          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                        </m.button>

                        <m.button
                          whileTap={{ scale: 0.9 }}
                          onClick={stopAllPlayback}
                          className="flex h-7 w-7 items-center justify-center rounded-sm sm:h-8 sm:w-8"
                          style={{
                            background: 'linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-charcoal) 100%)',
                            border: '1px solid var(--color-terracotta)',
                            color: 'var(--color-terracotta)',
                          }}
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
                          'flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-bold transition-all',
                        )}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          background: loopingPads.size > 0
                            ? 'linear-gradient(180deg, rgba(184,74,57,0.3) 0%, rgba(184,74,57,0.1) 100%)'
                            : 'var(--color-bg-elevated)',
                          border: `1px solid ${loopingPads.size > 0 ? 'var(--color-terracotta)' : 'var(--color-border-default)'}`,
                          color: loopingPads.size > 0 ? 'var(--color-terracotta)' : 'var(--color-text-tertiary)',
                          cursor: loopingPads.size > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <Square className="h-3 w-3" />
                        STOP ALL
                      </m.button>
                    )}
                  </div>
                </div>

                {/* Mobile BPM + Vol */}
                <div className="flex items-center gap-3 sm:hidden">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px]"
                      style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
                    >
                      BPM
                    </span>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      value={bpm}
                      onChange={(e) => handleBpmChange(Number(e.target.value))}
                      className="h-1 w-20 cursor-pointer appearance-none rounded-full accent-[var(--color-ochre)]"
                      style={{ backgroundColor: 'var(--color-border-subtle)' }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Volume2 size={10} style={{ color: 'var(--color-text-tertiary)' }} />
                    <input
                      type="range"
                      min={-30}
                      max={0}
                      value={masterVol}
                      onChange={(e) => setMasterVol(Number(e.target.value))}
                      className="h-1 w-16 cursor-pointer appearance-none rounded-full accent-[var(--color-ochre)]"
                      style={{ backgroundColor: 'var(--color-border-subtle)' }}
                    />
                  </div>
                </div>

                {/* ── Preset Grid: Patch Memory Slots ── */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {presets.map((preset, idx) => (
                    <m.button
                      key={preset.id}
                      onClick={() => playPreset(preset.id)}
                      aria-label={`Load patch ${preset.name}`}
                      className="relative overflow-hidden rounded-md border p-2 text-left transition-all hover:scale-[1.02]"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        borderColor: currentPreset === preset.id
                          ? 'var(--color-ochre)'
                          : 'var(--color-border-default)',
                        backgroundColor: currentPreset === preset.id
                          ? 'rgba(212,168,75,0.08)'
                          : 'var(--color-bg-elevated)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      title={preset.description}
                    >
                      <div className="relative z-10">
                        <div className="mb-1 flex items-center justify-between">
                          {/* Slot number */}
                          <span
                            className="text-[8px] tracking-wider"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          >
                            {`SLOT ${String(idx + 1).padStart(2, '0')}`}
                          </span>
                          {currentPreset === preset.id && (
                            <m.div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: 'var(--color-ochre)' }}
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </div>
                        <div
                          className={cn(
                            'text-[10px] font-bold',
                          )}
                          style={{
                            color: currentPreset === preset.id
                              ? 'var(--color-ochre)'
                              : 'var(--color-text-primary)',
                          }}
                        >
                          {preset.name.toUpperCase()}
                        </div>
                        <p
                          className="mt-0.5 text-[8px] leading-tight"
                          style={{
                            color: currentPreset === preset.id
                              ? 'rgba(212,168,75,0.7)'
                              : 'var(--color-text-tertiary)',
                          }}
                        >
                          {preset.description}
                        </p>
                      </div>
                      {currentPreset === preset.id && (
                        <m.div
                          className="absolute inset-0"
                          style={{ backgroundColor: 'rgba(212,168,75,0.05)' }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </m.button>
                  ))}
                </div>

                {/* Now Playing */}
                <m.div
                  initial={false}
                  animate={currentPreset ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                  className={cn(
                    'flex items-center gap-2 rounded-sm px-3 py-1.5',
                    currentPreset ? '' : 'hidden',
                  )}
                  style={{
                    border: currentPreset ? '1px solid rgba(212,168,75,0.3)' : 'none',
                    backgroundColor: currentPreset ? 'rgba(212,168,75,0.05)' : 'transparent',
                  }}
                >
                  <Music className="h-3 w-3" style={{ color: 'var(--color-ochre)' }} />
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: 'var(--color-ochre)', fontFamily: 'var(--font-mono)' }}
                  >
                    Now Playing: {presets.find((p) => p.id === currentPreset)?.name}
                    {isPaused && ' (PAUSED)'}
                  </span>
                </m.div>
              </div>

              {/* ── Desktop Port Grid ── */}
              <div className="hidden md:block">
                <PortGrid items={desktopGrid} cols={8} rows={4} />
              </div>
              {/* ── Mobile Port Grid ── */}
              <div className="md:hidden">
                <PortGrid items={mobileGrid} cols={4} rows={6} />
              </div>

              {/* ── Cable Out ── */}
              <div className="-mt-0.5 flex justify-center">
                <div
                  className="flex h-8 w-24 items-end justify-center rounded-b-xl border-x border-b pb-1 shadow-lg sm:h-12 sm:w-32 sm:pb-2"
                  style={{
                    borderColor: 'var(--color-border-default)',
                    backgroundColor: 'var(--color-bg-elevated)',
                  }}
                >
                  <span
                    className="text-[8px] tracking-wider sm:text-[10px]"
                    style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
                  >
                    TRS OUT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
