'use client'

import { useState, useEffect, useRef } from 'react'
import { m as motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import useClickOutside from '@/hooks/use-click-outside'
import { HOMEPAGE_NAV_ITEMS, SUBPAGE_NAV_ITEMS, SOCIAL_LINKS } from '../constants'
import { useScrollState } from '../hooks/use-scroll-state'
import { StaggeredMenu } from './staggered-menu/staggered-menu'

export function Header() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const navItems = isHomepage ? HOMEPAGE_NAV_ITEMS : SUBPAGE_NAV_ITEMS

  const pageLinks = navItems.filter(
    (item) => !item.href.startsWith('/#') && (isHomepage ? item.href !== '/' : true),
  )
  const scrollLinks = navItems.filter((item) => !pageLinks.includes(item))

  const menuItems = navItems.map((item) => ({ label: item.name, link: item.href }))

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isScrolled = useScrollState()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  useClickOutside(mobileMenuRef, (e) => {
    if (isOpen && toggleButtonRef.current && !toggleButtonRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  })

  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 flex items-center justify-between transition-all duration-300',
          'px-6 md:px-10',
          isScrolled
            ? 'h-14 border-b border-[#272727] bg-[#090909]/90 backdrop-blur-md'
            : 'h-16 border-b border-transparent bg-transparent',
        )}
      >
        {/* Orchid ambient glow — left edge */}
        <div
          className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 h-48 w-96 opacity-30"
          style={{
            background: 'radial-gradient(circle closest-corner at 10% 50%, rgba(108,75,214,0.6), rgba(0,0,0,0) 70%)',
          }}
        />

        {/* Left: Wordmark */}
        <Link
          href="/"
          className="relative z-10 flex items-center gap-2 group"
        >
          <span className="text-[13px] font-bold tracking-[0.15em] uppercase text-[#f7f9fa] group-hover:text-[#af50ff] transition-colors duration-200">
            AH
          </span>
          <span className="hidden sm:block h-3 w-px bg-[#475467]" />
          <span className="hidden sm:block text-[11px] font-medium tracking-[0.08em] uppercase text-[#6b6b6b] group-hover:text-[#828384] transition-colors duration-200">
            Aditya Himawan
          </span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-8 lg:flex">
          {scrollLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[13px] font-medium tracking-[0.02em] text-[#828384] hover:text-[#f7f9fa] transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
          {pageLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative text-[13px] font-medium tracking-[0.02em] transition-colors duration-200',
                (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
                  ? 'text-[#f7f9fa]'
                  : 'text-[#828384] hover:text-[#f7f9fa]',
              )}
            >
              {item.name}
              {(pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) && (
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#7f56d9]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-[#475467] text-[#828384] hover:border-[#af50ff] hover:text-[#f7f9fa] transition-all duration-200"
              aria-label="Toggle theme"
            >
              <span className="text-[10px] font-bold tracking-widest">
                {theme === 'dark' ? '○' : '●'}
              </span>
            </button>
          )}

          {/* Contact CTA — ghost pill */}
          <Link
            href="/#contact"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#475467] text-[11px] font-semibold tracking-[0.06em] uppercase text-[#f7f9fa] hover:border-[#af50ff] hover:shadow-[0_0_12px_rgba(175,80,255,0.4)] transition-all duration-200"
          >
            Contact
          </Link>

          {/* Mobile menu toggle */}
          <button
            ref={toggleButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#475467] text-[#828384] hover:border-[#af50ff] hover:text-[#f7f9fa] transition-all duration-200 lg:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>
      </header>

      <StaggeredMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={menuItems}
        colors={['#090909', '#0f0a18', '#150d22']}
        accentColor="#af50ff"
      />
    </>
  )
}
