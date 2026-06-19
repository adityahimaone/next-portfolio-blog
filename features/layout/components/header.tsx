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
          'fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b px-6 transition-all duration-300 md:px-10',
          isScrolled
            ? 'h-14 bg-[#f4f4f0]/95 border-[#d4d4d0] shadow-sm backdrop-blur-md dark:bg-[#121212]/95 dark:border-[#27272a]'
            : 'h-16 bg-[#f5f5f3] border-[#e4e4e0] dark:bg-[#161616] dark:border-[#202020]',
        )}
      >
        {/* Left: Classic Braun Plunger Power Switch (Theme Toggle) */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleTheme}
              className={cn(
                'relative h-7 w-7 rounded-full transition-all duration-200 border cursor-pointer',
                mounted && theme === 'dark'
                  ? 'bg-[#f05523] border-[#c03d15] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.1)]'
                  : 'bg-[#d8d8d0] border-[#b8b8b0] shadow-[0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] active:translate-y-[1px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]'
              )}
              aria-label="Toggle Theme"
            >
              <div className="absolute inset-1.5 rounded-full bg-black/5 dark:bg-white/10" />
            </button>
            <span className="font-mono text-[7px] font-bold tracking-wider text-zinc-500 uppercase">
              power
            </span>
          </div>
          
          {/* Signal Indicator Light */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'h-2.5 w-2.5 rounded-full border transition-all duration-500',
                mounted && theme === 'dark'
                  ? 'bg-[#39ff14] border-[#22cc00] shadow-[0_0_8px_rgba(57,255,20,0.8)]'
                  : 'bg-[#4caf50] border-[#388e3c] shadow-[0_0_6px_rgba(76,175,80,0.5)]',
              )}
            />
            <span className="font-mono text-[7px] font-bold tracking-wider text-zinc-500 uppercase">
              status
            </span>
          </div>
        </div>

        {/* Center: Navigation (Desktop) - Inspired by Braun Selector Keys */}
        <nav className="hidden items-center gap-1 border border-[#d4d4d0] bg-[#e8e8e4] p-0.5 rounded dark:border-[#27272a] dark:bg-[#1a1a1a] lg:flex">
          {/* Section / Scroll Links */}
          {scrollLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative px-4 py-1.5 text-[11px] font-mono tracking-tight font-medium uppercase border-r border-[#d4d4d0]/60 last:border-r-0 transition-all select-none',
                activeKnob === item.name || pathname === item.href
                  ? 'bg-[#f4f4f0] text-zinc-900 shadow-inner dark:bg-[#2a2a2a] dark:text-white'
                  : 'text-zinc-600 hover:bg-[#f0f0ec] dark:text-zinc-400 dark:hover:bg-[#202020]'
              )}
              onMouseEnter={() => setActiveKnob(item.name)}
              onMouseLeave={() => setActiveKnob(null)}
            >
              <div className="flex items-center gap-2">
                <span>{item.name.toLowerCase()}</span>
                {/* Micro indicator dot */}
                {(activeKnob === item.name || pathname === item.href) && (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#f05523]" />
                )}
              </div>
            </Link>
          ))}

          {/* Page Links (Grouped Selector Keys) */}
          {pageLinks.length > 0 && (
            <div className="flex items-center border-l-2 border-[#d4d4d0] dark:border-[#2c2c2c]">
              {pageLinks.map((item) => {
                const isActive = (pathname.startsWith(item.href) && item.href !== '/') || pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative px-4 py-1.5 text-[11px] font-mono tracking-tight font-medium uppercase border-r border-[#d4d4d0]/60 last:border-r-0 transition-all select-none',
                      isActive
                        ? 'bg-[#f4f4f0] text-zinc-900 shadow-inner dark:bg-[#2a2a2a] dark:text-white'
                        : 'text-zinc-600 hover:bg-[#f0f0ec] dark:text-zinc-400 dark:hover:bg-[#202020]'
                    )}
                    onMouseEnter={() => setActiveKnob(item.name)}
                    onMouseLeave={() => setActiveKnob(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.name.toLowerCase()}</span>
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-[#f05523]" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Mobile Nav Toggle - Simplified button */}
        <div className="flex flex-col items-center gap-1 lg:hidden">
          <button
            ref={toggleButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded border border-[#d4d4d0] bg-[#e8e8e4] transition-all active:scale-95 dark:border-[#27272a] dark:bg-[#1a1a1a]',
              isOpen && 'bg-[#f4f4f0] shadow-inner dark:bg-[#2a2a2a]'
            )}
            aria-label="Toggle Menu"
          >
            <div className="flex flex-col gap-1">
              <span className={cn('h-0.5 w-4 bg-zinc-600 transition-all dark:bg-zinc-300', isOpen && 'rotate-45 translate-y-1.5')} />
              <span className={cn('h-0.5 w-4 bg-zinc-600 transition-all dark:bg-zinc-300', isOpen && 'opacity-0')} />
              <span className={cn('h-0.5 w-4 bg-zinc-600 transition-all dark:bg-zinc-300', isOpen && '-rotate-45 -translate-y-1.5')} />
            </div>
          </button>
        </div>

        {/* Right: Tactile Toggle Switch (Simplified connection) */}
        <div className="hidden flex-col items-center gap-1 md:flex">
          <button
            onClick={() => setIsPlugged(!isPlugged)}
            className={cn(
              'relative h-8 w-14 rounded-full border p-1 transition-colors cursor-pointer',
              isPlugged
                ? 'bg-[#f05523] border-[#c03d15]'
                : 'bg-[#d8d8d0] border-[#b8b8b0] dark:bg-[#222] dark:border-[#333]'
            )}
            aria-label="Toggle Input Switch"
          >
            <motion.div
              className="h-5 w-5 rounded-full bg-white shadow-md dark:bg-zinc-300"
              animate={{ x: isPlugged ? 22 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className="font-mono text-[7px] font-bold tracking-wider text-zinc-500 uppercase">
            {isPlugged ? 'mono' : 'stereo'}
          </span>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <StaggeredMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={menuItems}
        colors={
          theme === 'dark' ? ['#f05523', '#2a2a2a', '#121212'] : ['#f05523', '#ecebe6', '#f4f4f0']
        }
        accentColor="#f05523"
      />
    </>
  )
}
