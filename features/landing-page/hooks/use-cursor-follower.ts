'use client'

import { useEffect, useRef } from 'react'

const LERP_FACTOR = 0.12

export function useCursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    const animate = () => {
      // Lerp towards mouse position
      current.current.x +=
        (mouse.current.x - current.current.x) * LERP_FACTOR
      current.current.y +=
        (mouse.current.y - current.current.y) * LERP_FACTOR

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${current.current.x - 20}px, ${current.current.y - 20}px, 0)`
      }

      rafId.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  return { dotRef }
}
