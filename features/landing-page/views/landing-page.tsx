'use client'
import { useEffect, useRef, useState } from 'react'
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

import { Preloader } from '../animations/preloader'
import { Header } from '@/features/layout/components/header'
import { Footer } from '@/features/layout/components/footer'
import { HeroSection } from '../components/hero-section'

const AboutSection = dynamic(() => import('../components/about-section').then((mod) => mod.AboutSection))
const SkillsSection = dynamic(() => import('../components/skills-section').then((mod) => mod.SkillsSection))
const ExperienceSection = dynamic(() => import('../components/experience-section').then((mod) => mod.ExperienceSection))
const ContactSection = dynamic(() => import('../components/contact/contact-section').then((mod) => mod.ContactSection))
const ProjectsSection = dynamic(() => import('../components/projects-section').then((mod) => mod.ProjectsSection))
const MusicMarquee = dynamic(() => import('../spotify/music-marquee').then((mod) => mod.MusicMarquee))

import { SectionConnector } from '@/components/section-connector'
import { ChevronUp } from 'lucide-react'
import { usePreloader } from '../hooks/use-preloader'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  })
  const mainRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const isLoading = usePreloader()

  // Scroll progress bar width
  const progressWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%'])

  // Handle scroll to top
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const body = document.querySelector('body')
    if (body) {
      body.classList.add('cursor-glow')
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <LazyMotion features={loadFeatures}>
      <>
        <AnimatePresence mode="wait">
          {isLoading && <Preloader />}
        </AnimatePresence>

        <m.div
          ref={mainRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Audio Transport Progress Bar */}
          <m.div
            className="fixed top-0 left-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-copper via-accent to-copper-light dark:from-copper-light dark:via-accent-light dark:to-copper"
            style={{ width: progressWidth }}
          />
          {/* Glow effect on progress bar */}
          <m.div
            className="fixed top-0 left-0 z-[59] h-[6px] origin-left bg-gradient-to-r from-copper/40 via-accent/40 to-copper-light/40 blur-sm"
            style={{ width: progressWidth }}
          />

          {/* Main content */}
          <main className="relative">
            <div className="snap-y snap-mandatory">
              {/* ═══════════════════════════════════════════════════════
                  CH 00 — HERO: "Signal On"
                  The studio powers up. Live session begins.
              ═══════════════════════════════════════════════════════ */}
              <section
                className="relative h-screen snap-start overflow-hidden"
              >
                <div className="relative">
                  <Header />
                  <HeroSection />
                </div>
              </section>

              {/* Music-themed marquee divider */}
              <MusicMarquee speed="normal" direction="left" />

              {/* ═══════════════════════════════════════════════════════
                  CH 01 — ABOUT: "The Producer"
                  Meet who's behind the mixing board.
              ═══════════════════════════════════════════════════════ */}
              <div className="mx-auto w-full max-w-7xl py-20">
                <SectionConnector variant="waveform" channelNumber={1} label="IDENTITY" />

                <section id="about" className="snap-start scroll-mt-0">
                  <AboutSection />
                </section>

                {/* ═══════════════════════════════════════════════════════
                    CH 02 — SKILLS: "The Gear Check"
                    Calibrating the equipment.
                ═══════════════════════════════════════════════════════ */}
                <SectionConnector variant="cable" channelNumber={2} label="AUDIO ENGINE" />

                <section id="skills" className="snap-start scroll-mt-0">
                  <SkillsSection />
                </section>

                {/* ═══════════════════════════════════════════════════════
                    CH 03 — EXPERIENCE: "The Discography"
                    Career albums on the shelf.
                ═══════════════════════════════════════════════════════ */}
                <SectionConnector variant="frequency" channelNumber={3} label="DISCOGRAPHY" />

                <section id="experience" className="snap-start scroll-mt-0">
                  <ExperienceSection />
                </section>

                <SectionConnector variant="groove" channelNumber={4} label="RELEASES" />
              </div>

              {/* ═══════════════════════════════════════════════════════
                  CH 04 — PROJECTS: "Featured Releases"
                  Each project is a pressed vinyl.
              ═══════════════════════════════════════════════════════ */}
              <section
                id="projects"
                className="dark:bg-accent snap-start scroll-mt-0"
              >
                <ProjectsSection />
              </section>

              {/* ═══════════════════════════════════════════════════════
                  CH 05 — CONTACT: "Book a Session"
                  The launchpad — interact to connect.
              ═══════════════════════════════════════════════════════ */}
              <div className="mx-auto w-full max-w-7xl">
                <SectionConnector variant="cable" channelNumber={5} label="SESSION BOOKING" />
              </div>

              <section id="contact" className="snap-start">
                <ContactSection />
              </section>
            </div>
          </main>
        </m.div>

        {/* Footer */}
        <Footer />

        {/* Scroll to top button — styled as REWIND */}
        <m.button
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
          className="fixed right-2 bottom-24 z-50 flex h-12 w-12 items-center justify-center rounded-lg border border-stone-300 bg-stone-200 shadow-[0_4px_0_rgb(168,162,158),0_5px_10px_rgba(0,0,0,0.2)] transition-all hover:bg-stone-100 active:translate-y-1 active:shadow-none md:right-8 dark:border-stone-700 dark:bg-stone-800 dark:shadow-[0_4px_0_rgb(41,37,36),0_5px_10px_rgba(0,0,0,0.5)] dark:hover:bg-stone-700"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: showScrollTop ? 1 : 0,
            scale: showScrollTop ? 1 : 0.8,
            y: showScrollTop ? 0 : 50,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronUp size={24} className="text-stone-600 dark:text-stone-400" />
        </m.button>
      </>
    </LazyMotion>
  )
}
