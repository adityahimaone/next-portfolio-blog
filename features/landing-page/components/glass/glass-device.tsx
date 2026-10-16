'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import type { GlassHandle, GlassKind } from './glass-registry'
import styles from './glass-device.module.css'

/**
 * One glass device: a canvas, and the CSS device it replaces until it is ready.
 *
 * The fallback is in the DOM from the first render, so a device is never blank:
 * it is the old CSS solid until the model has loaded and drawn a first frame,
 * and it stays the CSS solid if WebGL is unavailable or anything throws. Once a
 * frame is on the canvas, `data-glass="on"` is set on the host and the
 * stylesheet swaps them. That attribute is also what the chapter stylesheet
 * asks (`:has`) before it stops applying its own CSS tilt.
 *
 * The model is loaded when the device first comes within a screen of the
 * viewport, not on mount: the page has a dozen of them and most are below the
 * fold. three.js is imported inside that path, so none of it is part of first
 * load.
 *
 * ## Why `gate` exists
 *
 * Taking over is a one-way door for the stylesheet: `data-glass="on"` hides the
 * CSS solid *and* switches off the CSS tilt that poses it. That is only safe
 * when the scene's own motion hook is running, because the hook is what writes
 * the `--p` the canvas is posed from.
 *
 * It is not always running. Every scene here is gated on a media query —
 * `BENCH_QUERY`, `BRIDGE_QUERY` — that fails on a short viewport or for a
 * reduced-motion visitor, and a canvas does not know that. Ungated, it would
 * attach on a 640px-tall window, hide the CSS solid, switch off the CSS tilt,
 * and then sit forever on the three.js rest orientation, because nothing was
 * ever going to call `setGlassPose`. The device would be frozen where the CSS
 * solid had been a composed resting frame.
 *
 * So the caller passes the query its scene already gates on, and the canvas
 * only takes over while that query matches. Outside it the CSS solid stays, and
 * the scene falls back to exactly the frame the stylesheet authored.
 */
/** One warm-up for the whole page, however many devices there are. */
let warmRequested = false

export function GlassDevice({
  kind,
  fallback,
  gate,
}: {
  kind: GlassKind
  fallback: ReactNode
  /** The scene's motion query. Omitted means "always allowed to take over". */
  gate?: string
}) {
  const host = useRef<HTMLSpanElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const hostEl = host.current
    const canvasEl = canvas.current
    if (!hostEl || !canvasEl) return

    let disposed = false
    let handle: GlassHandle | null = null
    let started = false
    let warm: IntersectionObserver | null = null
    let observer: IntersectionObserver | null = null
    /**
     * Bumped by every `stop`. An `attachGlass` that resolves after one has run
     * must not put `data-glass="on"` back on a host the gate has closed.
     */
    let generation = 0

    const query = gate ? window.matchMedia(gate) : null

    const stop = () => {
      generation += 1
      started = false
      warm?.disconnect()
      observer?.disconnect()
      warm = null
      observer = null
      handle?.dispose()
      handle = null
      delete hostEl.dataset.glass
    }

    const start = async () => {
      if (started) return
      started = true
      const mine = generation
      try {
        const { attachGlass } = await import('./glass-devices')
        if (disposed || mine !== generation) return
        const next = await attachGlass(canvasEl, kind)
        if (!next) return
        if (disposed || mine !== generation) {
          next.dispose()
          return
        }
        handle = next
        hostEl.dataset.glass = 'on'
      } catch (error) {
        // The CSS device stays. Nothing else is lost.
        console.error('Glass device: could not start', error)
      }
    }

    const arm = () => {
      if (observer) return
      if (typeof IntersectionObserver === 'undefined') {
        void start()
        return
      }

      // A few screens out, compile everything while the page is idle, so the
      // first device to arrive does not pay for it.
      warm = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return
          warm?.disconnect()
          if (warmRequested) return
          warmRequested = true
          const run = () =>
            void import('./glass-devices').then((module) => module.warmGlass())
          // Not every browser has an idle callback; those get a short delay.
          const idle = (
            window as Window & {
              requestIdleCallback?: (
                callback: () => void,
                options?: { timeout: number },
              ) => number
            }
          ).requestIdleCallback
          if (idle) idle(run, { timeout: 3000 })
          else window.setTimeout(run, 200)
        },
        { rootMargin: '3200px' },
      )
      warm.observe(hostEl)

      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect()
            observer = null
            void start()
          }
        },
        { rootMargin: '480px' },
      )
      observer.observe(hostEl)
    }

    const sync = () => {
      if (query && !query.matches) stop()
      else arm()
    }

    sync()
    query?.addEventListener('change', sync)

    return () => {
      disposed = true
      query?.removeEventListener('change', sync)
      stop()
    }
  }, [kind, gate])

  return (
    <span ref={host} className={styles.host}>
      <span className={styles.fallback}>{fallback}</span>
      <canvas
        ref={canvas}
        className={styles.canvas}
        data-glass-canvas=""
        aria-hidden="true"
      />
    </span>
  )
}
