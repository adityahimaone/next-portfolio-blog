'use client'

import { useState, useEffect, useRef } from 'react'
import { m as motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Sun, Moon, Menu, X } from 'lucide-react'
import useClickOutside from '@/hooks/use-click-outside'
import { HOMEPAGE_NAV_ITEMS, SUBPAGE_NAV_ITEMS } from '../constants'
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
  const [isOpen, setIsOpen] = useState(false)
  const isScrolled = useScrollState()
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

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 shadow-xl transition-all duration-300 md:px-10',
          isScrolled
            ? 'border-b border-zinc-200/50 h-14 bg-white/45 dark:border-white/5 dark:bg-black/45 backdrop-blur-md'
            : 'border-b border-transparent h-16 bg-transparent',
        )}
      >
        {/* Left: Logo */}
        <Link
          href="/"
          className="relative z-10 text-lg font-bold tracking-tighter text-amber-500 hover:text-amber-400 transition-colors"
        >
          AH
        </Link>

        {/* Center: Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {scrollLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[11px] font-bold tracking-widest text-zinc-500 hover:text-amber-500 dark:text-zinc-400 dark:hover:text-amber-400 transition-colors"
            >
              {item.name}
            </Link>
          ))}
          {pageLinks.length > 0 && (
            <div className="flex items-center gap-6 border-l border-zinc-300 pl-6 dark:border-zinc-700">
              {pageLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-[11px] font-bold tracking-widest transition-colors',
                    (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
                      ? 'text-amber-500'
                      : 'text-zinc-500 hover:text-amber-500 dark:text-zinc-400 dark:hover:text-amber-400'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Right: Theme toggle + Mobile menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            aria-label="Toggle Theme"
          >
            {mounted && theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          </button>

          <button
            ref={toggleButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 lg:hidden"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <StaggeredMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={menuItems}
        accentColor="#f59e0b"
      />
    </>
  )
}
