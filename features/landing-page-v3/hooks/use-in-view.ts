'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * useInView — IntersectionObserver-backed visibility flag.
 * Defaults to triggering when 25% of element is in viewport.
 */
export function useInView<T extends Element = HTMLDivElement>(
  options?: IntersectionObserverInit & { once?: boolean },
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  const seen = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!ref.current) return

    const el = ref.current
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            seen.current = true
            if (options?.once) obs.unobserve(el)
          } else if (!options?.once) {
            setInView(false)
          }
        }
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -10% 0px',
        ...options,
      },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
    }
  }, [options])

  return { ref, inView } as const
}
