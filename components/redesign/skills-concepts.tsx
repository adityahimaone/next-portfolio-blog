'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Sliders, Zap, Volume2, Cpu, Settings } from 'lucide-react'
import { Screw } from '@/components/screw'

// ----------------------------------------------------
// 1. ModularSynthSkills (Eurorack Patch Bay)
// ----------------------------------------------------
export function ModularSynthSkills() {
  const [activeModule, setActiveModule] = useState<string | null>(null)

  const modules = [
    { id: 'react', name: 'REACT 19', type: 'VCO', cables: ['ts', 'next'], info: 'Component architecture, state tuning, and concurrent rendering.' },
    { id: 'next', name: 'NEXT.JS', type: 'VCF', cables: ['react', 'ts'], info: 'App router, server components, and edge rendering engines.' },
    { id: 'ts', name: 'TS / JS', type: 'LFO', cables: ['react'], info: 'Strict typing, state machines, and high-performance algorithms.' },
    { id: 'css', name: 'CSS / TW', type: 'ADSR', cables: [], info: 'Tailwind CSS, design system variables, and responsive layout mixing.' },
  ]

  return (
    <div className="w-full py-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl rounded-2xl border-4 border-zinc-700 bg-zinc-800 p-6 shadow-2xl relative">
        {/* Frame Screws */}
        <div className="absolute top-2 left-2"><Screw /></div>
        <div className="absolute top-2 right-2"><Screw /></div>
        <div className="absolute bottom-2 left-2"><Screw /></div>
        <div className="absolute bottom-2 right-2"><Screw /></div>

        <h3 className="font-mono text-xs font-bold text-zinc-400 tracking-widest text-center mb-6 uppercase">EURORACK SKILLS PATCHBAY</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className={`rounded-lg border-2 p-4 flex flex-col items-center gap-4 transition-colors ${activeModule === mod.id ? 'border-amber-500 bg-zinc-950/80' : 'border-zinc-700 bg-zinc-900'}`}
              onMouseEnter={() => setActiveModule(mod.id)}
              onMouseLeave={() => setActiveModule(null)}
            >
              {/* Module Header */}
              <div className="flex justify-between w-full border-b border-zinc-850 pb-2 text-[9px] font-mono text-zinc-500 font-bold">
                <span>{mod.type}</span>
                <span>{mod.name}</span>
              </div>

              {/* Dial Knobs */}
              <div className="flex justify-around w-full">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800 shadow-inner flex items-center justify-center">
                    <div className="h-4 w-0.5 bg-zinc-400 origin-bottom rotate-45" />
                  </div>
                  <span className="text-[7px] text-zinc-500 uppercase font-mono">FREQ</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800 shadow-inner flex items-center justify-center">
                    <div className="h-4 w-0.5 bg-zinc-400 origin-bottom -rotate-30" />
                  </div>
                  <span className="text-[7px] text-zinc-500 uppercase font-mono">LVL</span>
                </div>
              </div>

              {/* Cable patch ports */}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center relative cursor-pointer">
                  <div className={`h-3 w-3 rounded-full ${activeModule === mod.id || (activeModule && mod.cables.includes(activeModule)) ? 'bg-amber-500 animate-pulse' : 'bg-zinc-800'}`} />
                </div>
                <span className="text-[8px] font-mono text-zinc-400 uppercase">CV OUT</span>
              </div>

              {/* Screen Readout if active */}
              {activeModule === mod.id && (
                <div className="text-[9px] font-mono text-zinc-400 text-center leading-relaxed">
                  {mod.info}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 2. SignalChainSkills (Guitar Pedal Board Chain)
// ----------------------------------------------------
export function SignalChainSkills() {
  const [selectedPedal, setSelectedPedal] = useState<string | null>(null)

  const pedals = [
    { id: 'input', name: 'OVERDRIVE', type: 'Languages', color: 'bg-amber-600', stack: 'HTML/CSS/JS', info: 'Raw scripting, layout syntax, and logic compilation.' },
    { id: 'amp', name: 'DISTORTION', type: 'Frameworks', color: 'bg-red-650', stack: 'React & Next.js', info: 'Gain controls, page rendering acceleration, dynamic routing.' },
    { id: 'fx', name: 'CHORUS / DELAY', type: 'Animations', color: 'bg-blue-600', stack: 'Framer Motion', info: 'Spatial spacing, smooth transition decay, responsive parameters.' },
    { id: 'out', name: 'COMPRESSOR', type: 'Deployment', color: 'bg-emerald-600', stack: 'Deploy & CDN', info: 'Build compression, cache-headers leveling, and infrastructure distribution.' },
  ]

  return (
    <div className="w-full py-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl p-6 bg-zinc-900 rounded-3xl border-2 border-zinc-800 shadow-2xl relative flex flex-col items-center">
        <h3 className="font-mono text-xs font-bold text-zinc-400 tracking-widest text-center mb-10 uppercase">SIGNAL CHAIN PEDAL BOARD</h3>

        <div className="flex flex-col md:flex-row items-center md:justify-between w-full gap-8 relative">
          
          {/* Signal flow arrows */}
          <div className="hidden md:block absolute left-4 right-4 top-1/2 h-0.5 border-t border-dashed border-zinc-700 pointer-events-none z-0" />

          {pedals.map((pedal, idx) => (
            <div
              key={pedal.id}
              onClick={() => setSelectedPedal(selectedPedal === pedal.id ? null : pedal.id)}
              className={`relative z-10 w-44 rounded-2xl border-4 border-zinc-950 p-4 ${pedal.color} text-zinc-100 flex flex-col items-center gap-4 cursor-pointer transform hover:-translate-y-1 active:translate-y-0 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.5)]`}
            >
              {/* Pedal Name */}
              <div className="text-center font-bold tracking-widest text-sm font-sans">{pedal.name}</div>
              <div className="text-[9px] font-mono text-white/70 uppercase">{pedal.type}</div>

              {/* Pedal Dials */}
              <div className="flex justify-between w-full px-2">
                <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-750 flex items-center justify-center">
                  <div className="h-3 w-0.5 bg-white origin-bottom rotate-12" />
                </div>
                <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-750 flex items-center justify-center">
                  <div className="h-3 w-0.5 bg-white origin-bottom -rotate-45" />
                </div>
              </div>

              {/* Bypass Switch LED */}
              <div className={`h-3.5 w-3.5 rounded-full border border-black/45 ${selectedPedal === pedal.id ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-zinc-800'}`} />

              {/* Bypass Footswitch button */}
              <div className="h-8 w-8 rounded-full bg-zinc-300 border-2 border-zinc-500 shadow-inner flex items-center justify-center active:bg-zinc-400">
                <div className="h-5 w-5 rounded-full bg-zinc-400 border border-zinc-500" />
              </div>

              <div className="text-[9px] font-mono font-bold text-center bg-black/30 rounded px-2 py-0.5 w-full">
                {pedal.stack}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Pedal Console Readout */}
        <div className="mt-8 w-full max-w-xl h-24 rounded-lg bg-zinc-950 border border-zinc-850 p-4 font-mono text-xs flex flex-col justify-center">
          {selectedPedal ? (
            <div>
              <span className="text-amber-500 font-bold block mb-1">
                ACTIVE FX BLOCK: {pedals.find((p) => p.id === selectedPedal)?.name}
              </span>
              <span className="text-zinc-400">
                {pedals.find((p) => p.id === selectedPedal)?.info}
              </span>
            </div>
          ) : (
            <div className="text-zinc-600 text-center uppercase tracking-widest">
              TAP A PEDAL TO ENGAGE FX BLOCK
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 3. RackUnitSkills (19" Equipment Rack List)
// ----------------------------------------------------
export function RackUnitSkills() {
  const categories = [
    { name: '1U LANGUAGES DE-ESSER', skills: [{ name: 'HTML', lvl: 95 }, { name: 'CSS', lvl: 95 }, { name: 'JS', lvl: 95 }, { name: 'TS', lvl: 90 }] },
    { name: '2U SYNTHESIS & CORE DRIVE', skills: [{ name: 'REACT', lvl: 95 }, { name: 'NEXT.JS', lvl: 92 }, { name: 'REMIX', lvl: 70 }] },
    { name: '1U INFRASTRUCTURE PROCESSOR', skills: [{ name: 'GIT', lvl: 90 }, { name: 'MOTION', lvl: 90 }, { name: 'FIGMA', lvl: 85 }] },
  ]

  return (
    <div className="w-full py-16 px-4">
      <div className="mx-auto max-w-3xl rounded-lg border-x-8 border-y-4 border-zinc-700 bg-zinc-900 p-4 shadow-2xl relative flex flex-col gap-4">
        
        {/* Rack Rails details */}
        <div className="absolute top-0 bottom-0 left-2 w-1 bg-zinc-950 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-2 w-1 bg-zinc-950 pointer-events-none" />

        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="w-full rounded border border-zinc-800 bg-linear-to-b from-zinc-950 to-zinc-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative"
          >
            {/* Screws holding units to rack */}
            <div className="absolute top-1 left-1"><Screw className="text-zinc-650" /></div>
            <div className="absolute top-1 right-1"><Screw className="text-zinc-650" /></div>
            <div className="absolute bottom-1 left-1"><Screw className="text-zinc-650" /></div>
            <div className="absolute bottom-1 right-1"><Screw className="text-zinc-650" /></div>

            {/* Left faceplate labels */}
            <div className="pl-4 font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              {cat.name}
            </div>

            {/* Right: skill LEDs / knobs */}
            <div className="flex flex-wrap items-center gap-4 pr-4">
              {cat.skills.map((skill) => (
                <div key={skill.name} className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-zinc-500 font-black">{skill.name}</span>
                  {/* Small LED meter bar */}
                  <div className="flex gap-0.5 bg-black p-0.5 rounded border border-zinc-850">
                    {[...Array(5)].map((_, i) => {
                      const limit = (i + 1) * 20
                      const active = skill.lvl >= limit
                      return (
                        <div
                          key={i}
                          className={`h-2.5 w-1.5 rounded-sm ${active ? 'bg-amber-500 shadow-[0_0_3px_#f59e0b]' : 'bg-zinc-950'}`}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
