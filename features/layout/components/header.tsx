'use client'

import { useState, useEffect } from 'react'
import { m as motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { HOMEPAGE_NAV_ITEMS, SUBPAGE_NAV_ITEMS } from '../constants'
import { useScrollState } from '../hooks/use-scroll-state'
import { StaggeredMenu } from './staggered-menu/staggered-menu'

export function Header() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const navItems = isHomepage ? HOMEPAGE_NAV_ITEMS : SUBPAGE_NAV_ITEMS

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isScrolled = useScrollState()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 transition-all duration-300',
          isScrolled
            ? 'border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/80'
            : 'bg-transparent'
        )}
      >
        {/* Logo Monogram */}
        <Link href="/" className="font-bold text-2xl tracking-tighter text-amber-500 hover:text-amber-600 transition-colors">
          AH
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-[12px] font-bold tracking-widest text-zinc-600 dark:text-zinc-400">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "hover:text-amber-500 transition-colors",
                (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) && "text-amber-500"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            {mounted && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <StaggeredMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={navItems.map(i => ({ label: i.name, link: i.href }))}
        accentColor="#f59e0b"
      />
    </>
  )
}
