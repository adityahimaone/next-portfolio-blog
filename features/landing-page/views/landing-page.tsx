'use client'
import { useEffect, useRef, useState } from 'react'
import { LazyMotion, m, AnimatePresence } from 'motion/react'
import dynamic from 'next/dynamic'

const loadFeatures = () => import('motion/react').then((res) => res.domMax)

import { Preloader } from '../animations/preloader'
import { HeaderV2 } from '@/features/layout/components/header-v2'
import { Footer } from '@/features/layout/components/footer'
import { HeroSectionV2 } from '../components/hero/hero-section'
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

import { SectionDivider } from '@/components/section-divider'
import { ChevronUp } from 'lucide-react'
import { usePreloader } from '../hooks/use-preloader'

export default function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
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
          <StudioBackground />

          {/* Main content */}
          <main className="relative">
            <div className="snap-y snap-mandatory">
              {/* Hero Section */}
              <section className="relative h-screen snap-start overflow-hidden">
                <div className="relative">
                  <HeaderV2 />
                  <HeroSectionV2 />
                </div>
              </section>

              {/* Music-themed marquee divider */}
              <MusicMarquee speed="normal" direction="left" />

              {/* Main Content Sections */}
              <div className="mx-auto w-full max-w-7xl space-y-2 py-20">
                <SectionDivider />
                <section id="about" className="snap-start scroll-mt-0">
                  <AboutSection />
                </section>

                <SectionDivider />
                <section id="skills" className="snap-start scroll-mt-0">
                  <SkillsSection />
                </section>

                <SectionDivider />
                <section id="experience" className="snap-start scroll-mt-0">
                  <ExperienceSection />
                </section>

                <SectionDivider />
              </div>

              <section
                id="projects"
                className="dark:bg-void border-graphite/10 dark:border-graphite/35 snap-start scroll-mt-0 border-y"
              >
                <ProjectsSection />
              </section>

              <div className="mb-5">
                <SectionDivider />
              </div>

              <section id="contact" className="snap-start">
                <ContactSection />
              </section>
            </div>
          </main>
        </m.div>

        {/* Footer */}
        <Footer />

        {/* Scroll to top button */}
        <m.button
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
          className="fixed right-2 bottom-24 z-50 flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-300 bg-zinc-200 shadow-[0_4px_0_rgb(161,161,170),0_5px_10px_rgba(0,0,0,0.2)] transition-all hover:bg-zinc-100 active:translate-y-1 active:shadow-none md:right-8 dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-[0_4px_0_rgb(39,39,42),0_5px_10px_rgba(0,0,0,0.5)] dark:hover:bg-zinc-700"
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
