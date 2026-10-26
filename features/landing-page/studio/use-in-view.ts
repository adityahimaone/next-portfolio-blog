'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A one-shot in-view signal with our own observer, plus an `armed` flag.
 *
 * The flag is the important half. The reveal is visible by default, so a page
 * whose JavaScript never arrives (or whose dev hydration is having a bad day)
 * still reads as a page. Only elements that actually start below the fold are
 * armed; those hide themselves a frame later and animate in when the observer
 * says they have arrived. Nothing above the fold can flash.
 */
export function useInView<T extends Element>(amount = 0.12) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Above the fold, reduced motion, or no observer: the finished state is
    // already on screen. Schedule the flag rather than setting it in the effect
    // body, which keeps React's cascading-render lint happy and costs a frame
    // nobody can see (nothing was hidden in the first place).
    const showNow =
      reduced ||
      typeof IntersectionObserver === 'undefined' ||
      element.getBoundingClientRect().top < window.innerHeight * 0.92

    if (showNow) {
      const frame = requestAnimationFrame(() => setInView(true))
      return () => cancelAnimationFrame(frame)
    }

    let observer: IntersectionObserver | null = null
    const frame = requestAnimationFrame(() => {
      setArmed(true)
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setInView(true)
            observer?.disconnect()
          }
        },
        { threshold: amount, rootMargin: '0px 0px -6% 0px' },
      )
      observer.observe(element)
    })

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [amount])

  return { ref, armed, inView }
}
