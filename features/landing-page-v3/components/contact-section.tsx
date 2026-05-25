'use client'

import { motion } from 'motion/react'
import {
  ArrowUpRight,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
  type LucideIcon,
} from 'lucide-react'
import { useInView } from '../hooks/use-in-view'
import { CONTACT_V3 } from '../constants'
import { V3ShaderBackground } from './_shared/v3-shader-background'

/**
 * Map social platform name to Lucide icon.
 */
function socialIcon(name: string): LucideIcon {
  const k = name.toLowerCase()
  if (k.includes('github')) return Github
  if (k.includes('linkedin')) return Linkedin
  if (k.includes('twitter') || k === 'x') return Twitter
  if (k.includes('instagram')) return Instagram
  return ArrowUpRight
}

/**
 * ContactSection (06) — closing CTA with shader background.
 * Massive italic serif headline, single primary CTA, social rail.
 */
export function ContactSection() {
  const { ref, inView } = useInView({ once: true, threshold: 0.2 })

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="contact"
      className="v3-grain relative min-h-[100svh] overflow-hidden px-6 py-24 md:px-12 md:py-32"
      aria-labelledby="v3-contact-headline"
      style={{ background: 'var(--v3-void)' }}
    >
      <V3ShaderBackground intensity={0.5} />

      <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-1 md:col-span-3"
        >
          <div className="v3-mono" style={{ color: 'var(--v3-iris-1)' }}>
            {CONTACT_V3.kicker}
          </div>
          <div
            className="mt-3 h-px w-16"
            style={{ background: 'var(--v3-fog)' }}
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 hidden flex-col gap-4 md:flex"
          >
            <div>
              <div
                className="v3-mono"
                style={{ color: 'var(--v3-fg-muted)' }}
              >
                Available for
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {CONTACT_V3.availableFor.map((a) => (
                  <span
                    key={a}
                    className="v3-mono inline-flex items-center rounded-full border px-3 py-1"
                    style={{
                      borderColor: 'var(--v3-fog)',
                      color: 'var(--v3-paper)',
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Headline */}
        <h2
          id="v3-contact-headline"
          className="col-span-1 md:col-span-9"
          style={{
            fontSize: 'var(--v3-display-lg)',
            lineHeight: 0.88,
          }}
        >
          {CONTACT_V3.headline.split('\n').map((line, i) => (
            <span
              key={i}
              className={`block overflow-hidden ${
                i === 1 ? 'v3-display' : 'v3-display-sans'
              } ${i === 2 ? 'v3-iris-text' : ''}`}
            >
              <motion.span
                initial={{ y: '105%' }}
                animate={inView ? { y: '0%' } : {}}
                transition={{
                  duration: 1.1,
                  delay: 0.15 + i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ display: 'inline-block' }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>
      </div>

      {/* Body + CTA */}
      <div className="relative z-10 mt-16 grid grid-cols-1 gap-8 md:mt-24 md:grid-cols-12 md:gap-8">
        <div className="col-span-1 md:col-span-3" />
        <div className="col-span-1 md:col-span-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.9,
              delay: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-base md:text-lg"
            style={{
              color: 'var(--v3-fg-muted)',
              lineHeight: 1.65,
              maxWidth: '52ch',
            }}
          >
            {CONTACT_V3.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.9,
              delay: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href={CONTACT_V3.cta.href}
              className="v3-btn v3-btn-primary"
              data-cursor="link"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
              <span>{CONTACT_V3.cta.label}</span>
              <ArrowUpRight
                className="h-3.5 w-3.5"
                aria-hidden
                strokeWidth={2}
              />
            </a>
            <a
              href={`mailto:${CONTACT_V3.email}`}
              className="v3-mono inline-flex items-center gap-2 underline-offset-4 hover:underline"
              style={{ color: 'var(--v3-paper)' }}
              data-cursor="link"
            >
              {CONTACT_V3.email}
            </a>
          </motion.div>

          {/* Social rail */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-12 flex flex-wrap gap-3"
          >
            {CONTACT_V3.social.map((s) => {
              const Icon = socialIcon(s.label)
              return (
                <a
                  key={s.label}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  aria-label={`Visit ${s.label}`}
                  className="v3-mono group inline-flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-300 hover:border-[var(--v3-paper)]"
                  style={{
                    borderColor: 'var(--v3-fog)',
                    color: 'var(--v3-paper)',
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5 transition-colors duration-300"
                    style={{ color: 'var(--v3-iris-2)' }}
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  {s.label}
                  <ArrowUpRight
                    className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </a>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* Footer signature */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="relative z-10 mt-24 flex flex-col gap-4 border-t pt-8 md:mt-32 md:flex-row md:items-center md:justify-between"
        style={{ borderColor: 'var(--v3-fog)' }}
      >
        <div className="v3-mono" style={{ color: 'var(--v3-fg-muted)' }}>
          © 2026 ADITYA HIMAONE · ALL RIGHTS RESERVED
        </div>
        <div className="v3-mono" style={{ color: 'var(--v3-fg-muted)' }}>
          DESIGNED & BUILT IN BANDUNG · V3 SPATIAL EDITION
        </div>
      </motion.footer>
    </section>
  )
}

export default ContactSection
