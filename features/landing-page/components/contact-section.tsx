'use client'

/**
 * Ravemped 3.0 — Contact Section (Export / Bounce Dialog)
 *
 * Concept: Session selesai, saatnya bounce ke file dan kirim ke dunia.
 * Export dialog abstrak — satu tindakan, satu klik.
 */

import { m, useReducedMotion } from 'motion/react'
import { Mail, Github, Linkedin, ExternalLink } from 'lucide-react'
import { SectionFrame } from '../r3/section-frame'

const CONTACTS = [
  {
    label: 'Email',
    value: 'halo@adityahimaone.space',
    href: 'mailto:halo@adityahimaone.space',
    icon: Mail,
  },
  {
    label: 'GitHub',
    value: 'github.com/adityahimaone',
    href: 'https://github.com/adityahimaone',
    icon: Github,
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/adityahimawan',
    href: 'https://linkedin.com/in/adityahimawan',
    icon: Linkedin,
  },
]

export function ContactSection() {
  const prefersReduced = useReducedMotion()

  return (
    <SectionFrame
      id="contact"
      track="08"
      name="CONTACT"
      device="Export / Bounce"
      color="signal"
    >
      <div className="mx-auto max-w-2xl">
        {/* Export dialog frame */}
        <m.div
          initial={prefersReduced ? false : { scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="r3-panel-rack space-y-6 border-[var(--r3-edge)] p-6 sm:p-8"
        >
          {/* Dialog header */}
          <div className="space-y-2 border-b border-[var(--r3-edge)] pb-4">
            <h2 className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
              EXPORT PROJECT
            </h2>
            <p className="r3-display text-lg font-semibold text-[var(--r3-text)]">
              aditya_himawan_2026.flp
            </p>
          </div>

          {/* Export settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="r3-mono text-xs tracking-widest text-[var(--r3-text-mute)]">
                FORMAT
              </span>
              <span className="r3-mono text-xs text-[var(--r3-text)]">
                COLLABORATION
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="r3-mono text-xs tracking-widest text-[var(--r3-text-mute)]">
                QUALITY
              </span>
              <span className="r3-mono text-xs text-[var(--r3-text)]">
                MAX
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="r3-mono text-xs tracking-widest text-[var(--r3-text-mute)]">
                DESTINATION
              </span>
              <span className="r3-mono text-xs text-[var(--r3-filament)]">
                YOUR INBOX
              </span>
            </div>
          </div>

          {/* Progress bar (visual only) */}
          <div className="space-y-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--r3-edge)]">
              <m.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                className="h-full bg-[var(--r3-filament)]"
              />
            </div>
            <p className="r3-mono text-[9px] text-[var(--r3-text-mute)]">
              RENDERING...
            </p>
          </div>

          {/* Contact destinations */}
          <div className="space-y-3 border-t border-[var(--r3-edge)] pt-4">
            <p className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
              SEND TO
            </p>
            <div className="space-y-2">
              {CONTACTS.map((contact, idx) => {
                const Icon = contact.icon
                return (
                  <m.a
                    key={contact.label}
                    href={contact.href}
                    target={contact.href.startsWith('mailto') ? undefined : '_blank'}
                    rel={contact.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    initial={prefersReduced ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group flex items-center gap-3 rounded-sm border border-[var(--r3-edge)] bg-[var(--r3-rack)] px-3 py-2 transition-colors hover:border-[var(--r3-filament)] hover:bg-[var(--r3-rack)]/80"
                  >
                    <Icon className="h-4 w-4 text-[var(--r3-text-mute)] group-hover:text-[var(--r3-filament)]" aria-hidden />
                    <div className="flex-1">
                      <p className="r3-mono text-[9px] tracking-widest text-[var(--r3-text-mute)]">
                        {contact.label}
                      </p>
                      <p className="r3-mono text-xs text-[var(--r3-text)]">
                        {contact.value}
                      </p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-[var(--r3-text-mute)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </m.a>
                )
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 border-t border-[var(--r3-edge)] pt-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex-1 rounded-sm border border-[var(--r3-edge)] bg-transparent px-3 py-2 r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] transition-colors hover:border-[var(--r3-text-mute)] hover:text-[var(--r3-text)]"
            >
              CANCEL
            </button>
            <a
              href="mailto:halo@adityahimaone.space"
              className="flex-1 rounded-sm border border-[var(--r3-filament)] bg-[var(--r3-filament)]/10 px-3 py-2 r3-mono text-[10px] tracking-widest text-[var(--r3-filament)] transition-colors hover:bg-[var(--r3-filament)]/20"
            >
              BOUNCE ▶
            </a>
          </div>
        </m.div>

        {/* Session end message */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="r3-mono text-[9px] tracking-widest text-[var(--r3-text-mute)]">
            Project saved. Session ended.
            <br />
            See you in the next one.
          </p>
        </m.div>
      </div>
    </SectionFrame>
  )
}
