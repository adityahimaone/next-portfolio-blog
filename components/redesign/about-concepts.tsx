'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { FileText, Music, Play, Layers, Clock, MapPin, Tag } from 'lucide-react'
import { Screw } from '@/components/screw'

// ----------------------------------------------------
// 1. StudioSessionAbout (Analog Recording Log)
// ----------------------------------------------------
export function StudioSessionAbout() {
  return (
    <div className="w-full py-16 px-4">
      <div className="mx-auto max-w-3xl rounded-lg border-2 border-amber-900/30 bg-amber-50 p-6 font-mono text-zinc-900 shadow-xl md:p-10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
        
        {/* Screw Details */}
        <div className="flex justify-between items-center border-b-2 border-dashed border-zinc-350 pb-4 mb-6 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-black tracking-widest uppercase">STUDIO SESSION RECORD</span>
          </div>
          <span className="text-xs font-bold text-zinc-500">[LOG_ID: #001-2026]</span>
        </div>

        {/* Studio Log Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b-2 border-zinc-300 pb-6 mb-6 dark:border-zinc-800">
          <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-400">
            <div><span className="font-black text-zinc-950 dark:text-white">ARTIST    :</span> ADITYA HIMAWAN</div>
            <div><span className="font-black text-zinc-950 dark:text-white">LOCATION  :</span> JAKARTA, INDONESIA</div>
            <div><span className="font-black text-zinc-950 dark:text-white">DATE      :</span> {new Date().toLocaleDateString()}</div>
          </div>
          <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-400">
            <div><span className="font-black text-zinc-950 dark:text-white">DURATION  :</span> 4+ YEARS ACTIVE</div>
            <div><span className="font-black text-zinc-950 dark:text-white">ENGINEER  :</span> SELF-PRODUCED</div>
            <div><span className="font-black text-zinc-950 dark:text-white">CONSOLE   :</span> NEXT.JS 15 / REACT 19</div>
          </div>
        </div>

        {/* Bio Section Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black tracking-widest text-amber-800 dark:text-amber-400 uppercase">
            <FileText size={14} />
            <span>SESSION NOTES: BIOGRAPHY</span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-850 dark:text-zinc-350 font-sans">
            Aditya is a frontend engineer specializing in crafting premium, high-performance web applications.
            With a background rooted in music and code, he designs systems that behave like physical, tactile hardware,
            bridging visual storytelling with rigorous React and Next.js engineering.
          </p>
          <p className="text-sm leading-relaxed text-zinc-850 dark:text-zinc-350 font-sans">
            In his studio, code is mixed like audio channels—balancing performance budget, responsive alignment,
            and micro-animations. From fine-tuning edge routers to crafting pixel-perfect, interactive dashboards,
            his mission is to deliver satisfying, high-fidelity user interfaces.
          </p>
        </div>

        {/* Footer Stamps */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500 uppercase">
          <div className="border border-red-500/50 text-red-500 rounded px-2.5 py-1 rotate-[-3deg] font-black tracking-widest">
            APPROVED FOR RELEASE
          </div>
          <span>TAPE SPEED: 15 IPS</span>
        </div>

      </div>
    </div>
  )
}

// ----------------------------------------------------
// 2. CassetteLinerAbout (Mixtape J-Card Liner Notes)
// ----------------------------------------------------
export function CassetteLinerAbout() {
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A')

  return (
    <div className="w-full py-16 px-4 flex flex-col items-center">
      {/* Tape Toggle */}
      <div className="flex gap-2 mb-6 font-mono text-xs">
        <button
          onClick={() => setActiveSide('A')}
          className={`px-4 py-1.5 rounded cursor-pointer transition-colors ${activeSide === 'A' ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-850 text-zinc-400'}`}
        >
          SIDE A: BACKGROUND
        </button>
        <button
          onClick={() => setActiveSide('B')}
          className={`px-4 py-1.5 rounded cursor-pointer transition-colors ${activeSide === 'B' ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-850 text-zinc-400'}`}
        >
          SIDE B: NOW PLAYING
        </button>
      </div>

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg p-6 shadow-2xl font-mono text-xs text-zinc-300 relative">
        {/* Cassette liner folding line representation */}
        <div className="absolute top-0 bottom-0 left-4 w-px border-l border-dashed border-zinc-800 pointer-events-none" />

        {/* Heading */}
        <div className="pl-6 border-b border-zinc-800 pb-3 flex justify-between items-center text-zinc-500 font-bold uppercase text-[10px]">
          <span>J-CARD LINER #404</span>
          <span>SIDE {activeSide}</span>
        </div>

        <div className="pl-6 py-6 space-y-4 min-h-[220px]">
          {activeSide === 'A' ? (
            <>
              <h3 className="font-bold text-zinc-100 uppercase tracking-widest">ADITYA / SIDE A</h3>
              <p className="leading-relaxed text-zinc-400 font-sans">
                Raised on digital audio workstations and open-source code, Aditya is a Jakarta-based frontend developer.
                He treats layouts like modular patchbays and values smooth interaction above all else.
              </p>
              <div className="pt-2 text-[10px] text-zinc-500">
                INFLUENCES: 80s Synths, Bauhaus Design, Clean Code Architecture.
              </div>
            </>
          ) : (
            <>
              <h3 className="font-bold text-zinc-100 uppercase tracking-widest">CURRENT FOCUS / SIDE B</h3>
              <p className="leading-relaxed text-zinc-400 font-sans">
                Currently building high-performance edge load balancers (9router), compliant rule checkers, and private agent frameworks.
                Always refining the balance between UI animations and raw loading speed.
              </p>
              <div className="pt-2 text-[10px] text-zinc-500">
                CURRENT DEPLOY STAGINGS: Vercel, Cloudflare, Fly.io
              </div>
            </>
          )}
        </div>

        {/* Tracklist representation for Tech Stack */}
        <div className="pl-6 border-t border-zinc-800 pt-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">TRACKLIST (TECH STACK)</span>
          <ol className="space-y-1 text-zinc-400">
            <li>01. React 19 / Next.js 15 <span className="text-zinc-600">[04:12]</span></li>
            <li>02. TypeScript & ES6+ <span className="text-zinc-600">[03:45]</span></li>
            <li>03. Framer Motion & CSS Variables <span className="text-zinc-600">[05:10]</span></li>
            <li>04. Tailwind CSS v4 & PostCSS <span className="text-zinc-600">[02:30]</span></li>
          </ol>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 3. ArtistOneSheetAbout (Music Industry Press Sheet)
// ----------------------------------------------------
export function ArtistOneSheetAbout() {
  return (
    <div className="w-full py-16 px-4">
      <div className="mx-auto max-w-4xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl md:p-8 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Quick Facts */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 pb-6 md:pb-0 md:pr-8">
            <div className="relative h-44 w-44 overflow-hidden rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 shadow-md mb-6 flex items-center justify-center text-white">
              <Music size={48} className="animate-bounce" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">QUICK STATS</h3>
            <ul className="space-y-3 font-mono text-xs text-zinc-655 dark:text-zinc-450 w-full">
              <li className="flex justify-between"><span>HOMETOWN :</span> <span className="text-zinc-900 dark:text-zinc-100">JAKARTA</span></li>
              <li className="flex justify-between"><span>ROLE     :</span> <span className="text-zinc-900 dark:text-zinc-100">FRONTEND</span></li>
              <li className="flex justify-between"><span>RELEASED :</span> <span className="text-zinc-900 dark:text-zinc-100">2021-PRES</span></li>
              <li className="flex justify-between"><span>GIG STATS:</span> <span className="text-zinc-900 dark:text-zinc-100">99.9% LIVE</span></li>
            </ul>
          </div>

          {/* Right Columns: Press Release Bio */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-indigo-500 tracking-widest uppercase">ARTIST ONE-SHEET / PRESS RELEASE</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-1">
                Aditya Himawan: High-Fidelity Frontend Conductor
              </h2>
            </div>

            <div className="space-y-4 text-zinc-700 dark:text-zinc-350 text-sm leading-relaxed">
              <p>
                Aditya Himawan is a premier frontend developer who crafts performant, interactive web assets with Next.js and React.
                Drawing inspiration from premium physical recording gear, his designs break the mold of typical template-driven layouts,
                injecting asymmetric structure, skeuomorphic dial controls, and real-time canvas visualizations.
              </p>
              <p>
                Having spent over 4 years collaborating with engineering groups and creative studios, Aditya treats interface design as a mix session.
                Every component is carefully EQ'd to provide optimal framerates, accessibility compliance, and visual charm.
              </p>
            </div>

            {/* Tour Schedule / Current Gig */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h4 className="font-mono text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3">CURRENT DISPATCH (UPCOMING TOURS)</h4>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white">Active Stage Deployment</div>
                  <div className="text-zinc-500 mt-0.5">Optimizing Edge Core routing & interactive dashboard projects.</div>
                </div>
                <div className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold px-3 py-1 rounded">
                  ONGOING
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
