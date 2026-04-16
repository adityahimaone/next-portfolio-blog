'use client'

import { useState } from 'react'
import { useScroll, useMotionValueEvent } from 'motion/react'

export function useScrollState(threshold = 50) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > threshold)
  })

  return isScrolled
}
