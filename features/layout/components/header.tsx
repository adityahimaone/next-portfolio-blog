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

  const isDark = mounted && theme === 'dark'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b px-6 shadow-xl transition-all duration-300 md:px-10 overflow-hidden',
          isScrolled
            ? 'h-14 border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md'
            : 'h-16 border-transparent bg-[var(--background)]/50 backdrop-blur-lg',
        )}
      >
        {/* PCB Copper lines background detail */}
        <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-[0.03] z-0 text-[var(--foreground)]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 20 H 400 L 450 60 H 1000 M 200 0 V 84 L 230 114" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M 600 84 V 40 L 620 20 H 800" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="450" cy="60" r="3" fill="currentColor" />
            <circle cx="620" cy="20" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Left: Power Switch (Theme Toggle) */}
        <div className="flex items-start gap-4 md:gap-6 z-10">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleTheme}
              className="relative h-8 w-14 cursor-pointer rounded-md bg-[var(--muted)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-colors border border-[var(--border)]"
              aria-label="Toggle Theme"
            >
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <Sun size={12} className={cn("transition-opacity duration-300", isDark ? 'opacity-30' : 'opacity-100')} style={{ color: isDark ? 'var(--muted-foreground)' : 'var(--primary)' }} />
                <Moon size={12} className={cn("transition-opacity duration-300", isDark ? 'opacity-100' : 'opacity-30')} style={{ color: isDark ? 'var(--foreground)' : 'var(--muted-foreground)' }} />
              </div>
              <motion.div
                className="absolute top-1 bottom-1 w-6 rounded shadow-lg flex flex-col items-center justify-center gap-1 border border-white/10"
                style={{ backgroundColor: 'var(--primary)' }}
                initial={false}
                animate={{
                  x: isDark ? 28 : 2,
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              >
                {/* Grip lines for mixer feel */}
                <div className="h-0.5 w-3 bg-white/30 rounded-full" />
                <div className="h-0.5 w-3 bg-white/30 rounded-full" />
                <div className="h-0.5 w-3 bg-white/30 rounded-full" />
              </motion.div>
            </button>
            <span className="text-[8px] font-bold tracking-widest md:text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
              POWER
            </span>
          </div>
          <div className="relative mt-2 h-4 w-4 md:h-5 md:w-5">
            <div
              className={cn(
                'absolute inset-0 rounded-full transition-all duration-700',
                isDark
                  ? 'animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.9)]'
                  : 'shadow-inner',
              )}
              style={{
                backgroundColor: isDark ? '#f59e0b' : 'var(--muted)',
              }}
            />
            <div className="absolute top-1 left-1 h-1 w-1 rounded-full bg-white/50 md:top-1.5 md:left-1.5 md:h-1.5 md:w-1.5" />
          </div>
        </div>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden items-center gap-4 lg:flex xl:gap-8 z-10">
          {/* Section / Scroll Links as Knobs */}
          {scrollLinks.length > 0 && (
            <div className="flex items-center gap-4 xl:gap-8">
              {scrollLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex flex-col items-center gap-1.5"
                  onMouseEnter={() => setActiveKnob(item.name)}
                  onMouseLeave={() => setActiveKnob(null)}
                >
                  <div
                    className={cn(
                      'group-hover:border-[var(--primary)] relative transform cursor-pointer rounded-full border-2 shadow-lg transition-all group-hover:rotate-45',
                      isScrolled ? 'h-8 w-8' : 'h-10 w-10',
                    )}
                    style={{
                      borderColor: 'var(--border)',
                      background: isDark
                        ? 'linear-gradient(to bottom, var(--muted), #111111)'
                        : 'linear-gradient(to bottom, #ffffff, var(--muted))',
                    }}
                  >
                    <div className="absolute top-1 left-1/2 h-3 w-0.5 -translate-x-1/2" style={{ backgroundColor: 'var(--muted-foreground)' }} />
                    {/* Indicator Dot */}
                    <div className="absolute top-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundColor: 'var(--primary)' }} />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold tracking-widest transition-colors',
                      activeKnob === item.name ? 'text-[var(--primary)]' : '',
                    )}
                    style={{ color: activeKnob === item.name ? 'var(--primary)' : 'var(--muted-foreground)' }}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Page Links as Push Buttons (Grouped) */}
          {pageLinks.length > 0 && (
            <div className="flex items-center gap-4 border-l-2 pl-4 xl:gap-6 xl:pl-8" style={{ borderColor: 'var(--border)' }}>
              {pageLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex flex-col items-center gap-1.5"
                  onMouseEnter={() => setActiveKnob(item.name)}
                  onMouseLeave={() => setActiveKnob(null)}
                >
                  <div
                    className={cn(
                      'relative flex transform cursor-pointer flex-col items-center justify-end rounded-md border-2 shadow-lg transition-all group-hover:-translate-y-0.5 group-active:translate-y-1 group-active:shadow-inner',
                      isScrolled ? 'h-8 w-8 pb-1' : 'h-10 w-10 pb-1.5',
                    )}
                    style={{
                      borderColor: 'var(--border)',
                      background: isDark
                        ? 'linear-gradient(to bottom, var(--muted), #111111)'
                        : 'linear-gradient(to bottom, #ffffff, var(--muted))',
                    }}
                  >
                    {/* LED indicating 'page link' */}
                    <div
                      className={cn(
                        'h-1.5 w-5 rounded-full transition-colors',
                        ((pathname.startsWith(item.href) && item.href !== '/') ||
                          pathname === item.href)
                          ? 'shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                          : '',
                      )}
                      style={{
                        backgroundColor:
                          ((pathname.startsWith(item.href) && item.href !== '/') ||
                            pathname === item.href)
                            ? '#ef4444'
                            : isDark
                              ? 'rgba(239,68,68,0.3)'
                              : 'rgba(239,68,68,0.4)',
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold tracking-widest transition-colors',
                    )}
                    style={{
                      color:
                        activeKnob === item.name ||
                        ((pathname.startsWith(item.href) && item.href !== '/') ||
                          pathname === item.href)
                          ? 'var(--primary)'
                          : 'var(--muted-foreground)',
                    }}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="flex flex-col items-center gap-1 lg:hidden z-10">
          <button
            ref={toggleButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'relative transform cursor-pointer rounded-full border-2 shadow-lg transition-all',
              isScrolled ? 'h-9 w-9' : 'h-11 w-11',
              isOpen ? 'rotate-[135deg]' : 'rotate-0',
            )}
            style={{
              borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
              background: isDark
                ? 'linear-gradient(to bottom, var(--muted), #111111)'
                : 'linear-gradient(to bottom, #ffffff, var(--muted))',
            }}
            aria-label="Toggle Menu"
          >
            <div className="absolute top-1 left-1/2 h-3 w-0.5 -translate-x-1/2" style={{ backgroundColor: 'var(--muted-foreground)' }} />
            <div
              className={cn(
                'absolute top-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity',
                isOpen ? 'opacity-100' : 'opacity-0',
              )}
              style={{ backgroundColor: 'var(--primary)' }}
            />
          </button>
          <span className="text-[8px] font-bold tracking-widest md:text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
            MENU
          </span>
        </div>

        {/* Center-Right: DJ Control Platter Strip (Technics SL-1200 style controls) */}
        <div className="hidden xl:flex items-center gap-6 pr-6 z-10 select-none" style={{ borderRight: '1px solid var(--border)' }}>
          {/* Start/Stop Button */}
          <button
            onClick={togglePlay}
            className={cn(
              "h-8 px-3 rounded font-mono text-[9px] font-black border transition-all active:scale-95 shadow-sm flex items-center gap-2 cursor-pointer uppercase tracking-wider select-none",
              isPlaying
                ? "bg-green-500/10 border-green-500 text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                : "border-[var(--border)] text-[var(--muted-foreground)]",
            )}
            style={{
              backgroundColor: isPlaying ? undefined : isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
            }}
          >
            <div className={cn("h-1.5 w-1.5 rounded-full", isPlaying ? "bg-green-500 animate-pulse" : "")} style={{ backgroundColor: isPlaying ? undefined : 'var(--muted-foreground)' }} />
            START/STOP
          </button>

          {/* RPM speed LEDs */}
          <div className="flex gap-1.5 items-center">
            <div
              className={cn("w-1.5 h-1.5 rounded-full transition-colors", playbackRate < 1.1 ? "shadow-[0_0_4px_#f59e0b]" : "")}
              style={{ backgroundColor: playbackRate < 1.1 ? '#f59e0b' : 'var(--muted-foreground)' }}
            />
            <span className="font-mono text-[8px] font-bold" style={{ color: 'var(--muted-foreground)' }}>33</span>
            <div
              className={cn("w-1.5 h-1.5 rounded-full transition-colors", playbackRate >= 1.1 ? "shadow-[0_0_4px_#f59e0b]" : "")}
              style={{ backgroundColor: playbackRate >= 1.1 ? '#f59e0b' : 'var(--muted-foreground)' }}
            />
            <span className="font-mono text-[8px] font-bold" style={{ color: 'var(--muted-foreground)' }}>45</span>
          </div>

          {/* Pitch Control slider */}
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[8px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>PITCH</span>
            <div className="relative w-24 h-4 flex items-center justify-center">
              <div className="absolute w-full h-1 rounded-full shadow-inner" style={{ backgroundColor: isDark ? '#090909' : 'var(--muted)', borderColor: 'var(--border)' }} />
              <input
                type="range"
                min="80"
                max="120"
                value={Math.round(playbackRate * 100)}
                onChange={(e) => setPlaybackRate(Number(e.target.value) / 100)}
                className="absolute w-full h-4 opacity-0 cursor-ew-resize z-20"
              />
              {/* Silver visual handle track */}
              <div
                className="absolute w-3.5 h-2.5 border rounded shadow-sm pointer-events-none z-10"
                style={{
                  left: `calc(${((playbackRate - 0.8) / 0.4) * 100}% - 7px)`,
                  background: isDark
                    ? 'linear-gradient(to bottom, #3f3f46, #27272a)'
                    : 'linear-gradient(to bottom, #e4e4e7, #a1a1aa)',
                  borderColor: isDark ? '#52525b' : '#a1a1aa',
                }}
              >
                <div className="w-0.5 h-full bg-amber-500 mx-auto" />
              </div>
            </div>
            <span className="font-mono text-[8px] font-bold w-8 text-right" style={{ color: 'var(--muted-foreground)' }}>
              {playbackRate >= 1.0 ? `+${Math.round((playbackRate - 1.0)*100)}%` : `-${Math.round((1.0 - playbackRate)*100)}%`}
            </span>
          </div>
        </div>

        {/* Right: Input Jack */}
        <div className="hidden flex-col items-center gap-1.5 md:flex z-10">
          <div className="relative z-50">
            <button
              onClick={() => setIsPlugged(!isPlugged)}
              className={cn(
                'flex cursor-pointer items-center justify-center rounded-full border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all active:scale-95',
                isScrolled ? 'h-7 w-7' : 'h-9 w-9',
                isPlugged && 'shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]',
              )}
              style={{
                borderColor: 'var(--border)',
                backgroundColor: isDark ? 'var(--muted)' : '#e4e4e7',
              }}
              aria-label="Input Jack"
            >
              <div
                className={cn(
                  'rounded-full bg-black/90 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]',
                  isScrolled ? 'h-3 w-3' : 'h-4 w-4',
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
          <span className="text-[8px] font-bold tracking-widest md:text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
            INPUT
          </span>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <StaggeredMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={menuItems}
        colors={
          isDark
            ? ['#af50ff', '#7f56d9', '#271635']
            : ['#7f56d9', '#9b78e3', '#e8e0ff']
        }
        accentColor={isDark ? '#af50ff' : '#7f56d9'}
      />
    </>
  )
}
