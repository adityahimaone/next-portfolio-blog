'use client'

import { useEffect, useState } from 'react'

type FaviconState = 'loading' | 'ready' | 'error'

/**
 * Settled load state per favicon URL, shared by every row that shows the same
 * mark.
 *
 * The catalogue is full of repeat domains, and each row also rendered its own
 * `<img>` alongside the `new Image()` probe here — so one page of 60 rows asked
 * the favicon service for 120 images and decoded 120 times. `loading="lazy"` did
 * not help: a preloaded image resolves from cache, so the browser served the
 * second request from memory and still paid the decode and a state flip per
 * row.
 *
 * Sharing one result per URL means a domain that has already answered is
 * painted immediately with no second request and no loader flash, which is what
 * removed the flicker when scrolling fast.
 */
const cache = new Map<string, FaviconState>()
const inFlight = new Map<string, Promise<FaviconState>>()

function loadFavicon(src: string): Promise<FaviconState> {
  const settled = cache.get(src)
  if (settled) return Promise.resolve(settled)

  const pending = inFlight.get(src)
  if (pending) return pending

  const request = new Promise<FaviconState>((resolve) => {
    const image = new Image()
    image.onload = () => resolve('ready')
    image.onerror = () => resolve('error')
    image.src = src
  }).then((state) => {
    cache.set(src, state)
    inFlight.delete(src)
    return state
  })

  inFlight.set(src, request)
  return request
}

/**
 * Tracks one favicon's load state.
 *
 * Favicons come from a third-party service over the network, so both the wait
 * and the failure have to be visible — a row that silently shows an empty box
 * reads as a broken link rather than a pending one.
 *
 * Errors resolve to `ready` rather than keeping the loader spinning: there is
 * nothing left to wait for, and a permanently animated row is worse than an
 * empty one. Callers that want a distinct fallback can still read `error`.
 */
export function useFaviconState(src: string): FaviconState {
  // The state is kept alongside the URL it was resolved for and derived during
  // render, rather than being pushed in by the effect. Two things fall out of
  // that: a URL already in the shared cache paints in the same render instead
  // of flashing a loader first, and there is no synchronous setState in the
  // effect body to cascade a second render off the first.
  const [resolved, setResolved] = useState<{
    src: string
    state: FaviconState
  } | null>(null)

  const state: FaviconState = !src
    ? 'error'
    : resolved?.src === src
      ? resolved.state
      : (cache.get(src) ?? 'loading')

  useEffect(() => {
    if (!src) return

    // Already cached — nothing to fetch, and the render above already knows it.
    if (cache.has(src)) return

    // The row can be gone by the time the image settles. Writing the answer to
    // the shared cache is still right, but re-rendering an unmounted row is
    // not, so the live update is guarded.
    let cancelled = false

    loadFavicon(src).then((next) => {
      if (!cancelled) setResolved({ src, state: next })
    })

    return () => {
      cancelled = true
    }
  }, [src])

  return state
}
