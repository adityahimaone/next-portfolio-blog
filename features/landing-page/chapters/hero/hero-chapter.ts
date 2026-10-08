import { heroSweepIndices } from '../../lib/hero-sweep-order'
import { ease, scrub } from '../shared/motion-tokens'
import type { ChapterContext } from '../shared/engine'

/**
 * The hero chapter: the power-on intro (time-based, autoplay) and the
 * walk-out collapse (scroll-scrubbed).
 *
 * Moved verbatim from useRackAnimations when the hook was split into
 * chapters — the timelines are the same, only the selectors changed:
 * every element the chapter reaches for is addressed by its
 * `data-anim` attribute, so renaming a CSS-module class can no
 * longer silently kill the motion. The one exception is
 * `[data-hero-device]` / `[data-hero-route]`, which were attributes
 * from the start.
 */
export function heroChapter(ctx: ChapterContext): void {
  const { root, gsap, ScrollTrigger } = ctx

  const hero = root.querySelector<HTMLElement>('[data-anim="hero-section"]')
  if (!hero) return

  const wall = hero.querySelector<HTMLElement>('[data-anim="hero-wall"]')!
  const modules = gsap.utils.toArray<HTMLElement>(
    hero.querySelectorAll<HTMLElement>('[data-hero-device]') ?? [],
  )
  const routes = gsap.utils.toArray<HTMLElement>(
    hero.querySelectorAll<HTMLElement>('[data-hero-route]') ?? [],
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
  const heroSweepOrder = heroSweepIndices(modules).map((index) => modules[index])

  const name = hero.querySelector<HTMLElement>('[data-anim="hero-name"]')!
  const panel = hero.querySelector<HTMLElement>('[data-anim="hero-panel"]')!
  const heroRail = hero.querySelector<HTMLElement>('[data-anim="hero-rail"]')!
  const heroRailLink = heroRail.querySelector<HTMLElement>('a')!
  const atmosphere = hero.querySelector<HTMLElement>(
    '[data-anim="hero-atmosphere"]',
  )!
  const handoff = hero.querySelector<HTMLElement>('[data-anim="hero-handoff"]')!
  const boot = hero.querySelector<HTMLElement>('[data-anim="hero-boot"]')!

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
        ease: ease.glide,
      },
    )
    .fromTo(
      heroSweepOrder,
      {
        xPercent: (_, element) =>
          Number((element as HTMLElement).dataset.collapseX ?? 0) * 0.72,
        yPercent: (_, element) =>
          Number((element as HTMLElement).dataset.collapseY ?? 0) * 0.72,
        rotation: (_, element) =>
          Number((element as HTMLElement).dataset.collapseRotation ?? 0) * 0.7,
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
        ease: ease.glide,
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
      scrub: scrub.hero,
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
          Number((element as HTMLElement).dataset.collapseRotation ?? 0),
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
}
