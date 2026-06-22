'use client'

import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence, useInView } from 'motion/react'
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

// --- Synth / VST Custom Redesign Components ---

const SynthKnob = ({ label, value, degree = 0 }: { label: string; value: string; degree?: number }) => (
  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-zinc-200 bg-white/60 dark:border-zinc-800 dark:bg-black/45 shadow-sm">
    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-350 bg-gradient-to-b from-zinc-100 to-zinc-300 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 shadow-md">
      {/* Outer indicator notch */}
      <div
        className="absolute h-4 w-1 bg-blue-500 dark:bg-blue-400 top-0.5 rounded-full"
        style={{ transform: `rotate(${degree}deg)`, transformOrigin: '50% 100%' }}
      />
      {/* Inner dial cap */}
      <div className="h-8 w-8 rounded-full border border-zinc-300 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 shadow-inner" />
    </div>
    <span className="text-[10px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">{label}</span>
    <span className="font-mono text-xs font-black text-zinc-900 dark:text-zinc-100">{value}</span>
  </div>
)

const PatchSocket = ({ label, active = false }: { label: string; active?: boolean }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-inner transition-colors',
        active
          ? 'border-blue-500 bg-zinc-100 dark:border-blue-400 dark:bg-zinc-900'
          : 'border-zinc-300 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-950'
      )}
    >
      {/* Core plug hole */}
      <div className="h-5 w-5 rounded-full bg-zinc-900 dark:bg-black border border-white/10" />
      {active && (
        <div className="absolute h-2.5 w-2.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping" />
      )}
    </div>
    <span className="text-[9px] font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">{label}</span>
  </div>
)

const MixerFader = ({ label, value, colorClass }: { label: string; value: number; colorClass: string }) => (
  <div className="flex items-center gap-4 py-2">
    <span className="w-24 text-left text-xs font-bold text-zinc-600 dark:text-zinc-400 truncate">{label}</span>
    <div className="relative flex-1 h-8 flex items-center">
      {/* Track line */}
      <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded border-b border-white/5" />
      {/* Vertical ticks */}
      <div className="absolute inset-x-0 h-4 flex justify-between pointer-events-none opacity-40">
        {[...Array(9)].map((_, idx) => (
          <div key={idx} className="w-px h-2.5 bg-zinc-450 dark:bg-zinc-650" />
        ))}
      </div>
      {/* Active Fill Track */}
      <div
        className={cn('absolute h-1.5 rounded transition-all duration-500', colorClass)}
        style={{ width: `${value}%` }}
      />
      {/* Metallic sliding handle */}
      <div
        className="absolute h-6 w-3 -ml-1.5 rounded border border-zinc-400 bg-gradient-to-b from-zinc-100 to-zinc-355 shadow-md dark:border-zinc-700 dark:from-zinc-700 dark:to-zinc-850 cursor-pointer hover:brightness-110 flex flex-col justify-between py-1"
        style={{ left: `${value}%` }}
      >
        <div className="h-0.5 w-full bg-zinc-650 dark:bg-zinc-400" />
        <div className="h-0.5 w-full bg-zinc-650 dark:bg-zinc-400" />
      </div>
    </div>
    <span className="w-10 font-mono text-xs font-black text-right text-zinc-800 dark:text-zinc-200">{value}%</span>
  </div>
)

const TimeRuler = () => (
  <div className="flex h-8 min-w-[800px] border-b border-zinc-200 bg-zinc-50/50 font-mono text-[10px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
    <div className="flex flex-1">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="flex flex-1 items-end justify-start border-r border-zinc-200/50 px-1 pb-1 dark:border-zinc-800/50"
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
  <div className="flex h-24 w-14 shrink-0 flex-col justify-between border-r border-b border-zinc-200 bg-zinc-50 p-2 md:w-32 dark:border-zinc-800 dark:bg-zinc-900">
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded',
          track.color,
          'bg-opacity-20 text-current',
        )}
      >
        <track.icon size={14} />
      </div>
      <span className="hidden truncate text-xs font-bold text-zinc-600 md:block dark:text-zinc-400">
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
          'flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold transition-colors',
          muted
            ? 'bg-blue-500 text-white'
            : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700',
        )}
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
          'flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold transition-colors',
          soloed
            ? 'bg-yellow-500 text-black'
            : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700',
        )}
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
        'group relative flex h-20 items-center overflow-hidden rounded-md border border-l-4 transition-all hover:brightness-110',
        color.replace('text-', 'border-l-').replace('bg-', 'bg-opacity-20'),
        'border-zinc-200 bg-white dark:border-zinc-700/50 dark:bg-zinc-800',
        isActive ? 'ring-2 ring-blue-500/20 dark:ring-white/20' : '',
      )}
      style={{
        gridColumn: `${clip.start} / span ${clip.duration}`,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Waveform / Pattern Background */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 50%, currentColor 50%)',
          backgroundSize: '4px 100%',
          color: 'inherit',
        }}
      />

      <div className="relative z-10 flex w-full items-center justify-between px-3">
        <div className="flex flex-col items-start gap-1 overflow-hidden">
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-black/30 dark:text-zinc-300">
            {clip.name}
          </span>
          {clip.subtitle && (
            <span className="truncate text-xs font-bold text-zinc-700 dark:text-zinc-200">
              {clip.subtitle}
            </span>
          )}
        </div>
        <Maximize2
          size={12}
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
    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090909]/90 p-4 backdrop-blur-md md:p-8"
    onClick={onClose}
  >
    <m.div
      initial={{ scale: 0.95, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 30 }}
      onClick={(e) => e.stopPropagation()}
      className="glass-void relative flex h-[85vh] max-h-[650px] w-full max-w-5xl flex-col overflow-hidden border border-[#272727] shadow-2xl"
    >
      {/* Outer Metal Bezel Overlay */}
      <div className="absolute inset-0 pointer-events-none border border-white/20 rounded z-30" />

      {/* VST Studio Hardware Header */}
      <div className="relative flex items-center justify-between border-b-2 border-zinc-400 bg-gradient-to-b from-zinc-300 to-zinc-400 px-6 py-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950 z-10">
        
        {/* Left rack ear mount hole */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <div className="h-2 w-2 rounded-full bg-zinc-600 shadow-inner border border-black/30" />
        </div>

        <div className="flex items-center gap-4 pl-2">
          {/* LCD Status Screen */}
          <div className="relative overflow-hidden rounded border border-amber-500/30 bg-black/90 px-4 py-1.5 shadow-[inset_0_2px_8px_rgba(0,0,0,1)]">
            <span className="font-mono text-xs font-bold text-amber-500 tracking-wider shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              {clip.name.toUpperCase()} // STATUS: ONLINE
            </span>
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Center: Vent Grills */}
        <div className="hidden items-center gap-1 opacity-40 lg:flex">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 w-1 rounded-full bg-zinc-600 dark:bg-zinc-800" />
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-6">
          {/* Control Dials */}
          <div className="hidden items-center gap-4 md:flex">
            {['PARAM 1', 'PARAM 2'].map((label, i) => (
              <div key={label} className="flex flex-col items-center">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-zinc-500 bg-gradient-to-b from-zinc-200 to-zinc-400 shadow-md dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900">
                  <div className="absolute h-4 w-0.5 bg-zinc-850 dark:bg-zinc-300 top-0.5 rounded-full" style={{ transform: `rotate(${45 + (i * 90)}deg)`, transformOrigin: '50% 100%' }} />
                </div>
                <span className="text-[7px] font-bold text-zinc-600 dark:text-zinc-400 mt-1">{label}</span>
              </div>
            ))}
          </div>

          <div className="h-8 w-px bg-zinc-400 dark:bg-zinc-800" />
          
          <button
            onClick={onClose}
            aria-label="Close clip detail"
            className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-red-900/30 bg-gradient-to-b from-red-500 to-red-700 text-white shadow-md hover:brightness-110 active:scale-95"
          >
            <X size={14} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Right rack ear mount hole */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="h-2 w-2 rounded-full bg-zinc-600 shadow-inner border border-black/30" />
        </div>
      </div>

      {/* Outboard Processor Interior (Content Display) */}
      <div className="scrollbar-none no-scrollbar flex-1 overflow-y-auto bg-zinc-50 p-4 md:p-6 text-zinc-900 dark:bg-[#121214] dark:text-zinc-300">
        <div className="relative p-4 md:p-6 rounded-lg border border-zinc-350 bg-white/50 shadow-inner dark:border-zinc-800/80 dark:bg-black/30 overflow-x-hidden no-scrollbar">
          {clip.content}
        </div>
      </div>
    </m.div>
  </m.div>
)

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isSectionInView = useInView(sectionRef, { amount: 0.3, once: true })

  const [isPlaying, setIsPlaying] = useState(false)
  const [activeClip, setActiveClip] = useState<Clip | null>(null)
  const [hoveredClip, setHoveredClip] = useState<Clip | null>(null)
  const [mutedTracks, setMutedTracks] = useState<Set<string>>(new Set())
  const [soloedTrack, setSoloedTrack] = useState<string | null>(null)

  // Playhead animation
  const playheadRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const lastTimestampRef = useRef<number>(0)

  const handleStop = () => {
    setIsPlaying(false)
    progressRef.current = 0
    if (playheadRef.current) {
      playheadRef.current.style.left = '0%'
    }
  }

  useEffect(() => {
    if (isSectionInView) {
      setIsPlaying(true)
    } else {
      handleStop()
    }
  }, [isSectionInView])

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
              {/* Profile Synth Header */}
              <div className="mb-8 flex items-center justify-between border-b-2 border-zinc-200 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-blue-500/20 bg-blue-500/10 dark:border-blue-400/25 dark:bg-blue-400/10">
                    <User size={28} className="text-blue-500 dark:text-blue-400 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">
                      ADITYA HIMAONE
                    </h1>
                    <p className="text-xs tracking-widest text-blue-500 dark:text-blue-400 uppercase font-black">
                      Frontend Engineer / Jakarta Selatan
                    </p>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-[10px] font-bold text-zinc-550 dark:text-zinc-500">SYSTEM PROFILE MODEL</div>
                  <div className="font-mono text-xl font-black text-zinc-800 dark:text-zinc-200">
                    AH-2026-MKIV
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                {/* Left: Synth Spec Sheet */}
                <div className="lg:col-span-3 space-y-6">
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-xs font-black text-zinc-550 dark:text-zinc-400 uppercase tracking-widest">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Parameter Dial Matrix
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <SynthKnob label="Role" value="Frontend" degree={280} />
                      <SynthKnob label="Location" value="Jakarta" degree={90} />
                      <SynthKnob label="Experience" value="4+ Years" degree={340} />
                      <SynthKnob label="Focus" value="React / Next" degree={320} />
                      <SynthKnob label="Stack Engine" value="App Router" degree={180} />
                      <SynthKnob label="Availability" value="Ready" degree={45} />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-zinc-550 dark:text-zinc-400 uppercase tracking-widest">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      System Bios
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      Passionate developer bridging the gap between engineering logic
                      and creative design. Just as a producer layers sounds to create
                      a song, I layer code to build immersive digital experiences.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      Specialized in building high-performance web applications with
                      a focus on interaction design, animation, and accessibility.
                      Currently pushing pixels at Jakarta Selatan while exploring
                      the intersection of audio synthesis and code architecture.
                    </p>
                  </div>

                  {/* Signal Flow Patchbay */}
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-xs font-black text-zinc-550 dark:text-zinc-400 uppercase tracking-widest">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Signal Flow Patchbay
                    </h3>
                    <div className="relative rounded-xl border border-zinc-350 bg-zinc-100 p-5 dark:border-zinc-800 dark:bg-zinc-950/80 shadow-inner">
                      {/* Connection Cable Graphic */}
                      <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-40 dark:opacity-80" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 45 40 Q 120 70 200 40 T 350 40" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="5,5" className="animate-[dash_2s_linear_infinite]" />
                        <path d="M 200 40 Q 280 75 350 40" fill="none" stroke="#22c55e" strokeWidth="2" />
                      </svg>
                      
                      <style>{`
                        @keyframes dash {
                          to {
                            stroke-dashoffset: -20;
                          }
                        }
                      `}</style>

                      <div className="flex justify-between items-center relative z-10">
                        <PatchSocket label="Source (Me)" active={true} />
                        <PatchSocket label="Logic (React)" active={true} />
                        <PatchSocket label="Output (UI)" active={true} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Console Modules & Status */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-xl border border-zinc-300 bg-zinc-100/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
                    <h3 className="mb-4 text-xs font-black text-zinc-550 dark:text-zinc-400 uppercase tracking-widest">
                      Channel Strip EQ
                    </h3>
                    <div className="space-y-1.5">
                      <MixerFader label="React" value={95} colorClass="bg-blue-500" />
                      <MixerFader label="TypeScript" value={90} colorClass="bg-indigo-500" />
                      <MixerFader label="Next.js" value={92} colorClass="bg-emerald-500" />
                      <MixerFader label="Tailwind CSS" value={95} colorClass="bg-cyan-500" />
                      <MixerFader label="Node.js" value={80} colorClass="bg-amber-500" />
                      <MixerFader label="Motion" value={85} colorClass="bg-purple-500" />
                    </div>
                  </div>

                  {/* Status Panel */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-xs font-black tracking-widest text-emerald-600 dark:text-emerald-400">
                        SYSTEM OPERATIONAL
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-650 dark:text-zinc-450">
                      Currently available for senior frontend roles, UI engineering contracts, and creative technology partnerships.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {['REMOTE', 'HYBRID', 'CONTRACT'].map((tag) => (
                        <span key={tag} className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* I/O Port Pins */}
                  <div className="rounded-xl border border-zinc-300 p-5 dark:border-zinc-800">
                    <h3 className="mb-3 text-xs font-black text-zinc-550 dark:text-zinc-400 uppercase tracking-widest">
                      I/O Terminals
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'EMAIL', value: 'adityahimaone@gmail.com' },
                        { label: 'GITHUB', value: 'adityahimaone' },
                        { label: 'LINKEDIN', value: 'adityahimaone' },
                      ].map((link) => (
                        <div key={link.label} className="flex justify-between items-center text-xs">
                          <span className="text-[10px] font-black text-zinc-500">{link.label}</span>
                          <span className="font-mono text-zinc-850 dark:text-zinc-200 font-bold bg-zinc-200 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-350 dark:border-zinc-800">{link.value}</span>
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-green-500/20 bg-green-500/10 dark:border-green-400/25 dark:bg-green-400/10">
                    <Activity size={24} className="text-green-500 dark:text-green-400 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">
                      METRICS
                    </h1>
                    <p className="text-xs tracking-widest text-green-500 dark:text-green-400 uppercase font-black">
                      Real-time Performance Data
                    </p>
                  </div>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  <span className="font-mono text-xs font-bold text-zinc-500">LIVE FEED</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Left: Main Stats */}
                <div className="space-y-6">
                  {/* Digital Nixie Tube Display */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Years Exp', value: '04', suffix: 'Y', color: 'text-amber-500' },
                      { label: 'Projects', value: '20', suffix: '+', color: 'text-emerald-500' },
                      { label: 'Commit', value: '99', suffix: '%', color: 'text-rose-500' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col items-center rounded-xl border border-zinc-400/40 bg-zinc-950 p-4 shadow-inner relative overflow-hidden"
                      >
                        {/* Glow Filter */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-zinc-950 pointer-events-none" />
                        <span className={cn('text-3xl font-black relative z-10 font-mono tracking-widest', stat.color, 'drop-shadow-[0_0_6px_currentColor]')}>
                          {stat.value}
                          <span className="text-base font-bold select-none">{stat.suffix}</span>
                        </span>
                        <span className="mt-2 text-[9px] font-bold tracking-wider text-zinc-500 uppercase relative z-10">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Faders Console for Expertise */}
                  <div className="rounded-xl border border-zinc-300 bg-zinc-100/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
                    <h3 className="mb-4 text-xs font-black text-zinc-550 dark:text-zinc-400 uppercase tracking-widest">
                      Fader Deck Expertise
                    </h3>
                    <div className="space-y-1">
                      <MixerFader label="Frontend Core" value={95} colorClass="bg-blue-500" />
                      <MixerFader label="UI/UX & Sound" value={85} colorClass="bg-purple-500" />
                      <MixerFader label="Fluid Animations" value={90} colorClass="bg-pink-500" />
                      <MixerFader label="Node API Sync" value={75} colorClass="bg-amber-500" />
                      <MixerFader label="System Ops" value={65} colorClass="bg-emerald-500" />
                    </div>
                  </div>

                  {/* Step Sequencer Output History */}
                  <div className="rounded-xl border border-zinc-300 bg-zinc-100/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
                    <h3 className="mb-4 text-xs font-black text-zinc-550 dark:text-zinc-400 uppercase tracking-widest">
                      Step Sequencer Activity
                    </h3>
                    <div className="flex gap-2 items-center">
                      {[
                        { step: '01', val: 3, label: "'22" },
                        { step: '02', val: 5, label: "'23" },
                        { step: '03', val: 8, label: "'24" },
                        { step: '04', val: 6, label: "'25" },
                        { step: '05', val: 9, label: "'26" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col gap-1 border border-zinc-300 dark:border-zinc-850 rounded p-1 bg-white/60 dark:bg-black/30 shadow-inner">
                            {[...Array(10)].map((_, tickIdx) => {
                              const isActive = 10 - tickIdx <= item.val
                              return (
                                <div
                                  key={tickIdx}
                                  className={cn(
                                    'h-2 w-full rounded-sm transition-all duration-300',
                                    isActive
                                      ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.7)]'
                                      : 'bg-zinc-200 dark:bg-zinc-800'
                                  )}
                                />
                              )
                            })}
                          </div>
                          <span className="font-mono text-[9px] font-black text-zinc-500">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Detailed Metrics Dashboard */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Code Commits', value: '2.5K', icon: '⌘' },
                      { label: 'Coffees Extracted', value: '∞', icon: '☕' },
                      { label: 'Terminal Debugs', value: 'Daily', icon: '🔍' },
                      { label: 'Track Hours', value: '3.4K', icon: '🎵' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-850 dark:bg-zinc-950 shadow-sm"
                      >
                        <span className="text-xl select-none">{item.icon}</span>
                        <span className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">
                          {item.value}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Operational Status Log */}
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                      Active Threads
                    </h3>
                    <div className="space-y-2">
                      {[
                        'Optimizing core bundle sizes & web vitals scores',
                        'Designing customizable audio synthesizer controllers',
                        'Refining custom Web Audio API filters & effects',
                        'Standardizing reactive responsive grid layouts',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span className="text-xs text-zinc-650 dark:text-zinc-350">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Philosophy Quotes Card */}
                  <div className="rounded-xl border border-zinc-300 bg-zinc-100/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
                    <h3 className="mb-3 text-xs font-black text-zinc-550 dark:text-zinc-400 uppercase tracking-widest">
                      Console Credo
                    </h3>
                    <blockquote className="border-l-4 border-blue-500 pl-3 text-sm italic text-zinc-700 dark:text-zinc-350">
                      "Every interface is an instrument. The user should feel
                      like they're playing, not working."
                    </blockquote>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {['Pixel Perfect', 'Accessible', 'Acoustic UI', 'Delightful'].map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-zinc-300 bg-white px-2 py-0.5 text-[9px] font-bold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 uppercase"
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
            <div className="flex h-full flex-col items-center justify-center py-4">
              <div className="relative w-full max-w-md rounded-xl bg-zinc-950 p-6 shadow-2xl border-2 border-zinc-800/80">
                {/* Rack Mounting Handles */}
                <div className="absolute top-0 bottom-0 -left-4 flex w-4 flex-col items-center justify-between rounded-l border-r border-black bg-zinc-900 py-6">
                  <div className="h-3 w-1.5 rounded bg-black shadow-inner" />
                  <div className="h-3 w-1.5 rounded bg-black shadow-inner" />
                </div>
                <div className="absolute top-0 -right-4 bottom-0 flex w-4 flex-col items-center justify-between rounded-r border-l border-black bg-zinc-900 py-6">
                  <div className="h-3 w-1.5 rounded bg-black shadow-inner" />
                  <div className="h-3 w-1.5 rounded bg-black shadow-inner" />
                </div>

                <div className="mb-6 flex items-center justify-center gap-3 text-amber-500">
                  <Zap className="animate-pulse" size={18} />
                  <span className="font-mono text-xs font-black tracking-widest uppercase">
                    RECEIVER MODULE // DECK-01
                  </span>
                </div>

                <NowPlaying />

                <div className="mt-6 border-t border-white/5 pt-4 text-center">
                  <p className="font-mono text-[10px] text-zinc-550 leading-relaxed italic">
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
      <section ref={sectionRef} id="about" className="bg-[#090909] py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-2 rounded-full border border-zinc-300/20 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-400"
            >
              <Layers className="h-4 w-4" />
              <span>ARRANGEMENT VIEW</span>
            </m.div>
            <h2 className="text-4xl font-bold tracking-tighter text-[#f7f9fa] sm:text-5xl">
              The Workflow
            </h2>
          </div>

          {/* DAW Interface */}
          <div className="glass-void relative mx-auto max-w-6xl overflow-hidden border border-[#272727] shadow-2xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-[#272727] bg-[#0d0d0d] px-4 py-2">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    aria-label={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded transition-colors',
                      isPlaying
                        ? 'bg-[#af50ff] text-white'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10',
                    )}
                  >
                    {isPlaying ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" />
                    )}
                  </button>
                  <button
                    onClick={handleStop}
                    aria-label="Stop Timeline"
                    className="flex h-8 w-8 items-center justify-center rounded bg-white/5 text-zinc-400 hover:bg-white/10"
                  >
                    <Square size={16} fill="currentColor" />
                  </button>
                </div>

                <div className="hidden items-center gap-4 rounded bg-black/40 px-3 py-1 font-mono text-xs text-[#af50ff] md:flex">
                  <span>
                    00:0{isPlaying ? Math.floor(Date.now() / 1000) % 10 : '0'}
                    :00
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-600">|</span>
                  <span>120 BPM</span>
                  <span className="text-zinc-500 dark:text-zinc-600">|</span>
                  <span>4/4</span>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-bold text-zinc-550">REC</span>
              </div>
            </div>

            {/* Main Workspace */}
            <div className="relative flex h-[400px]">
              {/* Track Headers (Left) */}
              <div className="relative z-20 flex flex-col border-r border-[#272727] bg-[#0d0d0d]">
                <div className="h-8 border-b border-[#272727] bg-[#0d0d0d]" />{' '}
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
              <div className="relative flex-1 overflow-x-auto overflow-y-hidden bg-[#090909]">
                <div className="relative h-full min-w-[800px]">
                  <TimeRuler />

                  {/* Grid Background */}
                  <div
                    className="pointer-events-none absolute inset-0 top-8"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                      backgroundSize: '8.33% 100%',
                    }}
                  />

                  {/* Playhead */}
                  <div
                    ref={playheadRef}
                    className="pointer-events-none absolute top-0 bottom-0 z-30 w-px bg-red-500 transition-all duration-75 ease-linear"
                    style={{ left: '0%' }}
                  >
                    <div className="absolute -top-1 -left-1.5 h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-red-500" />
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
                            'relative grid grid-cols-12 gap-1 border-b border-[#272727]/50 p-1 transition-opacity',
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
            <div className="flex h-8 items-center border-t border-[#272727] bg-[#0d0d0d] px-4 text-xs text-zinc-400">
              <span className="mr-2 font-bold text-[#af50ff]">
                INFO
              </span>
              {hoveredClip
                ? hoveredClip.description
                : 'Hover over a clip to view details. Click to expand.'}
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
