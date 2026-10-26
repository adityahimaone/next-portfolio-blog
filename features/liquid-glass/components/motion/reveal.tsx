'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const EASE = [0.22, 1, 0.36, 1] as const

/** Fade + rise, triggered once. The default entrance for every block. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

/** Parent for staggered groups. Use with `StaggerItem`. */
export function Stagger({
  children,
  className,
  amount = 0.25,
}: {
  children: ReactNode
  className?: string
  amount?: number
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  )
}

/**
 * Word-by-word reveal for the hero statement.
 *
 * GSAP drives this one rather than Framer Motion because it is the only
 * animation that has to start on mount (not on scroll) and hand off precisely
 * to the turntable's entrance — one timeline, one clock.
 */
export function HeroStatement({
  lines,
  className,
}: {
  lines: string[]
  className?: string
}) {
  const ref = useRef<HTMLHeadingElement | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (reduced) return

    const words = element.querySelectorAll<HTMLElement>('[data-word]')
    const context = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 118, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.055,
          delay: 0.35,
        },
      )
    }, element)

    return () => context.revert()
  }, [reduced])

  return (
    <h1 ref={ref} className={className}>
      {lines.map((line, lineIndex) => (
        <span key={line} className="block overflow-hidden pb-[0.06em]">
          {line.split(' ').map((word, wordIndex) => (
            <span
              key={`${word}-${wordIndex}`}
              data-word
              className="inline-block will-change-transform"
            >
              {word}
              {wordIndex < line.split(' ').length - 1 ? '\u00A0' : null}
            </span>
          ))}
          {lineIndex < lines.length - 1 ? <span aria-hidden> </span> : null}
        </span>
      ))}
    </h1>
  )
}

/**
 * Scroll-linked parallax used on section rules and the archive rows.
 * `scrub` keeps it bound to scroll position rather than time, which is what
 * makes depth read as depth instead of as an animation.
 */
export function Parallax({
  children,
  from = 40,
  to = -40,
  className,
}: {
  children: ReactNode
  from?: number
  to?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element || reduced) return

    gsap.registerPlugin(ScrollTrigger)

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { y: from },
        {
          y: to,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        },
      )
    }, element)

    return () => context.revert()
  }, [from, reduced, to])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
