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

// Map nav item names to channel colors (Console 1 style)
const NAV_COLORS: Record<string, string> = {
  HOME:     '#C84B4B',
  ABOUT:    '#D4864A',
  SKILLS:   '#C9A447',
  EXP:      '#7ABB5E',
  WORK:     '#4A9EC9',
  CONTACT:  '#8A5FC9',
  BLOG:     '#C95FAA',
  PROJECTS: '#5FC9C9',
  MIXTAPE:  '#C9A447',
}

export function HeaderDaw() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const navItems = isHomepage ? HOMEPAGE_NAV_ITEMS : SUBPAGE_NAV_ITEMS

  const menuItems = navItems.map((item) => ({ label: item.name, link: item.href }))
  const socialMenuItems = SOCIAL_LINKS.map((link) => ({ label: link.name, link: link.href }))

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const isScrolled = useScrollState()
  const [isPlugged, setIsPlugged] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const { isPlaying, togglePlay, playbackRate } = useAudio()

  useClickOutside(mobileMenuRef, (e) => {
    if (isOpen && toggleButtonRef.current && !toggleButtonRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  })
  useEffect(() => { setMounted(true) }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const bpm = Math.round(playbackRate * 120)

  // Current section display (mini LCD readout)
  const activeName = navItems.find(
    (item) => item.href === pathname || pathname.startsWith(item.href + '/'),
  )?.name ?? 'HOME'

  return (
    <>
      <header
        className={cn(
          // DAW chassis — same color as hero faceplate
          'fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 md:px-6 overflow-hidden',
          'border-b transition-all duration-300',
          'bg-[var(--daw-chassis)] dark:bg-[var(--daw-chassis)]',
          isScrolled
            ? 'h-14 border-black/20 dark:border-black/50 backdrop-blur-md'
            : 'h-16 border-black/10 dark:border-black/40 backdrop-blur-lg',
          // Brushed texture  
          'before:pointer-events-none before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.01)_3px,rgba(0,0,0,0.01)_4px)]',
        )}
      >
        {/* Rack screws */}
        <Screw className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
        <Screw className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />

        {/* ══ LEFT: Power Switch + LED ══ */}
        <div className="flex items-center gap-3 md:gap-4 md:pl-6">
          {/* Theme toggle — horizontal fader style */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={toggleTheme}
              className={cn(
                'relative h-7 w-14 cursor-pointer rounded-sm',
                'bg-[var(--daw-chassis-deep)] dark:bg-[var(--daw-chassis-deep)]',
                'border border-black/20 dark:border-black/50',
                'shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]',
              )}
              aria-label="Toggle Theme"
            >
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <Sun size={11} className={cn('transition-opacity', mounted && theme === 'dark' ? 'opacity-25 text-black/60 dark:text-white/20' : 'opacity-100 text-amber-600')} />
                <Moon size={11} className={cn('transition-opacity', mounted && theme === 'dark' ? 'opacity-100 text-indigo-300' : 'opacity-25 text-black/40')} />
              </div>
              <motion.div
                className={cn(
                  'absolute top-1 bottom-1 w-6 rounded-[2px]',
                  'bg-gradient-to-b from-[#B8B9C4] to-[#7B7C84]',
                  'border border-black/20',
                  'shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]',
                  'flex flex-col items-center justify-center gap-0.5',
                )}
                initial={false}
                animate={{ x: mounted && theme === 'dark' ? 28 : 2 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              >
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-px w-3 bg-black/20 rounded-full" />
                ))}
              </motion.div>
            </button>
            <span className="font-mono text-[7px] font-bold tracking-widest text-black/40 dark:text-white/25 uppercase">
              POWER
            </span>
          </div>

          {/* LED indicator */}
          <div className="relative h-3 w-3">
            <div
              className={cn(
                'absolute inset-0 rounded-full transition-all duration-700',
                mounted && theme === 'dark'
                  ? 'animate-pulse bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                  : 'bg-black/20',
              )}
            />
          </div>
        </div>

        {/* ══ CENTER: Nav channel strips (desktop) ══ */}
        <nav className="hidden lg:flex items-stretch gap-px h-full py-2">
          {navItems.map((item) => {
            const isActive = item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href))
            const color = NAV_COLORS[item.name] ?? '#C9A447'

            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHoveredNav(item.name)}
                onMouseLeave={() => setHoveredNav(null)}
                className={cn(
                  'relative flex flex-col items-center justify-between px-2.5 py-1 rounded-[3px]',
                  'border transition-all duration-150 cursor-pointer',
                  'shadow-[0_2px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]',
                  isActive || hoveredNav === item.name
                    ? 'border-black/25 dark:border-white/15 bg-black/8 dark:bg-white/8'
                    : 'border-black/10 dark:border-white/5 bg-[var(--daw-chassis-raised)] dark:bg-[var(--daw-chassis-raised)]',
                )}
              >
                {/* LED dot at top */}
                <div
                  className="h-1.5 w-1.5 rounded-full transition-all"
                  style={{
                    background: isActive ? color : 'var(--daw-led-off)',
                    boxShadow: isActive ? `0 0 5px ${color}, 0 0 8px ${color}` : 'none',
                  }}
                />
                {/* Label */}
                <span
                  className="font-mono text-[7px] md:text-[8px] font-bold uppercase tracking-widest transition-colors select-none"
                  style={{ color: isActive || hoveredNav === item.name ? color : undefined }}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* ══ CENTER-RIGHT: Mini LCD readout (desktop only) ══ */}
        <div className="hidden xl:flex flex-col items-center ml-4">
          <div
            className={cn(
              'px-3 py-1 rounded-[3px]',
              'bg-[#0A0A0C]',
              'border border-black/40',
              'shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]',
            )}
          >
            <span
              className="font-mono text-[10px] font-bold tracking-widest tabular-nums uppercase"
              style={{
                color: '#22C55E',
                textShadow: '0 0 6px #22C55E, 0 0 10px #22C55E',
              }}
            >
              {activeName.padEnd(8, '\u00A0')}
            </span>
          </div>
          <span className="font-mono text-[6px] tracking-widest text-black/30 dark:text-white/20 uppercase mt-0.5">
            SECTION
          </span>
        </div>

        {/* ══ RIGHT: Transport + BPM + Jack ══ */}
        <div className="flex items-center gap-3 md:gap-4 md:pr-6">
          {/* Play button */}
          <div className="hidden xl:flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={cn(
                'relative h-7 w-7 rounded-[3px] border cursor-pointer transition-all active:scale-95',
                'flex items-center justify-center',
                'shadow-[0_2px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-px',
                isPlaying
                  ? 'border-[#22C55E]/40 bg-[#22C55E]/10'
                  : 'border-black/20 dark:border-white/10 bg-[var(--daw-chassis-raised)]',
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <div
                className={cn(
                  'absolute -top-0.5 right-0.5 h-1.5 w-1.5 rounded-full transition-all',
                  isPlaying
                    ? 'bg-[#22C55E] shadow-[0_0_4px_rgba(34,197,94,0.8)] animate-pulse'
                    : 'bg-black/20 dark:bg-white/10',
                )}
              />
              {isPlaying ? (
                <svg width="10" height="10" viewBox="0 0 10 10" className="text-[#22C55E]">
                  <rect x="1" y="1" width="3" height="8" fill="currentColor" rx="0.5" />
                  <rect x="6" y="1" width="3" height="8" fill="currentColor" rx="0.5" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" className="text-black/40 dark:text-white/30">
                  <polygon points="2,1 9,5 2,9" fill="currentColor" />
                </svg>
              )}
            </button>

            <div className="flex flex-col items-center gap-0">
              <span className="font-mono text-[10px] font-black tabular-nums text-black/60 dark:text-white/50">{bpm}</span>
              <span className="font-mono text-[6px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20">BPM</span>
            </div>
          </div>

          <div className="hidden md:block h-5 border-l border-black/15 dark:border-white/8" />

          {/* INPUT jack */}
          <div className="hidden flex-col items-center gap-0.5 md:flex">
            <div className="relative">
              <button
                onClick={() => setIsPlugged((p) => !p)}
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-full border-2 transition-all active:scale-95',
                  'border-black/25 dark:border-white/10 bg-[var(--daw-chassis-deep)] dark:bg-[var(--daw-chassis-deep)]',
                  'shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]',
                  isScrolled ? 'h-7 w-7' : 'h-8 w-8',
                )}
                aria-label="Input Jack"
              >
                <div className={cn('rounded-full bg-black/80 shadow-inner', isScrolled ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
              </button>

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
                      <div className="h-4 w-3 rounded-t-sm bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 border-b border-amber-700/30" />
                      <div className="h-0.5 w-3 bg-black" />
                      <div className="flex h-10 w-4 flex-col items-center justify-between rounded-b-md bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-900 py-1 shadow-xl border-t border-white/10">
                        {[0,1,2].map(i => <div key={i} className="h-px w-full bg-black/30" />)}
                      </div>
                      <div className="-mt-1 h-4 w-2.5 rounded-b-full bg-zinc-900" />
                      <div className="relative h-0 w-0">
                        <svg className="pointer-events-none absolute top-0 left-0 h-[500px] w-[500px] overflow-visible">
                          <path d="M 0 0 C 0 80, 40 150, 500 300" fill="none" stroke="#18181b" strokeWidth="6" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="font-mono text-[7px] font-bold tracking-widest text-black/35 dark:text-white/20 uppercase">INPUT</span>
          </div>

          {/* Mobile: hamburger */}
          <div className="flex flex-col items-center gap-0.5 lg:hidden">
            <button
              ref={toggleButtonRef}
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'relative cursor-pointer rounded-full border-2 transition-all',
                'border-black/20 dark:border-white/10',
                'bg-gradient-to-b from-[var(--daw-chassis-raised)] to-[var(--daw-chassis-mid)]',
                'shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
                isScrolled ? 'h-9 w-9' : 'h-11 w-11',
                isOpen && 'border-[#C9A447]/60 rotate-[135deg]',
              )}
              aria-label="Toggle Menu"
            >
              <div className="absolute top-1 left-1/2 h-3 w-0.5 -translate-x-1/2 bg-black/30 dark:bg-white/20" />
              <div
                className={cn(
                  'absolute top-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity',
                  isOpen ? 'bg-[#C9A447] opacity-100' : 'opacity-0',
                )}
              />
            </button>
            <span className="font-mono text-[7px] font-bold tracking-widest text-black/35 dark:text-white/20 uppercase">MENU</span>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <StaggeredMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={menuItems}
        colors={theme === 'dark' ? ['#f59e0b', '#3a4699', '#1e2866'] : ['#273281', '#3d468b', '#e2e8f0']}
        accentColor={theme === 'dark' ? '#f59e0b' : '#273281'}
      />
    </>
  )
}
