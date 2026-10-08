'use client'

import type { RefObject } from 'react'
import { useEffect } from 'react'

import {
  decayEnergy,
  energyFromVelocity,
  cameraAt,
  smootherstep,
} from './pad-sea/pad-field-math'

/**
 * The hero's DOM-side motion, kept out of `use-rack-animations.ts` on purpose.
 *
 * The rack hook's timelines are tuned to the decimal and select by CSS-module
 * class name, so it is the wrong place to bolt a new scroll story onto. This
 * hook owns exactly three things and touches nothing else:
 *
 *  1. **The scroll bridge.** One `ScrollTrigger` writes hero progress and
 *     scroll-speed energy into plain refs. The pad field reads those inside
 *     `useFrame`, so scrubbing never re-renders React — the same rule the
 *     design notes give for the Lenis bridge.
 *  2. **Chromatic offset.** Drives a single CSS custom property on the title
 *     from the decayed energy. It is a colour/`text-shadow` change, not a
 *     transform, so it cannot fight the cascade that owns the letters'
 *     transforms.
 *  3. **The LCD boot.** The three readouts settle in behind the boot sequence.
 *
 * Under `prefers-reduced-motion` none of it runs: no GSAP download, no
 * trigger, and the readouts keep the values they were server-rendered with.
 */
export function useHeroMotion({
  heroRef,
  titleRef,
  readoutsRef,
  progress,
  energy,
}: {
  heroRef: RefObject<HTMLElement | null>
  titleRef: RefObject<HTMLElement | null>
  readoutsRef: RefObject<HTMLElement | null>
  progress: { current: number }
  energy: { current: number }
}) {
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let teardown: (() => void) | undefined

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      // Where the scroll wants the energy to be. The ticker below walks the
      // published value toward it and lets the target itself bleed off, so the
      // water calms when the page stops rather than staying choppy.
      let target = 0

      const trigger = ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress.current = self.progress
          target = energyFromVelocity(self.getVelocity())
        },
        onLeave: () => {
          progress.current = 1
        },
        onLeaveBack: () => {
          progress.current = 0
        },
      })

      const title = titleRef.current
      // The two lines of the name. They are the only elements here whose
      // transform this hook owns, which is why the rack hook no longer touches
      // `.heroBackdropName` at all.
      const nameLines = title
        ? Array.from(
            title.querySelectorAll<HTMLElement>('[data-hero-name-line]'),
          )
        : []

      let elapsed = 0

      const tick = (_time: number, deltaMs?: number) => {
        const dt = Math.min((deltaMs ?? 16) / 1000, 1 / 20)
        elapsed += dt

        target *= Math.exp(-dt * 3.2)
        energy.current = decayEnergy(energy.current, target, dt)
        title?.style.setProperty('--hero-chroma', energy.current.toFixed(3))

        if (!nameLines.length) return

        const p = progress.current
        // The same amplitude curve the pad field's camera uses, so the name
        // rides the swell the pads are drawing instead of an unrelated loop.
        const swell = cameraAt(p).amplitude
        // `smootherstep` mirrors where the camera is: past 0.42 it is diving,
        // and the name leaves the way a key does, bottom line first.
        const dive = smootherstep(0.42, 0.74, p)
        const drift = smootherstep(0.12, 0.5, p)
        const fade = smootherstep(0.6, 0.82, p)

        nameLines.forEach((line, index) => {
          const phase = elapsed * 0.9 + index * 0.85
          const bob = Math.sin(phase) * swell * 1.7
          const roll = Math.sin(phase * 0.72) * swell * 1.2
          const release = dive * (24 + index * 9)
          const y = bob - drift * 2 - release
          const scale = 1 - dive * 0.1
          line.style.transform = `translate3d(0, ${y.toFixed(3)}vh, 0) rotate(${roll.toFixed(3)}deg) scale(${scale.toFixed(4)})`
          line.style.opacity = (1 - fade).toFixed(3)
        })
      }
      gsap.ticker.add(tick)

      const readouts = readoutsRef.current
      const boot = readouts
        ? gsap.utils.toArray<HTMLElement>('[data-hero-readout]', readouts)
        : []

      if (boot.length) {
        gsap.fromTo(
          boot,
          { opacity: 0, yPercent: 34 },
          {
            opacity: 1,
            yPercent: 0,
            duration: 0.44,
            ease: 'power3.out',
            stagger: 0.09,
            delay: 0.82,
            // The readouts start life server-rendered and readable; the
            // animation only re-dresses them, so a JS-less visitor loses
            // nothing.
            clearProps: 'transform',
          },
        )
      }

      teardown = () => {
        gsap.ticker.remove(tick)
        trigger.kill()
        if (boot.length) gsap.killTweensOf(boot)
        title?.style.removeProperty('--hero-chroma')
      }
    }

    void setup()

    return () => {
      cancelled = true
      teardown?.()
    }
  }, [heroRef, titleRef, readoutsRef, progress, energy])
}
