'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Disc, Calendar, MapPin, Tag } from 'lucide-react'

// Experience Data
const JOBS = [
  {
    company: 'Fast 8 People Hub',
    role: 'Frontend Developer',
    location: 'Jakarta, Indonesia',
    period: 'OCT 2022 - PRESENT',
    desc: 'Led Bisadaya job-seeking platform serving thousands of users. Built automated KPI dashboards.',
  },
  {
    company: '80&Company',
    role: 'Frontend Developer',
    location: 'Kyoto, Japan (Remote)',
    period: 'APR 2024 - SEP 2024',
    desc: 'Spearheaded Workforce Management System development. Maintained apps, resolving critical blockchain bugs.',
  },
  {
    company: 'Unzypsoft',
    role: 'Frontend Developer',
    location: 'Jakarta, Indonesia',
    period: 'JUN 2022 - AUG 2024',
    desc: 'Collaborated on BSN e-commerce and dynamic NFT protocol frontend using ReactJS & Tailwind.',
  },
]

// ----------------------------------------------------
// 1. TourPosterExperience (Vintage Concert Gig Poster)
// ----------------------------------------------------
export function TourPosterExperience() {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-xl border-4 border-double border-orange-500/80 bg-zinc-900 p-8 shadow-2xl flex flex-col gap-6 text-center font-serif">
        <div className="text-[10px] font-mono tracking-[0.3em] text-orange-500 uppercase font-black">
          ADITYA HIMAWAN // WORLD TOUR
        </div>
        <h2 className="text-4xl font-black tracking-widest text-zinc-100 uppercase mt-2">LIVE ON STAGE</h2>
        
        <div className="w-full h-px bg-orange-500/40 my-2" />

        <div className="space-y-8 mt-4">
          {JOBS.map((job, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold tracking-wider text-orange-400 uppercase">
                {job.company}
              </span>
              <span className="text-sm font-sans tracking-wide text-zinc-300">
                {job.role} — {job.location}
              </span>
              <span className="font-mono text-xs text-zinc-500 tracking-widest">
                TOUR DATES: {job.period}
              </span>
              <p className="mt-2 text-xs font-sans text-zinc-400 max-w-sm italic">
                &ldquo;{job.desc}&rdquo;
              </p>
              {idx < JOBS.length - 1 && <div className="text-orange-500/20 font-sans my-4">★ ★ ★</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 2. TapeLabelExperience (Reel-to-Reel Tape Archives)
// ----------------------------------------------------
export function TapeLabelExperience() {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <h3 className="font-mono text-xs font-bold text-zinc-400 tracking-widest text-center uppercase">REEL-TO-REEL SESSION ARCHIVES</h3>
        
        <div className="flex flex-col gap-6">
          {JOBS.map((job, idx) => (
            <div
              key={idx}
              className="w-full rounded-md border-2 border-zinc-700 bg-zinc-800 p-4 font-mono text-xs text-zinc-300 flex flex-col md:flex-row justify-between gap-4 shadow-lg relative overflow-hidden"
            >
              {/* Tape reel line representation */}
              <div className="absolute top-0 bottom-0 left-0 w-2 bg-amber-500" />
              
              <div className="space-y-1 pl-4 flex-1">
                <div><span className="text-zinc-500 font-bold">SESSION CLIENT :</span> <span className="text-zinc-150 font-black">{job.company}</span></div>
                <div><span className="text-zinc-500 font-bold">ENGINEER TITLE :</span> <span className="text-zinc-150">{job.role}</span></div>
                <div><span className="text-zinc-500 font-bold">RECORD DURATION:</span> <span className="text-zinc-150">{job.period}</span></div>
              </div>

              <div className="flex-1 md:border-l md:border-zinc-700 md:pl-6 flex items-center">
                <p className="font-sans text-zinc-400 leading-relaxed italic">
                  &ldquo;{job.desc}&rdquo;
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
// 3. AlbumLinerCreditsExperience (Credits Credits Page)
// ----------------------------------------------------
export function AlbumLinerCreditsExperience() {
  return (
    <div className="w-full py-16 px-4">
      <div className="mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-zinc-50 p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 font-sans">
        <div className="border-b border-zinc-200 dark:border-zinc-850 pb-4 mb-6">
          <span className="font-mono text-[10px] font-bold text-zinc-400 tracking-widest block uppercase">ALBUM LINER NOTES / PRODUCTION CREDITS</span>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">THE CAREER RECORDINGS</h3>
        </div>

        <div className="space-y-8">
          {JOBS.map((job, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-baseline flex-wrap gap-2">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Track {idx + 1}: &ldquo;{job.company}&rdquo; Mix
                </h4>
                <span className="font-mono text-xs text-zinc-500">
                  {job.period}
                </span>
              </div>
              
              <div className="text-xs font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                PRODUCED BY ADITYA HIMAWAN // ROLE: {job.role}
              </div>

              <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
                {job.desc} Written, designed, and executed using Next.js and React architecture at the Jakarta labs. All rights reserved.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
