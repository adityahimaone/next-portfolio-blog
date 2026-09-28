'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

import { VenLogo } from '@/components/ven-logo'
import { DarkInner } from '@/src/components/ui/dark-inner'
import { cn } from '@/lib/utils'

import styles from './top-bar.module.css'

const PILL_CLASS =
  'border-border bg-background/85 pointer-events-auto inline-flex items-center rounded-full border shadow-[0_14px_36px_-22px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-colors focus-visible:ring-ring focus-visible:ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

export function TopBar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const isHome = pathname === '/'

  if (isHome) {
    return (
      <div className={styles.topBar}>
        <Link
          href="/"
          aria-label="AH Studio home"
          className={cn(styles.mark, 'pointer-events-auto shrink-0')}
        >
          <VenLogo />
        </Link>

        <DarkInner
          toggled={isDark}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label="Switch color theme"
          className={cn(
            PILL_CLASS,
            styles.toggle,
            'hover:text-foreground size-9 justify-center text-lg',
          )}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center gap-3 px-4 pt-4 sm:px-6',
        'justify-between',
      )}
    >
      <Link
        href="/"
        aria-label="AH Studio home"
        className={cn(PILL_CLASS, 'size-9 justify-center')}
      >
        <VenLogo className="size-5" />
      </Link>

      <DarkInner
        toggled={isDark}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label="Switch color theme"
        className={cn(
          PILL_CLASS,
          'text-muted-foreground hover:text-foreground size-9 justify-center text-lg',
        )}
      />
    </div>
  )
}
