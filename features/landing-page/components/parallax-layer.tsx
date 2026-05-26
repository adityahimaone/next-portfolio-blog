'use client'

import { motion } from 'motion/react'
import { useParallaxLayer } from '../hooks/use-parallax-layer'

interface ParallaxLayerProps {
  speed: number
  direction?: 'up' | 'down'
  className?: string
  children: React.ReactNode
}

export function ParallaxLayer({
  speed,
  direction = 'up',
  className,
  children,
}: ParallaxLayerProps) {
  const { ref, y } = useParallaxLayer({ speed, direction })

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
      data-parallax="true"
    >
      {children}
    </motion.div>
  )
}
