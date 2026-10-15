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
 */
export function GlassDevice({
  kind,
  fallback,
}: {
  kind: GlassKind
  fallback: ReactNode
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

    const start = async () => {
      if (started) return
      started = true
      try {
        const { attachGlass } = await import('./glass-devices')
        if (disposed) return
        handle = await attachGlass(canvasEl, kind)
        if (!handle) return
        if (disposed) {
          handle.dispose()
          handle = null
          return
        }
        hostEl.dataset.glass = 'on'
      } catch (error) {
        // The CSS device stays. Nothing else is lost.
        console.error('Glass device: could not start', error)
      }
    }

    if (typeof IntersectionObserver === 'undefined') {
      void start()
      return () => {
        disposed = true
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          void start()
        }
      },
      { rootMargin: '480px' },
    )
    observer.observe(hostEl)

    return () => {
      disposed = true
      observer.disconnect()
      handle?.dispose()
      handle = null
      delete hostEl.dataset.glass
    }
  }, [kind])

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
