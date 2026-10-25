'use client'

import type { RefObject } from 'react'
import { useEffect } from 'react'

/**
 * All of the landing page's motion, in one place.
 *
 * GSAP is imported dynamically because it is only needed after paint. The
 * reveal work is deliberately small: one entrance for the hero, one reveal per
 * section, and the rail's line drawing itself between sections. There is no
 * pinned scroll, no hijacked navigation and no second clock over the same
 * scroll position. The page has to stay a document.
 *
 * Reduced motion gets the whole page immediately, with no import at all.
 */
export function useStudioMotion({
  rootRef,
}: {
  rootRef: RefObject<HTMLElement | null>
}) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let context: { revert: () => void } | undefined

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      context = gsap.context(() => {
        const hero = root.querySelector('[data-hero]')
        const nav = root.querySelector('[data-studio-nav]')
        const patch = root.querySelectorAll('[data-hero] svg path')

        if (hero) {
          const intro = gsap.timeline({
            defaults: { ease: 'power3.out' },
            delay: 0.08,
          })

          if (nav) {
            intro.from(nav, {
              yPercent: -105,
              opacity: 0,
              duration: 0.85,
              // A transform left on the fixed nav would make the mobile
              // menu's position: fixed resolve against the nav instead of
              // the viewport. Clear it once the entrance is done.
              clearProps: 'transform',
            })
          }

          intro
            .from(
              hero.querySelectorAll('[data-hero-title] span'),
              {
                yPercent: 118,
                opacity: 0,
                duration: 1.15,
                stagger: 0.09,
              },
              0.12,
            )
            .from(
              hero.querySelectorAll('[data-hero-item]'),
              {
                y: 24,
                opacity: 0,
                duration: 0.85,
                stagger: 0.1,
              },
              0.28,
            )
            .from(
              hero.querySelector('[data-hero-object]'),
              {
                opacity: 0,
                scale: 0.94,
                duration: 1.4,
              },
              0.2,
            )

          if (patch.length) {
            intro.fromTo(
              patch,
              { strokeDasharray: 1, strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                duration: 1.5,
                stagger: 0.08,
                ease: 'power2.inOut',
              },
              0.5,
            )
          }
        }

        gsap.utils
          .toArray<HTMLElement>('[data-reveal]', root)
          .forEach((element) => {
            gsap.from(element, {
              y: 26,
              opacity: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 88%',
                once: true,
              },
            })
          })

        gsap.utils.toArray<HTMLElement>('[data-rail]', root).forEach((rail) => {
          const line = rail.querySelector<HTMLElement>('[data-rail-line]')
          const node = rail.querySelector<HTMLElement>('[data-rail-node]')
          const label = rail.querySelector<HTMLElement>('[data-rail-label]')

          if (line) {
            gsap.fromTo(
              line,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: rail,
                  start: 'top bottom',
                  end: 'bottom 45%',
                  scrub: 0.5,
                },
              },
            )
          }

          if (node) {
            gsap.from(node, {
              scale: 0.2,
              opacity: 0,
              duration: 0.55,
              ease: 'back.out(2)',
              scrollTrigger: {
                trigger: rail,
                start: 'top 82%',
                once: true,
              },
            })
          }

          if (label) {
            gsap.from(label, {
              x: 18,
              opacity: 0,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: rail,
                start: 'top 82%',
                once: true,
              },
            })
          }
        })

        // The section label's hairline grows from the label rather than
        // appearing at full length, which is the one repeated gesture that
        // tells a reader a new numbered block has started.
        gsap.utils
          .toArray<HTMLElement>('[data-section]', root)
          .forEach((section) => {
            const hair = section.querySelector<HTMLElement>(
              '[data-section-hair]',
            )
            if (!hair) return
            gsap.from(hair, {
              scaleX: 0,
              transformOrigin: 'left center',
              duration: 0.9,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: section,
                start: 'top 76%',
                once: true,
              },
            })
          })

        ScrollTrigger.refresh()
      }, root)
    }

    void setup()

    return () => {
      cancelled = true
      context?.revert()
    }
  }, [rootRef])
}
