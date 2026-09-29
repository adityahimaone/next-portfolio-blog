'use client'

import { useEffect, useState } from 'react'

type FaviconState = 'loading' | 'ready' | 'error'

/**
 * Tracks one favicon's load state.
 *
 * Favicons come from a third-party service over the network, so both the
 * wait and the failure have to be visible — a row that silently shows an empty
 * box reads as a broken link rather than a pending one.
 *
 * Errors resolve to `ready` rather than keeping the loader spinning: there is
 * nothing left to wait for, and a permanently animated row is worse than an
 * empty one. Callers that want a distinct fallback can still read `error`.
 */
export function useFaviconState(src: string): FaviconState {
  const [state, setState] = useState<FaviconState>('loading')

  useEffect(() => {
    if (!src) {
      setState('error')
      return
    }

    let cancelled = false
    setState('loading')

    const image = new Image()
    image.onload = () => {
      if (!cancelled) setState('ready')
    }
    image.onerror = () => {
      if (!cancelled) setState('error')
    }
    image.src = src

    return () => {
      cancelled = true
      image.src = ''
    }
  }, [src])

  return state
}
