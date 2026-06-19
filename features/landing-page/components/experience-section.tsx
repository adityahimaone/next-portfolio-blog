'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import {
  Briefcase,
  Calendar,
  MapPin,
  ListMusic,
  Radio,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EXPERIENCES } from '../constants'

export function ExperienceSection() {
  const [selectedId, setSelectedId] = useState(EXPERIENCES[0].id)
  const selectedJob =
    EXPERIENCES.find((e) => e.id === selectedId) || EXPERIENCES[0]

  return (
    <>
      <section id="experience" className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="mb-12 flex flex-col items-center text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-2 rounded bg-[#e8e8e4] border border-[#d4d4d0] px-3 py-1 font-mono text-[9px] font-bold text-zinc-600 uppercase tracking-widest dark:bg-[#1a1a1a] dark:border-[#27272a] dark:text-zinc-400"
            >
              <Radio className="h-3 w-3" />
              <span>career discography</span>
            </m.div>
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-sans text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white"
            >
              The Collection
            </m.h2>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Selector Keys */}
            <div className="lg:col-span-5">
              <div className="flex flex-col gap-2 rounded border border-[#d4d4d0] bg-[#f4f4f0] p-3 dark:border-[#27272a] dark:bg-[#121212]">
                <div className="mb-2 px-2 py-1 font-mono text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
                  select channel
                </div>
                {EXPERIENCES.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedId(exp.id)}
                    className={cn(
                      'group relative flex w-full items-center gap-4 rounded border p-3 text-left transition-all cursor-pointer',
                      selectedId === exp.id
                        ? 'bg-[#eaeae6] border-zinc-400 dark:bg-[#202020] dark:border-zinc-500'
                        : 'bg-[#f8f8f6] border-[#e4e4e0] hover:bg-[#eaeae6] dark:bg-[#161616] dark:border-[#202020] dark:hover:bg-[#202020]',
                    )}
                  >
                    {/* Active Indicator dot */}
                    {selectedId === exp.id && (
                      <div className="absolute top-1/2 left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#f05523]" />
                    )}

                    {/* Numeric Indicator */}
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded font-mono text-xs font-bold border transition-colors ml-2',
                        selectedId === exp.id
                          ? 'border-[#f05523]/50 bg-white text-[#f05523] dark:bg-[#1a1a1a]'
                          : 'border-[#d4d4d0] bg-[#f8f8f6] text-zinc-500 dark:border-[#27272a] dark:bg-[#161616]',
                      )}
                    >
                      0{exp.id}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <h3
                          className={cn(
                            'truncate text-xs font-bold uppercase transition-colors font-mono tracking-tight',
                            selectedId === exp.id
                              ? 'text-zinc-900 dark:text-zinc-100'
                              : 'text-zinc-600 dark:text-zinc-400',
                          )}
                        >
                          {exp.role}
                        </h3>
                      </div>
                      <p className="truncate text-[10px] font-mono text-zinc-500 uppercase">
                        {exp.company}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Braun Console Details */}
            <div className="lg:col-span-7">
              <div className="relative h-full min-h-[500px] overflow-hidden rounded border border-[#d4d4d0] bg-[#f4f4f0] shadow-lg dark:border-[#27272a] dark:bg-[#121212]">
                <div className="relative flex h-full flex-col p-6 sm:p-8">
                  {/* Header Area */}
                  <div className="mb-6 flex flex-col gap-4 border-b border-[#e4e4e0] pb-6 sm:flex-row sm:items-start sm:justify-between dark:border-[#202020]">
                    <div>
                      <AnimatePresence mode="wait">
                        <m.div
                          key={selectedJob.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="font-sans text-2xl font-extrabold text-zinc-900 dark:text-white">
                            {selectedJob.role}
                          </h3>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-zinc-600 dark:text-zinc-400">
                            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#f05523] uppercase">
                              <Briefcase className="h-3 w-3" />
                              {selectedJob.company}
                            </span>
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase">
                              <MapPin className="h-3 w-3" />
                              {selectedJob.location}
                            </span>
                          </div>
                        </m.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1">
                    <AnimatePresence mode="wait">
                      <m.div
                        key={selectedJob.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {/* Period Badge */}
                        <div className="inline-flex items-center gap-2 rounded border border-[#d4d4d0] bg-white px-3 py-1 font-mono text-[10px] text-zinc-600 dark:border-[#27272a] dark:bg-[#1a1a1a] dark:text-zinc-400">
                          <Calendar className="h-3.5 w-3.5 text-[#f05523]" />
                          <span>period: {selectedJob.period.toLowerCase()}</span>
                        </div>

                        {/* Description */}
                        <div className="text-zinc-800 dark:text-zinc-200">
                          {selectedJob.isGroup ? (
                            <div className="space-y-6">
                              {selectedJob.items?.map((item, i) => (
                                <div
                                  key={i}
                                  className="relative flex w-full items-start gap-3"
                                >
                                  <div className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white border border-[#d4d4d0] text-[#f05523] dark:bg-[#1a1a1a] dark:border-[#27272a]">
                                    <ChevronRight className="h-3 w-3" />
                                  </div>
                                  <div className="flex w-full flex-col">
                                    <h4 className="font-sans text-sm font-bold text-zinc-900 dark:text-white uppercase">
                                      {item.role}
                                    </h4>
                                    <div className="mb-2 flex w-full items-center justify-between font-mono text-[9px] text-zinc-500 uppercase">
                                      <span>{item.company}</span>
                                      <span>{item.period}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <ul className="space-y-4">
                              {selectedJob.description?.map((item, i) => (
                                <m.li
                                  key={i}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex items-start gap-3"
                                >
                                  <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white border border-[#d4d4d0] text-[#f05523] dark:bg-[#1a1a1a] dark:border-[#27272a]">
                                    <ChevronRight className="h-3 w-3" />
                                  </div>
                                  <span className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                                    {item}
                                  </span>
                                </m.li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </m.div>
                    </AnimatePresence>
                  </div>

                  {/* Player Controls / Stats line */}
                  <div className="mt-8 border-t border-[#e4e4e0] pt-6 dark:border-[#202020]">
                    <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
                        <span>deck calibration active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ListMusic className="h-3 w-3 text-[#f05523]" />
                        <span>
                          track: {selectedId} / {EXPERIENCES.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
