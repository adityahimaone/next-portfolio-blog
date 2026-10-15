'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Arms every `[data-bench-reveal]` under the root and fires each once, when it
 * is on screen.
 *
 * Until this runs, the headings it governs are ordinary, fully visible text.
 * Arming (`data-armed`) is what lets the stylesheet hide their letters or
 * words, and it only happens when the visitor allows motion and the browser
 * can say when an element is in view. No script, no observer or reduced
 * motion: the headings just read. A reveal that could strand a heading
 * invisible would be a worse bug than no reveal at all.
 */
export function useBenchReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element) return
    if (typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = Array.from(
      element.querySelectorAll<HTMLElement>('[data-bench-reveal]'),
    )
    for (const target of targets) target.dataset.armed = 'true'

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const target = entry.target as HTMLElement
          target.dataset.in = 'true'
          observer.unobserve(target)
        }
      },
      { threshold: 0.4 },
    )
    for (const target of targets) observer.observe(target)

    return () => {
      observer.disconnect()
      for (const target of targets) {
        delete target.dataset.armed
        delete target.dataset.in
      }
    }
  }, [root])
}
