'use client'

import { useState, useRef } from 'react'
import { m, AnimatePresence, useInView } from 'motion/react'
import Image from 'next/image'
import {
  X, Play, ArrowUpRight, ExternalLink, Github, Film, SkipBack, SkipForward, Volume2,
} from 'lucide-react'

import { PROJECTS_SHOWCASE, type ProjectShowcaseItem } from '../constants'

// ─── Tape Reel (simplified, subtle) ─────────────────────────────
function TapeReel({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className}`}>
      <div className="absolute rounded-full" style={{ width: '60%', height: '60%', border: '1.5px solid var(--color-ochre)', opacity: 0.15 }} />
      <div className="absolute rounded-full" style={{ width: '14%', height: '14%', backgroundColor: 'var(--color-ochre)', opacity: 0.3 }} />
    </div>
  )
}

// ─── Tape Box Card ───────────────────────────────────────────────────
function TapeBoxCard({ project, index, onOpen }: {
  project: ProjectShowcaseItem; index: number; onOpen: (p: ProjectShowcaseItem) => void
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <m.div
      ref={ref}
      role="button" tabIndex={0}
      aria-label={`View project: ${project.title}`}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(project) } }}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group cursor-pointer overflow-hidden rounded-lg"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)' }}
      whileHover={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex transition-transform duration-[var(--duration-slow)] ease-[var(--ease-smooth)] group-hover:translate-x-2">
        {/* Ochre spine label */}
        <div className="relative flex w-9 shrink-0 flex-col items-center justify-center py-3" style={{ backgroundColor: 'var(--color-ochre)' }}>
          <span className="text-[10px] font-bold leading-none tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-charcoal)', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            {project.title}
          </span>
          <div className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-charcoal)', opacity: 0.4 }} />
        </div>
        {/* Card body */}
        <div className="flex flex-1 flex-col">
          <div className="relative aspect-[16/10] w-full overflow-hidden" style={{ backgroundColor: 'var(--color-charcoal)' }}>
            <Image src={project.image} alt={project.title} fill
              sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-top transition-transform duration-[var(--duration-slower)] group-hover:scale-105"
            />
            <TapeReel />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
              style={{ background: 'linear-gradient(to top, var(--color-surface) 0%, transparent 100%)' }}
            />
            {/* Action buttons - always visible */}
            <div className="absolute right-2 top-2 flex gap-1.5">
              {[{
                icon: ExternalLink, label: `View details for ${project.title}`, onClick: (e: React.MouseEvent) => { e.stopPropagation(); onOpen(project) }
              }, project.url ? {
                icon: Github, label: `Visit ${project.title} website`, href: project.url
              } : null].filter(Boolean).map((btn: any, i) => (
                btn.href ? (
                  <a key={i} href={btn.href} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} aria-label={btn.label}
                    className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:scale-110"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-ochre)', border: '1px solid var(--color-border-subtle)' }}
                  ><btn.icon className="h-3.5 w-3.5" /></a>
                ) : (
                  <button key={i} onClick={btn.onClick} aria-label={btn.label}
                    className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:scale-110"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-ochre)', border: '1px solid var(--color-border-subtle)' }}
                  ><btn.icon className="h-3.5 w-3.5" /></button>
                )
              ))}
            </div>
          </div>
          {/* Info footer */}
          <div className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-highlight)' }}>{project.title}</h3>
              {project.genre && <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ochre)' }}>{project.genre}</span>}
            </div>
            <p className="line-clamp-2 text-sm leading-snug" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-slate)' }}>{project.description}</p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {project.tech?.slice(0, 3).map((t) => (
                <span key={t} className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ fontFamily: 'var(--font-mono)', backgroundColor: 'color-mix(in srgb, var(--color-ochre) 12%, transparent)', color: 'var(--color-ochre)' }}>{t}</span>
              ))}
              {project.tech && project.tech.length > 3 && (
                <span className="text-[10px] font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate)' }}>+{project.tech.length - 3}</span>
              )}
              {project.year && <span className="ml-auto text-[10px] font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate)' }}>{project.year}</span>}
            </div>
          </div>
        </div>
      </div>
    </m.div>
  )
}

// ─── Main Section ────────────────────────────────────────────────────
export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<ProjectShowcaseItem | null>(null)
  const [expanded, setExpanded] = useState(false)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const open = (p: ProjectShowcaseItem) => { setExpanded(false); setSelectedProject(p) }

  return (
    <section id="projects" ref={sectionRef} className="relative overflow-hidden py-24" style={{ backgroundColor: 'var(--color-charcoal)' }}>
      {/* Noise texture */}
      <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.035,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px' }}
      />
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Header - Refined */}
        <div className="mb-16 flex flex-col items-center text-center">
          <m.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-ochre)', fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border-subtle)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-ochre)' }} />
            <span>PROJECTS</span>
          </m.div>
          <m.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-highlight)' }}
          >
            Featured Work
          </m.h2>
          <m.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }}
            className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--color-slate)', fontFamily: 'var(--font-body)' }}
          >
            A collection of projects that showcase technical skills and creative problem-solving.
          </m.p>
        </div>

        {/* Mobile: horizontal snap-scroll */}
        <div className="md:hidden">
          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            <style>{`.flex.snap-x::-webkit-scrollbar { display: none; }`}</style>
            {PROJECTS_SHOWCASE.map((project, index) => (
              <div key={project.id} className="w-[85vw] shrink-0 snap-center">
                <TapeBoxCard project={project} index={index} onOpen={open} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop/Tablet: responsive grid */}
        <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS_SHOWCASE.map((project, index) => (
            <TapeBoxCard key={project.id} project={project} index={index} onOpen={open} />
          ))}
        </div>
      </div>

      {/* ── Modal: Tape Playback Window ── */}
      <AnimatePresence>
        {selectedProject && (
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-charcoal) 80%, transparent)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedProject(null)}
          >
            <m.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-[95vw] max-w-4xl overflow-hidden rounded-2xl shadow-2xl"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
            >
              <button onClick={() => setSelectedProject(null)} aria-label="Close project modal"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-charcoal) 60%, transparent)', color: 'var(--color-highlight)', backdropFilter: 'blur(8px)', border: '1px solid var(--color-border-subtle)' }}
              ><X className="h-5 w-5" /></button>

              <div className="grid h-full grid-cols-1 md:grid-cols-2">
                {/* Left: Image + Tape Reel */}
                <div className="relative h-56 md:h-full" style={{ backgroundColor: 'var(--color-charcoal)' }}>
                  <Image src={selectedProject.image} alt={selectedProject.title} fill
                    sizes="(max-width: 768px) 100vw, 50vw" className="object-cover"
                  />
                  <TapeReel className="opacity-50" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-surface) 0%, transparent 50%)' }} />
                  <div className="absolute bottom-5 left-5 flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
                    style={{ backgroundColor: 'var(--color-ochre)', color: 'var(--color-charcoal)' }}
                  ><Play className="ml-0.5 h-6 w-6 fill-current" /></div>
                </div>

                {/* Right: Content */}
                <div className="flex flex-col overflow-y-auto p-6 md:p-8">
                  <div className="mb-4 md:mb-6">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ochre)' }}
                    ><Film className="h-4 w-4" /><span>Master Tape</span></div>
                    <h3 className="text-2xl font-bold leading-tight md:text-3xl"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--color-highlight)' }}
                    >{selectedProject.title}</h3>
                    <div className="mt-2 flex items-center gap-3 text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate)' }}>
                      {selectedProject.genre && <span>{selectedProject.genre}</span>}
                      {selectedProject.genre && selectedProject.year && (
                        <span className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--color-border-strong)' }} />
                      )}
                      {selectedProject.year && <span>{selectedProject.year}</span>}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className={expanded ? '' : 'line-clamp-4 md:line-clamp-none'}>
                      <p className="text-base leading-relaxed md:text-lg" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-slate)' }}>
                        {selectedProject.description}
                      </p>
                    </div>
                    <button onClick={() => setExpanded(!expanded)}
                      className="mt-2 text-xs font-semibold md:hidden" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ochre)' }}
                    >{expanded ? 'Show less ↑' : 'Read more ↓'}</button>

                    {/* Tech stack */}
                    <div className="mt-6 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-highlight)' }}
                      >Production Credits</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tech?.map((tech) => (
                          <span key={tech} className="rounded-md px-2.5 py-1 text-xs font-medium"
                            style={{ fontFamily: 'var(--font-mono)', backgroundColor: 'color-mix(in srgb, var(--color-ochre) 10%, transparent)', color: 'var(--color-ochre)', border: '1px solid var(--color-border-subtle)' }}
                          >{tech}</span>
                        )) ?? <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate)' }}>No tech stack specified</span>}
                      </div>
                      {selectedProject.repoUrl && (
                        <a href={selectedProject.repoUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate)' }}
                        ><Github className="h-3.5 w-3.5" /> View source code on GitHub</a>
                      )}
                    </div>
                  </div>

                  {/* Transport controls */}
                  <div className="mt-6 flex items-center gap-3 border-t pt-5" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <div className="flex items-center gap-1">
                      {[SkipBack, Play, SkipForward].map((Icon, i) => (
                        <div key={i} className={`flex h-8 w-8 items-center justify-center rounded text-xs ${i === 1 ? '' : 'cursor-default'}`}
                          style={i === 1
                            ? { backgroundColor: 'var(--color-ochre)', color: 'var(--color-charcoal)' }
                            : { backgroundColor: 'color-mix(in srgb, var(--color-charcoal) 40%, transparent)', color: 'var(--color-slate)' }}
                        ><Icon className={i === 1 ? 'ml-0.5 h-4 w-4 fill-current' : 'h-3.5 w-3.5'} /></div>
                      ))}
                    </div>
                    <div className="flex h-8 flex-1 items-center gap-1.5 rounded px-2"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-charcoal) 40%, transparent)' }}
                    >
                      <Volume2 className="h-3 w-3 shrink-0" style={{ color: 'var(--color-slate)' }} />
                      <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: 'var(--color-border-subtle)' }}>
                        <div className="h-full w-3/5 rounded-full" style={{ backgroundColor: 'var(--color-ochre)' }} />
                      </div>
                    </div>
                    <a href={selectedProject.url} target="_blank" rel="noopener noreferrer"
                      className="group flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all active:scale-95"
                      style={{ backgroundColor: 'var(--color-ochre)', color: 'var(--color-charcoal)', fontFamily: 'var(--font-mono)' }}
                    >
                      <span>Visit Site</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  )
}
