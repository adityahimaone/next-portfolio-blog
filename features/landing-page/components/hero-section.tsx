'use client'

import { useRef, useState } from 'react'
import { m as motion, useMotionValue, useTransform, animate } from 'motion/react'
import { ArrowDown } from 'lucide-react'

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Frequency scale tuner state (represents focus areas: Code, UI, systems, etc.)
  const focusAreas = ['interface', 'systems', 'interaction', 'performance']
  const [activeFocus, setActiveFocus] = useState(focusAreas[0])
  const tunerVal = useMotionValue(0) // range 0 to 100
  const needleLeft = useTransform(tunerVal, (v) => `${v}%`)

  const handleTune = (index: number) => {
    animate(tunerVal, index * 33.33, {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    })
    setActiveFocus(focusAreas[index])
  }

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#f5f5f3] px-6 py-20 transition-colors dark:bg-[#121212] md:px-16"
    >
      {/* Braun Grid Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-between p-12 opacity-20 dark:opacity-10">
        <div className="h-[1px] w-full bg-zinc-400 dark:bg-zinc-700" />
        <div className="h-[1px] w-full bg-zinc-400 dark:bg-zinc-700" />
      </div>

      {/* Top section: System specs */}
      <div className="relative z-10 flex w-full justify-between font-mono text-[9px] text-zinc-500 uppercase tracking-widest border-b border-[#e4e4e0] pb-4 dark:border-[#202020]">
        <div className="flex gap-4">
          <span>model: ah-2026</span>
          <span className="text-[#d4d4d0]">|</span>
          <span>loc: 7° 47' s, 110° 22' e</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-2 w-2 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          <span>calibrated</span>
        </div>
      </div>

      {/* Middle section: Brand Typo */}
      <div className="relative z-10 my-auto flex flex-col gap-6 md:gap-8 max-w-4xl">
        <div className="flex flex-col">
          <h1 className="font-sans text-[12vw] font-black leading-[0.85] tracking-tighter text-zinc-950 dark:text-white uppercase md:text-[8vw] lg:text-[7vw]">
            aditya
          </h1>
          <h1 className="font-sans text-[12vw] font-black leading-[0.85] tracking-tighter text-[#f05523] uppercase md:text-[8vw] lg:text-[7vw]">
            himaone
          </h1>
        </div>

        <p className="max-w-xl font-mono text-xs text-zinc-600 lowercase tracking-tight leading-relaxed dark:text-zinc-400">
          architecting clean engineering & minimal layout grids. constructing premium digital systems with high performance and zero clutter.
        </p>
      </div>

      {/* Bottom section: The Tuning Panel (Braun Regie style) */}
      <div className="relative z-10 flex flex-col gap-6 border-t border-[#e4e4e0] pt-8 dark:border-[#202020]">
        
        {/* Labeled Tuning Scale */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-mono text-[8px] text-zinc-400 uppercase tracking-widest px-2">
            <span>0.0hz / code</span>
            <span>3.3hz / ui</span>
            <span>6.6hz / ix</span>
            <span>10.0hz / perf</span>
          </div>

          {/* Tuner Slider Track */}
          <div className="relative h-6 bg-[#eaeae6] border border-[#d4d4d0] rounded dark:bg-[#1a1a1a] dark:border-[#27272a] flex items-center">
            
            {/* Tick lines */}
            <div className="absolute inset-0 flex justify-between px-4 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={i % 5 === 0 ? 'h-3 w-[1.5px] bg-zinc-400 dark:bg-zinc-600' : 'h-1.5 w-[1px] bg-zinc-300 dark:bg-zinc-700'} />
              ))}
            </div>

            {/* Scale numbers */}
            <div className="absolute inset-x-0 bottom-0.5 flex justify-between px-3 font-mono text-[7px] text-zinc-400 select-none pointer-events-none">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
            </div>

            {/* Signal Orange indicator needle */}
            <motion.div
              className="absolute h-full w-[2px] bg-[#f05523] shadow-[0_0_8px_rgba(240,85,35,0.6)]"
              style={{ left: needleLeft }}
            />
          </div>
        </div>

        {/* Tactical Push Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 border border-[#d4d4d0] bg-[#e8e8e4] p-0.5 rounded dark:border-[#27272a] dark:bg-[#1a1a1a]">
            {focusAreas.map((area, i) => (
              <button
                key={area}
                onClick={() => handleTune(i)}
                className={cn(
                  'px-4 py-1.5 font-mono text-[9px] font-bold uppercase rounded-sm border transition-all cursor-pointer select-none',
                  activeFocus === area
                    ? 'bg-white border-[#d4d4d0] text-[#f05523] shadow-sm dark:bg-[#2c2c2c] dark:border-[#3c3c3c]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                )}
              >
                {area}
              </button>
            ))}
          </div>

          {/* Call to action mechanical switch */}
          <a
            href="#about"
            className="flex items-center gap-2 border border-[#d4d4d0] bg-white px-5 py-2.5 font-mono text-[9px] font-bold uppercase rounded shadow-sm text-zinc-700 hover:bg-[#f8f8f6] active:translate-y-[1px] dark:border-[#27272a] dark:bg-[#1a1a1a] dark:text-zinc-300"
          >
            <span>scroll details</span>
            <ArrowDown size={10} className="text-[#f05523]" />
          </a>
        </div>
      </div>
    </section>
  )
}

// Utility class wrapper check
import { cn } from '@/lib/utils'
