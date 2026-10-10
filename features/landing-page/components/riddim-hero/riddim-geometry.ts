/**
 * The RIDDIM SUPERTONE, transcribed.
 *
 * Every number in this file was measured off the two reference photographs
 * (front, side) rather than guessed, which is why the units are strange: they
 * are pixels of the reference front view's device bounding box, 952 x 1317.
 * The whole clone is laid out in that canvas and scaled once by `--u`, so a
 * coordinate here reads exactly like a coordinate on the photo.
 *
 * Colours are sampled from the same crops (see `PALETTE`), which is what makes
 * the thing read as the same object: the body is a warm cream that is never
 * white, the green is nearly black, and the orange is a signal colour used
 * only on the controls that do something.
 *
 * The machine is the hero, face on and unrotated, scaled so its 952 units span
 * the viewport. There is no roll and no pose: the frame IS the photograph's
 * framing, which is the only way every coordinate below stays a coordinate on
 * the photo.
 *
 * `SCREEN_UI` is the one region authored for us rather than copied: it holds
 * the title, the role line and the live readout, laid out inside the
 * reference's own 922 x 268 window.
 */

export const CANVAS = { w: 952, h: 1317 } as const

/**
 * Control addresses. A control's id is derived from where it lives and what the
 * clone prints on it, so `riddim-content.ts` can join a destination to a
 * control with one string and no coordinates.
 */
const SYMBOL_NAMES: Record<string, string> = { '\u2212': 'minus', '+': 'plus' }

const slug = (value: string) =>
  (SYMBOL_NAMES[value] ?? value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const capId = (zone: string, cap: Pick<Cap, 'label'>) =>
  `${zone}-${slug(cap.label)}`

export const padId = (pad: PadSpec) =>
  pad.glyph === 'digit' ? `pad-${pad.value}` : `pad-${pad.glyph}`

/** Sampled from the front crop. Alpha-free hex, no colour-mix guesswork. */
export const PALETTE = {
  /** Chassis: warm cream. The photo never shows it as neutral. */
  body: '#d6cebd',
  bodyHi: '#e2dbcb',
  bodyLo: '#cabfa9',
  /** The brand fascia is the one genuinely light surface. */
  fascia: '#f3f1ea',
  fasciaLo: '#e2ded3',
  /** Top strip and the speaker plate are a shade warmer than the fascia. */
  strip: '#e7dcca',
  plate: '#e2d9c7',
  /** Screen module: near-black green, not black. */
  frame: '#01301f',
  screen: '#21a273',
  screenHi: '#3db591',
  screenLo: '#14764f',
  /** Silkscreen: muted olive-grey, never pure black. */
  silk: '#4a4a40',
  inkDark: '#1d1e1c',
  /** Controls. */
  orange: '#f84a08',
  orangeLo: '#c93904',
  green: '#0b3d2c',
  greenLo: '#062b1e',
  capFace: '#efe9dc',
  capFaceHi: '#f8f4ea',
  capEdge: '#2b2a24',
  padFace: '#f1eee6',
  grille: '#141812',
} as const

/* -------------------------------------------------------------------------
 * Chassis
 * ---------------------------------------------------------------------- */

export const CHASSIS = { r: 30 } as const

/** Speaker region of the fascia: fine ribs, and a round grille punched in. */
export const SPEAKER = {
  x: 648,
  y: 44,
  w: 304,
  h: 277,
  grille: { cx: 800, cy: 152, r: 112 },
} as const

/** The white fascia carrying the wordmark, above the screen module. */
export const FASCIA = { x: 0, y: 44, w: 648, h: 277 } as const

/** Recessed press points at the fascia's corners. */
export const DIMPLES = [
  { cx: 30, cy: 74 },
  { cx: 620, cy: 74 },
  { cx: 30, cy: 292 },
  { cx: 620, cy: 292 },
] as const

export const WORDMARK = { x: 44, y: 168, supertoneY: 208, lineY: 310 } as const

/**
 * The blank half of the fascia. The reference leaves it empty; this is where
 * the hero's own copy is printed, as if the machine had been ordered with it
 * silkscreened on. Type sizes are native units, so the block scales with the
 * machine like everything else that is printed on it.
 */
export const COPY_BLOCK = {
  x: 300,
  y: 64,
  w: 302,
  kicker: 14,
  headline: 30,
  line: 32,
  sub: 15,
  hint: 12,
} as const

/* -------------------------------------------------------------------------
 * Top strip: five caps, then a power LED standing on the edge
 * ---------------------------------------------------------------------- */

export type Cap = {
  x: number
  y: number
  w: number
  h: number
  label: string
  /** Second word on a wide cap (the reference prints SYNC and MIDI on one). */
  label2?: string
  tone: 'light' | 'orange' | 'green' | 'cream'
  /** Small jack marks printed above the labels (SYNC / MIDI only). */
  jacks?: boolean
  /** The reference prints these two as full-height symbols, not words. */
  big?: boolean
}

export const TOP_STRIP = { y: 18, h: 27 } as const

export const TOP_CAPS: readonly Cap[] = [
  { x: 44, y: 18, w: 104, h: 27, label: 'OUTPUT', tone: 'light' },
  { x: 216, y: 18, w: 86, h: 27, label: 'INPUT', tone: 'orange' },
  {
    x: 346,
    y: 18,
    w: 214,
    h: 27,
    label: 'SYNC',
    label2: 'MIDI',
    tone: 'green',
    jacks: true,
  },
  { x: 700, y: 18, w: 80, h: 27, label: 'USB', tone: 'cream' },
  { x: 815, y: 18, w: 105, h: 27, label: 'POWER', tone: 'cream' },
]

export const TOP_LED = { x: 864, w: 24, h: 20 } as const

/* -------------------------------------------------------------------------
 * Screen module. `SCREEN` is the lit area; `FRAME` is the dark green bezel
 * that holds it. The portal opens from `SCREEN`, so these two are the only
 * geometry the hook needs.
 * ---------------------------------------------------------------------- */

export const FRAME = { x: 0, y: 316, w: 952, h: 292, r: 6 } as const
export const SCREEN = { x: 15, y: 324, w: 922, h: 268, r: 4 } as const

/** Bezel screws: one on the screen's top edge, one on the frame's bottom. */
export const SCREWS = [
  { cx: 476, cy: 337 },
  { cx: 476, cy: 594 },
] as const

/* -------------------------------------------------------------------------
 * Console: the measured lattice
 * ---------------------------------------------------------------------- */

/** Four pad columns, four pad rows. Pitch is a hair over 129 either way. */
export const PAD_COLS = [174, 304, 435, 564] as const
export const PAD_ROWS = [757, 887, 1016, 1146] as const
export const PAD = { w: 84, h: 80, r: 9 } as const

/** Two control columns to the right of the pads. */
export const RIGHT_COLS = [693, 822] as const
export const RIGHT_W = 86

/** Small caps down the left edge. */
export const LEFT_BUTTONS = { x: 44, w: 122, h: 62, r: 6 } as const

/** Silkscreen section labels above the console, and their bracket rules. */
export const CONSOLE_LABELS = { y: 610, rule: 606 } as const

/** The two rows of live caps above pad row 1. */
export const LIVE_ROWS = [620, 666] as const
export const LIVE_H = 43

/** Where each parameter label row sits, and what it prints. */
export const PARAM_ROWS = [
  { y: 728, labels: ['', 'LEVEL', 'PITCH', 'TIME'] },
  { y: 858, labels: ['', 'LPF', 'HPF', '\u2192FX'] },
  { y: 988, labels: ['', 'ATK', 'REL', 'PAN'] },
  { y: 1118, labels: ['', 'TUNE', 'VEL', 'MOD'] },
] as const

/** Knobs: the white volume, the orange BPM, the green metronome. */
export const KNOBS = {
  volume: { cx: 105, cy: 650, r: 46, cap: 27, sweep: 140, tone: 'white' },
  bpm: { cx: 737, cy: 670, r: 52, cap: 26, sweep: 150, tone: 'orange' },
  swing: { cx: 868, cy: 670, r: 46, cap: 23, sweep: 70, tone: 'green' },
} as const

/** Fader: the slot the cap rides in, and the cap's travel. */
export const FADER = {
  cx: 87,
  slotY: 968,
  slotH: 280,
  capW: 40,
  capH: 44,
  capY: 1012,
  travel: 118,
} as const

/** Two loose LEDs under the right-hand columns, where the reference has them. */
export const LOOSE_LEDS = [
  { cx: 722, cy: 1136 },
  { cx: 752, cy: 1136 },
] as const

/* -------------------------------------------------------------------------
 * Pads: what is printed on each one
 * ---------------------------------------------------------------------- */

export type PadGlyph =
  | 'kit'
  | 'pattern'
  | 'blocks'
  | 'vinyl'
  | 'square'
  | 'zero'
  | 'digit'
  | 'text'

export type PadSpec = {
  /** Which lattice cell, [column, row]. */
  col: number
  row: number
  glyph: PadGlyph
  /** Digit for `glyph: 'digit'`, or the word for `glyph: 'text'`. */
  value?: string
  tone?: 'face' | 'orange' | 'green'
}

export const PADS: readonly PadSpec[] = [
  /* row 0 */
  { col: 0, row: 0, glyph: 'kit' },
  { col: 1, row: 0, glyph: 'digit', value: '7' },
  { col: 2, row: 0, glyph: 'digit', value: '8' },
  { col: 3, row: 0, glyph: 'digit', value: '9' },
  /* row 1 */
  { col: 0, row: 1, glyph: 'pattern' },
  { col: 1, row: 1, glyph: 'digit', value: '4' },
  { col: 2, row: 1, glyph: 'digit', value: '5' },
  { col: 3, row: 1, glyph: 'digit', value: '6' },
  /* row 2 */
  { col: 0, row: 2, glyph: 'blocks' },
  { col: 1, row: 2, glyph: 'digit', value: '1' },
  { col: 2, row: 2, glyph: 'digit', value: '2' },
  { col: 3, row: 2, glyph: 'digit', value: '3' },
  /* row 3 */
  { col: 0, row: 3, glyph: 'vinyl' },
  { col: 1, row: 3, glyph: 'square' },
  { col: 2, row: 3, glyph: 'zero' },
  { col: 3, row: 3, glyph: 'text', value: 'ENTER' },
]

/** The six live caps: cream over cream, cream over orange, cream over green. */
export const LIVE_CAPS: readonly Cap[] = [
  {
    x: PAD_COLS[0],
    y: LIVE_ROWS[0],
    w: PAD.w,
    h: LIVE_H,
    label: 'SOUND',
    tone: 'cream',
  },
  {
    x: PAD_COLS[1],
    y: LIVE_ROWS[0],
    w: PAD.w,
    h: LIVE_H,
    label: 'MAIN',
    tone: 'cream',
  },
  {
    x: PAD_COLS[2],
    y: LIVE_ROWS[0],
    w: PAD.w,
    h: LIVE_H,
    label: 'TEMPO',
    tone: 'cream',
  },
  {
    x: PAD_COLS[0],
    y: LIVE_ROWS[1],
    w: PAD.w,
    h: LIVE_H,
    label: 'EDIT',
    tone: 'light',
  },
  {
    x: PAD_COLS[1],
    y: LIVE_ROWS[1],
    w: PAD.w,
    h: LIVE_H,
    label: 'COMMIT',
    tone: 'orange',
  },
  {
    x: PAD_COLS[2],
    y: LIVE_ROWS[1],
    w: PAD.w,
    h: LIVE_H,
    label: 'LOOP',
    tone: 'green',
  },
]

/** Right-hand control caps, in their two columns and four bands. */
export const RIGHT_CAPS: readonly Cap[] = [
  {
    x: RIGHT_COLS[0],
    y: 754,
    w: RIGHT_W,
    h: 44,
    label: 'SAMPLE',
    tone: 'orange',
  },
  {
    x: RIGHT_COLS[0],
    y: 800,
    w: RIGHT_W,
    h: 44,
    label: 'CHOP',
    tone: 'orange',
  },
  {
    x: RIGHT_COLS[1],
    y: 754,
    w: RIGHT_W,
    h: 44,
    label: 'TIMING',
    tone: 'green',
  },
  {
    x: RIGHT_COLS[1],
    y: 800,
    w: RIGHT_W,
    h: 44,
    label: 'CORRECT',
    tone: 'green',
  },
  { x: RIGHT_COLS[0], y: 884, w: RIGHT_W, h: 44, label: 'FX', tone: 'cream' },
  {
    x: RIGHT_COLS[0],
    y: 930,
    w: RIGHT_W,
    h: 44,
    label: 'OUTPUT',
    tone: 'light',
  },
  {
    x: RIGHT_COLS[1],
    y: 884,
    w: RIGHT_W,
    h: 44,
    label: 'ERASE',
    tone: 'cream',
  },
  {
    x: RIGHT_COLS[1],
    y: 930,
    w: RIGHT_W,
    h: 44,
    label: 'SYSTEM',
    tone: 'light',
  },
  {
    x: RIGHT_COLS[0],
    y: PAD_ROWS[2],
    w: RIGHT_W,
    h: PAD.h,
    label: '\u2212',
    tone: 'cream',
  },
  {
    x: RIGHT_COLS[1],
    y: PAD_ROWS[2],
    w: RIGHT_W,
    h: PAD.h,
    label: '+',
    tone: 'cream',
  },
  {
    x: RIGHT_COLS[0],
    y: PAD_ROWS[3],
    w: RIGHT_W,
    h: PAD.h,
    label: 'RECORD',
    tone: 'orange',
  },
  {
    x: RIGHT_COLS[1],
    y: PAD_ROWS[3],
    w: RIGHT_W,
    h: PAD.h,
    label: 'PLAY',
    tone: 'green',
  },
]

/** The three caps down the left edge, with their labels. */
export const LEFT_CAPS: readonly Cap[] = [
  {
    x: LEFT_BUTTONS.x,
    y: 804,
    w: LEFT_BUTTONS.w,
    h: LEFT_BUTTONS.h,
    label: 'KEYS',
    tone: 'cream',
  },
  {
    x: LEFT_BUTTONS.x,
    y: 898,
    w: LEFT_BUTTONS.w,
    h: LEFT_BUTTONS.h,
    label: 'FADER',
    tone: 'cream',
  },
  {
    x: LEFT_BUTTONS.x,
    y: 1186,
    w: LEFT_BUTTONS.w,
    h: LEFT_BUTTONS.h,
    label: 'SHIFT',
    tone: 'light',
  },
]

/** Silkscreen words and the rules that group the controls under them. */
export const SILK_LABELS = [
  { text: 'VOLUME', x: 46, y: CONSOLE_LABELS.y, anchor: 'start' },
  { text: 'LIVE', x: 250, y: CONSOLE_LABELS.y, anchor: 'start' },
  { text: 'TEMPO', x: 448, y: CONSOLE_LABELS.y, anchor: 'start' },
  { text: 'BPM', x: 690, y: CONSOLE_LABELS.y, anchor: 'start' },
  { text: 'METRONOME', x: 800, y: CONSOLE_LABELS.y, anchor: 'start' },
] as const

export const SILK_RULES = [
  { d: `M174 ${CONSOLE_LABELS.rule} h${PAD.w}` },
  { d: `M304 ${CONSOLE_LABELS.rule} h${PAD.w}` },
  { d: `M435 ${CONSOLE_LABELS.rule} h${PAD.w}` },
  { d: `M${450 - 12} ${CONSOLE_LABELS.rule} h-14` },
  { d: `M${800 - 12} ${CONSOLE_LABELS.rule} h-58` },
] as const

/* -------------------------------------------------------------------------
 * Screen interior — the reference's own 922 x 268 window
 * ---------------------------------------------------------------------- */

/**
 * The screen's layout, in native units of the reference's 922 x 268 window.
 *
 * The glyph field and the six layer words are the reference's. The title, the
 * role line and the live readout sit on top of that texture: at 952 units to
 * the viewport, a 74-unit title lands near 110px on a 1440 screen, so the
 * screen finally carries the name at headline size rather than as a detail.
 */
export const SCREEN_UI = {
  w: SCREEN.w,
  h: SCREEN.h,
  pad: 26,
  /** Tiny print, reference-authentic: legible only as texture. */
  status: { y: 30, size: 16 },
  /** The name, on its own full-width row: the hero's headline. */
  title: { x: 26, y: 146, size: 86 },
  /** Who and where, under it. */
  role: { x: 26, y: 178, size: 21 },
  /** Four digits and the dot, the machine's own readout. */
  counter: { x: 700, y: 150, digit: 46, gap: 8, dot: 12 },
  /** The armed control, printed by the screen while it is hovered or focused. */
  readout: { x: 26, y: 216, size: 21 },
  /** Glyph field: the reference's texture, behind everything else. */
  field: { top: 8, cell: 26, gap: 10, cols: 25, rows: 7 },
  /** The layer words, in the order the reference prints them. */
  words: { x: 26, y: 252, size: 15, gap: 18, glyph: 20 },
} as const
