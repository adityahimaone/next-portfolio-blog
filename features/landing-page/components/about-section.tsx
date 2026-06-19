'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Layers, ChevronDown } from 'lucide-react'

interface CabinetModule {
  id: string;
  label: string;
  title: string;
  specs: string[];
  content: string;
}

export function AboutSection() {
  const [openModule, setOpenModule] = useState<string | null>('bio')

  const modules: CabinetModule[] = [
    {
      id: 'bio',
      label: 'mod-01 / bio',
      title: 'Structural Biography',
      specs: ['type: personal profiles', 'cal: front-end focus'],
      content: 'I construct clean, high-performance interfaces that bridge human interaction and machine operations. With a focus on semantic architecture and minimal aesthetics, I craft digital products that stand the test of time, drawing heavy inspiration from functionalist and modernist industrial design philosophies.'
    },
    {
      id: 'stack',
      label: 'mod-02 / stack',
      title: 'Technical Frameworks',
      specs: ['runtime: node 20+', 'engine: next.js 15'],
      content: 'My engineering workflow centers on React, TypeScript, Next.js, and modern styling architectures. I prioritize performance, fluid micro-interactions, type safety, and clean layouts, ensuring codebase scalability and optimized load times across all platforms.'
    },
    {
      id: 'stats',
      label: 'mod-03 / stats',
      title: 'System Specifications',
      specs: ['exp: 5+ years', 'status: active'],
      content: 'Operational stats: over 40 successfully deployed system panels, strong technical background in front-end architecture, responsive grids, and semantic SEO integration. Actively maintaining clean build indicators and performance metrics.'
    }
  ]

  return (
    <section id="about" className="bg-[#f5f5f3] py-24 dark:bg-[#121212]">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 flex items-center gap-2 rounded bg-[#e8e8e4] border border-[#d4d4d0] px-3 py-1 font-mono text-[9px] font-bold text-zinc-600 uppercase tracking-widest dark:bg-[#1a1a1a] dark:border-[#27272a] dark:text-zinc-400"
          >
            <Layers className="h-3 w-3" />
            <span>cabinet modules</span>
          </m.div>
          <h2 className="font-sans text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            Modular Systems
          </h2>
        </div>

        {/* 606 Shelving Cabinet System Grid */}
        <div className="mx-auto max-w-5xl flex flex-col gap-6">
          {modules.map((mod) => {
            const isOpen = openModule === mod.id
            return (
              <div
                key={mod.id}
                className="group border border-[#d4d4d0] bg-[#f4f4f0] rounded overflow-hidden transition-all duration-300 dark:border-[#27272a] dark:bg-[#161616]"
              >
                {/* Module Header (Cabinet Drawer handle) */}
                <button
                  onClick={() => setOpenModule(isOpen ? null : mod.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-mono select-none cursor-pointer focus:outline-none"
                >
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-8">
                    <span className="text-[10px] font-bold text-[#f05523] uppercase tracking-wide">
                      {mod.label}
                    </span>
                    <span className="font-sans text-base font-bold text-zinc-800 dark:text-zinc-200">
                      {mod.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Tiny specs displayed on the cabinet face */}
                    <div className="hidden items-center gap-3 text-[8px] text-zinc-400 uppercase md:flex">
                      {mod.specs.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'text-zinc-500 transition-transform duration-300',
                        isOpen && 'rotate-180 text-[#f05523]'
                      )}
                    />
                  </div>
                </button>

                {/* Cabinet Drawer Body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                    >
                      <div className="border-t border-[#e4e4e0] bg-white p-6 dark:border-[#202020] dark:bg-[#1d1d1d]">
                        {/* Mechanical details */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="md:col-span-3">
                            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                              {mod.content}
                            </p>
                          </div>
                          
                          {/* Sidebar technical details (look like technical specs) */}
                          <div className="flex flex-col gap-3 border-l border-[#e4e4e0] pl-6 dark:border-[#202020] font-mono text-[9px] text-zinc-500 uppercase">
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">calibration:</span>
                            {mod.specs.map((s) => (
                              <span key={s} className="truncate">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
