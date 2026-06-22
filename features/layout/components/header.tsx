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
  const [isPlugged, setIsPlugged] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

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

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b px-4 shadow-xl transition-all duration-300 md:px-8 overflow-hidden',
          isScrolled
            ? 'border-zinc-200/50 dark:border-white/5 h-12 bg-white/45 dark:bg-black/45 backdrop-blur-md'
            : 'border-zinc-300/30 dark:border-white/5 h-14 bg-white/35 dark:bg-black/35 backdrop-blur-lg',
        )}
      >
        {/* PCB Copper lines background detail */}
        <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-[0.03] z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 20 H 400 L 450 60 H 1000 M 200 0 V 84 L 230 114" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M 600 84 V 40 L 620 20 H 800" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="450" cy="60" r="3" fill="currentColor" />
            <circle cx="620" cy="20" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Left: Power Switch (Theme Toggle) — compact */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={toggleTheme}
              className="relative h-6 w-11 cursor-pointer rounded-md bg-zinc-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-colors dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800"
              aria-label="Toggle Theme"
            >
              <div className="absolute inset-0 flex items-center justify-between px-1.5">
                <Sun size={9} className={cn("transition-opacity duration-300", mounted && theme === 'dark' ? 'opacity-30 text-zinc-600' : 'opacity-100 text-[#273281]')} />
                <Moon size={9} className={cn("transition-opacity duration-300", mounted && theme === 'dark' ? 'opacity-100 text-[#f8fafc]' : 'opacity-30 text-zinc-600')} />
              </div>
              <motion.div
                className="absolute top-0.5 bottom-0.5 w-5 bg-primary rounded shadow-lg flex flex-col items-center justify-center gap-0.5 border border-white/10 dark:bg-[#3a4699]"
                initial={false}
                animate={{
                  x: mounted && theme === 'dark' ? 22 : 1,
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              >
                <div className="h-px w-2 bg-white/30 rounded-full" />
                <div className="h-px w-2 bg-white/30 rounded-full" />
              </motion.div>
            </button>
            <span className="text-[7px] font-bold tracking-widest text-zinc-500 dark:text-zinc-500">
              POWER
            </span>
          </div>
          <div className="relative h-2.5 w-2.5">
            <div
              className={cn(
                'absolute inset-0 rounded-full transition-all duration-700',
                mounted && theme === 'dark'
                  ? 'animate-pulse bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                  : 'bg-zinc-400 shadow-inner',
              )}
            />
          </div>
        </div>

        {/* Center: Navigation (Desktop) — compact knobs */}
        <nav className="hidden items-center gap-3 lg:flex xl:gap-5">
          {/* Scroll Links as Knobs */}
          {scrollLinks.length > 0 && (
            <div className="flex items-center gap-3 xl:gap-5">
              {scrollLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex flex-col items-center gap-1"
                  onMouseEnter={() => setActiveKnob(item.name)}
                  onMouseLeave={() => setActiveKnob(null)}
                >
                  <div
                    className={cn(
                      'group-hover:border-primary relative transform cursor-pointer rounded-full border-2 border-zinc-300 bg-linear-to-b from-zinc-100 to-zinc-300 shadow-md transition-all group-hover:rotate-45 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900',
                      isScrolled ? 'h-6 w-6' : 'h-7 w-7',
                    )}
                  >
                    <div className="absolute top-0.5 left-1/2 h-2 w-px -translate-x-1/2 bg-zinc-400 dark:bg-zinc-500" />
                    <div className="bg-primary absolute top-1 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-bold tracking-widest transition-colors',
                      activeKnob === item.name
                        ? 'text-primary'
                        : 'text-zinc-500 dark:text-zinc-500',
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Page Links as Push Buttons */}
          {pageLinks.length > 0 && (
            <div className="flex items-center gap-3 border-l-2 border-zinc-300 pl-3 xl:gap-5 xl:pl-5 dark:border-zinc-700">
              {pageLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex flex-col items-center gap-1"
                  onMouseEnter={() => setActiveKnob(item.name)}
                  onMouseLeave={() => setActiveKnob(null)}
                >
                  <div
                    className={cn(
                      'relative flex transform cursor-pointer flex-col items-center justify-end rounded-md border-2 border-zinc-300 bg-linear-to-b from-zinc-100 to-zinc-300 shadow-md transition-all group-hover:-translate-y-0.5 group-active:translate-y-0.5 group-active:shadow-inner dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900',
                      isScrolled ? 'h-6 w-6 pb-0.5' : 'h-7 w-7 pb-1',
                    )}
                  >
                    <div
                      className={cn(
                        'h-1 w-4 rounded-full transition-colors',
                        (pathname.startsWith(item.href) && item.href !== '/') ||
                          pathname === item.href
                          ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                          : 'bg-red-800/40 group-hover:bg-red-600/60',
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-bold tracking-widest transition-colors',
                      activeKnob === item.name ||
                        (pathname.startsWith(item.href) && item.href !== '/') ||
                        pathname === item.href
                        ? 'text-primary'
                        : 'text-zinc-500 dark:text-zinc-500',
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="flex flex-col items-center gap-0.5 lg:hidden">
          <button
            ref={toggleButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'relative transform cursor-pointer rounded-full border-2 border-zinc-300 bg-linear-to-b from-zinc-100 to-zinc-300 shadow-md transition-all dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900',
              isScrolled ? 'h-7 w-7' : 'h-8 w-8',
              isOpen ? 'border-primary rotate-135' : 'rotate-0',
            )}
            aria-label="Toggle Menu"
          >
            <div className="absolute top-0.5 left-1/2 h-2.5 w-px -translate-x-1/2 bg-zinc-400 dark:bg-zinc-500" />
            <div
              className={cn(
                'bg-primary absolute top-1.5 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full transition-opacity',
                isOpen ? 'opacity-100' : 'opacity-0',
              )}
            />
          </button>
          <span className="text-[7px] font-bold tracking-widest text-zinc-500 dark:text-zinc-500">
            MENU
          </span>
        </div>

        {/* Right: Input Jack — compact */}
        <div className="hidden flex-col items-center gap-1 md:flex">
          <div className="relative z-50">
            <button
              onClick={() => setIsPlugged(!isPlugged)}
              className={cn(
                'flex cursor-pointer items-center justify-center rounded-full border-2 border-zinc-300 bg-zinc-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all active:scale-95 dark:border-zinc-700 dark:bg-zinc-800',
                isScrolled ? 'h-6 w-6' : 'h-7 w-7',
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
                    <div className="h-4 w-3 rounded-t-sm border-b border-amber-700/30 bg-linear-to-r from-amber-200 via-amber-400 to-amber-600 shadow-sm" />
                    <div className="h-0.5 w-3 bg-black" />
                    <div className="flex h-10 w-4 flex-col items-center justify-between rounded-b-md border-t border-white/10 bg-linear-to-r from-zinc-700 via-zinc-800 to-zinc-900 py-1 shadow-xl">
                      <div className="h-px w-full bg-black/30" />
                      <div className="h-px w-full bg-black/30" />
                      <div className="h-px w-full bg-black/30" />
                    </div>
                    <div className="-mt-1 h-4 w-2.5 rounded-b-full bg-zinc-900" />
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
          <span className="text-[7px] font-bold tracking-widest text-zinc-500 dark:text-zinc-500">
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
          theme === 'dark' ? ['#f59e0b', '#3a4699', '#1e2866'] : ['#273281', '#3d468b', '#e2e8f0']
        }
        accentColor={theme === 'dark' ? '#f59e0b' : '#273281'}
      />
    </>
  )
}
