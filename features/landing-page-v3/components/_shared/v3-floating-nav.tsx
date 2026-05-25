'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { SECTIONS_V3 } from '../../constants'

/**
 * V3FloatingNav — minimal floating section index.
 * Highlights active section based on scroll position.
 * Hidden on mobile to keep things calm.
 */
export function V3FloatingNav() {
  const [active, setActive] = useState<string>('manifesto')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const sections = SECTIONS_V3.map((s) => ({
      id: s.id,
      el: document.getElementById(s.id),
    })).filter((s) => s.el !== null)

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      },
    )

    sections.forEach(({ el }) => {
      if (el) obs.observe(el)
    })

    // Show after first scroll
    const showOnScroll = () => {
      if (window.scrollY > 200) setVisible(true)
    }
    window.addEventListener('scroll', showOnScroll, { passive: true })
    showOnScroll()

    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', showOnScroll)
    }
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Section navigation"
      className="pointer-events-none fixed top-1/2 right-8 z-40 hidden -translate-y-1/2 md:block"
    >
      <ul className="pointer-events-auto flex flex-col gap-3">
        {SECTIONS_V3.map((s) => {
          const isActive = active === s.id
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                data-cursor="link"
                className="group relative flex items-center justify-end gap-3"
              >
                <span
                  className="v3-mono opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    color: isActive ? 'var(--v3-paper)' : 'var(--v3-fg-muted)',
                  }}
                >
                  {s.index} · {s.label}
                </span>
                <span
                  aria-hidden
                  className="block h-px transition-all duration-300"
                  style={{
                    background: isActive ? 'var(--v3-iris-1)' : 'var(--v3-fog)',
                    width: isActive ? '32px' : '16px',
                  }}
                />
              </a>
            </li>
          )
        })}
      </ul>
    </motion.nav>
  )
}

export default V3FloatingNav
