export type GlassKind = 'sampler' | 'cassette' | 'player' | 'knob' | 'vinyl'

export type GlassPose = {
  /** Degrees. The same axes and order as the CSS `rotateX() rotateY() rotateZ()`. */
  rx: number
  ry: number
  rz: number
  /** 0..1, how far the scene has played. Lights the sampler's pads in order. */
  p?: number
  /** Degrees. Turns the reels and the record. */
  spin?: number
  /**
   * The host's opacity, 0..1, if the caller animates one. A device faded to
   * nothing costs a full render to produce a frame nobody can see, and the
   * renderer only draws a few devices a frame — so a hidden one is skipped
   * rather than drawn. Defaults to 1 (always drawn).
   */
  alpha?: number
}

export type GlassHandle = {
  setPose: (pose: GlassPose) => void
  dispose: () => void
}

/**
 * The registry the scroll hooks talk to.
 *
 * It lives apart from `glass-devices.ts` on purpose: that file imports three.js,
 * and the hooks that pose the devices are part of the page's first load. They
 * import this file, which is a few lines of plain TypeScript, and three.js
 * arrives later, only when a device actually scrolls near the viewport.
 */

const handles = new WeakMap<HTMLCanvasElement, GlassHandle>()
const hosts = new WeakMap<Element, HTMLCanvasElement | null>()

export function registerGlass(canvas: HTMLCanvasElement, handle: GlassHandle) {
  handles.set(canvas, handle)
}

export function unregisterGlass(canvas: HTMLCanvasElement) {
  handles.delete(canvas)
}

/**
 * Pose whatever glass device lives under `host`. Returns whether there was one.
 *
 * The callers are the scroll hooks, which used to write a CSS rotation. They
 * call this first and write the CSS rotation only if it returns false, so a
 * device whose model has not loaded yet (or never will) still turns. When it
 * does return true it also clears any CSS rotation left on `host`, otherwise
 * the canvas would turn twice.
 */
export function setGlassPose(host: HTMLElement, pose: GlassPose): boolean {
  let canvas = hosts.get(host)
  if (canvas === undefined || (canvas && !canvas.isConnected)) {
    canvas = host.querySelector<HTMLCanvasElement>('canvas[data-glass-canvas]')
    hosts.set(host, canvas)
  }
  const handle = canvas ? handles.get(canvas) : undefined
  if (!canvas || !handle) return false
  if (host.style.transform) host.style.transform = ''
  handle.setPose(pose)
  return true
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/**
 * A chapter's device pose from its scroll progress `p` (0 as the chapter enters,
 * 1 as it leaves). This is `bench-chapters.module.css`'s `.tilt` arithmetic,
 * restated in numbers, because a canvas cannot read a CSS `calc()`. The CSS
 * version stays as the fallback for a device whose model has not loaded.
 */
export function chapterPose(kind: GlassKind, progress: number): GlassPose {
  const p = clamp01(Number.isFinite(progress) ? progress : 0.5)
  const spin = p * 900
  switch (kind) {
    case 'sampler':
      return { rx: 58 - p * 46, ry: -36 + p * 72, rz: -10 + p * 20, p, spin }
    case 'cassette':
      return { rx: -30 + p * 50, ry: 44 - p * 88, rz: 8 - p * 16, p, spin }
    default:
      return { rx: 72 - p * 58, ry: -20 + p * 40, rz: -12 + p * 40, p, spin }
  }
}
