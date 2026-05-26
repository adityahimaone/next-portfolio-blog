'use client'

/**
 * Editorial v4.0 — Landing page orchestrator.
 *
 * Wraps all v4 sections in editorial design language.
 * Section order:
 *   00 Preloader → 01 Hero → 02 About → 03 Skills → 04 Experience → 05 Projects
 *      → 06 Music → 07 Blog → 08 Contact
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
// Phase 3 — Experience + Projects v4 sections
const ExperienceSectionV4 = dynamic(() =>
  import('../components/experience-section-v4').then(
    (m) => m.ExperienceSectionV4,
  ),
)
const ProjectsSectionV4 = dynamic(() =>
  import('../components/projects-section-v4').then((m) => m.ProjectsSectionV4),
)
// Phase 4 — Music + Contact v4 sections
const MusicSectionV4 = dynamic(() =>
  import('../components/music-section-v4').then((m) => m.MusicSectionV4),
)
const ContactSectionV4 = dynamic(() =>
  import('../components/contact-section-v4').then((m) => m.ContactSectionV4),
)
// Sections from existing v3 — will be replaced phase by phase
const BlogSection = dynamic(() =>
  import('../components/blog-section').then((m) => m.BlogSection),
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
          {/* Phase 3: Experience + Projects v4 sections */}
          <ExperienceSectionV4 />
          <ProjectsSectionV4 />
          {/* Phase 4: Music + Contact v4 sections */}
          <MusicSectionV4 />
          <BlogSection />
          <ContactSectionV4 />
        </main>
      </div>
    </LazyMotion>
  )
}
