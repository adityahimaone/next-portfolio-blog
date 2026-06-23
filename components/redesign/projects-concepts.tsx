'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Disc, Play, ExternalLink, RefreshCw, Eye, BookOpen, Layers } from 'lucide-react'
import { PROJECTS_SHOWCASE } from '@/features/landing-page/constants'
import Image from 'next/image'

// ----------------------------------------------------
// 1. RecordStoreCrateProjects (LP Record Crate)
// ----------------------------------------------------
export function RecordStoreCrateProjects() {
  const [filterGenre, setFilterGenre] = useState<string | null>(null)

  const filtered = filterGenre
    ? PROJECTS_SHOWCASE.filter((p) => p.genre?.toLowerCase().includes(filterGenre.toLowerCase()))
    : PROJECTS_SHOWCASE

  const genres = ['Corporate', 'AI', 'Compliance', 'Networking', 'Utility', 'DeFi']

  return (
    <div className="w-full py-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h3 className="font-mono text-xs font-bold text-zinc-400 tracking-widest text-center mb-6 uppercase">
          RECORD CRATE BROWSING
        </h3>

        {/* Tab Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 font-mono text-xs">
          <button
            onClick={() => setFilterGenre(null)}
            className={`px-3 py-1 rounded cursor-pointer ${!filterGenre ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'}`}
          >
            ALL GENRES
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setFilterGenre(g)}
              className={`px-3 py-1 rounded cursor-pointer ${filterGenre === g ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {g.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Record Crate horizontal container */}
        <div className="bg-zinc-900 border-4 border-zinc-850 rounded-2xl p-6 shadow-2xl overflow-x-auto flex gap-6 py-10 scrollbar-thin">
          {filtered.map((project, idx) => (
            <motion.div
              key={project.id}
              whileHover={{ y: -15, rotate: -2 }}
              className="min-w-[220px] w-[220px] bg-zinc-950 rounded-xl border border-zinc-800 p-4 shadow-lg flex flex-col gap-3 shrink-0 cursor-pointer text-left"
            >
              {/* Record Sleeve Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded bg-zinc-850 shadow-inner">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="200px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-700 font-mono text-[10px]">
                    NO ART
                  </div>
                )}
                {/* Vinyl overlay details */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none" />
              </div>

              {/* Title info */}
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-sm text-zinc-100 truncate">{project.title}</h4>
                <div className="flex justify-between font-mono text-[9px] text-zinc-500 font-bold">
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
  const [activePlay, setActivePlay] = useState<number | null>(null)

  return (
    <div className="w-full py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <h3 className="font-mono text-xs font-bold text-zinc-400 tracking-widest text-center mb-10 uppercase">
          FEATURED MUSIC VIDEOS (PROJECT DEMOS)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROJECTS_SHOWCASE.slice(0, 4).map((project) => (
            <div
              key={project.id}
              className="group bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-xl flex flex-col"
            >
              {/* Widescreen 16:9 Thumbnail wrapper */}
              <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-950 text-zinc-700">
                    DEMO SCREEN
                  </div>
                )}

                {/* Video Play Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a
                    href={project.url}
                    target="_blank"
                    className="h-14 w-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                  >
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </a>
                </div>
              </div>

              {/* Info text details */}
              <div className="p-5 space-y-2 text-left">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-sans font-extrabold text-lg text-zinc-100">{project.title}</h4>
                  <span className="font-mono text-[10px] text-zinc-500">{project.year}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-2">
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
    <div className="w-full py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <h3 className="font-mono text-xs font-bold text-zinc-400 tracking-widest text-center mb-10 uppercase">
          TECHNICAL RIDER SPEC SHEET
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS_SHOWCASE.map((project) => (
            <div
              key={project.id}
              className="perspective-1000 h-[300px] w-full cursor-pointer"
              onClick={() => setFlippedCard(flippedCard === project.id ? null : project.id)}
            >
              <div
                className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${flippedCard === project.id ? 'rotate-y-180' : ''}`}
              >
                {/* Front Side: Album Cover */}
                <div className="absolute inset-0 backface-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-4 shadow-xl">
                  <div className="relative flex-1 rounded bg-zinc-900 overflow-hidden">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover object-top"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-zinc-100 truncate">{project.title}</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{project.genre}</span>
                  </div>
                </div>

                {/* Back Side: Technical Rider */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 border-zinc-700 bg-zinc-900 p-5 flex flex-col justify-between text-left font-mono text-xs text-zinc-300 shadow-xl">
                  <div className="space-y-3">
                    <div className="border-b border-zinc-800 pb-1 flex justify-between items-center text-[10px] font-black text-amber-500 uppercase">
                      <span>TECHNICAL RIDER</span>
                      <span>PAGE 1</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block">PROJECT NAME :</span>
                      <span className="text-zinc-100 font-bold uppercase">{project.title}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block">SYSTEM SCOPE :</span>
                      <span className="text-zinc-200 line-clamp-3 leading-relaxed font-sans">
                        {project.description}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500">STAGE READY: YES</span>
                    <a
                      href={project.url}
                      target="_blank"
                      className="text-amber-500 hover:underline flex items-center gap-1.5 font-bold"
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
