'use client'

import { useState, useRef } from 'react'
import { m, AnimatePresence, useInView, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { Disc, X, Play, Music, Mic2, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

import { PROJECTS_SHOWCASE, type ProjectShowcaseItem } from '../constants'

export function ProjectsSection() {
  const [selectedProject, setSelectedProject] =
    useState<ProjectShowcaseItem | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const shouldReduceMotion = useReducedMotion()

  return (
    <>
      <section
        id="projects"
        className="relative overflow-hidden py-20 md:py-24 2xl:overflow-visible"
        ref={ref}
      >
        {/* Static groove field: the records own the circular motion, not the page background. */}
        <div className="pointer-events-none absolute inset-0 bg-[repeating-radial-gradient(circle_at_50%_30%,transparent_0,transparent_74px,rgba(201,164,71,0.05)_75px,transparent_76px)] opacity-45 dark:bg-[repeating-radial-gradient(circle_at_50%_30%,transparent_0,transparent_74px,rgba(224,183,90,0.08)_75px,transparent_76px)] dark:opacity-70" />
        <div className="relative z-10 container mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="instrument-module w-full max-w-none p-4 sm:p-6 md:p-8">
            <div className="mb-16 flex flex-col items-center text-center">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                className="instrument-control mb-4 flex items-center gap-2 rounded-sm px-4 py-1.5 font-mono text-[10px] font-bold tracking-[0.16em] text-[var(--ko-accent)] uppercase"
              >
                <Disc className="h-4 w-4" />
                <span>TRACKS · SAMPLE BANK</span>
              </m.div>
              <m.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold tracking-tighter sm:text-5xl"
              >
                Featured Releases
              </m.h2>
            </div>

            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECTS_SHOWCASE.map((project, index) => (
                <m.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50, scale: 0.96 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative flex flex-col items-center"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="perspective-1000 relative w-full max-w-[300px] cursor-pointer">
                    {/* A controlled reflection separates the black platter from the dark page surface. */}
                    <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-[radial-gradient(circle_at_72%_38%,rgba(201,164,71,0.17),transparent_42%)] opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_72%_38%,rgba(224,183,90,0.2),transparent_42%)]" />

                    {/* Vinyl Record / DJ platter sliding out */}
                    <div className="absolute top-1 right-1 bottom-1 left-1 flex items-center justify-center rounded-full border border-[#747b76]/55 bg-[#202522] shadow-[0_0_0_5px_rgba(20,24,23,0.13),0_14px_26px_rgba(15,18,17,0.3),inset_0_0_20px_rgba(255,255,255,0.08)] transition-all duration-700 ease-out group-hover:translate-x-[50%] group-hover:rotate-360 group-active:translate-x-[50%] group-active:rotate-360 dark:border-[#a3aea6]/55 dark:bg-[#111514] dark:shadow-[0_0_0_5px_rgba(224,183,90,0.08),0_18px_34px_rgba(0,0,0,0.65),inset_0_0_24px_rgba(255,255,255,0.1)]">
                      <div className="absolute inset-0 rounded-full bg-[conic-gradient(transparent_0deg,rgba(201,164,71,0.34)_28deg,transparent_58deg)] dark:bg-[conic-gradient(transparent_0deg,rgba(224,183,90,0.48)_28deg,transparent_58deg)]" />
                      <div className="absolute inset-[2px] rounded-full border border-white/20 dark:border-[#dce4da]/25" />
                      {/* Grooves */}
                      <div className="absolute inset-[15%] rounded-full border border-[#667069]/35 dark:border-[#b4c0b6]/25" />
                      <div className="absolute inset-[25%] rounded-full border border-[#667069]/35 dark:border-[#b4c0b6]/25" />
                      <div className="absolute inset-[35%] rounded-full border border-[#667069]/35 dark:border-[#b4c0b6]/25" />

                      {/* Center Label */}
                      <div
                        className={cn(
                          'flex h-1/3 w-1/3 items-center justify-center rounded-full bg-linear-to-br text-white shadow-inner',
                          project.vinylColor,
                        )}
                      >
                        {/* <project.vinylIcon className="w-5 h-5" /> */}
                      </div>
                      {/* Center Hole */}
                      <div className="absolute h-1.5 w-1.5 rounded-full bg-black" />
                    </div>

                    {/* Album Cover (Card) */}
                    <div className="relative z-10 flex aspect-square flex-col overflow-hidden rounded-sm border border-[var(--ko-screw)]/40 bg-[var(--ko-chassis-panel)]/95 shadow-[0_18px_35px_rgba(25,30,28,0.22)] backdrop-blur-sm transition-transform duration-300 group-hover:-translate-x-2 group-active:-translate-x-2 dark:bg-[var(--ko-chassis-mid)]/95 dark:shadow-[0_20px_42px_rgba(0,0,0,0.58)]">
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/2 bg-linear-to-b from-white/25 to-transparent opacity-70 mix-blend-screen"
                      />
                      {/* Image Area */}
                      <div className="relative h-[75%] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-105 group-active:scale-105"
                        />

                        {/* Glare effect */}
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-50" />
                      </div>

                      {/* Info Area (Footer) */}
                      <div className="relative flex h-[25%] flex-col justify-center border-t border-[var(--ko-screw)]/30 bg-[var(--ko-chassis-panel)] px-5 py-3 dark:bg-[var(--ko-display-bg)]">
                        <h3 className="truncate text-lg font-bold text-[var(--ko-display-bg)] dark:text-[var(--ko-chassis-panel)]">
                          {project.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          <span className="truncate">{project.genre}</span>
                          <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                          <span>{project.year}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Detail Modal (Liner Notes) */}
        <AnimatePresence>
          {selectedProject && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.1 }
                  : { duration: 0.18, ease: [0.23, 1, 0.32, 1] }
              }
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm motion-reduce:backdrop-blur-none"
              onClick={() => setSelectedProject(null)}
            >
              <m.div
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8, scale: 0.97, filter: 'blur(3px)' }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
                }
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 4, scale: 0.985, filter: 'blur(2px)' }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0.16, ease: [0.23, 1, 0.32, 1] }
                    : { type: 'spring', duration: 0.34, bounce: 0.08 }
                }
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`project-dialog-title-${selectedProject.id}`}
                className="relative max-h-[90vh] w-[95vw] max-w-4xl origin-center overflow-hidden rounded-3xl bg-white shadow-2xl will-change-[transform,opacity,filter] dark:bg-zinc-900"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project modal"
                  className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-zinc-900 backdrop-blur-md transition-colors hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="grid h-full grid-cols-1 md:grid-cols-2">
                  {/* Left: Image Area */}
                  <div className="relative h-48 bg-zinc-100 md:h-full lg:h-full dark:bg-zinc-800">
                    <Image
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

                    {/* Floating Music Note */}
                    <div className="absolute bottom-6 left-6">
                      <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg">
                        <Music className="h-6 w-6 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Right: Content Area */}
                  <div className="flex flex-col overflow-hidden p-6 md:p-8">
                    <div className="mb-4 md:mb-6">
                      <div className="text-primary mb-2 flex items-center gap-2 text-sm font-medium">
                        <Mic2 className="h-4 w-4" />
                        <span>FEATURED TRACK</span>
                      </div>
                      <h3
                        id={`project-dialog-title-${selectedProject.id}`}
                        className="text-2xl leading-tight font-bold text-zinc-900 md:text-3xl dark:text-zinc-100"
                      >
                        {selectedProject.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                        <span>{selectedProject.genre}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        <span>{selectedProject.year}</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                      <p className="line-clamp-4 text-base leading-relaxed text-zinc-600 md:line-clamp-none md:text-lg dark:text-zinc-300">
                        {selectedProject.description}
                      </p>

                      <div className="mt-8 space-y-4">
                        <h4 className="text-sm font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                          Production Credits
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {['React', 'Next.js', 'Tailwind', 'TypeScript'].map(
                            (tech) => (
                              <span
                                key={tech}
                                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                {tech}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                      <a
                        href={selectedProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                      >
                        <Play className="h-5 w-5 fill-current" />
                        <span>Listen to Track (Visit Site)</span>
                        <ArrowUpRight className="ml-auto h-5 w-5 opacity-50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
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
