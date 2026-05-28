'use client'

import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Sun, Moon } from 'lucide-react'
import useClickOutside from '@/hooks/use-click-outside'
import { HOMEPAGE_NAV_ITEMS, SUBPAGE_NAV_ITEMS, SOCIAL_LINKS } from '@/features/layout/constants'
import { useScrollState } from '@/features/layout/hooks/use-scroll-state'

const NAV_SECTIONS = [
  { id: 'hero', label: 'HOME', href: '/' },
  { id: 'about', label: 'ABOUT', href: '/#about' },
  { id: 'skills', label: 'SKILLS', href: '/#skills' },
  { id: 'experience', label: 'EXP', href: '/#experience' },
  { id: 'projects', label: 'WORK', href: '/#projects' },
  { id: 'contact', label: 'CONTACT', href: '/#contact' },
]

export function TENavbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isScrolled = useScrollState()
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  useClickOutside(menuRef, (e) => {
    if (isOpen && toggleRef.current && !toggleRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  })

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const isHomepage = pathname === '/'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
          isScrolled
            ? 'h-12 border-b border-white/5 backdrop-blur-md md:h-14'
            : 'h-14 border-b border-white/5 md:h-16',
        )}
        style={{
          background: isScrolled
            ? 'rgba(13, 11, 10, 0.85)'
            : 'linear-gradient(180deg, rgba(13,11,10,0.95) 0%, rgba(13,11,10,0.8) 100%)',
        }}
      >
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          {/* LEFT: TP-7 transport area */}
          <div className="flex items-center gap-3">
            {/* Theme toggle — styled as TAPE type indicator */}
            <button
              onClick={toggleTheme}
              className="group relative flex items-center gap-2"
              aria-label="Toggle theme"
            >
              <div
                className={cn(
                  'flex h-7 w-14 items-center rounded border transition-colors',
                  'border-white/10',
                  mounted && theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-[#2A2826]',
                )}
              >
                <m.div
                  className="mx-0.5 h-5 w-5 rounded-sm border border-white/10"
                  style={{
                    background: mounted && theme === 'dark'
                      ? 'linear-gradient(135deg, #2A2826, #3A3836)'
                      : 'linear-gradient(135deg, #D4CFCA, #BEB9B3)',
                  }}
                  animate={{ x: mounted && theme === 'dark' ? 28 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {/* Grip marks */}
                  <div className="flex h-full flex-col items-center justify-center gap-[2px]">
                    <div className="h-px w-2.5 bg-white/20" />
                    <div className="h-px w-2.5 bg-white/20" />
                    <div className="h-px w-2.5 bg-white/20" />
                  </div>
                </m.div>
              </div>
              <span
                className="hidden text-[7px] font-bold tracking-[0.2em] sm:inline"
                style={{ color: '#555', fontFamily: 'var(--sc-font-mono)' }}
              >
                TAPE
              </span>
            </button>

            {/* LED power indicator */}
            <div className="hidden items-center gap-1.5 md:flex">
              <div
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-500',
                  mounted && theme === 'dark'
                    ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse'
                    : 'bg-zinc-500',
                )}
              />
              <span
                className="text-[7px] font-bold tracking-[0.15em]"
                style={{ color: '#555', fontFamily: 'var(--sc-font-mono)' }}
              >
                PWR
              </span>
            </div>
          </div>

          {/* CENTER: Section track selectors (desktop) */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_SECTIONS.map((section, idx) => (
              <Link
                key={section.id}
                href={section.href}
                className="group flex flex-col items-center"
              >
                {/* Track indicator LED + number */}
                <div className="flex items-center gap-1.5 rounded px-2.5 py-1.5 transition-colors hover:bg-white/5">
                  <div
                    className="h-1.5 w-1.5 rounded-full transition-colors"
                    style={{
                      background:
                        (section.href === '/#contact' && pathname === '/contact') ||
                        (section.href === '/' && pathname === '/')
                          ? '#00FF41'
                          : '#333',
                      boxShadow:
                        (section.href === '/#contact' && pathname === '/contact') ||
                        (section.href === '/' && pathname === '/')
                          ? '0 0 6px #00FF41'
                          : 'none',
                    }}
                  />
                  <span
                    className="text-[9px] font-bold tracking-[0.15em] transition-colors group-hover:text-white"
                    style={{
                      color: '#7A7572',
                      fontFamily: 'var(--sc-font-mono)',
                    }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="text-[10px] font-bold tracking-[0.1em] transition-colors group-hover:text-white"
                    style={{ color: '#9A9590', fontFamily: 'var(--sc-font-mono)' }}
                  >
                    {section.label}
                  </span>
                </div>
              </Link>
            ))}
          </nav>

          {/* RIGHT: TAPE name display + REC indicator */}
          <div className="hidden items-center gap-3 md:flex">
            <div
              className="flex items-center gap-2 rounded border border-white/5 px-3 py-1.5"
              style={{ background: 'rgba(0,0,0,0.3)', fontFamily: 'var(--sc-font-mono)' }}
            >
              <span className="text-[9px] font-bold tracking-wider" style={{ color: '#555' }}>
                TAPE:
              </span>
              <span className="text-[9px] font-bold tracking-wider" style={{ color: '#00B4D8' }}>
                adityahimaone.space
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
              <span className="text-[8px] font-bold tracking-wider" style={{ color: '#FF3344', fontFamily: 'var(--sc-font-mono)' }}>
                REC
              </span>
            </div>
          </div>

          {/* MOBILE: Hamburger */}
          <button
            ref={toggleRef}
            onClick={() => setIsOpen(!isOpen)}
            className="group flex flex-col items-center lg:hidden"
            aria-label="Toggle menu"
          >
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded border border-white/10"
              style={{
                background: 'linear-gradient(180deg, #3A3836, #2A2826)',
              }}
            >
              <div className="flex flex-col gap-1.5">
                <m.div
                  className="h-[2px] w-4 rounded-full bg-white/60"
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 5 : 0,
                  }}
                />
                <m.div
                  className="h-[2px] w-4 rounded-full bg-white/60"
                  animate={{ opacity: isOpen ? 0 : 1 }}
                />
                <m.div
                  className="h-[2px] w-4 rounded-full bg-white/60"
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -5 : 0,
                  }}
                />
              </div>
            </div>
            <span
              className="mt-1 text-[7px] font-bold tracking-widest"
              style={{ color: '#555', fontFamily: 'var(--sc-font-mono)' }}
            >
              MENU
            </span>
          </button>
        </div>
      </header>

      {/* MOBILE: Full-screen tape deck overlay */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={menuRef}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center lg:hidden"
            style={{
              background: 'linear-gradient(180deg, #0D0B0A 0%, #1A1A1A 100%)',
            }}
          >
            {/* Scanlines */}
            <div className="sc-scanlines pointer-events-none absolute inset-0 z-0" />

            {/* Nav items as tape track selectors */}
            <nav className="relative z-10 flex flex-col items-center gap-6">
              {NAV_SECTIONS.map((section, idx) => (
                <Link
                  key={section.id}
                  href={section.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-4"
                >
                  <span
                    className="text-[11px] font-bold tracking-[0.2em]"
                    style={{ color: '#333', fontFamily: 'var(--sc-font-mono)' }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div
                    className="h-2 w-2 rounded-full transition-colors group-hover:bg-green-500"
                    style={{ background: '#333' }}
                  />
                  <span
                    className="text-lg font-bold tracking-widest transition-colors group-hover:text-white"
                    style={{ color: '#9A9590', fontFamily: 'var(--sc-font-mono)' }}
                  >
                    {section.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Bottom: REC and theme toggle */}
            <div className="absolute bottom-12 left-0 flex w-full justify-center gap-8">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2"
              >
                {mounted && theme === 'dark' ? (
                  <Sun size={16} style={{ color: '#FFB000' }} />
                ) : (
                  <Moon size={16} style={{ color: '#555' }} />
                )}
                <span
                  className="text-[10px] font-bold tracking-widest"
                  style={{ color: '#555', fontFamily: 'var(--sc-font-mono)' }}
                >
                  {theme === 'dark' ? 'LIGHT' : 'DARK'}
                </span>
              </button>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                <span
                  className="text-[10px] font-bold tracking-widest"
                  style={{ color: '#FF3344', fontFamily: 'var(--sc-font-mono)' }}
                >
                  SESSION ACTIVE
                </span>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
