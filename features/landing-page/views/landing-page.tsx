'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import {
  LazyMotion,
  m,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from 'motion/react'
import dynamic from 'next/dynamic'

const loadFeatures = () => import('motion/react').then((res) => res.domMax)

import { BootScreen } from '../components/boot-screen'
import { TENavbar } from '../components/te-navbar'
import { HeroSection } from '../components/hero-section'

const AboutSection = dynamic(() => import('../components/about-section').then((mod) => mod.AboutSection))
const SkillsSection = dynamic(() => import('../components/skills-section').then((mod) => mod.SkillsSection))
const ExperienceSection = dynamic(() => import('../components/experience-section').then((mod) => mod.ExperienceSection))
const ContactSection = dynamic(() => import('../components/contact/contact-section').then((mod) => mod.ContactSection))
const ProjectsSection = dynamic(() => import('../components/projects-section').then((mod) => mod.ProjectsSection))
const MusicMarquee = dynamic(() => import('../spotify/music-marquee').then((mod) => mod.MusicMarquee))

import { Footer } from '@/features/layout/components/footer'
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

  // Opacity for floating elements based on scroll
  const floatingOpacity = useTransform(scrollYProgress, [0, 0.2], [0.2, 0])

  // Handle scroll to top
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    // Show scroll-to-top button after scrolling down
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
          {/* Main content — Signal Chain themed */}
          <main className="signal-chain-root relative">
            {/* Navigation — TE TP-7 styled transport controls */}
            <TENavbar />

            {/* Hero Section — OP-1 Field centerpiece */}
            <section
              id="hero"
              className="relative h-dvh snap-start overflow-hidden"
            >
              <HeroSection />
            </section>

            {/* LCD-style marquee ticker is now part of HeroSection */}

            {/* About Section — FL Piano Roll timeline + Marshall Amp */}
            <section id="about" className="snap-start scroll-mt-0">
              <AboutSection />
            </section>

            <SectionDivider />

            {/* Skills Section — DJ Mixer + TX6 */}
            <section id="skills" className="snap-start scroll-mt-0">
              <SkillsSection />
            </section>

            <SectionDivider />

            {/* Experience Section — Turntable vinyl record player */}
            <section id="experience" className="snap-start scroll-mt-0">
              <ExperienceSection />
            </section>

            <SectionDivider />

            {/* Projects Section — DAP Digital Audio Player */}
            <section
              id="projects"
              className="dark:bg-accent snap-start scroll-mt-0"
            >
              <ProjectsSection />
            </section>

            <SectionDivider />

            {/* Contact Section — Maschine Mk3 pad grid */}
            <section id="contact" className="snap-start">
              <ContactSection />
            </section>
          </main>
        </m.div>

        {/* Footer — Patch Bay style */}
        <Footer />

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
