'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

type CursorState = 'default' | 'link' | 'drag' | 'view'

/**
 * V3CustomCursor — tactile pointer with multiple states.
 * - default: small dot
 * - link:    expands to outlined ring with label
 * - view:    "VIEW" pill (used over project images)
 * - drag:    "DRAG" pill (used over carousels)
 *
 * Detects state from data attributes:
 *   data-cursor="link" | "view" | "drag"
 *   data-cursor-label="custom text" (optional)
 */
export function V3CustomCursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const stateRef = useRef<CursorState>('default')
  const labelRef = useRef('')
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const labelEl = useRef<HTMLDivElement>(null)

  // Smoothed follower for the ring (slight lag = "weight")
  const sx = useSpring(x, { stiffness: 320, damping: 30, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 320, damping: 30, mass: 0.6 })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Hide on touch
    const isTouch = window.matchMedia('(hover: none)').matches
    if (isTouch) return

    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }

    const updateState = (next: CursorState, label = '') => {
      if (stateRef.current === next && labelRef.current === label) return
      stateRef.current = next
      labelRef.current = label

      const ring = ringRef.current
      const dot = dotRef.current
      const labelDiv = labelEl.current
      if (!ring || !dot || !labelDiv) return

      // Reset
      ring.style.width = '20px'
      ring.style.height = '20px'
      ring.style.borderColor = 'oklch(0.55 0.015 260 / 0.6)'
      ring.style.background = 'transparent'
      dot.style.opacity = '1'
      dot.style.transform = 'translate(-50%, -50%) scale(1)'
      labelDiv.style.opacity = '0'
      labelDiv.textContent = ''

      if (next === 'link') {
        ring.style.width = '40px'
        ring.style.height = '40px'
        ring.style.borderColor = 'oklch(0.92 0.008 80 / 0.9)'
        dot.style.opacity = '0'
      } else if (next === 'view' || next === 'drag') {
        ring.style.width = '76px'
        ring.style.height = '76px'
        ring.style.background = 'oklch(0.92 0.008 80)'
        ring.style.borderColor = 'transparent'
        dot.style.opacity = '0'
        labelDiv.style.opacity = '1'
        labelDiv.textContent = label || (next === 'view' ? 'VIEW' : 'DRAG')
      }
    }

    const over = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const cursorEl = target.closest<HTMLElement>('[data-cursor]')
      if (!cursorEl) {
        updateState('default')
        return
      }
      const mode = cursorEl.dataset.cursor as CursorState
      const label = cursorEl.dataset.cursorLabel ?? ''
      updateState(mode, label)
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
    }
  }, [x, y])

  return (
    <>
      {/* Inner dot — tracks instantly */}
      <motion.div
        ref={dotRef}
        aria-hidden
        style={{
          x,
          y,
          position: 'fixed',
          left: 0,
          top: 0,
          width: 6,
          height: 6,
          marginLeft: -3,
          marginTop: -3,
          borderRadius: 9999,
          background: 'oklch(0.92 0.008 80)',
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'opacity 240ms ease, transform 240ms ease',
        }}
      />
      {/* Outer ring — springs */}
      <motion.div
        ref={ringRef}
        aria-hidden
        style={{
          x: sx,
          y: sy,
          position: 'fixed',
          left: 0,
          top: 0,
          width: 20,
          height: 20,
          translateX: '-50%',
          translateY: '-50%',
          borderRadius: 9999,
          border: '1px solid oklch(0.55 0.015 260 / 0.6)',
          pointerEvents: 'none',
          zIndex: 9998,
          mixBlendMode: 'difference',
          transition:
            'width 320ms cubic-bezier(0.16,1,0.3,1), height 320ms cubic-bezier(0.16,1,0.3,1), background-color 280ms ease, border-color 280ms ease',
        }}
      >
        <div
          ref={labelEl}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'oklch(0.06 0.012 260)',
            fontFamily: 'var(--font-geist-mono, monospace)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: 0,
            transition: 'opacity 240ms ease',
            mixBlendMode: 'normal',
          }}
        />
      </motion.div>
    </>
  )
}

export default V3CustomCursor
