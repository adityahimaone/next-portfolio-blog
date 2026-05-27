'use client'

import { motion, useInView } from 'motion/react'
import Link from 'next/link'
import { useRef } from 'react'
import { Github, Linkedin, Music, Mail, Radio } from 'lucide-react'
import { SOCIAL_LINKS, FOOTER_NAVIGATION, TECH_STACK } from '../constants'

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const currentYear = new Date().getFullYear()

  return (
    <footer
      ref={ref}
      className="relative overflow-hidden border-t border-white/5"
      style={{ background: 'var(--nm-bg)', boxShadow: 'var(--nm-inset)' }}
    >
      <div className="relative container mx-auto px-4 pt-16 pb-8">
        {/* Output Stage Header */}
        <div className="mb-12 flex items-center justify-center">
          <div className="flex items-center gap-3">
            {/* Spinning tape reel border */}
            <motion.div
              className="h-8 w-8 rounded-full border-2 border-dashed border-zinc-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            <span className="font-mono text-xs font-bold tracking-[0.3em] text-zinc-500 uppercase">
              Output Stage
            </span>
            <motion.div
              className="h-8 w-8 rounded-full border-2 border-dashed border-zinc-600"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand Section */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
            >
              <Link
                href="/"
                className="group inline-flex items-center gap-3"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ boxShadow: 'var(--nm-raised)' }}
                >
                  <Radio className="h-5 w-5 text-[var(--accent-cyan)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter text-zinc-300">
                    adityahimaone
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Frontend Developer
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="flex w-fit items-center gap-2 rounded-full px-3 py-1.5"
              style={{ boxShadow: 'var(--nm-flat)' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-green)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-green)]" />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[var(--accent-green)]">
                Available
              </span>
            </motion.div>
          </div>

          {/* Social Links */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              <h3 className="mb-5 text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                Connect
              </h3>
              <div className="flex flex-wrap gap-3">
                {SOCIAL_LINKS.map((link, idx) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit my ${link.name} profile`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-105"
                    style={{ boxShadow: 'var(--nm-raised)' }}
                  >
                    {link.name.toLowerCase().includes('git') ? (
                      <Github className="h-4 w-4 text-zinc-400" />
                    ) : link.name.toLowerCase().includes('link') ? (
                      <Linkedin className="h-4 w-4 text-zinc-400" />
                    ) : link.name.toLowerCase().includes('spot') ? (
                      <Music className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <Mail className="h-4 w-4 text-zinc-400" />
                    )}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
            >
              <h3 className="mb-5 text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                Navigate
              </h3>
              <ul className="space-y-2">
                {FOOTER_NAVIGATION.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-xs text-zinc-500 transition-colors hover:text-[var(--accent-cyan)]"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Tech Stack */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
            >
              <h3 className="mb-5 text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {TECH_STACK.map((tech) => (
                  <span
                    key={tech}
                    className="rounded px-2 py-1 text-[10px] font-mono text-zinc-500"
                    style={{ boxShadow: 'var(--nm-flat)' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-[10px] font-mono text-zinc-600 md:flex-row"
        >
          <span>
            © {currentYear} adityahimaone. All Signals Reserved.
          </span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-zinc-500 transition-colors hover:text-[var(--accent-cyan)]"
          >
            ↑ BACK TO TOP
          </button>
        </motion.div>
      </div>
    </footer>
  )
}
