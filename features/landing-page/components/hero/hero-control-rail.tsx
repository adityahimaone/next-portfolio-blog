'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { cn } from '@/lib/utils'
import { Play, Pause } from 'lucide-react'

// --- Compact Knob for Control Rail ---
function MiniRailKnob({
  label,
  value,
  min,
  max,
  onChange,
  colorClass = 'bg-amber-500',
  displayValue,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  colorClass?: string
  displayValue: string
}) {
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const startValue = useRef(0)

  const handleStart = (y: number) => {
    setIsDragging(true)
    startY.current = y
    startValue.current = value
  }

  const handleMove = useCallback(
    (y: number) => {
      if (!isDragging) return
      const delta = (startY.current - y) * 1.5 // Sensitivity
      const range = max - min
      const newValue = Math.max(min, Math.min(max, startValue.current + (delta / 100) * range))
      onChange(newValue)
    },
    [isDragging, min, max, onChange],
  )

  const handleEnd = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMove(e.clientY)
      const handleGlobalMouseUp = () => handleEnd()

      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, handleMove, handleEnd])

  const percentage = ((value - min) / (max - min)) * 100
  const angle = -135 + (percentage / 100) * 270

  return (
    <div
      className="flex items-center gap-1.5 select-none group cursor-pointer"
      title={`${label}: ${displayValue}`}
    >
      <span className="text-[6.5px] font-[family-name:var(--font-jetbrains-mono)] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
        {label}
      </span>
      <div
        className={cn(
          'relative flex h-4.5 w-4.5 items-center justify-center rounded-full border shadow-inner active:cursor-grabbing transition-transform duration-100',
          'border-zinc-300 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800',
          isDragging && 'scale-105 border-zinc-400 dark:border-zinc-500',
        )}
        onMouseDown={(e) => {
          e.preventDefault()
          handleStart(e.clientY)
        }}
        onTouchStart={(e) => {
          handleStart(e.touches[0].clientY)
        }}
        onTouchMove={(e) => {
          e.preventDefault()
          handleMove(e.touches[0].clientY)
        }}
        onTouchEnd={handleEnd}
      >
        {/* Notch */}
        <div
          className={cn('absolute h-1.5 w-0.5 rounded-full', colorClass)}
          style={{
            transform: `rotate(${angle}deg) translateY(-3.5px)`,
            transformOrigin: 'center center',
          }}
        />
      </div>
    </div>
  )
}

// --- Main Control Rail Component ---
export function HeroControlRail() {
  const {
    isPlaying,
    togglePlay,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
    currentTrack,
  } = useAudio()

  const [levels, setLevels] = useState([false, false, false])

  // Simple VU meter animation
  useEffect(() => {
    if (!isPlaying) {
      setLevels([false, false, false])
      return
    }
    const interval = setInterval(() => {
      const rand = Math.random()
      if (rand < 0.25) {
        setLevels([true, false, false])
      } else if (rand < 0.65) {
        setLevels([true, true, false])
      } else {
        setLevels([true, true, true])
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex items-center gap-3.5 px-4.5 py-2 rounded-full border shadow-md relative z-30 mt-8.5 select-none transition-all duration-300',
        'border-zinc-250 bg-white/70 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/70',
        'hover:border-zinc-350 dark:hover:border-zinc-700/80 shadow-black/5 dark:shadow-black/20',
      )}
    >
      {/* Power Indicator Light */}
      <div
        className={cn(
          'h-1.5 w-1.5 rounded-full border border-black/10 transition-all duration-300',
          isPlaying
            ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]'
            : 'bg-amber-500 shadow-[0_0_4px_#f59e0b]',
        )}
      />

      {/* Dynamic Mini Status Label */}
      <div className="flex flex-col">
        <span className="font-mono text-[7px] font-bold text-zinc-700 dark:text-zinc-300 tracking-wider">
          {isPlaying ? 'DAC PLAYING' : 'STANDBY'}
        </span>
        <span className="text-[5.5px] font-mono text-zinc-400 dark:text-zinc-550 uppercase -mt-0.5 tracking-wider truncate max-w-[80px]">
          {isPlaying ? currentTrack.substring(0, 12) + '...' : 'ANALOG SYS'}
        </span>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition-all active:scale-90 cursor-pointer',
          isPlaying
            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-500'
            : 'border-zinc-300 bg-zinc-200/50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
        )}
      >
        {isPlaying ? (
          <Pause size={9} className="fill-current animate-pulse" />
        ) : (
          <Play size={9} className="fill-current ml-0.5" />
        )}
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

      {/* VU Meter Lights */}
      <div className="flex items-center gap-0.75">
        <div
          className={cn(
            'h-1 w-1 rounded-full border border-black/10 transition-colors duration-75',
            levels[0] ? 'bg-emerald-500 shadow-[0_0_2px_#10b981]' : 'bg-emerald-950/40',
          )}
        />
        <div
          className={cn(
            'h-1 w-1 rounded-full border border-black/10 transition-colors duration-75',
            levels[1] ? 'bg-emerald-500 shadow-[0_0_2px_#10b981]' : 'bg-emerald-950/40',
          )}
        />
        <div
          className={cn(
            'h-1 w-1 rounded-full border border-black/10 transition-colors duration-75',
            levels[2] ? 'bg-amber-500 shadow-[0_0_2px_#f59e0b]' : 'bg-amber-950/40',
          )}
        />
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

      {/* Volume Knob */}
      <MiniRailKnob
        label="VOL"
        value={volume}
        min={0}
        max={1}
        onChange={setVolume}
        colorClass="bg-emerald-500 shadow-[0_0_2px_#10b981]"
        displayValue={`${Math.round(volume * 100)}%`}
      />

      {/* Pitch Speed Knob */}
      <MiniRailKnob
        label="SPD"
        value={playbackRate}
        min={0.5}
        max={2.0}
        onChange={setPlaybackRate}
        colorClass="bg-blue-500 shadow-[0_0_2px_#3b82f6]"
        displayValue={`${playbackRate.toFixed(2)}x`}
      />
    </motion.div>
  )
}
