'use client'

import type { RefObject } from 'react'
import { useEffect } from 'react'

import { riddimFrame, riddimStory } from './riddim-choreography'

/**
 * The RIDDIM hero's scroll bridge.
 *
 * One ScrollTrigger over the stage writes `riddimFrame(progress)` and
 * `riddimStory(progress)` into CSS custom properties on the section; the
 * stylesheet does the per-element maths
 * (`rotate(calc(var(--r-controls) * var(--sweep) * 1deg))`, and the camera's
 * `translateY(var(--cam-ty)) scale(var(--cam-s))`). No timeline, no React
 * state on the scroll path, and no per-element style writes — a scroll tick is
 * a handful of `setProperty` calls, skipped when the value has not changed.
 *
 * The stage is the tall element and the machine's viewport sticks to the top
 * of it, so progress 0 is the title card at the top of the stage and progress
 * 1 is the frame the About band arrives in. The only thing measured is the
 * machine's own height, which is what turns `riddimStory`'s single `zoom`
 * number into the camera's scale and offset — the LCD's fit, in clone units,
 * measured once per refresh rather than per frame.
 *
 * The counter is the only DOM text written per frame, because four
 * seven-segment digits are not something CSS can express. `data-beat` is
 * written when the beat changes so the stylesheet can gate the machine's
 * pointer events and the PLAY key's pulse.
 *
 * Lenis is owned by the page's engine, which calls `ScrollTrigger.update` on
 * every scroll; this hook only has to create a trigger. If the engine is not
 * running (reduced motion) neither is this: the powered, at-rest machine is
 * the whole hero.
 */

const LIVE_QUERY =
  '(min-width: 769px) and (prefers-reduced-motion: no-preference)'
/** The width the story itself runs at; below it the poster is static. */
const STORY_QUERY = '(min-width: 1181px)'

/** The clone canvas, and the framings the camera moves between. */
const CANVAS_H = 1317
/** The top half of the machine: header, speaker, screen, VOLUME…METRONOME. */
const BOOT_W = 952
const BOOT_H = 730
/** The LCD's rect inside the canvas — where the story pushes back in. */
const LCD_H = 268
const LCD_CENTRE = 458

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function useRiddimHero({
  heroRef,
  stageRef,
}: {
  heroRef: RefObject<HTMLElement | null>
  stageRef: RefObject<HTMLElement | null>
}) {
  useEffect(() => {
    const hero = heroRef.current
    const stage = stageRef.current
    if (!hero || !stage) return
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
      const story = window.matchMedia(STORY_QUERY)

      /* One clone unit in pixels. It comes from the machine's own height, so
         the camera is exact at every window size without a second constant to
         keep in sync with the stylesheet's aspect ratio. */
      let unit = 0
      /**
       * How far down the viewport the machine's frame starts. The top bar is a
       * normal-flow first child of the hero, so at rest it holds the sticky
       * viewport — and the boot window with it — down by its own height. Both
       * are untransformed and neither is sticky, so the distance between their
       * boxes is the same at every scroll position.
       */
      let inset = 0
      const measure = () => {
        const height = machine?.offsetHeight ?? 0
        unit = height > 0 ? height / CANVAS_H : 0
        inset = Math.max(
          0,
          stage.getBoundingClientRect().top - hero.getBoundingClientRect().top,
        )
      }
      measure()

      const apply = (progress: number) => {
        const f = riddimFrame(progress)
        const s = riddimStory(progress)
        set('--r-power', n(f.power))
        set('--r-controls', n(f.controls))
        set('--r-meter', n(f.meter))
        set('--r-ink', n(f.ink))
        set('--r-readout', n(f.readout))
        set('--r-play', n(f.play))
        set('--r-handoff', n(f.handoff))

        set('--r-pull', n(s.pull))
        set('--r-push', n(s.push))
        set('--r-sides', n(s.sides))
        set('--r-swap', n(s.swap))
        set('--r-about', n(s.about))
        set('--r-flip', n(s.flip))

        // The camera. Three framings, and the story's two numbers walk between
        // them: the boot window contained in the room the top bar leaves, the
        // whole machine at its stylesheet size, and the LCD filling the height.
        // The offset then walks the framed centre to the viewport's, which is
        // zero at fit height, so the poster is centred.
        if (unit > 0 && story.matches) {
          const vw = window.innerWidth
          const vh = window.innerHeight
          // The bar scrolls away in the first pixels of the story, so `head`
          // is spent long before the pull is under way.
          const head = Math.max(0, inset - window.scrollY)
          const bootScale = Math.min(
            vw / (BOOT_W * unit),
            (vh - head) / (BOOT_H * unit),
          )
          const aboutScale = vh / (LCD_H * unit)
          const scale = lerp(lerp(bootScale, 1, s.pull), aboutScale, s.push)
          const centre = lerp(
            lerp(BOOT_H / 2, CANVAS_H / 2, s.pull),
            LCD_CENTRE,
            s.push,
          )
          set('--cam-s', n(scale, 5))
          set(
            '--cam-ty',
            `${((CANVAS_H / 2 - centre) * unit * scale - head / 2).toFixed(2)}px`,
          )
        }

        // The readout is the only DOM text that changes per frame; write each
        // digit only when it changes.
        for (let i = 0; i < segs.length && i < f.digits.length; i++) {
          if (segs[i].dataset.v !== f.digits[i]) segs[i].dataset.v = f.digits[i]
        }

        if (hero.dataset.beat !== s.beat) hero.dataset.beat = s.beat
      }

      // Write the frame at progress 0 first, then hand the layout over: the
      // stage grows from one viewport to `--stage-h` the moment `data-live`
      // lands, and the trigger below must measure it at its real height — a
      // trigger created before the growth sees `start === end` and pins
      // progress at 1 for the rest of the page's life.
      apply(0)
      hero.dataset.live = 'true'

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure()
          apply(self.progress)
        },
        onUpdate: (self) => apply(self.progress),
      })
      apply(trigger.progress)
      ScrollTrigger.refresh()

      /* ---- the opening frame, which the trigger cannot see ---------------
         The top bar holds the sticky viewport — and the boot frame with it —
         down by its own height until it has scrolled away. That happens while
         the trigger's progress is still exactly zero, so the scroll ticks it
         ignores are precisely the ones that move the frame the page opens on.
         The listener does one subtraction per tick and stops mattering after
         the bar is gone. */
      let head = Math.max(0, inset - window.scrollY)
      const onScroll = () => {
        const next = Math.max(0, inset - window.scrollY)
        if (next === head) return
        head = next
        apply(trigger.progress)
      }
      window.addEventListener('scroll', onScroll, { passive: true })

      /* ---- keyboard: a control only exists while the whole machine is up ---
         The machine's controls are the page's navigation, and they are only
         clickable — and legible — during the overview beat. Tabbing into one
         from outside it would otherwise focus something the camera has pushed
         off the screen, so bring the stage to the overview first. */
      const overviewTop = () => {
        const span = stage.offsetHeight - window.innerHeight
        if (span <= 0) return null
        const rect = stage.getBoundingClientRect()
        return window.scrollY + rect.top + span * 0.5
      }
      const onFocusIn = (event: FocusEvent) => {
        const target = event.target
        if (!(target instanceof Element)) return
        if (!target.closest('[data-control]')) return
        if (hero.dataset.beat === 'overview') return
        const top = overviewTop()
        if (top != null) window.scrollTo({ top, behavior: 'smooth' })
      }
      hero.addEventListener('focusin', onFocusIn)

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
        window.removeEventListener('scroll', onScroll)
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
        delete hero.dataset.beat
      }
    }

    void setup()

    return () => {
      cancelled = true
      teardown?.()
    }
  }, [heroRef, stageRef])
}
