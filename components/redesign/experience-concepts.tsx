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
    <div className="flex w-full flex-col items-center bg-zinc-950 px-4 py-16 text-zinc-100">
      <div className="flex w-full max-w-xl flex-col gap-6 border-4 border-double border-orange-500/80 bg-zinc-900 p-8 text-center font-serif shadow-2xl">
        <div className="font-mono text-[10px] font-black tracking-[0.3em] text-orange-500 uppercase">
          ADITYA HIMAWAN // WORLD TOUR
        </div>
        <h2 className="mt-2 text-4xl font-black tracking-widest text-zinc-100 uppercase">
          LIVE ON STAGE
        </h2>

        <div className="my-2 h-px w-full bg-orange-500/40" />

        <div className="mt-4 space-y-8">
          {JOBS.map((job, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold tracking-wider text-orange-400 uppercase">
                {job.company}
              </span>
              <span className="font-sans text-sm tracking-wide text-zinc-300">
                {job.role} — {job.location}
              </span>
              <span className="font-mono text-xs tracking-widest text-zinc-500">
                TOUR DATES: {job.period}
              </span>
              <p className="mt-2 max-w-sm font-sans text-xs text-zinc-400 italic">
                &ldquo;{job.desc}&rdquo;
              </p>
              {idx < JOBS.length - 1 && (
                <div className="my-4 font-sans text-orange-500/20">★ ★ ★</div>
              )}
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
    <div className="flex w-full flex-col items-center px-4 py-16">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h3 className="text-center font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
          REEL-TO-REEL SESSION ARCHIVES
        </h3>

        <div className="flex flex-col gap-6">
          {JOBS.map((job, idx) => (
            <div
              key={idx}
              className="relative flex w-full flex-col justify-between gap-4 overflow-hidden rounded-md border-2 border-zinc-700 bg-zinc-800 p-4 font-mono text-xs text-zinc-300 shadow-lg md:flex-row"
            >
              {/* Tape reel line representation */}
              <div className="absolute top-0 bottom-0 left-0 w-2 bg-amber-500" />

              <div className="flex-1 space-y-1 pl-4">
                <div>
                  <span className="font-bold text-zinc-500">
                    SESSION CLIENT :
                  </span>{' '}
                  <span className="text-zinc-150 font-black">
                    {job.company}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-zinc-500">
                    ENGINEER TITLE :
                  </span>{' '}
                  <span className="text-zinc-150">{job.role}</span>
                </div>
                <div>
                  <span className="font-bold text-zinc-500">
                    RECORD DURATION:
                  </span>{' '}
                  <span className="text-zinc-150">{job.period}</span>
                </div>
              </div>

              <div className="flex flex-1 items-center md:border-l md:border-zinc-700 md:pl-6">
                <p className="font-sans leading-relaxed text-zinc-400 italic">
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
    <div className="w-full px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-zinc-50 p-8 font-sans shadow-xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        <div className="dark:border-zinc-850 mb-6 border-b border-zinc-200 pb-4">
          <span className="block font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            ALBUM LINER NOTES / PRODUCTION CREDITS
          </span>
          <h3 className="mt-1 text-2xl font-black text-zinc-900 dark:text-white">
            THE CAREER RECORDINGS
          </h3>
        </div>

        <div className="space-y-8">
          {JOBS.map((job, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Track {idx + 1}: &ldquo;{job.company}&rdquo; Mix
                </h4>
                <span className="font-mono text-xs text-zinc-500">
                  {job.period}
                </span>
              </div>

              <div className="font-mono text-xs tracking-widest text-indigo-500 uppercase dark:text-indigo-400">
                PRODUCED BY ADITYA HIMAWAN // ROLE: {job.role}
              </div>

              <p className="text-zinc-650 text-sm leading-relaxed dark:text-zinc-400">
                {job.desc} Written, designed, and executed using Next.js and
                React architecture at the Jakarta labs. All rights reserved.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
