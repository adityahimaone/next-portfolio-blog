'use client'

import { useEffect, useState } from 'react'

/**
 * Media-query and capability hooks shared by the booth shell, the theme
 * toggle and the landing page's work section.
 *
 * These used to live in two places — features/booth/hooks.ts and
 * features/landing-page/work/use-glass.ts — with a byte-identical
 * useMediaQuery and two divergent useRefraction implementations. The stricter
 * of the two refraction checks is the one kept here: it tests the user agent
 * as well as the CSS feature, because `backdrop-filter: url(#filter)` reports
 * support in Safari and Firefox but renders as a flat blur.
 */

/** Tracks a media query so layout forks can branch without a hydration mismatch. */
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
 * The one breakpoint the features branch on in JS. It matches the
 * `max-width: 768px` blocks the booth and rack modules already ship, so the
 * imperative forks and the stylesheet never disagree about where "mobile"
 * starts. Styling still belongs in the modules; this is for the cases a
 * stylesheet cannot express, like swapping a sidebar for a sheet.
 */
export const MOBILE_MQ = '(max-width: 768px)'

export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_MQ)
}

let refractionCache: boolean | null = null

/**
 * Real refraction via an SVG displacement filter is Chromium-only and costs
 * real GPU time, so it stays behind a capability gate. Safari and Firefox get
 * the standard frosted look, which is indistinguishable at this scale.
 *
 * The probe is a one-off, not a media query: neither the user agent nor
 * `hardwareConcurrency` can change during a session, so re-running it on every
 * mount is wasted work.
 */
function detectRefraction(): boolean {
  if (typeof window === 'undefined') return false
  if (refractionCache !== null) return refractionCache

  try {
    if (!window.CSS?.supports?.('backdrop-filter', 'url(#glass-refract)')) {
      refractionCache = false
      return refractionCache
    }
  } catch {
    refractionCache = false
    return refractionCache
  }

  const cores = navigator.hardwareConcurrency ?? 0
  if (cores > 0 && cores <= 4) {
    refractionCache = false
    return refractionCache
  }

  const reducedTransparency = window.matchMedia(
    '(prefers-reduced-transparency: reduce)',
  ).matches
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  if (reducedTransparency || reducedMotion) {
    refractionCache = false
    return refractionCache
  }

  refractionCache = /Chrome|Chromium|Edg/.test(navigator.userAgent)
  return refractionCache
}

export function useRefraction(): boolean {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(detectRefraction())
  }, [])

  return enabled
}
