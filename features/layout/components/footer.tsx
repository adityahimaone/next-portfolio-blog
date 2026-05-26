'use client'

/**
 * Footer — encore credits roll.
 *
 * Vinyl-style footer, no theme toggle. Reuses SOCIAL_LINKS,
 * FOOTER_NAVIGATION, TECH_STACK from layout/constants.
 */
import { motion, useInView } from 'motion/react'
import Link from 'next/link'
import { useRef } from 'react'
import { Disc3 } from 'lucide-react'
import { SOCIAL_LINKS, FOOTER_NAVIGATION, TECH_STACK } from '../constants'

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const year = new Date().getFullYear()

  return (
    <footer
      ref={ref}
      className="relative overflow-hidden border-t border-edge bg-base"
    >
      {/* Spinning record decoration */}
      <div className="pointer-events-none absolute -bottom-32 -right-16 opacity-[0.04]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        >
          <Disc3 className="h-72 w-72 text-text-main" />
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-10 md:px-12">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
          {/* Credits / brand */}
          <div className="md:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <span className="meta-label text-accent">CREDITS</span>
              <Link href="/" className="mt-2 block">
                <h3 className="display-heading text-3xl md:text-4xl">
                  ADITYA<br />
                  <span className="text-accent">HIMAONE</span>
                </h3>
              </Link>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-text-muted">
                A frontend developer who treats every page like a track. Mixed
                in Jakarta, mastered for the modern web.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-sm border border-accent-alt/30 bg-accent-alt/10 px-3 py-1.5">
                <span className="led-dot led-dot--green" aria-hidden="true" />
                <span className="font-mono text-xs tracking-widest text-accent-alt">
                  ON AIR · OPEN TO PROJECTS
                </span>
              </div>
            </motion.div>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <span className="meta-label">PAGES</span>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_NAVIGATION.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 font-mono text-sm tracking-wide text-text-main hover:text-accent"
                  >
                    <span className="h-px w-3 bg-edge transition-all group-hover:w-6 group-hover:bg-accent" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-4">
            <span className="meta-label">CONNECT</span>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-sm border border-edge px-3 py-2 transition-all hover:border-accent"
                  >
                    <div className="font-mono text-xs tracking-widest text-text-main">
                      {link.name.toUpperCase()}
                    </div>
                    <div className="meta-label mt-0.5 truncate text-text-dim">
                      {link.label}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech stack strip */}
        <div className="border-y border-edge py-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="meta-label">RIG ·</span>
            {TECH_STACK.map((t, i) => (
              <span key={t} className="meta-label text-text-main">
                {t}
                {i < TECH_STACK.length - 1 && (
                  <span className="ml-3 text-text-dim">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-text-dim md:flex-row md:items-center">
          <span className="font-mono tracking-wide">
            © {year} adityahimaone — all tracks composed in browser, mastered in motion.
          </span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-mono tracking-widest text-text-muted hover:text-accent"
          >
            ↑ REWIND TO START
          </button>
        </div>
      </div>
    </footer>
  )
}
