'use client'

import type { RefObject } from 'react'
import { useEffect } from 'react'

import { cameraAt, fillScale } from './riddim-camera'
import { RIDDIM_PHASES, riddimFrame } from './riddim-choreography'
import { CANVAS } from './riddim-geometry'

/**
 * The RIDDIM hero's scroll bridge.
 *
 * One ScrollTrigger over the pinned hero writes `riddimFrame(progress)` and the
 * camera into CSS custom properties on the section; the stylesheet does the
 * per-element maths (`rotate(calc(var(--r-controls) * var(--sweep) * 1deg))`,
 * `translate(calc(var(--cam-dx) * var(--u)), …)`). No timeline, no React state
 * on the scroll path, and no per-element style writes — a scroll tick is about
 * twenty `setProperty` calls, skipped when the value has not changed.
 *
 * Everything on that path is written once per frame at most, and the two things
 * that are not scroll-driven are written as little as possible: the pointer
 * parallax runs its easing only while it is actually moving and stops the
 * ticker when it settles, and the counter's digits are written per digit, only
 * when the digit changes. The stylesheet does the rest by keeping the plane's
 * subtree out of the picture entirely until the plane is standing in for
 * something.
 *
 * What it measures is one number: the scale at which the LCD is as wide as the
 * stage, which depends on the viewport and so cannot be a constant. It is
 * remeasured on every ScrollTrigger refresh. What it writes outside the
 * numbers is the counter (four seven-segment digits are not something CSS can
 * express) and three flags the stylesheet cannot derive: which surface shows
 * the screen (`data-plane`), and when the side panels and the plane are out of
 * the tab order (`data-side`).
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
      const machine = hero.querySelector<HTMLElement>('[data-riddim-machine]')
      const stage = hero.querySelector<HTMLElement>('[data-riddim-stage]')

      let fill = 2
      let progressNow = 0
      const measure = () => {
        if (!machine || !stage) return
        // offsetWidth is layout width: the camera's transform does not touch it.
        const unit = machine.offsetWidth / CANVAS.w
        if (unit > 0) fill = fillScale(stage.clientWidth, unit)
      }

      const apply = (progress: number) => {
        progressNow = progress
        const f = riddimFrame(progress)
        const cam = cameraAt(f, fill)
        set('--r-power', n(f.power))
        set('--r-controls', n(f.controls))
        set('--r-meter', n(f.meter))
        set('--r-ink', n(f.ink))
        set('--r-ink2', n(f.inkTwo))
        set('--r-readout', n(f.readout))
        set('--r-play', n(f.play))
        set('--r-handoff', n(f.handoff))
        set('--r-open', n(f.open))
        set('--r-press', n(f.press))
        set('--r-swap', n(f.swap))
        set('--r-side', n(f.side))
        set('--r-flip', n(f.flip))
        set('--cam-s', n(cam.scale))
        set('--cam-dx', n(cam.dx, 2))
        set('--cam-dy', n(cam.dy, 2))
        // The two flags the stylesheet cannot derive. Both are selector hooks
        // for whole subtrees, so write them only when they actually flip.
        const plane = f.plane ? 'on' : 'off'
        if (hero.dataset.plane !== plane) hero.dataset.plane = plane
        const side = f.side > 0.02 ? 'on' : 'off'
        if (hero.dataset.side !== side) hero.dataset.side = side

        // The readout is the only DOM text that changes per frame; write each
        // digit only when it changes. Four digits per screen, four screens.
        for (let i = 0; i < segs.length; i++) {
          const digit = f.digits[i % f.digits.length]
          if (segs[i].dataset.v !== digit) segs[i].dataset.v = digit
        }
      }

      const trigger = ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure()
          apply(self.progress)
        },
        onUpdate: (self) => apply(self.progress),
      })
      measure()
      apply(trigger.progress)
      hero.dataset.live = 'true'

      /* A control that takes focus while the camera is on the screen is out of
         view; bring the story to the overview, where the machine is whole. */
      const [pa, pb] = RIDDIM_PHASES.drift
      const onFocusIn = (event: FocusEvent) => {
        const target = event.target as HTMLElement | null
        if (!target?.closest('[data-control], [data-side-link]')) return
        if (progressNow >= pa && progressNow <= pb) return
        const y =
          trigger.start + (trigger.end - trigger.start) * ((pa + pb) / 2)
        window.scrollTo({ top: y })
      }
      hero.addEventListener('focusin', onFocusIn)

      /* ---- the panel's sheen follows the pointer, eased in the ticker ---- */
      const fine = window.matchMedia('(pointer: fine)').matches
      let tx = 0
      let ty = 0
      let cx = 0
      let cy = 0
      let running = false
      const tick = (_time: number, deltaMs?: number) => {
        const dt = Math.min((deltaMs ?? 16) / 1000, 1 / 20)
        const k = 1 - Math.exp(-dt * 5)
        cx += (tx - cx) * k
        cy += (ty - cy) * k
        // Once the easing has closed to a third of a thousandth the sheen is
        // standing still, and `--r-ptr-*` is a blend on the whole machine: stop
        // asking for a frame until the pointer moves again.
        const settled = Math.abs(tx - cx) < 0.0003 && Math.abs(ty - cy) < 0.0003
        if (settled) {
          cx = tx
          cy = ty
        }
        set('--r-ptr-x', n(cx, 3))
        set('--r-ptr-y', n(cy, 3))
        if (settled) {
          running = false
          gsap.ticker.remove(tick)
        }
      }
      const wake = () => {
        if (running) return
        running = true
        gsap.ticker.add(tick)
      }
      const onMove = (event: PointerEvent) => {
        const r = hero.getBoundingClientRect()
        tx = ((event.clientX - r.left) / r.width - 0.5) * 2
        ty = ((event.clientY - r.top) / r.height - 0.5) * 2
        wake()
      }
      const onLeave = () => {
        tx = 0
        ty = 0
        wake()
      }
      if (fine) {
        hero.addEventListener('pointermove', onMove)
        hero.addEventListener('pointerleave', onLeave)
      }

      const onResize = () => ScrollTrigger.refresh()
      window.addEventListener('resize', onResize)

      teardown = () => {
        window.removeEventListener('resize', onResize)
        hero.removeEventListener('focusin', onFocusIn)
        if (fine) {
          hero.removeEventListener('pointermove', onMove)
          hero.removeEventListener('pointerleave', onLeave)
          gsap.ticker.remove(tick)
        }
        trigger.kill()
        written.forEach((_value, name) => hero.style.removeProperty(name))
        written.clear()
        delete hero.dataset.live
        delete hero.dataset.plane
        delete hero.dataset.side
      }
    }

    void setup()

    return () => {
      cancelled = true
      teardown?.()
    }
  }, [heroRef])
}
