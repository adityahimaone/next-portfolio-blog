'use client'

import { useEffect, useRef, useState } from 'react'

export type RevealState = 'idle' | 'armed' | 'in'

/**
 * Reveal an element the first time it scrolls into view.
 *
 * The three states are the whole trick. `idle` is what the server renders and
 * what a visitor without JavaScript sees: fully visible, because content must
 * not depend on a script to exist. Only once the effect has run does the
 * element become `armed` (hidden, offset), and the observer then moves it to
 * `in`. An element that is already on screen when it arms goes straight to
 * `in` on the observer's first callback, so nothing is left hidden.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null)
  const [state, setState] = useState<RevealState>('idle')

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    setState('armed')
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setState('in')
        observer.disconnect()
      },
      { threshold },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, state] as const
}
