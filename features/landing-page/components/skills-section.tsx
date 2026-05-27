'use client'

import React, { useState, useEffect } from 'react'
import { m, useMotionValue, animate } from 'motion/react'
import { cn } from '@/lib/utils'
import { Sliders } from 'lucide-react'

// --- Rack Screw component ---
function RackScrew() {
  return (
    <div className="relative h-3 w-3 rounded-full" style={{ boxShadow: 'var(--nm-flat)' }}>
      <div className="absolute inset-[30%] rounded-full bg-zinc-800/50" />
      <div
        className="absolute top-[35%] left-[35%] h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-600"
        style={{ transform: 'rotate(45deg)' }}
      />
    </div>
  )
}

// --- KeyCap for languages ---
function KeyCap({ label, color, level }: { label: string; color: string; level: number }) {
  const [pressed, setPressed] = useState(false)

  return (
    <m.button
      className="group relative flex h-12 w-12 flex-col items-center justify-center rounded-lg font-mono text-[10px] font-bold transition-all"
      style={{
        boxShadow: pressed ? 'var(--nm-inset)' : 'var(--nm-raised)',
        color: pressed ? color : 'transparent',
        WebkitTextStroke: pressed ? `0px` : `0.5px ${color}`,
        border: pressed ? `1px solid ${color}30` : '1px solid transparent',
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      animate={{
        y: pressed ? 2 : 0,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {label}
      <span className="mt-0.5 text-[7px] font-normal opacity-60">{level}%</span>
    </m.button>
  )
}

// --- EQ Fader ---
function EQFader({ label, value, color }: { label: string; value: number; color: string }) {
  const maxTravel = 96
  const initialY = -((value / 100) * maxTravel)
  const y = useMotionValue(0)

  useEffect(() => {
    const controls = animate(y, initialY, {
      duration: 1,
      ease: 'easeOut',
      delay: 0.3,
    })
    return () => controls.stop()
  }, [initialY, y])

  return (
    <div className="flex touch-none flex-col items-center gap-2">
      <div className="relative flex h-36 w-8 justify-center rounded py-2" style={{ boxShadow: 'var(--nm-inset)' }}>
        {/* Track gradient */}
        <div
          className="absolute inset-0 rounded"
          style={{
            background: `linear-gradient(to top, transparent, ${color}40, ${color})`,
            opacity: value / 100,
          }}
        />

        {/* Fader Thumb */}
        <m.div
          className="absolute bottom-2 left-1/2 z-10 flex h-8 w-6 -translate-x-1/2 cursor-grab items-center justify-center rounded-sm active:cursor-grabbing"
          style={{
            y,
            boxShadow: 'var(--nm-raised)',
          }}
          drag="y"
          dragConstraints={{ top: -maxTravel, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
        >
          <div className="h-3 w-full rounded-sm bg-zinc-800/50" />
        </m.div>
      </div>
      <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
        {label}
      </span>
      <span className="text-[7px] font-mono text-zinc-600">{value}</span>
    </div>
  )
}

// --- Potentiometer (Knob) ---
function Potentiometer({ label, value, color }: { label: string; value: number; color: string }) {
  const minDeg = -135
  const maxDeg = 135
  const startDeg = (value / 100) * 270 - 135
  const rotation = useMotionValue(minDeg)

  useEffect(() => {
    animate(rotation, startDeg, { duration: 1, type: 'spring', bounce: 0.2, delay: 0.5 })
  }, [startDeg, rotation])

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full" style={{ boxShadow: 'var(--nm-inset)' }}>
        {/* Mercury Indicator */}
        <m.div
          className="h-12 w-12 cursor-grab rounded-full active:cursor-grabbing"
          style={{ rotate: rotation, boxShadow: 'var(--nm-raised)' }}
        >
          <div
            className="absolute top-1.5 left-1/2 h-3 w-0.5 -translate-x-1/2 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
          />
        </m.div>

        {/* Center dot */}
        <div className="absolute rounded-full h-2 w-2 bg-zinc-800" />
      </div>
      <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 uppercase text-center">
        {label}
      </span>
    </div>
  )
}

// --- Languages ---
const LANGUAGES = [
  { name: 'HTML', level: 90, color: '#ff6b35' },
  { name: 'CSS', level: 85, color: '#2965f1' },
  { name: 'JS', level: 85, color: '#f7df1e' },
  { name: 'TS', level: 80, color: '#3178c6' },
]

// --- Frameworks ---
const FRAMEWORKS = [
  { name: 'React', level: 90, color: 'var(--accent-cyan)' },
  { name: 'Next', level: 85, color: 'var(--accent-amber)' },
  { name: 'Remix', level: 70, color: 'var(--accent-green)' },
  { name: 'jQuery', level: 65, color: 'var(--accent-red)' },
]

// --- Tools ---
const TOOLS = [
  { name: 'VS Code', level: 90, color: 'var(--accent-cyan)' },
  { name: 'Figma', level: 80, color: 'var(--accent-green)' },
  { name: 'Git', level: 85, color: 'var(--accent-amber)' },
  { name: 'Motion', level: 75, color: 'var(--accent-red)' },
]

export function SkillsSection() {
  return (
    <section id="skills" className="relative py-24" style={{ background: 'var(--nm-bg)' }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono tracking-wider text-zinc-500"
            style={{ boxShadow: 'var(--nm-flat)' }}
          >
            <Sliders className="h-3 w-3 text-[var(--accent-amber)]" />
            <span>AUDIO ENGINEERING</span>
          </m.div>
          <h2
            className="text-4xl font-black tracking-tighter sm:text-5xl"
            style={{ color: 'var(--accent-cyan)', textShadow: '0 0 20px var(--accent-cyan)' }}
          >
            Sonic Arsenal
          </h2>
          <span className="mt-2 font-mono text-[10px] tracking-[0.3em] text-zinc-600 uppercase">
            UNIT-03
          </span>
        </div>

        {/* Rack Frame */}
        <div
          className="relative mx-auto max-w-5xl rounded-3xl"
          style={{ boxShadow: 'var(--nm-inset)', background: 'var(--nm-bg-alt)' }}
        >
          {/* Rack Screws */}
          <RackScrew className="absolute top-3 left-3" />
          <RackScrew className="absolute top-3 right-3" />
          <RackScrew className="absolute bottom-3 left-3" />
          <RackScrew className="absolute right-3 bottom-3" />

          {/* Inner */}
          <div className="p-6 md:p-10">
            {/* 3-Column Rack Modules */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Module 1: CH 1 — LANGUAGES */}
              <div
                className="rounded-2xl p-5 overflow-hidden"
                style={{ boxShadow: 'var(--nm-raised)' }}
              >
                {/* Colored top strip */}
                <div className="mb-4 h-0.5 w-full bg-[var(--accent-cyan)]" />
                <div className="mb-4">
                  <h4 className="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                    CH 1 — LANGUAGES
                  </h4>
                  <div className="mt-1 h-px w-8 bg-zinc-700" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {LANGUAGES.map((lang) => (
                    <KeyCap key={lang.name} label={lang.name} color={lang.color} level={lang.level} />
                  ))}
                </div>
              </div>

              {/* Module 2: EQ — FRAMEWORKS */}
              <div
                className="rounded-2xl p-5 overflow-hidden"
                style={{ boxShadow: 'var(--nm-raised)' }}
              >
                <div className="mb-4 h-0.5 w-full bg-[var(--accent-amber)]" />
                <div className="mb-4">
                  <h4 className="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                    EQ — FRAMEWORKS
                  </h4>
                  <div className="mt-1 h-px w-8 bg-zinc-700" />
                </div>
                <div className="flex justify-center gap-4">
                  {FRAMEWORKS.map((fw) => (
                    <EQFader key={fw.name} label={fw.name} value={fw.level} color={fw.color} />
                  ))}
                </div>
              </div>

              {/* Module 3: FX — TOOLS */}
              <div
                className="rounded-2xl p-5 overflow-hidden"
                style={{ boxShadow: 'var(--nm-raised)' }}
              >
                <div className="mb-4 h-0.5 w-full bg-[var(--accent-green)]" />
                <div className="mb-4">
                  <h4 className="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                    FX — TOOLS
                  </h4>
                  <div className="mt-1 h-px w-8 bg-zinc-700" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {TOOLS.map((tool) => (
                    <Potentiometer
                      key={tool.name}
                      label={tool.name}
                      value={tool.level}
                      color={tool.color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Rail */}
            <div
              className="mt-8 flex items-center justify-center py-3 rounded-lg"
              style={{ boxShadow: 'var(--nm-inset)' }}
            >
              <p className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 uppercase">
                Designed & Engineered by Adit — Mix-Master 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
