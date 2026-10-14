'use client'

import { useEffect, type RefObject } from 'react'
import {
  ARRANGEMENT_PHASES,
  arrangementFrame,
  type ArrangementGeometry,
} from './arrangement-camera'
import {
  ARRANGEMENT_BARS,
  ARRANGEMENT_CLIPS,
  RULER_LABELS,
} from './arrangement-data'
import { STAGE_CAPTIONS, stageAt } from '../patch/hero-story'

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
 * ## One scroll, one clock
 *
 * The section is exactly as long as the camera needs — one viewport of sticky
 * stage plus `ARRANGEMENT_SCROLL_SVH`'s travel — and the trigger's own progress
 * *is* the camera's progress. There is no split any more.
 *
 * There used to be. The section carried a second instrument after the dive: a
 * read that translated the Patch's card rail by its measured overflow, fed by
 * `splitProgress` from the same scroll position. That whole clock went with the
 * seam, and with it went the reason the camera's domain was compressed to 0.91
 * — the overshoot used to be spent during the panel's power-on act. The camera
 * now runs its own 0 → 1, which is the domain `arrangement-camera.ts` was
 * written and tested against, so the two halves of the hero agree again without
 * a translation layer between them.
 *
 * ## What is left to write
 *
 * Nine numbers on the track area and three on the ruler, plus four text writes
 * across the whole scroll. Everything else on the instrument is derived from
 * those in CSS, including the story line, the transport's bar readout and the
 * mixer's strip meters — which is why the cost does not grow with the number of
 * strips.
 *
 * GSAP and ScrollTrigger are imported dynamically and only after the runtime
 * check, so phones and reduced-motion visitors never pay for the download.
 */
export function useArrangementHero({
  sectionRef,
  trackRef,
  cameraRef,
}: {
  sectionRef: RefObject<HTMLElement | null>
  trackRef: RefObject<HTMLDivElement | null>
  cameraRef: RefObject<HTMLDivElement | null>
}) {
  useEffect(() => {
    if (
      window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)')
        .matches
    )
      return

    let cancelled = false
    let cleanup: (() => void) | undefined

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return

      const section = sectionRef.current
      const host = trackRef.current
      const camera = cameraRef.current
      if (!section || !host || !camera) return

      gsap.registerPlugin(ScrollTrigger)

      const profile = ARRANGEMENT_CLIPS.find((clip) => clip.kind === 'profile')
      const profileCentre = profile ? (profile.start + profile.end) / 2 : 0.625

      let geo: ArrangementGeometry | null = null

      /**
       * The last phase this hook *applied*, not the one in the DOM.
       *
       * The section ships with `data-phase="open"` already on it, so comparing
       * against the attribute would make the very first `render(0)` a no-op.
       * Starting from `null` guarantees the first frame applies.
       */
      let appliedPhase: string | null = null
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
       * Measured once per refresh, never per frame. Every anchor the frame needs
       * arrives here, which is what lets `arrangementFrame` stay pure and be
       * tested against a written-out fixture with no browser.
       */
      const measure = () => {
        const gutter = camera.offsetLeft
        const laneEl = host.querySelector<HTMLElement>('[data-lane="profile"]')
        const profileLaneTop = laneEl?.offsetTop ?? 0
        const laneHeight = laneEl?.offsetHeight ?? 58

        // The stage is the track area's offsetParent (it is `position: sticky`),
        // which makes both offsets readable without a second ref.
        const stage = section.querySelector<HTMLElement>('[data-arr-stage]')
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

        geo = {
          worldWidth: camera.offsetWidth,
          worldHeight: camera.offsetHeight,
          gutter,
          profileStart: (profile?.start ?? 0.5) * camera.offsetWidth,
          profileEnd: (profile?.end ?? 0.75) * camera.offsetWidth,
          profileLaneTop,
          laneHeight,
          // Zero, not measured. The camera's band *is* the track area, and its
          // window starts at the track area's top edge — which is also where the
          // ruler ends.
          rulerHeight: 0,
          viewportWidth: host.clientWidth,
          viewportHeight: host.clientHeight,
          chromeHeight: 0,
          proofHeight,
          // Nothing travels inside the hero any more. The read that used this
          // measured the Patch's card rail overflow, and it left with the seam.
          readOverflow: 0,
        }

        /**
         * The handoff's opening frame: the source region as the camera finally
         * frames it.
         *
         * `arrangementFrame` at `rail` is the first progress at which the zoom
         * is complete and the reveal window is still closed, so its `seamInset`
         * is the clip's own rectangle at the fitted scale — the one frame the
         * bridge has to continue. It is published rather than recomputed there
         * because the camera's maths belongs to the camera; a second copy of it
         * in `use-matter-motion.ts` is a copy that would drift.
         *
         * `seamInset` is the *seam's* rectangle, measured from the stage's
         * edges, so it carries the chrome above the track area and the proof
         * strip below it. The clip's own rect is that rectangle with both
         * corrections taken back out — the same corrections `arrangementFrame`
         * added, so this cannot drift from it.
         *
         * `top` is then offset by the track area's offset within the stage,
         * because `seamInset` is measured from the track area and the bridge's
         * proxy is positioned in its own stage. The two stages are both one
         * viewport tall and full width, so no horizontal correction is needed.
         */
        const {
          top: sTop,
          right: sRight,
          bottom: sBottom,
          left: sLeft,
        } = arrangementFrame(ARRANGEMENT_PHASES.rail, geo).seamInset
        const clipTop = sTop - geo.chromeHeight
        const clipBottom = sBottom - geo.proofHeight
        host.style.setProperty('--arr-source-final-x', `${sLeft}px`)
        host.style.setProperty(
          '--arr-source-final-y',
          `${stageTop + clipTop}px`,
        )
        host.style.setProperty(
          '--arr-source-final-w',
          `${geo.viewportWidth - sLeft - sRight}px`,
        )
        host.style.setProperty(
          '--arr-source-final-h',
          `${geo.viewportHeight - clipTop - clipBottom}px`,
        )
      }

      /** The camera's half of the scroll. */
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

        // On change only — these switch transitions.
        if (appliedPhase !== frame.phase) {
          appliedPhase = frame.phase
          section.dataset.phase = frame.phase
        }

        const detail = frame.scale > 1.4 ? 'true' : 'false'
        if (section.dataset.detail !== detail) section.dataset.detail = detail
      }

      measure()
      render(0)

      /**
       * The camera's own distance, in px — not the section's.
       *
       * `bottom bottom` used to *be* the camera's range, and that was correct
       * while the section was exactly one viewport of sticky stage plus the
       * camera's travel and nothing lengthened it. The handoff changed that:
       * its hook grows this section by `--arr-hold` so the stage stays pinned
       * through the bridge's opening beat, and an `end` measured from the
       * section's own bottom would have stretched the camera by the same
       * amount — retiming a dive that `arrangement-camera.ts` was written and
       * tested against. The camera now states its own travel, and the hold is
       * scroll it sits still through.
       *
       * Reading `--arr-hold` back off the element rather than assuming it is
       * what keeps this correct whichever hook happens to run first: before the
       * bridge has published it the subtraction is zero, and the answer is the
       * same either way. It is recomputed on refresh so a viewport change
       * cannot leave the two halves of the scroll disagreeing.
       */
      const cameraTravel = () => {
        const stageWrap = section.querySelector<HTMLElement>('[data-arr-stage]')
        const hold =
          parseFloat(
            getComputedStyle(section).getPropertyValue('--arr-hold'),
          ) || 0
        const stageHeight = stageWrap?.clientHeight ?? window.innerHeight
        return section.offsetHeight - stageHeight - hold
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${cameraTravel()}`,
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
          '--arr-source-final-x',
          '--arr-source-final-y',
          '--arr-source-final-w',
          '--arr-source-final-h',
        ].forEach((property) => host.style.removeProperty(property))
        ;['--arr-zoom', '--arr-camera-x', '--arr-rail-w'].forEach((property) =>
          rulerEl?.style.removeProperty(property),
        )
        proofEl?.style.removeProperty('--arr-play')
      }
    }

    void setup()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [sectionRef, trackRef, cameraRef])
}
