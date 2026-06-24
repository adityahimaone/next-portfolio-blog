'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Activity, Cable } from 'lucide-react'
import { Screw } from '@/components/screw'
import { SOCIAL_LINKS, FOOTER_NAVIGATION } from '../constants'

export function Footer() {
  const [hoveredJack, setHoveredJack] = useState<string | null>(null)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-bone-white dark:bg-void border-graphite/15 dark:border-graphite/45 text-foreground dark:text-ash relative overflow-hidden border-t py-12 transition-colors duration-500">
      {/* Subtle Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(175,80,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(175,80,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 dark:opacity-100" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-2 mix-blend-overlay" />

      {/* Viewport Mounting Screws (Matches Hero & Header Ears) */}
      <Screw className="text-slate/50 dark:text-graphite absolute top-4 left-4 opacity-40 dark:opacity-50" />
      <Screw className="text-slate/50 dark:text-graphite absolute top-4 right-4 opacity-40 dark:opacity-50" />
      <Screw className="text-slate/50 dark:text-graphite absolute bottom-4 left-4 opacity-40 dark:opacity-50" />
      <Screw className="text-slate/50 dark:text-graphite absolute right-4 bottom-4 opacity-40 dark:opacity-50" />

      {/* Top chassis seam */}
      <div className="bg-graphite/10 dark:bg-graphite/35 absolute inset-x-0 top-0 h-[1px]" />

      <div className="relative container mx-auto flex flex-col gap-8 px-6 md:px-12">
        {/* Main Simplified Layout Grid */}
        <div className="grid grid-cols-1 items-center gap-8 pt-4 md:grid-cols-12">
          {/* Left Block: Logo / Branding (Matches Header Logo) */}
          <div className="flex flex-col items-start gap-1.5 md:col-span-4">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full border border-black/10 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <div className="flex flex-col">
                <span className="text-foreground dark:text-bone-white font-[family-name:var(--font-whyte-inktrap-mono)] text-[11px] font-bold tracking-[0.25em] uppercase">
                  ADIT.SYS
                </span>
                <span className="text-slate dark:text-graphite -mt-0.5 font-[family-name:var(--font-whyte-inktrap-mono)] text-[6.5px] tracking-wider uppercase">
                  CORE MODULES ACTIVE
                </span>
              </div>
            </Link>
            <span className="text-slate dark:text-graphite font-[family-name:var(--font-whyte-inktrap-mono)] text-[9px] tracking-widest uppercase">
              OUTPUT ROUTER // JAKARTA, ID
            </span>
          </div>

          {/* Center Block: Simplified Sub-navigation */}
          <div className="flex flex-col items-center justify-center gap-2 md:col-span-4">
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 font-[family-name:var(--font-whyte-inktrap-mono)] text-[10px] tracking-widest uppercase">
              {FOOTER_NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-slate hover:text-primary dark:text-ash/60 dark:hover:text-bone-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="text-slate/40 dark:text-graphite/70 mt-1 flex items-center gap-1 font-[family-name:var(--font-whyte-inktrap-mono)] text-[8px] tracking-widest uppercase">
              <Activity className="text-primary h-2.5 w-2.5 animate-pulse" />
              SYS.SYNC LEVEL OUT: +0.2dB
            </div>
          </div>

          {/* Right Block: Simplified Patchbay Sockets */}
          <div className="flex flex-col items-start gap-2.5 md:col-span-4 md:items-end">
            <span className="text-slate dark:text-graphite/80 flex items-center gap-1.5 font-[family-name:var(--font-whyte-inktrap-mono)] text-[9px] font-bold tracking-widest uppercase">
              <Cable className="text-primary h-3 w-3" />
              PATCH OUT CHANNELS
            </span>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((link) => {
                const isHovered = hoveredJack === link.name

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
                    {/* Simplified socket socket */}
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                        isHovered
                          ? 'border-primary bg-primary/10 shadow-[0_0_8px_rgba(175,80,255,0.25)]'
                          : 'border-graphite/20 bg-ash/30 dark:border-graphite/45 dark:bg-void/40'
                      }`}
                    >
                      <div className="bg-void border-graphite/35 relative flex h-4.5 w-4.5 items-center justify-center rounded-full border-2">
                        <div className="h-2 w-2 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]" />
                        {/* Mini LED indicator above socket */}
                        <div
                          className={`absolute h-1 w-1 rounded-full transition-colors duration-200 ${
                            isHovered
                              ? 'bg-primary shadow-[0_0_4px_#af50ff]'
                              : 'bg-graphite/35'
                          }`}
                          style={{ top: '-1.5px', right: '-1.5px' }}
                        />
                      </div>
                    </div>
                    <span className="text-slate dark:text-ash/50 group-hover:text-primary font-[family-name:var(--font-whyte-inktrap-mono)] text-[7.5px] font-bold tracking-widest uppercase transition-colors">
                      {link.name.substring(0, 3)}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Coordinates & Direct Link Strip (Matches Hero) */}
        <div className="border-graphite/10 dark:border-graphite/35 text-slate dark:text-graphite flex flex-col items-center justify-between gap-3 border-t pt-5 font-[family-name:var(--font-whyte-inktrap)] text-[10px] font-medium select-none sm:flex-row">
          <span>
            + Fly Direct | © {currentYear} ADITYAHIMAONE · SYSTEM ACTIVE
          </span>
          <div className="flex items-center gap-2 font-[family-name:var(--font-whyte-inktrap-mono)] text-[9.5px] tracking-wider uppercase">
            <span>6.2088° S, 106.8456° E</span>
            <span className="text-primary animate-pulse font-bold">❤️</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
