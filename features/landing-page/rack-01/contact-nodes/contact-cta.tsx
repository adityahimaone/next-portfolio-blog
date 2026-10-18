'use client'

import { useRef, type PointerEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

import styles from './contact-nodes.module.css'

const SPRING = { stiffness: 180, damping: 20, mass: 0.5 }

/**
 * The one exit from the field.
 *
 * Two things follow the pointer: the pill itself (capped at a few pixels, so
 * it reads as attraction rather than a sticker stuck to the cursor) and a warm
 * light inside it. Both are motion values, so a pointer sweep re-renders
 * nothing. Touch clients get the link with neither effect.
 */
export function MagneticCta({
  email,
  enabled,
}: {
  email: string
  enabled: boolean
}) {
  const link = useRef<HTMLAnchorElement>(null)
  const pullX = useMotionValue(0)
  const pullY = useMotionValue(0)
  const lightX = useMotionValue(0)
  const lightY = useMotionValue(0)

  const x = useSpring(pullX, SPRING)
  const y = useSpring(pullY, SPRING)
  const lx = useSpring(lightX, SPRING)
  const ly = useSpring(lightY, SPRING)

  const transform = useTransform<number, string>(
    [x, y],
    ([moveX, moveY]) =>
      `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`,
  )
  const lightTransform = useTransform<number, string>(
    [lx, ly],
    ([moveX, moveY]) =>
      `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`,
  )

  const reset = () => {
    pullX.set(0)
    pullY.set(0)
    lightX.set(0)
    lightY.set(0)
  }

  const follow = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!enabled || !link.current) return
    const box = link.current.getBoundingClientRect()
    const dx = event.clientX - (box.left + box.width / 2)
    const dy = event.clientY - (box.top + box.height / 2)
    pullX.set(dx * 0.16)
    pullY.set(dy * 0.24)
    lightX.set(dx)
    lightY.set(dy)
  }

  return (
    <div className={styles.ctaField}>
      <motion.a
        ref={link}
        className={styles.cta}
        href={`mailto:${email}`}
        style={{ transform }}
        onPointerMove={follow}
        onPointerLeave={reset}
        onBlur={reset}
      >
        <motion.span
          className={styles.ctaGlow}
          aria-hidden="true"
          style={{ transform: lightTransform }}
        />
        <span className={styles.ctaText}>Still unsure? Email me</span>
        <span className={styles.ctaIcon} aria-hidden="true">
          ↗
        </span>
      </motion.a>
      <p className={styles.ctaNote}>Usually a reply within a couple of days.</p>
    </div>
  )
}
