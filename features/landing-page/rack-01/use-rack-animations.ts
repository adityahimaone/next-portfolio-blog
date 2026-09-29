'use client'

import type { RefObject } from 'react'
import { useEffect } from 'react'
import Lenis from 'lenis'

import { heroSweepIndices } from '../lib/hero-sweep-order'
import {
  registerSmoothScroll,
  unregisterSmoothScroll,
} from '../lib/smooth-scroll'
import { EXPERIENCES } from '../constants'
import styles from './rack-01.module.css'

/**
 * Drives every scroll-linked animation on the landing page: the hero boot
 * sequence and collapse, the about and experience scrubbers, and the section
 * reveals.
 *
 * Kept out of the component so the timelines can be read on their own. Note
 * that it selects elements by CSS-module class name rather than by ref, so
 * the selectors below and the markup in the section components have to move
 * together — renaming a class in rack-01.module.css breaks the animation
 * without a type error.
 *
 * GSAP and Lenis are imported dynamically: together they are a meaningful
 * part of first load and nothing moves without a scroll or a boot. Under
 * `prefers-reduced-motion` none of this runs, so those visitors never pay
 * for the download at all.
 */
export function useRackAnimations({
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
    let context: { revert: () => void } | undefined
    let smoothScrollCleanup: (() => void) | undefined

    let cancelled = false

    const setup = async () => {
      if (
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

      const lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1,
      })
      const updateLenis = (time: number) => lenis.raf(time * 1000)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(updateLenis)
      gsap.ticker.lagSmoothing(0)
      // Publish the instance so the work section can drive scrollTo and lock
      // scrolling. It is absent under reduced motion, where that module falls
      // back to native scrolling.
      registerSmoothScroll(lenis)
      smoothScrollCleanup = () => {
        gsap.ticker.remove(updateLenis)
        unregisterSmoothScroll(lenis)
        lenis.destroy()
      }

      context = gsap.context(() => {
        const media = gsap.matchMedia()
        media.add('(min-width: 769px)', () => {
          const hero = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.hero}`,
          )
          if (!hero) return
          const wall = hero.querySelector<HTMLElement>(
            `.${styles.heroDeviceWall}`,
          )!
          const modules = gsap.utils.toArray<HTMLElement>(
            hero?.querySelectorAll<HTMLElement>('[data-hero-device]') ?? [],
          )
          const routes = gsap.utils.toArray<HTMLElement>(
            hero?.querySelectorAll<HTMLElement>('[data-hero-route]') ?? [],
          )
          const anchors = modules.filter(
            (module) => module.dataset.rackAnchor === 'true',
          )
          const supportingModules = modules.filter(
            (module) => module.dataset.rackAnchor !== 'true',
          )
          // Same visual order the wall powers on in, so the tiles settle in
          // the direction the eye is already travelling. Passed as the target
          // rather than as a stagger option: the rack is a hand-authored
          // layout, so the DOM order is a zig-zag and needs re-sorting first.
          const heroSweepOrder = heroSweepIndices(modules).map(
            (index) => modules[index],
          )

          const name = hero.querySelector<HTMLElement>(
            `.${styles.heroBackdropName}`,
          )!
          const panel = hero.querySelector<HTMLElement>(
            `.${styles.heroEditorialPanel}`,
          )!
          const heroRail = hero.querySelector<HTMLElement>(
            `.${styles.heroBottomRail}`,
          )!
          const heroRailLink = heroRail.querySelector<HTMLElement>('a')!
          const atmosphere = hero.querySelector<HTMLElement>(
            `.${styles.heroAtmosphere}`,
          )!
          const handoff = hero.querySelector<HTMLElement>(
            `.${styles.heroAboutHandoff}`,
          )!
          const boot = hero.querySelector<HTMLElement>(
            `.${styles.heroBootSequence}`,
          )!

          const intro = gsap.timeline({ defaults: { overwrite: 'auto' } })
          intro
            .fromTo(
              wall,
              {
                scale: 1.11,
                filter: 'saturate(0.45) contrast(1.15) brightness(0.42)',
              },
              {
                scale: 1.015,
                filter: 'saturate(0.8) contrast(1.08) brightness(0.78)',
                duration: 1.45,
                ease: 'expo.out',
              },
            )
            .fromTo(
              heroSweepOrder,
              {
                xPercent: (_, element) =>
                  Number((element as HTMLElement).dataset.collapseX ?? 0) *
                  0.72,
                yPercent: (_, element) =>
                  Number((element as HTMLElement).dataset.collapseY ?? 0) *
                  0.72,
                rotation: (_, element) =>
                  Number(
                    (element as HTMLElement).dataset.collapseRotation ?? 0,
                  ) * 0.7,
                scale: 0.88,
                opacity: 0,
              },
              {
                xPercent: 0,
                yPercent: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                duration: 1.25,
                stagger: { each: 0.045, from: 'start' },
                ease: 'expo.out',
              },
              0.06,
            )

            .fromTo(
              [heroRail],
              { opacity: 0 },
              { opacity: 1, duration: 0.55, ease: 'power2.out' },
              0.94,
            )
            .to(boot, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0.38)

          const collapse = gsap.timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.85,
              invalidateOnRefresh: true,
            },
            defaults: { ease: 'none', overwrite: 'auto' },
          })

          collapse
            .to(
              panel,
              {
                xPercent: -18,
                opacity: 0,
                filter: 'blur(5px)',
                duration: 0.18,
              },
              0.04,
            )
            .to(
              heroRail,
              {
                y: () => -Math.min(176, window.innerHeight * 0.2),
                color: 'rgba(16, 18, 17, 0.68)',
                opacity: 1,
                duration: 0.36,
              },
              0.7,
            )
            .to(
              heroRailLink,
              {
                color: 'rgba(16, 18, 17, 0.9)',
                duration: 0.36,
              },
              0.7,
            )
            .to(
              modules,
              {
                xPercent: (_, element) =>
                  Number((element as HTMLElement).dataset.collapseX ?? 0),
                yPercent: (_, element) =>
                  Number((element as HTMLElement).dataset.collapseY ?? 0),
                rotation: (_, element) =>
                  Number(
                    (element as HTMLElement).dataset.collapseRotation ?? 0,
                  ),
                scale: (_, element) =>
                  (element as HTMLElement).dataset.rackAnchor === 'true'
                    ? 0.96
                    : 0.88,
                duration: 0.52,
                stagger: 0.008,
              },
              0.1,
            )
            .to(supportingModules, { opacity: 0.16, duration: 0.28 }, 0.24)
            .to(
              anchors,
              {
                opacity: 1,
                filter: 'brightness(1.08) saturate(1)',
                duration: 0.22,
              },
              0.28,
            )
            .to(routes, { opacity: 1, y: 0, duration: 0.18 }, 0.32)
            .to(
              name,
              {
                scale: 1.34,
                letterSpacing: '-0.055em',
                filter: 'blur(0px)',
                duration: 0.5,
              },
              0.14,
            )
            .to(atmosphere, { opacity: 0.36, duration: 0.28 }, 0.3)
            .to(routes, { opacity: 0, y: -5, duration: 0.16 }, 0.66)
            .to(supportingModules, { opacity: 0.04, duration: 0.24 }, 0.7)
            .to(anchors, { opacity: 0.18, scale: 1.02, duration: 0.24 }, 0.7)
            .to(
              name,
              {
                yPercent: -10,
                opacity: 0.32,
                scale: 1.46,
                filter: 'blur(3px)',
                duration: 0.25,
              },
              0.72,
            )
            .fromTo(
              handoff,
              { yPercent: 100, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.26 },
              0.72,
            )
            .to(atmosphere, { opacity: 0.1, duration: 0.2 }, 0.78)

          ScrollTrigger.create({
            trigger: `.${styles.about}`,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => setAboutProgress(self.progress),
          })

          const aboutCards = gsap.utils.toArray<HTMLElement>(
            `.${styles.aboutCard}`,
          )
          aboutCards.forEach((card, index) => {
            ScrollTrigger.create({
              trigger: card,
              start: 'top 58%',
              end: 'bottom 42%',
              onEnter: () => setAboutIndex(index),
              onEnterBack: () => setAboutIndex(index),
            })
          })

          const storyHeadings = gsap.utils
            .toArray<HTMLElement>(`.${styles.sectionHeading}`)
            .filter((heading) => !heading.closest('[data-no-heading-reveal]'))
          storyHeadings.forEach((heading) => {
            const label = heading.querySelector(`.${styles.silkscreen}`)
            const title = heading.querySelector('h2')
            gsap.fromTo(
              [label, title],
              { yPercent: 105, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: heading,
                  start: 'top 90%',
                  end: 'top 58%',
                  scrub: 0.7,
                },
              },
            )
          })

          gsap.fromTo(
            `.${styles.controller}`,
            {
              rotationX: 20,
              transformPerspective: 1200,
              scale: 1.05,
              yPercent: 0,
            },
            {
              rotationX: 0,
              scale: 1,
              yPercent: -2,
              transformOrigin: '50% 0%',
              ease: 'none',
              scrollTrigger: {
                trigger: `.${styles.skills}`,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.15,
              },
            },
          )

          const skillSection = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.skills}`,
          )
          if (skillSection) {
            const sequenceGroups = {
              pads: gsap.utils.toArray<HTMLElement>(
                skillSection.querySelectorAll<HTMLElement>(
                  '[data-skill-sequence="pad"]',
                ),
              ),
              params: gsap.utils.toArray<HTMLElement>(
                skillSection.querySelectorAll<HTMLElement>(
                  '[data-skill-sequence="param"]',
                ),
              ),
              faders: gsap.utils.toArray<HTMLElement>(
                skillSection.querySelectorAll<HTMLElement>(
                  '[data-skill-sequence="fader"]',
                ),
              ),
            }
            const activateThrough = (
              items: HTMLElement[],
              progress: number,
              start: number,
              end: number,
            ) => {
              const local = Math.max(
                0,
                Math.min(1, (progress - start) / (end - start)),
              )
              const activeCount = Math.ceil(local * items.length)
              items.forEach((item, index) => {
                item.classList.toggle(
                  styles.skillsSequenceActive,
                  index < activeCount,
                )
              })
            }
            const activateCurrent = (
              items: HTMLElement[],
              progress: number,
              start: number,
              end: number,
            ) => {
              const local = Math.max(
                0,
                Math.min(1, (progress - start) / (end - start)),
              )
              const activeIndex = Math.min(
                items.length - 1,
                Math.floor(local * items.length),
              )
              items.forEach((item, index) =>
                item.classList.toggle(
                  styles.skillsSequenceActive,
                  local > 0 && index === activeIndex,
                ),
              )
            }

            ScrollTrigger.create({
              trigger: skillSection,
              start: 'top 94%',
              end: 'bottom 10%',
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const progress = self.progress
                skillSection.dispatchEvent(
                  new CustomEvent<number>('skills-sequence', {
                    detail: progress,
                  }),
                )
                activateCurrent(sequenceGroups.pads, progress, 0.02, 0.34)
                activateThrough(sequenceGroups.params, progress, 0.24, 0.5)
                activateThrough(sequenceGroups.faders, progress, 0.46, 0.72)
              },
              onLeaveBack: () => {
                Object.values(sequenceGroups)
                  .flat()
                  .forEach((item) =>
                    item.classList.remove(styles.skillsSequenceActive),
                  )
                skillSection.dispatchEvent(
                  new CustomEvent<number>('skills-sequence', { detail: -1 }),
                )
              },
            })
          }

          const contactDeck = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.contact} .${styles.contactDeck}`,
          )
          if (contactDeck) {
            const contactLayers = {
              brand: contactDeck.querySelector<HTMLElement>(
                `.${styles.contactDeckBrand}`,
              ),
              controls: contactDeck.querySelector<HTMLElement>(
                `.${styles.contactDeckTop}`,
              ),
              rails: gsap.utils.toArray<HTMLElement>(
                contactDeck.querySelectorAll<HTMLElement>(
                  `.${styles.contactModeRail}`,
                ),
              ),
              pads: contactDeck.querySelector<HTMLElement>(
                `.${styles.contactPadGrid}`,
              ),
              note: contactDeck.querySelector<HTMLElement>(
                `.${styles.contactDeckNote}`,
              ),
            }
            const layers = Object.values(contactLayers).flatMap((layer) =>
              Array.isArray(layer) ? layer : layer ? [layer] : [],
            )

            gsap.set([contactDeck, ...layers], {
              transformPerspective: 1400,
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            })

            gsap
              .timeline({
                scrollTrigger: {
                  trigger: contactDeck,
                  start: 'top 90%',
                  end: 'bottom 14%',
                  scrub: 0.9,
                },
              })
              .fromTo(
                contactDeck,
                { rotationX: 8, rotationY: -1.8, y: 34, scale: 0.96 },
                { rotationX: 0, rotationY: 0, y: 0, scale: 1, ease: 'none' },
                0,
              )
              .fromTo(
                contactLayers.brand ?? [],
                { y: 16, z: 0 },
                { y: -14, z: 18, ease: 'none' },
                0,
              )
              .fromTo(
                contactLayers.controls ?? [],
                { y: 16, z: 0 },
                { y: -4, z: 30, ease: 'none' },
                0,
              )
              .fromTo(
                contactLayers.rails,
                { y: 16, z: 0 },
                { y: 6, z: 22, ease: 'none' },
                0,
              )
              .fromTo(
                contactLayers.pads ?? [],
                { y: 16, z: 0 },
                { y: 12, z: 42, ease: 'none' },
                0,
              )
              .fromTo(
                contactLayers.note ?? [],
                { y: 16, z: 0 },
                { y: 18, z: 14, ease: 'none' },
                0,
              )
          }

          const studioDetails = gsap.utils.toArray<HTMLElement>(
            `.${styles.skillsIntro} > p, .${styles.patchScreen}`,
          )
          studioDetails.forEach((detail) => {
            gsap.fromTo(
              detail,
              { y: 24, opacity: 0.35 },
              {
                y: 0,
                opacity: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: detail,
                  start: 'top 92%',
                  end: 'top 62%',
                  scrub: 0.8,
                },
              },
            )
          })

          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.contact}`,
                start: 'top 82%',
                end: 'top 24%',
                scrub: 0.8,
              },
            })
            .fromTo(
              `.${styles.contactSignal}`,
              { clipPath: 'inset(0 50% 0 50%)', opacity: 0.25 },
              { clipPath: 'inset(0 0% 0 0%)', opacity: 1, ease: 'none' },
              0,
            )
            .fromTo(
              `.${styles.contactHeadline} > span`,
              { yPercent: 85, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                stagger: 0.1,
                ease: 'none',
              },
              0.12,
            )
            .fromTo(
              `.${styles.launchpadTopbar}, .${styles.launchpadHeader}, .${styles.launchpadGrid}`,
              { y: 28, opacity: 0.28 },
              {
                y: 0,
                opacity: 1,
                stagger: 0.08,
                ease: 'none',
              },
              0.18,
            )

          gsap.to(`.${styles.tapeWheel}`, {
            rotate: 920,
            ease: 'none',
            scrollTrigger: {
              trigger: `.${styles.experience}`,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.4,
              onUpdate: (self) => {
                const experienceProgress = Math.min(1, self.progress / 0.52)
                const next = Math.min(
                  EXPERIENCES.length - 1,
                  Math.floor(experienceProgress * EXPERIENCES.length),
                )
                setExperienceIndex((current) =>
                  current === next ? current : next,
                )
              },
            },
          })

          const experienceSection = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.experience}`,
          )
          const experienceContent = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.experienceContent}`,
          )

          // Only the experience side animates here. The work section runs its
          // own scroll-linked entrance, so there is no stage to hand off to.
          if (experienceSection && experienceContent) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: experienceSection,
                  start: 'top top',
                  end: 'bottom bottom',
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
                defaults: { ease: 'none' },
              })
              .to(
                experienceContent,
                {
                  opacity: 0,
                  yPercent: 12,
                  scale: 0.88,
                  filter: 'blur(4px)',
                  transformOrigin: '50% 50%',
                  duration: 0.3,
                },
                0.48,
              )
          }
        })

        const dividerDockRule = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.signalDockRule}`,
        )
        const dividerTopRail = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.signalDividerTopRail}`,
        )
        const dividerBottomRail = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.signalDividerBottomRail}`,
        )

        if (dividerTopRail && dividerBottomRail && dividerDockRule) {
          const horizontalTravel = () =>
            window.innerWidth < 769
              ? Math.min(22, window.innerWidth * 0.055)
              : Math.min(48, window.innerWidth * 0.035)

          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.signalDivider}`,
                start: 'top 85%',
                end: 'bottom 15%',
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
              defaults: { ease: 'none' },
            })
            .fromTo(
              dividerTopRail,
              { x: () => -horizontalTravel() },
              { x: 0, duration: 0.7, force3D: true },
              0,
            )
            .fromTo(
              dividerBottomRail,
              { x: () => horizontalTravel() },
              { x: 0, duration: 0.7, force3D: true },
              0,
            )
            .fromTo(
              dividerDockRule,
              { scaleX: 0.18, opacity: 0.5 },
              { scaleX: 1, opacity: 0.82, duration: 0.52 },
              0.22,
            )
        }

        const cableMaleHalf = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.cableMaleHalf}`,
        )
        const cableFemaleHalf = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.cableFemaleHalf}`,
        )
        const cableConnectionFx = rootRef.current?.querySelector<HTMLElement>(
          `.${styles.cableConnectionFx}`,
        )
        if (cableMaleHalf && cableFemaleHalf && cableConnectionFx) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.cableDivider}`,
                start: 'top bottom',
                end: 'bottom 45%',
                scrub: 1.15,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              cableMaleHalf,
              { x: () => -Math.min(360, window.innerWidth * 0.3) },
              { x: 0, duration: 0.82, force3D: true, ease: 'none' },
              0,
            )
            .fromTo(
              cableFemaleHalf,
              { x: () => Math.min(360, window.innerWidth * 0.3) },
              { x: 0, duration: 0.82, force3D: true, ease: 'none' },
              0,
            )
            .fromTo(
              cableConnectionFx,
              { autoAlpha: 0, scale: 0.7 },
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.18,
                transformOrigin: '50% 50%',
                ease: 'power2.out',
              },
              0.82,
            )
        }

        media.add('(max-width: 768px)', () => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.experienceWorkHandoff}`,
                start: 'top 88%',
                end: 'bottom 28%',
                scrub: 0.75,
              },
              defaults: { ease: 'none' },
            })
            .to(
              `.${styles.experienceContent}`,
              { opacity: 0.2, scale: 0.99, duration: 0.3 },
              0,
            )
            .fromTo(
              `.${styles.handoffShade}`,
              { opacity: 0 },
              { opacity: 1, duration: 0.2 },
              0.08,
            )
            .fromTo(
              `.${styles.handoffRibbon}`,
              {
                scaleX: 0,
                scaleY: 1,
                opacity: 0,
                transformOrigin: '0% 50%',
              },
              { scaleX: 1, opacity: 1, duration: 0.3 },
              0.1,
            )
            .to(`.${styles.handoffRibbon}`, { scaleY: 4, duration: 0.12 }, 0.42)
            .fromTo(
              `.${styles.handoffScreen}`,
              { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
              { clipPath: 'inset(0% 0 0 0)', opacity: 1, duration: 0.24 },
              0.58,
            )
        })

        return () => media.revert()
      }, rootRef)
    }

    void setup()
    return () => {
      cancelled = true
      context?.revert()
      smoothScrollCleanup?.()
    }
  }, [])
}
