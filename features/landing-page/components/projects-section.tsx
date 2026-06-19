'use client'

import { useState, useRef } from 'react'
import { m as motion, AnimatePresence, useInView } from 'motion/react'
import Image from 'next/image'
import {
  Play,
  ArrowUpRight,
  Disc,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { PROJECTS_SHOWCASE, type ProjectShowcaseItem } from '../constants'

const MechanicalScrew = () => (
  <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-800 border border-zinc-400/40 dark:border-zinc-700/40 shadow-inner flex items-center justify-center select-none relative overflow-hidden">
    <div className="absolute w-[5px] h-[1px] bg-zinc-500 dark:bg-zinc-650 rotate-45" />
  </div>
)

export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<ProjectShowcaseItem>(PROJECTS_SHOWCASE[0])
  const [isInserting, setIsInserting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.1 })

  const handleSelectProject = (project: ProjectShowcaseItem) => {
    if (project.id === selectedProject.id) return
    setIsInserting(true)
    setSelectedProject(project)
    setTimeout(() => {
      setIsInserting(false)
    }, 400)
  }

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-955 py-24 transition-colors duration-300"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-14 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="mb-4 flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-200/50 dark:bg-zinc-900/60 px-4 py-1.5 text-xs font-mono tracking-wider text-[#f59e0b]"
          >
            <Disc className="h-3.5 w-3.5 animate-spin-slow text-[#10b981]" />
            <span>03 // PROJECT LAUNCHPAD</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tighter sm:text-5xl text-zinc-900 dark:text-zinc-100 uppercase"
          >
            Cartridge Slots
          </motion.h2>
        </div>

        {/* Minimalist Hi-Fi Console Framework */}
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 bg-zinc-200/50 dark:bg-zinc-900/50 p-6 sm:p-8 rounded-[32px] shadow-2xl border border-zinc-300 dark:border-zinc-850 relative">
          <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[url('/noise.png')] opacity-2 mix-blend-overlay" />

          {/* Left Column: Mechanical Cartridge Slots (Col span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-6 relative justify-between">
            
            {/* Module Rack Cabinet */}
            <div className="relative rounded-2xl border border-zinc-300 dark:border-zinc-850 bg-zinc-100/60 dark:bg-zinc-950 p-6 shadow-inner flex flex-col gap-6">
              
              {/* Screws */}
              <div className="absolute top-3 left-3"><MechanicalScrew /></div>
              <div className="absolute top-3 right-3"><MechanicalScrew /></div>
              <div className="absolute bottom-3 left-3"><MechanicalScrew /></div>
              <div className="absolute bottom-3 right-3"><MechanicalScrew /></div>

              <div className="flex justify-between items-center border-b border-zinc-300 dark:border-zinc-900 pb-3.5 mt-1">
                <span className="font-mono text-[8px] font-bold text-zinc-550 dark:text-zinc-500 uppercase tracking-widest">CONSOLE UNIT: CARTRIDGE_BAY</span>
                <span className="font-mono text-[7px] text-[#10b981] font-bold uppercase tracking-wider">LOAD_TAPE</span>
              </div>

              {/* Physical Cartridges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-h-[200px] items-stretch">
                {PROJECTS_SHOWCASE.map((project) => {
                  const isActive = selectedProject.id === project.id
                  return (
                    <motion.div 
                      key={project.id}
                      onClick={() => handleSelectProject(project)}
                      whileHover={{ y: -4 }}
                      whileTap={{ y: 2 }}
                      className={cn(
                        "relative rounded-xl border-2 p-4 flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all h-36 shadow-md",
                        isActive 
                          ? "border-[#f59e0b] bg-zinc-200 dark:bg-zinc-900 shadow-inner"
                          : "border-zinc-350 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-700"
                      )}
                    >
                      {/* Cartridge physical aesthetic notches */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-zinc-300 dark:bg-zinc-800" />
                      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-350 dark:bg-zinc-800 shadow-inner" />
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-350 dark:bg-zinc-800 shadow-inner" />

                      <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500 dark:text-zinc-500 border-b border-zinc-300 dark:border-zinc-900 pb-2 mt-1">
                        <span>SYS_CART // 0{project.id}</span>
                        <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[#f59e0b]" : "bg-zinc-300 dark:bg-zinc-800")} />
                      </div>

                      <div className="my-3 text-left flex-1 flex flex-col justify-center">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase truncate tracking-tight">{project.title}</h4>
                        <span className="text-[7px] text-[#10b981] font-mono tracking-widest block mt-0.5">{project.genre?.toUpperCase()}</span>
                      </div>

                      {/* Copper Pin connectors representation at bottom */}
                      <div className="flex justify-between items-center border-t border-zinc-300 dark:border-zinc-900 pt-2">
                        <div className="flex gap-[2px] items-center">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className={cn("w-[3px] h-[5px] rounded-t-xs", isActive ? "bg-amber-600" : "bg-zinc-400 dark:bg-zinc-800")} />
                          ))}
                        </div>
                        <span className="text-[6px] font-mono text-zinc-500 dark:text-zinc-500 tracking-wider">PIN_LOCK</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Physical Cartridge Read Tray slot */}
              <div className="relative h-20 bg-zinc-950 rounded-xl border border-zinc-850 p-3 flex items-center justify-between shadow-inner">
                <div className="flex flex-col text-left">
                  <span className="font-mono text-[7px] text-zinc-550 uppercase tracking-widest">SLOT STATUS:</span>
                  <span className="font-mono text-[9px] text-[#10b981] uppercase tracking-wider font-bold">
                    {isInserting ? "MOUNTING..." : "CARTRIDGE LOADED"}
                  </span>
                </div>

                <div className="relative w-48 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    {!isInserting && (
                      <motion.div
                        key={selectedProject.id}
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 30, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="text-[9px] font-mono font-bold text-zinc-350 flex items-center gap-2"
                      >
                        <span className="text-[#f59e0b] font-black">▶</span> {selectedProject.title.toUpperCase()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Spec Sheet Screen & CRT Visual Mockup (Col span 5) */}
          <div className="lg:col-span-5 flex">
            <div className="w-full rounded-2xl border border-zinc-350 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-955 shadow-inner flex flex-col overflow-hidden justify-between">
              
              {/* Cover Graphic / CRT Screen Mock */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950 border-b border-zinc-300 dark:border-zinc-900 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] opacity-5 pointer-events-none" style={{ backgroundSize: '6px 6px' }} />
                
                <AnimatePresence mode="wait">
                  {!isInserting && (
                    <motion.div
                      key={selectedProject.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={selectedProject.image}
                        alt={selectedProject.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-top filter grayscale hover:grayscale-0 transition-all duration-300 rounded"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contents Details */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[#10b981] text-[8px] font-mono tracking-widest">
                    <Sparkles size={9} />
                    <span>03.B // HARDWARE CALIBRATION SPEC</span>
                  </div>

                  <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight leading-none mt-1">
                    {selectedProject.title}
                  </h3>
                  
                  <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-400 mt-2">
                    {selectedProject.description}
                  </p>

                  <div className="mt-4">
                    <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2">SYSTEM LIBRARIES</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['React', 'Next.js', 'Tailwind', 'TypeScript'].map(
                        (tech) => (
                          <span
                            key={tech}
                            className="rounded bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-850 px-2 py-0.5 text-[8px] font-mono text-zinc-750 dark:text-zinc-450 uppercase font-bold"
                          >
                            {tech}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* Visit Link action button */}
                <div className="mt-6">
                  <a
                    href={selectedProject.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-zinc-950 border border-transparent p-3 px-5 text-xs font-bold transition-all active:scale-97 select-none font-mono"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>LAUNCH DEMO</span>
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
