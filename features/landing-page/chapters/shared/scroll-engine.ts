import {
  registerSmoothScroll,
  unregisterSmoothScroll,
} from '../../lib/smooth-scroll'

/**
 * The Lenis instance and its ticker wiring, owned by one place.
 *
 * Every chapter depends on the smoothed scroll this engine provides
 * and the work section drives `scrollTo` through it, so the
 * construction and the teardown move together here rather than being
 * inlined in the hook that happens to boot first. Lenis is still
 * imported lazily: together with GSAP it is a meaningful part of
 * first load, and nothing moves without a scroll.
 */
export async function setupScrollEngine(
  gsap: typeof import('gsap')['gsap'],
  ScrollTrigger: typeof import('gsap/ScrollTrigger')['ScrollTrigger'],
): Promise<() => void> {
  const [{ default: Lenis }] = await Promise.all([import('lenis')])

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
  // Publish the instance so the work section can drive scrollTo and
  // lock scrolling. It is absent under reduced motion, where that
  // module falls back to native scrolling.
  registerSmoothScroll(lenis)

  return () => {
    gsap.ticker.remove(updateLenis)
    unregisterSmoothScroll(lenis)
    lenis.destroy()
  }
}
