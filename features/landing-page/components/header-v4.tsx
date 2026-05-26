'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const NAV_ITEMS = ['HOME', 'ABOUT', 'SKILLS', 'WORK', 'CONTACT']

export function HeaderV4() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-[100] transition-all duration-300"
        style={{
          backgroundColor: scrolled
            ? 'rgba(235, 235, 235, 0.85)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled
            ? '1px solid var(--color-slate)'
            : '1px solid transparent',
        }}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
          {/* Logo */}
          <a
            href="#"
            className="font-display text-lg transition-colors"
            style={{
              color: scrolled ? 'var(--color-ink)' : 'var(--color-off-white)',
            }}
          >
            AH
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-ui transition-colors hover:opacity-70"
                style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: scrolled
                    ? 'var(--color-ink)'
                    : 'var(--color-off-white)',
                }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col gap-1.5 md:hidden"
            aria-label="Toggle menu"
          >
            <span
              className="block h-[1px] w-5 transition-all"
              style={{
                backgroundColor: scrolled
                  ? 'var(--color-ink)'
                  : 'var(--color-off-white)',
                transform: mobileOpen ? 'rotate(45deg) translateY(5px)' : 'none',
              }}
            />
            <span
              className="block h-[1px] w-5 transition-all"
              style={{
                backgroundColor: scrolled
                  ? 'var(--color-ink)'
                  : 'var(--color-off-white)',
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block h-[1px] w-5 transition-all"
              style={{
                backgroundColor: scrolled
                  ? 'var(--color-ink)'
                  : 'var(--color-off-white)',
                transform: mobileOpen
                  ? 'rotate(-45deg) translateY(-5px)'
                  : 'none',
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-8 md:hidden"
            style={{ backgroundColor: 'var(--color-ink)' }}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                onClick={() => setMobileOpen(false)}
                className="font-display text-2xl"
                style={{
                  color: 'var(--color-off-white)',
                  letterSpacing: '0.08em',
                }}
              >
                {item}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
