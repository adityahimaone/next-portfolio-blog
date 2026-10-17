'use client'

import { useEffect, useRef, useState } from 'react'

export type IntroState = 'pending' | 'done'

/**
 * `pending` until the element first scrolls into view, then `done`, once.
 *
 * It exists for the two slit headlines (the section title and the FAQ's), which
 * rise letter by letter through a slit when their section arrives. `pending` is
 * what the server renders and what a visitor with reduced motion, no
 * IntersectionObserver or a stalled observer all converge on `done` from: the
 * safety timeout is what guarantees a headline can never be left below its slit.
 */
export function useIntro<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null)
  const [state, setState] = useState<IntroState>('pending')

  useEffect(() => {
    const node = ref.current
    const still =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!node || still || typeof IntersectionObserver === 'undefined') {
      setState('done')
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        requestAnimationFrame(() => setState('done'))
        observer.disconnect()
      },
      { threshold },
    )
    observer.observe(node)
    const safety = window.setTimeout(() => setState('done'), 3000)
    return () => {
      observer.disconnect()
      window.clearTimeout(safety)
    }
  }, [threshold])

  return [ref, state] as const
}
