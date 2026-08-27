'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import useClickOutside from '@/hooks/use-click-outside'

const PRIMARY_NAVIGATION = [
  { index: '01', name: 'Projects', href: '/projects' },
  { index: '02', name: 'Bookmarks', href: '/bookmarks' },
  { index: '03', name: 'Blog', href: '/blog' },
] as const

const UTILITY_NAVIGATION = [
  { name: 'Music', href: '/music' },
  { name: 'Contact', href: 'mailto:adityahimaone@gmail.com' },
] as const

export function HeaderDaw() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  useClickOutside(menuRef, (event) => {
    if (
      isOpen &&
      toggleRef.current &&
      !toggleRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  })

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <a
        href="#main-content"
        className="bg-foreground text-background fixed top-2 left-2 z-[60] -translate-y-20 px-4 py-3 text-sm font-semibold transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <header
        id="top"
        className="border-border/80 bg-background/95 text-foreground fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md"
      >
        <div className="mx-auto grid h-[52px] max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          <Link
            href="/"
            className="inline-flex min-h-11 w-fit items-center font-[family-name:var(--font-space-grotesk)] text-base font-bold tracking-[-0.045em] focus-visible:rounded-sm"
            aria-label="AH Studio home"
          >
            AH{' '}
            <span className="text-primary-dark dark:text-primary ml-1">
              / STUDIO
            </span>
          </Link>

          <nav
            className="hidden h-full items-stretch lg:flex"
            aria-label="Primary navigation"
          >
            {PRIMARY_NAVIGATION.map((item) => {
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group text-muted-foreground hover:text-foreground relative flex min-h-11 items-center gap-2 px-4 text-sm font-medium transition-colors focus-visible:rounded-sm',
                    active && 'text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'text-muted-foreground font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold',
                      active && 'text-primary-dark dark:text-primary',
                    )}
                    aria-hidden="true"
                  >
                    {item.index}
                  </span>
                  {item.name}
                  <span
                    className={cn(
                      'bg-primary absolute inset-x-4 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-200 motion-reduce:transition-none',
                      active && 'scale-x-100',
                    )}
                    aria-hidden="true"
                  />
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center justify-end gap-1">
            <div className="hidden items-center lg:flex">
              {UTILITY_NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center px-3 text-sm font-medium transition-colors focus-visible:rounded-sm"
                >
                  {item.name}
                </Link>
              ))}
              <button
                type="button"
                onClick={toggleTheme}
                className="border-border text-muted-foreground hover:text-foreground inline-flex min-h-11 min-w-11 items-center justify-center border-l px-3 text-xs font-semibold transition-colors"
                aria-label="Switch color theme"
              >
                {mounted
                  ? resolvedTheme === 'dark'
                    ? 'Light'
                    : 'Dark'
                  : 'Theme'}
              </button>
            </div>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              className="border-border inline-flex min-h-11 min-w-16 items-center justify-center border-l pl-4 text-sm font-semibold lg:hidden"
              aria-expanded={isOpen}
              aria-controls="editorial-mobile-menu"
            >
              {isOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        <div
          id="editorial-mobile-menu"
          ref={menuRef}
          className={cn(
            'border-border bg-background absolute inset-x-0 top-full border-b transition-[opacity,transform,visibility] duration-200 motion-reduce:transition-none lg:hidden',
            isOpen
              ? 'visible translate-y-0 opacity-100'
              : 'invisible -translate-y-2 opacity-0',
          )}
          aria-hidden={!isOpen}
        >
          <nav
            className="mx-auto grid max-w-7xl px-4 py-3 sm:px-6"
            aria-label="Mobile navigation"
          >
            {PRIMARY_NAVIGATION.map((item) => {
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  tabIndex={isOpen ? 0 : -1}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'border-border/70 grid min-h-12 grid-cols-[2.25rem_1fr_auto] items-center border-b text-base font-semibold',
                    active ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  <span className="text-primary-dark dark:text-primary font-[family-name:var(--font-geist-mono)] text-[10px]">
                    {item.index}
                  </span>
                  {item.name}
                  {active && (
                    <span className="text-primary-dark dark:text-primary text-xs">
                      Current
                    </span>
                  )}
                </Link>
              )
            })}

            <div className="bg-border grid grid-cols-2 gap-px">
              {UTILITY_NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  tabIndex={isOpen ? 0 : -1}
                  className="bg-background flex min-h-12 items-center text-sm font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              tabIndex={isOpen ? 0 : -1}
              className="border-border flex min-h-12 items-center justify-between border-t text-left text-sm font-medium"
            >
              <span>Color theme</span>
              <span className="text-muted-foreground">
                {mounted
                  ? resolvedTheme === 'dark'
                    ? 'Dark'
                    : 'Light'
                  : 'System'}
              </span>
            </button>
          </nav>
        </div>
      </header>
    </>
  )
}
