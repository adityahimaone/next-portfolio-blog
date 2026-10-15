'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Arms the About title's letter reveal and fires it once, when it is in view.
 *
 * The title is ordinary, fully visible text until this hook runs. Arming is
 * what lets the stylesheet hide the letters (`data-armed`), and it only
 * happens when the visitor allows motion and the browser can tell us when the
 * title is on screen. No script, no observer or reduced motion: the heading
 * just reads. A reveal that could strand a heading invisible would be a worse
 * bug than no reveal at all.
 */
export function useBenchTitleReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    element.dataset.armed = 'true'

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        element.dataset.in = 'true'
        observer.disconnect()
      },
      { threshold: 0.4 },
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      delete element.dataset.armed
      delete element.dataset.in
    }
  }, [ref])
}
