'use client'

import { useRef } from 'react'
import { useScroll, useTransform, MotionValue } from 'motion/react'

interface UseParallaxLayerProps {
  speed: number // 0.0-1.0
  direction?: 'up' | 'down'
}

interface UseParallaxLayerReturn {
  ref: React.RefObject<HTMLDivElement | null>
  y: MotionValue<number>
}

export function useParallaxLayer({
  speed,
  direction = 'up',
}: UseParallaxLayerProps): UseParallaxLayerReturn {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Clamp speed between 0 and 1
  const clampedSpeed = Math.max(0, Math.min(1, speed))

  // Calculate parallax offset based on section scroll progress
  // offset range: -speed*50 to +speed*50 pixels (subtle, Locomotive Scroll style)
  const multiplier = direction === 'up' ? -1 : 1
  const pixelRange = clampedSpeed * 50
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [pixelRange * multiplier, -pixelRange * multiplier],
  )

  return { ref, y }
}
