'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Sun, Moon } from 'lucide-react'
import useClickOutside from '@/hooks/use-click-outside'
import { HOMEPAGE_NAV_ITEMS, SUBPAGE_NAV_ITEMS, SOCIAL_LINKS } from '../constants'
import { useScrollState } from '../hooks/use-scroll-state'
import { StaggeredMenu } from './staggered-menu/staggered-menu'

export function HeaderV2() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const navItems = isHomepage ? HOMEPAGE_NAV_ITEMS : SUBPAGE_NAV_ITEMS

  const pageLinks = navItems.filter(
    (item) => !item.href.startsWith('/#') && (isHomepage ? item.href !== '/' : true),
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

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-5 md:px-8 transition-all duration-500',
          isScrolled
            ? 'h-12 border-b border-zinc-200/30 bg-white/70 backdrop-blur-xl dark:border-zinc-800/30 dark:bg-zinc-950/70'
            : 'h-16 border-b border-transparent bg-transparent',
        )}
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-all duration-300',
              'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
              'group-hover:shadow-[0_0_14px_rgba(245,158,11,0.7)] group-hover:scale-110',
            )}
          />
          <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-700 dark:text-zinc-300">
            ADIT
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {scrollLinks.map((item, i) => {
            const isActive = pathname === item.href
            return (
              <span key={item.name} className="flex items-center">
                <Link
                  href={item.href}
                  className={cn(
                    'relative px-2 py-1 font-[family-name:var(--font-jetbrains-mono)] text-[10px] tracking-[0.15em] uppercase transition-colors duration-200',
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200',
                  )}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-amber-500" />
                  )}
                </Link>
                {i < scrollLinks.length - 1 && (
                  <span className="mx-0.5 text-[8px] text-zinc-300 dark:text-zinc-700">
                    ·
                  </span>
                )}
              </span>
            )
          })}

          {scrollLinks.length > 0 && pageLinks.length > 0 && (
            <span className="mx-2 h-3 border-l border-zinc-300/50 dark:border-zinc-700/50" />
          )}

          {pageLinks.map((item, i) => {
            const isActive =
              (pathname.startsWith(item.href) && item.href !== '/') ||
              pathname === item.href
            return (
              <span key={item.name} className="flex items-center">
                <Link
                  href={item.href}
                  className={cn(
                    'relative px-2 py-1 font-[family-name:var(--font-jetbrains-mono)] text-[10px] tracking-[0.15em] uppercase transition-colors duration-200',
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200',
                  )}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-amber-500" />
                  )}
                </Link>
                {i < pageLinks.length - 1 && (
                  <span className="mx-0.5 text-[8px] text-zinc-300 dark:text-zinc-700">
                    ·
                  </span>
                )}
              </span>
            )
          })}
        </nav>

        {/* Theme toggle + Mobile menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 cursor-pointer',
              'text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200',
              'hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50',
            )}
            aria-label="Toggle theme"
          >
            <div
              className="transition-transform duration-500"
              style={{
                transform:
                  mounted && theme === 'dark'
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
              }}
            >
              {mounted && theme === 'dark' ? (
                <Moon size={15} />
              ) : (
                <Sun size={15} />
              )}
            </div>
          </button>

          <button
            ref={toggleButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex h-8 w-8 flex-col items-center justify-center gap-1 rounded-full transition-all duration-300 cursor-pointer lg:hidden',
              'text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200',
              'hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50',
            )}
            aria-label="Toggle Menu"
          >
            <div
              className={cn(
                'h-[1.5px] w-4 rounded-full bg-current transition-all duration-300',
                isOpen && 'translate-y-[3.5px] rotate-45',
              )}
            />
            <div
              className={cn(
                'h-[1.5px] w-4 rounded-full bg-current transition-all duration-300',
                isOpen && '-translate-y-[2px] -rotate-45',
              )}
            />
          </button>
        </div>
      </header>

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
