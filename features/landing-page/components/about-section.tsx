'use client'

import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence, useScroll, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  Play,
  Pause,
  Square,
  Music,
  X,
  Maximize2,
  User,
  Activity,
  Layers,
  Zap,
} from 'lucide-react'
import NowPlaying from '@/features/landing-page/spotify/now-playing'

// --- Types ---

interface Clip {
  id: string
  name: string
  subtitle?: string
  description: string
  start: number // Grid column start
  duration: number // Grid column span
  type: 'bio' | 'stack' | 'stats' | 'spotify'
  content: React.ReactNode
}

interface Track {
  id: string
  name: string
  icon: any
  color: string
  clips: Clip[]
}

// --- Components ---

const VUMeter = () => {
  return (
    <div className="flex h-full flex-col justify-center gap-1 px-2">
      {[...Array(12)].map((_, i) => {
        const delay = i * 0.1
        const height = Math.random() * 60 + 20
        return (
          <div
            key={i}
            className="h-1 rounded-full transition-all"
            style={{
              width: `${height}%`,
              backgroundColor:
                i < 4
                  ? 'var(--color-moss)'
                  : i < 8
                    ? 'var(--color-ochre)'
                    : 'var(--color-terracotta)',
              animation: `vuPulse 1.2s ease-in-out ${delay}s infinite`,
            }}
          />
        )
      })}
      <style jsx>{`
        @keyframes vuPulse {
          0%,
          100% {
            opacity: 0.3;
            width: 20%;
          }
          50% {
            opacity: 1;
            width: 80%;
          }
        }
      `}</style>
    </div>
  )
}

const TimeRuler = () => (
  <div
    className="flex h-8 min-w-[800px] border-b font-mono text-[10px]"
    style={{
      borderColor: 'var(--color-border-subtle)',
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-slate)',
    }}
  >
    <div className="flex flex-1">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="flex flex-1 items-end justify-start border-r px-1 pb-1"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          {i + 1}
        </div>
      ))}
    </div>
  </div>
)

const TrackHeader = ({
  track,
  muted,
  soloed,
  onMute,
  onSolo,
}: {
  track: Track
  muted: boolean
  soloed: boolean
  onMute: () => void
  onSolo: () => void
}) => (
  <div
    className="flex h-24 w-14 shrink-0 flex-col justify-between border-r border-b p-2 md:w-32"
    style={{
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-border-subtle)',
    }}
  >
    <div className="flex items-center gap-2">
      <div
        className="flex h-6 w-6 items-center justify-center rounded"
        style={{
          backgroundColor: track.color,
          opacity: 0.2,
        }}
      >
        <track.icon size={14} style={{ color: track.color }} />
      </div>
      <span
        className="hidden truncate text-xs font-bold md:block"
        style={{ color: 'var(--color-ochre)' }}
      >
        {track.name}
      </span>
    </div>

    <div className="flex flex-col gap-1 md:flex-row">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMute()
        }}
        aria-label={
          muted ? `Unmute ${track.name} track` : `Mute ${track.name} track`
        }
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold transition-all',
        )}
        style={{
          backgroundColor: muted
            ? 'var(--color-terracotta)'
            : 'var(--color-surface)',
          color: muted ? 'var(--color-charcoal)' : 'var(--color-ochre)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        M
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onSolo()
        }}
        aria-label={
          soloed ? `Unsolo ${track.name} track` : `Solo ${track.name} track`
        }
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold transition-all',
        )}
        style={{
          backgroundColor: soloed
            ? 'var(--color-ochre)'
            : 'var(--color-surface)',
          color: soloed ? 'var(--color-charcoal)' : 'var(--color-ochre)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        S
      </button>
    </div>
  </div>
)

const ClipBlock = ({
  clip,
  color,
  isActive,
  onClick,
  onHover,
  index,
}: {
  clip: Clip
  color: string
  isActive: boolean
  onClick: () => void
  onHover: (isHovered: boolean) => void
  index: number
}) => {
  const ref = useRef<HTMLButtonElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const x = useTransform(scrollYProgress, [0, 0.5], [100, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  return (
    <m.button
      ref={ref}
      layoutId={`clip-${clip.id}`}
      aria-label={`Select clip ${clip.name}`}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1], // --ease-tape
      }}
      className={cn(
        'group relative flex h-20 items-center overflow-hidden rounded-lg border-l-4 transition-all',
      )}
      style={{
        gridColumn: `${clip.start} / span ${clip.duration}`,
        viewTransitionName: `clip-${clip.id}`,
        borderLeftColor: color,
        background: `linear-gradient(135deg, var(--color-surface) 0%, var(--color-charcoal) 100%)`,
        borderTop: '1px solid var(--color-border-subtle)',
        borderRight: '1px solid var(--color-border-subtle)',
        borderBottom: '1px solid var(--color-border-subtle)',
        boxShadow: isActive
          ? `0 0 0 2px ${color}40, 0 0 20px ${color}20`
          : 'none',
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 0 0 1px ${color}60, 0 0 15px ${color}30`,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Tape texture pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
          color: 'var(--color-highlight)',
        }}
      />

      <div className="relative z-10 flex w-full items-center justify-between px-3">
        <div className="flex flex-col items-start gap-1 overflow-hidden">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[10px]"
            style={{
              backgroundColor: 'var(--color-charcoal)',
              color: 'var(--color-ochre)',
            }}
          >
            {clip.name}
          </span>
          {clip.subtitle && (
            <span
              className="truncate text-xs font-bold"
              style={{ color: 'var(--color-highlight)' }}
            >
              {clip.subtitle}
            </span>
          )}
        </div>
        <Maximize2
          size={12}
          className="opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: 'var(--color-slate)' }}
        />
      </div>
    </m.button>
  )
}

const DetailWindow = ({
  clip,
  onClose,
}: {
  clip: Clip
  onClose: () => void
}) => {
  const titleId = `clip-title-${clip.id}`

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm md:p-8"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <m.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-[90dvh] max-h-[700px] w-full max-w-5xl flex-col overflow-hidden rounded-xl border-2 shadow-2xl md:h-auto md:max-h-[85vh]"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border-default)',
        }}
      >
        {/* Tape Machine Header */}
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-charcoal)',
          }}
        >
          <div className="flex items-center gap-4">
            {/* Transport Spools */}
            <div className="flex gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: 'var(--color-ochre)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
                }}
              />
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: 'var(--color-moss)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
                }}
              />
            </div>
            {/* Tape Counter Display */}
            <div
              className="rounded px-3 py-1"
              style={{
                backgroundColor: 'var(--color-charcoal)',
                border: '1px solid var(--color-border-default)',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
              }}
            >
              <span
                id={titleId}
                className="font-mono text-sm font-bold tracking-widest"
                style={{ color: 'var(--color-ochre)' }}
              >
                {'>'} {clip.name.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Fake VU indicators */}
            <div className="hidden gap-2 md:flex">
              {['L', 'R'].map((ch) => (
                <div
                  key={ch}
                  className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px]"
                  style={{
                    backgroundColor: 'var(--color-charcoal)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-moss)',
                  }}
                >
                  <span>{ch}</span>
                  <div className="flex gap-px">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-3 w-1 rounded-sm"
                        style={{
                          backgroundColor:
                            i < 3
                              ? 'var(--color-moss)'
                              : i < 5
                                ? 'var(--color-ochre)'
                                : 'var(--color-terracotta)',
                          animation:
                            i % 2 === 0
                              ? 'vuMeter 0.8s ease-in-out infinite'
                              : 'vuMeter 0.6s ease-in-out 0.4s infinite',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="h-6 w-px"
              style={{ backgroundColor: 'var(--color-border-subtle)' }}
            />
            <button
              onClick={onClose}
              aria-label="Close clip detail"
              className="rounded-full p-1 transition-colors"
              style={{
                color: 'var(--color-slate)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--color-bg-tertiary)'
                e.currentTarget.style.color = 'var(--color-ochre)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--color-slate)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div
          className="scrollbar-thin flex-1 overflow-y-auto p-6"
          style={{
            backgroundColor: 'var(--color-charcoal)',
            color: 'var(--color-highlight)',
          }}
        >
          {clip.content}
        </div>
      </m.div>
    </m.div>
  )
}

export function AboutSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeClip, setActiveClip] = useState<Clip | null>(null)
  const [hoveredClip, setHoveredClip] = useState<Clip | null>(null)
  const [mutedTracks, setMutedTracks] = useState<Set<string>>(new Set())
  const [soloedTrack, setSoloedTrack] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  // Toolbar fake-clock tick
  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      setTick((t) => (t + 1) % 10)
    }, 1000)
    return () => clearInterval(id)
  }, [isPlaying])

  // Playhead animation
  const playheadRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const lastTimestampRef = useRef<number>(0)

  useEffect(() => {
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp

      const deltaTime = timestamp - lastTimestampRef.current
      lastTimestampRef.current = timestamp

      progressRef.current = (progressRef.current + deltaTime / 10000) % 1

      if (playheadRef.current) {
        playheadRef.current.style.left = `${progressRef.current * 100}%`
      }

      if (isPlaying) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    if (isPlaying) {
      lastTimestampRef.current = performance.now()
      animationFrame = requestAnimationFrame(animate)
    } else {
      lastTimestampRef.current = 0
    }

    return () => cancelAnimationFrame(animationFrame)
  }, [isPlaying])

  const handleStop = () => {
    setIsPlaying(false)
    progressRef.current = 0
    if (playheadRef.current) {
      playheadRef.current.style.left = '0%'
    }
  }

  const toggleMute = (id: string) => {
    const newMuted = new Set(mutedTracks)
    if (newMuted.has(id)) newMuted.delete(id)
    else newMuted.add(id)
    setMutedTracks(newMuted)
  }

  const toggleSolo = (id: string) => {
    setSoloedTrack(soloedTrack === id ? null : id)
  }
