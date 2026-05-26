'use client'

import { motion, useInView } from 'motion/react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import {
  Github,
  Linkedin,
  Music,
  Mail,
  Disc3,
  Volume2,
  Rewind,
} from 'lucide-react'
import { SOCIAL_LINKS, FOOTER_NAVIGATION, TECH_STACK } from '../constants'

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()

  return (
    <footer
      ref={ref}
      className="relative overflow-hidden border-t-2 border-copper/30 bg-stone-100 dark:border-copper-light/20 dark:bg-stone-950"
    >
      {/* Amplifier Back Panel Texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]" />
      </div>

      {/* Spinning Vinyl Decoration */}
      <div className="pointer-events-none absolute -top-32 right-0 opacity-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <Disc3 className="h-64 w-64 text-stone-900 dark:text-white" />
        </motion.div>
      </div>

      {/* Specification Plate */}
      <div className="relative container mx-auto px-4 pt-6 pb-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.05 }}
          className="mb-8 flex items-center justify-center gap-4"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-copper/30 to-transparent dark:via-copper-light/20" />
          <div className="flex items-center gap-2 rounded-full border border-stone-300 bg-stone-200/80 px-4 py-1.5 dark:border-stone-800 dark:bg-stone-900/80">
            <Volume2 size={12} className="text-copper dark:text-copper-light" />
            <span className="font-[family-name:var(--font-mono)] text-[9px] font-bold tracking-[0.3em] text-stone-500 uppercase dark:text-stone-400">
              OUTPUT PANEL — MODEL AH-2026
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-copper/30 to-transparent dark:via-copper-light/20" />
        </motion.div>
      </div>

      <div className="relative container mx-auto px-4 pt-4 pb-8">
        {/* Main Content Grid */}
        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand Section */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
            >
              <Link
                href="/"
                className="group inline-flex items-center gap-3"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700 shadow-lg transition-transform group-hover:scale-105 dark:from-stone-200 dark:to-stone-400">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Disc3 className="h-6 w-6 text-white dark:text-stone-900" />
                  </motion.div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter text-stone-900 dark:text-white">
                    adityahimaone
                  </span>
                  <span className="text-xs font-medium text-copper dark:text-copper-light">
                    Frontend Developer
                  </span>
                </div>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-400"
            >
              Mixing code and creativity to produce{' '}
              <span className="font-semibold text-stone-900 dark:text-white">
                pixel-perfect interfaces
              </span>{' '}
              with seamless user experiences. Always exploring the intersection
              of design, engineering, and innovation.
            </motion.p>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-signal/30 bg-signal/5 px-4 py-2 dark:border-signal/20 dark:bg-signal/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal"></span>
              </span>
              <span className="text-xs font-semibold text-signal dark:text-signal-light">
                Available for Projects
              </span>
            </motion.div>
          </div>

          {/* I/O Ports — Social Links as Audio Jacks */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              <h3 className="mb-6 flex items-center gap-2 text-sm font-bold tracking-wider text-stone-900 uppercase dark:text-white">
                <span className="font-[family-name:var(--font-mono)] text-[10px] text-copper dark:text-copper-light">I/O</span>
                Connect
              </h3>
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {SOCIAL_LINKS.map((link, idx) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit my ${link.name} profile`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    onMouseEnter={() => setHoveredSocial(link.name)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    className="group perspective-1000 relative"
                  >
                    <div className="relative h-14 w-14 cursor-pointer">
                      {/* Vinyl Record - appears on hover */}
                      <motion.div
                        initial={{ x: 0, rotate: 0, opacity: 0 }}
                        animate={{
                          x: hoveredSocial === link.name ? '60%' : 0,
                          rotate: hoveredSocial === link.name ? 360 : 0,
                          opacity: hoveredSocial === link.name ? 1 : 0,
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-stone-950 shadow-xl"
                      >
                        <div className="absolute inset-0 rounded-full bg-[conic-gradient(transparent_0deg,rgba(255,255,255,0.1)_30deg,transparent_60deg)]" />
                        <div className="absolute inset-[20%] rounded-full border border-stone-800/40" />
                        <div className="absolute inset-[30%] rounded-full border border-stone-800/40" />
                        <div
                          className={`flex h-[40%] w-[40%] items-center justify-center rounded-full bg-gradient-to-br text-white shadow-inner ${link.color}`}
                        >
                          <div className="h-3 w-3 rounded-full bg-white opacity-20" />
                        </div>
                      </motion.div>

                      {/* Icon Card */}
                      <motion.div
                        initial={{ x: 0 }}
                        animate={{
                          x: hoveredSocial === link.name ? '-10%' : 0,
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-all hover:shadow-xl ${link.color}`}
                      >
                        {link.name.toLowerCase().includes('git') ? (
                          <Github className="h-6 w-6" />
                        ) : link.name.toLowerCase().includes('link') ? (
                          <Linkedin className="h-6 w-6" />
                        ) : link.name.toLowerCase().includes('spot') ? (
                          <Music className="h-6 w-6" />
                        ) : link.name.toLowerCase().includes('mail') ||
                          link.name.toLowerCase().includes('email') ? (
                          <Mail className="h-6 w-6" />
                        ) : (
                          <span className="text-xs font-bold">
                            {link.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
            >
              <h3 className="mb-6 text-sm font-bold tracking-wider text-stone-900 uppercase dark:text-white">
                Navigation
              </h3>
              <ul className="space-y-3">
                {FOOTER_NAVIGATION.map((item, idx) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                    >
                      <span className="h-px w-0 bg-copper transition-all group-hover:w-4 dark:bg-copper-light" />
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Tech Stack */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
            >
              <h3 className="mb-6 text-sm font-bold tracking-wider text-stone-900 uppercase dark:text-white">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.map((tech, idx) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-copper/40 hover:bg-copper/5 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-copper-light/30 dark:hover:bg-copper-light/5"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar — Amplifier spec plate style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-8 text-xs text-stone-500 md:flex-row dark:border-stone-800 dark:text-stone-400"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="h-3 w-3 text-copper dark:text-copper-light" />
            <span className="font-[family-name:var(--font-mono)]">
              © {currentYear} adityahimaone. All rights reserved. Designed &
              Developed with passion.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="transition-colors hover:text-stone-900 dark:hover:text-white"
            >
              Privacy
            </Link>
            <span className="text-copper/40">•</span>
            <Link
              href="#"
              className="transition-colors hover:text-stone-900 dark:hover:text-white"
            >
              Terms
            </Link>
            <span className="text-copper/40">•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-200 px-3 py-1.5 font-bold transition-all hover:border-copper/40 hover:bg-copper/5 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-copper-light/30 dark:hover:bg-copper-light/5"
            >
              <Rewind className="h-3 w-3 text-copper transition-transform group-hover:-translate-x-0.5 dark:text-copper-light" />
              <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-widest">REWIND</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Studio floor line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-copper/20 to-transparent dark:via-copper-light/10" />
    </footer>
  )
}
