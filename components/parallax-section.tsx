'use client'

import { useRef } from 'react'
import { m as motion, useScroll, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

interface ParallaxSectionProps {
  children: React.ReactNode
  /** Unique section ID for accessibility and scroll targeting */
  id?: string
  /** Additional className for the outer section element */
  className?: string
  /** Speed multiplier for the background layer parallax (default: 0.15).
   *  Higher = more movement = appears deeper */
  bgSpeed?: number
  /** Speed multiplier for the mid layer parallax (default: 0.08) */
  midSpeed?: number
  /** Whether to fade in/out at section edges (default: true) */
  edgeFade?: boolean
  /** Background layer content — decorative elements like grids, glows */
  backgroundLayer?: React.ReactNode
  /** Mid layer content — headings, labels, decorative screws */
  midLayer?: React.ReactNode
  /** Whether to disable parallax entirely (for mobile). Default: false.
   *  When true, all layers render but transforms are zeroed out. */
  disabled?: boolean
}

export function ParallaxSection({
  children,
  id,
  className,
  bgSpeed = 0.15,
  midSpeed = 0.08,
  edgeFade = true,
  backgroundLayer,
  midLayer,
  disabled = false,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Set up transforms
  const rawBgY = useTransform(scrollYProgress, [0, 1], [0, -(bgSpeed * 200)])
  const rawMidY = useTransform(scrollYProgress, [0, 1], [0, -(midSpeed * 200)])
  const rawOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0.4, 1, 1, 0.4]
  )

  // Use static values when disabled
  const bgY = disabled ? 0 : rawBgY
  const midY = disabled ? 0 : rawMidY
  const opacity = disabled ? 1 : edgeFade ? rawOpacity : 1

  return (
    <motion.section
      ref={ref}
      id={id}
      className={cn('relative w-full overflow-hidden', className)}
    >
      {/* Background layer (z-0) */}
      {backgroundLayer && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          style={{ y: bgY, opacity, willChange: 'transform' }}
        >
          {backgroundLayer}
        </motion.div>
      )}

      {/* Mid layer (z-1) */}
      {midLayer && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-1 overflow-hidden"
          style={{ y: midY, willChange: 'transform' }}
        >
          {midLayer}
        </motion.div>
      )}

      {/* Foreground layer (z-2) */}
      <motion.div
        className="relative z-2 w-full"
        style={{ opacity }}
      >
        {children}
      </motion.div>
    </motion.section>
  )
}
