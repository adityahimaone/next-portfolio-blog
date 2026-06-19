'use client'

import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'motion/react'
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

const TimeRuler = () => (
  <div className="flex h-8 min-w-[800px] border-b border-[#d4d4d0] bg-[#f8f8f6] font-mono text-[9px] text-zinc-500 uppercase tracking-wider dark:border-[#27272a] dark:bg-[#161616]">
    <div className="flex flex-1">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="flex flex-1 items-end justify-start border-r border-[#d4d4d0]/40 px-2 pb-1 last:border-r-0 dark:border-[#27272a]/40"
        >
          {String(i + 1).padStart(2, '0')}
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
  <div className="flex h-24 w-14 shrink-0 flex-col justify-between border-r border-b border-[#d4d4d0] bg-[#f4f4f0] p-2 md:w-32 dark:border-[#27272a] dark:bg-[#121212]">
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded border border-[#d4d4d0] bg-white dark:border-[#27272a] dark:bg-[#1a1a1a]',
          track.color.replace('text-', 'text-opacity-90 '),
        )}
      >
        <track.icon size={12} className="text-zinc-600 dark:text-zinc-400" />
      </div>
      <span className="hidden truncate font-mono text-[10px] font-bold text-zinc-600 uppercase tracking-tight md:block dark:text-zinc-400">
        {track.name.toLowerCase()}
      </span>
    </div>

    {/* Braun selector push buttons */}
    <div className="flex flex-col gap-1 md:flex-row md:gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMute()
        }}
        aria-label={
          muted ? `Unmute ${track.name} track` : `Mute ${track.name} track`
        }
        className={cn(
          'relative flex h-5 w-5 cursor-pointer items-center justify-center rounded border font-mono text-[9px] font-bold transition-all',
          muted
            ? 'bg-[#f05523] border-[#c03d15] text-white shadow-inner'
            : 'bg-[#e8e8e4] border-[#d4d4d0] text-zinc-600 hover:bg-[#eaeae6] active:translate-y-[1px] dark:bg-[#202020] dark:border-[#2c2c2c] dark:text-zinc-400'
        )}
      >
        <span>m</span>
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
          'relative flex h-5 w-5 cursor-pointer items-center justify-center rounded border font-mono text-[9px] font-bold transition-all',
          soloed
            ? 'bg-[#10b981] border-[#047857] text-white shadow-inner'
            : 'bg-[#e8e8e4] border-[#d4d4d0] text-zinc-600 hover:bg-[#eaeae6] active:translate-y-[1px] dark:bg-[#202020] dark:border-[#2c2c2c] dark:text-zinc-400'
        )}
      >
        <span>s</span>
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
}: {
  clip: Clip
  color: string
  isActive: boolean
  onClick: () => void
  onHover: (isHovered: boolean) => void
}) => {
  return (
    <m.button
      layoutId={`clip-${clip.id}`}
      aria-label={`Select clip ${clip.name}`}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        'group relative flex h-20 items-center overflow-hidden rounded border border-l-[3px] transition-all cursor-pointer',
        isActive 
          ? 'bg-[#eaeae6] border-zinc-500 border-l-[#f05523] dark:bg-[#202020] dark:border-zinc-400' 
          : 'bg-[#f8f8f6] border-[#e4e4e0] border-l-zinc-400 hover:bg-[#eaeae6] dark:bg-[#161616] dark:border-[#2c2c2c] dark:border-l-zinc-600 dark:hover:bg-[#202020]',
      )}
      style={{
        gridColumn: `${clip.start} / span ${clip.duration}`,
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Braun Vent style micro grid pattern */}
      <div className="absolute inset-y-0 right-2 w-8 opacity-10 flex gap-0.5 items-center pointer-events-none">
        <div className="h-10 w-[1px] bg-zinc-600" />
        <div className="h-10 w-[1px] bg-zinc-600" />
        <div className="h-10 w-[1px] bg-zinc-600" />
        <div className="h-10 w-[1px] bg-zinc-600" />
      </div>

      <div className="relative z-10 flex w-full items-center justify-between px-3">
        <div className="flex flex-col items-start gap-1 overflow-hidden">
          <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase">
            {clip.name}
          </span>
          {clip.subtitle && (
            <span className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
              {clip.subtitle}
            </span>
          )}
        </div>
        <Maximize2
          size={10}
          className="text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100"
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
}) => (
  <m.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
  >
    <m.div
      layoutId={`clip-${clip.id}`}
      className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[#d4d4d0] bg-[#f4f4f0] shadow-2xl dark:border-[#27272a] dark:bg-[#121212]"
    >
      {/* Window Header */}
      <div className="flex items-center justify-between border-b border-[#e4e4e0] bg-[#f8f8f6] px-6 py-4 dark:border-[#202020] dark:bg-[#161616]">
        <div className="flex items-center gap-4">
          <div className="rounded border border-[#d4d4d0] bg-white px-3 py-1 dark:border-[#27272a] dark:bg-[#1a1a1a]">
            <span className="font-mono text-[10px] font-bold text-[#f05523] uppercase tracking-wider">
              {clip.name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Braun System Toggles instead of fake knobs */}
          <div className="hidden gap-2 md:flex">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-3 w-5 rounded-full border border-[#d4d4d0] bg-[#e8e8e4] p-[1px] dark:border-[#27272a] dark:bg-[#1a1a1a]"
              >
                <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
              </div>
            ))}
          </div>
          <div className="h-6 w-px bg-[#e4e4e0] dark:bg-[#202020]" />
          <button
            onClick={onClose}
            aria-label="Close clip detail"
            className="rounded border border-[#d4d4d0] bg-white p-1 text-zinc-500 hover:bg-[#f4f4f0] dark:border-[#27272a] dark:bg-[#1a1a1a] dark:hover:bg-[#202020]"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="scrollbar-thin scrollbar-track-zinc-100 scrollbar-thumb-zinc-300 dark:scrollbar-track-zinc-900 dark:scrollbar-thumb-zinc-700 flex-1 overflow-y-auto bg-white p-6 text-zinc-900 dark:bg-[#181818] dark:text-zinc-300">
        {clip.content}
      </div>
    </m.div>
  </m.div>
)

export function AboutSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeClip, setActiveClip] = useState<Clip | null>(null)
  const [hoveredClip, setHoveredClip] = useState<Clip | null>(null)
  const [mutedTracks, setMutedTracks] = useState<Set<string>>(new Set())
  const [soloedTrack, setSoloedTrack] = useState<string | null>(null)

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

      // Add progress based on time elapsed (10s duration = 10000ms)
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

  // --- Data ---
  const tracks: Track[] = [
    {
      id: 'bio',
      name: 'IDENTITY',
      icon: User,
      color: 'text-blue-500',
      clips: [
        {
          id: 'bio-main',
          name: 'profile.tsx',
          subtitle: 'About Me',
          description: 'Frontend Engineer based in Jakarta. 4+ Years Exp.',
          start: 1,
          duration: 4,
          type: 'bio',
          content: (
            <div className="mx-auto max-w-4xl">
              {/* VST-style header */}
              <div className="mb-8 flex items-center justify-between border-b-2 border-zinc-200 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/30">
                    <User size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">
                      ADITYA HIMAONE
                    </h1>
                    <p className="text-xs tracking-widest text-zinc-500 uppercase">
                      Frontend Engineer / Jakarta Selatan
                    </p>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-xs font-bold text-zinc-500">MODEL NO.</div>
                  <div className="text-xl font-bold text-zinc-700 dark:text-zinc-300">
                    AH-2026-MKIII
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                {/* Left: Spec Sheet */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Role', 'Frontend Developer'],
                        ['Location', 'Jakarta Selatan, ID'],
                        ['Experience', '4+ Years'],
                        ['Focus', 'React / Next.js'],
                        ['Architecture', 'App Router / SSR'],
                        ['Status', 'Available'],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between rounded border border-zinc-100 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <span className="text-xs text-zinc-500">{k}</span>
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      About
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      Passionate developer bridging the gap between engineering logic
                      and creative design. Just as a producer layers sounds to create
                      a song, I layer code to build immersive digital experiences.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      Specialized in building high-performance web applications with
                      a focus on interaction design, animation, and accessibility.
                      Currently pushing pixels at Jakarta Selatan while exploring
                      the intersection of audio and code.
                    </p>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Signal Flow
                    </h3>
                    <div className="space-y-3">
                      {[
                        { year: '2026', label: 'Senior Frontend Engineer', desc: 'Building scalable UI systems' },
                        { year: '2024', label: 'Frontend Developer', desc: 'React / Next.js ecosystem' },
                        { year: '2022', label: 'Junior Developer', desc: 'Started the journey' },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-300 bg-white text-[10px] font-bold dark:border-zinc-700 dark:bg-zinc-900">
                              {item.year.slice(2)}
                            </div>
                            {i < 2 && (
                              <div className="mt-1 h-full w-px bg-zinc-200 dark:bg-zinc-800" />
                            )}
                          </div>
                          <div className="pb-4">
                            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                              {item.label}
                            </div>
                            <div className="text-xs text-zinc-500">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Modules & Status */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <h3 className="mb-4 text-xs font-bold text-zinc-500 uppercase">
                      Core Modules
                    </h3>
                    <div className="space-y-2">
                      {[
                        { name: 'React', level: 95 },
                        { name: 'TypeScript', level: 90 },
                        { name: 'Next.js', level: 92 },
                        { name: 'Tailwind CSS', level: 95 },
                        { name: 'Node.js', level: 80 },
                        { name: 'Motion', level: 85 },
                      ].map((tech) => (
                        <div key={tech.name}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="text-zinc-600 dark:text-zinc-300">
                              {tech.name}
                            </span>
                            <span className="font-mono text-zinc-500">
                              {tech.level}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                              style={{ width: `${tech.level}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Panel */}
                  <div className="rounded-lg border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-950/20">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-xs font-bold text-green-700 dark:text-green-400">
                        SYSTEM OPERATIONAL
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-green-700/80 dark:text-green-400/80">
                      Currently available for new projects, collaborations, and
                      freelance opportunities. Open to remote and hybrid roles.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        REMOTE
                      </span>
                      <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        HYBRID
                      </span>
                      <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        FULL-TIME
                      </span>
                    </div>
                  </div>

                  {/* Contact quick links */}
                  <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="mb-3 text-xs font-bold text-zinc-500 uppercase">
                      I/O Ports
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Email', value: 'adityahimaone@gmail.com' },
                        { label: 'GitHub', value: '@adityahimaone' },
                        { label: 'LinkedIn', value: '/in/adityahimaone' },
                      ].map((link) => (
                        <div
                          key={link.label}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-zinc-500">{link.label}</span>
                          <span className="font-mono text-zinc-700 dark:text-zinc-300">
                            {link.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'stats',
      name: 'ANALYTICS',
      icon: Activity,
      color: 'text-green-500',
      clips: [
        {
          id: 'stats-main',
          name: 'metrics.json',
          subtitle: 'Key Stats',
          description: '4+ Years Exp, 20+ Projects, 100% Commitment.',
          start: 3,
          duration: 3,
          type: 'stats',
          content: (
            <div className="mx-auto max-w-4xl">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between border-b-2 border-zinc-200 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/30">
                    <Activity size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">
                      METRICS
                    </h1>
                    <p className="text-xs tracking-widest text-zinc-500 uppercase">
                      Real-time Performance Data
                    </p>
                  </div>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <span className="text-xs font-bold text-zinc-500">LIVE</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Left: Main Stats */}
                <div className="space-y-6">
                  {/* Big Numbers */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Years', value: '4+', suffix: '', color: 'text-blue-600 dark:text-blue-400' },
                      { label: 'Projects', value: '20', suffix: '+', color: 'text-green-600 dark:text-green-400' },
                      { label: 'Commit', value: '100', suffix: '%', color: 'text-amber-600 dark:text-amber-400' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col items-center rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
                      >
                        <span className={cn('text-3xl font-black', stat.color)}>
                          {stat.value}
                          <span className="text-lg">{stat.suffix}</span>
                        </span>
                        <span className="mt-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Experience Bars */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <h3 className="mb-4 text-xs font-bold text-zinc-500 uppercase">
                      Experience Levels
                    </h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Frontend Development', level: 95, color: 'bg-blue-500' },
                        { name: 'UI/UX Design', level: 85, color: 'bg-purple-500' },
                        { name: 'Animation & Motion', level: 80, color: 'bg-pink-500' },
                        { name: 'Backend Integration', level: 70, color: 'bg-amber-500' },
                        { name: 'DevOps & CI/CD', level: 60, color: 'bg-green-500' },
                      ].map((skill) => (
                        <div key={skill.name}>
                          <div className="mb-1.5 flex justify-between text-xs">
                            <span className="text-zinc-600 dark:text-zinc-300">
                              {skill.name}
                            </span>
                            <span className="font-mono text-zinc-500">
                              {skill.level}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div
                              className={cn('h-full rounded-full', skill.color)}
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Yearly breakdown */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <h3 className="mb-4 text-xs font-bold text-zinc-500 uppercase">
                      Output History
                    </h3>
                    <div className="flex items-end gap-2">
                      {[
                        { year: '22', val: 30 },
                        { year: '23', val: 55 },
                        { year: '24', val: 80 },
                        { year: '25', val: 65 },
                        { year: '26', val: 90 },
                      ].map((bar) => (
                        <div key={bar.year} className="flex flex-1 flex-col items-center gap-1">
                          <div className="w-full rounded-t bg-zinc-200 dark:bg-zinc-800" style={{ height: `${bar.val * 0.8}px` }}>
                            <div
                              className="h-full rounded-t bg-blue-500/80 dark:bg-blue-400/80"
                              style={{ height: `${bar.val}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500">'{bar.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Detailed Metrics */}
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Code Commits', value: '2.4K', icon: '⌘' },
                      { label: 'Coffees', value: '∞', icon: '☕' },
                      { label: 'Stack Overflow', value: 'Daily', icon: '🔍' },
                      { label: 'Spotify Hours', value: '3.2K', icon: '🎵' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="mt-2 text-xl font-bold text-zinc-800 dark:text-zinc-200">
                          {item.value}
                        </span>
                        <span className="text-[10px] text-zinc-500">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Currently */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-950/20">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-amber-700 uppercase dark:text-amber-400">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                      Currently Processing
                    </h3>
                    <div className="space-y-2">
                      {[
                        'Exploring AI-assisted development workflows',
                        'Building interactive audio-visual experiences',
                        'Deep diving into WebGL and Three.js',
                        'Contributing to open-source projects',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1 h-1 w-1 rounded-full bg-amber-400" />
                          <span className="text-xs text-amber-800 dark:text-amber-300">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Philosophy */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <h3 className="mb-3 text-xs font-bold text-zinc-500 uppercase">
                      Design Philosophy
                    </h3>
                    <blockquote className="border-l-2 border-zinc-300 pl-3 text-sm italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                      "Every interface is an instrument. The user should feel
                      like they're playing, not working."
                    </blockquote>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['Pixel Perfect', 'Accessible', 'Performant', 'Delightful'].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-bold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'audio',
      name: 'AUDIO',
      icon: Music,
      color: 'text-purple-500',
      clips: [
        {
          id: 'audio-main',
          name: 'now_playing.mp3',
          subtitle: 'Spotify',
          description: 'Now Playing: Spotify Integration.',
          start: 5,
          duration: 5,
          type: 'spotify',
          content: (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="relative w-full rounded-lg bg-zinc-900 p-8 shadow-2xl">
                {/* Rack Ears */}
                <div className="absolute top-0 bottom-0 -left-4 flex w-4 flex-col items-center justify-between rounded-l border-r border-black/50 bg-zinc-800 py-4">
                  <div className="h-3 w-2 rounded-full bg-zinc-950 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]" />
                  <div className="h-3 w-2 rounded-full bg-zinc-950 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]" />
                </div>
                <div className="absolute top-0 -right-4 bottom-0 flex w-4 flex-col items-center justify-between rounded-r border-l border-black/50 bg-zinc-800 py-4">
                  <div className="h-3 w-2 rounded-full bg-zinc-950 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]" />
                  <div className="h-3 w-2 rounded-full bg-zinc-950 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]" />
                </div>

                <div className="mb-6 flex items-center justify-center gap-3 text-amber-500">
                  <Zap className="animate-pulse" size={20} />
                  <span className="font-mono font-bold tracking-widest">
                    SIGNAL PROCESSING
                  </span>
                </div>

                <NowPlaying />

                <div className="mt-8 border-t border-white/10 pt-6 text-center">
                  <p className="font-mono text-xs text-zinc-500">
                    "Music is the hidden arithmetic of the soul, which does not
                    know that it is counting."
                  </p>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
  ]

  return (
    <>
      <section id="about" className="bg-[#f5f5f3] py-24 dark:bg-[#121212]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-2 rounded bg-[#e8e8e4] border border-[#d4d4d0] px-3 py-1 font-mono text-[9px] font-bold text-zinc-600 uppercase tracking-widest dark:bg-[#1a1a1a] dark:border-[#27272a] dark:text-zinc-400"
            >
              <Layers className="h-3 w-3" />
              <span>arrangement view</span>
            </m.div>
            <h2 className="font-sans text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
              Functional Flow
            </h2>
          </div>

          {/* Braun Deck Interface */}
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded border border-[#d4d4d0] bg-[#f4f4f0] shadow-xl dark:border-[#27272a] dark:bg-[#121212]">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-[#d4d4d0] bg-[#f8f8f6] px-4 py-2 dark:border-[#202020] dark:bg-[#161616]">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    aria-label={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
                    className={cn(
                      'flex h-7 w-7 cursor-pointer items-center justify-center rounded border transition-all',
                      isPlaying
                        ? 'bg-[#f05523] border-[#c03d15] text-white shadow-inner'
                        : 'bg-[#e8e8e4] border-[#d4d4d0] text-zinc-600 hover:bg-[#eaeae6] active:translate-y-[1px] dark:bg-[#202020] dark:border-[#2c2c2c] dark:text-zinc-400'
                    )}
                  >
                    {isPlaying ? (
                      <Pause size={12} fill="currentColor" />
                    ) : (
                      <Play size={12} fill="currentColor" />
                    )}
                  </button>
                  <button
                    onClick={handleStop}
                    aria-label="Stop Timeline"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-[#d4d4d0] bg-[#e8e8e4] text-zinc-600 hover:bg-[#eaeae6] active:translate-y-[1px] dark:border-[#2c2c2c] dark:bg-[#202020] dark:text-zinc-400"
                  >
                    <Square size={12} fill="currentColor" />
                  </button>
                </div>

                <div className="hidden items-center gap-3 rounded border border-[#d4d4d0] bg-white px-3 py-1 font-mono text-[10px] font-bold text-zinc-700 md:flex dark:border-[#2c2c2c] dark:bg-[#1a1a1a] dark:text-zinc-300">
                  <span className="text-[#f05523]">
                    00:0{isPlaying ? Math.floor(Date.now() / 1000) % 10 : '0'}
                    :00
                  </span>
                  <span className="text-[#d4d4d0]">|</span>
                  <span>120 bpm</span>
                  <span className="text-[#d4d4d0]">|</span>
                  <span>4/4</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={cn('h-1.5 w-1.5 rounded-full', isPlaying ? 'bg-[#f05523] animate-ping' : 'bg-zinc-400')} />
                <span className="font-mono text-[8px] font-bold text-zinc-500">RUNNING</span>
              </div>
            </div>

            {/* Main Workspace */}
            <div className="relative flex h-[400px]">
              {/* Track Headers (Left) */}
              <div className="relative z-20 flex flex-col border-r border-[#d4d4d0] bg-[#f4f4f0] dark:border-[#27272a] dark:bg-[#121212]">
                <div className="h-8 border-b border-[#d4d4d0] bg-[#f8f8f6] dark:border-[#27272a] dark:bg-[#161616]" />{' '}
                {/* Ruler Spacer */}
                {tracks.map((track) => (
                  <TrackHeader
                    key={track.id}
                    track={track}
                    muted={mutedTracks.has(track.id)}
                    soloed={soloedTrack === track.id}
                    onMute={() => toggleMute(track.id)}
                    onSolo={() => toggleSolo(track.id)}
                  />
                ))}
              </div>

              {/* Timeline (Right) */}
              <div className="relative flex-1 overflow-x-auto overflow-y-hidden bg-white dark:bg-[#181818]">
                <div className="relative h-full min-w-[800px]">
                  <TimeRuler />

                  {/* Grid Background */}
                  <div
                    className="pointer-events-none absolute inset-0 top-8"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
                      backgroundSize: '8.33% 100%',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 top-8 hidden dark:block"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                      backgroundSize: '8.33% 100%',
                    }}
                  />

                  {/* Playhead pointer - Classic orange needle */}
                  <div
                    ref={playheadRef}
                    className="pointer-events-none absolute top-0 bottom-0 z-30 w-px bg-[#f05523] transition-all duration-75 ease-linear"
                    style={{ left: '0%' }}
                  >
                    <div className="absolute -top-1 -left-1 h-0 w-0 border-x-[4px] border-t-[6px] border-x-transparent border-t-[#f05523]" />
                  </div>

                  {/* Tracks & Clips */}
                  <div className="relative grid grid-rows-[repeat(3,6rem)]">
                    {tracks.map((track) => {
                      const isVisible =
                        !mutedTracks.has(track.id) &&
                        (!soloedTrack || soloedTrack === track.id)

                      return (
                        <div
                          key={track.id}
                          className={cn(
                            'relative grid grid-cols-12 gap-1 border-b border-[#d4d4d0]/55 p-1 transition-opacity dark:border-[#27272a]/50',
                            isVisible ? 'opacity-100' : 'opacity-20 grayscale',
                          )}
                        >
                          {track.clips.map((clip) => (
                            <ClipBlock
                              key={clip.id}
                              clip={clip}
                              color={track.color}
                              isActive={activeClip?.id === clip.id}
                              onClick={() => setActiveClip(clip)}
                              onHover={(isHovered) =>
                                setHoveredClip(isHovered ? clip : null)
                              }
                            />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Bar */}
            <div className="flex h-8 items-center border-t border-[#d4d4d0] bg-[#f8f8f6] px-4 text-[10px] font-mono text-zinc-500 dark:border-[#202020] dark:bg-[#161616] dark:text-zinc-400 uppercase">
              <span className="mr-2 font-bold text-[#f05523]">
                system log:
              </span>
              {hoveredClip
                ? hoveredClip.description.toLowerCase()
                : 'hover over a module card to view details. click to expand.'}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {activeClip && (
            <DetailWindow
              clip={activeClip}
              onClose={() => setActiveClip(null)}
            />
          )}
        </AnimatePresence>
      </section>
    </>
  )
}
