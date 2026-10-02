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

      // The eject proxy is portalled and only mounts in its own effect, which
      // may not have run yet when this dynamic import resolves. Give it a frame
      // before any selector reaches for it, or the seam bails out and the
      // handoff silently never runs.
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      if (cancelled || !rootRef.current) return

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

          // ── Experience → Work: uncover, don't arrive ──
          //
          // The deck and the player are the same KIND of object at nearly the
          // same width — 1296px and 1340px — and the same four-band structure.
          // It is tempting to treat the seam as one growing into the other.
          //
          // Measured, they are 138px apart and never overlap: at the start of
          // the window the deck's top is at 74px and the player's at 963px; at
          // the end they are -826px and 63px. The gap is constant. They scroll
          // in sequence, one leaving as the other appears, and there is no
          // shared frame for a scale to bridge.
          //
          // So the seam does the only honest thing: the deck holds its opacity
          // and simply scrolls off the top, and the player — already there,
          // already unlit — brightens in place. The cassette flight is
          // unchanged, and the tuning needle hands over to the playhead.
          //
          // Nothing in this window translates. That is the whole fix: the
          // previous version had the deck sliding up and blurring out while the
          // shell rose 18px into frame, and those two opposing moves are what
          // made the boundary read as one section scrolling past another.
          const experienceSection = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.experience}`,
          )
          const experienceContent = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.experienceContent}`,
          )
          const ejectProxy = document.querySelector<HTMLElement>(
            `.${styles.ejectProxy}`,
          )
          // Addressed by id, not by class: the rack's own `.work` rule only sets
          // `color` on a descendant, and the section element itself carries the
          // work module's class name, so a class lookup here finds nothing.
          const workSection =
            rootRef.current?.querySelector<HTMLElement>('#work')
          // The player chrome lives in the work module, so its class names are
          // not reachable from here. It marks the parts the seam drives instead.
          const workShell =
            workSection?.querySelector<HTMLElement>('[data-work-shell]')

          /* The tuning needle. Its twin is the player's playhead: both are a
             thin warm bar whose position along a horizontal track encodes where
             you are, and the seam cross-fades one into the other at the same
             fraction so it reads as one mark re-scaling.

             This survives the uncover because it is not a "reveal" — it is a
             handover between two instruments that are both present the whole
             time, and it is the one piece of genuine continuity in the window. */
          const deckNeedle =
            experienceContent?.querySelector<HTMLElement>(
              `.${styles.frequencyScale} i`,
            ) ?? null
          /* Its other half. In the work module, so addressed by attribute. */
          const workPlayhead =
            workSection?.querySelector<HTMLElement>('[data-playhead]')

          const ejectCassette = ejectProxy?.querySelector<HTMLElement>(
            `.${styles.ejectCassette}`,
          )
          /* The clone is drawn by the deck's own components, so its interior carries the
               deck's class names — `cassetteLabel` and `cassetteMechanism`, not
               an `eject`-prefixed pair. Reaching for the wrong prefix silently
               found nothing and the whole seam stood still. */
          const ejectLabel = ejectProxy?.querySelector<HTMLElement>(
            `.${styles.cassetteLabel}`,
          )
          const ejectMechanism = ejectProxy?.querySelector<HTMLElement>(
            `.${styles.cassetteMechanism}`,
          )

          if (
            experienceSection &&
            experienceContent &&
            ejectProxy &&
            ejectCassette &&
            ejectLabel &&
            ejectMechanism &&
            workSection &&
            workShell
          ) {
            /* A Type I shell's proportion, in millimetres. The CSS states the same value
               as `aspect-ratio`; this is only used to centre the box on the
               point the flight computes, since height follows from width. */
            const CASSETTE_RATIO = 100.4 / 63.8

            /* Where the proxy is picked up from.

               This was frozen once on entry, which is wrong: the deck's stage is
               sticky but it is also scrolling up and out of view across exactly
               this window, so a frozen source left the proxy parked down near the
               fold after the real cassette had already left — the proxy was
               briefly the only cassette on screen, sitting below the fold. So the
               source is followed live for as long as the deck's own cassette is
               substantially on screen, and frozen only after it goes. That also
               makes the hand-off continuous rather than a jump on the first
               frame. */
            const source = { x: 0, y: 0, width: 0, frozen: false }

            const readSource = (freeze: boolean) => {
              if (source.frozen) return
              const cassette = rootRef.current?.querySelector<HTMLElement>(
                `.${styles.cassetteActive}`,
              )
              if (!cassette) return
              const rect = cassette.getBoundingClientRect()
              source.x = rect.left + rect.width / 2
              source.y = rect.top + rect.height / 2
              source.width = rect.width
              if (freeze) source.frozen = true
            }

            // Release the source again on the way back up, so reversing the seam
            // re-attaches to the deck rather than replaying a stale origin.
            const releaseSource = () => {
              source.frozen = false
            }

            /* The artwork is not static: the work stage travels a full viewport
               height during this very window, so the destination moves every
               frame and a frozen `fromTo` would miss it. The target rect is read
               BEFORE the proxy's box is written — reading after would flush a
               layout we just invalidated. */
            const placeCassette = (progress: number) => {
              const target = rootRef.current?.querySelector<HTMLElement>(
                '[data-handoff-target]',
              )
              if (!target) return

              /* Follow the deck's own cassette while it is still substantially
                 on screen, then freeze. Measuring it is one layout read against
                 the one already being done for the target below. */
              const deckCassette = rootRef.current?.querySelector<HTMLElement>(
                `.${styles.cassetteActive}`,
              )
              if (deckCassette && !source.frozen) {
                const r = deckCassette.getBoundingClientRect()
                const stillVisible = r.bottom > window.innerHeight * 0.45
                if (!stillVisible) {
                  readSource(true)
                } else {
                  source.x = r.left + r.width / 2
                  source.y = r.top + r.height / 2
                  source.width = r.width
                }
              }
              if (source.width === 0) return

              const rect = target.getBoundingClientRect()
              // `content-visibility: auto` can leave a section holding its
              // `contain-intrinsic-size` placeholder, so an unrendered target
              // can still measure. Skip rather than fly to the wrong box.
              if (rect.width === 0) return

              const toX = rect.left + rect.width / 2
              const toY = rect.top + rect.height / 2

              /* Linear in position. This was an ease-out, which front-loads the
                 movement — combined with the deck travelling up underneath, the
                 cassette visibly overshot the bottom of the viewport and slid
                 back, which is the "scrolling up" read this whole change set out
                 to remove. */
              const flight = Math.min(1, progress / 0.72)

              const x = source.x + (toX - source.x) * flight
              const y = source.y + (toY - source.y) * flight

              /* Sized along the way it travels, NOT to the artwork's own
                 dimensions. The artwork is a 1:1 square and the cassette is
                 100.4:63.8, so driving width and height independently to meet
                 it would squash the shell by a third on the way in and turn a
                 tape into a card. Instead the shell keeps its own ratio at every
                 frame and simply gets smaller — which is also why the interior,
                 drawn in `cqw`, stays in proportion the whole way down. */
              const width = source.width + (rect.width - source.width) * flight

              ejectCassette.style.width = `${width}px`

              /* Zero for the first stretch, so the cassette leaves the bay at
                 exactly the angle it was sitting at and the hand-off has no
                 jump in it. The tilt only starts once it is clear of the deck,
                 peaks mid-flight, and unwinds to flat as it seats — which is
                 what reads as being inserted rather than dropped.

                 `sin(flight * PI)` alone would be tilted from the first frame,
                 because flight is already non-zero as soon as progress is. The
                 dead zone is what holds it flat while it overlaps its own
                 original position. */
              const TILT_START = 0.18
              const tiltPhase = Math.max(
                0,
                (flight - TILT_START) / (1 - TILT_START),
              )
              const tilt = Math.sin(tiltPhase * Math.PI) * -5

              gsap.set(ejectCassette, {
                x: x - width / 2,
                y: y - width / CASSETTE_RATIO / 2,
                rotate: tilt,
              })
            }

            const seam = gsap.timeline({
              scrollTrigger: {
                // The window work spends entering the viewport: it is exactly
                // where experience's sticky stage releases and work's engages.
                trigger: workSection,
                start: 'top bottom',
                end: 'top top',
                scrub: 0.8,
                invalidateOnRefresh: true,
                onEnter: () => releaseSource(),
                onEnterBack: () => releaseSource(),
                onRefresh: () => {
                  releaseSource()
                  readSource(false)
                },
                onUpdate: (self) => placeCassette(self.progress),
              },
              defaults: { ease: 'none' },
            })

            /* ── Uncover, don't arrive ────────────────────────────────

               The deck does not fade. It never fades. It holds opacity 1 for
               the whole window and simply scrolls off the top of the frame as
               the player scrolls up into place beneath it — because that is
               what an object on a surface does when you scroll past it, and
               anything else is performance.

               The player is already there. It is dark and unlit from the
               moment the window opens and brightens in place across it. So the
               read is lifting one machine off another, not waiting for
               something to arrive.

               This is the correction to a wrong idea: the deck and the shell
               are the same KIND of object at nearly the same width (1296 vs
               1340) but they are 138px apart and never overlap at any point in
               the window — measured, not assumed. There is no shared frame for
               one to grow into, so the earlier "one frame grows into the other"
               pass was animating a relationship that does not exist. */

            seam.fromTo(
              workShell,
              { opacity: 0.25 },
              /* Most of the brightening happens early and the rest arrives as
                 the deck clears, so the player is already legible behind the
                 deck before the deck is gone. Starting it at 0.25 rather than 0
                 is what makes it read as uncovered rather than as about to
                 appear — at 0 there is nothing to uncover. */
              { opacity: 1, duration: 0.9, ease: 'none' },
              0.05,
            )

            /* ── The needle becomes the playhead ─────────────────

               The one element pair in either section that is genuinely the same
               gesture: a thin warm bar whose position along a horizontal track
               encodes where you are. A tuner needle finding a station and a
               playhead finding a position in a record are the same instrument
               reading a different scale, and the seam is the moment the scale
               changes.

               They overlap rather than cross-fade — the needle fades out over
               0.2 while the playhead fades in across the same 0.2, so for that
               window both are partly visible and the visitor sees one mark
               re-scaling rather than one leaving and another arriving. A clean
               hand-off would leave a moment with neither, which reads as the
               mark vanishing.

               The playhead's resting width is Motion's `trackProgress`, so its
               opacity is animated on the wrapper and the width keeps being
               driven normally underneath. */
            if (deckNeedle && workPlayhead) {
              seam
                .to(
                  [deckNeedle],
                  { opacity: 0, duration: 0.2, ease: 'none' },
                  0.5,
                )
                .fromTo(
                  [workPlayhead],
                  { opacity: 0 },
                  { opacity: 1, duration: 0.2, ease: 'none' },
                  0.5,
                )
            }

            /* The cassette flight is untouched. It measures the deck's live
               active cassette and the artwork every frame and writes the
               transform directly, because both endpoints move across the window
               and a frozen `fromTo` would miss both. */

            seam.fromTo(
              ejectProxy,
              { opacity: 0 },
              { opacity: 1, duration: 0.1 },
              0.02,
            )

            /* The destination is a small square, and the shell keeps its own
               1.574:1 ratio all the way in — so at the end it is a wide, short
               sliver sitting inside a square. Its printed detail is dropped
               before it lands, or it reads as squashed text rather than as a
               tape whose label has gone dark. */
            seam.to(
              [ejectLabel, ejectMechanism],
              { opacity: 0, duration: 0.22 },
              0.5,
            )

            /* The tape has to clear well before the trigger ends. A fade that
               starts at 0.92 only has the last 8% of the track to run in, so
               the proxy was still ~0.8 opaque when the seam released it. */
            seam.to(ejectProxy, { opacity: 0, duration: 0.14 }, 0.84)

            /* The masked-slot rise is gone.

               Work is `data-no-heading-reveal`, so the seam had been giving
               its heading the house reveal — a `yPercent: 105 → 0` slide out
               of a clipped slot at 0.62 and 0.66. That is an arrival, and an
               arrival is the one thing this seam is no longer doing: the player
               is already there, dark, and simply gets brighter. Having its own
               title then spring up out of a clip two thirds of the way through
               the window contradicted that — it told the visitor something was
               arriving at the same moment as the rest of the machine was
               revealed to have been there all along.

               The heading now brightens with everything else, which is what
               `data-no-heading-reveal` means everywhere else on the page. */
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
