import { phase, phaseLinear, clamp01 } from '../../chapters/shared/progress'

/**
 * The DAP hero's whole scroll story, as ONE pure function.
 *
 * `dapFrame(progress)` maps the hero's 0–1 scroll progress to every number the
 * scene needs. Nothing here reads the DOM, holds state, or remembers the
 * previous frame, so scrolling backwards renders the identical frame at the
 * identical position (the same rule `radio-flip.ts` follows), and the whole
 * choreography is unit-testable without a browser.
 *
 *   0.00 – 0.10  idle        the player floats, front-facing, the LCD playing
 *   0.10 – 0.46  explode     layers separate along Z, the body tilts to show
 *                            depth, the cover copy and side keys step aside
 *   0.30 – 0.46  callouts    one tag per layer, staggered in
 *   0.44 – 0.66  signal      a pulse runs the PCB traces (input → DAC → amp)
 *   0.60 – 0.68  callouts out
 *   0.66 – 0.80  reassemble  layers return to rest, tilt and bob settle
 *   0.74 – 0.82  light mode  the OLED flips from black to the About surface
 *   0.82 – 0.985 portal      the screen window opens to the whole viewport,
 *                            and its contents scale 1:1 — the About section
 *                            is "inside" the screen, then the stage releases
 *
 * Re-tuning is a single edit of `DAP_PHASES`; the proportions of the story
 * follow.
 */

/** Scroll length of the hero section, in svh. The stage is 100svh of it. */
export const DAP_SCROLL_SVH = 340

/** The track that "plays" while you scroll, in seconds (3:34). */
export const DAP_TRACK_SECONDS = 214

export const DAP_PHASES = {
  explode: [0.1, 0.46],
  callouts: [0.3, 0.46],
  calloutsOut: [0.6, 0.68],
  signal: [0.44, 0.66],
  reassemble: [0.66, 0.8],
  calm: [0.7, 0.82],
  light: [0.74, 0.82],
  portal: [0.82, 0.985],
  portalLabelOut: [0.94, 0.99],
  copyOut: [0.06, 0.2],
  keysOut: [0.05, 0.14],
  /** The track ends here: the playhead reaches the end as the portal opens. */
  trackEnd: 0.82,
} as const

/** Body tilt at full explode, in degrees. Negative X tips the top away. */
export const DAP_TILT = { x: -16, y: -30 } as const

export type DapFrame = {
  /** 0 = assembled, 1 = fully exploded. */
  explode: number
  tiltX: number
  tiltY: number
  callouts: number
  /** 0–1 along the PCB trace. */
  signal: number
  /** 0–1, how still the floating bob has gone. */
  calm: number
  /** 0–1, OLED black → About surface. */
  light: number
  /** 0–1, how open the portal window is. */
  portal: number
  portalLabel: number
  copy: number
  keys: number
  /** Playhead, 0–1 of the track, and the same in seconds. */
  fill: number
  elapsed: number
}

const span = (key: keyof typeof DAP_PHASES, p: number) => {
  const [a, b] = DAP_PHASES[key] as readonly [number, number]
  return phase(p, a, b)
}

export function dapFrame(progress: number): DapFrame {
  const p = clamp01(progress)

  const explode = span('explode', p) * (1 - span('reassemble', p))
  const callouts = span('callouts', p) * (1 - span('calloutsOut', p))
  const [sa, sb] = DAP_PHASES.signal
  const fill = clamp01(p / DAP_PHASES.trackEnd)

  return {
    explode,
    // `+ 0` turns -0 into 0, so the written custom property is never "-0.000".
    tiltX: DAP_TILT.x * explode + 0,
    tiltY: DAP_TILT.y * explode + 0,
    callouts,
    signal: phaseLinear(p, sa, sb),
    calm: span('calm', p),
    light: span('light', p),
    portal: span('portal', p),
    portalLabel: 1 - span('portalLabelOut', p),
    copy: 1 - span('copyOut', p),
    keys: 1 - span('keysOut', p),
    fill,
    elapsed: fill * DAP_TRACK_SECONDS,
  }
}

/* -------------------------------------------------------------------------
 * Portal geometry
 * ---------------------------------------------------------------------- */

export type Box = { left: number; top: number; width: number; height: number }

export type PortalRest = {
  /** Insets of the OLED window inside the stage, in px. */
  top: number
  right: number
  bottom: number
  left: number
  radius: number
  /** Transform origin: the window's centre. */
  ox: number
  oy: number
  /** Scale at which a viewport-sized layer exactly covers the window. */
  scale: number
}

/**
 * Where the portal starts: the OLED's rect inside the stage. The inner layer
 * is a full-viewport plane that grows from `scale` to 1 about the window's
 * centre while the clip window opens to the stage edges, so the contents
 * zoom in rather than merely being uncovered.
 */
export function portalRest(
  screen: Box,
  stageWidth: number,
  stageHeight: number,
  radius: number,
): PortalRest {
  const ox = screen.left + screen.width / 2
  const oy = screen.top + screen.height / 2
  // The smallest scale about (ox, oy) whose scaled stage still covers the
  // window — the stage is not centred on the window, so use the nearer edge.
  const sx = screen.width / (2 * Math.min(ox, stageWidth - ox))
  const sy = screen.height / (2 * Math.min(oy, stageHeight - oy))
  return {
    top: screen.top,
    left: screen.left,
    right: stageWidth - (screen.left + screen.width),
    bottom: stageHeight - (screen.top + screen.height),
    radius,
    ox,
    oy,
    scale: Math.min(1, Math.max(sx, sy) * 1.02),
  }
}

export function portalAt(rest: PortalRest, open: number) {
  const k = clamp01(open)
  const lerp = (a: number, b: number) => a + (b - a) * k
  return {
    top: lerp(rest.top, 0),
    right: lerp(rest.right, 0),
    bottom: lerp(rest.bottom, 0),
    left: lerp(rest.left, 0),
    radius: lerp(rest.radius, 0),
    scale: lerp(rest.scale, 1),
  }
}

/** m:ss for the OLED's time readouts. */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
