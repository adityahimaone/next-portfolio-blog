'use client'

import {
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'
import styles from './work.module.css'

type GlassPanelProps = {
  children: ReactNode
  className?: string
  small?: boolean
  refract?: boolean
  style?: CSSProperties
  role?: string
  'aria-label'?: string
}

/**
 * A liquid-glass surface. The specular highlight follows the pointer via CSS
 * custom properties set on the element itself — writing to a parent's variable
 * would recalculate styles for every descendant.
 */
export function GlassPanel({
  children,
  className,
  small,
  refract,
  style,
  role,
  'aria-label': ariaLabel,
}: GlassPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const element = ref.current
      if (!element) return
      const bounds = element.getBoundingClientRect()
      element.style.setProperty('--mx', `${event.clientX - bounds.left}px`)
      element.style.setProperty('--my', `${event.clientY - bounds.top}px`)
    })
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      style={style}
      role={role}
      aria-label={ariaLabel}
      className={cn(
        styles.glass,
        small && styles.glassSm,
        refract && styles.glassRefract,
        className,
      )}
    >
      {children}
    </div>
  )
}
