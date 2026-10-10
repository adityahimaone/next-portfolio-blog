import { clamp01, phase, phaseLinear } from '../../chapters/shared/progress'

/**
 * The RIDDIM hero's whole scroll story, as ONE pure function.
 *
 * `riddimFrame(progress)` maps the hero's 0–1 scroll progress to every number
 * the machine needs. Nothing here reads the DOM, holds state, or remembers the
 * previous frame, so scrolling backwards renders the identical frame at the
 * identical position and the choreography is unit-testable without a browser.
 *
 * The hero IS the machine: its height is the clone's height, so progress 0 is
 * the machine's top edge at the top of the viewport and progress 1 is its
 * bottom edge at the bottom. Scrolling is walking down the instrument, and the
 * story is the machine powering up as you go:
 *
 *   0.00 – 0.16  power     the power LED and the panel come up to full
 *   0.05 – 0.80  controls  both knobs turn and the fader slides with the scroll
 *   0.12 – 0.58  meter     the parameter LEDs step on down the pad field
 *   0.20 – 0.68  ink       the screen's glyph field lights, in sequence
 *   0.20 – 0.66  readout   the seven-segment counter runs 01.12 → 04.16
 *   0.34 – 0.90  play      the pads ripple: the machine is playing itself
 *   0.84 – 1.00  handoff   the console's bottom label row prints the next
 *                          chapter, and the About band takes over from the
 *                          machine's bottom edge with no scroll between them
 *
 * The story ends exactly at progress 1, which is also the frame in which the
 * About band reaches the viewport. There is no stretch of scroll between the
 * two, which is the invariant its test pins.
 */

export const RIDDIM_PHASES = {
  power: [0, 0.16],
  controls: [0.05, 0.8],
  meter: [0.12, 0.58],
  ink: [0.2, 0.68],
  readout: [0.2, 0.66],
  play: [0.34, 0.9],
  handoff: [0.84, 1],
} as const

/** First and last step of the counter: bar.beat, four bars of sixteen. */
export const RIDDIM_COUNTER = { first: 12, last: 64 } as const

export type RiddimFrame = {
  /** 0–1, the machine coming up to full power. */
  power: number
  /** 0–1, knobs and fader travel. */
  controls: number
  /** 0–1, the parameter LEDs step on down the field. */
  meter: number
  /** 0–1, the screen's glyph field lights. */
  ink: number
  /** 0–1, the counter runs. */
  readout: number
  /** 0–1, gate for the pad ripple. */
  play: number
  /** 0–1, the bottom label row turns into the next chapter's name. */
  handoff: number
  /** The four seven-segment digits, left to right: bar, beat. */
  digits: [string, string, string, string]
}

const span = (key: keyof typeof RIDDIM_PHASES, p: number) => {
  const [a, b] = RIDDIM_PHASES[key] as readonly [number, number]
  return phase(p, a, b)
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** bar.beat, printed the way the reference prints it: `01.12`. */
export function counterDigits(
  readout: number,
): [string, string, string, string] {
  const { first, last } = RIDDIM_COUNTER
  const step = Math.round(first + clamp01(readout) * (last - first))
  const bar = Math.ceil(step / 16)
  const beat = step - (bar - 1) * 16
  return [pad2(bar)[0], pad2(bar)[1], pad2(beat)[0], pad2(beat)[1]]
}

export function riddimFrame(progress: number): RiddimFrame {
  const p = clamp01(progress)
  const [ra, rb] = RIDDIM_PHASES.readout
  const readout = phaseLinear(p, ra, rb)

  return {
    power: span('power', p),
    controls: span('controls', p),
    meter: span('meter', p),
    ink: span('ink', p),
    readout,
    play: span('play', p),
    handoff: span('handoff', p),
    digits: counterDigits(readout),
  }
}
