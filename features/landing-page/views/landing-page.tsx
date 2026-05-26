'use client'

/**
 * Ravemped 3.0 — Landing page orchestrator.
 *
 * Wraps all r3 sections in `.r3-root` so design tokens apply only here.
 * Subroutes (/blog, /projects, /music) keep their legacy header/theme.
 *
 * Section order matches the plan:
 *   00 Preloader → 01 Hero → 02 About → 03 Skills → 04 Projects
 *      → 05 Music → 06 Blog → 07 Contact
 */

import dynamic from 'next/dynamic'
import { LazyMotion } from 'motion/react'

import { PreloaderLayer } from '../r3/preloader'
import { Playhead } from '../r3/playhead'
import { MixerHeader } from '../components/mixer-header'
import { HeroSection } from '../components/hero-section'

const loadFeatures = () => import('motion/react').then((res) => res.domMax)

const AboutSection = dynamic(() =>
  import('../components/about-section').then((m) => m.AboutSection),
)
const SkillsSection = dynamic(() =>
  import('../components/skills-section').then((m) => m.SkillsSection),
)
const ProjectsSection = dynamic(() =>
  import('../components/projects-section').then((m) => m.ProjectsSection),
)
const MusicSection = dynamic(() =>
  import('../components/music-section').then((m) => m.MusicSection),
)
const BlogSection = dynamic(() =>
  import('../components/blog-section').then((m) => m.BlogSection),
)
const ContactSection = dynamic(() =>
  import('../components/contact-section').then((m) => m.ContactSection),
)
const FooterR3 = dynamic(() =>
  import('../components/footer-r3').then((m) => m.FooterR3),
)

export default function LandingPage() {
  return (
    <LazyMotion features={loadFeatures}>
      <PreloaderLayer>
        <div className="r3-root r3-grain relative min-h-screen">
          <Playhead />
          <MixerHeader />
          <main className="relative z-[2]">
            <HeroSection />
            <AboutSection />
            <SkillsSection />
            <ProjectsSection />
            <MusicSection />
            <BlogSection />
            <ContactSection />
          </main>
          <FooterR3 />
        </div>
      </PreloaderLayer>
    </LazyMotion>
  )
}
