'use client'

import React, { useState, useEffect } from 'react'
import { m, useMotionValue, useTransform, animate } from 'motion/react'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'
import { Sliders } from 'lucide-react'

import { MIXER_DATA } from '../constants'

// --- Braun Minimalist Slider ---
const BraunSlider = ({ value, label, isOn }: { value: number; label: string; isOn: boolean }) => {
  const initialValue = isOn ? value : 0
  const handleX = useMotionValue(0)
  const leftPos = useTransform(handleX, (v) => `calc(${v}% - 4px)`)

  useEffect(() => {
    const controls = animate(handleX, initialValue, {
      duration: 1.2,
      type: 'spring',
      bounce: 0.1,
    })
    return () => controls.stop()
  }, [initialValue, handleX])

  return (
    <div className="flex flex-col gap-2 p-4 border border-[#e4e4e0] bg-[#f8f8f6] rounded dark:border-[#202020] dark:bg-[#161616]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
          {label.toLowerCase()}
        </span>
        <span className="font-mono text-[10px] font-bold text-[#f05523]">
          {isOn ? `${value}%` : '0%'}
        </span>
      </div>

      <div className="relative h-6 flex items-center">
        {/* Track Line */}
        <div className="w-full h-[2px] bg-[#d8d8d0] dark:bg-[#2c2c2c] rounded-full" />
        
        {/* Tick Marks (subtle dots) */}
        <div className="absolute inset-0 flex justify-between items-center px-1 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-1 w-[1px] bg-zinc-400 dark:bg-zinc-600" />
          ))}
        </div>

        {/* Orange Tuning Pointer Slider (Braun style) */}
        <m.div
          className="absolute h-5 w-2 bg-[#f05523] cursor-grab active:cursor-grabbing border border-[#c03d15] shadow-[0_1px_3px_rgba(0,0,0,0.15)] rounded-sm"
          style={{
            left: leftPos,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 100 }}
          dragElastic={0}
          dragMomentum={false}
        />
      </div>
    </div>
  )
}

// --- Simplified Braun VU Meter (LED Bar) ---
const VUMeter = ({ isOn }: { isOn: boolean }) => {
  return (
    <div className="flex h-10 items-center gap-1 rounded border border-[#d4d4d0] bg-[#e8e8e4] px-3 shadow-inner dark:border-[#27272a] dark:bg-[#1a1a1a]">
      {[...Array(10)].map((_, i) => {
        const isRed = i > 7
        const isYellow = i > 5 && i <= 7
        const activeColor = isRed
          ? 'bg-[#ef4444]'
          : isYellow
            ? 'bg-[#f59e0b]'
            : 'bg-[#10b981]'

        return (
          <m.div
            key={i}
            className={cn(
              'h-4 w-1.5 rounded-sm transition-all',
              isOn ? activeColor : 'bg-zinc-300 dark:bg-zinc-800'
            )}
            animate={isOn ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.2 }}
            transition={{
              duration: 0.6 + i * 0.1,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        )
      })}
    </div>
  )
}

export function SkillsSection() {
  const [isOn, setIsOn] = useState(true)

  return (
    <section id="skills" className="overflow-hidden py-24">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="mb-16 flex flex-col items-center text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 flex items-center gap-2 rounded bg-[#e8e8e4] border border-[#d4d4d0] px-3 py-1 font-mono text-[10px] font-bold text-zinc-600 uppercase tracking-widest dark:bg-[#1a1a1a] dark:border-[#27272a] dark:text-zinc-400"
          >
            <Sliders className="h-3 w-3" />
            <span>technical specifications</span>
          </m.div>
          <h2 className="font-sans text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            System Architecture
          </h2>
        </div>

        {/* The Braun Chassis */}
        <div className="relative mx-auto max-w-5xl rounded-lg border border-[#d4d4d0] bg-[#f4f4f0] p-6 shadow-xl dark:border-[#27272a] dark:bg-[#121212]">
          {/* Screws for industrial feel */}
          <Screw className="absolute top-4 left-4" />
          <Screw className="absolute top-4 right-4" />
          <Screw className="absolute bottom-4 left-4" />
          <Screw className="absolute right-4 bottom-4" />

          {/* Top Panel: Branding & Power controls */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e4e0] pb-6 dark:border-[#202020]">
            <div>
              <h3 className="font-sans text-sm font-bold tracking-widest text-zinc-800 uppercase dark:text-zinc-200">
                braun control deck <span className="text-[#f05523]">model-01</span>
              </h3>
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                Modular Capability Interface & Tuner System
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* VUMeter */}
              <div className="hidden sm:block">
                <VUMeter isOn={isOn} />
              </div>

              {/* Classic Braun Power Button (Green indicator / Plunger) */}
              <div className="flex items-center gap-3 border border-[#d4d4d0] bg-[#e8e8e4] p-1.5 rounded dark:border-[#27272a] dark:bg-[#1a1a1a]">
                <span className="font-mono text-[8px] font-bold text-zinc-500 uppercase px-1">
                  power
                </span>
                <button
                  onClick={() => setIsOn(!isOn)}
                  aria-label={isOn ? 'Turn Power Off' : 'Turn Power On'}
                  className={cn(
                    'h-6 w-6 rounded-full border cursor-pointer transition-all duration-200 flex items-center justify-center',
                    isOn
                      ? 'bg-[#10b981] border-[#047857] shadow-[inset_0_2px_3px_rgba(0,0,0,0.3)]'
                      : 'bg-zinc-300 border-zinc-400 dark:bg-zinc-800 dark:border-zinc-700 active:scale-95'
                  )}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                </button>
              </div>
            </div>
          </div>

          {/* Slider Sections Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Languages (Section 1) */}
            <div className="flex flex-col gap-4 border border-[#e4e4e0] bg-[#eaeae6] p-4 rounded dark:border-[#202020] dark:bg-[#181818]">
              <div className="flex items-center justify-between border-b border-[#d4d4d0] pb-2 dark:border-[#2c2c2c]">
                <h4 className="font-mono text-[10px] font-bold tracking-widest text-zinc-600 uppercase dark:text-zinc-400">
                  channel a: core code
                </h4>
                <div className={cn('h-1.5 w-1.5 rounded-full', isOn ? 'bg-[#f05523]' : 'bg-zinc-400')} />
              </div>
              <div className="flex flex-col gap-3">
                {MIXER_DATA[0].channels.map((skill) => (
                  <BraunSlider
                    key={skill.name}
                    value={skill.level}
                    label={skill.name}
                    isOn={isOn}
                  />
                ))}
              </div>
            </div>

            {/* Frameworks (Section 2) */}
            <div className="flex flex-col gap-4 border border-[#e4e4e0] bg-[#eaeae6] p-4 rounded dark:border-[#202020] dark:bg-[#181818]">
              <div className="flex items-center justify-between border-b border-[#d4d4d0] pb-2 dark:border-[#2c2c2c]">
                <h4 className="font-mono text-[10px] font-bold tracking-widest text-zinc-600 uppercase dark:text-zinc-400">
                  channel b: structures
                </h4>
                <div className={cn('h-1.5 w-1.5 rounded-full', isOn ? 'bg-[#f05523]' : 'bg-zinc-400')} />
              </div>
              <div className="flex flex-col gap-3">
                {MIXER_DATA[1].channels.map((skill) => (
                  <BraunSlider
                    key={skill.name}
                    value={skill.level}
                    label={skill.name}
                    isOn={isOn}
                  />
                ))}
              </div>
            </div>

            {/* Tools & Environment (Section 3) */}
            <div className="flex flex-col gap-4 border border-[#e4e4e0] bg-[#eaeae6] p-4 rounded dark:border-[#202020] dark:bg-[#181818]">
              <div className="flex items-center justify-between border-b border-[#d4d4d0] pb-2 dark:border-[#2c2c2c]">
                <h4 className="font-mono text-[10px] font-bold tracking-widest text-zinc-600 uppercase dark:text-zinc-400">
                  channel c: environment
                </h4>
                <div className={cn('h-1.5 w-1.5 rounded-full', isOn ? 'bg-[#f05523]' : 'bg-zinc-400')} />
              </div>
              <div className="flex flex-col gap-3">
                {MIXER_DATA[2].channels.map((skill) => (
                  <BraunSlider
                    key={skill.name}
                    value={skill.level}
                    label={skill.name}
                    isOn={isOn}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer Label */}
          <div className="mt-8 border-t border-[#e4e4e0] pt-4 text-center dark:border-[#202020]">
            <p className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">
              mechanical calibration system / dieter rams layout standard
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
