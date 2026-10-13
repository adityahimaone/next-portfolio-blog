'use client'

import { useEffect, type RefObject } from 'react'
import {
  arrangementFrame,
  type ArrangementGeometry,
} from './arrangement-camera'
import {
  ARRANGEMENT_BARS,
  ARRANGEMENT_CLIPS,
  RULER_LABELS,
} from './arrangement-data'
import { STAGE_CAPTIONS, stageAt } from '../patch/hero-story'
import {
  patchFrame,
  scrollBudget,
  splitProgress,
} from '../patch/patch-timeline'

/**
 * One ScrollTrigger, writing CSS custom properties and a handful of datasets.
 *
 * Three rules this encodes, all of them measured on the RIDDIM hero first:
 *
 * 1. **Write to the smallest node that reads the value.** The camera's
 *    properties go on `.trackArea`, not on the section: writing a custom
 *    property invalidates the whole subtree and the cost scales with its size
 *    (1613 ms against 166 ms), and the section also holds the chrome and the
 *    proof strips, which read none of them. The ruler is the one exception, and
 *    it is an exception with a reason: it is a sibling of the track area now, so
 *    it has to be written to directly — but it reads exactly two of the camera's
 *    numbers and it is a 44px node, which is as small as a node that reads them
 *    can be.
 * 2. **Datasets are written on change, never per frame.** `data-phase` and
 *    `data-detail` switch CSS transitions; recomputing them every tick would
 *    re-render nothing and cost everything. The same rule governs the caption,
 *    the transport readout and which Patch module is live.
 * 3. **Never trigger on the sticky stage.** A sticky element's bounding rect is
 *    a function of scroll position, so `top top` and `bottom bottom` both
 *    resolve to the same offset and leave a zero-length range. The trigger is
 *    the tall section that *contains* the stage.
 *
 * ## One scroll, two clocks
 *
 * The section's scroll is now two instruments in series. The first 295.2svh is
 * the camera's, and it ends where the window is fully open; the next 300svh is
 * the Patch's own read. `splitProgress` is what cuts them apart, and it hands
 * the camera progress **in the camera's own domain** — so `arrangement-camera.ts`
 * and its tests are untouched, and the camera never learns the read exists. The
 * one thing the split does add to the camera's clock is the overshoot: the
 * camera's own `IMMERSIVE_OVERSHOOT_FROM`/`_TO` sit past the seam-open mark, so
 * a camera clock that stopped at 0.82 would never play them. The split runs the
 * camera clock on to 0.91 across the panel's power-on act, which is where the
 * bump lands on a frame that is already whole.
 *
 * ## What the read writes
 *
 * Eight numbers on the seam, and that is the whole of the Patch's scroll
 * state — three act values and one sweep per module. Everything else on the
 * panel is derived from them in CSS, including each control's staggered sweep,
 * so the cost does not grow with the number of controls. They are skipped when
 * unchanged, and the only React state the read touches is which module is lit,
 * on change.
 *
 * GSAP and ScrollTrigger are imported dynamically and only after the runtime
 * check, so phones and reduced-motion visitors never pay for the download.
 */
export function useArrangementHero({
  sectionRef,
  trackRef,
  cameraRef,
  seamRef,
  setAboutIndex,
}: {
  sectionRef: RefObject<HTMLElement | null>
  trackRef: RefObject<HTMLDivElement | null>
  cameraRef: RefObject<HTMLDivElement | null>
  seamRef: RefObject<HTMLDivElement | null>
  setAboutIndex: React.Dispatch<React.SetStateAction<number>>
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
      /** The two pixel budgets for the current viewport, from the two svh constants. */
      let budget = scrollBudget(window.innerHeight)

      /**
       * The last phase this hook *applied*, not the one in the DOM.
       *
       * The section ships with `data-phase="open"` already on it, so comparing
       * against the attribute would make the very first `render(0)` a no-op and
       * `inert` would never be set — leaving the whole clipped Patch in the tab
       * order behind the arrangement. Starting from `null` guarantees the first
       * frame applies.
       */
      let appliedPhase: string | null = null
      /** Whether the seam is currently reachable — see the write in `render`. */
      let seamReachable: boolean | null = null
      /** The Patch module the read last published, and the one it has applied. */
      let aboutIndex = -1
      /** The toolbar's position readout, and the story line's stage. */
      const positionEl = section.querySelector<HTMLElement>(
        '[data-arr-position]',
      )
      /**
       * The caption's stage label — **not** `[data-arr-stage]`.
       *
       * `data-arr-stage` marks the stage *wrapper*: `measure()` reads its
       * height and `about-chapter.ts` uses it as the "am I inside the
       * arrangement" marker. A second element carrying the same attribute
       * would be shadowed by the wrapper — an ancestor wins document order in
       * `querySelector` — and the write in `render` would then replace the
       * entire hero with the name of one stage.
       */
      const stageEl = section.querySelector<HTMLElement>(
        '[data-arr-stage-label]',
      )
      const captionEl = section.querySelector<HTMLElement>('[data-arr-caption]')
      const rulerEl = section.querySelector<HTMLElement>('[data-arr-ruler]')
      const proofEl = section.querySelector<HTMLElement>('[data-arr-proof]')
      let appliedPosition = ''
      let appliedStage = -1
      /** The playhead's world position, as last written to the two nodes that read it. */
      let appliedPlay = ''

      /**
       * Last string written to each Patch property, so an unchanged frame writes
       * nothing. All of these go to the seam, which is the smallest node that
       * reads them.
       */
      const written = new Map<string, string>()
      const put = (name: string, value: number) => {
        const text = value.toFixed(4)
        if (written.get(name) === text) return
        written.set(name, text)
        seam.style.setProperty(name, text)
      }

      /**
       * Measured once per refresh, never per frame. Every anchor the frame needs
       * arrives here, which is what lets `arrangementFrame` stay pure and be
       * tested against a written-out fixture with no browser.
       */
      const measure = () => {
        budget = scrollBudget(window.innerHeight)

        const gutter = camera.offsetLeft
        const laneEl = host.querySelector<HTMLElement>('[data-lane="profile"]')
        const profileLaneTop = laneEl?.offsetTop ?? 0
        const laneHeight = laneEl?.offsetHeight ?? 58

        // The stage is the track area's offsetParent (it is `position: sticky`),
        // which makes both offsets readable without a second ref.
        const stage = section.querySelector<HTMLElement>('[data-arr-stage]')
        // The track area's top edge is the chrome *and* the ruler: the ruler is
        // a child of the stage now, above the track area and above the seam. So
        // this is the seam's own top edge as well, and it is why `chromeHeight`
        // and `rulerHeight` are both passed to the frame as zero — the camera's
        // window and the seam's window start at the same line, and the frame's
        // two corrections have nothing left to correct.
        const stageTop = host.offsetTop
        const proofHeight = stage
          ? stage.clientHeight - stageTop - host.offsetHeight
          : 0

        // The measured gutter is written back so the ruler's live rule and the
        // frame's maths cannot disagree about where the world starts. The ruler
        // reads it too, and it is outside the track area.
        host.style.setProperty('--arr-rail-w', `${gutter}px`)
        host.style.setProperty('--arr-profile-centre', String(profileCentre))
        rulerEl?.style.setProperty('--arr-rail-w', `${gutter}px`)

        // Where `#about` resolves to: the scroll offset at which the window is
        // fully open and the read begins. Not the end of the camera's range —
        // that is where the window *finishes* opening, so an anchor there lands
        // with the panel still a clipped strip. Derived from the same two
        // constants the frame is, so it cannot drift when they are retimed.
        section.style.setProperty('--arr-about-at', `${budget.heroPx}px`)

        geo = {
          worldWidth: camera.offsetWidth,
          worldHeight: camera.offsetHeight,
          gutter,
          profileStart: (profile?.start ?? 0.5) * camera.offsetWidth,
          profileEnd: (profile?.end ?? 0.75) * camera.offsetWidth,
          profileLaneTop,
          laneHeight,
          // Zero, not measured. The camera's band *is* the track area now that
          // the ruler is not in it, and its window starts at the track area's
          // top edge — which is also the seam's top edge.
          rulerHeight: 0,
          viewportWidth: host.clientWidth,
          viewportHeight: host.clientHeight,
          chromeHeight: 0,
          proofHeight,
          // The read no longer travels a column: the Patch's modules are all in
          // the panel at once and the read sweeps them rather than scrolling
          // them. So there is nothing to measure and nothing to close.
          readOverflow: 0,
        }
      }

      /** The camera's half of the scroll. Unchanged from before the Patch. */
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
        // The ruler is the second node that reads the camera, and it reads only
        // these two: its ticks are positioned from the zoom and the camera's own
        // translate, so it cannot drift from the clips beneath it while the dive
        // is running. Everything else it needs is inherited or static.
        rulerEl?.style.setProperty('--arr-zoom', String(frame.scale))
        rulerEl?.style.setProperty('--arr-camera-x', `${frame.cameraX}px`)
        // The depth layer. Both are read by the lanes and by nothing else, so
        // they go on the same host the camera's own numbers do — the smallest
        // node that reads them. `--arr-depth` is a px translateZ, and
        // `--arr-profile-focus` is unitless because the stylesheet uses it as a
        // multiplier on a brightness lift rather than as a length.
        host.style.setProperty('--arr-depth', `${frame.depth}px`)
        host.style.setProperty(
          '--arr-profile-focus',
          frame.profileFocus.toFixed(3),
        )
        // The supporting lanes' contrast. Per tick, not per phase: this is the
        // signal that carries the eye off the supporting tracks, so it has to
        // follow the scroll rather than a boundary. The stylesheet gives it a
        // 120ms linear transition, which is short enough to track a scrub and
        // long enough to hide a dropped frame.
        host.style.setProperty(
          '--arr-lane-opacity',
          frame.laneOpacity.toFixed(3),
        )

        // The seam's own properties go on the **seam**, not on `.trackArea`.
        // The seam is a sibling of the track area — it has to be, or it could
        // never paint over the chrome and the proof — so custom properties set
        // on the track area do not reach it. Writing them there left every inset
        // at its `0` fallback and `--arr-seam-opacity` at `0`: a panel that was
        // fully open and completely invisible. The seam is also the smallest
        // node that reads any of them.
        seam.style.setProperty('--arr-seam-opacity', String(frame.seamOpacity))
        seam.style.setProperty('--arr-seam-top', `${frame.seamInset.top}px`)
        seam.style.setProperty('--arr-seam-right', `${frame.seamInset.right}px`)
        seam.style.setProperty(
          '--arr-seam-bottom',
          `${frame.seamInset.bottom}px`,
        )
        seam.style.setProperty('--arr-seam-left', `${frame.seamInset.left}px`)

        // ── The story line, the transport and the strip meters ──
        //
        // All three read the same quantity: where the playhead is in the world.
        // `world` is the playhead's fraction of the profile centre, which is
        // where the camera parks it, so it runs 0 → 0.67 across the walk and
        // then holds. It is written on both nodes that read it — the track area
        // for the notes, the proof strip for the mixer — because they are
        // siblings and neither can inherit from the other.
        const world = frame.playheadFraction * profileCentre
        const play = world.toFixed(4)
        if (play !== appliedPlay) {
          appliedPlay = play
          host.style.setProperty('--arr-play', play)
          proofEl?.style.setProperty('--arr-play', play)
        }

        // On change only. Two text writes three times across the whole scroll.
        const stage = stageAt(world)
        if (stage !== appliedStage) {
          appliedStage = stage
          if (stageEl) stageEl.textContent = RULER_LABELS[stage]
          if (captionEl) {
            captionEl.textContent = STAGE_CAPTIONS[RULER_LABELS[stage]] ?? ''
          }
        }

        // The transport's position, in bars:beats along the world the playhead
        // is walking. On change only; a text write per frame would cost more
        // than the number is worth.
        if (positionEl) {
          const bars = world * ARRANGEMENT_BARS
          const bar = Math.floor(bars) + 1
          const beat = Math.floor((bars % 1) * 4) + 1
          const text = `${String(bar).padStart(3, '0')}:${String(beat).padStart(2, '0')}`
          if (text !== appliedPosition) {
            appliedPosition = text
            positionEl.textContent = text
          }
        }

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

      /**
       * The Patch's half. Eight numbers, and one piece of React state that moves
       * on change only.
       *
       * There is no equivalent of the old `setAboutProgress` here, and that is
       * the point: the rail needed its scroll progress in React because it
       * translated a column, and the Patch's whole motion is derived from these
       * custom properties in CSS. The only thing React has to know is which
       * module is lit, because that is an accessibility state — `aria-pressed`,
       * `inert` — and not a position.
       */
      const renderPatch = (read: number) => {
        const f = patchFrame(read)
        put('--patch-power', f.power)
        put('--patch-bounce', f.bounce)
        put('--patch-cursor', f.cursor)
        f.sweep.forEach((s, i) => put(`--patch-sweep-${i}`, s))

        // A click on a module writes through to the same state and wins until
        // the reader scrolls on to the next module, at which point the read's
        // own answer changes and takes over again.
        if (f.active !== aboutIndex) {
          aboutIndex = f.active
          setAboutIndex(f.active)
        }
      }

      measure()

      // Put a `#about` visitor where the fragment asked them to be.
      //
      // The browser resolves the fragment while the document is still parsing,
      // which is before anything has measured. `.aboutAnchor`'s fallback is
      // therefore where it lands — and then `measure()` moves the anchor to its
      // real offset, which the browser does not follow. One shot, and only while
      // they are still where the fallback put them. By the time this runs nobody
      // has scrolled, so the guard is belt and braces; it exists because
      // `measure()` also runs on every refresh and this block must not.
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

      const at = (self: { progress: number }) =>
        self.progress * Math.max(0, section.offsetHeight - window.innerHeight)

      render(0)
      renderPatch(0)

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure()
          const { camera: cameraP, read } = splitProgress(
            at(self),
            budget.heroPx,
            budget.readPx,
          )
          render(cameraP)
          renderPatch(read)
        },
        onUpdate: (self) => {
          const { camera: cameraP, read } = splitProgress(
            at(self),
            budget.heroPx,
            budget.readPx,
          )
          render(cameraP)
          renderPatch(read)
        },
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
        // by keyboard. A panel left at `--patch-sweep-1: 0.3` would mount
        // half-built for the same reason.
        seam.inert = false
        seam.removeAttribute('aria-hidden')
        ;[
          '--arr-seam-opacity',
          '--arr-seam-top',
          '--arr-seam-right',
          '--arr-seam-bottom',
          '--arr-seam-left',
          '--patch-power',
          '--patch-bounce',
          '--patch-cursor',
          '--patch-sweep-0',
          '--patch-sweep-1',
          '--patch-sweep-2',
        ].forEach((property) => seam.style.removeProperty(property))
        written.clear()
        ;[
          '--arr-zoom',
          '--arr-camera-x',
          '--arr-camera-y',
          '--arr-playhead',
          '--arr-rail',
          '--arr-clip-interior',
          '--arr-depth',
          '--arr-profile-focus',
          '--arr-lane-opacity',
          '--arr-rail-w',
          '--arr-profile-centre',
          '--arr-play',
        ].forEach((property) => host.style.removeProperty(property))
        ;['--arr-zoom', '--arr-camera-x', '--arr-rail-w'].forEach((property) =>
          rulerEl?.style.removeProperty(property),
        )
        proofEl?.style.removeProperty('--arr-play')
        section.style.removeProperty('--arr-about-at')
      }
    }

    void setup()

    return () => {
      cancelled = true
      cleanup?.()
    }
    // The setter is declared rather than omitted. It is a `useState` dispatcher
    // from `rack-01.tsx`, passed down unwrapped, so React holds its identity for
    // the life of the component and listing it cannot re-run this effect — which
    // is the point: the alternative is an `exhaustive-deps` suppression that
    // hides a genuinely missing dependency the day someone passes a callback
    // instead.
  }, [sectionRef, trackRef, cameraRef, seamRef, setAboutIndex])
}
