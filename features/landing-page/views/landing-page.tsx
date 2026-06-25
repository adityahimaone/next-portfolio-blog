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
import { Screw } from '@/components/screw'
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
                <CableConnector color="#C84B4B" fromLabel="HERO" toLabel="ABOUT" sway="left" disabled={isMobile} />
                <ParallaxSection
                  id="about"
                  className="snap-start scroll-mt-0 px-6 sm:px-10"
                  disabled={isMobile}
                  bgSpeed={0.12}
                  backgroundLayer={
                    <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] select-none pointer-events-none">
                      {/* DAW playlist arrangement lanes */}
                      <div className="h-full w-full border-t border-b border-black/10 dark:border-white/10 flex flex-col justify-between">
                        {['TRACK 01: ARRANGEMENT VIEW', 'TRACK 02: ANALOG SYNTH', 'TRACK 03: FM BASS', 'TRACK 04: DRUM SEQUENCER'].map((track, i) => (
                          <div key={i} className="flex-1 border-b border-black/10 dark:border-white/10 p-4 font-mono text-[9px] tracking-wider text-black dark:text-white flex justify-between items-center">
                            <span>{track}</span>
                            <span className="opacity-40">M S R 🟢</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                >
                  <AboutSection />
                </ParallaxSection>

                <CableConnector color="#C9A447" fromLabel="ABOUT" toLabel="SKILLS" sway="right" disabled={isMobile} />
                <ParallaxSection
                  id="skills"
                  className="snap-start scroll-mt-0 px-6 sm:px-10"
                  disabled={isMobile}
                  bgSpeed={0.18}
                  backgroundLayer={
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] select-none pointer-events-none">
                      {/* MIDI grid matrix dots */}
                      <div className="h-full w-full bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:16px_16px]" />
                    </div>
                  }
                  midLayer={
                    <div className="absolute inset-0 select-none pointer-events-none">
                      {/* Warm hardware panel glow & channel assignment */}
                      <div className="absolute bottom-0 left-1/4 h-36 w-72 rounded-full bg-amber-500/8 dark:bg-amber-500/12 blur-3xl" />
                      <div className="absolute top-12 right-12 font-mono text-[9px] font-bold text-black/20 dark:text-white/15 tracking-widest">
                        MIDI DEVICE CHANNEL: 10
                      </div>
                    </div>
                  }
                >
                  <SkillsSection />
                </ParallaxSection>

                <CableConnector color="#7ABB5E" fromLabel="SKILLS" toLabel="EXP" sway="left" disabled={isMobile} />
                <ParallaxSection
                  id="experience"
                  className="snap-start scroll-mt-0 px-10 sm:px-16"
                  disabled={isMobile}
                  bgSpeed={0.1}
                  backgroundLayer={
                    <div className="absolute inset-y-0 left-0 right-0 flex justify-between pointer-events-none opacity-45 dark:opacity-65 select-none z-0">
                      {/* Left Rack Rail */}
                      <div className="w-6 h-full bg-zinc-300/40 dark:bg-zinc-900/40 border-r border-black/15 dark:border-white/5 flex flex-col justify-around items-center py-10 shadow-inner backdrop-blur-xs">
                        <Screw />
                        <Screw />
                        <Screw />
                      </div>
                      {/* Right Rack Rail */}
                      <div className="w-6 h-full bg-zinc-300/40 dark:bg-zinc-900/40 border-l border-black/15 dark:border-white/5 flex flex-col justify-around items-center py-10 shadow-inner backdrop-blur-xs">
                        <Screw />
                        <Screw />
                        <Screw />
                      </div>
                    </div>
                  }
                >
                  <ExperienceSection />
                </ParallaxSection>

                <CableConnector color="#4A9EC9" fromLabel="EXP" toLabel="WORK" sway="right" disabled={isMobile} />
              </div>

              <ParallaxSection
                id="projects"
                className="dark:bg-void border-graphite/10 dark:border-graphite/35 snap-start scroll-mt-0 border-y px-6 sm:px-10"
                disabled={isMobile}
                bgSpeed={0.2}
                backgroundLayer={
                  <div className="absolute inset-0 select-none pointer-events-none">
                    {/* Deep neon studio glow and circular record markings */}
                    <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-blue-500/8 dark:bg-blue-500/12 blur-3xl" />
                    <div className="absolute bottom-20 left-20 h-48 w-48 rounded-full bg-purple-500/6 dark:bg-purple-500/10 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 border border-dashed border-black/[0.03] dark:border-white/[0.04] rounded-full" />
                  </div>
                }
              >
                <ProjectsSection />
              </ParallaxSection>

              <CableConnector color="#8A5FC9" fromLabel="WORK" toLabel="CONTACT" sway="left" disabled={isMobile} />

              <ParallaxSection
                id="contact"
                className="snap-start px-6 sm:px-10"
                disabled={isMobile}
                bgSpeed={0.1}
                edgeFade={false}
                backgroundLayer={
                  <div className="absolute inset-0 select-none pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-purple-500/6 dark:bg-purple-500/12 blur-3xl" />
                  </div>
                }
                midLayer={
                  <div className="absolute inset-y-0 left-6 sm:left-12 flex flex-col justify-between py-16 font-mono text-[7px] font-bold text-black/15 dark:text-white/10 pointer-events-none select-none">
                    <span>LEVEL MAX —</span>
                    <span>+3 dB —</span>
                    <span>0 dB —</span>
                    <span>-6 dB —</span>
                    <span>-18 dB —</span>
                    <span>-inf —</span>
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
