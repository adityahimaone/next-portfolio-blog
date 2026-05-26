'use client'

/**
 * Ravemped 4.0 — Skills Section (Pioneer DJM-900 Hardware Mixer)
 *
 * Concept: Skills = DJ Mixer channels. 2 main channels (FRONTEND / BACKEND),
 * 1 hidden channel (SYSTEMS), master strip with VU meter, crossfader, BPM display.
 * Each channel has 3 EQ knobs, channel fader, 5-LED dot system per skill,
 * cue/PFL, solo/mute buttons.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { m, useReducedMotion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { SectionFrame } from '../r3/section-frame'
import { SynthKnob } from '../r3/synth-knob'

// ─── Channel Data ─────────────────────────────────────────

interface SkillItem {
  name: string
  level: number
}

interface ChannelData {
  id: string
  label: string
  color: string
  skills: SkillItem[]
}

const FRONTEND_SKILLS: SkillItem[] = [
  { name: 'HTML', level: 95 },
  { name: 'CSS', level: 95 },
  { name: 'JS', level: 95 },
  { name: 'TS', level: 90 },
  { name: 'REACT', level: 95 },
  { name: 'NEXT', level: 92 },
  { name: 'REMIX', level: 70 },
  { name: 'JQUERY', level: 85 },
]

const BACKEND_SKILLS: SkillItem[] = [
  { name: 'PHP', level: 80 },
  { name: 'PYTHON', level: 70 },
  { name: 'GO', level: 60 },
  { name: 'SQL', level: 65 },
  { name: 'REST', level: 80 },
  { name: 'LINUX', level: 75 },
]

const SYSTEMS_SKILLS: SkillItem[] = [
  { name: 'PM2', level: 85 },
  { name: 'NGINX', level: 80 },
  { name: 'DOCKER', level: 65 },
  { name: 'GIT', level: 90 },
  { name: 'CFLARE', level: 85 },
  { name: 'TAILSCALE', level: 80 },
]

const CHANNELS: ChannelData[] = [
  {
    id: 'ch-a',
    label: 'FRONTEND',
    color: 'var(--r3-clip)',
    skills: FRONTEND_SKILLS,
  },
  {
    id: 'ch-b',
    label: 'BACKEND',
    color: 'var(--r3-beat)',
    skills: BACKEND_SKILLS,
  },
  {
    id: 'ch-sys',
    label: 'SYSTEMS',
    color: 'var(--r3-melody)',
    skills: SYSTEMS_SKILLS,
  },
]

// ─── Utility ──────────────────────────────────────────────

function avgLevel(skills: SkillItem[]): number {
  return Math.round(skills.reduce((a, s) => a + s.level, 0) / skills.length)
}

// ─── LED Dot (5-dot proficiency) ──────────────────────────

function LedDots({ level, boosted }: { level: number; boosted: boolean }) {
  const dots = 5
  const active = Math.round((level / 100) * dots)

  return (
    <div className="flex items-center gap-[2px]">
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 w-1.5 rounded-full transition-all duration-300',
            i < active
              ? 'bg-[var(--r3-signal)] shadow-[0_0_4px_var(--r3-signal)]'
              : 'bg-[var(--r3-edge)]/50',
            boosted && i < active && 'shadow-[0_0_8px_var(--r3-signal)] scale-110',
          )}
        />
      ))}
    </div>
  )
}

// ─── Vertical Fader ───────────────────────────────────────

function VerticalFader({
  value,
  label,
  onChange,
}: {
  value: number
  label: string
  onChange: (v: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      setDragging(true)
      // Set initial position
      const rect = trackRef.current?.getBoundingClientRect()
      if (rect) {
        const pct = 1 - (e.clientY - rect.top) / rect.height
        onChange(Math.max(0, Math.min(100, Math.round(pct * 100))))
      }
    },
    [onChange],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const pct = 1 - (e.clientY - rect.top) / rect.height
      onChange(Math.max(0, Math.min(100, Math.round(pct * 100))))
    },
    [dragging, onChange],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    setDragging(false)
  }, [])

  return (
    <div className="flex flex-col items-center gap-1.5 h-full justify-end pb-1">
      <span className="r3-mono text-[8px] text-[var(--r3-label)] tracking-widest">{value}</span>
      <div
        ref={trackRef}
        className="relative w-full flex-1 min-h-[80px] max-h-[140px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Track */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[4px] rounded-[2px] bg-[var(--r3-rack)] border border-[var(--r3-edge)]" />
        {/* Thumb */}
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 w-[22px] h-[8px] rounded-[2px] transition-shadow cursor-grab',
            dragging && 'cursor-grabbing shadow-[0_0_8px_var(--r3-signal)]',
          )}
          style={{
            top: `${100 - value}%`,
            background:
              'linear-gradient(180deg, #2c2c44 0%, #1a1a2c 100%)',
            border: '1px solid var(--r3-edge)',
            boxShadow: dragging
              ? '0 0 8px var(--r3-signal), inset 0 1px 0 rgba(255,255,255,0.04)'
              : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 4px rgba(0,0,0,0.5)',
          }}
        />
      </div>
      <span className="r3-mono text-[8px] text-[var(--r3-text-mute)] tracking-widest uppercase">
        {label}
      </span>
    </div>
  )
}

// ─── VU Meter ─────────────────────────────────────────────

function VuMeter({ level }: { level: number }) {
  const bars = 10

  return (
    <div className="flex items-end gap-[1px] h-20">
      {Array.from({ length: bars }).map((_, i) => {
        const threshold = ((i + 1) / bars) * 100
        const lit = level >= threshold
        const isClip = i >= bars - 1 // last bar = clip indicator
        return (
          <div
            key={i}
            className={cn(
              'w-[6px] transition-all duration-100 rounded-[1px]',
              lit
                ? isClip
                  ? 'bg-[var(--r3-melody)] shadow-[0_0_6px_var(--r3-melody)]'
                  : 'bg-[var(--r3-signal)] shadow-[0_0_4px_var(--r3-signal)]'
                : 'bg-[var(--r3-edge)]/30',
            )}
            style={{ height: `${((i + 1) / bars) * 100}%` }}
          />
        )
      })}
    </div>
  )
}

// ─── Skill Row ────────────────────────────────────────────

function SkillRow({
  skill,
  boosted,
}: {
  skill: SkillItem
  boosted: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-sm hover:bg-[var(--r3-rack)]/50 transition-colors">
      <span
        className={cn(
          'r3-mono text-[9px] tracking-wide truncate',
          boosted ? 'text-[var(--r3-text)]' : 'text-[var(--r3-text-mute)]',
        )}
      >
        {skill.name}
      </span>
      <LedDots level={skill.level} boosted={boosted} />
    </div>
  )
}

// ─── Mixer Channel ────────────────────────────────────────

function MixerChannel({
  channel,
  active,
  eqHi,
  eqMid,
  eqLow,
  fader,
  onEqHi,
  onEqMid,
  onEqLow,
  onFader,
  onCue,
  isCued,
  muted,
  onMute,
  soloed,
  onSolo,
}: {
  channel: ChannelData
  active: boolean
  eqHi: number
  eqMid: number
  eqLow: number
  fader: number
  onEqHi: (v: number) => void
  onEqMid: (v: number) => void
  onEqLow: (v: number) => void
  onFader: (v: number) => void
  onCue: () => void
  isCued: boolean
  muted: boolean
  onMute: () => void
  soloed: boolean
  onSolo: () => void
}) {
  const boosted = eqHi > 0.7 // HI knob >70% = boosted glow

  return (
    <div
      className={cn(
        'r3-panel-rack flex flex-col transition-opacity duration-300',
        !active && 'opacity-40',
      )}
    >
      {/* Channel header */}
      <div className="flex items-center justify-between px-2.5 py-2 border-b border-[var(--r3-edge)]">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: channel.color }}
          />
          <span className="r3-display text-[10px] font-semibold text-[var(--r3-text)] tracking-wider">
            {channel.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onMute}
            className={cn(
              'r3-mono text-[8px] px-1.5 py-0.5 rounded-[2px] border transition-all',
              muted
                ? 'border-[var(--r3-melody)] text-[var(--r3-melody)] bg-[var(--r3-melody)]/10'
                : 'border-[var(--r3-edge)] text-[var(--r3-label)] hover:border-[var(--r3-text-mute)]',
            )}
            aria-label={`${muted ? 'Unmute' : 'Mute'} ${channel.label}`}
          >
            M
          </button>
          <button
            onClick={onSolo}
            className={cn(
              'r3-mono text-[8px] px-1.5 py-0.5 rounded-[2px] border transition-all',
              soloed
                ? 'border-[var(--r3-filament)] text-[var(--r3-filament)] bg-[var(--r3-filament)]/10'
                : 'border-[var(--r3-edge)] text-[var(--r3-label)] hover:border-[var(--r3-text-mute)]',
            )}
            aria-label={`${soloed ? 'Unsolo' : 'Solo'} ${channel.label}`}
          >
            S
          </button>
        </div>
      </div>

      {/* EQ knobs row */}
      <div className="flex items-center justify-around px-1 py-3 border-b border-[var(--r3-edge)]">
        <SynthKnob
          label="HI"
          value={eqHi}
          size="sm"
          accent={channel.color}
          format={(v) => `${Math.round(v * 100)}`}
          onChange={onEqHi}
        />
        <SynthKnob
          label="MID"
          value={eqMid}
          size="sm"
          accent={channel.color}
          format={(v) => `${Math.round(v * 100)}`}
          onChange={onEqMid}
        />
        <SynthKnob
          label="LOW"
          value={eqLow}
          size="sm"
          accent={channel.color}
          format={(v) => `${Math.round(v * 100)}`}
          onChange={onEqLow}
        />
      </div>

      {/* Skill list */}
      <div className="flex-1 py-2 px-1 space-y-0.5 min-h-0 overflow-y-auto">
        {channel.skills.map((skill) => (
          <SkillRow key={skill.name} skill={skill} boosted={boosted} />
        ))}
      </div>

      {/* Channel fader */}
      <div className="px-2 py-2 border-t border-[var(--r3-edge)]">
        <div className="h-28">
          <VerticalFader
            value={fader}
            label={channel.label.slice(0, 2)}
            onChange={onFader}
          />
        </div>
      </div>

      {/* Cue button */}
      <button
        onClick={onCue}
        className={cn(
          'w-full py-1.5 r3-mono text-[9px] tracking-widest uppercase border-t transition-all',
          isCued
            ? 'text-[var(--r3-filament)] bg-[var(--r3-filament)]/10 border-[var(--r3-filament)]/30'
            : 'text-[var(--r3-label)] border-transparent hover:text-[var(--r3-text-mute)]',
        )}
        aria-label={`Cue ${channel.label}`}
      >
        CUE
      </button>
    </div>
  )
}

// ─── Master Strip ─────────────────────────────────────────

function MasterStrip({
  masterFader,
  onMasterFader,
  vuLevel,
}: {
  masterFader: number
  onMasterFader: (v: number) => void
  vuLevel: number
}) {
  return (
    <div className="r3-panel-rack flex flex-col items-center min-w-[60px]">
      {/* BPM/Sync display */}
      <div className="px-1 py-3 border-b border-[var(--r3-edge)] w-full text-center">
        <span className="r3-mono text-[8px] text-[var(--r3-signal)] tracking-wider">
          SYNC: ON
        </span>
        <div className="r3-mono text-sm font-bold tabular-nums text-[var(--r3-text)] mt-1">
          120
          <span className="text-[10px] text-[var(--r3-label)] ml-0.5">BPM</span>
        </div>
      </div>

      {/* VU Meter */}
      <div className="py-3 px-1 border-b border-[var(--r3-edge)] w-full flex justify-center">
        <VuMeter level={vuLevel} />
      </div>

      {/* Master fader */}
      <div className="py-2 px-2 flex-1 flex items-end">
        <div className="h-32">
          <VerticalFader
            value={masterFader}
            label="MASTER"
            onChange={onMasterFader}
          />
        </div>
      </div>

      {/* Level display */}
      <div className="py-2 border-t border-[var(--r3-edge)] w-full text-center">
        <span className="r3-mono text-[9px] tabular-nums text-[var(--r3-text-mute)]">
          -{Math.round((1 - vuLevel / 100) * 24)}dB
        </span>
      </div>
    </div>
  )
}

// ─── Crossfader ───────────────────────────────────────────

function Crossfader({
  position,
  onChange,
}: {
  position: number // -100 to +100
  onChange: (v: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      setDragging(true)
      const rect = trackRef.current?.getBoundingClientRect()
      if (rect) {
        const pct = (e.clientX - rect.left) / rect.width
        onChange(Math.max(-100, Math.min(100, Math.round((pct * 2 - 1) * 100))))
      }
    },
    [onChange],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const pct = (e.clientX - rect.left) / rect.width
      onChange(Math.max(-100, Math.min(100, Math.round((pct * 2 - 1) * 100))))
    },
    [dragging, onChange],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    setDragging(false)
  }, [])

  // Map -100..+100 to 0%..100% for thumb position
  const thumbPct = ((position + 100) / 200) * 100

  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <span className="r3-mono text-[8px] text-[var(--r3-label)] tracking-widest">A</span>
      <div
        ref={trackRef}
        className="flex-1 relative h-6 cursor-grab touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[4px] rounded-[2px] bg-[var(--r3-rack)] border border-[var(--r3-edge)]" />
        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-8 h-5 rounded-[3px] transition-shadow',
            dragging && 'cursor-grabbing shadow-[0_0_8px_var(--r3-signal)]',
          )}
          style={{
            left: `calc(${thumbPct}% - 16px)`,
            background:
              'linear-gradient(180deg, #2c2c44 0%, #1a1a2c 100%)',
            border: '1px solid var(--r3-edge)',
            boxShadow: dragging
              ? '0 0 8px var(--r3-signal)'
              : '0 1px 3px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-px bg-[var(--r3-text-mute)]/30" />
        </div>
      </div>
      <span className="r3-mono text-[8px] text-[var(--r3-label)] tracking-widest">B</span>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────

export function SkillsSection() {
  const prefersReduced = useReducedMotion()

  // ─── Channel A state ─────────────────────────────────────
  const [eqAHi, setEqAHi] = useState(0.5)
  const [eqAMid, setEqAMid] = useState(0.5)
  const [eqALow, setEqALow] = useState(0.5)
  const [faderA, setFaderA] = useState(avgLevel(FRONTEND_SKILLS))
  const [cueA, setCueA] = useState(false)
  const [muteA, setMuteA] = useState(false)
  const [soloA, setSoloA] = useState(false)

  // ─── Channel B state ─────────────────────────────────────
  const [eqBHi, setEqBHi] = useState(0.5)
  const [eqBMid, setEqBMid] = useState(0.5)
  const [eqBLow, setEqBLow] = useState(0.5)
  const [faderB, setFaderB] = useState(avgLevel(BACKEND_SKILLS))
  const [cueB, setCueB] = useState(false)
  const [muteB, setMuteB] = useState(false)
  const [soloB, setSoloB] = useState(false)

  // ─── Master / Crossfader state ───────────────────────────
  const [masterFader, setMasterFader] = useState(85)
  const [crossfaderPos, setCrossfaderPos] = useState(0)
  const [showSys, setShowSys] = useState(false)
  const [vuLevel, setVuLevel] = useState(30)

  // ─── Channel 3 (SYSTEMS) state ───────────────────────────
  const [eqSHi, setEqSHi] = useState(0.5)
  const [eqSMid, setEqSMid] = useState(0.5)
  const [eqSLow, setEqSLow] = useState(0.5)
  const [faderS, setFaderS] = useState(avgLevel(SYSTEMS_SKILLS))
  const [cueS, setCueS] = useState(false)

  // ─── Active channel (for dimming) ────────────────────────
  const activeChannel = useMemo(() => {
    if (soloA && !soloB) return 'ch-a'
    if (soloB && !soloA) return 'ch-b'
    return null // both = all active
  }, [soloA, soloB])

  const isActive = (id: string) => {
    if (!activeChannel) return true
    return activeChannel === id
  }

  const anyCued = cueA || cueB || cueS

  // ─── VU Meter idle animation ─────────────────────────────
  useEffect(() => {
    if (prefersReduced) return
    const interval = setInterval(() => {
      setVuLevel(15 + Math.random() * 35)
    }, 300)
    return () => clearInterval(interval)
  }, [prefersReduced])

  // ─── Crossfader dim effect ───────────────────────────────
  const dimFactor = Math.abs(crossfaderPos) / 100

  return (
    <SectionFrame
      id="skills"
      track="03"
      name="SKILLS"
      device="DJ Mixer / Pioneer DJM-900"
      color="beat"
    >
      {/* Intro prose */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-8 sm:mb-12"
      >
        <p className="r3-prose text-sm sm:text-base text-[var(--r3-text-mute)] max-w-2xl leading-relaxed">
          Every channel has its signal chain. EQ knobs shape the frequency,
          faders control the level. Hover a skill to see its proficiency.
          Drag knobs and faders — ini hardware mixer fungsional, bukan cuma display.
        </p>
      </m.div>

      {/* ─── Mixer Panel ─────────────────────────────────── */}
      <div className="r3-panel p-3 sm:p-4">
        {/* Top bar: BPM display + Channel 3 toggle */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--r3-edge)]">
          <div className="flex items-center gap-3">
            <span className="r3-mono text-[10px] text-[var(--r3-signal)] font-semibold">
              SYNC: ON
            </span>
            <span className="r3-mono text-lg font-bold tabular-nums text-[var(--r3-text)]">
              120<span className="text-xs text-[var(--r3-label)] ml-1">BPM</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSys(!showSys)}
              className={cn(
                'r3-mono text-[8px] px-2 py-1 rounded-[2px] border transition-all',
                showSys
                  ? 'border-[var(--r3-melody)] text-[var(--r3-melody)] bg-[var(--r3-melody)]/10'
                  : 'border-[var(--r3-edge)] text-[var(--r3-label)] hover:border-[var(--r3-text-mute)]',
              )}
            >
              CH3 SYS
            </button>
            <span
              className={cn(
                'r3-led',
                anyCued && 'r3-led--filament',
              )}
            />
          </div>
        </div>

        {/* Channel grid */}
        <div className="flex gap-2 min-h-[400px]">
          {/* Channel A */}
          <div
            className="flex-1 min-w-0 transition-opacity"
            style={{
              opacity: muteA ? 0.3 : crossfaderPos > 0 ? 1 - (crossfaderPos / 100) * 0.4 : 1,
            }}
          >
            <MixerChannel
              channel={CHANNELS[0]}
              active={isActive('ch-a')}
              eqHi={eqAHi}
              eqMid={eqAMid}
              eqLow={eqALow}
              fader={faderA}
              onEqHi={setEqAHi}
              onEqMid={setEqAMid}
              onEqLow={setEqALow}
              onFader={setFaderA}
              onCue={() => setCueA(!cueA)}
              isCued={cueA}
              muted={muteA}
              onMute={() => setMuteA(!muteA)}
              soloed={soloA}
              onSolo={() => setSoloA(!soloA)}
            />
          </div>

          {/* Channel B */}
          <div
            className="flex-1 min-w-0 transition-opacity"
            style={{
              opacity: muteB ? 0.3 : crossfaderPos < 0 ? 1 - (Math.abs(crossfaderPos) / 100) * 0.4 : 1,
            }}
          >
            <MixerChannel
              channel={CHANNELS[1]}
              active={isActive('ch-b')}
              eqHi={eqBHi}
              eqMid={eqBMid}
              eqLow={eqBLow}
              fader={faderB}
              onEqHi={setEqBHi}
              onEqMid={setEqBMid}
              onEqLow={setEqBLow}
              onFader={setFaderB}
              onCue={() => setCueB(!cueB)}
              isCued={cueB}
              muted={muteB}
              onMute={() => setMuteB(!muteB)}
              soloed={soloB}
              onSolo={() => setSoloB(!soloB)}
            />
          </div>

          {/* Channel 3 (SYSTEMS) — slide-in */}
          <AnimatePresence>
            {showSys && (
              <m.div
                initial={{ width: 0, opacity: 0, overflow: 'hidden' }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="min-w-0"
              >
                <div className="w-[200px]">
                  <MixerChannel
                    channel={CHANNELS[2]}
                    active={true}
                    eqHi={eqSHi}
                    eqMid={eqSMid}
                    eqLow={eqSLow}
                    fader={faderS}
                    onEqHi={setEqSHi}
                    onEqMid={setEqSMid}
                    onEqLow={setEqSLow}
                    onFader={setFaderS}
                    onCue={() => setCueS(!cueS)}
                    isCued={cueS}
                    muted={false}
                    onMute={() => {}}
                    soloed={false}
                    onSolo={() => {}}
                  />
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Master strip */}
          <div className="w-[70px] shrink-0">
            <MasterStrip
              masterFader={masterFader}
              onMasterFader={setMasterFader}
              vuLevel={vuLevel}
            />
          </div>
        </div>

        {/* Crossfader */}
        <div className="mt-3 pt-2 border-t border-[var(--r3-edge)]">
          <Crossfader
            position={crossfaderPos}
            onChange={setCrossfaderPos}
          />
        </div>
      </div>

      {/* Status bar */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="r3-panel mt-6 sm:mt-8 flex items-center justify-between px-3 py-2 sm:px-4"
      >
        <div className="flex items-center gap-3">
          <span className="r3-led r3-led--beat" aria-hidden />
          <span className="r3-mono text-[10px] text-[var(--r3-text-mute)]">
            {FRONTEND_SKILLS.length + BACKEND_SKILLS.length + SYSTEMS_SKILLS.length} skills mapped
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="r3-mono text-[10px] text-[var(--r3-label)]">
            CROSSFADER: {crossfaderPos > 0 ? `A +${crossfaderPos}` : crossfaderPos < 0 ? `B +${Math.abs(crossfaderPos)}` : 'CENTER'}
          </span>
          <span className="h-3 w-px bg-[var(--r3-edge)]" />
          <span className="r3-mono text-[10px] text-[var(--r3-signal)]">
            ALL CHANNELS ARMED
          </span>
        </div>
      </m.div>
    </SectionFrame>
  )
}
