'use client'

import { motion, useInView } from 'motion/react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import {
  Github,
  Linkedin,
  Music,
  Mail,
  Play,
  Volume2,
  Radio,
} from 'lucide-react'
import { Screw } from '@/components/screw'
import { SOCIAL_LINKS, FOOTER_NAVIGATION, TECH_STACK } from '../constants'

export function Footer() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()

  return (
    <footer
      ref={ref}
      className="relative overflow-hidden bg-zinc-50 py-16 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900"
    >
      <div className="container mx-auto px-4">
        {/* Braun Audio Console Casing Panel */}
        <div className="relative mx-auto max-w-6xl rounded-3xl bg-zinc-200 p-8 shadow-2xl dark:bg-zinc-900 border border-zinc-350 dark:border-zinc-800">
          {/* Metallic Texture Overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />
          
          {/* Screws */}
          <Screw className="absolute top-4 left-4" />
          <Screw className="absolute top-4 right-4" />
          <Screw className="absolute bottom-4 left-4" />
          <Screw className="absolute right-4 bottom-4" />

          {/* Inner Plate */}
          <div className="relative rounded-2xl border border-zinc-300 bg-zinc-300/40 p-6 md:p-10 dark:border-zinc-800 dark:bg-zinc-950/40">
            
            {/* Grid layout */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              
              {/* Brand & Specifications */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 shadow-md dark:bg-zinc-800">
                      <Radio className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-widest text-zinc-800 dark:text-zinc-200 uppercase">
                        ADITYAHIMAONE
                      </h3>
                      <p className="font-mono text-[10px] text-zinc-500 uppercase">
                        Master Output System v2.6
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Blending clean code and layout aesthetics to craft premium visual systems.
                  Built using professional design principles.
                </p>

                {/* Status Indicator */}
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  <span className="font-mono text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">
                    SYS-OK // OPEN FOR PROJECTS
                  </span>
                </div>
              </div>

              {/* Input Sockets (Socials) */}
              <div className="lg:col-span-4 flex flex-col justify-start">
                <h4 className="mb-4 font-mono text-xs font-bold tracking-wider text-zinc-500 uppercase">
                  I/O Sockets (Social Connections)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-1.5 rounded-xl border border-zinc-350 bg-zinc-300/30 p-3 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:bg-zinc-800/80 transition-all"
                      onMouseEnter={() => setHoveredSocial(link.name)}
                      onMouseLeave={() => setHoveredSocial(null)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                          {link.name}
                        </span>
                        {/* Audio Socket Visual Indicator */}
                        <div className="relative flex h-5 w-5 items-center justify-center rounded-full border border-zinc-400 bg-zinc-900/80 shadow-inner dark:border-zinc-700">
                          <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${hoveredSocial === link.name ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]' : 'bg-zinc-700'}`} />
                        </div>
                      </div>
                      <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                        {link.label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Navigation & Audio Specs */}
              <div className="lg:col-span-3 grid grid-cols-2 gap-6 lg:flex lg:flex-col lg:gap-6">
                <div>
                  <h4 className="mb-3 font-mono text-xs font-bold tracking-wider text-zinc-500 uppercase">
                    Navigation
                  </h4>
                  <ul className="space-y-2">
                    {FOOTER_NAVIGATION.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-primary dark:text-zinc-400 dark:hover:text-white transition-colors"
                        >
                          <Play className="h-2.5 w-2.5 shrink-0 text-zinc-400" />
                          {item.name.toUpperCase()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 font-mono text-xs font-bold tracking-wider text-zinc-500 uppercase">
                    Tech Specs
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {TECH_STACK.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-zinc-350 bg-zinc-300/40 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300"
                      >
                        {tech.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Status / Footer metadata */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-300 pt-6 text-xs text-zinc-500 md:flex-row dark:border-zinc-800 dark:text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <Volume2 className="h-3.5 w-3.5 text-zinc-400" />
                <span>
                  © {currentYear} ADITYAHIMAONE // DESIGNED IN INDONESIA
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                <span>IMPACT ENGINE 1.0</span>
                <span>•</span>
                <span>LINE OUT: 20Hz - 20kHz</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  )
}
