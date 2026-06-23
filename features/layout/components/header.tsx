'use client'

import { useState, useEffect, useRef } from 'react'
import { m as motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Sun, Moon } from 'lucide-react'
import useClickOutside from '@/hooks/use-click-outside'
import { HOMEPAGE_NAV_ITEMS, SUBPAGE_NAV_ITEMS, SOCIAL_LINKS } from '../constants'
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

  const socialMenuItems = SOCIAL_LINKS.map((link) => ({
    label: link.name,
    link: link.href,
  }))

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeKnob, setActiveKnob] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const isScrolled = useScrollState()
  const [isPlugged, setIsPlugged] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  // Turntable global controls
  const { isPlaying, togglePlay, playbackRate, setPlaybackRate } = useAudio()

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
          'chassis-panel chassis-texture fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b px-4 shadow-xl transition-all duration-300 md:px-6 overflow-hidden',
          isScrolled
            ? 'border-zinc-300/60 dark:border-white/5 h-14 backdrop-blur-md'
            : 'border-zinc-300/30 dark:border-white/5 h-16 backdrop-blur-lg',
        )}
      >
        {/* ─── Rack-mount screw: LEFT ─── */}
        <Screw className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />

        {/* ─── Rack-mount screw: RIGHT ─── */}
        <Screw className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />

        {/* ═══════════════════ LEFT: Power Switch ═══════════════════ */}
        <div className="flex items-center gap-3 md:gap-4 md:pl-5">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleTheme}
              className="relative h-8 w-14 cursor-pointer rounded-md bg-zinc-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-colors dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800"
              aria-label="Toggle Theme"
            >
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <Sun size={12} className={cn("transition-opacity duration-300", mounted && theme === 'dark' ? 'opacity-30 text-zinc-600' : 'opacity-100 text-[#273281]')} />
                <Moon size={12} className={cn("transition-opacity duration-300", mounted && theme === 'dark' ? 'opacity-100 text-[#f8fafc]' : 'opacity-30 text-zinc-600')} />
              </div>
              <motion.div
                className="absolute top-1 bottom-1 w-6 bg-primary rounded shadow-lg flex flex-col items-center justify-center gap-1 border border-white/10 dark:bg-[#3a4699]"
                initial={false}
                animate={{
                  x: mounted && theme === 'dark' ? 28 : 2,
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              >
                {/* Grip lines for mixer feel */}
                <div className="h-0.5 w-3 bg-white/30 rounded-full" />
                <div className="h-0.5 w-3 bg-white/30 rounded-full" />
                <div className="h-0.5 w-3 bg-white/30 rounded-full" />
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
                      'px-2.5 py-1.5 border border-transparent rounded-sm transition-all duration-150 cursor-pointer',
                      'bg-white/60 dark:bg-zinc-900/80',
                      'group-hover:bg-zinc-100 group-hover:border-zinc-200 dark:group-hover:bg-zinc-800/90 dark:group-hover:border-zinc-700',
                      isScrolled ? 'py-1' : 'py-1.5',
                    )}
                  >
                    <span
                      className={cn(
                        'font-mono text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-colors select-none',
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
                      'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-200',
                      activeKnob === item.name ? 'w-4/5 opacity-100' : 'w-0 opacity-0',
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
                        'flex flex-col items-center gap-1 px-2.5 border border-transparent rounded-sm transition-all duration-150 cursor-pointer',
                        'bg-white/60 dark:bg-zinc-900/80',
                        'group-hover:bg-zinc-100 group-hover:border-zinc-200 dark:group-hover:bg-zinc-800/90 dark:group-hover:border-zinc-700',
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
                          'font-mono text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-colors select-none',
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
                        'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-200',
                        activeKnob === item.name ? 'w-4/5 opacity-100' : 'w-0 opacity-0',
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
          <div className="hidden xl:flex items-center gap-3">
            {/* Play/Pause with LED */}
            <button
              onClick={togglePlay}
              className={cn(
                'relative h-7 w-7 rounded-md border cursor-pointer transition-all active:scale-95 flex items-center justify-center shadow-sm',
                isPlaying
                  ? 'bg-green-500/10 border-green-500/60 shadow-[0_0_6px_rgba(34,197,94,0.25)]'
                  : 'bg-white/40 dark:bg-black/40 border-zinc-300 dark:border-zinc-700',
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {/* LED */}
              <div
                className={cn(
                  'absolute -top-0.5 right-0.5 h-1.5 w-1.5 rounded-full transition-all',
                  isPlaying
                    ? 'bg-green-400 shadow-[0_0_4px_rgba(34,197,94,0.8)] animate-pulse'
                    : 'bg-zinc-500/40',
                )}
              />
              {isPlaying ? (
                <svg width="10" height="10" viewBox="0 0 10 10" className="text-green-500">
                  <rect x="1" y="1" width="3" height="8" fill="currentColor" rx="0.5" />
                  <rect x="6" y="1" width="3" height="8" fill="currentColor" rx="0.5" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" className="text-zinc-500 dark:text-zinc-400">
                  <polygon points="2,1 9,5 2,9" fill="currentColor" />
                </svg>
              )}
            </button>

            {/* BPM readout */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-mono text-[10px] font-black text-zinc-700 dark:text-zinc-300 tabular-nums tracking-tight">
                {bpm}
              </span>
              <span className="font-mono text-[6px] font-bold uppercase tracking-widest text-zinc-500">
                BPM
              </span>
            </div>
          </div>

          {/* Separator before input jack */}
          <div className="hidden md:block h-6 border-l border-zinc-300/50 dark:border-zinc-700/50" />

          {/* Input jack (desktop only) */}
          <div className="hidden flex-col items-center gap-1 md:flex">
            <div className="relative z-50">
              <button
                onClick={() => setIsPlugged(!isPlugged)}
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-full border-2 border-zinc-300 bg-zinc-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all active:scale-95 dark:border-zinc-700 dark:bg-zinc-800',
                  isScrolled ? 'h-7 w-7' : 'h-8 w-8',
                  isPlugged && 'shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]',
                )}
                aria-label="Input Jack"
              >
                <div
                  className={cn(
                    'rounded-full bg-black/90 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]',
                    isScrolled ? 'h-2.5 w-2.5' : 'h-3 w-3',
                  )}
                />
              </button>

              {/* Cable Animation */}
              <AnimatePresence>
                {isPlugged && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 10, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2"
                  >
                    <div className="flex flex-col items-center">
                      {/* Gold Connector Body (Sleeve) */}
                      <div className="h-4 w-3 rounded-t-sm border-b border-amber-700/30 bg-linear-to-r from-amber-200 via-amber-400 to-amber-600 shadow-sm" />

                      {/* Insulator Ring */}
                      <div className="h-0.5 w-3 bg-black" />

                      {/* Handle / Grip */}
                      <div className="flex h-10 w-4 flex-col items-center justify-between rounded-b-md border-t border-white/10 bg-linear-to-r from-zinc-700 via-zinc-800 to-zinc-900 py-1 shadow-xl">
                        <div className="h-px w-full bg-black/30" />
                        <div className="h-px w-full bg-black/30" />
                        <div className="h-px w-full bg-black/30" />
                      </div>

                      {/* Strain Relief */}
                      <div className="-mt-1 h-4 w-2.5 rounded-b-full bg-zinc-900" />

                      {/* Cable */}
                      <div className="relative h-0 w-0">
                        <svg className="pointer-events-none absolute top-0 left-0 h-[500px] w-[500px] overflow-visible drop-shadow-2xl">
                          <path
                            d="M 0 0 C 0 80, 40 150, 500 300"
                            fill="none"
                            stroke="#18181b"
                            strokeWidth="6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-[8px] font-bold tracking-widest text-zinc-600 md:text-[10px] dark:text-zinc-400">
              INPUT
            </span>
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
          theme === 'dark' ? ['#f59e0b', '#3a4699', '#1e2866'] : ['#273281', '#3d468b', '#e2e8f0']
        }
        accentColor={theme === 'dark' ? '#f59e0b' : '#273281'}
      />
    </>
  )
}
