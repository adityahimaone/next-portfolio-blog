'use client'

import React from 'react'
import { Header } from '@/features/layout/components/header'
import { Footer } from '@/features/layout/components/footer'
import { SectionDivider } from '@/components/section-divider'
import { WaveformHero } from '@/components/redesign/hero-concepts'
import { StudioSessionAbout } from '@/components/redesign/about-concepts'
import { ModularSynthSkills } from '@/components/redesign/skills-concepts'
import { TourPosterExperience } from '@/components/redesign/experience-concepts'
import { RecordStoreCrateProjects } from '@/components/redesign/projects-concepts'
import { DjBoothContact } from '@/components/redesign/contact-concepts'

export default function MixPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section id="hero">
          <WaveformHero />
        </section>

        <div className="mx-auto w-full max-w-7xl space-y-2 px-4 py-10">
          <SectionDivider />

          {/* About Section */}
          <section id="about" className="scroll-mt-20">
            <StudioSessionAbout />
          </section>

          <SectionDivider />

          {/* Skills Section */}
          <section id="skills" className="scroll-mt-20">
            <ModularSynthSkills />
          </section>

          <SectionDivider />

          {/* Experience Section */}
          <section id="experience" className="scroll-mt-20">
            <TourPosterExperience />
          </section>

          <SectionDivider />

          {/* Projects Section */}
          <section id="projects" className="scroll-mt-20">
            <RecordStoreCrateProjects />
          </section>

          <SectionDivider />

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-20">
            <DjBoothContact />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
