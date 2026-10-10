'use client'

import type { RefObject } from 'react'
import { useEffect } from 'react'

import { riddimFrame } from './riddim-choreography'

/**
 * The RIDDIM hero's scroll bridge.
 *
 * One ScrollTrigger over the hero writes `riddimFrame(progress)` into CSS
 * custom properties on the section; the stylesheet does the per-element maths
 * (`rotate(calc(var(--r-controls) * var(--sweep) * 1deg))`). No timeline, no
 * React state on the scroll path, and no per-element style writes — a scroll
 * tick is a handful of `setProperty` calls, skipped when the value has not
 * changed.
 *
 * There is nothing to measure and nothing to pin: the hero's height IS the
 * machine's height, so progress 0 is the machine's top edge at the top of the
 * viewport and progress 1 is its bottom edge at the bottom, which is also the
 * frame the About band arrives in. The only thing written outside the numbers
 * is the counter, because four seven-segment digits are not something CSS can
 * express.
 *
 * Lenis is owned by the page's engine, which calls `ScrollTrigger.update` on
 * every scroll; this hook only has to create a trigger. If the engine is not
 * running (reduced motion) neither is this: the powered, at-rest machine is
 * the whole hero.
 */

const LIVE_QUERY =
  '(min-width: 769px) and (prefers-reduced-motion: no-preference)'

export function useRiddimHero({
  heroRef,
}: {
  heroRef: RefObject<HTMLElement | null>
}) {
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    if (!window.matchMedia(LIVE_QUERY).matches) return

    let cancelled = false
    let teardown: (() => void) | undefined

    const setup = async () => {
      let gsap: (typeof import('gsap'))['gsap']
      let ScrollTrigger: (typeof import('gsap/ScrollTrigger'))['ScrollTrigger']
      try {
        const [g, st] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])
        gsap = g.gsap
        ScrollTrigger = st.ScrollTrigger
      } catch {
        hero.dataset.live = 'failed'
        return
      }
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      const written = new Map<string, string>()
      const set = (name: string, value: string) => {
        if (written.get(name) === value) return
        written.set(name, value)
        hero.style.setProperty(name, value)
      }
      const n = (value: number, digits = 4) => value.toFixed(digits)

      const segs = Array.from(hero.querySelectorAll<SVGGElement>('[data-seg]'))

      const apply = (progress: number) => {
        const f = riddimFrame(progress)
        set('--r-power', n(f.power))
        set('--r-controls', n(f.controls))
        set('--r-meter', n(f.meter))
        set('--r-ink', n(f.ink))
        set('--r-readout', n(f.readout))
        set('--r-play', n(f.play))
        set('--r-handoff', n(f.handoff))

        // The readout is the only DOM text that changes per frame; write each
        // digit only when it changes.
        for (let i = 0; i < segs.length && i < f.digits.length; i++) {
          if (segs[i].dataset.v !== f.digits[i]) segs[i].dataset.v = f.digits[i]
        }
      }

      const trigger = ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onRefresh: (self) => apply(self.progress),
        onUpdate: (self) => apply(self.progress),
      })
      apply(trigger.progress)
      hero.dataset.live = 'true'

      /* ---- the panel's sheen follows the pointer, eased in the ticker ---- */
      const fine = window.matchMedia('(pointer: fine)').matches
      let tx = 0
      let ty = 0
      let cx = 0
      let cy = 0
      const onMove = (event: PointerEvent) => {
        const r = hero.getBoundingClientRect()
        tx = ((event.clientX - r.left) / r.width - 0.5) * 2
        ty = ((event.clientY - r.top) / r.height - 0.5) * 2
      }
      const onLeave = () => {
        tx = 0
        ty = 0
      }
      const tick = (_time: number, deltaMs?: number) => {
        const dt = Math.min((deltaMs ?? 16) / 1000, 1 / 20)
        const k = 1 - Math.exp(-dt * 5)
        cx += (tx - cx) * k
        cy += (ty - cy) * k
        set('--r-ptr-x', n(cx, 3))
        set('--r-ptr-y', n(cy, 3))
      }
      if (fine) {
        hero.addEventListener('pointermove', onMove)
        hero.addEventListener('pointerleave', onLeave)
        gsap.ticker.add(tick)
      }

      const onResize = () => ScrollTrigger.refresh()
      window.addEventListener('resize', onResize)

      teardown = () => {
        window.removeEventListener('resize', onResize)
        if (fine) {
          hero.removeEventListener('pointermove', onMove)
          hero.removeEventListener('pointerleave', onLeave)
          gsap.ticker.remove(tick)
        }
        trigger.kill()
        written.forEach((_value, name) => hero.style.removeProperty(name))
        written.clear()
        delete hero.dataset.live
      }
    }

    void setup()

    return () => {
      cancelled = true
      teardown?.()
    }
  }, [heroRef])
}
