import { matterDeviceFrame, type DeviceFrame } from './matter-device'
import {
  FLIGHT_PARTS,
  flightFrame,
  groupAnchorFor,
  type FlightGroup,
  type FlightHome,
} from './matter-flight'
import { letterFrame } from './matter-type'

type Gsap = (typeof import('gsap'))['gsap']
type OwnedElement = { element: HTMLElement; style: string | null }

/**
 * The paint-only custom properties the device layer writes.
 *
 * They are listed rather than written ad hoc so `reset()` and `restore()` can
 * remove exactly the set the renderer adds — a stray `--device-opacity` left on
 * a teardown is a stage that comes back at the wrong brightness the next time
 * the breakpoint is crossed.
 */
const DEVICE_PROPERTIES = [
  '--device-opacity',
  '--faceplate-opacity',
  '--signal-opacity',
  '--platter-rotation',
  '--tonearm-progress',
  '--meter-level',
] as const

const RESIDUE_PROPERTIES = ['--residue-opacity'] as const

/**
 * The bridge's decorative binder: flight parts, kinetic letters, the device
 * shell and the practice residue, all on the one clock the ScrollTrigger owns.
 *
 * ## Why it is a separate module from the hook
 *
 * The hook's job is *when* to run; this module's job is *what to write*. Keeping
 * them apart is what makes the write path auditable: everything in here is a
 * transform, an opacity, or a preallocated custom property, and nothing in here
 * reads layout. The two measurements that do exist — the source homes and the
 * residue's anchor — happen in `measure()`, which the hook calls on refresh and
 * never on a scroll tick.
 *
 * ## The rules it is built to keep
 *
 * - **One transform per element per frame.** A part's translate, rotate and
 *   scale are composed into a single `transform` string rather than written as
 *   three properties, and `gsap.quickSetter(element, 'scale')` is deliberately
 *   never used: GSAP 3.15 routes that shorthand through a `scaleX,scaleY` write,
 *   and a comma is not legal in a CSS property name, so it throws instead of
 *   scaling. A handoff whose only scale silently throws is a handoff that never
 *   runs.
 * - **No reads in `render()`.** No `getBoundingClientRect`, no `offsetHeight`,
 *   no selector lookup. The geometry is captured by `measure()` and reused.
 * - **Exact restoration.** Every owned node's original inline `style` attribute
 *   is snapshotted before the first write and put back verbatim on teardown, so
 *   crossing the breakpoint cannot strand a half-flown cast behind a layout
 *   that no longer runs any motion.
 */
export function createMatterExtras(stage: HTMLElement, gsap: Gsap) {
  const shell = stage.querySelector<HTMLElement>('[data-device-shell]')
  const residue = stage.querySelector<HTMLElement>('[data-practice-residue]')
  // The reading column is what the residue is aligned to. It lives in the About
  // panel rather than in the stage, so it is reached through the section that
  // owns both — and its *horizontal* offset is scroll-invariant, which is why
  // aligning to it once per refresh is enough.
  const root = stage.closest<HTMLElement>('[data-matter-bridge]')
  const reading =
    root?.querySelector<HTMLElement>('[data-matter-reading]') ?? null

  const owned: HTMLElement[] = []
  const own = (element: HTMLElement | null) => {
    if (element) owned.push(element)
  }

  const parts = FLIGHT_PARTS.flatMap((definition) => {
    const element = stage.querySelector<HTMLElement>(
      `[data-flight="${definition.id}"]`,
    )
    if (!element) return []
    own(element)
    return [{ definition, element, home: { ...definition.home } as FlightHome }]
  })

  const words = (['signal', 'human'] as const).map((word) => {
    const elements = Array.from(
      stage.querySelectorAll<HTMLElement>(
        `[data-matter-word="${word}"] [data-letter]`,
      ),
    )
    elements.forEach((element) => own(element))
    return { word, elements }
  })

  own(shell)
  own(residue)

  const snapshots: OwnedElement[] = owned.map((element) => ({
    element,
    style: element.getAttribute('style'),
  }))
  let width = 1
  let height = 1

  const writeTransform = (
    element: HTMLElement,
    x: number,
    y: number,
    scale: number,
    rotation: number,
  ) => {
    element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`
  }

  /**
   * The device frame, as paint-only custom properties.
   *
   * The shell's own opacity, the faceplate's lift, the signal route, the
   * platter's turn, the tonearm's swing and the meter's level are all written
   * here; the stylesheet is what reads them. Nothing structural is touched, so
   * a frame is a handful of string writes and no reflow.
   */
  const writeDevice = (frame: DeviceFrame) => {
    if (shell) {
      shell.style.setProperty('--device-opacity', String(frame.shellOpacity))
      shell.style.setProperty(
        '--faceplate-opacity',
        String(frame.faceplateOpacity),
      )
      shell.style.setProperty('--signal-opacity', String(frame.signalOpacity))
      shell.style.setProperty(
        '--platter-rotation',
        `${frame.platterRotation}deg`,
      )
      shell.style.setProperty('--tonearm-progress', String(frame.tonearm))
      shell.style.setProperty('--meter-level', String(frame.meterLevel))
    }
    if (residue) {
      residue.style.setProperty(
        '--residue-opacity',
        String(frame.residueOpacity),
      )
    }
  }

  const clearDeviceProperties = () => {
    if (shell) {
      for (const property of DEVICE_PROPERTIES) {
        shell.style.removeProperty(property)
      }
    }
    if (residue) {
      for (const property of RESIDUE_PROPERTIES) {
        residue.style.removeProperty(property)
      }
      residue.style.removeProperty('left')
      residue.style.removeProperty('right')
    }
  }

  /**
   * Align the residue to the reading column's practice band.
   *
   * ## Why the horizontal position is measured and the vertical is not
   *
   * The residue has to sit in the right-hand band of the reading column — where
   * the practice statements live — and never inside the body column. That band
   * is a fraction of the column, and the column is centred with a max width, so
   * the offset is *derived* from a measurement rather than guessed: `0.58` is
   * where the twelve-column grid's eighth column starts, which is the left edge
   * of the practice band. Because it is horizontal, it is also scroll-invariant,
   * which is what makes measuring it once per refresh enough.
   *
   * The vertical position is deliberately left to the stylesheet. The practice
   * heading lives on the reading panel, and the panel is *opaque and above the
   * stage* — so aligning the residue to the heading would put it under the
   * panel's own top edge for the whole of its beat, because the panel has
   * already climbed past the heading's band by the time the residue appears.
   * The stage's upper-right is the one slot that is clear of both the panel and
   * the word band, and a fraction of the stage is the honest way to name it.
   *
   * With no reading column measured — a first frame, or a markup change — the
   * stylesheet's own fallback position stands.
   */
  const measurePracticeResidue = () => {
    if (!residue || !reading) return
    const stageRect = stage.getBoundingClientRect()
    const readingRect = reading.getBoundingClientRect()
    if (!(stageRect.width > 0) || !(readingRect.width > 0)) return
    const left = readingRect.left - stageRect.left + readingRect.width * 0.58
    residue.style.right = 'auto'
    residue.style.left = `${Math.round(left)}px`
  }

  return {
    reset() {
      gsap.set(owned, { clearProps: 'transform,opacity' })
      clearDeviceProperties()
    },

    measure() {
      gsap.set(owned, { clearProps: 'transform,opacity' })
      width = Math.max(1, stage.clientWidth)
      height = Math.max(1, stage.clientHeight)
      const stageRect = stage.getBoundingClientRect()
      const centerX = stageRect.left + stageRect.width / 2
      const centerY = stageRect.top + stageRect.height / 2
      for (const part of parts) {
        const source = part.definition.source
          ? document.querySelector<HTMLElement>(part.definition.source)
          : null
        if (!source) {
          part.home = { ...part.definition.home }
          continue
        }
        const rect = source.getBoundingClientRect()
        part.home = {
          x: rect.left + rect.width / 2 - centerX,
          y: rect.top + rect.height / 2 - centerY,
        }
      }
      measurePracticeResidue()
    },

    render(progress: number) {
      writeDevice(matterDeviceFrame(progress))

      const geometry = { viewportWidth: width, viewportHeight: height }
      /**
       * One cluster bias per group per frame, not per member. The anchor is a
       * function of the group and the progress alone, so computing it once and
       * sharing it is both cheaper and a guarantee that a group's members can
       * never be given different biases on the same frame.
       */
      const anchors = new Map<FlightGroup, FlightHome>()
      const anchorFor = (group: FlightGroup): FlightHome => {
        let anchor = anchors.get(group)
        if (!anchor) {
          anchor = groupAnchorFor(group, progress)
          anchors.set(group, anchor)
        }
        return anchor
      }

      for (const { definition, element, home } of parts) {
        const frame = flightFrame(
          progress,
          definition,
          geometry,
          home,
          anchorFor(definition.group),
        )
        writeTransform(element, frame.x, frame.y, frame.scale, frame.rotation)
        element.style.opacity = String(frame.opacity)
      }
      for (const { word, elements } of words) {
        elements.forEach((element, index) => {
          const frame = letterFrame(progress, word, index, elements.length)
          element.style.transform = `translate3d(0, ${frame.yPercent}%, 0) scale(${frame.scale})`
          element.style.opacity = String(frame.opacity)
        })
      }
    },

    restore() {
      gsap.set(owned, { clearProps: 'all' })
      for (const { element, style } of snapshots) {
        if (style === null) element.removeAttribute('style')
        else element.setAttribute('style', style)
      }
    },
  }
}
