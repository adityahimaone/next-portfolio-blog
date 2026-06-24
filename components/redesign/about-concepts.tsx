'use client'

import React, { useState } from 'react'
import { FileText, Music } from 'lucide-react'

// ----------------------------------------------------
// 1. StudioSessionAbout (Analog Recording Log)
// ----------------------------------------------------
export function StudioSessionAbout() {
  return (
    <div className="w-full px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-lg border-2 border-amber-900/30 bg-amber-50 p-6 font-mono text-zinc-900 shadow-xl md:p-10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
        {/* Screw Details */}
        <div className="border-zinc-350 mb-6 flex items-center justify-between border-b-2 border-dashed pb-4 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
            <span className="text-xs font-black tracking-widest uppercase">
              STUDIO SESSION RECORD
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-500">
            [LOG_ID: #001-2026]
          </span>
        </div>

        {/* Studio Log Header Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 border-b-2 border-zinc-300 pb-6 md:grid-cols-2 dark:border-zinc-800">
          <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-400">
            <div>
              <span className="font-black text-zinc-950 dark:text-white">
                ARTIST :
              </span>{' '}
              ADITYA HIMAWAN
            </div>
            <div>
              <span className="font-black text-zinc-950 dark:text-white">
                LOCATION :
              </span>{' '}
              JAKARTA, INDONESIA
            </div>
            <div>
              <span className="font-black text-zinc-950 dark:text-white">
                DATE :
              </span>{' '}
              {new Date().toLocaleDateString()}
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-400">
            <div>
              <span className="font-black text-zinc-950 dark:text-white">
                DURATION :
              </span>{' '}
              4+ YEARS ACTIVE
            </div>
            <div>
              <span className="font-black text-zinc-950 dark:text-white">
                ENGINEER :
              </span>{' '}
              SELF-PRODUCED
            </div>
            <div>
              <span className="font-black text-zinc-950 dark:text-white">
                CONSOLE :
              </span>{' '}
              NEXT.JS 15 / REACT 19
            </div>
          </div>
        </div>

        {/* Bio Section Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black tracking-widest text-amber-800 uppercase dark:text-amber-400">
            <FileText size={14} />
            <span>SESSION NOTES: BIOGRAPHY</span>
          </div>
          <p className="text-zinc-850 dark:text-zinc-350 font-sans text-sm leading-relaxed">
            Aditya is a frontend engineer specializing in crafting premium,
            high-performance web applications. With a background rooted in music
            and code, he designs systems that behave like physical, tactile
            hardware, bridging visual storytelling with rigorous React and
            Next.js engineering.
          </p>
          <p className="text-zinc-850 dark:text-zinc-350 font-sans text-sm leading-relaxed">
            In his studio, code is mixed like audio channels—balancing
            performance budget, responsive alignment, and micro-animations. From
            fine-tuning edge routers to crafting pixel-perfect, interactive
            dashboards, his mission is to deliver satisfying, high-fidelity user
            interfaces.
          </p>
        </div>

        {/* Footer Stamps */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-6 text-[10px] text-zinc-500 uppercase dark:border-zinc-800">
          <div className="rotate-[-3deg] rounded border border-red-500/50 px-2.5 py-1 font-black tracking-widest text-red-500">
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
    <div className="flex w-full flex-col items-center px-4 py-16">
      {/* Tape Toggle */}
      <div className="mb-6 flex gap-2 font-mono text-xs">
        <button
          onClick={() => setActiveSide('A')}
          className={`cursor-pointer rounded px-4 py-1.5 transition-colors ${activeSide === 'A' ? 'bg-indigo-600 font-bold text-white' : 'bg-zinc-850 text-zinc-400'}`}
        >
          SIDE A: BACKGROUND
        </button>
        <button
          onClick={() => setActiveSide('B')}
          className={`cursor-pointer rounded px-4 py-1.5 transition-colors ${activeSide === 'B' ? 'bg-indigo-600 font-bold text-white' : 'bg-zinc-850 text-zinc-400'}`}
        >
          SIDE B: NOW PLAYING
        </button>
      </div>

      <div className="relative w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 font-mono text-xs text-zinc-300 shadow-2xl">
        {/* Cassette liner folding line representation */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-4 w-px border-l border-dashed border-zinc-800" />

        {/* Heading */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 pl-6 text-[10px] font-bold text-zinc-500 uppercase">
          <span>J-CARD LINER #404</span>
          <span>SIDE {activeSide}</span>
        </div>

        <div className="min-h-[220px] space-y-4 py-6 pl-6">
          {activeSide === 'A' ? (
            <>
              <h3 className="font-bold tracking-widest text-zinc-100 uppercase">
                ADITYA / SIDE A
              </h3>
              <p className="font-sans leading-relaxed text-zinc-400">
                Raised on digital audio workstations and open-source code,
                Aditya is a Jakarta-based frontend developer. He treats layouts
                like modular patchbays and values smooth interaction above all
                else.
              </p>
              <div className="pt-2 text-[10px] text-zinc-500">
                INFLUENCES: 80s Synths, Bauhaus Design, Clean Code Architecture.
              </div>
            </>
          ) : (
            <>
              <h3 className="font-bold tracking-widest text-zinc-100 uppercase">
                CURRENT FOCUS / SIDE B
              </h3>
              <p className="font-sans leading-relaxed text-zinc-400">
                Currently building high-performance edge load balancers
                (9router), compliant rule checkers, and private agent
                frameworks. Always refining the balance between UI animations
                and raw loading speed.
              </p>
              <div className="pt-2 text-[10px] text-zinc-500">
                CURRENT DEPLOY STAGINGS: Vercel, Cloudflare, Fly.io
              </div>
            </>
          )}
        </div>

        {/* Tracklist representation for Tech Stack */}
        <div className="border-t border-zinc-800 pt-4 pl-6">
          <span className="mb-2 block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            TRACKLIST (TECH STACK)
          </span>
          <ol className="space-y-1 text-zinc-400">
            <li>
              01. React 19 / Next.js 15{' '}
              <span className="text-zinc-600">[04:12]</span>
            </li>
            <li>
              02. TypeScript & ES6+{' '}
              <span className="text-zinc-600">[03:45]</span>
            </li>
            <li>
              03. Framer Motion & CSS Variables{' '}
              <span className="text-zinc-600">[05:10]</span>
            </li>
            <li>
              04. Tailwind CSS v4 & PostCSS{' '}
              <span className="text-zinc-600">[02:30]</span>
            </li>
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
    <div className="w-full px-4 py-16">
      <div className="mx-auto max-w-4xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl md:p-8 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left Column: Avatar & Quick Facts */}
          <div className="flex flex-col items-center border-b border-zinc-200 pb-6 text-center md:col-span-1 md:items-start md:border-r md:border-b-0 md:pr-8 md:pb-0 md:text-left dark:border-zinc-800">
            <div className="relative mb-6 flex h-44 w-44 items-center justify-center overflow-hidden rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
              <Music size={48} className="animate-bounce" />
            </div>

            <h3 className="mb-4 text-lg font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
              QUICK STATS
            </h3>
            <ul className="text-zinc-655 dark:text-zinc-450 w-full space-y-3 font-mono text-xs">
              <li className="flex justify-between">
                <span>HOMETOWN :</span>{' '}
                <span className="text-zinc-900 dark:text-zinc-100">
                  JAKARTA
                </span>
              </li>
              <li className="flex justify-between">
                <span>ROLE :</span>{' '}
                <span className="text-zinc-900 dark:text-zinc-100">
                  FRONTEND
                </span>
              </li>
              <li className="flex justify-between">
                <span>RELEASED :</span>{' '}
                <span className="text-zinc-900 dark:text-zinc-100">
                  2021-PRES
                </span>
              </li>
              <li className="flex justify-between">
                <span>GIG STATS:</span>{' '}
                <span className="text-zinc-900 dark:text-zinc-100">
                  99.9% LIVE
                </span>
              </li>
            </ul>
          </div>

          {/* Right Columns: Press Release Bio */}
          <div className="space-y-6 md:col-span-2">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase">
                ARTIST ONE-SHEET / PRESS RELEASE
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Aditya Himawan: High-Fidelity Frontend Conductor
              </h2>
            </div>

            <div className="dark:text-zinc-350 space-y-4 text-sm leading-relaxed text-zinc-700">
              <p>
                Aditya Himawan is a premier frontend developer who crafts
                performant, interactive web assets with Next.js and React.
                Drawing inspiration from premium physical recording gear, his
                designs break the mold of typical template-driven layouts,
                injecting asymmetric structure, skeuomorphic dial controls, and
                real-time canvas visualizations.
              </p>
              <p>
                Having spent over 4 years collaborating with engineering groups
                and creative studios, Aditya treats interface design as a mix
                session. Every component is carefully EQ&apos;d to provide
                optimal framerates, accessibility compliance, and visual charm.
              </p>
            </div>

            {/* Tour Schedule / Current Gig */}
            <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <h4 className="mb-3 font-mono text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
                CURRENT DISPATCH (UPCOMING TOURS)
              </h4>
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white">
                    Active Stage Deployment
                  </div>
                  <div className="mt-0.5 text-zinc-500">
                    Optimizing Edge Core routing & interactive dashboard
                    projects.
                  </div>
                </div>
                <div className="rounded bg-indigo-100 px-3 py-1 font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
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
