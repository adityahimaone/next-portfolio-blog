'use client'

import React from 'react'
import { Header } from '@/features/layout/components/header'
import { Footer } from '@/features/layout/components/footer'
import { SectionDivider } from '@/components/section-divider'
import { DapDeviceHero } from '@/components/redesign/hero-concepts'
import { CassetteLinerAbout } from '@/components/redesign/about-concepts'
import { RackUnitSkills } from '@/components/redesign/skills-concepts'
import { TapeLabelExperience } from '@/components/redesign/experience-concepts'
import { TechnicalRiderProjects } from '@/components/redesign/projects-concepts'
import { RadioCallInContact } from '@/components/redesign/contact-concepts'

export default function AltPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section id="hero">
          <DapDeviceHero />
        </section>

        <div className="mx-auto w-full max-w-7xl space-y-2 py-10 px-4">
          <SectionDivider />
          
          {/* About Section */}
          <section id="about" className="scroll-mt-20">
            <CassetteLinerAbout />
          </section>

          <SectionDivider />

          {/* Skills Section */}
          <section id="skills" className="scroll-mt-20">
            <RackUnitSkills />
          </section>

          <SectionDivider />

          {/* Experience Section */}
          <section id="experience" className="scroll-mt-20">
            <TapeLabelExperience />
          </section>

          <SectionDivider />

          {/* Projects Section */}
          <section id="projects" className="scroll-mt-20">
            <TechnicalRiderProjects />
          </section>

          <SectionDivider />

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-20">
            <RadioCallInContact />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
