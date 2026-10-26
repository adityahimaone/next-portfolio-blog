'use client'

import { useEffect, useRef } from 'react'

/**
 * Pointer interactions, all written as CSS custom properties.
 *
 * The rule these share: a hover effect must never trigger a React render. The
 * pointer moves at 120Hz on a trackpad; state that lives in the component tree
 * would put the whole page through reconciliation for a 1px highlight. Writing
 * `--lg-mx` on the element and letting CSS compose the gradient keeps the main
 * thread free and the effect compositor-friendly.
 */

/**
 * Specular spotlight + chromatic rim angle for a `.lg-glass` pane.
 * Positions are written in percentages so the gradient follows any resize.
 */
export function useSpotlight<T extends HTMLElement = HTMLDivElement>(
  options: { angle?: boolean } = {},
) {
  const ref = useRef<T | null>(null)
  const { angle = true } = options

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let frame = 0

    const onMove = (event: PointerEvent) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const rect = element.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const px = (x / rect.width) * 100
        const py = (y / rect.height) * 100
        element.style.setProperty('--lg-mx', `${px.toFixed(2)}%`)
        element.style.setProperty('--lg-my', `${py.toFixed(2)}%`)
        if (angle) {
          // Rim sweep is tied to the pointer's bearing from the centre, so the
          // iridescence turns as you move rather than snapping to quadrants.
          const radians = Math.atan2(y - rect.height / 2, x - rect.width / 2)
          const degrees = (radians * 180) / Math.PI
          element.style.setProperty(
            '--lg-angle',
            `${(degrees + 90).toFixed(1)}deg`,
          )
        }
      })
    }

    const onEnter = () => element.setAttribute('data-lit', 'true')
    const onLeave = () => {
      element.removeAttribute('data-lit')
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerenter', onEnter)
    element.addEventListener('pointerleave', onLeave)

    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerenter', onEnter)
      element.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [angle])

  return ref
}

/**
 * Magnetic pull. The element drifts toward the cursor while it is inside a
 * padded hit area, then springs back on exit. `strength` is the fraction of the
 * cursor offset the element is allowed to travel (0.1–0.35 reads as "alive"
 * without feeling broken).
 */
export function useMagnetic<T extends HTMLElement = HTMLButtonElement>(
  strength = 0.22,
  radius = 90,
) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let active = false

    const tick = () => {
      currentX += (targetX - currentX) * 0.14
      currentY += (targetY - currentY) * 0.14
      element.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`

      const settled =
        Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1

      if (!active && settled) {
        frame = 0
        element.style.transform = ''
        return
      }
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame) return
      frame = requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      const distance = Math.hypot(dx, dy)
      const reach = Math.max(rect.width, rect.height) / 2 + radius

      active = distance < reach
      if (!active) {
        targetX = 0
        targetY = 0
      } else {
        const pull = 1 - distance / reach
        targetX = dx * strength * pull
        targetY = dy * strength * pull
      }
      start()
    }

    const onLeaveWindow = () => {
      active = false
      targetX = 0
      targetY = 0
      start()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeaveWindow)
    element.addEventListener('pointerleave', onLeaveWindow)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeaveWindow)
      element.removeEventListener('pointerleave', onLeaveWindow)
      if (frame) cancelAnimationFrame(frame)
      element.style.transform = ''
    }
  }, [radius, strength])

  return ref
}

/**
 * Subtle parallax tilt for the hero instrument. ±3.5deg is the ceiling — past
 * that a circular object starts to read as a coin rather than a platter.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(max = 3.5) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let frame = 0

    const onMove = (event: PointerEvent) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const rect = element.getBoundingClientRect()
        const nx = (event.clientX - (rect.left + rect.width / 2)) / rect.width
        const ny = (event.clientY - (rect.top + rect.height / 2)) / rect.height
        element.style.setProperty('--lg-tilt-x', `${(-ny * max).toFixed(2)}deg`)
        element.style.setProperty('--lg-tilt-y', `${(nx * max).toFixed(2)}deg`)
      })
    }

    const reset = () => {
      element.style.setProperty('--lg-tilt-x', '0deg')
      element.style.setProperty('--lg-tilt-y', '0deg')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', reset)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', reset)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [max])

  return ref
}
