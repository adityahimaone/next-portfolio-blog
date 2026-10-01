'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

import { VenLogo } from '@/features/layout/components/ven-logo'
import { DarkInner } from '@/components/ui/dark-inner'
import { FloatingThemeToggle } from './floating-theme-toggle'
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
        {/* The inner row is capped to the same 1500px box as the hairline and
            the hero panel. The bar itself still fills the stage, because the
            line is its top edge and is measured against its padding box — so
            capping the bar would have moved the line too, and capping only the
            chips is what keeps the logo and the toggle inside the line's two
            ends at every width. */}
        <div className={styles.topBarInner}>
          <Link
            href="/"
            aria-label="Aditya Himawan, home"
            className={cn(styles.mark, 'pointer-events-auto shrink-0')}
          >
            <VenLogo />
          </Link>

          {/* Same control the booth routes render, so the two are one
              component rather than two lookalikes. `inFlow` drops the fixed
              positioning so it lands in this flex row. */}
          <FloatingThemeToggle
            inFlow
            className={cn(styles.toggle, 'size-9 shrink-0')}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'pointer-events-none flex items-center gap-3 px-4 pt-4 sm:px-6',
        'justify-between',
      )}
    >
      <Link
        href="/"
        aria-label="Aditya Himawan, home"
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
