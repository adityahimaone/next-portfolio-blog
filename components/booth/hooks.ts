'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Tracks a media query so layout forks (sticky stage vs stacked) can branch
 * in JS without a hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const list = window.matchMedia(query)
    setMatches(list.matches)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True when the visitor has asked for less motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * Real refraction is a Chromium-only, GPU-heavy enhancement. Gate it on the
 * two conditions that actually make it safe: support, and enough cores to
 * afford it.
 */
export function useRefraction(): boolean {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const supports = window.CSS?.supports?.(
      'backdrop-filter',
      'url(#glass-refract)',
    )
    const cores = navigator.hardwareConcurrency ?? 4
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const reducedTransparency = window.matchMedia(
      '(prefers-reduced-transparency: reduce)',
    ).matches

    setEnabled(
      Boolean(supports) && cores > 4 && !reduced && !reducedTransparency,
    )
  }, [])

  return enabled
}

/** Counts down at ~4Hz rather than per frame; used by the reader's time readouts. */
export function useThrottledCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delayMs: number,
) {
  const last = useRef(0)
  const pending = useRef<A | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fn = useRef(callback)
  fn.current = callback

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  return useRef((...args: A) => {
    pending.current = args
    const now = Date.now()
    const wait = Math.max(0, delayMs - (now - last.current))
    if (timer.current) return
    timer.current = setTimeout(() => {
      last.current = Date.now()
      timer.current = null
      if (pending.current) fn.current(...pending.current)
    }, wait)
  }).current
}
