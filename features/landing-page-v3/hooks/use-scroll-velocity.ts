'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * useScrollVelocity — track scroll velocity in px/ms for skew & inertia FX.
 * Returns a ref-stable getter; component subscribes via re-render at 60fps cap.
 */
export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0)
  const lastY = useRef(0)
  const lastT = useRef(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true

    const tick = (t: number) => {
      if (!mounted) return
      const y = window.scrollY
      const dt = t - lastT.current
      if (dt > 0) {
        const v = (y - lastY.current) / dt
        // Light low-pass filter
        setVelocity((prev) => prev * 0.85 + v * 0.15)
      }
      lastY.current = y
      lastT.current = t
      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => {
      mounted = false
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [])

  return velocity
}
