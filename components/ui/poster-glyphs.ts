/**
 * A condensed monoline capital alphabet and a two-row poster layout.
 *
 * Adapted from the glyph engine of the Waving Portfolio Landing reference:
 * every letter is a *centre-line path* stroked with square caps, so it fills its
 * `[0, w] x [0, h]` box exactly at any stroke weight, and round letters are
 * stadiums, like the poster face it imitates. Because a glyph is a path and not
 * a font, there is nothing to load and nothing to wait for.
 *
 * No React and no DOM, so the geometry is testable on its own.
 */

/** Width of a letter relative to the base width; the rest are 1. */
export const WIDE: Record<string, number> = {
  A: 1.04,
  M: 1.3,
  N: 1.04,
  Q: 1.02,
  V: 1.04,
  W: 1.44,
  X: 1.02,
}

/** Advance width of a glyph. `I` is a single stroke; a space is half a letter. */
export function glyphWidth(ch: string, w: number, s: number): number {
  if (ch === 'I') return s
  if (ch === ' ') return w * 0.5
  return w * (WIDE[ch] ?? 1)
}

/** The centre-line path of `ch` in a `w` x `h` box, for stroke width `s`. */
export function glyphPath(ch: string, w: number, h: number, s: number): string {
  const i = s / 2
  const x0 = i
  const x1 = w - i
  const y0 = i
  const y1 = h - i
  const xm = w / 2
  const ym = h / 2
  const bw = x1 - x0
  const bh = y1 - y0
  const r = bw / 2
  const c = Math.min(bw * 0.62, bh / 4)
  const q = (...parts: (string | number)[]) =>
    parts
      .map((p) => (typeof p === 'number' ? String(Math.round(p * 10) / 10) : p))
      .join(' ')
  const arc = (rad: number, sweep: 0 | 1, x: number, y: number) =>
    q('A', rad, rad, 0, 0, sweep, x, y)
  const stadium =
    q('M', x0, y0 + r) +
    arc(r, 1, x1, y0 + r) +
    q('L', x1, y1 - r) +
    arc(r, 1, x0, y1 - r) +
    'Z'
  const open =
    q('M', x1, y0 + r) +
    arc(r, 0, x0, y0 + r) +
    q('L', x0, y1 - r) +
    arc(r, 0, x1, y1 - r)
  const bowl = (yb: number) => {
    const k = Math.min(c, (yb - y0) / 2)
    return (
      q('M', x0, y1, 'L', x0, y0, 'L', x1 - k, y0) +
      arc(k, 1, x1, y0 + k) +
      q('L', x1, yb - k) +
      arc(k, 1, x1 - k, yb) +
      q('L', x0, yb)
    )
  }
  switch (ch) {
    case 'A': {
      const ay = y0 + bh * 0.64
      const t = (y1 - ay) / bh
      return q(
        'M',
        x0,
        y1,
        'L',
        xm,
        y0,
        'L',
        x1,
        y1,
        'M',
        x0 + (xm - x0) * t,
        ay,
        'L',
        x1 - (x1 - xm) * t,
        ay,
      )
    }
    case 'B': {
      const yb = y0 + bh * 0.47
      const xt = x1 - s * 0.4
      const ct = Math.min(c, (yb - y0) / 2, xt - x0)
      const cb = Math.min(c, (y1 - yb) / 2, bw)
      return (
        q('M', x0, yb, 'L', xt - ct, yb) +
        arc(ct, 0, xt, yb - ct) +
        q('L', xt, y0 + ct) +
        arc(ct, 0, xt - ct, y0) +
        q('L', x0, y0, 'L', x0, y1, 'L', x1 - cb, y1) +
        arc(cb, 0, x1, y1 - cb) +
        q('L', x1, yb + cb) +
        arc(cb, 0, x1 - cb, yb) +
        q('L', x0, yb)
      )
    }
    case 'C':
      return open
    case 'D': {
      const k = Math.min(bw * 0.75, bh / 2)
      return (
        q('M', x0, y0, 'L', x1 - k, y0) +
        arc(k, 1, x1, y0 + k) +
        q('L', x1, y1 - k) +
        arc(k, 1, x1 - k, y1) +
        q('L', x0, y1) +
        'Z'
      )
    }
    case 'E':
      return q(
        'M',
        x1,
        y0,
        'L',
        x0,
        y0,
        'L',
        x0,
        y1,
        'L',
        x1,
        y1,
        'M',
        x0,
        ym,
        'L',
        x1 - bw * 0.12,
        ym,
      )
    case 'F':
      return q(
        'M',
        x1,
        y0,
        'L',
        x0,
        y0,
        'L',
        x0,
        y1,
        'M',
        x0,
        ym - bh * 0.02,
        'L',
        x1 - bw * 0.12,
        ym - bh * 0.02,
      )
    case 'G':
      return open + q('L', x1, ym + bh * 0.04, 'L', xm, ym + bh * 0.04)
    case 'H':
      return q(
        'M',
        x0,
        y0,
        'L',
        x0,
        y1,
        'M',
        x1,
        y0,
        'L',
        x1,
        y1,
        'M',
        x0,
        ym,
        'L',
        x1,
        ym,
      )
    case 'I':
      return q('M', xm, y0, 'L', xm, y1)
    case 'J':
      return (
        q('M', x1, y0, 'L', x1, y1 - r) +
        arc(r, 1, x0, y1 - r) +
        q('L', x0, y1 - r - bh * 0.06)
      )
    case 'K':
      return q(
        'M',
        x0,
        y0,
        'L',
        x0,
        y1,
        'M',
        x1,
        y0,
        'L',
        x0,
        y0 + bh * 0.62,
        'M',
        x0 + bw * 0.28,
        y0 + bh * 0.47,
        'L',
        x1,
        y1,
      )
    case 'L':
      return q('M', x0, y0, 'L', x0, y1, 'L', x1, y1)
    case 'M':
      return q(
        'M',
        x0,
        y1,
        'L',
        x0,
        y0,
        'L',
        xm,
        y0 + bh * 0.55,
        'L',
        x1,
        y0,
        'L',
        x1,
        y1,
      )
    case 'N':
      return q('M', x0, y1, 'L', x0, y0, 'L', x1, y1, 'L', x1, y0)
    case 'O':
      return stadium
    case 'P':
      return bowl(y0 + bh * 0.52)
    case 'Q':
      return (
        stadium +
        q('M', xm + bw * 0.1, y1 - bh * 0.16, 'L', x1 + s * 0.2, y1 + s * 0.3)
      )
    case 'R':
      return (
        bowl(y0 + bh * 0.5) + q('M', x0 + bw * 0.42, y0 + bh * 0.5, 'L', x1, y1)
      )
    case 'S':
      return (
        q('M', x1, y0 + r) +
        arc(r, 0, x0, y0 + r) +
        q('C', x0, ym - bh * 0.02, x1, ym + bh * 0.02, x1, y1 - r) +
        arc(r, 1, x0, y1 - r)
      )
    case 'T':
      return q('M', x0, y0, 'L', x1, y0, 'M', xm, y0, 'L', xm, y1)
    case 'U':
      return (
        q('M', x0, y0, 'L', x0, y1 - r) + arc(r, 0, x1, y1 - r) + q('L', x1, y0)
      )
    case 'V':
      return q('M', x0, y0, 'L', xm, y1, 'L', x1, y0)
    case 'W': {
      const k = bw * 0.24
      return q(
        'M',
        x0,
        y0,
        'L',
        x0 + k,
        y1,
        'L',
        xm,
        y0 + bh * 0.3,
        'L',
        x1 - k,
        y1,
        'L',
        x1,
        y0,
      )
    }
    case 'X':
      return q('M', x0, y0, 'L', x1, y1, 'M', x1, y0, 'L', x0, y1)
    case 'Y':
      return q(
        'M',
        x0,
        y0,
        'L',
        xm,
        ym - bh * 0.04,
        'L',
        x1,
        y0,
        'M',
        xm,
        ym - bh * 0.04,
        'L',
        xm,
        y1,
      )
    case 'Z':
      return q('M', x0, y0, 'L', x1, y0, 'L', x0, y1, 'L', x1, y1)
    default:
      return ''
  }
}

/* ── The poster ─────────────────────────────────────────────────────────────
   Two rows sharing one giant letter:  AD [I] TYA / H [I] MAONE. Left rows hug
   the giant letter; right rows start after the gap the metronome stands in. */

export type Cell = {
  ch: string
  x: number
  y: number
  w: number
  h: number
  s: number
  row: number
  giant: boolean
}

export const LH = 230 // letter height
export const LW = 115 // base letter width
export const LS = 22 // stroke
export const LGAP = 30 // letter spacing
export const ROWGAP = 20
export const GW = 220 // giant letter base width
export const GS = 42 // giant stroke
export const MARGIN = 100
export const CHAR_GAP = 520 // room between the giant letter and the right rows
export const TOP = 100
export const POSTER_H = 700

/** Capitals and spaces only. */
export const cleanRow = (s: string) =>
  s
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .trim()

export function rowWidth(str: string): number {
  let t = 0
  ;[...str].forEach((ch, i) => {
    t += glyphWidth(ch, LW, LS) + (i ? LGAP : 0)
  })
  return t
}

/**
 * Where every letter goes. `compact` is for tall containers: a tighter gap and a
 * smaller centrepiece, so the poster can fill a phone's width instead of
 * floating in the middle of it.
 */
export function layoutPoster(
  left: readonly string[],
  giant: string,
  right: readonly string[],
  compact = false,
) {
  const margin = compact ? 30 : MARGIN
  const charGap = compact ? 390 : CHAR_GAP
  const charScale = compact ? 0.84 : 1
  const l = [cleanRow(left[0] ?? ''), cleanRow(left[1] ?? '')]
  const r = [cleanRow(right[0] ?? ''), cleanRow(right[1] ?? '')]
  const g = cleanRow(giant).replace(/ /g, '').slice(0, 1) || 'O'
  const lw = Math.max(rowWidth(l[0]), rowWidth(l[1]))
  const rw = Math.max(rowWidth(r[0]), rowWidth(r[1]))
  const cells: Cell[] = []
  const place = (str: string, x0: number, row: number) => {
    let x = x0
    for (const ch of str) {
      const w = glyphWidth(ch, LW, LS)
      if (ch !== ' ') {
        cells.push({
          ch,
          x,
          y: TOP + row * (LH + ROWGAP),
          w,
          h: LH,
          s: LS,
          row,
          giant: false,
        })
      }
      x += w + LGAP
    }
  }
  l.forEach((row, i) => place(row, margin + lw - rowWidth(row), i))
  const gx = margin + lw + (lw ? LGAP : 0)
  const gw = g === 'I' ? GS : GW * (WIDE[g] ?? 1)
  const gapStart = gx + gw
  const rx = gapStart + charGap
  r.forEach((row, i) => place(row, rx, i))
  cells.push({
    ch: g,
    x: gx,
    y: TOP,
    w: gw,
    h: LH * 2 + ROWGAP,
    s: GS,
    row: 0,
    giant: true,
  })
  const width = rx + rw + margin
  return {
    cells,
    width,
    height: POSTER_H,
    margin,
    charScale,
    gapStart,
    charX: gapStart + charGap * 0.36,
    bottom: TOP + LH * 2 + ROWGAP,
  }
}
