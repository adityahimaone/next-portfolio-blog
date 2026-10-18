'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * A media query as external state.
 *
 * The FAQ needs two queries before it renders its first client frame:
 * `prefers-reduced-motion` and a fine pointer. Reading them in an effect and
 * writing the result back into state is a cascading render; subscribing with
 * `useSyncExternalStore` lets React read the browser as the source of truth,
 * keeps the server snapshot at `false`, and updates when the user changes the
 * setting.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  )

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
