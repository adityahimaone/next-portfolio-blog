import { clamp01, phase, phaseLinear } from '../../chapters/shared/progress'

/**
 * The RIDDIM hero's whole scroll story, as ONE pure function.
 *
 * `riddimFrame(progress)` maps the hero's 0–1 scroll progress to every number
 * the scene needs. Nothing here reads the DOM, holds state, or remembers the
 * previous frame, so scrolling backwards renders the identical frame at the
 * identical position and the choreography is unit-testable without a browser.
 *
 * The hero is a pinned stage `RIDDIM_SCROLL_SVH` tall. You arrive on the frame
 * the machine was photographed in — its screen filling the width, the fascia
 * above it, the console and its metronome below — and the story runs from
 * there: pull back to see the whole machine, watch it press its own key and
 * change screen, fall back into the new screen, and let that screen open up
 * into the About section.
 *
 *   0.00 – 0.20  boot      the frame at the LCD, the machine coming up
 *   0.20 – 0.42  pull back the camera leaves the screen for the whole machine
 *   0.34 – 0.44  side      the panels either side of the machine come in
 *   0.42 – 0.58  overview  the machine plays; the camera drifts in a little
 *   0.47 – 0.53  press     PLAY goes down and comes back up
 *   0.50 – 0.56  swap      the LCD wipes from the title card to the profile
 *   0.60 – 0.70  side out  the panels leave
 *   0.58 – 0.80  push in   the camera returns to the screen
 *   0.80 – 0.92  open      the letterbox opens: the profile fills the viewport
 *   0.90 – 0.98  flip      the screen's backlight gives way to the page's
 *                          surface, which is where the About section begins
 *
 * Two surfaces show the same screen — the machine's LCD and the fullscreen
 * plane — and the plane only stands in once the letterbox has actually opened
 * past the LCD. At scroll 0 the letterbox is shut and the machine's own LCD is
 * the picture, which is the whole point of the opening frame: the console has
 * to be visible around the screen.
 */

export const RIDDIM_SCROLL_SVH = 480

export const RIDDIM_PHASES = {
  power: [0.06, 0.3],
  controls: [0.2, 0.82],
  meter: [0.28, 0.58],
  ink: [0, 0.14],
  inkTwo: [0.52, 0.7],
  readout: [0, 0.84],
  play: [0.38, 0.46],
  playOut: [0.6, 0.68],
  handoff: [0.52, 0.6],
  pullBack: [0.2, 0.42],
  side: [0.34, 0.44],
  sideOut: [0.6, 0.7],
  drift: [0.42, 0.58],
  press: [0.47, 0.5],
  pressOut: [0.5, 0.53],
  swap: [0.5, 0.56],
  pushIn: [0.58, 0.8],
  open: [0.8, 0.92],
  flip: [0.9, 0.98],
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
  /** 0–1, the first screen's glyph field lights. */
  ink: number
  /** 0–1, the second screen's glyph field lights. */
  inkTwo: number
  /** 0–1, the counter runs. */
  readout: number
  /** 0–1, gate for the pad ripple. */
  play: number
  /** 0–1, the bottom label row turns into the next chapter's name. */
  handoff: number
  /** 0–1, how open the letterbox is. 1 is the fullscreen screen. */
  open: number
  /** 1 = the camera is on the LCD, 0 = the whole machine. */
  lens: number
  /** 0–1, the small dolly during the overview. */
  drift: number
  /** 0–1, how far down the PLAY key is. */
  press: number
  /** 0–1, how far the second screen has wiped over the first. */
  swap: number
  /** 0–1, the side panels. */
  side: number
  /** 0–1, the backlight giving way to the page surface. */
  flip: number
  /** True when the fullscreen plane stands in for the LCD. */
  plane: boolean
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

  // + 0 turns -0 into 0, so a written custom property is never "-0".
  const lens = 1 - span('pullBack', p) + span('pushIn', p) + 0
  const open = span('open', p) + 0

  return {
    power: span('power', p),
    controls: span('controls', p),
    meter: span('meter', p),
    ink: span('ink', p),
    inkTwo: span('inkTwo', p),
    readout,
    play: span('play', p) * (1 - span('playOut', p)),
    handoff: span('handoff', p),
    open,
    lens,
    drift: span('drift', p),
    press: span('press', p) * (1 - span('pressOut', p)),
    swap: span('swap', p),
    side: span('side', p) * (1 - span('sideOut', p)),
    flip: span('flip', p),
    // The plane only stands in once the letterbox has opened past the LCD. At
    // scroll 0 it is shut, so the machine's own LCD is the picture and the
    // console is visible around it — a plane there would cover the whole
    // viewport with a screen nobody asked to have blown up yet.
    plane: lens >= 0.9999 && open > 0.001,
    digits: counterDigits(readout),
  }
}
