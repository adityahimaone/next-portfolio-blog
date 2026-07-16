'use client'

import { useState, useEffect, useRef } from 'react'
import { m as motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Sun, Moon } from 'lucide-react'
import useClickOutside from '@/hooks/use-click-outside'
import { HOMEPAGE_NAV_ITEMS, SUBPAGE_NAV_ITEMS } from '../constants'
import { useScrollState } from '../hooks/use-scroll-state'
import { StaggeredMenu } from './staggered-menu/staggered-menu'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { Screw } from '@/components/screw'

export function Header() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const navItems = isHomepage ? HOMEPAGE_NAV_ITEMS : SUBPAGE_NAV_ITEMS

  const pageLinks = navItems.filter(
    (item) =>
      !item.href.startsWith('/#') && (isHomepage ? item.href !== '/' : true),
  )
  const scrollLinks = navItems.filter((item) => !pageLinks.includes(item))

  const menuItems = navItems.map((item) => ({
    label: item.name,
    link: item.href,
  }))

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeKnob, setActiveKnob] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const isScrolled = useScrollState()

  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  // Turntable global controls
  const { isPlaying, togglePlay, playbackRate } = useAudio()

  useClickOutside(mobileMenuRef, (e) => {
    if (
      isOpen &&
      toggleButtonRef.current &&
      !toggleButtonRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false)
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const bpm = Math.round(playbackRate * 120)

  return (
    <>
      <header
        className={cn(
          'chassis-panel chassis-texture fixed top-0 right-0 left-0 z-50 flex items-center justify-between overflow-hidden border-b px-4 shadow-xl transition-all duration-300 md:px-6',
          isScrolled
            ? 'h-14 border-zinc-300/60 backdrop-blur-md dark:border-white/5'
            : 'h-16 border-zinc-300/30 backdrop-blur-lg dark:border-white/5',
        )}
      >
        {/* ─── Rack-mount screw: LEFT ─── */}
        <Screw className="absolute top-1/2 left-2 z-10 hidden -translate-y-1/2 md:flex" />

        {/* ─── Rack-mount screw: RIGHT ─── */}
        <Screw className="absolute top-1/2 right-2 z-10 hidden -translate-y-1/2 md:flex" />

        {/* ═══════════════════ LEFT: Power Switch ═══════════════════ */}
        <div className="flex items-center gap-3 md:gap-4 md:pl-5">
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="relative h-8 w-14 cursor-pointer overflow-hidden rounded-md border border-zinc-300 bg-zinc-200 p-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-colors dark:border-zinc-800 dark:bg-zinc-900"
              aria-label="Toggle theme"
              aria-pressed={mounted && theme === 'dark'}
            >
              <div className="pointer-events-none absolute inset-y-0 right-2 left-2 flex items-center justify-between">
                {mounted && theme === 'dark' ? (
                  <Sun size={12} className="text-zinc-600" aria-hidden="true" />
                ) : (
                  <span />
                )}
                {mounted && theme !== 'dark' ? (
                  <Moon
                    size={12}
                    className="text-zinc-600"
                    aria-hidden="true"
                  />
                ) : (
                  <span />
                )}
              </div>
              <motion.div
                className="bg-primary absolute top-1 bottom-1 left-0.5 z-10 flex w-6 items-center justify-center rounded border border-white/10 shadow-lg dark:bg-[#3a4699]"
                initial={false}
                animate={{
                  x: mounted && theme === 'dark' ? 28 : 0,
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {mounted && theme === 'dark' ? (
                  <Moon size={12} className="text-white" aria-hidden="true" />
                ) : (
                  <Sun size={12} className="text-white" aria-hidden="true" />
                )}
              </motion.div>
            </button>
            <span className="text-[8px] font-bold tracking-widest text-zinc-600 md:text-[10px] dark:text-zinc-400">
              POWER
            </span>
          </div>
          {/* LED indicator dot */}
          <div className="relative h-3 w-3 md:h-3.5 md:w-3.5">
            <div
              className={cn(
                'absolute inset-0 rounded-full transition-all duration-700',
                mounted && theme === 'dark'
                  ? 'animate-pulse bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                  : 'bg-zinc-400/60 shadow-inner',
              )}
            />
            <div className="absolute top-0.5 left-0.5 h-1 w-1 rounded-full bg-white/40" />
          </div>
        </div>

        {/* ═══════════════════ CENTER: Channel Strip Nav (Desktop) ═══════════════════ */}
        <nav className="hidden items-center gap-0 lg:flex">
          {/* Scroll Links — scribble strip labels */}
          {scrollLinks.length > 0 && (
            <div className="flex items-center gap-px">
              {scrollLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group relative"
                  onMouseEnter={() => setActiveKnob(item.name)}
                  onMouseLeave={() => setActiveKnob(null)}
                >
                  <div
                    className={cn(
                      'cursor-pointer rounded-sm border border-transparent px-2.5 py-1.5 transition-all duration-150',
                      'bg-white/60 dark:bg-zinc-900/80',
                      'group-hover:border-zinc-200 group-hover:bg-zinc-100 dark:group-hover:border-zinc-700 dark:group-hover:bg-zinc-800/90',
                      isScrolled ? 'py-1' : 'py-1.5',
                    )}
                  >
                    <span
                      className={cn(
                        'font-mono text-[8px] font-bold tracking-widest uppercase transition-colors select-none md:text-[9px]',
                        activeKnob === item.name
                          ? 'text-primary'
                          : 'text-zinc-600 dark:text-zinc-400',
                      )}
                    >
                      {item.name}
                    </span>
                  </div>
                  {/* Active hover indicator line */}
                  <div
                    className={cn(
                      'bg-primary absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full transition-all duration-200',
                      activeKnob === item.name
                        ? 'w-4/5 opacity-100'
                        : 'w-0 opacity-0',
                    )}
                  />
                </Link>
              ))}
            </div>
          )}

          {/* Separator */}
          {scrollLinks.length > 0 && pageLinks.length > 0 && (
            <div className="mx-2 h-6 border-l border-zinc-300 dark:border-zinc-700" />
          )}

          {/* Page Links — scribble strips with LED dot */}
          {pageLinks.length > 0 && (
            <div className="flex items-center gap-px">
              {pageLinks.map((item) => {
                const isActive =
                  (pathname.startsWith(item.href) && item.href !== '/') ||
                  pathname === item.href

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group relative"
                    onMouseEnter={() => setActiveKnob(item.name)}
                    onMouseLeave={() => setActiveKnob(null)}
                  >
                    <div
                      className={cn(
                        'flex cursor-pointer flex-col items-center gap-1 rounded-sm border border-transparent px-2.5 transition-all duration-150',
                        'bg-white/60 dark:bg-zinc-900/80',
                        'group-hover:border-zinc-200 group-hover:bg-zinc-100 dark:group-hover:border-zinc-700 dark:group-hover:bg-zinc-800/90',
                        isScrolled ? 'py-0.5' : 'py-1',
                      )}
                    >
                      {/* LED dot */}
                      <div
                        className={cn(
                          'h-1.5 w-1.5 rounded-full transition-all',
                          isActive
                            ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                            : 'bg-red-900/30 group-hover:bg-red-600/50',
                        )}
                      />
                      <span
                        className={cn(
                          'font-mono text-[8px] font-bold tracking-widest uppercase transition-colors select-none md:text-[9px]',
                          isActive || activeKnob === item.name
                            ? 'text-primary'
                            : 'text-zinc-600 dark:text-zinc-400',
                        )}
                      >
                        {item.name}
                      </span>
                    </div>
                    {/* Active hover indicator line */}
                    <div
                      className={cn(
                        'bg-primary absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full transition-all duration-200',
                        activeKnob === item.name
                          ? 'w-4/5 opacity-100'
                          : 'w-0 opacity-0',
                      )}
                    />
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* ═══════════════════ RIGHT: Transport + Input ═══════════════════ */}
        <div className="flex items-center gap-3 md:gap-4 md:pr-5">
          {/* Transport Controls (desktop only) */}
          <div className="hidden items-center gap-3 xl:flex">
            {/* Play/Pause with LED */}
            <button
              onClick={togglePlay}
              className={cn(
                'relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border shadow-sm transition-all active:scale-95',
                isPlaying
                  ? 'border-green-500/60 bg-green-500/10 shadow-[0_0_6px_rgba(34,197,94,0.25)]'
                  : 'border-zinc-300 bg-white/40 dark:border-zinc-700 dark:bg-black/40',
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {/* LED */}
              <div
                className={cn(
                  'absolute -top-0.5 right-0.5 h-1.5 w-1.5 rounded-full transition-all',
                  isPlaying
                    ? 'animate-pulse bg-green-400 shadow-[0_0_4px_rgba(34,197,94,0.8)]'
                    : 'bg-zinc-500/40',
                )}
              />
              {isPlaying ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className="text-green-500"
                >
                  <rect
                    x="1"
                    y="1"
                    width="3"
                    height="8"
                    fill="currentColor"
                    rx="0.5"
                  />
                  <rect
                    x="6"
                    y="1"
                    width="3"
                    height="8"
                    fill="currentColor"
                    rx="0.5"
                  />
                </svg>
              ) : (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className="text-zinc-500 dark:text-zinc-400"
                >
                  <polygon points="2,1 9,5 2,9" fill="currentColor" />
                </svg>
              )}
            </button>

            {/* BPM readout */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-mono text-[10px] font-black tracking-tight text-zinc-700 tabular-nums dark:text-zinc-300">
                {bpm}
              </span>
              <span className="font-mono text-[6px] font-bold tracking-widest text-zinc-500 uppercase">
                BPM
              </span>
            </div>
          </div>

          {/* ═══════════════════ Mobile: Menu Toggle ═══════════════════ */}
          <div className="flex flex-col items-center gap-1 lg:hidden">
            <button
              ref={toggleButtonRef}
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'relative transform cursor-pointer rounded-full border-2 border-zinc-300 bg-linear-to-b from-zinc-100 to-zinc-300 shadow-lg transition-all dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900',
                isScrolled ? 'h-9 w-9' : 'h-11 w-11',
                isOpen ? 'border-primary rotate-135' : 'rotate-0',
              )}
              aria-label="Toggle Menu"
            >
              <div className="absolute top-1 left-1/2 h-3 w-0.5 -translate-x-1/2 bg-zinc-400 dark:bg-zinc-500" />
              <div
                className={cn(
                  'bg-primary absolute top-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity',
                  isOpen ? 'opacity-100' : 'opacity-0',
                )}
              />
            </button>
            <span className="text-[8px] font-bold tracking-widest text-zinc-600 md:text-[10px] dark:text-zinc-400">
              MENU
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <StaggeredMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={menuItems}
        colors={
          theme === 'dark'
            ? ['#f59e0b', '#3a4699', '#1e2866']
            : ['#273281', '#3d468b', '#e2e8f0']
        }
        accentColor={theme === 'dark' ? '#f59e0b' : '#273281'}
      />
    </>
  )
}
