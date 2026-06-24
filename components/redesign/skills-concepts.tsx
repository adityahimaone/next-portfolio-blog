'use client'

import React, { useState } from 'react'
import { Screw } from '@/components/screw'

// ----------------------------------------------------
// 1. ModularSynthSkills (Eurorack Patch Bay)
// ----------------------------------------------------
export function ModularSynthSkills() {
  const [activeModule, setActiveModule] = useState<string | null>(null)

  const modules = [
    {
      id: 'react',
      name: 'REACT 19',
      type: 'VCO',
      cables: ['ts', 'next'],
      info: 'Component architecture, state tuning, and concurrent rendering.',
    },
    {
      id: 'next',
      name: 'NEXT.JS',
      type: 'VCF',
      cables: ['react', 'ts'],
      info: 'App router, server components, and edge rendering engines.',
    },
    {
      id: 'ts',
      name: 'TS / JS',
      type: 'LFO',
      cables: ['react'],
      info: 'Strict typing, state machines, and high-performance algorithms.',
    },
    {
      id: 'css',
      name: 'CSS / TW',
      type: 'ADSR',
      cables: [],
      info: 'Tailwind CSS, design system variables, and responsive layout mixing.',
    },
  ]

  return (
    <div className="flex w-full flex-col items-center px-4 py-16">
      <div className="relative w-full max-w-3xl rounded-2xl border-4 border-zinc-700 bg-zinc-800 p-6 shadow-2xl">
        {/* Frame Screws */}
        <div className="absolute top-2 left-2">
          <Screw />
        </div>
        <div className="absolute top-2 right-2">
          <Screw />
        </div>
        <div className="absolute bottom-2 left-2">
          <Screw />
        </div>
        <div className="absolute right-2 bottom-2">
          <Screw />
        </div>

        <h3 className="mb-6 text-center font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
          EURORACK SKILLS PATCHBAY
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className={`flex flex-col items-center gap-4 rounded-lg border-2 p-4 transition-colors ${activeModule === mod.id ? 'border-amber-500 bg-zinc-950/80' : 'border-zinc-700 bg-zinc-900'}`}
              onMouseEnter={() => setActiveModule(mod.id)}
              onMouseLeave={() => setActiveModule(null)}
            >
              {/* Module Header */}
              <div className="border-zinc-850 flex w-full justify-between border-b pb-2 font-mono text-[9px] font-bold text-zinc-500">
                <span>{mod.type}</span>
                <span>{mod.name}</span>
              </div>

              {/* Dial Knobs */}
              <div className="flex w-full justify-around">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 shadow-inner">
                    <div className="h-4 w-0.5 origin-bottom rotate-45 bg-zinc-400" />
                  </div>
                  <span className="font-mono text-[7px] text-zinc-500 uppercase">
                    FREQ
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 shadow-inner">
                    <div className="h-4 w-0.5 origin-bottom -rotate-30 bg-zinc-400" />
                  </div>
                  <span className="font-mono text-[7px] text-zinc-500 uppercase">
                    LVL
                  </span>
                </div>
              </div>

              {/* Cable patch ports */}
              <div className="flex items-center gap-2">
                <div className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-zinc-700 bg-zinc-950">
                  <div
                    className={`h-3 w-3 rounded-full ${activeModule === mod.id || (activeModule && mod.cables.includes(activeModule)) ? 'animate-pulse bg-amber-500' : 'bg-zinc-800'}`}
                  />
                </div>
                <span className="font-mono text-[8px] text-zinc-400 uppercase">
                  CV OUT
                </span>
              </div>

              {/* Screen Readout if active */}
              {activeModule === mod.id && (
                <div className="text-center font-mono text-[9px] leading-relaxed text-zinc-400">
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
    {
      id: 'input',
      name: 'OVERDRIVE',
      type: 'Languages',
      color: 'bg-amber-600',
      stack: 'HTML/CSS/JS',
      info: 'Raw scripting, layout syntax, and logic compilation.',
    },
    {
      id: 'amp',
      name: 'DISTORTION',
      type: 'Frameworks',
      color: 'bg-red-650',
      stack: 'React & Next.js',
      info: 'Gain controls, page rendering acceleration, dynamic routing.',
    },
    {
      id: 'fx',
      name: 'CHORUS / DELAY',
      type: 'Animations',
      color: 'bg-blue-600',
      stack: 'Framer Motion',
      info: 'Spatial spacing, smooth transition decay, responsive parameters.',
    },
    {
      id: 'out',
      name: 'COMPRESSOR',
      type: 'Deployment',
      color: 'bg-emerald-600',
      stack: 'Deploy & CDN',
      info: 'Build compression, cache-headers leveling, and infrastructure distribution.',
    },
  ]

  return (
    <div className="flex w-full flex-col items-center px-4 py-16">
      <div className="relative flex w-full max-w-4xl flex-col items-center rounded-3xl border-2 border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="mb-10 text-center font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
          SIGNAL CHAIN PEDAL BOARD
        </h3>

        <div className="relative flex w-full flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Signal flow arrows */}
          <div className="pointer-events-none absolute top-1/2 right-4 left-4 z-0 hidden h-0.5 border-t border-dashed border-zinc-700 md:block" />

          {pedals.map((pedal) => (
            <div
              key={pedal.id}
              onClick={() =>
                setSelectedPedal(selectedPedal === pedal.id ? null : pedal.id)
              }
              className={`relative z-10 w-44 rounded-2xl border-4 border-zinc-950 p-4 ${pedal.color} flex transform cursor-pointer flex-col items-center gap-4 text-zinc-100 shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-1 active:translate-y-0`}
            >
              {/* Pedal Name */}
              <div className="text-center font-sans text-sm font-bold tracking-widest">
                {pedal.name}
              </div>
              <div className="font-mono text-[9px] text-white/70 uppercase">
                {pedal.type}
              </div>

              {/* Pedal Dials */}
              <div className="flex w-full justify-between px-2">
                <div className="border-zinc-750 flex h-6 w-6 items-center justify-center rounded-full border bg-zinc-900">
                  <div className="h-3 w-0.5 origin-bottom rotate-12 bg-white" />
                </div>
                <div className="border-zinc-750 flex h-6 w-6 items-center justify-center rounded-full border bg-zinc-900">
                  <div className="h-3 w-0.5 origin-bottom -rotate-45 bg-white" />
                </div>
              </div>

              {/* Bypass Switch LED */}
              <div
                className={`h-3.5 w-3.5 rounded-full border border-black/45 ${selectedPedal === pedal.id ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-zinc-800'}`}
              />

              {/* Bypass Footswitch button */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-500 bg-zinc-300 shadow-inner active:bg-zinc-400">
                <div className="h-5 w-5 rounded-full border border-zinc-500 bg-zinc-400" />
              </div>

              <div className="w-full rounded bg-black/30 px-2 py-0.5 text-center font-mono text-[9px] font-bold">
                {pedal.stack}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Pedal Console Readout */}
        <div className="border-zinc-850 mt-8 flex h-24 w-full max-w-xl flex-col justify-center rounded-lg border bg-zinc-950 p-4 font-mono text-xs">
          {selectedPedal ? (
            <div>
              <span className="mb-1 block font-bold text-amber-500">
                ACTIVE FX BLOCK:{' '}
                {pedals.find((p) => p.id === selectedPedal)?.name}
              </span>
              <span className="text-zinc-400">
                {pedals.find((p) => p.id === selectedPedal)?.info}
              </span>
            </div>
          ) : (
            <div className="text-center tracking-widest text-zinc-600 uppercase">
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
    {
      name: '1U LANGUAGES DE-ESSER',
      skills: [
        { name: 'HTML', lvl: 95 },
        { name: 'CSS', lvl: 95 },
        { name: 'JS', lvl: 95 },
        { name: 'TS', lvl: 90 },
      ],
    },
    {
      name: '2U SYNTHESIS & CORE DRIVE',
      skills: [
        { name: 'REACT', lvl: 95 },
        { name: 'NEXT.JS', lvl: 92 },
        { name: 'REMIX', lvl: 70 },
      ],
    },
    {
      name: '1U INFRASTRUCTURE PROCESSOR',
      skills: [
        { name: 'GIT', lvl: 90 },
        { name: 'MOTION', lvl: 90 },
        { name: 'FIGMA', lvl: 85 },
      ],
    },
  ]

  return (
    <div className="w-full px-4 py-16">
      <div className="relative mx-auto flex max-w-3xl flex-col gap-4 rounded-lg border-x-8 border-y-4 border-zinc-700 bg-zinc-900 p-4 shadow-2xl">
        {/* Rack Rails details */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-2 w-1 bg-zinc-950" />
        <div className="pointer-events-none absolute top-0 right-2 bottom-0 w-1 bg-zinc-950" />

        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="relative flex w-full flex-col justify-between gap-4 rounded border border-zinc-800 bg-linear-to-b from-zinc-950 to-zinc-900 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] md:flex-row md:items-center"
          >
            {/* Screws holding units to rack */}
            <div className="absolute top-1 left-1">
              <Screw className="text-zinc-650" />
            </div>
            <div className="absolute top-1 right-1">
              <Screw className="text-zinc-650" />
            </div>
            <div className="absolute bottom-1 left-1">
              <Screw className="text-zinc-650" />
            </div>
            <div className="absolute right-1 bottom-1">
              <Screw className="text-zinc-650" />
            </div>

            {/* Left faceplate labels */}
            <div className="pl-4 font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              {cat.name}
            </div>

            {/* Right: skill LEDs / knobs */}
            <div className="flex flex-wrap items-center gap-4 pr-4">
              {cat.skills.map((skill) => (
                <div key={skill.name} className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-black text-zinc-500">
                    {skill.name}
                  </span>
                  {/* Small LED meter bar */}
                  <div className="border-zinc-850 flex gap-0.5 rounded border bg-black p-0.5">
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
