'use client'

/**
 * Ravemped 3.0 — Footer
 *
 * Minimal footer — session metadata. BPM counter, year, links.
 * Consistent with DAW session theme.
 */

import Link from 'next/link'
import { Github, Linkedin, Mail } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Mixtape', href: '/mixtape' },
]

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/adityahimaone', icon: Github },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/adityahimawan', icon: Linkedin },
  { label: 'Email', href: 'mailto:halo@adityahimaone.space', icon: Mail },
]

export function FooterR3() {
  return (
    <footer className="border-t border-[var(--r3-edge)] bg-[var(--r3-bg)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {/* Left: branding + session info */}
        <div className="space-y-1">
          <p className="r3-display text-sm font-semibold text-[var(--r3-text)]">
            aditya himawan
          </p>
          <p className="r3-mono text-[9px] tracking-widest text-[var(--r3-text-mute)]">
            SESSION 2026 · 120 BPM · 4/4
          </p>
        </div>

        {/* Center: nav links */}
        <nav className="flex flex-wrap gap-4" aria-label="Footer navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] transition-colors hover:text-[var(--r3-filament)]"
            >
              {link.label.toUpperCase()}
            </Link>
          ))}
        </nav>

        {/* Right: social icons */}
        <div className="flex items-center gap-3">
          {SOCIAL_LINKS.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith('mailto') ? undefined : '_blank'}
                rel={social.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                aria-label={social.label}
                className="text-[var(--r3-text-mute)] transition-colors hover:text-[var(--r3-filament)]"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            )
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--r3-edge)] px-4 py-3 text-center sm:px-6">
        <p className="r3-mono text-[9px] tracking-widest text-[var(--r3-text-mute)]">
          © {new Date().getFullYear()} ADITYA HIMAWAN · BUILT WITH NEXT.JS + TONE.JS · ALL TRACKS ORIGINAL
        </p>
      </div>
    </footer>
  )
}
