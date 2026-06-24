'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Play, ExternalLink } from 'lucide-react'
import { PROJECTS_SHOWCASE } from '@/features/landing-page/constants'
import Image from 'next/image'

// ----------------------------------------------------
// 1. RecordStoreCrateProjects (LP Record Crate)
// ----------------------------------------------------
export function RecordStoreCrateProjects() {
  const [filterGenre, setFilterGenre] = useState<string | null>(null)

  const filtered = filterGenre
    ? PROJECTS_SHOWCASE.filter((p) =>
        p.genre?.toLowerCase().includes(filterGenre.toLowerCase()),
      )
    : PROJECTS_SHOWCASE

  const genres = [
    'Corporate',
    'AI',
    'Compliance',
    'Networking',
    'Utility',
    'DeFi',
  ]

  return (
    <div className="flex w-full flex-col items-center px-4 py-16">
      <div className="w-full max-w-4xl">
        <h3 className="mb-6 text-center font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
          RECORD CRATE BROWSING
        </h3>

        {/* Tab Filters */}
        <div className="mb-8 flex flex-wrap justify-center gap-2 font-mono text-xs">
          <button
            onClick={() => setFilterGenre(null)}
            className={`cursor-pointer rounded px-3 py-1 ${!filterGenre ? 'bg-amber-500 font-bold text-black' : 'bg-zinc-800 text-zinc-400'}`}
          >
            ALL GENRES
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setFilterGenre(g)}
              className={`cursor-pointer rounded px-3 py-1 ${filterGenre === g ? 'bg-amber-500 font-bold text-black' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {g.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Record Crate horizontal container */}
        <div className="border-zinc-850 scrollbar-thin flex gap-6 overflow-x-auto rounded-2xl border-4 bg-zinc-900 p-6 py-10 shadow-2xl">
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ y: -15, rotate: -2 }}
              className="flex w-[220px] min-w-[220px] shrink-0 cursor-pointer flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left shadow-lg"
            >
              {/* Record Sleeve Image */}
              <div className="bg-zinc-850 relative aspect-square w-full overflow-hidden rounded shadow-inner">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="200px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900 font-mono text-[10px] text-zinc-700">
                    NO ART
                  </div>
                )}
                {/* Vinyl overlay details */}
                <div className="bg-radial-gradient pointer-events-none absolute inset-0 from-transparent to-black/30" />
              </div>

              {/* Title info */}
              <div className="space-y-1">
                <h4 className="truncate font-sans text-sm font-bold text-zinc-100">
                  {project.title}
                </h4>
                <div className="flex justify-between font-mono text-[9px] font-bold text-zinc-500">
                  <span>{project.genre}</span>
                  <span>{project.year}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 2. MusicVideoProjects (Music Video Grid Catalog)
// ----------------------------------------------------
export function MusicVideoProjects() {
  return (
    <div className="w-full px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h3 className="mb-10 text-center font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
          FEATURED MUSIC VIDEOS (PROJECT DEMOS)
        </h3>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {PROJECTS_SHOWCASE.slice(0, 4).map((project) => (
            <div
              key={project.id}
              className="group border-zinc-850 flex flex-col overflow-hidden rounded-xl border bg-zinc-950 shadow-xl"
            >
              {/* Widescreen 16:9 Thumbnail wrapper */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-zinc-700">
                    DEMO SCREEN
                  </div>
                )}

                {/* Video Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <a
                    href={project.url}
                    target="_blank"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform active:scale-95"
                  >
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </a>
                </div>
              </div>

              {/* Info text details */}
              <div className="space-y-2 p-5 text-left">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-sans text-lg font-extrabold text-zinc-100">
                    {project.title}
                  </h4>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {project.year}
                  </span>
                </div>
                <p className="line-clamp-2 font-sans text-xs leading-relaxed text-zinc-400">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 3. TechnicalRiderProjects (Flip Card Details)
// ----------------------------------------------------
export function TechnicalRiderProjects() {
  const [flippedCard, setFlippedCard] = useState<number | null>(null)

  return (
    <div className="w-full px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h3 className="mb-10 text-center font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
          TECHNICAL RIDER SPEC SHEET
        </h3>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS_SHOWCASE.map((project) => (
            <div
              key={project.id}
              className="perspective-1000 h-[300px] w-full cursor-pointer"
              onClick={() =>
                setFlippedCard(flippedCard === project.id ? null : project.id)
              }
            >
              <div
                className={`transform-style-3d relative h-full w-full transition-transform duration-700 ${flippedCard === project.id ? 'rotate-y-180' : ''}`}
              >
                {/* Front Side: Album Cover */}
                <div className="absolute inset-0 flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl backface-hidden">
                  <div className="relative flex-1 overflow-hidden rounded bg-zinc-900">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover object-top"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-bold text-zinc-100">
                      {project.title}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">
                      {project.genre}
                    </span>
                  </div>
                </div>

                {/* Back Side: Technical Rider */}
                <div className="absolute inset-0 flex rotate-y-180 flex-col justify-between rounded-xl border-2 border-zinc-700 bg-zinc-900 p-5 text-left font-mono text-xs text-zinc-300 shadow-xl backface-hidden">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1 text-[10px] font-black text-amber-500 uppercase">
                      <span>TECHNICAL RIDER</span>
                      <span>PAGE 1</span>
                    </div>

                    <div>
                      <span className="block text-zinc-500">
                        PROJECT NAME :
                      </span>
                      <span className="font-bold text-zinc-100 uppercase">
                        {project.title}
                      </span>
                    </div>

                    <div>
                      <span className="block text-zinc-500">
                        SYSTEM SCOPE :
                      </span>
                      <span className="line-clamp-3 font-sans leading-relaxed text-zinc-200">
                        {project.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                    <span className="text-[9px] text-zinc-500">
                      STAGE READY: YES
                    </span>
                    <a
                      href={project.url}
                      target="_blank"
                      className="flex items-center gap-1.5 font-bold text-amber-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      LIVE DEMO <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
