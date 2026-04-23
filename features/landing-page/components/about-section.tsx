'use client'

import { useState, useEffect, useRef } from 'react'
import { m, useInView } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  Zap,
  Radio,
  Cpu,
  Activity,
  Wifi,
  Circle,
} from 'lucide-react'

// --- Subcomponents ---

/** Decorative screw head */
const Screw = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'h-3 w-3 rounded-full border border-zinc-400/60 bg-zinc-300 shadow-[inset_0_1px_1px_rgba(0,0,0,0.15)] dark:border-zinc-600 dark:bg-zinc-700 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]',
      className,
    )}
  >
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-px w-2 rotate-45 bg-zinc-500 dark:bg-zinc-500" />
      <div className="absolute h-px w-2 -rotate-45 bg-zinc-500 dark:bg-zinc-500" />
    </div>
  </div>
)

/** LED indicator dot */
const Led = ({
  color = 'green',
  blink = false,
  label,
}: {
  color?: 'green' | 'amber' | 'red' | 'blue'
  blink?: boolean
  label?: string
}) => {
  const colorMap = {
    green: 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]',
    amber: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]',
    red: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]',
    blue: 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]',
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          colorMap[color],
          blink && 'animate-pulse',
        )}
      />
      {label && (
        <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-500">
          {label}
        </span>
      )}
    </div>
  )
}

/** Hardware-style bar meter (like VU meter) */
const BarMeter = ({
  label,
  value,
  max = 10,
  unit,
  color = 'green',
  delay = 0,
}: {
  label: string
  value: number
  max?: number
  unit?: string
  color?: 'green' | 'amber' | 'blue'
  delay?: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const segments = 12
  const filled = Math.round((value / max) * segments)

  const colorMap = {
    green: ['bg-green-900/40', 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]'],
    amber: ['bg-amber-900/40', 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]'],
    blue: ['bg-blue-900/40', 'bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]'],
  }

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-500">
          {label}
        </span>
        <span className="font-mono text-lg font-bold leading-none text-zinc-800 dark:text-zinc-200">
          {value}
          {unit && (
            <span className="ml-0.5 text-xs text-zinc-500">{unit}</span>
          )}
        </span>
      </div>

      {/* Bar */}
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0.2, scaleY: 0.3 }}
            animate={
              isInView
                ? {
                    opacity: i < filled ? 1 : 0.25,
                    scaleY: 1,
                  }
                : {}
            }
            transition={{
              delay: delay + i * 0.04,
              duration: 0.3,
            }}
            className={cn(
              'h-3 flex-1 rounded-sm',
              i < filled ? colorMap[color][1] : colorMap[color][0],
            )}
          />
        ))}
      </div>
    </div>
  )
}

/** Tech stack as LED indicator grid */
const TechGrid = () => {
  const techs = [
    { name: 'React', level: 5 },
    { name: 'TypeScript', level: 5 },
    { name: 'Next.js', level: 5 },
    { name: 'Tailwind', level: 5 },
    { name: 'Node.js', level: 4 },
    { name: 'Motion', level: 4 },
  ]

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-500">
        Core Modules
      </span>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {techs.map((tech) => (
          <div key={tech.name} className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {tech.name}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    i < tech.level
                      ? 'bg-amber-500 shadow-[0_0_3px_rgba(245,158,11,0.5)]'
                      : 'bg-zinc-300 dark:bg-zinc-700',
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Hardware chassis panel with about content */
const IdentityPanel = () => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
      {/* Corner screws */}
      <Screw className="absolute top-3 left-3" />
      <Screw className="absolute top-3 right-3" />
      <Screw className="absolute bottom-3 left-3" />
      <Screw className="absolute bottom-3 right-3" />

      {/* Label plate */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <Cpu size={14} className="text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className="rounded border border-zinc-200 bg-white px-3 py-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <span className="font-mono text-xs font-bold tracking-widest text-zinc-600 uppercase dark:text-zinc-400">
            IDENTITY
          </span>
        </div>
        <div className="ml-auto">
          <Led color="green" blink label="ONLINE" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Aditya Himawan
          </h3>
          <p className="mt-1 font-mono text-xs tracking-widest text-zinc-500 uppercase">
            Frontend Engineer / Jakarta Selatan
          </p>
        </div>

        {/* Spec sheet */}
        <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {[
            ['Role', 'Frontend Developer'],
            ['Location', 'Jakarta Selatan, ID'],
            ['Experience', '4+ Years'],
            ['Focus', 'React / Next.js / UI Engineering'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-zinc-500">{k}</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {v}
              </span>
            </div>
          ))}
        </div>

        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Passionate developer bridging engineering logic and creative design.
          Just as a producer layers sounds to create a song, I layer code to
          build immersive digital experiences.
        </p>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/30 dark:bg-green-950/30">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs font-bold text-green-700 dark:text-green-400">
            AVAILABLE FOR PROJECTS
          </span>
        </div>
      </div>
    </div>
  )
}

/** Hardware chassis panel with stats */
const MetricsPanel = () => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
      {/* Corner screws */}
      <Screw className="absolute top-3 left-3" />
      <Screw className="absolute top-3 right-3" />
      <Screw className="absolute bottom-3 left-3" />
      <Screw className="absolute bottom-3 right-3" />

      {/* Label plate */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <Activity size={14} className="text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className="rounded border border-zinc-200 bg-white px-3 py-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <span className="font-mono text-xs font-bold tracking-widest text-zinc-600 uppercase dark:text-zinc-400">
            METRICS
          </span>
        </div>
        <div className="ml-auto">
          <Led color="amber" label="MONITOR" />
        </div>
      </div>

      {/* Meters */}
      <div className="space-y-5">
        <BarMeter label="Experience" value={4} max={6} unit="YRS" color="green" delay={0.1} />
        <BarMeter label="Projects" value={20} max={30} unit="+" color="blue" delay={0.2} />
        <BarMeter label="Commitment" value={100} max={100} unit="%" color="amber" delay={0.3} />
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-zinc-200 dark:border-zinc-800" />

      {/* Tech grid */}
      <TechGrid />
    </div>
  )
}

/** Scrolling marquee status bar */
const StatusBar = () => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950 py-2.5 dark:border-zinc-800">
      <div className="flex items-center gap-3 px-4">
        <Wifi size={12} className="shrink-0 text-green-500" />
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap">
            <span className="mr-8 font-mono text-[10px] tracking-widest text-zinc-500">
              SYSTEM: OPERATIONAL /// SIGNAL: CLEAN /// LATENCY: LOW /// UPTIME: 99.9%
            </span>
            <span className="mr-8 font-mono text-[10px] tracking-widest text-zinc-500">
              SYSTEM: OPERATIONAL /// SIGNAL: CLEAN /// LATENCY: LOW /// UPTIME: 99.9%
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Led color="green" />
          <Led color="green" />
          <Led color="amber" blink />
        </div>
      </div>
    </div>
  )
}

// --- Main Section ---

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden bg-white py-20 dark:bg-zinc-950 sm:py-28"
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6">
        {/* Section header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col items-center text-center sm:mb-14"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-4 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <Radio className="h-3.5 w-3.5" />
            <span className="tracking-wider uppercase">System Profile</span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
            The Body
          </h2>
          <p className="mt-3 max-w-md text-sm text-zinc-500 dark:text-zinc-500">
            Hardware specs and signal flow of the developer behind the desk.
          </p>
        </m.div>

        {/* Main chassis */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Outer chassis frame */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-300 bg-zinc-100 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
            {/* Speaker grille texture overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)',
                backgroundSize: '6px 6px',
              }}
            />

            {/* Top panel */}
            <div className="relative flex items-center justify-between border-b border-zinc-300 bg-zinc-200/80 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
              <div className="flex items-center gap-3">
                <Screw />
                <div className="rounded border border-zinc-300 bg-white px-3 py-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                    AH-2026-MKIII
                  </span>
                </div>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <Led color="green" blink label="PWR" />
                <Led color="blue" label="SIG" />
                <Led color="amber" label="CLIP" />
              </div>
              <Screw />
            </div>

            {/* Main body */}
            <div className="relative p-4 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                <m.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <IdentityPanel />
                </m.div>
                <m.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <MetricsPanel />
                </m.div>
              </div>

              {/* Bottom status bar */}
              <div className="mt-4 sm:mt-6">
                <StatusBar />
              </div>
            </div>

            {/* Bottom panel */}
            <div className="relative flex items-center justify-between border-t border-zinc-300 bg-zinc-200/80 px-5 py-2 dark:border-zinc-700 dark:bg-zinc-900/80">
              <Screw />
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-amber-500" />
                <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase">
                  High Voltage / Handle with Care
                </span>
              </div>
              <Screw />
            </div>
          </div>
        </m.div>
      </div>

      {/* CSS for marquee */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </section>
  )
}
