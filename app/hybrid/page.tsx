'use client'

import React from 'react'
import { Header } from '@/features/layout/components/header'
import { Footer } from '@/features/layout/components/footer'
import { SectionDivider } from '@/components/section-divider'
import { ColdTypeRevealHero } from '@/components/redesign/hero-concepts'
import { ArtistOneSheetAbout } from '@/components/redesign/about-concepts'
import { SignalChainSkills } from '@/components/redesign/skills-concepts'
import { AlbumLinerCreditsExperience } from '@/components/redesign/experience-concepts'
import { MusicVideoProjects } from '@/components/redesign/projects-concepts'
import { MixingBoardContact } from '@/components/redesign/contact-concepts'

export default function HybridPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section id="hero">
          <ColdTypeRevealHero />
        </section>

        <div className="mx-auto w-full max-w-7xl space-y-2 py-10 px-4">
          <SectionDivider />
          
          {/* About Section */}
          <section id="about" className="scroll-mt-20">
            <ArtistOneSheetAbout />
          </section>

          <SectionDivider />

          {/* Skills Section */}
          <section id="skills" className="scroll-mt-20">
            <SignalChainSkills />
          </section>

          <SectionDivider />

          {/* Experience Section */}
          <section id="experience" className="scroll-mt-20">
            <AlbumLinerCreditsExperience />
          </section>

          <SectionDivider />

          {/* Projects Section */}
          <section id="projects" className="scroll-mt-20">
            <MusicVideoProjects />
          </section>

          <SectionDivider />

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-20">
            <MixingBoardContact />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
