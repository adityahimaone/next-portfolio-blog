'use client'

import type { RefObject } from 'react'
import { useEffect } from 'react'

import {
  dapFrame,
  formatTime,
  portalAt,
  portalRest,
  type PortalRest,
} from './dap-choreography'
import { SCREEN } from './dap-content'

/**
 * The DAP hero's scroll bridge.
 *
 * One ScrollTrigger feeds `dapFrame(progress)` into CSS custom properties on
 * the stage; the stylesheet does the per-layer maths (`translateZ(var(--z) *
 * var(--dap-explode))`). No timeline, no React state on the scroll path, and
 * no per-element style writes — a scroll tick is about twenty
 * `setProperty` calls, skipped when the value has not changed.
 *
 * Lenis is owned by the page's engine, which calls `ScrollTrigger.update` on
 * every scroll; this hook only has to create a trigger. If the engine is not
 * running (reduced motion) neither is this: the static, assembled player is
 * the whole hero.
 *
 * Runs only at `min-width: 769px` with motion allowed. Below that, or under
 * `prefers-reduced-motion`, the stylesheet lays the hero out as a normal
 * section and nothing here downloads.
 */

const LIVE_QUERY =
  '(min-width: 769px) and (prefers-reduced-motion: no-preference)'

export function useDapHero({
  sectionRef,
  stageRef,
  slotRef,
  elapsedRef,
}: {
  sectionRef: RefObject<HTMLElement | null>
  stageRef: RefObject<HTMLElement | null>
  slotRef: RefObject<HTMLElement | null>
  elapsedRef: RefObject<HTMLElement | null>
}) {
  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const slot = slotRef.current
    if (!section || !stage || !slot) return
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
        // The section is tall by default so the stage can pin; without the
        // libraries there is nothing to scrub, so collapse it to one screen.
        section.dataset.live = 'failed'
        return
      }
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      const written = new Map<string, string>()
      const set = (name: string, value: string) => {
        if (written.get(name) === value) return
        written.set(name, value)
        stage.style.setProperty(name, value)
      }
      const n = (value: number, digits = 4) => value.toFixed(digits)
      const px = (value: number) => `${value.toFixed(2)}px`

      /* ---- portal geometry, measured against the stage ---- */
      let rest: PortalRest | null = null
      const measure = () => {
        // The slot is a plain box — no transform on it or its ancestors — so
        // its rect is the device's rest position whatever the scroll is doing.
        const stageRect = stage.getBoundingClientRect()
        const r = slot.getBoundingClientRect()
        rest = portalRest(
          {
            left: r.left - stageRect.left + SCREEN.x * r.width,
            top: r.top - stageRect.top + SCREEN.y * r.height,
            width: SCREEN.w * r.width,
            height: SCREEN.h * r.height,
          },
          stageRect.width,
          stageRect.height,
          SCREEN.r * r.width,
        )
        set('--dap-pox', px(rest.ox))
        set('--dap-poy', px(rest.oy))
      }

      let lastElapsed = -1
      const apply = (progress: number) => {
        const f = dapFrame(progress)
        set('--dap-explode', n(f.explode))
        set('--dap-tilt-x', n(f.tiltX, 3))
        set('--dap-tilt-y', n(f.tiltY, 3))
        set('--dap-callouts', n(f.callouts))
        set('--dap-signal', n(f.signal))
        set('--dap-calm', n(f.calm))
        set('--dap-light', n(f.light))
        set('--dap-copy', n(f.copy))
        set('--dap-keys', n(f.keys))
        set('--dap-fill', n(f.fill))
        set('--dap-portal-label', n(f.portalLabel))

        if (rest) {
          const w = portalAt(rest, f.portal)
          set('--dap-pt', px(w.top))
          set('--dap-pr', px(w.right))
          set('--dap-pb', px(w.bottom))
          set('--dap-pl', px(w.left))
          set('--dap-prad', px(w.radius))
          set('--dap-pscale', n(w.scale))
        }
        stage.dataset.portal = f.portal > 0.001 ? 'on' : 'off'
        // Hidden keys must also leave the tab order, which opacity cannot do.
        stage.dataset.keys = f.keys > 0.04 ? 'on' : 'off'

        // The readout is the only text that changes per frame; write it only
        // when the visible second changes.
        const whole = Math.floor(f.elapsed)
        if (whole !== lastElapsed && elapsedRef.current) {
          lastElapsed = whole
          elapsedRef.current.textContent = formatTime(f.elapsed)
        }
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
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
      section.dataset.live = 'true'

      /* ---- pointer parallax, eased in the ticker ---- */
      const fine = window.matchMedia('(pointer: fine)').matches
      let tx = 0
      let ty = 0
      let cx = 0
      let cy = 0
      const onMove = (event: PointerEvent) => {
        const r = stage.getBoundingClientRect()
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
        set('--dap-ptr-x', n(cx, 3))
        set('--dap-ptr-y', n(cy, 3))
      }
      if (fine) {
        stage.addEventListener('pointermove', onMove)
        stage.addEventListener('pointerleave', onLeave)
        gsap.ticker.add(tick)
      }

      // Fonts and the viewport settle after first paint; remeasure then.
      const onResize = () => ScrollTrigger.refresh()
      window.addEventListener('resize', onResize)

      teardown = () => {
        window.removeEventListener('resize', onResize)
        if (fine) {
          stage.removeEventListener('pointermove', onMove)
          stage.removeEventListener('pointerleave', onLeave)
          gsap.ticker.remove(tick)
        }
        trigger.kill()
        written.forEach((_value, name) => stage.style.removeProperty(name))
        written.clear()
        delete stage.dataset.portal
        delete stage.dataset.keys
        delete section.dataset.live
        if (elapsedRef.current) elapsedRef.current.textContent = formatTime(0)
      }
    }

    void setup()

    return () => {
      cancelled = true
      teardown?.()
    }
  }, [sectionRef, stageRef, slotRef, elapsedRef])
}
