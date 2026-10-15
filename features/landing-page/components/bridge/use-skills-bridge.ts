'use client'

import { useEffect, type RefObject } from 'react'

import { setGlassPose } from '../glass/glass-registry'
import {
  BRIDGE_DEVICES,
  bridgeFrame,
  type BridgeFrame,
} from './skills-bridge-frame'

/**
 * The one media query the scene gates on, written out here and in
 * `skills-bridge.module.css`: wide enough, tall enough, motion allowed. A
 * viewport that fails any of them gets the static composition from both.
 */
const BRIDGE_QUERY =
  '(min-width: 769px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)'

type Gsap = (typeof import('gsap'))['gsap']
type ScrollTriggerStatic =
  (typeof import('gsap/ScrollTrigger'))['ScrollTrigger']

/**
 * The bridge's motion: one pinned trigger, one pure frame, a handful of writes.
 *
 * The shape is the one `use-bench-motion.ts` established and it is kept on
 * purpose. Dependencies are imported inside the activation path, so a phone or
 * a reduced-motion visitor never pays for them. There is no ticker and no
 * smoother here: the page's single Lenis instance owns the scroll position.
 * Every write is a transform or a custom property on one small node, never on
 * the section, so a scroll tick restyles a few nodes rather than the page.
 * Everything written is unwritten on teardown, so a resize across the
 * breakpoint leaves the static composition exactly as the stylesheet drew it.
 */
export function useSkillsBridge(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element) return

    const query = window.matchMedia(BRIDGE_QUERY)
    let disposed = false
    let token = 0
    let teardown: (() => void) | null = null

    const activate = async () => {
      if (disposed || teardown) return
      const mine = ++token

      let gsap: Gsap
      let ScrollTrigger: ScrollTriggerStatic
      try {
        ;[{ gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])
      } catch (error) {
        console.error('Skills bridge: dependencies failed to load', error)
        return
      }
      if (disposed || mine !== token || root.current !== element) return

      gsap.registerPlugin(ScrollTrigger)
      const stop = startBridge({ ScrollTrigger, element })
      if (disposed || mine !== token || root.current !== element) {
        stop()
        return
      }
      teardown = stop
    }

    const sync = () => {
      if (query.matches) {
        void activate()
        return
      }
      token += 1
      teardown?.()
      teardown = null
    }

    sync()
    query.addEventListener('change', sync)

    return () => {
      disposed = true
      token += 1
      query.removeEventListener('change', sync)
      teardown?.()
      teardown = null
    }
  }, [root])
}

function startBridge({
  ScrollTrigger,
  element,
}: {
  ScrollTrigger: ScrollTriggerStatic
  element: HTMLElement
}): () => void {
  const one = <T extends Element>(selector: string) =>
    element.querySelector<T>(selector)
  const all = <T extends Element>(selector: string) =>
    Array.from(element.querySelectorAll<T>(selector))

  const stage = one<HTMLElement>('[data-bridge-stage]')
  const statement = one<HTMLElement>('[data-bridge-statement]')
  const room = one<HTMLElement>('[data-bridge-room]')
  const core = one<HTMLElement>('[data-bridge-core]')
  const horizon = one<HTMLElement>('[data-bridge-horizon]')
  const caption = one<HTMLElement>('[data-bridge-caption]')
  const words = all<HTMLElement>('[data-bridge-word]')
  const rings = all<HTMLElement>('[data-bridge-ring]')
  const slots = all<HTMLElement>('[data-bridge-slot]')

  const anchors: HTMLElement[] = []
  const rots: HTMLElement[] = []
  for (const device of BRIDGE_DEVICES) {
    const anchor = one<HTMLElement>(`[data-bridge-device="${device.id}"]`)
    const rot = one<HTMLElement>(`[data-bridge-rot="${device.id}"]`)
    if (anchor) anchors.push(anchor)
    if (rot) rots.push(rot)
  }

  if (
    !stage ||
    !statement ||
    !room ||
    !core ||
    !horizon ||
    !caption ||
    slots.length !== 3 ||
    anchors.length !== BRIDGE_DEVICES.length ||
    rots.length !== BRIDGE_DEVICES.length
  ) {
    console.error(
      'Skills bridge: markup is incomplete; leaving the static flow',
    )
    return () => {}
  }

  let width = 1440
  let height = 900
  const measure = () => {
    const box = stage.getBoundingClientRect()
    width = box.width || 1440
    height = box.height || 900
  }

  const render = (frame: BridgeFrame) => {
    statement.style.setProperty('--s', String(frame.statement))
    room.style.setProperty('--r', String(frame.iris))
    horizon.style.setProperty('--r', String(frame.iris))
    core.style.setProperty('--core', String(frame.core))
    caption.style.setProperty('--k', String(frame.caption))

    frame.devices.forEach((device, index) => {
      anchors[index].style.transform =
        `translate3d(${device.x}px, ${device.y}px, 0) scale(${device.scale})`
      anchors[index].style.setProperty('--o', String(device.opacity))
      const posed = setGlassPose(rots[index], {
        rx: device.rx,
        ry: device.ry,
        rz: device.rz,
        p: Math.min(1, frame.progress * 2),
        spin: device.spin,
      })
      if (!posed) {
        rots[index].style.transform =
          `rotateX(${device.rx}deg) rotateY(${device.ry}deg) rotateZ(${device.rz}deg)`
      }
    })

    frame.words.forEach((word, index) => {
      const node = words[index]
      if (!node) return
      node.style.transform = `translate3d(${word.x}px, ${word.y}px, ${word.z}px)`
      node.style.opacity = String(word.opacity)
    })
    frame.rings.forEach((ring, index) => {
      const node = rings[index]
      if (!node) return
      node.style.transform = `translate3d(0, 0, ${ring.z}px)`
      node.style.opacity = String(ring.opacity)
    })
    frame.plates.forEach((plate, index) => {
      slots[index].style.translate = `0 0 ${plate.z}px`
      slots[index].style.opacity = String(plate.opacity)
      slots[index].style.setProperty('--lit', String(plate.lit))
    })
  }

  measure()
  const draw = (progress: number) =>
    render(bridgeFrame(progress, width, height, words.length))

  const trigger = ScrollTrigger.create({
    trigger: element,
    start: 'top top',
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onRefreshInit: measure,
    onRefresh: (self) => draw(self.progress),
    onUpdate: (self) => draw(self.progress),
  })
  draw(trigger.progress)

  return () => {
    trigger.kill()
    statement.style.removeProperty('--s')
    room.style.removeProperty('--r')
    horizon.style.removeProperty('--r')
    core.style.removeProperty('--core')
    caption.style.removeProperty('--k')
    anchors.forEach((anchor) => {
      anchor.style.transform = ''
      anchor.style.removeProperty('--o')
    })
    rots.forEach((rot) => {
      rot.style.transform = ''
    })
    for (const node of [...words, ...rings]) {
      node.style.transform = ''
      node.style.opacity = ''
    }
    slots.forEach((slot) => {
      slot.style.translate = ''
      slot.style.opacity = ''
      slot.style.removeProperty('--lit')
    })
  }
}
