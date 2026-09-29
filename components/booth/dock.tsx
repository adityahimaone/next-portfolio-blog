'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGroup, motion } from 'motion/react'
import { Bookmark, Home, Layers, Music, Newspaper } from 'lucide-react'
import { useDockSlotValue } from './dock-slot'
import { useRefraction } from './hooks'
import styles from './dock.module.css'

const ITEMS = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/projects', label: 'Projects', Icon: Layers },
  { href: '/bookmarks', label: 'Bookmarks', Icon: Bookmark },
  { href: '/blog', label: 'Blog', Icon: Newspaper },
  { href: '/music', label: 'Music', Icon: Music },
] as const

/**
 * The one persistent glass surface. Destinations never disappear: the
 * current page's transport grows in beside them, so the control layer
 * changes shape instead of swapping.
 */
export function Dock() {
  const pathname = usePathname()
  const slot = useDockSlotValue()
  const refract = useRefraction()
  const navRef = useRef<HTMLElement>(null)
  const raf = useRef(0)

  // One rAF handler drives the pointer-following specular for the whole dock.
  useEffect(() => {
    const el = navRef.current
    if (!el) return

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
        el.style.setProperty('--my', `${event.clientY - rect.top}px`)
      })
    }

    el.addEventListener('pointermove', onMove)
    return () => {
      el.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <LayoutGroup>
      <nav
        ref={navRef}
        aria-label="Primary"
        className={`${styles.dock} glass ${refract ? styles.refract : ''}`}
      >
        <ul className={styles.items}>
          {ITEMS.map(({ href, label, Icon }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={styles.link}
                  data-active={active || undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="dock-active"
                      className={styles.activePip}
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  <Icon size={19} aria-hidden="true" />
                </Link>
              </li>
            )
          })}
        </ul>

        {slot && (
          <motion.div
            layout
            className={styles.slot}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <span className={styles.slotRule} aria-hidden="true" />
            {slot}
          </motion.div>
        )}
      </nav>
    </LayoutGroup>
  )
}
