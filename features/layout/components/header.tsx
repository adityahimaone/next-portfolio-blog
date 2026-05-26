'use client'

/**
 * The Mixing Console — global header.
 *
 * Sleek horizontal mixing strip fixed to the top. Nav items styled as
 * motorized fader channels. Active section's fader physically slides up
 * via Motion's layoutId. On subpages, collapses to a minimal back-bar.
 *
 * Behaviour:
 *  - Tracks active section via IntersectionObserver
 *  - Mobile: collapsible drawer with the same fader treatment
 *  - Always dark, no theme toggle (the concept is "live concert")
 */
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'
import {
  HOMEPAGE_NAV_ITEMS,
  PAGE_LINKS,
  SUBPAGE_NAV_ITEMS,
} from '../constants'

export function Header() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  const [active, setActive] = useState<string>('overture')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Scroll-state — shrinks header & adds backdrop after first scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Section tracking via IntersectionObserver — homepage only
  useEffect(() => {
    if (!isHomepage) return

    const ids = HOMEPAGE_NAV_ITEMS.map((i) => i.href.replace('/#', ''))
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to top with the largest visible portion
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0 && visible[0].target.id) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [isHomepage])

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Subpage minimal header
  if (!isHomepage) {
    return (
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-edge bg-base/85 backdrop-blur-md'
            : 'border-b border-transparent bg-base/40'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-12">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="led-dot" aria-hidden="true" />
            <span className="font-mono text-sm tracking-widest text-text-main group-hover:text-accent transition-colors">
              ADIT.LIVE
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            {SUBPAGE_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/' ? false : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`meta-label transition-colors hover:text-accent ${
                    isActive ? 'text-accent' : ''
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
    )
  }

  // Homepage: Mixing Console
  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-edge bg-base/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-base/30 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-12">
          {/* Logo / Brand */}
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent),0_0_16px_rgba(139,92,246,0.5)] transition-all group-hover:scale-125"
              aria-hidden="true"
            />
            <span className="font-mono text-xs tracking-[0.2em] text-text-main md:text-sm">
              ADIT<span className="text-accent">.LIVE</span>
            </span>
          </Link>

          {/* Desktop fader rack */}
          <nav
            className="hidden lg:flex items-end gap-1"
            aria-label="Set list navigation"
          >
            {HOMEPAGE_NAV_ITEMS.map((item) => {
              const id = item.href.replace('/#', '')
              const isActive = active === id
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group relative flex h-12 flex-col items-center justify-end px-3"
                >
                  {/* Fader track */}
                  <div className="absolute top-1.5 bottom-6 w-px bg-edge" />
                  {/* Fader cap — slides up when active */}
                  <motion.div
                    initial={false}
                    animate={{
                      y: isActive ? -22 : 0,
                      backgroundColor: isActive
                        ? 'var(--color-accent)'
                        : 'var(--color-elevated)',
                    }}
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    className="absolute top-6 h-3 w-5 rounded-[2px] border border-edge-strong shadow-[0_2px_8px_rgba(0,0,0,0.6)] group-hover:border-accent"
                  />
                  {/* Track label */}
                  <span
                    className={`mt-1 font-mono text-[9px] tracking-[0.2em] transition-colors ${
                      isActive
                        ? 'text-accent'
                        : 'text-text-muted group-hover:text-text-main'
                    }`}
                  >
                    {item.track} · {item.name}
                  </span>
                </Link>
              )
            })}

            {/* Page links — push buttons */}
            <div className="ml-4 flex items-center gap-2 border-l border-edge pl-4">
              {PAGE_LINKS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded border border-edge px-3 py-1.5 font-mono text-[10px] tracking-widest text-text-muted transition-all hover:border-accent hover:text-accent"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded border border-edge text-text-main transition-colors hover:border-accent hover:text-accent"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={drawerRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-16 z-40 border-y border-edge bg-base/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="mx-auto max-w-7xl divide-y divide-edge px-4 py-2">
              {HOMEPAGE_NAV_ITEMS.map((item) => {
                const id = item.href.replace('/#', '')
                const isActive = active === id
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-[10px] tracking-widest ${
                          isActive ? 'text-accent' : 'text-text-dim'
                        }`}
                      >
                        TRK {item.track}
                      </span>
                      <span
                        className={`font-mono text-sm tracking-widest ${
                          isActive ? 'text-accent' : 'text-text-main'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {isActive && (
                      <span className="led-dot" aria-hidden="true" />
                    )}
                  </Link>
                )
              })}
              <div className="flex gap-2 pt-3 pb-1">
                {PAGE_LINKS.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded border border-edge px-3 py-2 text-center font-mono text-xs tracking-widest text-text-muted hover:border-accent hover:text-accent"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
