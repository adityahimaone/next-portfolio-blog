'use client'

import { useEffect, type RefObject } from 'react'

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
  const stage = element.querySelector<HTMLElement>('[data-bridge-stage]')
  const statement = element.querySelector<HTMLElement>(
    '[data-bridge-statement]',
  )
  const room = element.querySelector<HTMLElement>('[data-bridge-room]')
  const rack = element.querySelector<HTMLElement>('[data-bridge-rack]')
  const caption = element.querySelector<HTMLElement>('[data-bridge-caption]')
  const cables = element.querySelector<SVGElement>('[data-bridge-cables]')
  const slots = Array.from(
    element.querySelectorAll<HTMLElement>('[data-bridge-slot]'),
  )

  const anchors: HTMLElement[] = []
  const rots: HTMLElement[] = []
  for (const device of BRIDGE_DEVICES) {
    const anchor = element.querySelector<HTMLElement>(
      `[data-bridge-device="${device.id}"]`,
    )
    const rot = element.querySelector<HTMLElement>(
      `[data-bridge-rot="${device.id}"]`,
    )
    if (anchor) anchors.push(anchor)
    if (rot) rots.push(rot)
  }

  if (
    !stage ||
    !statement ||
    !room ||
    !rack ||
    !caption ||
    !cables ||
    slots.length !== BRIDGE_DEVICES.length ||
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
    rack.style.setProperty('--rack', String(frame.rack))
    caption.style.setProperty('--k', String(frame.caption))

    frame.devices.forEach((device, index) => {
      anchors[index].style.transform =
        `translate3d(${device.x}px, ${device.y}px, 0) scale(${device.scale})`
      anchors[index].style.setProperty('--o', String(device.opacity))
      rots[index].style.transform =
        `rotateX(${device.rx}deg) rotateY(${device.ry}deg) rotateZ(${device.rz}deg)`
      slots[index].style.setProperty('--lit', String(device.lit))
      cables.style.setProperty(`--c${index}`, String(device.cable))
    })
  }

  measure()
  const trigger = ScrollTrigger.create({
    trigger: element,
    start: 'top top',
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onRefreshInit: measure,
    onRefresh: (self) => render(bridgeFrame(self.progress, width, height)),
    onUpdate: (self) => render(bridgeFrame(self.progress, width, height)),
  })
  render(bridgeFrame(trigger.progress, width, height))

  return () => {
    trigger.kill()
    statement.style.removeProperty('--s')
    room.style.removeProperty('--r')
    rack.style.removeProperty('--rack')
    caption.style.removeProperty('--k')
    anchors.forEach((anchor) => {
      anchor.style.transform = ''
      anchor.style.removeProperty('--o')
    })
    rots.forEach((rot) => {
      rot.style.transform = ''
    })
    slots.forEach((slot) => slot.style.removeProperty('--lit'))
    for (let index = 0; index < BRIDGE_DEVICES.length; index += 1) {
      cables.style.removeProperty(`--c${index}`)
    }
  }
}
