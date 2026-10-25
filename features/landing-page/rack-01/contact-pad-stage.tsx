'use client'

import { useEffect, useRef } from 'react'
import { CONTACT_PAD_COLORS } from '../constants'
import styles from './contact-pad-stage.module.css'

/**
 * A 3D copy of the controller's 4x4 pad grid, tilted like a desk. Decorative:
 * the FAQ drives it. Opening question N lifts pad N and lights it in the same
 * colour the real pad wears above; the rest breathe in a diagonal wave, the
 * same sweep the real pads play when the section arrives. The grid leans
 * toward the pointer while it is on screen.
 */
export function ContactPadStage({ lit }: { lit: number | null }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return
    let visible = false
    let frame = 0
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(el)
    const onMove = (e: PointerEvent) => {
      if (!visible || frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const r = el.getBoundingClientRect()
        const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth
        const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight
        el.style.setProperty('--tx', `${(x * 26).toFixed(2)}deg`)
        el.style.setProperty('--ty', `${(y * -14).toFixed(2)}deg`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div ref={ref} className={styles.stage} aria-hidden="true">
      <div className={styles.board}>
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            className={styles.pad}
            data-lit={lit === i}
            style={
              {
                '--c': CONTACT_PAD_COLORS[i],
                '--d': `${((i >> 2) + (i & 3)) * 130}ms`,
              } as React.CSSProperties
            }
          >
            <div className={styles.cap}>
              <span className={styles.top}>
                {i < 4 ? String(i + 1).padStart(2, '0') : ''}
              </span>
              <span className={styles.front} />
              <span className={styles.side} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
