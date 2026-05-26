'use client'

/**
 * Editorial v4.0 — Landing page orchestrator.
 *
 * Wraps all v4 sections in editorial design language.
 * Section order:
 *   00 Preloader → 01 Hero → 02 About → 03 Skills → 04 Projects
 *      → 05 Music → 06 Blog → 07 Contact
 */

import dynamic from 'next/dynamic'
import { LazyMotion } from 'motion/react'

import { PreloaderV4 } from '../components/preloader-v4'
import { HeroSectionV4 } from '../components/hero-section-v4'
import { ScrollIndicator } from '../components/scroll-indicator'
import { HeaderV4 } from '../components/header-v4'

const loadFeatures = () => import('motion/react').then((res) => res.domMax)

// Phase 2 — v4 editorial sections
const AboutSectionV4 = dynamic(() =>
  import('../components/about-section-v4').then((m) => m.AboutSectionV4),
)
const SkillsSectionV4 = dynamic(() =>
  import('../components/skills-section-v4').then((m) => m.SkillsSectionV4),
)
// Sections from existing v3 — will be replaced phase by phase
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

export default function LandingPage() {
  return (
    <LazyMotion features={loadFeatures}>
      <PreloaderV4 />
      <div className="relative min-h-screen w-full">
        <HeaderV4 />
        <main className="relative z-[2]">
          <HeroSectionV4 />
          <ScrollIndicator />
          {/* Phase 2: About + Skills v4 sections */}
          <AboutSectionV4 />
          <SkillsSectionV4 />
          {/* Phase 3-4: remaining sections (using v3 temporarily) */}
          <ProjectsSection />
          <MusicSection />
          <BlogSection />
          <ContactSection />
        </main>
      </div>
    </LazyMotion>
  )
}
