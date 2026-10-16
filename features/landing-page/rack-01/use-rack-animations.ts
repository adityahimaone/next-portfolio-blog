'use client'

import type { RefObject } from 'react'
import { useEffect } from 'react'
import {
  registerSmoothScroll,
  unregisterSmoothScroll,
} from '../lib/smooth-scroll'
import { EXPERIENCES } from '../constants'
import { SEAM_SVH } from '../constants/seam'
import { SEAM_PANELS, seamFrame } from './seam-frame'
import styles from './rack-01.module.css'

/**
 * Drives the landing page's section reveals, Skills and Experience animations,
 * and Experience-to-Work seam.
 *
 * Kept out of the component so the timelines can be read on their own. Note
 * that it selects elements by CSS-module class name rather than by ref, so
 * the selectors below and the markup in the section components have to move
 * together — renaming a class in rack-01.module.css breaks the animation
 * without a type error.
 *
 * GSAP and Lenis are imported dynamically: together they are a meaningful
 * part of first load. Under
 * `prefers-reduced-motion` none of this runs, so those visitors never pay
 * for the download at all.
 */
export function useRackAnimations({
  rootRef,
  setExperienceIndex,
}: {
  rootRef: RefObject<HTMLDivElement | null>
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
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] =
        await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
          import('lenis'),
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
              end: () => `+=${Math.round(window.innerHeight * 0.9)}`,
              invalidateOnRefresh: true,
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

          // ── Experience → Work: the spectrum curtain ──
          //
          // The radio is pushed back into the dark, a wall of equaliser columns
          // rises over the screen, closes, and drops from the centre outward
          // onto the player. The choreography is `seamFrame` (pure, tested);
          // this block finds the nodes, writes the frame, and puts everything
          // back on teardown. See `seam-frame.ts` for why it is a wall and not
          // a second turn of the radio.
          const experienceSection = rootRef.current?.querySelector<HTMLElement>(
            `.${styles.experience}`,
          )
          const experienceHeading =
            experienceSection?.querySelector<HTMLElement>(
              `.${styles.sectionHeading}`,
            )
          const deck =
            experienceSection?.querySelector<HTMLElement>('[data-deck-flip]')
          const seamWash =
            experienceSection?.querySelector<HTMLElement>('[data-seam-wash]')
          const workSection =
            rootRef.current?.querySelector<HTMLElement>('#work')
          const workShell =
            workSection?.querySelector<HTMLElement>('[data-work-shell]')
          const wall =
            rootRef.current?.querySelector<HTMLElement>('[data-seam-wall]')
          const wallColumns = wall
            ? Array.from(wall.querySelectorAll<HTMLElement>('[data-seam-col]'))
            : []
          const wallCaps = wall
            ? Array.from(wall.querySelectorAll<HTMLElement>('[data-seam-cap]'))
            : []
          const wallLabel =
            wall?.querySelector<HTMLElement>('[data-seam-label]') ?? null

          if (
            experienceSection &&
            experienceHeading &&
            deck &&
            seamWash &&
            workSection &&
            workShell &&
            wall &&
            wallColumns.length > 0 &&
            wallColumns.length === wallCaps.length
          ) {
            // The player's own panels, staggered in once the wall is down. The
            // shell's direct children are the chrome, the banner, the three
            // columns and the transport bar, in that order.
            const panels = Array.from(workShell.children).slice(
              0,
              SEAM_PANELS,
            ) as HTMLElement[]

            // Write only what changed: forty-eight nodes are touched per tick,
            // and an identical string is a style invalidation for nothing. One
            // memo per property, because a node carries several.
            const memo = {
              transform: new WeakMap<HTMLElement, string>(),
              opacity: new WeakMap<HTMLElement, string>(),
              visibility: new WeakMap<HTMLElement, string>(),
            }
            const put = (
              node: HTMLElement,
              prop: 'transform' | 'opacity' | 'visibility',
              value: string,
            ) => {
              if (memo[prop].get(node) === value) return
              memo[prop].set(node, value)
              node.style[prop] = value
            }

            const apply = (progress: number) => {
              const frame = seamFrame(progress, wallColumns.length)
              const height = window.innerHeight

              put(experienceHeading, 'opacity', String(frame.headingOpacity))
              put(seamWash, 'opacity', String(frame.washOpacity))
              put(
                deck,
                'transform',
                `translate3d(0, ${frame.deck.y}%, 0) scale(${frame.deck.scale})`,
              )
              put(deck, 'opacity', String(frame.deck.opacity))
              put(
                experienceSection,
                'visibility',
                frame.experienceHidden ? 'hidden' : '',
              )

              put(workShell, 'opacity', String(frame.shell.opacity))
              put(
                workShell,
                'transform',
                frame.shell.scale === 1 ? '' : `scale(${frame.shell.scale})`,
              )
              panels.forEach((panel, index) => {
                const reveal = frame.panels[index] ?? 1
                put(panel, 'opacity', reveal >= 0.999 ? '' : String(reveal))
                put(
                  panel,
                  'transform',
                  reveal >= 0.999
                    ? ''
                    : `translate3d(0, ${(1 - reveal) * 18}px, 0)`,
                )
              })

              put(
                wall,
                'visibility',
                frame.overlayVisible ? 'visible' : 'hidden',
              )
              if (wallLabel) {
                put(wallLabel, 'opacity', String(frame.labelOpacity))
              }
              frame.columns.forEach((top, index) => {
                const y = `${top * height}px`
                put(
                  wallColumns[index],
                  'transform',
                  `translate3d(0, ${y}, 0) scaleY(${1 - top})`,
                )
                put(wallCaps[index], 'transform', `translate3d(0, ${y}, 0)`)
                put(wallCaps[index], 'opacity', String(frame.caps[index]))
              })
            }

            const seamLength = () => (SEAM_SVH / 100) * window.innerHeight
            apply(0)
            ScrollTrigger.create({
              trigger: workSection,
              start: 'top top',
              end: () => `+=${seamLength()}`,
              invalidateOnRefresh: true,
              onEnter: (self) => apply(self.progress),
              onEnterBack: (self) => apply(self.progress),
              onRefresh: (self) => apply(self.progress),
              onUpdate: (self) => apply(self.progress),
              onLeave: () => apply(1),
              onLeaveBack: () => apply(0),
            })

            return () => {
              experienceSection.style.visibility = ''
              experienceHeading.style.opacity = ''
              seamWash.style.opacity = ''
              deck.style.transform = ''
              deck.style.opacity = ''
              workShell.style.opacity = ''
              workShell.style.transform = ''
              panels.forEach((panel) => {
                panel.style.opacity = ''
                panel.style.transform = ''
              })
              wall.style.visibility = ''
              if (wallLabel) wallLabel.style.opacity = ''
              wallColumns.forEach((node) => (node.style.transform = ''))
              wallCaps.forEach((node) => {
                node.style.transform = ''
                node.style.opacity = ''
              })
            }
          }
        })

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
