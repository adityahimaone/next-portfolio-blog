'use client'

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
} from 'motion/react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { CHAPTERS, SOCIALS, scrollToSection } from './studio-data'
import styles from './studio.module.css'

type Props = {
  active: string
  scrolled: boolean
  footerVisible: boolean
}

const NAV = CHAPTERS.filter((chapter) => chapter.id !== 'home')

export function SiteHeader({ active, scrolled, footerVisible }: Props) {
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
      trigger?.focus()
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    // Let the overlay leave before the page moves under it.
    window.setTimeout(() => scrollToSection(id, reduced), reduced ? 0 : 180)
  }

  return (
    <>
      <header
        className={cn(styles.header, footerVisible && styles.headerHidden)}
        inert={footerVisible}
      >
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
          style={{
            scaleX: scrollYProgress,
            backgroundColor: 'var(--tangerine)',
          }}
        />
        <div
          className={cn(styles.headerBar, scrolled && styles.headerBarScrolled)}
        >
          <div
            className={cn(
              styles.shell,
              'flex h-16 items-center justify-between gap-4',
            )}
          >
            <a
              href="#home"
              className={cn(styles.brand, 'group flex items-center gap-2.5')}
              onClick={(event) => {
                event.preventDefault()
                go('home')
              }}
            >
              <span className={styles.brandMark} aria-hidden>
                AH
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] leading-tight tracking-[0.16em] uppercase">
                <span className="block font-semibold">Aditya Himawan</span>
                <span className="block text-[var(--muted)]">
                  design engineer
                </span>
              </span>
            </a>

            <nav
              className="hidden items-center gap-6 lg:flex"
              aria-label="Chapters"
            >
              {NAV.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  className={styles.navLink}
                  data-active={active === chapter.id}
                  onClick={() => go(chapter.id)}
                >
                  {chapter.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className={styles.headerCta}
                onClick={() => go('contact')}
              >
                Say hi
                <span aria-hidden>↗</span>
              </button>
              <button
                ref={triggerRef}
                type="button"
                className={cn(styles.menuButton, 'lg:hidden')}
                aria-label="Open the chapter menu"
                aria-expanded={open}
                aria-controls="chapter-menu"
                onClick={() => setOpen(true)}
              >
                <Menu size={17} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            id="chapter-menu"
            className={styles.menuPanel}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Chapters"
          >
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase opacity-60">
                Side A · {CHAPTERS.length} chapters
              </span>
              <button
                ref={closeRef}
                type="button"
                className="grid size-11 place-items-center rounded-full border border-[var(--paper)]/40 text-[var(--paper)]"
                onClick={() => setOpen(false)}
                aria-label="Close the chapter menu"
              >
                <X size={19} />
              </button>
            </div>

            <motion.nav
              className="mt-8 flex flex-1 flex-col justify-center"
              aria-label="All chapters"
              initial={reduced ? false : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.28,
                delay: 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {NAV.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  className={styles.menuLink}
                  onClick={() => go(chapter.id)}
                >
                  {chapter.label}
                  <small>{chapter.number}</small>
                </button>
              ))}
            </motion.nav>

            <div className="mt-8 grid gap-4 border-t border-[var(--paper)]/20 pt-5 sm:grid-cols-2">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Link
                  href="/projects"
                  className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.14em] uppercase opacity-75 hover:opacity-100"
                >
                  All projects ↗
                </Link>
                <Link
                  href="/blog"
                  className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.14em] uppercase opacity-75 hover:opacity-100"
                >
                  Notes ↗
                </Link>
                <Link
                  href="/bookmarks"
                  className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.14em] uppercase opacity-75 hover:opacity-100"
                >
                  Bookmarks ↗
                </Link>
                <Link
                  href="/music"
                  className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.14em] uppercase opacity-75 hover:opacity-100"
                >
                  Mixtape ↗
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.14em] uppercase opacity-75 hover:opacity-100"
                  >
                    {social.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
