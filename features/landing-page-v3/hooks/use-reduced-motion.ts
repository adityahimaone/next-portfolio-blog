'use client'

import { useEffect, useState } from 'react'

/**
 * useReducedMotion — respect user's system preference.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)

    const handle = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handle)
    return () => mq.removeEventListener('change', handle)
  }, [])

  return reduced
}
