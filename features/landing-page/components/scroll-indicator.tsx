'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'

export function ScrollIndicator() {
  const { scrollY } = useScroll()
  const [isVisible, setIsVisible] = useState(true)

  // Fade out when scrollY > 100px
  const opacity = useTransform(scrollY, [0, 100], [1, 0])

  // Hide completely when scrolled past 150px
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsVisible(latest < 150)
    })
    return () => unsubscribe()
  }, [scrollY])

  if (!isVisible) return null

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-8 left-1/2 z-10 -translate-x-1/2"
    >
      <div className="flex flex-col items-center">
        <div
          className="font-ui mb-2 uppercase"
          style={{
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: 'var(--color-off-white)',
          }}
        >
          SCROLL
        </div>
        <motion.div
          animate={{
            y: [0, 6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: '1px',
            height: '24px',
            backgroundColor: 'var(--color-off-white)',
          }}
        />
      </div>
    </motion.div>
  )
}