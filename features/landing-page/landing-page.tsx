'use client'
import { useEffect, useRef, useState } from 'react'
import {
  LazyMotion,
  domMax,
  m,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  AnimatePresence,
} from 'motion/react'
import { Preloader } from './animations/preloader'
import { HeaderKnob } from '@/features/layout/header'
import { Footer2025V2 } from '@/features/layout/footer'
import { HeroSection2025v2 } from './sections/hero'
import { AboutSection2025v2 } from './sections/about'
import { SkillsMixer } from './sections/skills'
import { ExperienceSection2025 } from './sections/experience'
import { ContactLaunchpad } from './sections/contact'
import { SectionDivider } from '@/components/section-divider'
import { ChevronUp } from 'lucide-react'
import { MusicPlayer } from './spotify/music-player'
import { MusicMarquee } from './spotify/music-marquee'
import { ProjectsSection2025 } from './sections/projects'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  })
  const mainRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(mainRef, { once: false })
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const parallaxY = useTransform(heroScrollY, [0, 1], [0, 100])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Parallax effect for background elements
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  // Opacity for floating elements based on scroll
  const floatingOpacity = useTransform(scrollYProgress, [0, 0.2], [0.2, 0])

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
    <LazyMotion features={domMax}>
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
          {/* Music notes scattered in background */}
          <m.div
            className="pointer-events-none fixed top-1/3 right-[15%] text-5xl"
            style={{ opacity: floatingOpacity }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, -15, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 1,
            }}
          >
            <span className="text-secondary opacity-20 drop-shadow-md">♫</span>
          </m.div>

          <m.div
            className="pointer-events-none fixed bottom-1/4 left-1/4 text-6xl"
            style={{ opacity: floatingOpacity }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 2,
            }}
          >
            <span className="text-primary-light opacity-20 drop-shadow-md">
              ♩
            </span>
          </m.div>

          <m.div
            className="pointer-events-none fixed right-1/4 bottom-1/3 text-5xl"
            style={{ opacity: floatingOpacity }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 3,
            }}
          >
            <span className="text-accent opacity-20 drop-shadow-md">♬</span>
          </m.div>

          {/* Main content */}
          <main className="relative">
            <div className="snap-y snap-mandatory">
              {/* Hero Section */}
              <section
                ref={heroRef}
                className="relative h-screen snap-start overflow-hidden"
              >
                <div className="relative">
                  <HeaderKnob />
                  <HeroSection2025v2 />
                </div>
              </section>

              {/* Music-themed marquee divider */}
              <MusicMarquee speed="normal" direction="left" />

              {/* Main Content Sections */}
              <div className="mx-auto w-full max-w-7xl space-y-2 py-20">
                <SectionDivider />
                <section id="about" className="snap-start scroll-mt-0">
                  <AboutSection2025v2 />
                </section>

                <SectionDivider />
                <section id="skills" className="snap-start scroll-mt-0">
                  <SkillsMixer />
                </section>

                <SectionDivider />
                <section id="experience" className="snap-start scroll-mt-0">
                  <ExperienceSection2025 />
                </section>

                <SectionDivider />
              </div>

              <section
                id="projects"
                className="dark:bg-accent snap-start scroll-mt-0"
              >
                <ProjectsSection2025 />
              </section>

              <div className="mb-5">
                <SectionDivider />
              </div>

              <section id="contact" className="snap-start">
                <ContactLaunchpad />
              </section>
            </div>
          </main>
        </m.div>

        {/* Footer */}
        <Footer2025V2 />

        {/* Scroll to top button */}
        <m.button
          onClick={handleScrollToTop}
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

        {/* Music Player */}
        <MusicPlayer />
      </>
    </LazyMotion>
  )
}
