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

// VU Meter Logo Component
function VUMeterLogo() {
  const bars = [
    { height: 0.3, color: 'var(--accent-green)' },
    { height: 0.5, color: 'var(--accent-green)' },
    { height: 0.7, color: 'var(--accent-amber)' },
    { height: 0.9, color: 'var(--accent-red)' },
  ]

  return (
    <div className="flex h-8 w-8 items-end justify-center gap-0.5 rounded border border-zinc-700/30 bg-zinc-900/50 p-1">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-[1px]"
          style={{ backgroundColor: bar.color }}
          animate={{
            height: [`${bar.height * 100}%`, `${(bar.height + 0.2) * 100}%`, `${bar.height * 100}%`],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function Header() {
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
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Navigation channels
  const channels = [
    { id: 'home', label: 'HOME', href: '/#', ch: 'CH1' },
    { id: 'about', label: 'ABOUT', href: '/#about', ch: 'CH2' },
    { id: 'skills', label: 'SKILLS', href: '/#skills', ch: 'CH3' },
    { id: 'exp', label: 'EXP', href: '/#experience', ch: 'CH4' },
    { id: 'work', label: 'WORK', href: '/#projects', ch: 'CH5' },
    { id: 'contact', label: 'CONTACT', href: '/#contact', ch: 'CH6' },
  ]

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 sm:px-8 transition-all duration-300',
          'border-b border-white/5',
        )}
        style={{
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-flat)',
        }}
      >
        {/* Logo: VU Meter */}
        <Link href="/" className="flex items-center gap-3">
          <VUMeterLogo />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-mono font-bold tracking-wider text-zinc-300">
              ADIT
            </span>
            <span className="text-[8px] font-mono text-zinc-500 uppercase">
              MIX-MASTER
            </span>
          </div>
        </Link>

        {/* Center: Channel Strip (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          <div
            className="flex items-center gap-1 rounded-lg px-3 py-2"
            style={{ boxShadow: 'var(--nm-inset)' }}
          >
            {channels.map((channel) => {
              const isActive =
                (channel.href === '/#' && pathname === '/') ||
                (channel.href !== '/#' && pathname.includes(channel.id))

              return (
                <Link
                  key={channel.id}
                  href={channel.href}
                  className="group relative flex flex-col items-center gap-1 px-2 py-1"
                  onMouseEnter={() => setActiveChannel(channel.id)}
                  onMouseLeave={() => setActiveChannel(null)}
                >
                  {/* LED Indicator */}
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-all duration-300',
                      isActive || activeChannel === channel.id
                        ? 'bg-[var(--accent-cyan)] shadow-[0_0_6px_var(--accent-cyan)]'
                        : 'bg-zinc-700',
                    )}
                  />

                  {/* Channel Button */}
                  <div
                    className={cn(
                      'flex h-8 w-12 items-center justify-center rounded text-[9px] font-mono font-bold tracking-wider transition-all',
                      isActive || activeChannel === channel.id
                        ? 'text-[var(--accent-cyan)]'
                        : 'text-zinc-500',
                    )}
                    style={{
                      boxShadow:
                        isActive || activeChannel === channel.id
                          ? 'var(--nm-raised)'
                          : 'var(--nm-flat)',
                    }}
                  >
                    {channel.ch}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      'text-[8px] font-mono font-bold tracking-widest transition-colors',
                      isActive || activeChannel === channel.id
                        ? 'text-[var(--accent-cyan)]'
                        : 'text-zinc-600',
                    )}
                  >
                    {channel.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Right: Theme Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all"
            style={{ boxShadow: 'var(--nm-raised)' }}
            aria-label="Toggle Theme"
          >
            {mounted && theme === 'dark' ? (
              <Moon size={16} className="text-zinc-300" />
            ) : (
              <Sun size={16} className="text-zinc-700" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            ref={toggleButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="flex lg:hidden h-10 w-10 flex-col items-center justify-center gap-1 rounded transition-all"
            style={{ boxShadow: isOpen ? 'var(--nm-inset)' : 'var(--nm-raised)' }}
            aria-label="Toggle Menu"
          >
            <span
              className={cn(
                'h-0.5 w-5 bg-zinc-400 transition-all',
                isOpen && 'translate-y-1.5 rotate-45',
              )}
            />
            <span
              className={cn(
                'h-0.5 w-5 bg-zinc-400 transition-all',
                isOpen && 'opacity-0',
              )}
            />
            <span
              className={cn(
                'h-0.5 w-5 bg-zinc-400 transition-all',
                isOpen && '-translate-y-1.5 -rotate-45',
              )}
            />
          </button>
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
