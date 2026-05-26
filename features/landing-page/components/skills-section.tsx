'use client'

/**
 * Ravemped 3.0 — Skills Section (Plugin Rack / FX Chain)
 *
 * Concept: Skills = VST plugins loaded dalam mixer channels.
 * 3 channel groups (languages, frameworks, tools) → vertical rack with plugin slots.
 * Each skill = plugin card with icon, name, LED level bar.
 * Level bar color: green <70, yellow 70-89, signal 90+.
 */

import { m, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  FileType,
  Braces,
  Atom,
  Layers,
  Palette,
  GitBranch,
  Sparkles,
  Code2,
  Globe,
  Cpu,
  Zap,
  Box,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionFrame } from '../r3/section-frame'
import { MIXER_DATA } from '../constants'

// ─── Icon Map ─────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  TS: FileType,
  JS: Braces,
  HTML: Globe,
  CSS: Palette,
  GO: Cpu,
  SWIFT: Zap,
  REACT: Atom,
  NEXT: Layers,
  REMIX: Box,
  JQUERY: Braces,
  'VS CODE': Code2,
  FIGMA: Sparkles,
  GIT: GitBranch,
  MOTION: Zap,
}

// ─── LED Level Bar ────────────────────────────────────────
function LedBar({ level }: { level: number }) {
  const totalLeds = 10
  const activeLeds = Math.round((level / 100) * totalLeds)

  return (
    <div className="flex items-center gap-[2px]" aria-label={`Skill level: ${level}%`}>
      {Array.from({ length: totalLeds }).map((_, i) => {
        const isActive = i < activeLeds
        let colorClass = 'bg-[var(--r3-signal)]' // green (90+)

        if (level < 70) {
          colorClass = 'bg-[var(--r3-signal)]' // green for <70
        } else if (level < 90) {
          colorClass = 'bg-[var(--r3-filament)]' // yellow 70-89
        }
        // 90+ stays signal (green)

        return (
          <div
            key={i}
            className={cn(
              'h-2 w-[6px] sm:w-2 rounded-[1px] transition-opacity',
              isActive ? colorClass : 'bg-[var(--r3-edge)]/60',
              isActive && 'shadow-[0_0_3px_currentColor]',
            )}
            style={isActive ? { opacity: 0.7 + (i / totalLeds) * 0.3 } : undefined}
          />
        )
      })}
      <span className="ml-2 r3-mono text-[10px] tabular-nums text-[var(--r3-text-mute)]">
        {level}
      </span>
    </div>
  )
}

// ─── Plugin Card ──────────────────────────────────────────
function PluginCard({
  name,
  level,
  index,
}: {
  name: string
  level: number
  index: number
}) {
  const prefersReduced = useReducedMotion()
  const Icon = ICON_MAP[name] || Code2

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="r3-panel flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3"
    >
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[var(--r3-rack)] border border-[var(--r3-edge)]">
        <Icon className="h-4 w-4 text-[var(--r3-text-mute)]" strokeWidth={1.75} aria-hidden />
      </div>

      {/* Name + Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="r3-mono text-xs font-semibold text-[var(--r3-text)] truncate">
            {name}
          </span>
          <span className="r3-mono text-[9px] text-[var(--r3-label)] shrink-0 uppercase">
            v{(level / 10).toFixed(1)}
          </span>
        </div>
        <LedBar level={level} />
      </div>
    </m.div>
  )
}

// ─── Rack Group ───────────────────────────────────────────
function RackGroup({
  label,
  type,
  channels,
  groupIndex,
}: {
  label: string
  type: string
  channels: readonly { readonly name: string; readonly level: number }[]
  groupIndex: number
}) {
  const prefersReduced = useReducedMotion()

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
      className="r3-panel-rack p-3 sm:p-4"
    >
      {/* Rack header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-[var(--r3-edge)]">
        <div className="flex items-center gap-2">
          <span className="r3-led r3-pulse" aria-hidden />
          <span className="r3-display text-xs sm:text-sm font-semibold text-[var(--r3-text)]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="r3-mono text-[9px] text-[var(--r3-label)] uppercase">
            {type}
          </span>
          <span className="r3-mono text-[9px] text-[var(--r3-text-mute)] tabular-nums">
            {channels.length} loaded
          </span>
        </div>
      </div>

      {/* Plugin slots */}
      <div className="space-y-2">
        {channels.map((ch, i) => (
          <PluginCard
            key={ch.name}
            name={ch.name}
            level={ch.level}
            index={i}
          />
        ))}
      </div>

      {/* Rack footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--r3-edge)]">
        <span className="r3-mono text-[9px] text-[var(--r3-label)]">
          CH {groupIndex + 1} · {label.toLowerCase()}
        </span>
        <span className="r3-mono text-[9px] text-[var(--r3-signal)]">
          ACTIVE
        </span>
      </div>
    </m.div>
  )
}

// ─── Main Export ──────────────────────────────────────────
export function SkillsSection() {
  const prefersReduced = useReducedMotion()

  return (
    <SectionFrame
      id="skills"
      track="02"
      name="SKILLS"
      device="Plugin Rack / FX Chain"
      color="beat"
    >
      {/* Prose intro */}
      <m.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-8 sm:mb-12"
      >
        <p className="r3-prose text-sm sm:text-base text-[var(--r3-text-mute)] max-w-2xl leading-relaxed">
          Every channel has its plugins loaded. These are the tools and
          languages that power the signal chain — from source to master bus.
        </p>
      </m.div>

      {/* ─── Plugin Rack Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {MIXER_DATA.map((group, i) => (
          <RackGroup
            key={group.id}
            label={group.label}
            type={group.type}
            channels={group.channels}
            groupIndex={i}
          />
        ))}
      </div>

      {/* Bottom status bar */}
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
            {MIXER_DATA.reduce((acc, g) => acc + g.channels.length, 0)} plugins loaded
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="r3-mono text-[10px] text-[var(--r3-label)]">
            CPU: 12%
          </span>
          <span className="h-3 w-px bg-[var(--r3-edge)]" />
          <span className="r3-mono text-[10px] text-[var(--r3-signal)]">
            ALL SYSTEMS GO
          </span>
        </div>
      </m.div>
    </SectionFrame>
  )
}
