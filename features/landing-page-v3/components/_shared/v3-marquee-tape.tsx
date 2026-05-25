'use client'

import { useEffect, useRef } from 'react'
import { useScrollVelocity } from '../../hooks/use-scroll-velocity'
import { MARQUEE_TAPE_V3 } from '../../constants'

/**
 * V3MarqueeTape — infinite scrolling tape between sections.
 * Velocity-aware: scroll speed influences marquee speed; direction flips
 * based on scroll direction for kinetic feel.
 */
export function V3MarqueeTape({
  reverse = false,
  speed = 30,
}: {
  reverse?: boolean
  speed?: number
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const velocity = useScrollVelocity()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const track = trackRef.current
    if (!track) return

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduced) return

    let last = performance.now()

    const tick = (t: number) => {
      const dt = (t - last) / 1000
      last = t

      const dir = reverse ? -1 : 1
      // Base drift + velocity-driven boost
      const boost = Math.min(Math.abs(velocity) * 200, 200)
      const px = (speed + boost) * dt * dir

      offsetRef.current += px

      const half = track.scrollWidth / 2
      if (half > 0) {
        offsetRef.current = ((offsetRef.current % half) + half) % half
      }

      track.style.transform = `translate3d(${-offsetRef.current * dir}px, 0, 0)`
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [reverse, speed, velocity])

  // Duplicate items for seamless loop
  const items = [...MARQUEE_TAPE_V3, ...MARQUEE_TAPE_V3, ...MARQUEE_TAPE_V3]

  return (
    <div
      className="v3-no-scrollbar relative overflow-hidden border-y py-6 md:py-8"
      style={{
        borderColor: 'var(--v3-fog)',
        background:
          'linear-gradient(to right, var(--v3-deep), var(--v3-space), var(--v3-deep))',
      }}
      aria-hidden
    >
      <div
        ref={trackRef}
        className="flex w-max items-center gap-12 will-change-transform md:gap-16"
      >
        {items.map((label, i) => (
          <span key={i} className="flex shrink-0 items-center gap-12 md:gap-16">
            <span
              className="v3-display-sans text-3xl md:text-5xl"
              style={{ color: 'var(--v3-paper)' }}
            >
              {label}
            </span>
            <span
              aria-hidden
              className="block h-2 w-2 shrink-0 rounded-full"
              style={{ background: 'var(--v3-iris-1)' }}
            />
          </span>
        ))}
      </div>
    </div>
  )
}

export default V3MarqueeTape
