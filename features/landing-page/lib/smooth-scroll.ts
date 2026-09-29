/**
 * Bridge to the landing page's Lenis instance.
 *
 * Lenis is only constructed when GSAP boots and reduced motion is off, so every
 * call site has to tolerate a missing instance. When Lenis is absent we fall
 * back to native scrolling, which is exactly the behaviour the reduced-motion
 * path needs anyway.
 */

type SmoothScrollHandle = {
  scrollTo: (top: number, options?: { duration?: number }) => void
  stop: () => void
  start: () => void
}

let instance: SmoothScrollHandle | null = null

export function registerSmoothScroll(handle: SmoothScrollHandle) {
  instance = handle
}

export function unregisterSmoothScroll(handle: SmoothScrollHandle) {
  if (instance === handle) instance = null
}

export function scrollToY(top: number) {
  if (instance) {
    instance.scrollTo(top, { duration: 1.1 })
    return
  }
  window.scrollTo({ top, behavior: 'smooth' })
}

export function lockScroll() {
  instance?.stop()
  if (!instance) document.documentElement.classList.add('lenis-stopped')
}

export function unlockScroll() {
  instance?.start()
  if (!instance) document.documentElement.classList.remove('lenis-stopped')
}
