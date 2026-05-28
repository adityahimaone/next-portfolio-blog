'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Music,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { NowPlayingResponse } from '@/types'
import { cn } from '@/lib/utils'
import { WaveformVisualizer } from './waveform-visualizer'

// Ambient color extracted from album art placeholder
const AMBIENT_GRADIENT =
  'radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)'

export function ModernDap() {
  const { isPlaying, togglePlay, isMuted, toggleMute, volume, setVolume } =
    useAudio()
  const [data, setData] = useState<NowPlayingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  // Progress state (simulated when no API data)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<HTMLDivElement>(null)

  // Fetch now playing data
  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch(`/api/now-playing?t=${Date.now()}`)
        if (res.ok) {
          const newData: NowPlayingResponse = await res.json()
          setData(newData)
        }
      } catch (error) {
        console.error('Error fetching now playing:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 10000)
    return () => clearInterval(interval)
  }, [])

  // Simulate progress when playing
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0
        return prev + 0.15
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying])

  const isActive = data?.isPlaying ?? false
  const trackTitle = data?.title || 'No Signal'
  const trackArtist = data?.artist || 'Waiting for input...'
  const albumArt = data?.albumImageUrl

  return (
    <div className="relative w-full">
      {/* Ambient glow background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 scale-110 blur-3xl"
        style={{
          background: isActive
            ? AMBIENT_GRADIENT
            : 'radial-gradient(ellipse at 30% 50%, rgba(39,39,42,0.3) 0%, rgba(0,0,0,0) 70%)',
          transition: 'all 1.2s ease',
        }}
      />

      {/* Main DAP Card */}
      <motion.div
        layout
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'border border-white/[0.06] bg-zinc-900/80',
          'shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]',
          'backdrop-blur-xl'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top edge light */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-all duration-700',
                isActive
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                  : 'bg-zinc-600'
              )}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
              {isActive ? 'Streaming' : 'Standby'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isActive ? (
              <Wifi size={12} className="text-emerald-400/70" />
            ) : (
              <WifiOff size={12} className="text-zinc-600" />
            )}
            <span className="font-mono text-[10px] text-zinc-600">DAP</span>
          </div>
        </div>

        {/* Album Art + Track Info */}
        <div className="flex gap-4 px-5 pb-3">
          {/* Album Art */}
          <motion.div
            layout
            className={cn(
              'relative shrink-0 overflow-hidden rounded-xl',
              'border border-white/[0.08] bg-zinc-950',
              expanded ? 'h-32 w-32' : 'h-20 w-20'
            )}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {isActive && albumArt ? (
              <>
                <Image
                  src={albumArt}
                  alt={trackTitle}
                  fill
                  className="object-cover"
                  sizes={expanded ? '128px' : '80px'}
                />
                {/* Album art overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                <Music
                  size={expanded ? 32 : 24}
                  className="text-zinc-700"
                />
              </div>
            )}

            {/* Playing indicator ring */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl border border-white/10"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Track Info */}
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <motion.p
              layout
              className={cn(
                'font-medium leading-tight truncate',
                isActive ? 'text-zinc-100' : 'text-zinc-500',
                expanded ? 'text-lg' : 'text-sm'
              )}
              transition={{ duration: 0.3 }}
            >
              {trackTitle}
            </motion.p>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {trackArtist}
            </p>

            {/* Mini waveform inline (non-expanded) */}
            {!expanded && isActive && (
              <div className="mt-2 flex h-3 items-end gap-[2px]">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[2px] rounded-full bg-violet-500/50"
                    animate={{
                      height: [2, 4 + Math.random() * 8, 2],
                    }}
                    transition={{
                      duration: 0.3 + Math.random() * 0.3,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: i * 0.03,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Expanded waveform */}
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 48 }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <WaveformVisualizer isActive={isActive} height={48} />
              </motion.div>
            )}
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronUp size={14} />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5">
          <div
            ref={progressRef}
            className="group relative h-1 cursor-pointer rounded-full bg-white/[0.06]"
            onClick={handleProgressClick}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
            {/* Scrub handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-between pt-1.5 pb-1">
            <span className="font-mono text-[10px] text-zinc-600">
              {Math.round(progress)}%
            </span>
            <span className="font-mono text-[10px] text-zinc-600">
              {isActive ? '● LIVE' : '—'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            {/* Volume bar */}
            <div className="relative h-1 w-16 rounded-full bg-white/[0.06]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-zinc-500"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-white/[0.04] hover:text-zinc-200 active:scale-90">
              <SkipBack size={16} />
            </button>

            <motion.button
              onClick={togglePlay}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full transition-all',
                isActive
                  ? 'bg-white text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                  : 'border border-white/10 bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08]'
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isActive ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </motion.button>

            <button className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-white/[0.04] hover:text-zinc-200 active:scale-90">
              <SkipForward size={16} />
            </button>
          </div>

          {/* Spotify link */}
          <a
            href={data?.songUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-lg px-3 transition-all',
              'border border-white/[0.06] bg-white/[0.03] text-[10px] font-medium uppercase tracking-wider text-zinc-500',
              'hover:bg-white/[0.06] hover:text-zinc-300',
              !isActive && 'pointer-events-none opacity-40'
            )}
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Spotify
          </a>
        </div>

        {/* Bottom edge */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </motion.div>
    </div>
  )
}
