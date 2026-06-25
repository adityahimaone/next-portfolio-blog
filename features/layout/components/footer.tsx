'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Activity, Cable } from 'lucide-react'
import { Screw } from '@/components/screw'
import { cn } from '@/lib/utils'
import { SOCIAL_LINKS, FOOTER_NAVIGATION } from '../constants'

const NAV_COLORS: Record<string, string> = {
  HOME:     '#C84B4B',
  BLOG:     '#C95FAA',
  PROJECTS: '#5FC9C9',
  MIXTAPE:  '#C9A447',
}

const SOCIAL_COLORS: Record<string, string> = {
  GitHub: '#A855F7',   // Violet
  LinkedIn: '#0077b5', // LinkedIn Blue
  Spotify: '#1DB954',  // Spotify Green
  Email: '#EF4444',    // Red
}

export function Footer() {
  const [hoveredJack, setHoveredJack] = useState<string | null>(null)
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn(
      'relative overflow-hidden py-14 transition-all duration-300 border-t',
      'border-black/20 dark:border-black/50 bg-[var(--daw-chassis)] dark:bg-[var(--daw-chassis)]',
      'before:pointer-events-none before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.01)_3px,rgba(0,0,0,0.01)_4px)]'
    )}>
      {/* Subtle Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(175,80,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(175,80,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 dark:opacity-100" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-2 mix-blend-overlay" />

      {/* Viewport Mounting Screws (Matches Hero & Header Ears) */}
      <Screw className="absolute top-4 left-4 hover:rotate-12 transition-transform opacity-60" />
      <Screw className="absolute top-4 right-4 hover:-rotate-12 transition-transform opacity-60" />
      <Screw className="absolute bottom-4 left-4 hover:-rotate-12 transition-transform opacity-60" />
      <Screw className="absolute right-4 bottom-4 hover:rotate-12 transition-transform opacity-60" />

      <div className="relative container mx-auto flex flex-col gap-10 px-6 md:px-12">
        {/* Main Simplified Layout Grid */}
        <div className="grid grid-cols-1 items-center gap-8 pt-4 md:grid-cols-12">
          
          {/* Left Block: Logo / Branding (Matches Header LCD Readout) */}
          <div className="flex flex-col items-start gap-1.5 md:col-span-4 select-none">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex flex-col items-start gap-1">
                <div
                  className={cn(
                    'px-3.5 py-1.5 rounded-[3px]',
                    'bg-[#0A0A0C]',
                    'border border-black/40',
                    'shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.85)]',
                    'flex items-center gap-2'
                  )}
                >
                  <span
                    className="font-mono text-[10px] font-bold tracking-widest uppercase"
                    style={{
                      color: '#22C55E',
                      textShadow: '0 0 6px #22C55E',
                    }}
                  >
                    ADIT.SYS
                  </span>
                  <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                </div>
                <span className="font-mono text-[6.5px] tracking-widest text-black/45 dark:text-white/20 uppercase mt-0.5 ml-0.5">
                  CORE MODULES ACTIVE // JAKARTA, ID
                </span>
              </div>
            </Link>
          </div>

          {/* Center Block: Channel Strip Sub-navigation */}
          <div className="flex flex-col items-center justify-center gap-2.5 md:col-span-4">
            <div className="flex flex-wrap justify-center gap-2">
              {FOOTER_NAVIGATION.map((item) => {
                const color = NAV_COLORS[item.name.toUpperCase()] ?? '#C9A447'
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative flex flex-col items-center justify-between px-3.5 py-2 rounded-[3px]',
                      'border border-black/15 dark:border-white/5 bg-[var(--daw-chassis-raised)] dark:bg-[var(--daw-chassis-raised)]',
                      'shadow-[0_2px_0_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] cursor-pointer select-none transition-all active:scale-95',
                      'hover:border-black/25 dark:hover:border-white/15 hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    {/* LED dot at top */}
                    <div
                      className="h-1.5 w-1.5 rounded-full mb-1.5 transition-all duration-300"
                      style={{
                        background: color,
                        boxShadow: `0 0 5px ${color}, 0 0 8px ${color}`,
                      }}
                    />
                    {/* Label */}
                    <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-black/60 dark:text-white/45 group-hover:text-white">
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>
            <div className="text-black/40 dark:text-white/20 flex items-center gap-1 font-mono text-[7px] tracking-widest uppercase">
              SYS.SYNC LEVEL OUT: +0.2dB
            </div>
          </div>

          {/* Right Block: Social Links Recessed Jack Sockets */}
          <div className="flex flex-col items-start gap-3 md:col-span-4 md:items-end">
            <span className="text-black/50 dark:text-white/30 flex items-center gap-1.5 font-mono text-[8px] font-bold tracking-widest uppercase">
              <Cable className="h-3 w-3" />
              PATCH OUT CHANNELS
            </span>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((link) => {
                const isHovered = hoveredJack === link.name
                const ledColor = SOCIAL_COLORS[link.name] ?? '#C9A447'

                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredJack(link.name)}
                    onMouseLeave={() => setHoveredJack(null)}
                    className="group flex cursor-pointer flex-col items-center gap-1.5 select-none"
                    title={link.label}
                  >
                    {/* Recessed jack socket */}
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200',
                        isHovered
                          ? 'border-white/30 bg-[var(--daw-chassis-deep)] shadow-[0_0_8px_rgba(255,255,255,0.15)]'
                          : 'border-black/25 dark:border-white/10 bg-[var(--daw-chassis-deep)]'
                      )}
                    >
                      {/* Inner contact hole */}
                      <div className="h-3 w-3 rounded-full bg-black/90 shadow-inner flex items-center justify-center">
                        <div
                          className={cn(
                            'h-1 w-1 rounded-full transition-all duration-300',
                            isHovered ? 'shadow-[0_0_4px_currentColor]' : 'bg-transparent'
                          )}
                          style={{ color: ledColor, backgroundColor: isHovered ? ledColor : 'transparent' }}
                        />
                      </div>
                    </div>
                    <span className="font-mono text-[7px] font-bold tracking-widest text-black/40 dark:text-white/20 group-hover:text-white transition-colors uppercase">
                      {link.name.substring(0, 3)}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Coordinates & Direct Link Strip (Matches Hero) */}
        <div className="border-t border-black/10 dark:border-white/5 text-black/40 dark:text-white/30 flex flex-col items-center justify-between gap-3 pt-5 font-mono text-[8px] font-medium tracking-widest uppercase select-none sm:flex-row">
          <div className="flex items-center gap-1.5">
            <span>© {currentYear} ADITYAHIMAONE</span>
            <span className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
            <span>SYSTEM ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span>6.2088° S, 106.8456° E</span>
            <span className="text-red-500 animate-pulse font-bold">❤️</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
