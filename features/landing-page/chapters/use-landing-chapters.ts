'use client'

import type { RefObject } from 'react'
import { useEffect } from 'react'

import { RADIO_FLIP_ENABLED } from '../lib/flags'
import type { ChapterContext, ChapterCleanup } from './shared/engine'
import { setupScrollEngine } from './shared/scroll-engine'
import { heroChapter } from './hero/hero-chapter'
import { aboutChapter } from './about/about-chapter'
import { skillsChapter } from './skills/skills-chapter'
import { contactChapter } from './contact/contact-chapter'
import { dividersChapter } from './dividers/dividers-chapter'
import { headingRevealsChapter } from './shared/heading-reveals-chapter'
import { radioFlip } from './experience-work/radio-flip'

/**
 * The chapter orchestrator: the landing page's motion engine
 * while the radio flip is on.
 *
 * GSAP, ScrollTrigger and Lenis are all imported dynamically —
 * together they are a meaningful part of first load and nothing
 * moves without a scroll — and nothing at all runs under
 * `prefers-reduced-motion`, so those visitors never pay for the
 * download.
 *
 * Chapters are plain functions (they register ScrollTriggers and
 * return cleanups; they hold no React state of their own), so
 * they run inside the orchestrator's `gsap.context`, which scopes
 * their selectors to the rack root and reverts every trigger on
 * unmount. The divider chapter runs at every width — it is the
 * one timeline that also animated phones in the previous engine —
 * while the rest are desktop chapters, gated to the same
 * `min-width: 769px` block the previous engine used.
 */
export function useLandingChapters({
  rootRef,
  setAboutIndex,
  setAboutProgress,
  setExperienceIndex,
}: {
  rootRef: RefObject<HTMLDivElement | null>
  setAboutIndex: React.Dispatch<React.SetStateAction<number>>
  setAboutProgress: React.Dispatch<React.SetStateAction<number>>
  setExperienceIndex: React.Dispatch<React.SetStateAction<number>>
}) {
  useEffect(() => {
    let cancelled = false
    const cleanups: Array<() => void> = []

    const setup = async () => {
      if (
        !RADIO_FLIP_ENABLED ||
        !rootRef.current ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        return

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled || !rootRef.current) return
      gsap.registerPlugin(ScrollTrigger)

      // The chapters reach for elements across the whole rack, so
      // give the tree a frame before any selector runs — the same
      // grace the previous engine gave the portalled eject proxy.
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      if (cancelled || !rootRef.current) return

      const teardownEngine = await setupScrollEngine(gsap, ScrollTrigger)
      if (cancelled) {
        teardownEngine()
        return
      }
      cleanups.push(teardownEngine)

      const root = rootRef.current
      const ctx: ChapterContext = {
        root,
        gsap,
        ScrollTrigger,
        setAboutIndex,
        setAboutProgress,
        setExperienceIndex,
      }

      const context = gsap.context(() => {
        const media = gsap.matchMedia()

        // The dividers are the one timeline that ran on phones
        // too, so they stay outside the desktop block.
        const dividerCleanup = dividersChapter(ctx)

        media.add('(min-width: 769px)', () => {
          const chapterCleanups: ChapterCleanup[] = [
            heroChapter(ctx),
            aboutChapter(ctx),
            skillsChapter(ctx),
            contactChapter(ctx),
            headingRevealsChapter(ctx),
            radioFlip(ctx),
          ]
          return () => chapterCleanups.forEach((cleanup) => cleanup?.())
        })

        return () => {
          media.revert()
          dividerCleanup?.()
        }
      }, root)

      cleanups.push(() => context.revert())
    }

    void setup()

    return () => {
      cancelled = true
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [rootRef, setAboutIndex, setAboutProgress, setExperienceIndex])
}
