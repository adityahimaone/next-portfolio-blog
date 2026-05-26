'use client'

import { useEffect, useState } from 'react'
import { useCursorFollower } from '../hooks/use-cursor-follower'

export type CursorVariant = 'default' | 'hover-link' | 'hover-project' | 'hover-image'

export function CursorFollower() {
  const { dotRef } = useCursorFollower()
  const [variant, setVariant] = useState<CursorVariant>('default')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Detect hover targets for variant changes
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [data-cursor="link"]')) {
        setVariant('hover-link')
      } else if (target.closest('[data-cursor="project"]')) {
        setVariant('hover-project')
      } else if (target.closest('[data-cursor="image"]')) {
        setVariant('hover-image')
      } else {
        setVariant('default')
      }
    }

    document.addEventListener('mouseover', handleMouseOver)

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  const sizeMap: Record<CursorVariant, number> = {
    default: 40,
    'hover-link': 60,
    'hover-project': 80,
    'hover-image': 70,
  }

  const size = sizeMap[variant]

  return (
    <div
      ref={dotRef}
      className="cursor-follower"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: '1px solid var(--color-ink)',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease',
        mixBlendMode: 'difference',
        backgroundColor:
          variant === 'hover-project'
            ? 'rgba(0,0,0,0.05)'
            : 'transparent',
      }}
    />
  )
}
