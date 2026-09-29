'use client'

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'
import { useRefraction } from '@/components/booth/hooks'
import styles from './work.module.css'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  small?: boolean
  style?: CSSProperties
}

/**
 * The glass stack, in order: blur + saturation, a tint gradient, a specular
 * rim, and a pointer-following highlight. Budget allows two of these large
 * surfaces on screen at once; `small` uses a cheaper radius and no rim.
 */
export function GlassPanel({
  children,
  className,
  small,
  style,
}: GlassPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const refract = useRefraction()

  const onMove = (event: React.PointerEvent) => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      el.style.setProperty('--my', `${event.clientY - rect.top}px`)
    })
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      style={style}
      className={cn(
        styles.glass,
        small && styles.glassSm,
        refract && !small && styles.glassRefract,
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Lifts a node out of the page for the liner sheet. */
export function useWorkIndex(count: number) {
  const [index, setIndex] = useState(0)
  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  )
  return { index, setIndex, go }
}
