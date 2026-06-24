'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { Screw } from '@/components/screw'
import { SpectrumAnalyzer } from '@/components/spectrum-analyzer'
import { cn } from '@/lib/utils'
import { Play, Pause, Volume2, Info, Disc } from 'lucide-react'

export function HeroConsoleDeck() {
  const {
    isPlaying,
    togglePlay,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
    currentTrack,
  } = useAudio()

  const [activeParam, setActiveParam] = useState<string | null>(null)
  const [activeValue, setActiveValue] = useState<string | null>(null)

  // Rotary Knob drag handler (same high-fidelity physics)
  const handleKnobDrag = useCallback((
    y: number,
    startY: number,
    startVal: number,
    min: number,
    max: number,
    onChange: (v: number) => void,
    sensitivity = 1.0
  ) => {
    const delta = (startY - y) * sensitivity
    const range = max - min
    const newValue = Math.max(min, Math.min(max, startVal + (delta / 100) * range))
    onChange(newValue)
  }, [])

  // Hook up speed knob drag
  const speedKnobRef = useRef<HTMLDivElement>(null)
  const [speedDragging, setSpeedDragging] = useState(false)
  const speedStartY = useRef(0)
  const speedStartValue = useRef(0)

  const onSpeedStart = (y: number) => {
    setSpeedDragging(true)
    speedStartY.current = y
    speedStartValue.current = playbackRate
    setActiveParam('PITCH SPEED')
    setActiveValue(`${playbackRate.toFixed(2)}x`)
  }

  // Hook up pan knob drag (decorative parameter to add depth!)
  const [pan, setPan] = useState(0) // -50 (L) to +50 (R)
  const panKnobRef = useRef<HTMLDivElement>(null)
  const [panDragging, setPanDragging] = useState(false)
  const panStartY = useRef(0)
  const panStartValue = useRef(0)

  const onPanStart = (y: number) => {
    setPanDragging(true)
    panStartY.current = y
    panStartValue.current = pan
    setActiveParam('STEREO PAN')
    setActiveValue(pan === 0 ? 'CENTER' : pan < 0 ? `${Math.abs(pan)}% L` : `${pan}% R`)
  }

  // Global mousemove/mouseup listeners for knobs
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (speedDragging) {
        handleKnobDrag(
          e.clientY,
          speedStartY.current,
          speedStartValue.current,
          0.5,
          2.0,
          (v) => {
            setPlaybackRate(v)
            setActiveValue(`${v.toFixed(2)}x`)
          },
          1.5
        )
      }
      if (panDragging) {
        handleKnobDrag(
          e.clientY,
          panStartY.current,
          panStartValue.current,
          -50,
          50,
          (v) => {
            const rounded = Math.round(v)
            setPan(rounded)
            setActiveValue(rounded === 0 ? 'CENTER' : rounded < 0 ? `${Math.abs(rounded)}% L` : `${rounded}% R`)
          },
          1.2
        )
      }
    }

    const handleUp = () => {
      setSpeedDragging(false)
      setPanDragging(false)
      setActiveParam(null)
      setActiveValue(null)
    }

    if (speedDragging || panDragging) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }
    }
  }, [speedDragging, panDragging, playbackRate, pan, handleKnobDrag, setPlaybackRate])

  // Volume slider drag logic
  const volumeSliderRef = useRef<HTMLDivElement>(null)
  const [volDragging, setVolDragging] = useState(false)

  const handleVolumeSlide = useCallback((clientX: number) => {
    const slider = volumeSliderRef.current
    if (!slider) return
    const rect = slider.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setVolume(percentage)
    setActiveParam('MASTER VOL')
    setActiveValue(`${Math.round(percentage * 100)}%`)
  }, [setVolume])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (volDragging) {
        handleVolumeSlide(e.clientX)
      }
    }
    const handleUp = () => {
      setVolDragging(false)
      setActiveParam(null)
      setActiveValue(null)
    }

    if (volDragging) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }
    }
  }, [volDragging, handleVolumeSlide])

  // Computed angles
  const speedPercentage = ((playbackRate - 0.5) / 1.5) * 100
  const speedAngle = -135 + (speedPercentage / 100) * 270

  const panPercentage = ((pan - -50) / 100) * 100
  const panAngle = -135 + (panPercentage / 100) * 270

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'w-full max-w-[390px] rounded-2xl border p-6 select-none relative',
        'border-zinc-250 bg-zinc-100/90 shadow-[0_15px_35px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.7)]',
        'dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:shadow-[0_20px_45px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]',
        'backdrop-blur-lg flex flex-col gap-5'
      )}
    >
      {/* Corner mounting screws (Hallmark guideline check) */}
      <Screw className="absolute top-2.5 left-2.5 opacity-60 text-zinc-400 dark:text-zinc-650" />
      <Screw className="absolute top-2.5 right-2.5 opacity-60 text-zinc-400 dark:text-zinc-650" />
      <Screw className="absolute bottom-2.5 left-2.5 opacity-60 text-zinc-400 dark:text-zinc-650" />
      <Screw className="absolute bottom-2.5 right-2.5 opacity-60 text-zinc-400 dark:text-zinc-650" />

      {/* Rack Title & Status Indicator */}
      <div className="flex justify-between items-center border-b border-zinc-250 pb-2.5 dark:border-zinc-850">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] font-black text-zinc-700 dark:text-zinc-300 tracking-wider">
            ANALOG SYSTEM CARD // MT-2026
          </span>
          <span className="text-[7px] font-mono text-zinc-400 dark:text-zinc-600 uppercase">
            R2R DAC STAGE / SOLID STATE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-mono text-zinc-500 uppercase">SIGNAL</span>
          <div
            className={cn(
              'h-2 w-2 rounded-full border border-black/15 transition-all duration-300',
              isPlaying
                ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                : 'bg-zinc-400 dark:bg-zinc-800'
            )}
          />
        </div>
      </div>

      {/* Main hardware LCD Display */}
      <div className="relative overflow-hidden rounded-lg border border-zinc-300 bg-zinc-950 px-4 py-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)] dark:border-zinc-850">
        {/* Screen scanlines */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.12)_1px,rgba(0,0,0,0.12)_2px)] pointer-events-none z-10" />

        {/* Screen LCD output */}
        <div className="relative z-0 h-22 flex flex-col justify-between font-mono text-emerald-400/90 text-xs">
          <div className="flex justify-between border-b border-emerald-950/50 pb-1 text-[8px] text-emerald-600 font-bold">
            <span>{activeParam ? `PARAM ADJUST` : `SIGNAL: ONLINE`}</span>
            <span>{activeParam ? `1/1` : `44.1KHZ 16BIT`}</span>
          </div>

          <div className="flex flex-col py-1.5 justify-center flex-1">
            {activeParam ? (
              <div className="flex flex-col">
                <span className="text-[7.5px] text-amber-500 uppercase font-semibold">
                  {activeParam}
                </span>
                <span className="text-sm text-amber-300 font-black tracking-widest mt-0.5 animate-pulse">
                  {activeValue}
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-[7.5px] text-emerald-600 uppercase font-bold">
                  NOW REPRODUCING:
                </span>
                <div className="overflow-hidden w-full relative h-4 mt-0.5">
                  {isPlaying ? (
                    <motion.span
                      animate={{ x: ['100%', '-100%'] }}
                      transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                      className="absolute whitespace-nowrap text-[10.5px] font-black uppercase text-emerald-300 tracking-wider"
                    >
                      {currentTrack}
                    </motion.span>
                  ) : (
                    <span className="absolute text-[10.5px] font-black uppercase text-emerald-500/50 tracking-wider">
                      DAW SYSTEM PAUSED
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-emerald-950/50 pt-1 flex justify-between text-[7px] text-emerald-600 font-bold uppercase">
            <span>DAC: ACTIVE</span>
            <span>BPM: {Math.round(playbackRate * 128)}</span>
          </div>
        </div>
      </div>

      {/* Spectrum Analyzer Section (Embedded visually inside the module) */}
      <div className="rounded border border-zinc-250 bg-zinc-200/40 p-2 dark:border-zinc-850 dark:bg-zinc-950/30">
        <div className="text-[7px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
          ANALYSING FREQUENCY RESPONSE
        </div>
        <div className="relative h-12 w-full flex items-end">
          <SpectrumAnalyzer isPlaying={isPlaying} barCount={20} className="w-full h-full opacity-80" />
        </div>
      </div>

      {/* Drag knobs + tact controls in a row */}
      <div className="grid grid-cols-3 items-center justify-between gap-4 pt-1">
        {/* Pitch speed knob */}
        <div className="flex flex-col items-center select-none" ref={speedKnobRef}>
          <div
            className={cn(
              'relative flex h-9 w-9 cursor-grab items-center justify-center rounded-full border shadow-md active:cursor-grabbing',
              'border-zinc-300 bg-zinc-200 dark:border-zinc-850 dark:bg-zinc-800',
              speedDragging && 'border-zinc-400 dark:border-zinc-600 scale-105 transition-transform'
            )}
            onMouseDown={(e) => {
              e.preventDefault()
              onSpeedStart(e.clientY)
            }}
            onTouchStart={(e) => {
              onSpeedStart(e.touches[0].clientY)
            }}
          >
            {/* Knob pointer indicator */}
            <div
              className="absolute h-3 w-0.5 rounded-full bg-blue-500 shadow-[0_0_3px_#3b82f6]"
              style={{
                transform: `rotate(${speedAngle}deg) translateY(-8px)`,
                transformOrigin: 'center center',
              }}
            />
            {/* Center cap */}
            <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-650" />
          </div>
          <span className="text-[7px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-600 uppercase mt-1">
            SPEED
          </span>
        </div>

        {/* Play/Pause Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={togglePlay}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl border transition-all active:scale-95 shadow-md hover:brightness-105 cursor-pointer',
              isPlaying
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 dark:border-emerald-500/30'
                : 'border-zinc-350 bg-zinc-250 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
            )}
          >
            {isPlaying ? (
              <Pause size={15} className="fill-current animate-pulse" />
            ) : (
              <Play size={15} className="fill-current ml-0.5" />
            )}
          </button>
          <span className="text-[7px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-600 uppercase mt-1.5">
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </span>
        </div>

        {/* Stereo Pan knob (decorative/tactile) */}
        <div className="flex flex-col items-center select-none" ref={panKnobRef}>
          <div
            className={cn(
              'relative flex h-9 w-9 cursor-grab items-center justify-center rounded-full border shadow-md active:cursor-grabbing',
              'border-zinc-300 bg-zinc-200 dark:border-zinc-850 dark:bg-zinc-800',
              panDragging && 'border-zinc-400 dark:border-zinc-600 scale-105 transition-transform'
            )}
            onMouseDown={(e) => {
              e.preventDefault()
              onPanStart(e.clientY)
            }}
            onTouchStart={(e) => {
              onPanStart(e.touches[0].clientY)
            }}
          >
            {/* Knob pointer indicator */}
            <div
              className="absolute h-3 w-0.5 rounded-full bg-amber-500 shadow-[0_0_3px_#f59e0b]"
              style={{
                transform: `rotate(${panAngle}deg) translateY(-8px)`,
                transformOrigin: 'center center',
              }}
            />
            {/* Center cap */}
            <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-650" />
          </div>
          <span className="text-[7px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-600 uppercase mt-1">
            PAN
          </span>
        </div>
      </div>

      {/* Horizontal Volume Fader */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex justify-between items-center text-[7.5px] font-mono font-bold text-zinc-400 dark:text-zinc-600">
          <span>MASTER FADER</span>
          <span>{Math.round(volume * 100)}%</span>
        </div>
        <div
          ref={volumeSliderRef}
          onMouseDown={(e) => {
            e.preventDefault()
            setVolDragging(true)
            handleVolumeSlide(e.clientX)
          }}
          className="relative h-6 w-full rounded-md border border-zinc-250 bg-zinc-200/50 flex items-center px-1 cursor-ew-resize shadow-inner dark:border-zinc-800 dark:bg-zinc-950"
        >
          {/* Fader track slot */}
          <div className="absolute left-3 right-3 h-0.5 bg-black/35 dark:bg-black/60 rounded" />

          {/* Fader ticks */}
          <div className="absolute inset-x-4 flex justify-between h-full items-center pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-2.5 w-px bg-zinc-300 dark:bg-zinc-800" />
            ))}
          </div>

          {/* Glowing Range Fill */}
          <div
            className="absolute left-0.5 h-4 bg-emerald-500/10 rounded-sm pointer-events-none"
            style={{ width: `calc(${volume * 100}% - 4px)` }}
          />

          {/* Fader handle knob */}
          <motion.div
            style={{ left: `calc(${volume * 100}% - 11px)` }}
            className={cn(
              'absolute h-4.5 w-5 rounded border bg-linear-to-b shadow-[0_1.5px_3px_rgba(0,0,0,0.3)] z-10 flex items-center justify-center cursor-grab active:cursor-grabbing',
              'from-zinc-100 to-zinc-300 border-zinc-450',
              'dark:from-zinc-200 dark:to-zinc-450 dark:border-zinc-600'
            )}
          >
            {/* Fader handle index indicator */}
            <div className="h-full w-0.5 bg-rose-500 rounded-full" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
