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
 *   0.05 – 0.45  ink       the screen's glyph field and its six words light,
 *                          in sequence, out of the dark panel the boot frame
 *                          opens on
 *   0.12 – 0.58  meter     the parameter LEDs step on down the pad field
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
  ink: [0.05, 0.45],
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

/* -------------------------------------------------------------------------
 * The desktop story: a camera, and the planes the LCD becomes
 * ---------------------------------------------------------------------- */

/**
 * The beats of the pinned stage, as scroll windows.
 *
 * `riddimFrame` above is the machine powering up; this is the camera and the
 * surfaces the LCD turns into. The story is one pass down the same 0–1 range:
 *
 *   0.00 – 0.12  boot       the top half of the machine fills the frame — the
 *                           header, the speaker, the lit screen and the
 *                           console's knobs. The screen's icon field is dark
 *                           and lights as the machine comes up
 *   0.12 – 0.40  pull       the camera pulls back until the whole instrument
 *                           is in frame
 *   0.40 – 0.64  overview   the machine at fit height: the pads play, the
 *                           flanking columns annotate it, the PLAY key
 *                           presses itself and the screen swaps
 *   0.64 – 0.86  push       the camera pushes into the LCD, now on the next
 *                           chapter's screen
 *   0.86 – 1.00  about      the LCD is the first fold of the About band; the
 *                           backlight flips from green to the band's cream
 *
 * `pull` and `push` are the two numbers the camera needs, and they are the
 * interpolation the stylesheet cannot do on its own because the middle framing
 * depends on the window: `pull` runs 0 (the boot window) to 1 (the whole
 * machine), and `push` runs 0 (the whole machine) to 1 (the LCD filling the
 * frame). `use-riddim-hero.ts` turns the pair into the camera's scale and
 * offset, so this file stays a pure function of progress.
 */
export const RIDDIM_STORY = {
  boot: [0, 0.12],
  pull: [0.12, 0.4],
  overview: [0.4, 0.64],
  push: [0.64, 0.86],
  about: [0.86, 1],
} as const

export type RiddimBeat = keyof typeof RIDDIM_STORY

export type RiddimStoryFrame = {
  /** 0..1 — 0 is the boot window, 1 is the whole machine in frame. */
  pull: number
  /** 0..1 — 0 is the whole machine, 1 is the LCD filling the frame. */
  push: number
  /** 0..1 — the flanking columns either side of the machine. */
  sides: number
  /** 0..1 — the machine's screen swapping to the next chapter. */
  swap: number
  /** 0..1 — the next chapter's plane, inside the LCD. */
  about: number
  /** 0..1 — the LCD backlight, green to cream. */
  flip: number
  /** Which beat the progress is in. */
  beat: RiddimBeat
}

const BEATS = Object.keys(RIDDIM_STORY) as RiddimBeat[]

const beatAt = (p: number): RiddimBeat => {
  let beat: RiddimBeat = 'boot'
  for (const name of BEATS) if (p >= RIDDIM_STORY[name][0]) beat = name
  return beat
}

export function riddimStory(progress: number): RiddimStoryFrame {
  const p = clamp01(progress)
  const [pullStart, pullEnd] = RIDDIM_STORY.pull
  const [pushStart, pushEnd] = RIDDIM_STORY.push

  return {
    // One camera on one axis: out to the whole machine, hold, then back in.
    pull: phase(p, pullStart, pullEnd),
    push: phase(p, pushStart, pushEnd),
    sides: clamp01(phase(p, 0.34, 0.44) - phase(p, 0.58, 0.68)),
    swap: phase(p, 0.54, 0.62),
    about: phase(p, 0.68, 0.88),
    flip: phase(p, 0.9, 1),
    beat: beatAt(p),
  }
}
