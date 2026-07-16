'use client'

import { useState, useEffect, useLayoutEffect, useRef, Fragment } from 'react'
import { m as motion, useReducedMotion } from 'motion/react'
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

const NAV_COLORS: Record<string, string> = {
  HOME: '#D6AD45',
  ABOUT: '#D4864A',
  SKILLS: '#C9A447',
  EXP: '#7ABB5E',
  WORK: '#4A9EC9',
  CONTACT: '#8A5FC9',
  BLOG: '#C95FAA',
  PROJECTS: '#5FC9C9',
  MIXTAPE: '#C9A447',
}

interface TrackLcdProps {
  activeName: string
  currentTrack: string
  isPlaying: boolean
  shouldReduceMotion: boolean | null
}

function TrackLcd({
  activeName,
  currentTrack,
  isPlaying,
  shouldReduceMotion,
}: TrackLcdProps) {
  const label = isPlaying ? currentTrack : activeName
  const viewportRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useLayoutEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current
      const text = measureRef.current

      setIsOverflowing(
        Boolean(
          isPlaying &&
            viewport &&
            text &&
            text.getBoundingClientRect().width > viewport.clientWidth + 1,
        ),
      )
    }

    measure()

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)
    if (viewportRef.current) observer.observe(viewportRef.current)

    return () => observer.disconnect()
  }, [isPlaying, label])

  // Keep long track names moving even while the spring is still expanding the LCD.
  const isLongTitle = isPlaying && label.length > 24
  const shouldMarquee =
    isPlaying && !shouldReduceMotion && (isOverflowing || isLongTitle)

  return (
    <motion.div
      layout
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 420, damping: 36 }
      }
      className={cn(
        'hidden h-8 min-w-0 items-center rounded-sm border border-[#7abb5e]/25 bg-[#090c0b]/90 px-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] lg:flex xl:px-2.5',
        isPlaying ? 'w-[min(18rem,28vw)]' : 'w-auto',
      )}
      title={label}
      aria-live={isPlaying ? 'polite' : undefined}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <i
          className={cn(
            'h-1 w-1 shrink-0 rounded-full',
            isPlaying ? 'bg-[#7abb5e] shadow-[0_0_6px_#7abb5e]' : 'bg-white/25',
          )}
        />
        <div ref={viewportRef} className="relative min-w-0 overflow-hidden">
          <span
            ref={measureRef}
            aria-hidden="true"
            className="invisible absolute w-max font-mono text-[8px] font-bold tracking-[0.12em] whitespace-nowrap xl:text-[9px]"
          >
            {label}
          </span>
          {shouldMarquee ? (
            <div
              key={label}
              className="animate-marquee flex w-max font-mono text-[8px] font-bold tracking-[0.12em] whitespace-nowrap text-[#98d887] [text-shadow:0_0_7px_rgba(122,187,94,0.8)] motion-reduce:animate-none xl:text-[9px]"
              style={{
                animationDuration: `${Math.max(14, label.length * 0.28)}s`,
              }}
            >
              <span className="shrink-0 pr-8">{label}</span>
              <span aria-hidden="true" className="shrink-0 pr-8">
                {label}
              </span>
            </div>
          ) : (
            <span className="block truncate font-mono text-[8px] font-bold tracking-[0.12em] whitespace-nowrap text-[#98d887] [text-shadow:0_0_7px_rgba(122,187,94,0.8)] xl:text-[9px]">
              {label}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function HeaderDaw() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const navItems = isHomepage ? HOMEPAGE_NAV_ITEMS : SUBPAGE_NAV_ITEMS
  const menuItems = navItems.map((item) => ({
    label: item.name,
    link: item.href,
  }))

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const isScrolled = useScrollState()

  const shouldReduceMotion = useReducedMotion()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const { isPlaying, togglePlay, playbackRate, currentTrack } = useAudio()

  useClickOutside(mobileMenuRef, (event) => {
    if (
      isOpen &&
      toggleButtonRef.current &&
      !toggleButtonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const bpm = Math.round(playbackRate * 120)
  const activeName =
    navItems.find(
      (item) => item.href === pathname || pathname.startsWith(item.href + '/'),
    )?.name ?? 'HOME'

  const controlClassName =
    'relative isolate flex items-center justify-center border border-white/10 bg-[#1c2020]/85 text-white/65 shadow-[inset_0_1px_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.28)] transition-[transform,border-color,background-color,box-shadow] duration-150 ease-out hover:border-[#d6ad45]/45 hover:bg-[#292d2d]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e0b75a]/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101212] active:translate-y-px active:scale-[0.97] motion-reduce:transition-none'

  return (
    <>
      <header
        className={cn(
          'fixed top-2 right-2 left-2 z-50 overflow-hidden rounded-md border border-white/10 bg-[#121516]/84 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[height,box-shadow] duration-200 ease-out motion-reduce:transition-none md:top-3 md:right-4 md:left-4',
          isScrolled
            ? 'h-12 shadow-[0_9px_22px_rgba(0,0,0,0.34),inset_0_1px_rgba(255,255,255,0.08)]'
            : 'h-14',
        )}
      >
        {/* Brushed faceplate and edge lighting are decorative only. */}
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgba(255,255,255,0.025)_4px),linear-gradient(90deg,rgba(224,183,90,0.08),transparent_18%,transparent_82%,rgba(122,187,94,0.06))]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/70" />

        <Screw className="pointer-events-none absolute top-1/2 left-2 z-10 hidden -translate-y-1/2 scale-75 opacity-65 md:flex" />
        <Screw className="pointer-events-none absolute top-1/2 right-2 z-10 hidden -translate-y-1/2 scale-75 opacity-65 md:flex" />

        <div className="relative z-10 grid h-full grid-cols-[auto_1fr_auto] items-center gap-2 px-2 sm:gap-3 sm:px-3 md:px-7">
          {/* Power / theme bay */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden h-5 w-px bg-white/10 sm:block" />
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                controlClassName,
                'relative h-8 w-11 overflow-hidden rounded-sm p-0.5 sm:w-12',
              )}
              aria-label="Toggle theme"
              aria-pressed={mounted && theme === 'dark'}
            >
              <span className="pointer-events-none absolute top-1/2 right-1 left-1 z-0 h-px -translate-y-1/2 bg-black/60 shadow-[0_1px_rgba(255,255,255,0.08)]" />
              <span className="pointer-events-none absolute inset-y-0 right-1.5 left-1.5 z-0 flex items-center justify-between">
                {mounted && theme === 'dark' ? (
                  <Sun size={11} className="text-white/60" aria-hidden="true" />
                ) : (
                  <span />
                )}
                {mounted && theme !== 'dark' ? (
                  <Moon
                    size={11}
                    className="text-white/60"
                    aria-hidden="true"
                  />
                ) : (
                  <span />
                )}
              </span>
              <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <motion.span
                  className="absolute top-1 bottom-1 flex w-4 items-center justify-center rounded-[2px] border border-white/15 bg-gradient-to-b from-[#aeb4af] to-[#59605c] shadow-[0_1px_2px_rgba(0,0,0,0.6),inset_0_1px_rgba(255,255,255,0.3)]"
                  initial={false}
                  animate={{ x: mounted && theme === 'dark' ? 10 : -10 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 500, damping: 34 }
                  }
                >
                  {mounted && theme === 'dark' ? (
                    <Moon
                      size={10}
                      className="text-[#263837]"
                      aria-hidden="true"
                    />
                  ) : (
                    <Sun
                      size={10}
                      className="text-[#7a5b1d]"
                      aria-hidden="true"
                    />
                  )}
                </motion.span>
              </span>
            </button>
            <div className="hidden flex-col leading-none sm:flex">
              <span className="font-mono text-[7px] font-bold tracking-[0.18em] text-white/50">
                STUDIO BUS
              </span>
              <span className="mt-1 flex items-center gap-1.5 font-mono text-[6px] tracking-[0.14em] text-white/30">
                <i className="h-1 w-1 rounded-full bg-[#d6ad45] shadow-[0_0_5px_#e0b75a]" />
                ONLINE
              </span>
            </div>
          </div>

          {/* Central rack navigation */}
          <nav
            className="hidden min-w-0 items-center justify-center gap-1 lg:flex"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === pathname ||
                (item.href !== '/' && pathname.startsWith(item.href))
              const color = NAV_COLORS[item.name] ?? '#D6AD45'
              const isPageMenuStart = item.name === 'BLOG'

              return (
                <Fragment key={item.name}>
                  {isPageMenuStart && (
                    <span
                      aria-hidden="true"
                      className="mx-1 h-6 w-px bg-[#e0b75a]/35"
                    />
                  )}
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHoveredNav(item.name)}
                    onMouseLeave={() => setHoveredNav(null)}
                    className={cn(
                      'group relative flex h-8 min-w-12 flex-col justify-center overflow-hidden rounded-sm border px-2 font-mono text-[8px] font-bold tracking-[0.13em] uppercase transition-[transform,border-color,background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#e0b75a]/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101212] focus-visible:outline-none active:translate-y-px motion-reduce:transition-none',
                      isActive
                        ? 'border-white/20 bg-white/[0.09] text-white'
                        : 'border-white/[0.07] bg-black/20 text-white/48 hover:border-white/20 hover:bg-white/[0.06] hover:text-white/85',
                    )}
                    style={{
                      color:
                        isActive || hoveredNav === item.name
                          ? color
                          : undefined,
                    }}
                  >
                    <span className="absolute top-1 right-1.5 left-1.5 h-px bg-white/10" />
                    <span
                      className="mb-1 h-1 w-1 rounded-full transition-[box-shadow,background-color] duration-150 motion-reduce:transition-none"
                      style={{
                        backgroundColor: isActive
                          ? color
                          : 'rgba(255,255,255,0.16)',
                        boxShadow: isActive
                          ? `0 0 6px ${color}, 0 0 11px ${color}`
                          : 'none',
                      }}
                    />
                    <span className="relative">{item.name}</span>
                  </Link>
                </Fragment>
              )
            })}
          </nav>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <TrackLcd
              activeName={activeName}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              shouldReduceMotion={shouldReduceMotion}
            />

            <div className="hidden h-5 w-px bg-white/10 lg:block" />

            <button
              onClick={togglePlay}
              className={cn(
                controlClassName,
                'h-8 w-8 rounded-sm',
                isPlaying &&
                  'border-[#7abb5e]/45 bg-[#7abb5e]/10 text-[#91d47a] shadow-[inset_0_1px_rgba(255,255,255,0.08),0_0_12px_rgba(122,187,94,0.12)]',
              )}
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              <span
                className={cn(
                  'pointer-events-none absolute top-1 right-1 h-1 w-1 rounded-full',
                  isPlaying
                    ? 'bg-[#7abb5e] shadow-[0_0_6px_#7abb5e]'
                    : 'bg-white/20',
                )}
              />
              {isPlaying ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  aria-hidden="true"
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
                  aria-hidden="true"
                >
                  <polygon points="2,1 9,5 2,9" fill="currentColor" />
                </svg>
              )}
            </button>

            <div className="hidden flex-col items-end leading-none sm:flex">
              <span className="font-mono text-[9px] font-bold text-white/75 tabular-nums">
                {bpm}
              </span>
              <span className="mt-0.5 font-mono text-[6px] font-bold tracking-[0.12em] text-white/35">
                BPM
              </span>
            </div>

            <div className="hidden h-5 w-px bg-white/10 md:block" />

            <div className="flex lg:hidden">
              <button
                ref={toggleButtonRef}
                onClick={() => setIsOpen((open) => !open)}
                className={cn(
                  controlClassName,
                  'h-8 w-8 rounded-sm',
                  isOpen && 'border-[#d6ad45]/60 bg-[#d6ad45]/10',
                )}
                aria-label="Toggle navigation menu"
                aria-expanded={isOpen}
                aria-controls="mobile-navigation"
              >
                <span className="pointer-events-none flex flex-col gap-1">
                  <span
                    className={cn(
                      'h-px w-3 bg-current transition-transform duration-150 motion-reduce:transition-none',
                      isOpen && 'translate-y-[3px] rotate-45',
                    )}
                  />
                  <span
                    className={cn(
                      'h-px w-3 bg-current transition-opacity duration-150 motion-reduce:transition-none',
                      isOpen && 'opacity-0',
                    )}
                  />
                  <span
                    className={cn(
                      'h-px w-3 bg-current transition-transform duration-150 motion-reduce:transition-none',
                      isOpen && '-translate-y-[3px] -rotate-45',
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div id="mobile-navigation" ref={mobileMenuRef}>
        <StaggeredMenu
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          items={menuItems}
          colors={
            theme === 'dark'
              ? ['#e0b75a', '#7abb5e', '#263837']
              : ['#273281', '#3d468b', '#e2e8f0']
          }
          accentColor={theme === 'dark' ? '#e0b75a' : '#273281'}
        />
      </div>
    </>
  )
}
