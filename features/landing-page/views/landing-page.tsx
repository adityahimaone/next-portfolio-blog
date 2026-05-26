'use client'

/**
 * The Concept Album — landing page orchestrator.
 *
 * Wires the six tracks in order. RecordGroove + Header live in app/layout.tsx.
 * No preloader, no audio context, no scroll-snap (RecordGroove is the
 * connective tissue, not snap points). Each section is wrapped in
 * TrackSection from inside its own component, so this view stays thin.
 */
import { HeroSection } from '../components/hero-section'
import { AboutSection } from '../components/about-section'
import { SkillsSection } from '../components/skills-section'
import { ExperienceSection } from '../components/experience-section'
import { ProjectsSection } from '../components/projects-section'
import { ContactSection } from '../components/contact/contact-section'
import { Footer } from '@/features/layout/components/footer'

export default function LandingPage() {
  return (
    <>
      <main className="relative">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
