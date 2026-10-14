'use client'

import { useEffect, type RefObject } from 'react'

import {
  MATTER_HOLD,
  matterFrame,
  matterRunway,
  type MatterFrame,
  type MatterGeometry,
} from './matter-frame'
import { createMatterExtras } from './matter-extras'

/**
 * The one media query the bridge gates on, written out here and in
 * `matter.module.css`.
 *
 * It is duplicated on purpose. CSS cannot ask whether the motion setup
 * succeeded, and JS cannot style a sticky stage; so the query is the contract
 * between them. Both sides read the same three conditions — wide enough, tall
 * enough, motion allowed — and a viewport that fails any one of them gets the
 * editorial About in normal flow from both.
 */
const MATTER_QUERY =
  '(min-width: 769px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)'

/** Every number `matterFrame` returns that this hook writes to the DOM. */
type MatterWriterKey =
  | 'deviceOpacity'
  | 'farY'
  | 'middleY'
  | 'nearY'
  | 'signalY'
  | 'titleY'

type Gsap = (typeof import('gsap'))['gsap']
type ScrollTriggerStatic =
  (typeof import('gsap/ScrollTrigger'))['ScrollTrigger']

/**
 * The bridge's motion, scoped to one section and one trigger.
 *
 * ## Why it is shaped like this
 *
 * **The dependencies are imported inside the activation path, not before it.**
 * GSAP and ScrollTrigger together are a meaningful part of first load, and a
 * phone or a reduced-motion visitor must never pay for them. So the watcher is
 * a plain `matchMedia` listener — it exists from the first frame and can
 * activate later — but nothing is fetched until it actually matches.
 *
 * **There is no ticker and no smoother here.** `use-rack-animations.ts` already
 * owns the page's single Lenis instance and the single GSAP ticker that drives
 * it. A second smoother is two clocks fighting over one scroll position, and
 * the design rules it out explicitly.
 *
 * **Nothing is written per frame except transforms and opacities.** No React
 * state, no layout reads, no filter or box-shadow. The geometry is measured on
 * refresh only, and the frame maths is pure.
 *
 * **Every owned inline style is snapshotted and restored.** QuickSetter writes
 * straight to the element and GSAP's context does not capture that, so a resize
 * across the breakpoint would otherwise strand a half-faded stage behind a
 * layout that no longer runs any motion.
 */
/**
 * The hero's own answer for where the source region is when its camera
 * finishes, read from the four custom properties `use-arrangement-hero`
 * publishes on the outgoing device.
 *
 * `null` means "not answered yet" — a page with no hero, or one whose hook has
 * not measured — which the caller handles with its own fallback rather than
 * treating as a failure. The bridge is still a bridge without a hero above it.
 */
function readPublishedSource(host: HTMLElement | null) {
  if (!host) return null
  const style = getComputedStyle(host)
  const value = (name: string) => parseFloat(style.getPropertyValue(name))
  const x = value('--arr-source-final-x')
  const y = value('--arr-source-final-y')
  const width = value('--arr-source-final-w')
  const height = value('--arr-source-final-h')
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  if (!(width > 0) || !(height > 0)) return null
  return { x, y, width, height }
}

export function useMatterMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element) return

    const query = window.matchMedia(MATTER_QUERY)
    let disposed = false
    /**
     * Bumped whenever the activation is invalidated — a preference flip, a
     * resize across the breakpoint, or an unmount. An import that resolves
     * after that must not attach anything to a node the layout has left behind.
     */
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
        // A failed import leaves the native flow exactly as it was.
        console.error('Matter motion: dependencies failed to load', error)
        return
      }
      if (disposed || mine !== token || root.current !== element) return

      gsap.registerPlugin(ScrollTrigger)
      const stop = startMatterMotion({ gsap, ScrollTrigger, element })
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
      // Leaving the motion layout invalidates any import still in flight.
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

function startMatterMotion({
  gsap,
  ScrollTrigger,
  element,
}: {
  gsap: Gsap
  ScrollTrigger: ScrollTriggerStatic
  element: HTMLElement
}): () => void {
  const stage = element.querySelector<HTMLElement>('[data-matter-stage]')
  const ground = element.querySelector<HTMLElement>('[data-matter-ground]')
  const proxy = element.querySelector<HTMLElement>('[data-matter-proxy]')
  const proxyInk = element.querySelector<HTMLElement>('[data-matter-proxy-ink]')
  const far = element.querySelector<HTMLElement>('[data-contour="far"]')
  const middle = element.querySelector<HTMLElement>('[data-contour="middle"]')
  const near = element.querySelector<HTMLElement>('[data-contour="near"]')
  const signalWord = element.querySelector<HTMLElement>(
    '[data-matter-word="signal"]',
  )
  const humanWord = element.querySelector<HTMLElement>(
    '[data-matter-word="human"]',
  )
  const title = element.querySelector<HTMLElement>('[data-matter-title]')
  const runway = element.querySelector<HTMLElement>('[data-matter-runway]')
  const reading = element.querySelector<HTMLElement>('[data-matter-reading]')
  const about = element.querySelector<HTMLElement>('[data-matter-about]')

  // A missing node is a markup change, not a condition to paper over. There is
  // no `!` assertion anywhere in this file: aborting leaves the native flow,
  // which is the correct rendering of "the decoration did not set up".
  if (
    !stage ||
    !ground ||
    !proxy ||
    !proxyInk ||
    !far ||
    !middle ||
    !near ||
    !signalWord ||
    !humanWord ||
    !title ||
    !runway ||
    !reading ||
    !about
  ) {
    console.error(
      'Matter motion: a required node is missing; leaving the native flow',
    )
    return () => {}
  }

  const extras = createMatterExtras(stage, gsap)

  /**
   * The outgoing hero content, faded across the departure. It is the hero's
   * track area rather than its stage: the stage holds the navigation and the
   * transport, and nothing focusable may sit inside an element this hook
   * fades. It may be absent — the bridge is still a bridge without a hero
   * above it — so its writer degrades to a no-op.
   */
  const device = document.querySelector<HTMLElement>('[data-matter-device]')

  // Snapshot before anything is written, restore on the way out. The device is
  // deliberately not in this list: it belongs to the hero, and only the one
  // property this hook touches is restored for it. The stage is not either —
  // the one thing written to it is `opacity`, which the teardown removes
  // outright rather than restoring, because the stylesheet declares no opacity
  // for it and an un-owned stage is `display: none` besides.
  const owned = [
    ground,
    proxyInk,
    proxy,
    far,
    middle,
    near,
    signalWord,
    humanWord,
    title,
  ]
  const snapshots = owned.map(
    (node) => [node, node.getAttribute('style')] as const,
  )
  const deviceOpacity = device?.style.opacity ?? ''

  const geometry: MatterGeometry = {
    viewportWidth: 1,
    viewportHeight: 1,
    sourceX: 0,
    sourceY: 0,
    sourceWidth: 1,
    sourceHeight: 1,
  }

  /** Resolved once and then kept, so the lookup is not repeated per refresh. */
  let sourceEl: HTMLElement | null = null

  const setter = (node: HTMLElement, property: string, unit?: string) =>
    gsap.quickSetter(node, property, unit) as (value: number) => void

  const write: Record<MatterWriterKey, (value: number) => void> = {
    deviceOpacity: device ? setter(device, 'opacity') : () => {},
    farY: setter(far, 'y', 'px'),
    middleY: setter(middle, 'y', 'px'),
    nearY: setter(near, 'y', 'px'),
    signalY: setter(signalWord, 'y', 'px'),
    titleY: setter(title, 'y', 'px'),
  }

  /**
   * The outgoing device's presence, written in three places from one number.
   *
   * `deviceOpacity` is the hardware itself — the hero's track area. The hold is
   * what makes it a real target: it keeps the hero pinned, so the machine is
   * genuinely on screen while the takeover runs, and the reader is looking at
   * it when this bridge's clock starts. The departure begins only once the
   * takeover is whole, and by then this stage is opaque and the machine is
   * behind it — so the hardware's own fade is a correctness measure rather than
   * something the reader watches. What the reader watches is the other two: the
   * ground the machine stood on, and the ink of the signal it was carrying. All
   * three are one fact — how much of the machine is still here — which is why
   * they take the same value rather than three curves kept in step by hand.
   */
  const setGroundOpacity = setter(ground, 'opacity')
  const setInkOpacity = setter(proxyInk, 'opacity')

  const renderFrame = (frame: MatterFrame) => {
    /**
     * The proxy's translate and scale are **one** transform, written as one
     * string, and deliberately not through `quickSetter`.
     *
     * `gsap.quickSetter(target, 'scale')` is not safe here: GSAP routes the
     * `scale` shorthand through a `scaleX,scaleY` style write, and a comma is
     * not legal in a CSS property name — it throws `InvalidCharacterError`
     * rather than scaling anything. A handoff whose only scale silently throws
     * is a handoff that never runs. Writing the transform directly is also one
     * style mutation per frame instead of three.
     */
    proxy.style.transform = `translate3d(${frame.sourceX}px, ${frame.sourceY}px, 0) scale(${frame.sourceScale})`
    proxy.style.opacity = String(frame.sourceOpacity)

    /**
     * The stage's own presence over the machine, spent entirely across the hold.
     *
     * The section is pulled up over the hero's last viewport, so before this
     * bridge's clock starts the stage would be sitting inside a frame the hero
     * still owns. The hero is pinned there — on its camera's final frame — for
     * exactly as long as this takes, which is the whole reason the hold exists:
     * the machine cannot move while it is being covered. So what the reader
     * sees is one frame resolving rather than two frames swapping. The
     * machine's chrome dissolves into the ground it stood on, and the source
     * band stays exactly where it was, because the proxy is already drawn over
     * it at the measured bounds and is the same brightness it is covering.
     */
    stage.style.opacity = String(frame.stageOpacity)

    setGroundOpacity(frame.deviceOpacity)
    setInkOpacity(frame.deviceOpacity)

    for (const key of Object.keys(write) as MatterWriterKey[]) {
      write[key](frame[key])
    }
  }

  /**
   * Measured once per refresh, never per frame.
   *
   * The transforms are cleared first because `getBoundingClientRect` includes
   * them — measuring a translated box and then re-applying the translation
   * compounds it a little on every resize. `renderFrame` puts the current
   * progress back immediately afterwards, so nothing is ever painted between
   * the two.
   */
  const measure = () => {
    gsap.set(owned, { x: 0, y: 0, scale: 1 })

    const viewportWidth = Math.max(1, stage.clientWidth)
    const viewportHeight = Math.max(1, stage.clientHeight)

    /**
     * The runway is the reading panel's own measured height, floored at one
     * viewport — and then held to the one rule that decides whether the
     * typography beats are watchable at all.
     *
     * The floor is what keeps the panel off the screen during the opening beat:
     * with the runway at least a viewport, the panel's top edge cannot be on
     * screen at `p=0`, over a machine the hero is still holding.
     *
     * The rule is what the floor alone was never enough for. The panel is
     * opaque and above the stage, so the moment its top edge climbs into the
     * band the words live in it starts covering them — and the floor let it do
     * that at `p≈.33`, which is squarely inside SIGNAL's own beat. `matterRunway`
     * solves for the runway that keeps the band clear until SIGNAL starts
     * leaving, and the word band is measured here rather than assumed because it
     * moves with the type scale.
     *
     * Both inputs are read from the DOM, so this is a statement about the
     * rendered page rather than about the design's intent for it.
     */
    const readingHeight = Math.max(1, reading.offsetHeight)
    const aboutHeight = Math.max(1, about.offsetHeight)
    // The words are centred in the stage, so the band is measured against the
    // stage's own top edge. Both rects move together with the scroll, so the
    // difference is scroll-invariant.
    const typeBandBottom = Math.max(
      0,
      signalWord.getBoundingClientRect().bottom -
        stage.getBoundingClientRect().top,
    )
    const runwayPx = matterRunway({
      viewportHeight,
      readingHeight,
      aboutHeight,
      typeBandBottom,
    })
    element.style.setProperty('--matter-runway', `${runwayPx}px`)

    /**
     * The hold: how much scroll the hero has to keep its stage pinned for.
     *
     * This is the one number the two sections have to agree on, and neither can
     * derive it alone. The hero knows how long its stage can stay stuck — its
     * own section's height — but not how long the handoff needs; the bridge
     * knows how long its takeover takes, in its own local progress, but not how
     * many pixels of scroll that is. So the bridge converts it and publishes
     * it, and the hero's stylesheet grows the section by it.
     *
     * It is written to the document element because the two are siblings: a
     * custom property set on this section cannot be read by a section above it.
     *
     * `offsetHeight` is read *after* `--matter-runway` is written, because the
     * runway is part of this section's height and the hold is a fraction of the
     * travel that height produces. Measuring first would size the hold from
     * last layout's section.
     */
    const travel = Math.max(0, element.offsetHeight - viewportHeight)
    const holdPx = Math.round(MATTER_HOLD * travel)
    document.documentElement.style.setProperty('--arr-hold', `${holdPx}px`)

    if (!sourceEl) {
      sourceEl = document.querySelector<HTMLElement>('[data-matter-source]')
    }

    /**
     * Where the source region is **when the handoff begins**, not where it
     * rests.
     *
     * The hero publishes the clip's rectangle at the fitted zoom — the frame
     * its camera finishes on — and that is the frame this bridge has to
     * continue. Measuring the element directly gives its *resting* rectangle,
     * which the camera has already zoomed away from by the time p=0 arrives;
     * continuing from there is what made the seam read as a cut, because the
     * machine's bright band and the proxy's small rectangle were never the same
     * object in the same place.
     *
     * The resting measurement stays as the fallback, so a page with no hero —
     * or one whose hook has not measured yet — still gets a sane rectangle
     * rather than a zero one. That path is only ever visible at p=0, and the
     * stage is hidden at p=0, so a first-frame fallback cannot be seen.
     */
    const published = readPublishedSource(device)
    let sourceX: number
    let sourceY: number
    let sourceWidth: number
    let sourceHeight: number

    if (published) {
      sourceX = published.x
      sourceY = published.y
      sourceWidth = published.width
      sourceHeight = published.height
    } else {
      sourceWidth = viewportWidth * 0.46
      sourceHeight = viewportHeight * 0.075
      sourceX = viewportWidth / 2 - sourceWidth / 2
      sourceY = viewportHeight / 2 - sourceHeight / 2
      if (sourceEl) {
        const rect = sourceEl.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          sourceWidth = rect.width
          sourceHeight = rect.height
          const host = sourceEl.closest('section')
          const hostRect = host?.getBoundingClientRect()
          if (hostRect && hostRect.width > 0) {
            const fraction = Math.min(
              1,
              Math.max(
                0,
                (rect.left + rect.width / 2 - hostRect.left) / hostRect.width,
              ),
            )
            sourceX = fraction * viewportWidth - sourceWidth / 2
          }
        }
      }
    }

    proxy.style.width = `${sourceWidth}px`
    proxy.style.height = `${sourceHeight}px`
    proxy.style.left = `${sourceX}px`
    proxy.style.top = `${sourceY}px`

    geometry.viewportWidth = viewportWidth
    geometry.viewportHeight = viewportHeight
    geometry.sourceX = sourceX
    geometry.sourceY = sourceY
    geometry.sourceWidth = sourceWidth
    geometry.sourceHeight = sourceHeight
  }

  // The stylesheet's sticky stage and the runway both key off this attribute,
  // so it is set before anything is measured — the stage has to be laid out at
  // its real size before its box can be read.
  element.dataset.motion = 'ready'

  let stopped = false
  let trigger: ReturnType<ScrollTriggerStatic['create']> | null = null

  const teardown = () => {
    stopped = true
    trigger?.kill()
    trigger = null
    for (const [node, style] of snapshots) {
      if (style === null) node.removeAttribute('style')
      else node.setAttribute('style', style)
    }
    if (device) device.style.opacity = deviceOpacity
    // Not a snapshot restore: the stylesheet declares no opacity for the stage,
    // so removing the inline value is the restoration — and with `data-motion`
    // gone the stage is `display: none` regardless.
    stage.style.removeProperty('opacity')
    extras.restore()
    element.style.removeProperty('--matter-runway')
    // The hero is not this hook's to keep. Leaving the hold behind would leave
    // a section below it with a stretch of scroll nothing animates in, which is
    // the exact defect the hold exists to remove.
    document.documentElement.style.removeProperty('--arr-hold')
    delete element.dataset.motion
  }

  try {
    measure()
    extras.measure()

    trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      // Layout belongs in `onRefreshInit` — ScrollTrigger recalculates the
      // trigger's range after it — and rendering belongs in `onRefresh`.
      onRefreshInit: () => {
        extras.reset()
        measure()
      },
      onRefresh: (self) => {
        extras.measure()
        renderFrame(matterFrame(self.progress, geometry))
        extras.render(self.progress)
      },
      onUpdate: (self) => {
        renderFrame(matterFrame(self.progress, geometry))
        extras.render(self.progress)
      },
    })

    renderFrame(matterFrame(trigger.progress, geometry))
    extras.render(trigger.progress)

    // Text measured before the display face has loaded is the wrong height, and
    // the wrong height is a runway that puts the title in the wrong place. One
    // coalesced refresh, once, and never on a scroll tick.
    const fonts = document.fonts
    if (fonts) {
      void fonts.ready.then(() => {
        if (stopped) return
        ScrollTrigger.refresh()
      })
    }
  } catch (error) {
    // A partial setup goes out through the same cleanup path as a clean one.
    teardown()
    console.error('Matter motion: setup failed; leaving the native flow', error)
  }

  return teardown
}
