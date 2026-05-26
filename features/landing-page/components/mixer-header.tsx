'use client'

/**
 * Ravemped 3.0 — Mixer-channel header (homepage only).
 *
 * Each nav item is a "channel" with a tiny fader + LED. The active section
 * (detected via IntersectionObserver) lights its LED and raises its fader.
 * The right side hosts the master channel (always-on indicator) and the
 * Spotify mini-player slot (kept off here — global MusicPlayer handles it).
 *
 * Subpages still use the legacy /features/layout/components/header.tsx.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const CHANNELS = [
  { id: 'home', label: 'HOME', track: '00', color: 'var(--r3-clip)' },
  { id: 'about', label: 'ABOUT', track: '01', color: 'var(--r3-clip)' },
  { id: 'skills', label: 'SKILLS', track: '02', color: 'var(--r3-beat)' },
  { id: 'projects', label: 'WORK', track: '03', color: 'var(--r3-signal)' },
  { id: 'music', label: 'PLAY', track: '04', color: 'var(--r3-filament)' },
  { id: 'blog', label: 'BLOG', track: '05', color: 'var(--r3-filament)', external: '/blog' },
  { id: 'contact', label: 'CONTACT', track: '06', color: 'var(--r3-melody)' },
] as const

export function MixerHeader() {
  const [active, setActive] = useState<string>('home')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ids = CHANNELS.map((c) => c.id)
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => Boolean(e))
    if (!els.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry with greatest intersectionRatio that's currently intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--r3-edge)] bg-[var(--r3-studio)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-stretch gap-2 px-3 py-2 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 pr-3 sm:pr-4 border-r border-[var(--r3-edge)]"
        >
          <span className="r3-led r3-led--clip r3-pulse" aria-hidden />
          <span className="r3-display text-sm font-bold tracking-tight text-[var(--r3-text)] hidden sm:inline">
            ah/daw
          </span>
        </Link>

        {/* Channel strips */}
        <nav
          aria-label="Primary"
          className="flex flex-1 items-stretch overflow-x-auto scrollbar-none"
        >
          {CHANNELS.map((ch) => {
            const isActive = active === ch.id
            const href = (ch as { external?: string }).external ?? `#${ch.id}`
            return (
              <Link
                key={ch.id}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex shrink-0 flex-col items-center justify-between gap-1.5 px-2.5 sm:px-3 py-1 min-w-[58px] sm:min-w-[68px] transition-colors',
                  isActive
                    ? 'text-[var(--r3-text)]'
                    : 'text-[var(--r3-text-mute)] hover:text-[var(--r3-text)]',
                )}
              >
                {/* LED */}
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-all',
                    isActive ? '' : 'opacity-30',
                  )}
                  style={{
                    background: ch.color,
                    boxShadow: isActive ? `0 0 8px ${ch.color}` : 'none',
                  }}
                  aria-hidden
                />
                {/* Label */}
                <span className="r3-mono text-[9px] sm:text-[10px] tracking-widest font-semibold">
                  {ch.label}
                </span>
                {/* Mini fader visualizer */}
                <span className="relative h-3 w-px bg-[var(--r3-edge)] sm:h-4">
                  <span
                    className={cn(
                      'absolute left-1/2 -translate-x-1/2 h-1 w-2.5 rounded-[1px] transition-all',
                      isActive
                        ? 'top-0 bg-[var(--r3-text)]'
                        : 'top-2/3 bg-[var(--r3-edge)]',
                    )}
                    style={isActive ? { boxShadow: `0 0 4px ${ch.color}` } : undefined}
                  />
                </span>
                {/* Track label */}
                <span className="r3-mono text-[8px] text-[var(--r3-label)] tabular-nums hidden sm:block">
                  CH {ch.track}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Master channel */}
        <div className="hidden items-center gap-2 border-l border-[var(--r3-edge)] pl-3 sm:flex">
          <div className="flex flex-col gap-0.5">
            <span className="r3-label">MASTER</span>
            <span className="r3-mono text-[9px] text-[var(--r3-signal)]">-3 dB</span>
          </div>
          <span className="r3-led r3-pulse" aria-hidden />
        </div>
      </div>
    </header>
  )
}
