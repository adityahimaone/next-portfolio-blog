'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

/**
 * One Lenis instance for the Side Two surface, wired into GSAP's ticker so
 * scroll-linked timelines and the inertia scroll share a single frame clock.
 *
 * Deliberately scoped: the site's older landing route runs its own scroll
 * engine, and two Lenis instances fighting over the same scroll position is a
 * jitter bug that is very hard to attribute later. The provider only mounts on
 * the routes that use this surface.
 */

let instance: Lenis | null = null

export function getLenis(): Lenis | null {
  return instance
}

/** Smooth-scroll to a section, falling back to native behaviour. */
export function scrollToSection(hash: string) {
  const target = hash.startsWith('#') ? hash : `#${hash}`
  const element = document.querySelector<HTMLElement>(target)
  if (!element) return

  if (instance) {
    instance.scrollTo(element, { offset: -24, duration: 1.25 })
    return
  }

  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      autoRaf: false,
    })

    instance = lenis

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.off('scroll', onScroll)
      lenis.destroy()
      instance = null
    }
  }, [])

  return <>{children}</>
}
