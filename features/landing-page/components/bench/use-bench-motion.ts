'use client'

import { useEffect, type RefObject } from 'react'

import { BENCH_CHIPS } from './bench-copy'
import {
  BENCH_BAND_CLEARANCE,
  BENCH_HOLD,
  benchFrame,
  benchRunway,
  type BenchFrame,
  type BenchGeometry,
  type BenchRunwayBand,
} from './bench-frame'

/**
 * The one media query the section gates on, written out here and in
 * `bench.module.css`.
 *
 * It is duplicated on purpose. CSS cannot ask whether the motion setup
 * succeeded, and JS cannot style a sticky stage; so the query is the contract
 * between them. Both sides read the same three conditions — wide enough, tall
 * enough, motion allowed — and a viewport that fails any one of them gets the
 * editorial About in normal flow from both.
 */
const BENCH_QUERY =
  '(min-width: 769px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)'

type Gsap = (typeof import('gsap'))['gsap']
type ScrollTriggerStatic =
  (typeof import('gsap/ScrollTrigger'))['ScrollTrigger']

/**
 * The section's motion, scoped to one element and one trigger.
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
 * **Every transform is written as one composed string, never through a
 * shorthand.** `gsap.quickSetter(target, 'scale')` is not safe here: GSAP routes
 * the `scale` shorthand through a `scaleX,scaleY` style write, and a comma is
 * not legal in a CSS property name — it throws `InvalidCharacterError` rather
 * than scaling anything. The ring's contraction and every chip's transform go
 * through `style.transform` for that reason, and it is also one style mutation
 * per frame instead of three.
 *
 * **Every owned inline style is snapshotted and restored.** Direct style writes
 * are not captured by GSAP's context, so a resize across the breakpoint would
 * otherwise strand a half-scattered ring behind a layout that no longer runs
 * any motion.
 */
export function useBenchMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element) return

    const query = window.matchMedia(BENCH_QUERY)
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
        console.error('Bench motion: dependencies failed to load', error)
        return
      }
      if (disposed || mine !== token || root.current !== element) return

      gsap.registerPlugin(ScrollTrigger)
      const stop = startBenchMotion({ gsap, ScrollTrigger, element })
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

function startBenchMotion({
  gsap,
  ScrollTrigger,
  element,
}: {
  gsap: Gsap
  ScrollTrigger: ScrollTriggerStatic
  element: HTMLElement
}): () => void {
  const stage = element.querySelector<HTMLElement>('[data-bench-stage]')
  const paper = element.querySelector<HTMLElement>('[data-bench-paper]')
  const principle = element.querySelector<HTMLElement>('[data-bench-principle]')
  const artifact = element.querySelector<HTMLElement>('[data-bench-artifact]')
  const artifactFrame = element.querySelector<HTMLElement>(
    '[data-bench-artifact-frame]',
  )
  const scaffold = element.querySelector<HTMLElement>('[data-bench-scaffold]')
  const ring = element.querySelector<HTMLElement>('[data-bench-ring]')
  const caption = element.querySelector<HTMLElement>('[data-bench-caption]')
  const runway = element.querySelector<HTMLElement>('[data-bench-runway]')
  const reading = element.querySelector<HTMLElement>('[data-bench-about] > *')
  const about = element.querySelector<HTMLElement>('[data-bench-about]')

  // A missing node is a markup change, not a condition to paper over. There is
  // no `!` assertion anywhere in this file: aborting leaves the native flow,
  // which is the correct rendering of "the decoration did not set up".
  if (
    !stage ||
    !paper ||
    !principle ||
    !artifact ||
    !artifactFrame ||
    !scaffold ||
    !ring ||
    !caption ||
    !runway ||
    !reading ||
    !about
  ) {
    console.error(
      'Bench motion: a required node is missing; leaving the native flow',
    )
    return () => {}
  }

  /**
   * The chips, resolved **in `BENCH_CHIPS` order** rather than in document
   * order.
   *
   * `benchFrame` returns one frame per entry of that array, so the only thing
   * that makes the pairing correct is that the two are indexed the same way.
   * Reading the nodes out of the DOM would make the mapping depend on the
   * order the markup happens to be written in, and a reordering of the JSX
   * would silently animate every chip to another chip's slot.
   */
  const chipNodes: HTMLElement[] = []
  for (const chip of BENCH_CHIPS) {
    const node = element.querySelector<HTMLElement>(
      `[data-bench-chip="${chip.id}"]`,
    )
    if (!node) {
      console.error(
        `Bench motion: chip "${chip.id}" is missing; leaving the native flow`,
      )
      return () => {}
    }
    chipNodes.push(node)
  }

  // Snapshot before anything is written, restore on the way out. The stage is
  // deliberately not in this list: the one thing written to it is `opacity`,
  // which the teardown removes outright rather than restoring, because the
  // stylesheet declares no opacity for it and an un-owned stage is
  // `display: none` besides.
  //
  // The artifact is in the list but its *drawing* is a separate node, and that
  // split is not cosmetic. The caption is a sibling of the drawing inside the
  // artifact, and opacity multiplies down the tree — so if the artifact itself
  // carried `artifactOpacity`, the caption could never be more visible than the
  // drawing it labels, and the frame's two independent curves would collapse
  // into the smaller of the two.
  const owned = [
    paper,
    principle,
    artifact,
    artifactFrame,
    scaffold,
    ring,
    caption,
    ...chipNodes,
  ]
  const snapshots = owned.map(
    (node) => [node, node.getAttribute('style')] as const,
  )

  const geometry: BenchGeometry = { stageWidth: 1280, stageHeight: 760 }

  const renderFrame = (frame: BenchFrame) => {
    stage.style.opacity = String(frame.stageOpacity)
    // The sheet's arrival, and the reason the seam is not a dissolve. The stage
    // is the opaque surface the machine is covered by, so giving it a direction
    // turns a two-frame blend into a leading edge sweeping upward — the strip of
    // machine left below it is the edge, and it closes to nothing at the
    // handoff. See `BENCH_SEAM_FADE`.
    //
    // Safe to write as a plain transform because GSAP never touches this node:
    // it is deliberately absent from `owned` (nothing else on the stage is
    // animated, and it is `display: none` whenever the motion is off).
    stage.style.transform = `translate3d(0, ${frame.stageY}px, 0)`

    // The far stratum and the principle's own entry are two translations on one
    // node, summed rather than nested: the principle is inside the sheet, and a
    // wrapper element would exist only to hold a number.
    paper.style.transform = `translate3d(0, ${frame.farY}px, 0)`
    principle.style.transform = `translate3d(0, ${frame.farY + frame.principleY}px, 0)`
    principle.style.opacity = String(frame.principleOpacity)

    // The middle stratum, plus the artifact's own lift and recede.
    //
    // The centring is **inside** this string rather than declared as the
    // standalone `translate` property in the stylesheet, and that is a
    // correctness fix rather than a style preference. GSAP folds the individual
    // `translate`/`rotate`/`scale` properties into its own transform model the
    // first time it touches a node, and after that the declaration no longer
    // reaches paint — so the artifact was measured sitting a half-width to the
    // right of the stage's centre on the real page. Writing the centring as the
    // first function of the transform this hook owns removes the dependency on
    // what a third-party library does with a property it did not write.
    artifact.style.transform = `translate3d(-50%, -50%, 0) translate3d(0, ${frame.middleY + frame.artifactY}px, 0) scale(${frame.artifactScale})`
    artifactFrame.style.opacity = String(frame.artifactOpacity)

    // The construction marks, spent as the wireframe draws over them. They are
    // a sibling of the drawing rather than a group inside it precisely so that
    // this number and `artifactOpacity` do not multiply: the drawing is
    // invisible on the first frame and the scaffold is whole on it.
    scaffold.style.opacity = String(frame.scaffoldOpacity)

    // The silkscreen line outlives the drawing it labels, so the last thing
    // legible on the sheet is what the thing was made of.
    caption.style.opacity = String(frame.captionOpacity)

    // The near stratum's shared contraction. A uniform scale about the stage's
    // own centre is the one transform the ring can take after it has landed
    // without any chip leaving its slot relative to its neighbours.
    ring.style.transform = `scale(${frame.ringScale})`

    for (let index = 0; index < chipNodes.length; index += 1) {
      const chip = frame.chips[index]
      const node = chipNodes[index]
      node.style.transform = `translate3d(${chip.x}px, ${chip.y}px, 0) rotate(${chip.rotate}deg) scale(${chip.scale})`
      node.style.opacity = String(chip.opacity)
    }

    // The draw-on clock. Every artifact stroke carries `pathLength="1"`, so one
    // normalised offset drives the frame, the dividers, the plot and the
    // registration brackets at once — and a long path and a short one finish
    // together rather than the long one lagging.
    artifact.style.setProperty('--bench-draw', String(frame.artifactDraw))

    if (element.dataset.benchState !== frame.state) {
      element.dataset.benchState = frame.state
    }
  }

  /**
   * Measured once per refresh, never per frame.
   *
   * The transforms are cleared first because `getBoundingClientRect` includes
   * them — measuring a drifted sheet and then re-applying the drift compounds
   * it a little on every resize. `renderFrame` puts the current progress back
   * immediately afterwards, so nothing is ever painted between the two.
   */
  const measure = () => {
    gsap.set(owned, { x: 0, y: 0, scale: 1 })
    // The stage's own arrival offset is cleared too, for the same reason and by
    // a different mechanism. It happens to cancel — both bands are measured
    // relative to the stage's own top edge, so a uniform translate drops out of
    // both differences — but the bands are only scroll-invariant while that is
    // true, and a measurement that depends on an invariant holding elsewhere is
    // a measurement that will be wrong the first time someone reads an absolute
    // box here. `renderFrame` puts the current offset straight back.
    stage.style.removeProperty('transform')

    const stageWidth = Math.max(1, stage.clientWidth)
    const stageHeight = Math.max(1, stage.clientHeight)

    /**
     * The runway is the reading panel's own measured height, floored at one
     * viewport — and then held to the one rule that decides whether the last
     * beat is watchable at all.
     *
     * The floor is what keeps the panel off the screen during the opening
     * tableau: with the runway at least a viewport, the panel's top edge cannot
     * be on screen at `p=0`, over a machine the hero is still holding.
     *
     * The rule is what the floor alone was never enough for. The panel is
     * opaque and above the stage, so the moment its top edge climbs into the
     * band the principle lives in it starts covering it — and the floor alone
     * let it do that long before the principle had arrived. `benchRunway` solves
     * for the runway that keeps the band clear until the principle has settled,
     * and the band is measured here rather than assumed because it moves with
     * the type scale.
     *
     * Both inputs are read from the DOM, so this is a statement about the
     * rendered page rather than about the design's intent for it.
     */
    const readingHeight = Math.max(1, reading.offsetHeight)
    const aboutHeight = Math.max(1, about.offsetHeight)

    // Both bands are measured against the stage's own top edge, and every rect
    // moves with the scroll, so the differences are scroll-invariant. The
    // transforms are cleared above, so these are resting boxes rather than the
    // boxes the artwork happens to be drifting through.
    const stageTop = stage.getBoundingClientRect().top
    // The artifact is centred on the stage, and its centring lives inside the
    // transform this hook writes — which `gsap.set` has just cleared. So its
    // resting top is the stage's own midpoint, and the box it will actually
    // occupy straddles that: the bottom edge that has to stay clear is half a
    // height below it.
    const artifactBandBottom = Math.max(
      0,
      artifact.getBoundingClientRect().top -
        stageTop +
        artifact.offsetHeight / 2,
    )
    const principleBandBottom = Math.max(
      0,
      principle.getBoundingClientRect().bottom - stageTop,
    )

    const bands: BenchRunwayBand[] = [
      { bottom: artifactBandBottom, clearUntil: BENCH_BAND_CLEARANCE.artifact },
      {
        bottom: principleBandBottom,
        clearUntil: BENCH_BAND_CLEARANCE.principle,
      },
    ]

    const runwayPx = benchRunway({
      viewportHeight: stageHeight,
      readingHeight,
      aboutHeight,
      bands,
    })
    element.style.setProperty('--bench-runway', `${runwayPx}px`)

    /**
     * The hold: how much scroll the hero has to keep its stage pinned for.
     *
     * This is the one number the two sections have to agree on, and neither can
     * derive it alone. The hero knows how long its stage can stay stuck — its
     * own section's height — but not how long the takeover needs; this section
     * knows how long its takeover takes, in its own local progress, but not how
     * many pixels of scroll that is. So this section converts it and publishes
     * it, and the hero's stylesheet grows the section by it.
     *
     * It is written to the document element because the two are siblings: a
     * custom property set on this section cannot be read by a section above it.
     *
     * `offsetHeight` is read *after* `--bench-runway` is written, because the
     * runway is part of this section's height and the hold is a fraction of the
     * travel that height produces. Measuring first would size the hold from
     * last layout's section.
     */
    const travel = Math.max(0, element.offsetHeight - stageHeight)
    const holdPx = Math.round(BENCH_HOLD * travel)
    document.documentElement.style.setProperty('--arr-hold', `${holdPx}px`)

    geometry.stageWidth = stageWidth
    geometry.stageHeight = stageHeight
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
    // Not a snapshot restore: the stylesheet declares no opacity or transform
    // for the stage, so removing the inline values is the restoration — and
    // with `data-motion` gone the stage is `display: none` regardless.
    stage.style.removeProperty('opacity')
    stage.style.removeProperty('transform')
    element.style.removeProperty('--bench-runway')
    // The hero is not this hook's to keep. Leaving the hold behind would leave
    // a section below it with a stretch of scroll nothing animates in, which is
    // the exact defect the hold exists to remove.
    document.documentElement.style.removeProperty('--arr-hold')
    delete element.dataset.motion
    delete element.dataset.benchState
  }

  try {
    measure()

    trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      // Layout belongs in `onRefreshInit` — ScrollTrigger recalculates the
      // trigger's range after it — and rendering belongs in `onRefresh`.
      onRefreshInit: () => {
        measure()
      },
      onRefresh: (self) => {
        renderFrame(benchFrame(self.progress, geometry))
      },
      onUpdate: (self) => {
        renderFrame(benchFrame(self.progress, geometry))
      },
    })

    renderFrame(benchFrame(trigger.progress, geometry))

    // Text measured before the display face has loaded is the wrong height, and
    // the wrong height is a runway that puts the principle in the wrong place.
    // One coalesced refresh, once, and never on a scroll tick.
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
    console.error('Bench motion: setup failed; leaving the native flow', error)
  }

  return teardown
}
