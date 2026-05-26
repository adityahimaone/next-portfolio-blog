'use client'

import { useRef } from 'react'
import { useScroll, useTransform, MotionValue } from 'motion/react'

interface UseParallaxLayerProps {
  speed: number // 0.0-1.0
  direction?: 'up' | 'down'
}

interface UseParallaxLayerReturn {
  ref: React.RefObject<HTMLDivElement>
  y: MotionValue<number>
}

export function useParallaxLayer({
  speed,
  direction = 'up',
}: UseParallaxLayerProps): UseParallaxLayerReturn {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  // Clamp speed between 0 and 1
  const clampedSpeed = Math.max(0, Math.min(1, speed))

  // Calculate parallax offset based on direction
  const multiplier = direction === 'up' ? -1 : 1
  const y = useTransform(scrollY, (latest) => latest * clampedSpeed * multiplier)

  return { ref, y }
}
