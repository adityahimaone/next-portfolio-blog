'use client'

import { useEffect, useState } from 'react'
import { HUDBar } from '@/components/layout/hud-bar'
import { HeroSection } from '../components/hero-section'
import { AboutSection } from '../components/about-section'
import { SkillsSection } from '../components/skills-section'
import { ProjectsSection } from '../components/projects-section'
import { BlogSection } from '../components/blog-section'
import { ContactSection } from '../components/contact/contact-section'
import { StageDivider } from '@/components/ui'

export default function LandingPage() {
  const [currentStage, setCurrentStage] = useState({ num: '01', name: 'TITLE' })

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'hero', num: '01', name: 'TITLE' },
        { id: 'about', num: '02', name: 'CHARACTER' },
        { id: 'skills', num: '03', name: 'INVENTORY' },
        { id: 'projects', num: '04', name: 'QUEST' },
        { id: 'blog', num: '05', name: 'ARCHIVES' },
        { id: 'contact', num: '06', name: 'SAVE' },
      ]

      const scrollY = window.scrollY + 100
      let current = sections[0]

      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el && el.offsetTop <= scrollY) {
          current = section
        }
      }

      setCurrentStage(current)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // initial call
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black-true">
      <HUDBar currentStage={currentStage} />

      <main className="relative">
        <HeroSection />
        <StageDivider variant="loading" label="LOADING CHARACTER SELECT..." />
        <AboutSection />
        <StageDivider variant="glitch" label="INVENTORY ACCESS" />
        <SkillsSection />
        <StageDivider variant="loading" label="LOADING QUEST LOG..." />
        <ProjectsSection />
        <StageDivider variant="glitch" label="ARCHIVES UNLOCKED" />
        <BlogSection />
        <StageDivider variant="door" />
        <ContactSection />
      </main>
    </div>
  )
}
