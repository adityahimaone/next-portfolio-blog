import { HeroSection } from '@/features/landing-page/components/hero-section'
import { AboutSection } from '@/features/landing-page/components/about-section'
import { SkillsSection } from '@/features/landing-page/components/skills-section'
import { ProjectsSection } from '@/features/landing-page/components/projects-section'
import { BlogSection } from '@/features/landing-page/components/blog-section'
import { ContactSection } from '@/features/landing-page/components/contact/contact-section'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black-true">
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <BlogSection />
      <ContactSection />
    </main>
  )
}
