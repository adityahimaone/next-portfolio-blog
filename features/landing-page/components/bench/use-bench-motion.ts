'use client'

import { useEffect, type RefObject } from 'react'

import { BENCH_CHIPS } from './bench-copy'
import {
  chapterPose,
  setGlassPose,
  type GlassKind,
} from '../glass/glass-registry'
import { BENCH_DEVICES, benchDeviceFrames } from './bench-devices'
import {
  BENCH_BAND_CLEARANCE,
  BENCH_HOLD,
  BENCH_STAGE_BASE,
  benchFrame,
  benchRunway,
  type BenchFrame,
  type BenchGeometry,
  type BenchHeroPiece,
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

const BENCH_STAGE_WIDTH = BENCH_STAGE_BASE.width

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
 * any motion. The hero's stage is in that set even though it is not this
 * component's node — it is the node the seam moves, and a teardown that left it
 * shrunk would leave a whole section of the page unreadable.
 *
 * **The seam writes outside this section.** The handoff is not an arrival any
 * more; it is the outgoing machine being taken apart. So the section that owns
 * the clock is not the section that owns the things that move, and the hero's
 * own `data-arr-*` markers are the contract between them. They are looked up
 * once, never asserted, and restored by the same snapshot pass as everything
 * else.
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

  /**
   * The outgoing machine — the nodes this hook writes that are not inside this
   * section.
   *
   * They cannot be found on `element`, and that is the handoff's whole
   * geometry: the hero and the About are separate sibling sections, and this one
   * has been pulled up *under* the other. The stage marker is the hero's own
   * `data-arr-stage`; the pieces hang off it by the same `data-arr-*` prefix the
   * hero's own hook uses for its readouts.
   *
   * A missing node is deliberately not an error, for either the stage or any
   * piece. The About can be rendered without a hero above it, and the correct
   * rendering of "there is nothing to take apart" is a handoff that only holds
   * — which is what the rest of the frame already does.
   */
  const heroStage = document.querySelector<HTMLElement>('[data-arr-stage]')

  /**
   * Every piece of the machine, by the marker it carries.
   *
   * Resolved in `BENCH_HERO_EXITS` order and stored in a map rather than read
   * out of the DOM in document order, for the same reason the chips are: the
   * frame returns one entry per piece of that table, and the only thing that
   * makes the pairing correct is that the two are indexed the same way.
   */
  const HERO_PIECES: readonly (readonly [BenchHeroPiece, string])[] = [
    ['rail', '[data-arr-rail]'],
    ['proof', '[data-arr-proof]'],
    ['playhead', '[data-arr-playhead]'],
    ['camera', '[data-arr-camera]'],
    ['chrome', '[data-arr-chrome]'],
    ['ruler', '[data-arr-ruler]'],
    ['ground', '[data-arr-ground]'],
  ]
  const heroPieces = new Map<BenchHeroPiece, HTMLElement>()
  if (heroStage) {
    for (const [id, selector] of HERO_PIECES) {
      const node = heroStage.querySelector<HTMLElement>(selector)
      if (node) heroPieces.set(id, node)
    }
  }

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

  /**
   * The flying devices, resolved in `BENCH_DEVICES` order for the same reason
   * the chips are: `benchDeviceFrames` returns one frame per entry, and the
   * pairing is only correct if the nodes are indexed the same way.
   */
  const deviceLayer = element.querySelector<HTMLElement>('[data-bench-devices]')
  const deviceAnchors: HTMLElement[] = []
  const deviceRots: HTMLElement[] = []
  for (const device of BENCH_DEVICES) {
    const anchor = element.querySelector<HTMLElement>(
      `[data-bench-device="${device.id}"]`,
    )
    const rot = element.querySelector<HTMLElement>(
      `[data-bench-device-rot="${device.id}"]`,
    )
    if (!anchor || !rot) {
      console.error(
        `Bench motion: device "${device.id}" is missing; leaving the native flow`,
      )
      return () => {}
    }
    deviceAnchors.push(anchor)
    deviceRots.push(rot)
  }
  if (!deviceLayer) {
    console.error(
      'Bench motion: the device layer is missing; leaving the native flow',
    )
    return () => {}
  }

  // Snapshot before anything is written, restore on the way out. This section's
  // own stage is deliberately not in this list: nothing is written to it any
  // more. The seam used to be its opacity and its arrival offset; it is now the
  // *hero's* stage that moves, and that node is in the list below.
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
  // The devices are restored like everything else, but kept out of `owned`:
  // `gsap.set` on `owned` re-serialises a node's transform, and these carry
  // 3D rotations that GSAP has no reason to parse.
  //
  // The hero's stage and its pieces are the same case one step further out.
  // They belong to another component, GSAP never touches them, and the hook
  // that *does* own them writes custom properties to the track area and the
  // ruler rather than any of the properties this seam writes — so the only
  // inline styles these nodes can carry are the ones this hook puts there, and
  // a snapshot is a complete restoration.
  //
  // The pieces are snapshotted individually as well as the stage: a teardown
  // that restored the stage but left a toolbar translated off the top of it
  // would leave the machine visibly missing a part.
  const restorable = [...owned, deviceLayer, ...deviceAnchors, ...deviceRots]
  if (heroStage) restorable.push(heroStage)
  restorable.push(...heroPieces.values())
  const snapshots = restorable.map(
    (node) => [node, node.getAttribute('style')] as const,
  )
  /**
   * Whether the seam has taken the machine out of the interaction tree.
   *
   * Tracked rather than read back off the node because it is written on change
   * only — a style write per frame for a value that flips once is the kind of
   * cost this hook is otherwise built to avoid.
   */
  let heroCleared = false

  /**
   * Whether the seam is holding the lanes' opacity to the scroll.
   *
   * The dissolve is delivered through the lanes' own `opacity` — the property
   * the hero also scrubs — and the hero gives that property a 120ms transition
   * to smooth its recession. That smoothing can outlast this seam's whole
   * window, so the seam turns it off while it runs by marking the hero's stage;
   * the stylesheet then drops the half of the transition the seam is writing.
   * See `arrangement.module.css`.
   *
   * Tracked for the same reason `heroCleared` is: written on change only, and
   * it flips twice across the whole page.
   */
  let seamRunning = false

  const geometry: BenchGeometry = { stageWidth: 1280, stageHeight: 760 }

  const renderFrame = (frame: BenchFrame) => {
    const unitNow = Math.min(
      2,
      Math.max(0.6, geometry.stageWidth / BENCH_STAGE_WIDTH),
    )

    // The lanes' dissolve is exactly scroll-locked while the seam runs. The
    // hero smooths their `opacity` with a 120ms transition, and that smoothing
    // is longer than this seam's window — so a dissolve left behind it would
    // still be half-faded on the frame the park below lands on. The marker is
    // set for as long as the seam's clock is running at all and cleared the
    // moment it is not, which is well before the hero's own dive resumes on the
    // way back up. Written on change only, like the park.
    //
    // It is declared *before* the exits are written, and that order is the
    // point: the first frame of the seam is the one frame where `--arr-fade`
    // moves from exactly 1, and declaring ownership first means there is no
    // frame in which the transition is still live to catch it.
    const seamLive = frame.progress > 0
    if (heroStage && seamLive !== seamRunning) {
      seamRunning = seamLive
      if (seamLive) heroStage.dataset.seamLocked = ''
      else delete heroStage.dataset.seamLocked
    }

    /**
     * The seam: the machine above this section, coming apart.
     *
     * The sheet this section is drawn on does not arrive and does not move — it
     * is the page, pulled up under the hero and sitting behind it, whole, from
     * the first frame of the handoff. What the hold spends is the instrument
     * leaving, one piece at a time and each along its own axis, so what the
     * reader sees is the About being *uncovered* rather than a second page
     * fading in on top of the first. See `BENCH_HERO_EXITS`.
     *
     * Written as direct property writes on the piece rather than through a
     * custom property on an ancestor, and that is a cost decision with a
     * measurement behind it: a custom property set on the hero's stage
     * invalidates that stage's entire subtree, and that subtree is the whole
     * DAW — the same mistake the hero's own hook documents at 1613ms against
     * 166ms. One write per piece restyles that piece alone.
     *
     * `translate` rather than `transform`, and that is correctness rather than
     * taste. `.rail`, `.playhead` and `.camera` already carry a `transform` the
     * stylesheet composes from the hero's own custom properties — the rail's
     * phase slide, the camera's zoom and pan. Writing `transform` here would
     * replace that outright and the pieces would jump to the world's origin the
     * moment the seam touched them. The individual `translate` property
     * composes *after* `transform`, so the exit is added to whatever the hero
     * has already done rather than instead of it.
     *
     * The camera is the one piece that is not written directly, and the reason
     * is in `BenchHeroExitMode`: `.camera` carries a 3D rendering context, and
     * an `opacity` below 1 on it would flatten the lanes' `translateZ` into its
     * own plane — so its content is dissolved through `--arr-fade` instead, a
     * custom property the lanes multiply into their own opacity. That write
     * lands on the camera and not on an ancestor, and the subtree it invalidates
     * is the timeline, which the hero's own hook is already invalidating every
     * frame with `--arr-depth` and `--arr-lane-opacity` — so this is a property
     * of a tree that was being restyled anyway, not a new one.
     */
    for (const exit of frame.heroExits) {
      const node = heroPieces.get(exit.id)
      if (!node) continue
      if (exit.mode === 'slide') {
        node.style.translate = `${exit.x}% ${exit.y}%`
      } else if (exit.mode === 'fade') {
        // The pieces that leave by direction never reach this branch, and that
        // is load-bearing: `.chrome` and `.proof` declare a `transition:
        // opacity`, and an inline write behind a 400ms transition is a smear
        // rather than a fade. They are clipped on their way out and must keep
        // whatever opacity the hero's own phases gave them.
        node.style.opacity = String(exit.opacity)
      } else {
        node.style.setProperty('--arr-fade', String(exit.opacity))
      }
    }

    // Once the machine is gone it has to leave the *interaction* tree as well as
    // the paint one, and an empty frame does neither: the stage is a sticky
    // layer that outlives the exits by a viewport of scrolling, and the About's
    // own links climb past where it was — so an un-hidden stage is an invisible
    // full-viewport sheet that swallows every pointer event and keeps the
    // transport and the nav in the tab order. This is not tidiness.
    //
    // `visibility` rather than `pointer-events`, because it fixes both: a hidden
    // subtree is not hit-tested and its focusable descendants drop out of the
    // tab order. Written on change only — it flips once, each way.
    if (heroStage && frame.heroCleared !== heroCleared) {
      heroCleared = frame.heroCleared
      heroStage.style.visibility = heroCleared ? 'hidden' : ''
    }

    // The far stratum and the principle's own entry are two translations on one
    // node, summed rather than nested: the principle is inside the sheet, and a
    // wrapper element would exist only to hold a number.
    // The sheet starts tipped back like a desk seen from a seat and lies flat
    // as the drawing completes: the draw-on clock doubles as the tilt's.
    const tilt = 16 * (1 - frame.artifactDraw)
    paper.style.transform = `translate3d(0, ${frame.farY}px, 0) perspective(1600px) rotateX(${tilt}deg)`
    principle.style.transform = `translate3d(0, ${frame.farY + frame.principleY}px, 0)`
    // The principle arrives word by word: the stylesheet derives each word's
    // offset from this one number, so the box itself is never faded.
    principle.style.setProperty('--e', String(frame.principleOpacity))

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
    // The record plays as the page scrolls. Degrees, unbounded.
    const spin = frame.progress * 900
    artifact.style.setProperty('--bench-spin', String(spin))
    deviceLayer.style.setProperty('--bench-spin', String(spin))

    const flights = benchDeviceFrames(
      frame.progress,
      geometry.stageHeight,
      unitNow,
    )
    for (let index = 0; index < flights.length; index += 1) {
      const flight = flights[index]
      const anchor = deviceAnchors[index]
      const rot = deviceRots[index]
      anchor.style.transform = `translate3d(${flight.x}px, ${flight.y}px, 0) scale(${flight.scale})`
      anchor.style.setProperty('--o', String(flight.opacity))
      const posed = setGlassPose(rot, {
        rx: flight.rotateX,
        ry: flight.rotateY,
        rz: flight.rotateZ,
        p: Math.min(1, frame.progress * 2),
        spin: spin,
      })
      if (!posed) {
        rot.style.transform = `rotateX(${flight.rotateX}deg) rotateY(${flight.rotateY}deg) rotateZ(${flight.rotateZ}deg)`
      }
    }

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
   *
   * This section's own stage is not in `owned` and needs no clearing: nothing
   * in this hook writes a transform to it any more. The node the seam moves is
   * the hero's, and it is outside every box measured here — the hero's stage is
   * a sibling section's, and none of the bands below are read from it.
   */
  const measure = () => {
    gsap.set(owned, { x: 0, y: 0, scale: 1 })

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
  const readingTriggers: ReturnType<ScrollTriggerStatic['create']>[] = []
  /** Every custom property the reading clocks wrote, so teardown can unwrite it. */
  const written: (readonly [HTMLElement, string])[] = []

  const teardown = () => {
    stopped = true
    trigger?.kill()
    trigger = null
    for (const t of readingTriggers) t.kill()
    readingTriggers.length = 0
    for (const [node, name] of written) node.style.removeProperty(name)
    written.length = 0
    for (const [node, style] of snapshots) {
      if (style === null) node.removeAttribute('style')
      else node.setAttribute('style', style)
    }
    // The hero's stage and its pieces are restored by the snapshot above like
    // any other node — they are all in `restorable` — so there is nothing to
    // unwrite here. They are deliberately *not* unwritten by hand: the hero's
    // own hook may already have inline custom properties on the track area and
    // the ruler, and the snapshot is the only restoration that is guaranteed to
    // leave each node exactly as it was found.
    //
    // `data-seam-locked` is the one exception, and it is not a style: a
    // snapshot of `style` cannot reach an attribute, so the marker has to be
    // lifted by hand or it would outlive the hook and hold the hero's own
    // smoothing off for the rest of the session.
    heroCleared = false
    seamRunning = false
    if (heroStage) delete heroStage.dataset.seamLocked
    element.style.removeProperty('--bench-runway')
    // The hero is not this hook's to keep. Leaving the hold behind would leave
    // a section below it with a stretch of scroll nothing animates in, which is
    // the exact defect the hold exists to remove.
    document.documentElement.style.removeProperty('--arr-hold')
    delete element.dataset.motion
    delete element.dataset.benchState
  }

  /**
   * The reading panel's own clocks, from the title to the last line.
   *
   * Each is a scrubbed trigger that writes **one number on one small node**:
   *
   * - `--p` on each chapter's visual: 0 as the chapter enters, 1 as it leaves.
   *   Every tilt, spin, lit pad and meter bar of that chapter's device is CSS
   *   arithmetic on it, so the device is a pure function of scroll;
   * - `--m` on the ticker, driving two rows in opposite directions;
   * - `--ap` on the rail, the playhead along the whole About.
   *
   * The number is never written to the panel itself: a custom property change
   * restyles the whole subtree below it, and the panel is most of the page.
   * Without this function (phones, reduced motion, no JavaScript) every
   * default in the stylesheet is a composed resting frame, not an empty one.
   */
  const bindReading = () => {
    const bind = (
      node: HTMLElement,
      name: string,
      start: string,
      end: string,
      source: HTMLElement = node,
      also?: (progress: number) => void,
    ) => {
      written.push([node, name])
      const write = (progress: number) => {
        node.style.setProperty(name, progress.toFixed(4))
        also?.(progress)
      }
      readingTriggers.push(
        ScrollTrigger.create({
          trigger: source,
          start,
          end,
          onRefresh: (self) => write(self.progress),
          onUpdate: (self) => write(self.progress),
        }),
      )
    }

    for (const visual of element.querySelectorAll<HTMLElement>(
      '[data-bench-cvisual]',
    )) {
      const chapter =
        visual.closest<HTMLElement>('[data-bench-chapter]') ?? visual
      // A glass device cannot read the stylesheet's `calc()`, so the same pose
      // is also handed to it as numbers. If there is no glass device (yet), the
      // stylesheet's tilt is what turns.
      const kind = visual.querySelector<HTMLElement>('[data-kind]')?.dataset
        .kind as GlassKind | undefined
      bind(
        visual,
        '--p',
        'top 85%',
        'bottom 30%',
        chapter,
        kind
          ? (progress) => setGlassPose(visual, chapterPose(kind, progress))
          : undefined,
      )
    }
    const ticker = element.querySelector<HTMLElement>('[data-bench-ticker]')
    if (ticker) bind(ticker, '--m', 'top bottom', 'bottom top')
    const rail = element.querySelector<HTMLElement>('[data-bench-rail]')
    if (rail) bind(rail, '--ap', 'top 65%', 'bottom 65%', about)
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

    bindReading()

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
