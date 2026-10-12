'use client'

import { useEffect, type RefObject } from 'react'
import {
  ARRANGEMENT_SEAM_OPEN,
  arrangementFrame,
  type ArrangementGeometry,
} from './arrangement-camera'
import { ARRANGEMENT_CLIPS } from './arrangement-data'

/**
 * One ScrollTrigger, writing CSS custom properties and two datasets.
 *
 * Three rules this encodes, all of them measured on the RIDDIM hero first:
 *
 * 1. **Write to the smallest node that reads the value.** The properties go on
 *    `.trackArea`, not on the section: writing a custom property invalidates the
 *    whole subtree and the cost scales with its size (1613 ms against 166 ms),
 *    and the section also holds the chrome and the proof strips, which read
 *    none of them.
 * 2. **Datasets are written on change, never per frame.** `data-phase` and
 *    `data-detail` switch CSS transitions; recomputing them every tick would
 *    re-render nothing and cost everything.
 * 3. **Never trigger on the sticky stage.** A sticky element's bounding rect is
 *    a function of scroll position, so `top top` and `bottom bottom` both
 *    resolve to the same offset and leave a zero-length range. The trigger is
 *    the tall section that *contains* the stage.
 *
 * GSAP and ScrollTrigger are imported dynamically and only after the runtime
 * check, so phones and reduced-motion visitors never pay for the download.
 */
export function useArrangementHero({
  sectionRef,
  trackRef,
  cameraRef,
  seamRef,
}: {
  sectionRef: RefObject<HTMLElement | null>
  trackRef: RefObject<HTMLDivElement | null>
  cameraRef: RefObject<HTMLDivElement | null>
  seamRef: RefObject<HTMLDivElement | null>
}) {
  useEffect(() => {
    if (
      window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)')
        .matches
    )
      return

    let cancelled = false
    let cleanup: (() => void) | undefined
    let correctedAboutAnchor = false

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return

      const section = sectionRef.current
      const host = trackRef.current
      const camera = cameraRef.current
      const seam = seamRef.current
      if (!section || !host || !camera || !seam) return

      gsap.registerPlugin(ScrollTrigger)

      const profile = ARRANGEMENT_CLIPS.find((clip) => clip.kind === 'profile')
      const profileCentre = profile ? (profile.start + profile.end) / 2 : 0.625

      let geo: ArrangementGeometry | null = null

      /**
       * The last phase this hook *applied*, not the one in the DOM.
       *
       * The section ships with `data-phase="open"` already on it, so comparing
       * against the attribute would make the very first `render(0)` a no-op and
       * `inert` would never be set — leaving the whole clipped About panel in
       * the tab order behind the arrangement. Starting from `null` guarantees
       * the first frame applies.
       */
      let appliedPhase: string | null = null
      /** Whether the seam is currently reachable — see the write in `render`. */
      let seamReachable: boolean | null = null

      /**
       * Measured once per refresh, never per frame. Every anchor the frame needs
       * arrives here, which is what lets `arrangementFrame` stay pure and be
       * tested against a written-out fixture with no browser.
       */
      const measure = () => {
        const gutter = camera.offsetLeft
        const ruler = host.querySelector<HTMLElement>('[data-arr-ruler]')
        const rulerHeight = ruler?.offsetHeight ?? 38
        const laneEl = host.querySelector<HTMLElement>('[data-lane="profile"]')
        const profileLaneTop = laneEl?.offsetTop ?? 0
        const laneHeight = laneEl?.offsetHeight ?? 58

        // The seam overlays the whole stage, so its window is measured from the
        // stage's edges. The stage is the track area's offsetParent (it is
        // `position: sticky`), which makes both offsets readable without a
        // second ref.
        const stage = section.querySelector<HTMLElement>('[data-arr-stage]')
        const chromeHeight = host.offsetTop
        const proofHeight = stage
          ? stage.clientHeight - chromeHeight - host.offsetHeight
          : 0

        // How much taller the card rail is than the window it is revealed in.
        // Measured, not derived: it is a function of the viewport — 0px at
        // 1728×1117, 103px at 1440×900 — and the read has to cover exactly this
        // or the last card stays clipped.
        //
        // Rail against deck, rather than rail against panel. The read moves the
        // heading and the rail and leaves the timeline alone, so what has to fit
        // is the column inside the deck — and the deck is the element whose
        // height the read is closing the gap to. Both are layout boxes: the
        // rail's top sits flush with the deck's top (the stack is the deck's
        // first grid item, the rail the stack's only child), and the deck's
        // bottom is the stage's content bottom, because the deck is the `flex: 1`
        // child of a `height: 100%` stage.
        //
        // `offsetHeight`, not a bounding rect. The stack carries the read's own
        // translate, and a rect would measure the moved element — the travel
        // would shrink by its own displacement every time this re-ran. Layout
        // heights are what the travel has to close, and transforms do not touch
        // them.
        const rail = seam.querySelector<HTMLElement>('[data-about-rail]')
        const deck = seam.querySelector<HTMLElement>('[data-about-read]')
        const readOverflow =
          rail && deck ? Math.max(0, rail.offsetHeight - deck.offsetHeight) : 0

        // The measured gutter is written back so the ruler's live rule and the
        // frame's maths cannot disagree about where the world starts.
        host.style.setProperty('--arr-rail-w', `${gutter}px`)
        host.style.setProperty('--arr-profile-centre', String(profileCentre))

        // Where `#about` resolves to: the scroll offset at which the window is
        // fully open and the read begins. Not `rail` — that is where the window
        // *starts* opening, so an anchor there lands on a closed strip. Derived
        // from the trigger's own range rather than written into the stylesheet,
        // so it cannot drift when the phases are retimed.
        const travel = section.offsetHeight - window.innerHeight
        section.style.setProperty(
          '--arr-about-at',
          `${ARRANGEMENT_SEAM_OPEN * Math.max(0, travel)}px`,
        )

        geo = {
          worldWidth: camera.offsetWidth,
          worldHeight: camera.offsetHeight,
          gutter,
          profileStart: (profile?.start ?? 0.5) * camera.offsetWidth,
          profileEnd: (profile?.end ?? 0.75) * camera.offsetWidth,
          profileLaneTop,
          laneHeight,
          rulerHeight,
          viewportWidth: host.clientWidth,
          viewportHeight: host.clientHeight,
          chromeHeight,
          proofHeight,
          readOverflow,
        }
      }

      const render = (progress: number) => {
        if (!geo) return
        const frame = arrangementFrame(progress, geo)

        // Written on `.trackArea` — the smallest node that reads them.
        host.style.setProperty('--arr-zoom', String(frame.scale))
        host.style.setProperty('--arr-camera-x', `${frame.cameraX}px`)
        host.style.setProperty('--arr-camera-y', `${frame.cameraY}px`)
        host.style.setProperty('--arr-playhead', `${frame.playheadX}px`)
        host.style.setProperty('--arr-rail', String(frame.railReveal))
        host.style.setProperty(
          '--arr-clip-interior',
          String(frame.clipInterior),
        )

        // The seam's own properties go on the **seam**, not on `.trackArea`.
        // The seam is a sibling of the track area — it has to be, or it could
        // never paint over the chrome and the proof — so custom properties set
        // on the track area do not reach it. Writing them there left every inset
        // at its `0` fallback and `--arr-seam-opacity` at `0`: a panel that was
        // fully open and completely invisible. The seam is also the smallest
        // node that reads any of them.
        seam.style.setProperty('--arr-seam-opacity', String(frame.seamOpacity))
        seam.style.setProperty('--arr-read-travel', `${-frame.readTravel}px`)
        seam.style.setProperty('--arr-seam-top', `${frame.seamInset.top}px`)
        seam.style.setProperty('--arr-seam-right', `${frame.seamInset.right}px`)
        seam.style.setProperty(
          '--arr-seam-bottom',
          `${frame.seamInset.bottom}px`,
        )
        seam.style.setProperty('--arr-seam-left', `${frame.seamInset.left}px`)

        // On change only — these switch transitions and, for the seam, whether
        // its controls are reachable at all.
        if (appliedPhase !== frame.phase) {
          appliedPhase = frame.phase
          section.dataset.phase = frame.phase
        }

        // Reachability is its own signal, not the phase. `rail` is where the
        // window *starts* opening, so clearing `inert` there would let a
        // keyboard user tab into a panel that is still a clipped strip. This
        // waits for the window to be fully open. Written on change only, like
        // the datasets — the comparison is cheap, the DOM write is not.
        const reachable = frame.railReveal >= 1
        if (reachable !== seamReachable) {
          seamReachable = reachable
          section.dataset.seam = reachable ? 'open' : 'closed'
          seam.inert = !reachable
          seam.setAttribute('aria-hidden', String(!reachable))
        }

        const detail = frame.scale > 1.4 ? 'true' : 'false'
        if (section.dataset.detail !== detail) section.dataset.detail = detail
      }

      measure()

      // Put a `#about` visitor where the fragment asked them to be.
      //
      // The browser resolves the fragment while the document is still parsing,
      // which is before anything has measured. `.aboutAnchor`'s fallback of
      // `100svh` is therefore where it lands — and then `measure()` moves the
      // anchor to its real offset of `ARRANGEMENT_SEAM_OPEN × 360svh` (295.2svh
      // at 1440×900), which the browser does not follow. Measured: the reader is
      // left at 900 of 3240, progress 0.28, with the window still closed and
      // the timeline dive not yet begun — the one place the skip link and the
      // shared URL disagree.
      //
      // One shot, and only while they are still where the fallback put them. By
      // the time this runs nobody has scrolled, so the guard is belt and
      // braces; it exists because `measure()` also runs on every refresh and
      // this block must not.
      if (location.hash === '#about' && !correctedAboutAnchor) {
        const anchor = document.getElementById('about')
        if (anchor) {
          correctedAboutAnchor = true
          const target = anchor.getBoundingClientRect().top + window.scrollY
          // `instant`: the root sets `scroll-behavior: smooth` for route
          // changes, and animating a correction to the page's own load position
          // reads as the scroll having gone somewhere else first.
          if (Math.abs(window.scrollY - target) > 4) {
            window.scrollTo({ top: target, behavior: 'instant' })
          }
        }
      }

      render(0)

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure()
          render(self.progress)
        },
        onUpdate: (self) => render(self.progress),
        // A window that opens at scroll 0 is already active on load, so
        // `onEnter` never fires and anything it sets is never applied for the
        // whole first pass. `onToggle` reports state after a refresh too.
        onToggle: (self) => {
          camera.style.willChange = self.isActive ? 'transform' : ''
        },
      })

      cleanup = () => {
        trigger.kill()
        camera.style.willChange = ''
        section.removeAttribute('data-phase')
        section.removeAttribute('data-detail')
        section.removeAttribute('data-seam')
        // Undo what this hook did to the seam. Without this a resize across the
        // 768px breakpoint tears the trigger down and leaves the panel `inert`
        // with nothing left running to clear it — reachable by scroll, unusable
        // by keyboard.
        seam.inert = false
        seam.removeAttribute('aria-hidden')
        ;[
          '--arr-seam-opacity',
          '--arr-read-travel',
          '--arr-seam-top',
          '--arr-seam-right',
          '--arr-seam-bottom',
          '--arr-seam-left',
        ].forEach((property) => seam.style.removeProperty(property))
        ;[
          '--arr-zoom',
          '--arr-camera-x',
          '--arr-camera-y',
          '--arr-playhead',
          '--arr-rail',
          '--arr-clip-interior',
          '--arr-rail-w',
          '--arr-profile-centre',
        ].forEach((property) => host.style.removeProperty(property))
        section.style.removeProperty('--arr-about-at')
      }
    }

    void setup()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [sectionRef, trackRef, cameraRef, seamRef])
}
