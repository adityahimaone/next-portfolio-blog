import { CANVAS, SCREEN } from './riddim-geometry'

/**
 * The camera: a translate and a scale on the machine.
 *
 * The machine is flat vector art, so "zooming" is a transform, not a 3D scene.
 * The rig centres the machine in the stage; the camera chooses which point of
 * the machine sits at the stage centre (`focus`) and how large it is drawn
 * (`scale`). All numbers here are in the clone's native units, which the
 * stylesheet turns into pixels with the machine's own `--u`.
 *
 * Two poses and the path between them:
 *
 *   overview  scale 1 (a touch more with `drift`), focus on the machine's centre
 *   screen    scale `fill`, focus on the LCD's centre, so the LCD is exactly as
 *             wide as the stage
 *
 * Scale is interpolated in log space — a zoom feels even when each step
 * multiplies the size by the same factor — and the focus linearly.
 */

export const MACHINE_CENTRE = { x: CANVAS.w / 2, y: CANVAS.h / 2 } as const
export const LCD_CENTRE = {
  x: SCREEN.x + SCREEN.w / 2,
  y: SCREEN.y + SCREEN.h / 2,
} as const

/** How much closer the overview dollies while the machine plays. */
export const DRIFT = 0.06

/**
 * The scale at which the LCD is as wide as the stage.
 * `unit` is the machine's px per native unit at scale 1.
 */
export function fillScale(stageWidth: number, unit: number): number {
  return stageWidth / (SCREEN.w * unit)
}

export function cameraAt(
  { lens, drift }: { lens: number; drift: number },
  fill: number,
): { scale: number; dx: number; dy: number } {
  const overview = 1 + DRIFT * drift
  const scale = overview * Math.pow(fill / overview, lens)
  const fx = MACHINE_CENTRE.x + (LCD_CENTRE.x - MACHINE_CENTRE.x) * lens
  const fy = MACHINE_CENTRE.y + (LCD_CENTRE.y - MACHINE_CENTRE.y) * lens
  return {
    scale,
    // Moving the machine opposite to the focus brings the focus to the centre.
    dx: -scale * (fx - MACHINE_CENTRE.x) + 0,
    dy: -scale * (fy - MACHINE_CENTRE.y) + 0,
  }
}

/**
 * The letterbox: how tall the LCD band is, and so how far in from top and
 * bottom the plane's window sits when it is closed onto the LCD.
 */
export function bandInset(stageWidth: number, stageHeight: number): number {
  const band = (stageWidth * SCREEN.h) / SCREEN.w
  return Math.max(0, (stageHeight - band) / 2)
}
