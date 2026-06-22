'use client'

import { useRef, useEffect, useState } from 'react'
import { m as motion, useScroll, useTransform } from 'motion/react'
import { Syne } from 'next/font/google'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { ArrowDownRight, ExternalLink } from 'lucide-react'

const syne = Syne({ weight: ['700', '800'], subsets: ['latin'] })

const ROLES = ['Frontend Developer', 'UI Engineer', 'React Specialist']

function RotatingRole() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROLES.length)
        setVisible(true)
      }, 300)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className={cn(
        'inline-block text-amber-500 transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {ROLES[index]}
    </span>
  )
}

// Minimal animated grid lines — no audio deps
function GridAccent({ resolvedTheme }: { resolvedTheme: string }) {
  const isDark = resolvedTheme === 'dark'
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Horizontal lines */}
      {[20, 40, 60, 80].map((pct) => (
        <line
          key={`h${pct}`}
          x1="0" y1={`${pct}%`}
          x2="100%" y2={`${pct}%`}
          stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
          strokeWidth="1"
        />
      ))}
      {/* Vertical lines */}
      {[20, 40, 60, 80].map((pct) => (
        <line
          key={`v${pct}`}
          x1={`${pct}%`} y1="0"
          x2={`${pct}%`} y2="100%"
          stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
          strokeWidth="1"
        />
      ))}
      {/* Accent diagonal */}
      <line
        x1="0" y1="100%"
        x2="45%" y2="0"
        stroke="#f59e0b"
        strokeWidth="1"
        strokeOpacity="0.12"
      />
      <line
        x1="55%" y1="100%"
        x2="100%" y2="15%"
        stroke="#f59e0b"
        strokeWidth="1"
        strokeOpacity="0.08"
      />
      {/* Corner bracket marks */}
      <path d="M 20 20 L 20 50 M 20 20 L 50 20" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
      <path d="M calc(100% - 20) calc(100% - 20) L calc(100% - 20) calc(100% - 50) M calc(100% - 20) calc(100% - 20) L calc(100% - 50) calc(100% - 20)" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
    </svg>
  )
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const resolvedThemeStr = resolvedTheme || 'dark'
  const isDark = resolvedThemeStr === 'dark'

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden transition-colors duration-500',
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
      )}
    >
      {/* Background grid accent */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted && <GridAccent resolvedTheme={resolvedThemeStr} />}
        {/* Radial vignette */}
        <div className={cn(
          "absolute inset-0",
          isDark
            ? 'bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,rgba(9,9,11,0.8)_100%)]'
            : 'bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,rgba(250,250,250,0.8)_100%)]'
        )} />
      </div>

      {/* Main Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto w-full"
      >
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={cn(
            'mb-10 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase',
            isDark
              ? 'border-zinc-800 bg-zinc-900/60 text-zinc-400 backdrop-blur-sm'
              : 'border-zinc-200 bg-white/60 text-zinc-500 backdrop-blur-sm'
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Available for work
        </motion.div>

        {/* Name block */}
        <div className={`${syne.className} mb-6 w-full`}>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[15vw] leading-[0.85] font-extrabold tracking-tighter md:text-[11vw] lg:text-[9vw]"
          >
            <span className={cn(
              'block bg-clip-text text-transparent',
              isDark
                ? 'bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-500'
                : 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-600'
            )}>
              ADITYA
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-end justify-center gap-4"
          >
            <span className="text-amber-500 text-[6vw] font-bold tracking-[0.4em] md:text-[4vw] lg:text-[3vw]">
              HIMAONE
            </span>
            <span className={cn(
              'mb-1 text-[2vw] font-bold tracking-widest md:text-[1.4vw] lg:text-[1vw]',
              isDark ? 'text-zinc-600' : 'text-zinc-400'
            )}>
              v1.0
            </span>
          </motion.div>
        </div>

        {/* Rotating role */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className={cn(
            'mb-4 text-base md:text-lg font-light tracking-wide',
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          )}
        >
          <RotatingRole />
          {' '}— Jakarta, ID
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className={cn(
            'mb-12 max-w-lg text-sm leading-relaxed tracking-wide',
            isDark ? 'text-zinc-500' : 'text-zinc-400'
          )}
        >
          Crafting fast, precise, and thoughtful user interfaces.
          <br className="hidden sm:block" />
          React · Next.js · TypeScript · Tailwind CSS.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a
            href="/#projects"
            className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-xs font-bold tracking-widest uppercase text-zinc-950 transition-all hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-500/20"
          >
            View Work
            <ArrowDownRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </a>
          <a
            href="/blog"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all hover:border-amber-500 hover:text-amber-500 active:scale-95",
              isDark
                ? 'border-zinc-700 text-zinc-400'
                : 'border-zinc-300 text-zinc-600'
            )}
          >
            Read Blog
            <ExternalLink size={14} />
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className={cn(
            'text-[10px] font-bold tracking-[0.3em] uppercase',
            isDark ? 'text-zinc-600' : 'text-zinc-400'
          )}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-5 w-px bg-amber-500/50"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
