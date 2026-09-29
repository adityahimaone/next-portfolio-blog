'use client'

import { useEffect, useState } from 'react'

let cached: boolean | null = null

/**
 * Real refraction via an SVG displacement filter is Chromium-only and costs
 * real GPU time, so it stays behind a capability gate. Safari and Firefox get
 * the standard frosted look, which is indistinguishable at this scale.
 */
function detectRefraction(): boolean {
  if (typeof window === 'undefined') return false
  if (cached !== null) return cached

  try {
    if (!window.CSS?.supports?.('backdrop-filter', 'url(#glass-refract)')) {
      cached = false
      return cached
    }
  } catch {
    cached = false
    return cached
  }

  const cores = navigator.hardwareConcurrency ?? 0
  if (cores > 0 && cores <= 4) {
    cached = false
    return cached
  }

  const reducedTransparency = window.matchMedia(
    '(prefers-reduced-transparency: reduce)',
  ).matches
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  if (reducedTransparency || reducedMotion) {
    cached = false
    return cached
  }

  cached = /Chrome|Chromium|Edg/.test(navigator.userAgent)
  return cached
}

export function useRefraction(): boolean {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(detectRefraction())
  }, [])

  return enabled
}

/** Live-updating read for media queries the section branches on. */
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
