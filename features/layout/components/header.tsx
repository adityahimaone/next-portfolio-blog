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
          'fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b-4 px-6 shadow-xl transition-all duration-300 md:px-10',
          isScrolled
            ? 'border-primary/50 h-16 bg-white/80 backdrop-blur-md md:h-20 dark:bg-zinc-900/80'
            : 'border-primary dark:border-primary/50 h-20 bg-linear-to-b from-zinc-100 to-zinc-200 md:h-24 dark:from-zinc-900 dark:to-zinc-950',
        )}
      >
        {/* Left: Power Switch (Theme Toggle) */}
        <div className="flex items-start gap-4 md:gap-6">
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
          <div className="relative mt-2 h-4 w-4 md:h-5 md:w-5">
            <div
              className={cn(
                'absolute inset-0 rounded-full transition-all duration-700',
                mounted && theme === 'dark'
                  ? 'animate-pulse bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.9)]'
                  : 'bg-zinc-400 shadow-inner',
              )}
            />
            <div className="absolute top-1 left-1 h-1 w-1 rounded-full bg-white/50 md:top-1.5 md:left-1.5 md:h-1.5 md:w-1.5" />
          </div>
        </div>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden items-center gap-4 lg:flex xl:gap-8">
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
                      'group-hover:border-primary relative transform cursor-pointer rounded-full border-2 border-zinc-300 bg-linear-to-b from-zinc-100 to-zinc-300 shadow-lg transition-all group-hover:rotate-45 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900',
                      isScrolled ? 'h-10 w-10' : 'h-12 w-12',
                    )}
                  >
                    <div className="absolute top-1 left-1/2 h-3 w-0.5 -translate-x-1/2 bg-zinc-400 dark:bg-zinc-500" />
                    {/* Indicator Dot */}
                    <div className="bg-primary absolute top-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold tracking-widest transition-colors',
                      activeKnob === item.name
                        ? 'text-primary'
                        : 'text-zinc-600 dark:text-zinc-400',
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Page Links as Push Buttons (Grouped) */}
          {pageLinks.length > 0 && (
            <div className="flex items-center gap-4 border-l-2 border-zinc-300 pl-4 xl:gap-6 xl:pl-8 dark:border-zinc-700">
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
                      'relative flex transform cursor-pointer flex-col items-center justify-end rounded-md border-2 border-zinc-300 bg-linear-to-b from-zinc-100 to-zinc-300 shadow-lg transition-all group-hover:-translate-y-0.5 group-active:translate-y-1 group-active:shadow-inner dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900',
                      isScrolled ? 'h-10 w-10 pb-1.5' : 'h-12 w-12 pb-2',
                    )}
                  >
                    {/* LED indicating 'page link' */}
                    <div
                      className={cn(
                        'h-1.5 w-5 rounded-full transition-colors',
                        (pathname.startsWith(item.href) && item.href !== '/') ||
                          pathname === item.href
                          ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                          : 'bg-red-800/40 group-hover:bg-red-600/60',
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold tracking-widest transition-colors',
                      activeKnob === item.name ||
                        (pathname.startsWith(item.href) && item.href !== '/') ||
                        pathname === item.href
                        ? 'text-primary'
                        : 'text-zinc-600 dark:text-zinc-400',
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
        <div className="flex flex-col items-center gap-1 lg:hidden">
          <button
            ref={toggleButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'relative transform cursor-pointer rounded-full border-2 border-zinc-300 bg-linear-to-b from-zinc-100 to-zinc-300 shadow-lg transition-all dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900',
              isScrolled ? 'h-10 w-10' : 'h-12 w-12',
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

        {/* Right: Input Jack */}
        <div className="hidden flex-col items-center gap-1.5 md:flex">
          <div className="relative z-50">
            <button
              onClick={() => setIsPlugged(!isPlugged)}
              className={cn(
                'flex cursor-pointer items-center justify-center rounded-full border-4 border-zinc-300 bg-zinc-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all active:scale-95 dark:border-zinc-700 dark:bg-zinc-800',
                isScrolled ? 'h-8 w-8 border-2' : 'h-10 w-10',
                isPlugged && 'shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]',
              )}
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
          <span className="text-[8px] font-bold tracking-widest text-zinc-600 md:text-[10px] dark:text-zinc-400">
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
