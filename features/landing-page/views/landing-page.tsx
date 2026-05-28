'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import {
  LazyMotion,
  m,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  AnimatePresence,
} from 'motion/react'
import dynamic from 'next/dynamic'

const loadFeatures = () => import('motion/react').then((res) => res.domMax)

import { BootScreen } from '../components/boot-screen'
import { TENavbar } from '../components/te-navbar'
import { HeroSection } from '../components/hero-section'
import { PatchCableConnector } from '../components/PatchCableConnector'

const AboutSection = dynamic(() => import('../components/about-section').then((mod) => mod.AboutSection))
const SkillsSection = dynamic(() => import('../components/skills-section').then((mod) => mod.SkillsSection))
const ExperienceSection = dynamic(() => import('../components/experience-section').then((mod) => mod.ExperienceSection))
const ContactSection = dynamic(() => import('../components/contact/contact-section').then((mod) => mod.ContactSection))
const ProjectsSection = dynamic(() => import('../components/projects-section').then((mod) => mod.ProjectsSection))
const MusicMarquee = dynamic(() => import('../spotify/music-marquee').then((mod) => mod.MusicMarquee))

import { SectionDivider } from '@/components/section-divider'
import { ChevronUp } from 'lucide-react'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  })
  const mainRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [booted, setBooted] = useState(false)

  const handleBootComplete = useCallback(() => {
    setBooted(true)
  }, [])

  // VU meter — maps scroll progress to meter level
  const vuLevel = useTransform(smoothProgress, [0, 1], [0, 100])
  const [vuPercent, setVuPercent] = useState(0)

  useMotionValueEvent(vuLevel, 'change', (v) => {
    setVuPercent(Math.round(v))
  })

  // Handle scroll to top
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <LazyMotion features={loadFeatures}>
      <>
        {/* Boot screen — OP-1 field startup sequence */}
        <AnimatePresence>
          {!booted && <BootScreen onComplete={handleBootComplete} />}
        </AnimatePresence>

        <m.div
          ref={mainRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: booted ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* VU Meter Scroll Indicator — vertical on right side */}
          <div
            className="fixed right-3 top-1/2 z-40 hidden h-40 w-2 -translate-y-1/2 flex-col items-center gap-1 md:flex"
            style={{ opacity: booted ? 1 : 0 }}
          >
            <span
              className="text-[6px] font-bold tracking-[0.2em]"
              style={{ color: '#555', fontFamily: 'var(--sc-font-mono)' }}
            >
              VU
            </span>
            {/* Meter container */}
            <div
              className="relative flex-1 w-full rounded-full overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Fill bar */}
              <m.div
                className="absolute bottom-0 left-0 w-full rounded-full"
                style={{
                  height: `${vuPercent}%`,
                  background: 'linear-gradient(to top, #00FF41, #FFB000, #FF3344)',
                }}
              />
            </div>
            <span
              className="text-[7px] font-bold"
              style={{ color: '#00FF41', fontFamily: 'var(--sc-font-mono)' }}
            >
              {vuPercent}%
            </span>
          </div>

          {/* Main content — Signal Chain themed */}
          <main className="signal-chain-root relative">
            {/* Navigation — TE TP-7 styled transport controls */}
            <TENavbar />

            {/* ──────── HERO → ABOUT ──────── */}
            {/* Hero Section — OP-1 Field centerpiece */}
            <section
              id="hero"
              className="relative h-dvh snap-start overflow-hidden"
            >
              <HeroSection />
            </section>

            {/* Patch Cable: OP-1 LINE OUT → Pre-Amplifier */}
            <PatchCableConnector
              color="#FF5500"
              label="LINE OUT → PRE-AMP"
              curveDirection="down"
            />

            {/* About Section — FL Piano Roll timeline + Marshall Amp */}
            <section id="about" className="snap-start scroll-mt-0">
              <AboutSection />
            </section>

            {/* Patch Cable: Amp Speaker Out → Mix Console */}
            <PatchCableConnector
              color="#00B4D8"
              label="SPEAKER OUT → MIX CONSOLE"
              curveDirection="up"
            />

            {/* Skills Section — DJ Mixer + TX6 */}
            <section id="skills" className="snap-start scroll-mt-0">
              <SkillsSection />
            </section>

            {/* Patch Cable: Master Out → Turntable */}
            <PatchCableConnector
              color="#00FF41"
              label="MASTER OUT → CDJ INPUT"
              curveDirection="down"
            />

            {/* Experience Section — Turntable vinyl record player */}
            <section id="experience" className="snap-start scroll-mt-0">
              <ExperienceSection />
            </section>

            {/* Patch Cable: Headphone Out → DAP Input */}
            <PatchCableConnector
              color="#FFB000"
              label="PHONES OUT → DAP LINE IN"
              curveDirection="up"
            />

            {/* Projects Section — DAP Digital Audio Player */}
            <section
              id="projects"
              className="dark:bg-accent snap-start scroll-mt-0"
            >
              <ProjectsSection />
            </section>

            {/* Patch Cable: USB-C → Maschine Input */}
            <PatchCableConnector
              color="#D4CFCA"
              label="USB-C → MASCHINE IN"
              curveDirection="down"
            />

            {/* Contact Section — Maschine Mk3 pad grid */}
            <section id="contact" className="snap-start">
              <ContactSection />
            </section>
          </main>

          {/* Patch Bay Footer */}
          <footer
            className="signal-chain-root relative overflow-hidden border-t py-12"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            {/* Scanline texture */}
            <div className="sc-scanlines pointer-events-none absolute inset-0 z-0 opacity-10" />

            <div className="container relative z-10 mx-auto max-w-4xl px-4">
              {/* PATCH BAY title */}
              <div className="mb-8 flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: '#00FF41', boxShadow: '0 0 8px rgba(0,255,65,0.5)' }}
                />
                <span
                  className="text-[10px] font-bold tracking-[0.25em]"
                  style={{ color: '#555', fontFamily: 'var(--sc-font-mono)' }}
                >
                  PATCH BAY — adityahimaone.space
                </span>
              </div>

              {/* Port rows */}
              <div className="space-y-4">
                {[
                  { label: 'GITHUB', href: 'https://github.com/adityahimaone', icon: 'github' },
                  { label: 'LINKEDIN', href: 'https://linkedin.com/in/adityahimaone', icon: 'linkedin' },
                  { label: 'SPOTIFY', href: 'https://open.spotify.com/user/adityahimaone', icon: 'spotify' },
                  { label: 'EMAIL', href: 'mailto:aditya.himaone@example.com', icon: 'mail' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded px-3 py-2 transition-colors hover:bg-white/5"
                  >
                    {/* Port jack — top row (output) */}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full border text-[8px] font-bold transition-all group-hover:border-green-500 group-hover:text-green-500"
                        style={{
                          borderColor: 'rgba(255,255,255,0.15)',
                          color: '#555',
                          fontFamily: 'var(--sc-font-mono)',
                        }}
                      >
                        {link.label[0]}
                      </div>
                      {/* Cable trace — animates on hover */}
                      <div
                        className="h-px w-8 transition-all group-hover:w-12"
                        style={{
                          background: `linear-gradient(90deg, rgba(0,255,65,0.5), rgba(0,255,65,0.1))`,
                          opacity: 0,
                        }}
                      />
                      {/* Bottom row (input) — lights up on hover */}
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full border text-[8px] font-bold transition-all group-hover:bg-green-500/20 group-hover:border-green-500"
                        style={{
                          borderColor: 'rgba(255,255,255,0.15)',
                          color: '#555',
                        }}
                      >
                        {link.label[0]}
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold tracking-wider transition-all group-hover:text-white"
                      style={{
                        color: '#7A7572',
                        fontFamily: 'var(--sc-font-mono)',
                      }}
                    >
                      {link.label}
                    </span>
                  </a>
                ))}
              </div>

              {/* Signal path complete line */}
              <div className="mt-10 flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,41,0.3), transparent)' }} />
                <span
                  className="text-[8px] font-bold tracking-[0.25em]"
                  style={{ color: '#333', fontFamily: 'var(--sc-font-mono)' }}
                >
                  SIGNAL PATH COMPLETE
                </span>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,41,0.3), transparent)' }} />
              </div>

              {/* Copyright */}
              <p
                className="mt-6 text-center text-[9px] tracking-wider"
                style={{ color: '#444', fontFamily: 'var(--sc-font-mono)' }}
              >
                © 2026 adityahimaone. All rights reserved.
              </p>
            </div>
          </footer>
        </m.div>

        {/* Scroll to top button — styled as TE hardware button */}
        <m.button
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
          className="fixed right-2 bottom-24 z-50 flex h-12 w-12 items-center justify-center rounded-lg border bg-zinc-800/90 backdrop-blur-sm transition-all hover:bg-zinc-700 active:translate-y-1 md:right-8"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.4), 0 5px 10px rgba(0,0,0,0.5)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: showScrollTop ? 1 : 0,
            scale: showScrollTop ? 1 : 0.8,
            y: showScrollTop ? 0 : 50,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronUp size={24} style={{ color: '#D4CFCA' }} />
        </m.button>
      </>
    </LazyMotion>
  )
}
