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
  const heroSweepOrder = heroSweepIndices(modules).map(
    (index) => modules[index],
  )

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

  /**
   * The walk-out collapse, retimed to the immersive phase table.
   *
   * The positions below are the ones the Hero → About contract names, and they
   * are deliberately the same dials `IMMERSIVE_PHASES` in `arrangement-camera.ts`
   * reads: `scan` is where the supporting lanes start to recede, `lock` is where
   * the profile clip becomes the focal point, `dive` is where the clip opens,
   * `reveal` is where About is whole.
   *
   * What this chapter is NOT is a second camera. The arrangement hero has its
   * own single ScrollTrigger in `use-arrangement-hero.ts`, and that hook is the
   * only thing that writes the zoom, the camera offset and the seam. This
   * timeline moves the legacy hero's own furniture — the wall, the name, the
   * panel, the rail, the handoff — and nothing that the camera owns. Adding a
   * second trigger to the same element is exactly what the contract forbids.
   *
   * Note the shape of the second half: the supporting modules fade to `.16`
   * and stay there, the anchors lift by 8% brightness, and the rail and the
   * handoff come up. There is no zoom-out and no pull-back anywhere in it,
   * because a zoom-out here would break the spatial continuity the dive spent
   * the first half of the window establishing.
   */
  collapse
    .to(
      supportingModules,
      {
        opacity: 0.16,
        scale: 0.98,
        duration: 0.22,
        stagger: 0.01,
      },
      0.24,
    )
    .to(
      anchors,
      {
        opacity: 1,
        filter: 'brightness(1.08) saturate(1)',
        duration: 0.2,
      },
      0.34,
    )
    .to(
      panel,
      {
        xPercent: -12,
        opacity: 0,
        filter: 'blur(4px)',
        duration: 0.18,
      },
      0.42,
    )
    .to(
      name,
      {
        scale: 1.26,
        letterSpacing: '-0.05em',
        duration: 0.42,
      },
      0.42,
    )
    .to(
      heroRail,
      {
        y: () => -Math.min(176, window.innerHeight * 0.2),
        opacity: 0.42,
        duration: 0.28,
      },
      0.66,
    )
    // `fromTo`, not `to`. The contract writes this step as a `.to()` onto
    // `{ yPercent: 0, opacity: 1 }`, which is the state the handoff is already
    // in — the step would have compiled, run, and moved nothing. The starting
    // frame is what carries the meaning: the handoff is parked below the fold
    // and rises into place as the profile clip opens.
    .fromTo(
      handoff,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.24,
      },
      0.72,
    )
    .to(
      atmosphere,
      {
        opacity: 0.1,
        duration: 0.2,
      },
      0.8,
    )
    // The chapter's own two remaining steps. They belong to elements the
    // contract does not name — the rail's link and the transport routes — and
    // they are kept rather than dropped, because a route that has been faded
    // out has to come back in and a link sitting on a rail that just moved has
    // to keep its own contrast. Both sit inside the same phase window.
    .to(routes, { opacity: 1, y: 0, duration: 0.18 }, 0.34)
    .to(routes, { opacity: 0, y: -5, duration: 0.16 }, 0.66)
    .to(
      heroRailLink,
      {
        color: 'rgba(16, 18, 17, 0.9)',
        duration: 0.36,
      },
      0.66,
    )
}
