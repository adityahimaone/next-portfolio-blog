import { ManifestoSection } from '../components/manifesto-section'
import { ProfileSection } from '../components/profile-section'
import { WorkSection } from '../components/work-section'
import { StackSection } from '../components/stack-section'
import { TimelineSection } from '../components/timeline-section'
import { ContactSection } from '../components/contact-section'
import { V3CustomCursor } from '../components/_shared/v3-custom-cursor'
import { V3FloatingNav } from '../components/_shared/v3-floating-nav'
import { V3MarqueeTape } from '../components/_shared/v3-marquee-tape'
import { V3LoaderIntro } from '../components/_shared/v3-loader-intro'

/**
 * LandingPageV3 — Spatial + Motion edition.
 *
 * Section flow:
 *   01 Manifesto  → full-screen pinned hero with shader background
 *   02 Profile    → editorial bio with reveal-on-scroll
 *   ── marquee tape ──
 *   03 Work       → drag-scroll catalog with tilt cards
 *   04 Stack      → orbital floating tag cloud
 *   ── marquee tape (reverse) ──
 *   05 Timeline   → vertical chronology with rail
 *   06 Contact    → closing CTA with shader background
 *
 * Globals:
 *   - V3CustomCursor: tactile pointer with multiple states
 *   - V3FloatingNav: minimal section indicator (right edge, desktop only)
 *   - V3LoaderIntro: cinematic 2.4s intro (skipped on reduced-motion)
 */
export function LandingPageV3() {
  return (
    <div className="v3-root min-h-screen">
      <V3LoaderIntro />
      <V3CustomCursor />
      <V3FloatingNav />

      <main className="relative">
        <ManifestoSection />
        <ProfileSection />

        <V3MarqueeTape />

        <WorkSection />
        <StackSection />

        <V3MarqueeTape reverse />

        <TimelineSection />
        <ContactSection />
      </main>
    </div>
  )
}

export default LandingPageV3
