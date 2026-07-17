'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Activity, Cable } from 'lucide-react'
import { Screw } from '@/components/screw'
import { cn } from '@/lib/utils'
import { SOCIAL_LINKS, FOOTER_NAVIGATION } from '../constants'

const NAV_COLORS: Record<string, string> = {
  HOME: 'var(--daw-led-amber)',
  BLOG: 'var(--daw-led-blue)',
  PROJECTS: 'var(--daw-led-green)',
  MIXTAPE: 'var(--daw-led-amber)',
}

const SOCIAL_COLORS: Record<string, string> = {
  GitHub: 'var(--daw-led-blue)',
  LinkedIn: 'var(--daw-led-green)',
  Spotify: 'var(--daw-led-green)',
  Email: 'var(--daw-led-amber)',
}

export function Footer() {
  const [hoveredJack, setHoveredJack] = useState<string | null>(null)
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'relative isolate overflow-hidden border-y border-black/80 bg-[var(--ko-display-bg)] text-white',
        'shadow-[inset_0_1px_rgba(255,255,255,0.1),inset_0_-1px_rgba(0,0,0,0.9)]',
      )}
    >
      {/* Brushed output-module faceplate. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),transparent_18%,transparent_82%,rgba(0,0,0,0.5)),repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgba(255,255,255,0.018)_4px)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/90" />
      <div className="ko-grille pointer-events-none absolute top-0 right-24 hidden h-5 w-36 opacity-70 sm:block" />

      <Screw className="pointer-events-none absolute top-3 left-3 z-20 scale-75 opacity-70 sm:top-4 sm:left-5" />
      <Screw className="pointer-events-none absolute top-3 right-3 z-20 scale-75 opacity-70 sm:top-4 sm:right-5" />
      <Screw className="pointer-events-none absolute bottom-3 left-3 z-20 hidden scale-75 opacity-70 sm:bottom-4 sm:left-5 sm:flex" />
      <Screw className="pointer-events-none absolute right-3 bottom-3 z-20 hidden scale-75 opacity-70 sm:right-5 sm:bottom-4 sm:flex" />

      <div className="relative mx-auto max-w-7xl px-5 py-7 sm:px-8 md:px-12">
        <div className="grid border-y border-white/10 bg-black/15 md:grid-cols-[minmax(11rem,1fr)_minmax(22rem,2fr)_minmax(14rem,1fr)]">
          {/* Master-status bay */}
          <section className="flex min-h-32 flex-col justify-between border-b border-white/10 p-4 md:border-r md:border-b-0">
            <Link
              href="/"
              className="group w-fit rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--daw-led-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--daw-display-bg)] focus-visible:outline-none"
              aria-label="Go to homepage"
            >
              <div className="flex items-center gap-2 rounded-sm border border-[var(--daw-led-green)]/30 bg-[var(--daw-display-bg)] px-2.5 py-2 shadow-[inset_0_1px_8px_rgba(0,0,0,0.9)] transition-colors duration-150 group-hover:border-[var(--daw-led-green)]/60 motion-reduce:transition-none">
                <i className="h-1.5 w-1.5 rounded-full bg-[var(--daw-led-green)] shadow-[0_0_7px_var(--daw-led-green)] motion-safe:animate-pulse" />
                <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-[var(--daw-led-green)] [text-shadow:0_0_7px_var(--daw-led-green)]">
                  ADIT.SYS
                </span>
              </div>
            </Link>

            <div className="flex items-end justify-between gap-3">
              <div className="font-mono text-[7px] leading-relaxed tracking-[0.16em] text-white/35 uppercase">
                <p>Master output</p>
                <p>Jakarta, ID</p>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[7px] font-bold tracking-[0.14em] text-[var(--daw-led-amber)] uppercase">
                <Activity className="h-3 w-3" aria-hidden="true" />
                48 kHz
              </div>
            </div>
          </section>

          {/* Channel-select navigation strip */}
          <nav
            className="flex min-h-32 flex-col justify-between border-b border-white/10 p-4 md:border-r md:border-b-0"
            aria-label="Footer navigation"
          >
            <div className="flex items-center justify-between font-mono text-[7px] font-bold tracking-[0.18em] text-white/35 uppercase">
              <span>Output routing · 出力</span>
              <span className="text-[var(--daw-led-amber)]">CH 01—04</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {FOOTER_NAVIGATION.map((item, index) => {
                const color =
                  NAV_COLORS[item.name.toUpperCase()] ?? 'var(--daw-led-amber)'

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group relative flex min-h-12 flex-col justify-center overflow-hidden rounded-sm border border-white/[0.09] bg-white/[0.035] px-2.5 font-mono transition-[transform,border-color,background-color] duration-150 hover:border-white/25 hover:bg-white/[0.08] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--daw-led-amber)] focus-visible:outline-none active:translate-y-px motion-reduce:transition-none"
                  >
                    <span className="absolute top-1.5 right-2 left-2 h-px bg-white/10" />
                    <span
                      className="mb-1.5 h-1.5 w-1.5 rounded-full transition-shadow duration-150 motion-reduce:transition-none"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 6px ${color}, 0 0 10px ${color}`,
                      }}
                    />
                    <span className="text-[8px] font-bold tracking-[0.12em] text-white/60 uppercase group-hover:text-white">
                      {item.name}
                    </span>
                    <span className="mt-0.5 text-[6px] tracking-widest text-white/25">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </Link>
                )
              })}
            </div>

            <p className="font-mono text-[7px] tracking-[0.15em] text-white/30 uppercase">
              Signal lock · nominal +0.2 dB
            </p>
          </nav>

          {/* Social patch bay */}
          <section
            className="flex min-h-32 flex-col justify-between p-4"
            aria-label="Social patch bay"
          >
            <div className="flex items-center justify-between font-mono text-[7px] font-bold tracking-[0.18em] text-white/35 uppercase">
              <span className="flex items-center gap-1.5">
                <Cable
                  className="h-3 w-3 text-[var(--daw-led-amber)]"
                  aria-hidden="true"
                />
                Patch bay
              </span>
              <span className="text-[var(--ko-accent)]">OUT / USB</span>
            </div>

            <div className="flex justify-between gap-2 rounded-sm border border-black/70 bg-[var(--daw-display-bg)] p-2 shadow-[inset_0_2px_7px_rgba(0,0,0,0.95)]">
              {SOCIAL_LINKS.map((link) => {
                const isActive = hoveredJack === link.name
                const color = SOCIAL_COLORS[link.name] ?? 'var(--daw-led-amber)'

                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredJack(link.name)}
                    onMouseLeave={() => setHoveredJack(null)}
                    onFocus={() => setHoveredJack(link.name)}
                    onBlur={() => setHoveredJack(null)}
                    aria-label={`${link.name}: ${link.label}`}
                    className="group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-sm py-0.5 focus-visible:ring-2 focus-visible:ring-[var(--daw-led-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--daw-display-bg)] focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] transition-[border-color,box-shadow,transform] duration-150 group-active:scale-95 motion-reduce:transition-none',
                        isActive
                          ? 'scale-105 border-white/35'
                          : 'border-white/10',
                      )}
                      style={{
                        boxShadow: isActive
                          ? `inset 0 2px 4px rgba(0,0,0,0.95), 0 0 10px ${color}`
                          : undefined,
                      }}
                    >
                      <span className="flex h-3 w-3 items-center justify-center rounded-full bg-black ring-1 ring-white/10">
                        <span
                          className="h-1.5 w-1.5 rounded-full transition-all duration-150 motion-reduce:transition-none"
                          style={{
                            backgroundColor: isActive
                              ? color
                              : 'var(--daw-led-off)',
                            boxShadow: isActive
                              ? `0 0 6px ${color}`
                              : undefined,
                          }}
                        />
                      </span>
                    </span>
                    <span className="max-w-full truncate font-mono text-[6px] font-bold tracking-[0.1em] text-white/35 uppercase group-hover:text-white/75">
                      {link.name.slice(0, 3)}
                    </span>
                  </a>
                )
              })}
            </div>

            <p className="font-mono text-[7px] tracking-[0.15em] text-white/30 uppercase">
              Hover to monitor route
            </p>
          </section>
        </div>

        {/* Continuous lower meter rail, rather than a separate footer card. */}
        <div className="flex flex-col gap-3 border-x border-b border-white/10 bg-black/20 px-4 py-3 font-mono text-[7px] font-medium tracking-[0.14em] text-white/35 uppercase sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span>© {currentYear} ADITYAHIMAONE</span>
            <span className="h-1 w-1 rounded-full bg-[var(--daw-led-green)] shadow-[0_0_5px_var(--daw-led-green)]" />
            <span>System active</span>
          </div>
          <div className="flex items-center gap-2">
            <span>6.2088° S, 106.8456° E</span>
            <span className="h-px w-7 bg-gradient-to-r from-[var(--daw-led-amber)] to-[var(--daw-led-green)]" />
            <span className="text-[var(--daw-led-amber)]">Output nominal</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
