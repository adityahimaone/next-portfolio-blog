import { HeroSection } from '../components/hero-section'
import { AboutSection } from '../components/about-section'
import { CreditsSection } from '../components/credits-section'
import { DiscographySection } from '../components/discography-section'
import { CatalogSection } from '../components/catalog-section'
import { BookingSection } from '../components/booking-section'

/**
 * LandingPageV2 — editorial / liner-notes aesthetic.
 * Renders inside .v2-root so design tokens stay scoped.
 *
 * Server component shell. Sections opt-in to 'use client' as needed.
 */
export function LandingPageV2() {
  return (
    <div className="v2-root min-h-screen">
      <main className="mx-auto w-full max-w-[1400px]">
        <HeroSection />
        <AboutSection />
        <CreditsSection />
        <DiscographySection />
        <CatalogSection />
        <BookingSection />
      </main>
    </div>
  )
}

export default LandingPageV2
