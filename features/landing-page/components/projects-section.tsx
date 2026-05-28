'use client'

import { useState, useRef } from 'react'
import { m, AnimatePresence, useInView } from 'motion/react'
import Image from 'next/image'
import {
  X,
  ArrowUpRight,
  Folder,
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
        className="overflow-hidden py-24 2xl:overflow-visible"
        ref={ref}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-16 flex flex-col items-center text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              className="mb-4 flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <Folder className="h-4 w-4" />
              <span>PROJECTS</span>
            </m.div>
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold tracking-tighter sm:text-5xl"
            >
              Featured Projects
            </m.h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS_SHOWCASE.map((project, index) => (
              <m.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <button
                  onClick={() => setSelectedProject(project)}
                  className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 active:translate-y-0 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={cn(
                          'inline-block rounded-full px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md',
                          'bg-gradient-to-r shadow-sm',
                          project.vinylColor,
                        )}
                      >
                        {project.genre}
                      </span>
                    </div>
                    {/* Year */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-block rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                        {project.year}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {project.title}
                      </h3>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {project.description}
                    </p>
                    {project.tech && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </m.div>
            ))}
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedProject && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            >
              <m.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[90vh] w-[95vw] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
              >
                {/* Close */}
                <button
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project modal"
                  className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-zinc-900 backdrop-blur-md transition-colors hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="grid h-full grid-cols-1 md:grid-cols-2">
                  {/* Left: Image */}
                  <div className="relative h-48 bg-zinc-100 md:h-full dark:bg-zinc-800">
                    <Image
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                  </div>

                  {/* Right: Content */}
                  <div className="flex flex-col overflow-hidden p-6 md:p-8">
                    <div className="mb-4 md:mb-6">
                      <div className="text-primary mb-2 text-sm font-medium">
                        {selectedProject.genre}
                      </div>
                      <h3 className="text-2xl leading-tight font-bold text-zinc-900 md:text-3xl dark:text-zinc-100">
                        {selectedProject.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                        <span>{selectedProject.year}</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                      <p className="text-base leading-relaxed text-zinc-600 md:text-lg md:line-clamp-none line-clamp-4 dark:text-zinc-300">
                        {selectedProject.description}
                      </p>

                      {/* Tech */}
                      {selectedProject.tech && (
                        <div className="mt-6 space-y-3">
                          <h4 className="text-sm font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                            Tech Stack
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.tech.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                      <a
                        href={selectedProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                      >
                        <span>View Project</span>
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
