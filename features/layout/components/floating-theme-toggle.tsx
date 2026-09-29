'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

import { DarkInner } from '@/components/ui/dark-inner'
import { useRefraction } from '@/hooks/use-media'
import { cn } from '@/lib/utils'

import styles from './floating-theme-toggle.module.css'

/**
 * The theme control the booth routes render in the viewport corner.
 *
 * The booth pages own nothing but the dock, so there was nowhere for a theme
 * control to live until now. It reuses the global `glass` class rather than
 * restating the surface, which keeps the reduced-transparency and
 * high-contrast fallbacks in one place, and reuses `DarkInner` so the toggle
 * animates identically to the one in the top bar.
 */
export function FloatingThemeToggle({
  inFlow,
  className,
}: {
  /** Drops the fixed positioning so the control can sit in a flex row. */
  inFlow?: boolean
  className?: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const refract = useRefraction()
  const ref = useRef<HTMLSpanElement>(null)
  const frame = useRef(0)

  useEffect(() => setMounted(true), [])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // The specular highlight tracks the pointer. Written on the element itself:
  // setting it on a parent would recalculate styles for every descendant.
  function onPointerMove(event: React.PointerEvent<HTMLSpanElement>) {
    const element = ref.current
    if (!element) return
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const bounds = element.getBoundingClientRect()
      element.style.setProperty('--mx', `${event.clientX - bounds.left}px`)
      element.style.setProperty('--my', `${event.clientY - bounds.top}px`)
    })
  }

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <span
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        'glass',
        styles.toggle,
        inFlow && styles.inFlow,
        refract && styles.refract,
        className,
      )}
    >
      <DarkInner
        toggled={isDark}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label="Switch color theme"
        className={cn(
          'flex size-full items-center justify-center text-lg outline-none',
          'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
          styles.inner,
        )}
      />
    </span>
  )
}
