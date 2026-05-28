'use client'

import React, { useState } from 'react'
import { m, useMotionValue, animate } from 'motion/react'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'
import { Marquee } from '@/components/ui/marquee'
import {
  Sliders,
  Music,
  Code2,
  Layers,
  Wrench,
  Star,
} from 'lucide-react'

import { MIXER_DATA } from '../constants'

// --- Tech Logos for Marquee ---
const TECH_LOGOS = [
  { name: 'React', color: 'text-cyan-500' },
  { name: 'Next.js', color: 'text-zinc-900 dark:text-white' },
  { name: 'TypeScript', color: 'text-blue-500' },
  { name: 'Tailwind', color: 'text-teal-500' },
  { name: 'Node.js', color: 'text-green-500' },
  { name: 'Go', color: 'text-cyan-400' },
  { name: 'Figma', color: 'text-purple-500' },
  { name: 'Git', color: 'text-orange-500' },
  { name: 'PostgreSQL', color: 'text-blue-400' },
  { name: 'Docker', color: 'text-blue-500' },
]

// --- Components ---

const SkillBar = ({
  name,
  level,
  delay = 0,
}: {
  name: string
  level: number
  delay?: number
}) => {
  const width = useMotionValue(0)

  React.useEffect(() => {
    const controls = animate(width, level, {
      duration: 1.2,
      ease: 'easeOut',
      delay: delay,
    })
    return () => controls.stop()
  }, [level, delay])

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {name}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <m.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300"
          style={{ width }}
        />
      </div>
      <span className="w-10 text-right font-mono text-xs text-zinc-500">
        {level}%
      </span>
    </div>
  )
}

const SkillBadge = ({
  name,
  level,
  variant = 'default',
}: {
  name: string
  level: number
  variant?: 'default' | 'accent'
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border px-4 py-3 transition-colors',
        variant === 'accent'
          ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20'
          : 'border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50',
      )}
    >
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {name}
      </span>
      <span className="font-mono text-xs text-zinc-500">{level}%</span>
    </div>
  )
}

export function SkillsSection() {
  return (
    <>
      <section id="skills" className="overflow-hidden py-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-16 flex flex-col items-center text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-2 rounded-full bg-zinc-200/50 px-4 py-1.5 text-sm font-medium text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400"
            >
              <Sliders className="h-4 w-4" />
              <span>TECHNICAL STACK</span>
            </m.div>
            <h2 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
              Arsenal
            </h2>
          </div>

          {/* Marquee Ticker */}
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative mb-16"
          >
            <Marquee pauseOnHover className="[--duration:30s]">
              {TECH_LOGOS.map((tech, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className={cn('text-sm font-bold', tech.color)}>
                    {tech.name}
                  </span>
                </div>
              ))}
            </Marquee>
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-zinc-950" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-zinc-950" />
          </m.div>

          {/* Bento Grid */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Frontend — Large Card */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:col-span-2 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                  <Code2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 uppercase dark:text-white">
                    Frontend
                  </h3>
                  <p className="text-xs text-zinc-500">Core technologies</p>
                </div>
              </div>
              <div className="space-y-4">
                {MIXER_DATA[1].channels.map((skill, i) => (
                  <SkillBar
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    delay={i * 0.1}
                  />
                ))}
              </div>
            </m.div>

            {/* Languages — Compact Card */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/30">
                  <Layers className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 uppercase dark:text-white">
                    Languages
                  </h3>
                  <p className="text-xs text-zinc-500">Programming</p>
                </div>
              </div>
              <div className="space-y-2">
                {MIXER_DATA[0].channels.map((skill, i) => (
                  <SkillBadge
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    variant={i % 2 === 0 ? 'accent' : 'default'}
                  />
                ))}
              </div>
            </m.div>

            {/* Tools — Compact Card */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
                  <Wrench className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 uppercase dark:text-white">
                    Tools
                  </h3>
                  <p className="text-xs text-zinc-500">Workflow</p>
                </div>
              </div>
              <div className="space-y-2">
                {MIXER_DATA[2].channels.map((skill, i) => (
                  <SkillBadge
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    variant={i % 2 === 0 ? 'default' : 'accent'}
                  />
                ))}
              </div>
            </m.div>

            {/* Expertise — Wide Card */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:col-span-2 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/30">
                  <Star className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 uppercase dark:text-white">
                    Expertise
                  </h3>
                  <p className="text-xs text-zinc-500">Specializations</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: 'UI Architecture', icon: '🏗️' },
                  { label: 'Animation', icon: '✨' },
                  { label: 'Responsive Design', icon: '📱' },
                  { label: 'Performance', icon: '⚡' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 text-center transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </m.div>
          </div>

          {/* Bottom Label */}
          <div className="mt-12 border-t border-zinc-200 pt-4 text-center dark:border-zinc-800">
            <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
              Designed & Engineered by One
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
