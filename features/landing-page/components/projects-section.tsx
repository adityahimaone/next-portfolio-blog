'use client'

import { useState, useRef } from 'react'
import { m, AnimatePresence, useInView } from 'motion/react'
import Image from 'next/image'
import {
  X,
  Play,
  ArrowUpRight,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { PROJECTS_SHOWCASE, type ProjectShowcaseItem } from '../constants'

export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<ProjectShowcaseItem | null>(
    null,
  )
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <>
      <section
        id="projects"
        className="overflow-hidden py-24 bg-[#f5f5f3] dark:bg-[#121212]"
        ref={ref}
      >
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="mb-16 flex flex-col items-center text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              className="mb-4 flex items-center gap-2 rounded bg-[#e8e8e4] border border-[#d4d4d0] px-3 py-1 font-mono text-[9px] font-bold text-zinc-600 uppercase tracking-widest dark:bg-[#1a1a1a] dark:border-[#27272a] dark:text-zinc-400"
            >
              <Settings className="h-3 w-3" />
              <span>projects showcase</span>
            </m.div>
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-sans text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white"
            >
              Featured Works
            </m.h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {PROJECTS_SHOWCASE.map((project, index) => (
              <m.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.08 }}
                className="group relative flex flex-col items-center cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                {/* Braun System Enclosure Card */}
                <div className="relative z-10 w-full overflow-hidden rounded border border-[#d4d4d0] bg-[#f4f4f0] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-zinc-400 dark:border-[#27272a] dark:bg-[#161616] dark:hover:border-zinc-700">
                  
                  {/* Image Area */}
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-102"
                    />
                    
                    {/* Orange Tuning Line overlay (very subtle) */}
                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#f05523] transition-all duration-350 group-hover:w-full" />
                  </div>

                  {/* Info Area (Footer Panel) */}
                  <div className="relative flex flex-col justify-center border-t border-[#e4e4e0] bg-[#f8f8f6] px-5 py-4 dark:border-[#202020] dark:bg-[#1b1b1b]">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate font-sans text-base font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                        {project.title}
                      </h3>
                      <div className="h-1.5 w-1.5 rounded-full bg-[#f05523] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 font-mono text-[9px] text-zinc-500 uppercase tracking-tight">
                      <span className="truncate">{project.genre}</span>
                      <span className="h-1 w-1 shrink-0 rounded-full bg-[#d4d4d0] dark:bg-zinc-700" />
                      <span>{project.year}</span>
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>

        {/* Project Detail Modal (Liner Notes / System Specs) */}
        <AnimatePresence>
          {selectedProject && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
              onClick={() => setSelectedProject(null)}
            >
              <m.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[90vh] w-[95vw] max-w-4xl overflow-hidden rounded border border-[#d4d4d0] bg-[#f4f4f0] shadow-2xl dark:border-[#27272a] dark:bg-[#121212]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project modal"
                  className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded border border-[#d4d4d0] bg-white text-zinc-600 hover:bg-[#f4f4f0] active:scale-95 dark:border-[#27272a] dark:bg-[#1a1a1a] dark:text-zinc-400"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="grid h-full grid-cols-1 md:grid-cols-2">
                  {/* Left: Image Panel */}
                  <div className="relative h-48 bg-zinc-100 md:h-full dark:bg-zinc-800">
                    <Image
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                    
                    {/* Model Index Indicator */}
                    <div className="absolute bottom-6 left-6">
                      <div className="bg-[#f05523] border border-[#c03d15] flex h-8 px-3 items-center rounded text-white font-mono text-[10px] font-bold uppercase shadow">
                        <span>track-0{selectedProject.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Spec Sheet Content */}
                  <div className="flex flex-col p-6 md:p-8 overflow-hidden bg-white dark:bg-[#161616]">
                    <div className="mb-4 md:mb-6 border-b border-[#e4e4e0] pb-4 dark:border-[#202020]">
                      <div className="text-[#f05523] mb-1 font-mono text-[9px] font-bold uppercase tracking-wider">
                        system specification
                      </div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-white">
                        {selectedProject.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 font-mono text-[10px] text-zinc-500 uppercase tracking-tight">
                        <span>{selectedProject.genre}</span>
                        <span className="h-1 w-1 rounded-full bg-[#d4d4d0] dark:bg-zinc-700" />
                        <span>{selectedProject.year}</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {selectedProject.description}
                      </p>

                      <div className="mt-8 space-y-4">
                        <h4 className="font-mono text-[10px] font-bold tracking-widest text-zinc-700 uppercase dark:text-zinc-400">
                          technologies deployed
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {['React', 'Next.js', 'Tailwind CSS', 'TypeScript'].map(
                            (tech) => (
                              <span
                                key={tech}
                                className="rounded border border-[#d4d4d0] bg-[#f8f8f6] px-3 py-1 font-mono text-[9px] text-zinc-600 dark:border-[#27272a] dark:bg-[#1d1d1d] dark:text-zinc-400"
                              >
                                {tech.toLowerCase()}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Launch Button */}
                    <div className="mt-8 border-t border-[#e4e4e0] pt-6 dark:border-[#202020]">
                      <a
                        href={selectedProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex w-full items-center justify-center gap-2 rounded border border-[#c03d15] bg-[#f05523] px-6 py-3 font-mono text-xs font-bold text-white transition-all hover:bg-[#e04513] active:scale-98 shadow-sm"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span>launch system (visit site)</span>
                        <ArrowUpRight className="ml-auto h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </section>
    </>
  )
}
