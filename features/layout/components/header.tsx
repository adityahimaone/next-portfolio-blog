'use client'

import { useState, useEffect, useRef } from 'react'
import { m as motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Menu, X, Music } from 'lucide-react'
import useClickOutside from '@/hooks/use-click-outside'
import { HOMEPAGE_NAV_ITEMS, SUBPAGE_NAV_ITEMS } from '../constants'
import { useScrollState } from '../hooks/use-scroll-state'
import { StaggeredMenu } from './staggered-menu/staggered-menu'

// ─── Equalizer Bars ────────────────────────────────────────
function EqBars({ isPlaying = true }: { isPlaying?: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-[#af50ff]"
          animate={
            isPlaying
              ? {
                  height: ['30%', '80%', '40%', '100%', '50%', '30%'],
                  opacity: [0.6, 1, 0.5, 1, 0.7, 0.6],
                }
              : { height: '20%', opacity: 0.3 }
          }
          transition={{
            duration: 1.0 + i * 0.15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.12,
          }}
        />
      ))}
    </div>
  )
}

// ─── Power Toggle (stylized modular synth switch) ───────
function PowerToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex h-6 w-10 cursor-pointer items-center rounded-[3px] border transition-all duration-200',
        on
          ? 'border-[#af50ff]/40 bg-[#af50ff]/10'
          : 'border-[#272727] bg-black/40',
      )}
      aria-label={on ? 'Power Off' : 'Power On'}
    >
      <span
        className={cn(
          'absolute left-[2px] h-[18px] w-[18px] rounded-[2px] transition-all duration-200 border',
          on
            ? 'translate-x-[14px] bg-[#af50ff] border-[#af50ff]/60 shadow-[0_0_6px_rgba(175,80,255,0.4)]'
            : 'translate-x-0 bg-[#333] border-[#272727]',
        )}
      />
      {/* Terminal label */}
      <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[7px] font-mono text-[#6b6b6b] uppercase tracking-wider">
        PWR
      </span>
    </button>
  )
}

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
  const [eqOn, setEqOn] = useState(true)
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

        {/* PCB trace accent line — top edge */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#af50ff]/30 to-transparent" />

        {/* Left: Logo + Equalizer */}
        <Link href="/" className="relative z-10 flex items-center gap-3 group">
          <EqBars isPlaying={eqOn} />
          <span className="text-[13px] font-bold tracking-[0.15em] uppercase text-[#f7f9fa] group-hover:text-[#af50ff] transition-colors duration-200">
            AH
          </span>
          <span className="hidden sm:block h-3 w-px bg-[#475467]" />
          <span className="hidden sm:block text-[11px] font-medium tracking-[0.08em] uppercase text-[#6b6b6b] group-hover:text-[#828384] transition-colors duration-200">
            Aditya Himawan
          </span>
        </Link>

        {/* Center: Nav links (desktop) — knob-style nav */}
        <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:flex">
          {scrollLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative text-[11px] font-bold tracking-[0.08em] uppercase text-[#828384] hover:text-[#f7f9fa] transition-colors duration-200 before:absolute before:-top-3 before:left-1/2 before:-translate-x-1/2 before:h-1 before:w-1 before:rounded-full before:bg-[#af50ff] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200"
            >
              {item.name}
            </Link>
          ))}
          {pageLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative text-[11px] font-bold tracking-[0.08em] uppercase transition-colors duration-200 before:absolute before:-top-3 before:left-1/2 before:-translate-x-1/2 before:h-1 before:w-1 before:rounded-full before:transition-opacity before:duration-200',
                (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
                  ? 'text-[#f7f9fa] before:bg-[#7f56d9] before:opacity-100'
                  : 'text-[#828384] hover:text-[#f7f9fa] before:bg-[#af50ff] before:opacity-0 hover:before:opacity-100',
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Power Toggle */}
          <div className="hidden sm:block pt-3.5">
            <PowerToggle on={eqOn} onClick={() => setEqOn(!eqOn)} />
          </div>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-[#272727] bg-black/40 text-[#828384] hover:border-[#af50ff] hover:text-[#f7f9fa] transition-all duration-200"
              aria-label="Toggle theme"
            >
              <span className="text-[9px] font-mono font-bold">
                {theme === 'dark' ? '○' : '●'}
              </span>
            </button>
          )}

          {/* Contact CTA — synth-style pill */}
          <Link
            href="/#contact"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[#272727] bg-black/40 text-[10px] font-bold tracking-[0.06em] uppercase text-[#828384] hover:border-[#af50ff] hover:text-[#f7f9fa] hover:shadow-[0_0_8px_rgba(175,80,255,0.3)] transition-all duration-200"
          >
            <Music size={10} />
            <span>Contact</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            ref={toggleButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-[#272727] bg-black/40 text-[#828384] hover:border-[#af50ff] hover:text-[#f7f9fa] transition-all duration-200 lg:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={12} /> : <Menu size={12} />}
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
