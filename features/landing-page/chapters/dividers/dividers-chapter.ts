import { scrub } from '../shared/motion-tokens'
import type { ChapterCleanup, ChapterContext } from '../shared/engine'

/**
 * The divider chapters: the signal divider's two rails travel
 * inward and dock, and the cable divider's two halves meet in the
 * middle with a connection flash.
 *
 * These are the only timelines in the old hook that ran on mobile
 * too — they sat outside the `min-width: 769px` media block — so
 * they stay outside it here as well.
 */
export function dividersChapter(ctx: ChapterContext): ChapterCleanup {
  const { root, gsap } = ctx

  const dividerDockRule = root.querySelector<HTMLElement>(
    '[data-anim="signal-dock-rule"]',
  )
  const dividerTopRail = root.querySelector<HTMLElement>(
    '[data-anim="signal-top-rail"]',
  )
  const dividerBottomRail = root.querySelector<HTMLElement>(
    '[data-anim="signal-bottom-rail"]',
  )
  if (dividerTopRail && dividerBottomRail && dividerDockRule) {
    const horizontalTravel = () =>
      window.innerWidth < 769
        ? Math.min(22, window.innerWidth * 0.055)
        : Math.min(48, window.innerWidth * 0.035)

    gsap
      .timeline({
        scrollTrigger: {
          trigger: root.querySelector<HTMLElement>('[data-anim="signal-divider"]'),
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: scrub.default,
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

  const cableMaleHalf = root.querySelector<HTMLElement>(
    '[data-anim="cable-male"]',
  )
  const cableFemaleHalf = root.querySelector<HTMLElement>(
    '[data-anim="cable-female"]',
  )
  const cableConnectionFx = root.querySelector<HTMLElement>(
    '[data-anim="cable-connection-fx"]',
  )
  if (cableMaleHalf && cableFemaleHalf && cableConnectionFx) {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root.querySelector<HTMLElement>('[data-anim="cable-divider"]'),
          start: 'top bottom',
          end: 'bottom 45%',
          scrub: scrub.drift,
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
}
