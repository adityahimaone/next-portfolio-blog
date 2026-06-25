'use client'
import { useEffect, useRef, useState } from 'react'
import { LazyMotion, m, AnimatePresence } from 'motion/react'
import dynamic from 'next/dynamic'

const loadFeatures = () => import('motion/react').then((res) => res.domMax)

import { Preloader } from '../animations/preloader'
import { HeaderDaw } from '@/features/layout'
import { Footer } from '@/features/layout/components/footer'
import { DawHero } from '../components/hero'
import { StudioBackground } from '@/components/studio-background'

const AboutSection = dynamic(() =>
  import('../components/about-section').then((mod) => mod.AboutSection),
)
const SkillsSection = dynamic(() =>
  import('../components/skills-section').then((mod) => mod.SkillsSection),
)
const ExperienceSection = dynamic(() =>
  import('../components/experience-section').then(
    (mod) => mod.ExperienceSection,
  ),
)
const ContactSection = dynamic(() =>
  import('../components/contact/contact-section').then(
    (mod) => mod.ContactSection,
  ),
)
const ProjectsSection = dynamic(() =>
  import('../components/projects-section').then((mod) => mod.ProjectsSection),
)
const MusicMarquee = dynamic(() =>
  import('../spotify/music-marquee').then((mod) => mod.MusicMarquee),
)

import { ParallaxSection } from '@/components/parallax-section'
import { CableConnector } from '@/components/cable-connector'
import { ChevronUp } from 'lucide-react'
import { usePreloader } from '../hooks/use-preloader'

export default function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const isLoading = usePreloader()

  // Handle scroll to top
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    // Preload any assets or initialize animations
    const body = document.querySelector('body')
    if (body) {
      body.classList.add('cursor-glow')
    }

    // Show scroll-to-top button after scrolling down
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)

    // Mobile media query check
    const mql = window.matchMedia('(max-width: 768px)')
    setIsMobile(mql.matches)
    const handleMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handleMobileChange)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      mql.removeEventListener('change', handleMobileChange)
    }
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
          <StudioBackground />

          {/* Main content */}
          <main className="relative">
            <div className="snap-y snap-mandatory">
              {/* Hero Section */}
              <section className="relative h-screen snap-start overflow-hidden">
                <div className="relative">
                  <HeaderDaw />
                  <DawHero />
                </div>
              </section>

              {/* Music-themed marquee divider */}
              <MusicMarquee speed="normal" direction="left" />

              {/* Main Content Sections */}
              <div className="mx-auto w-full max-w-7xl py-20">
                <CableConnector color="#C84B4B" fromLabel="HERO" toLabel="ABOUT" disabled={isMobile} />
                <ParallaxSection
                  id="about"
                  className="snap-start scroll-mt-0"
                  disabled={isMobile}
                  bgSpeed={0.12}
                  backgroundLayer={
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]">
                      <div className="h-full w-full bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:24px_24px]" />
                    </div>
                  }
                >
                  <AboutSection />
                </ParallaxSection>

                <CableConnector color="#C9A447" fromLabel="ABOUT" toLabel="SKILLS" disabled={isMobile} />
                <ParallaxSection
                  id="skills"
                  className="snap-start scroll-mt-0"
                  disabled={isMobile}
                  bgSpeed={0.18}
                  backgroundLayer={
                    <div className="absolute inset-0">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-48 w-[500px] rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-3xl" />
                    </div>
                  }
                >
                  <SkillsSection />
                </ParallaxSection>

                <CableConnector color="#7ABB5E" fromLabel="SKILLS" toLabel="EXP" disabled={isMobile} />
                <ParallaxSection
                  id="experience"
                  className="snap-start scroll-mt-0"
                  disabled={isMobile}
                  bgSpeed={0.1}
                  backgroundLayer={
                    <div className="absolute inset-0">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full border border-black/[0.03] dark:border-white/[0.04]" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full border border-black/[0.03] dark:border-white/[0.04]" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[200px] rounded-full border border-black/[0.03] dark:border-white/[0.04]" />
                    </div>
                  }
                >
                  <ExperienceSection />
                </ParallaxSection>

                <CableConnector color="#4A9EC9" fromLabel="EXP" toLabel="WORK" disabled={isMobile} />
              </div>

              <ParallaxSection
                id="projects"
                className="dark:bg-void border-graphite/10 dark:border-graphite/35 snap-start scroll-mt-0 border-y"
                disabled={isMobile}
                bgSpeed={0.2}
                backgroundLayer={
                  <div className="absolute inset-0">
                    <div className="absolute top-20 right-20 h-60 w-60 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl" />
                    <div className="absolute bottom-20 left-20 h-40 w-40 rounded-full bg-purple-500/8 dark:bg-purple-500/12 blur-3xl" />
                  </div>
                }
              >
                <ProjectsSection />
              </ParallaxSection>

              <CableConnector color="#8A5FC9" fromLabel="WORK" toLabel="CONTACT" disabled={isMobile} />

              <ParallaxSection
                id="contact"
                className="snap-start"
                disabled={isMobile}
                bgSpeed={0.1}
                edgeFade={false}
                backgroundLayer={
                  <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-purple-500/8 dark:bg-purple-500/15 blur-3xl" />
                  </div>
                }
              >
                <ContactSection />
              </ParallaxSection>
            </div>
          </main>
        </m.div>

        {/* Footer */}
        <Footer />

        {/* Scroll to top button */}
        <m.button
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
          className="fixed right-2 bottom-8 z-50 flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-300 bg-zinc-200 shadow-[0_4px_0_rgb(161,161,170),0_5px_10px_rgba(0,0,0,0.2)] transition-all hover:bg-zinc-100 active:translate-y-1 active:shadow-none md:right-8 dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-[0_4px_0_rgb(39,39,42),0_5px_10px_rgba(0,0,0,0.5)] dark:hover:bg-zinc-700"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: showScrollTop ? 1 : 0,
            scale: showScrollTop ? 1 : 0.8,
            y: showScrollTop ? 0 : 50,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronUp size={24} className="text-zinc-600 dark:text-zinc-400" />
        </m.button>
      </>
    </LazyMotion>
  )
}
