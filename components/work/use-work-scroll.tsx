'use client'

import { useCallback, useState, type RefObject } from 'react'
import {
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'

/**
 * Scroll is the tonearm: `activeIndex` is which release is under the
 * needle, `trackProgress` is how far through that release we are. There is
 * no timer, so scrolling stays the single source of truth.
 */
export function useWorkScroll(
  ref: RefObject<HTMLElement | null>,
  count: number,
) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const [activeIndex, setActiveIndex] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(p * count)))
    setActiveIndex((prev) => (prev === next ? prev : next))
  })

  // 0..1 inside the active track.
  const trackProgress: MotionValue<number> = useTransform(
    scrollYProgress,
    (p) => {
      const x = Math.min(p * count, count - 1e-6)
      return x - Math.floor(x)
    },
  )

  useMotionValueEvent(trackProgress, 'change', (p) => {
    setLineIndex(Math.floor(p * 4))
  })

  const rawAngle = useTransform(trackProgress, [0, 1], [8, 28])
  const angle = useSpring(rawAngle, { stiffness: 120, damping: 18, mass: 0.6 })

  const scrollToTrack = useCallback(
    (index: number) => {
      const el = ref.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      const scrollable = el.offsetHeight - window.innerHeight
      const target = top + ((index + 0.5) / count) * scrollable
      window.scrollTo({ top: target, behavior: 'smooth' })
    },
    [ref, count],
  )

  return {
    scrollYProgress,
    trackProgress,
    activeIndex,
    lineIndex,
    angle,
    scrollToTrack,
  }
}

/** Renders the hidden SVG refraction filter once, for the glass panels. */
export function GlassFilters() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: 'absolute' }}
    >
      <defs>
        <filter id="glass-refract" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="soft"
            scale="28"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
