import {
  GW,
  LGAP,
  LH,
  LS,
  LW,
  ROWGAP,
  WIDE,
  glyphPath,
  glyphWidth,
  layoutPoster,
} from '@/components/ui/poster-glyphs'

const AZ = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

/** Endpoint coordinates of every segment, command-aware (arcs carry radii and
 *  flags in front of their endpoint). */
function endpoints(d: string): [number, number][] {
  const tokens = d.match(/[MLACZ]|-?[\d.]+/g) ?? []
  const out: [number, number][] = []
  let i = 0
  let cmd = ''
  const n = () => Number(tokens[i++])
  while (i < tokens.length) {
    if (/[MLACZ]/.test(tokens[i])) cmd = tokens[i++]
    if (cmd === 'Z') continue
    if (cmd === 'A') {
      i += 5
      out.push([n(), n()])
    } else if (cmd === 'C') {
      i += 4
      out.push([n(), n()])
    } else {
      out.push([n(), n()])
    }
  }
  return out
}

describe('glyphWidth', () => {
  it('sets I as a single stroke, a space as half a letter, and the wide letters wider', () => {
    expect(glyphWidth('I', 115, 22)).toBe(22)
    expect(glyphWidth(' ', 115, 22)).toBe(57.5)
    expect(glyphWidth('H', 115, 22)).toBe(115)
    for (const ch of Object.keys(WIDE)) {
      expect(glyphWidth(ch, 100, 10)).toBe(100 * WIDE[ch])
    }
    expect(glyphWidth('W', 100, 10)).toBeGreaterThan(glyphWidth('M', 100, 10))
  })
})

describe('glyphPath', () => {
  it('draws every capital', () => {
    for (const ch of AZ)
      expect(glyphPath(ch, 115, 230, 22).length).toBeGreaterThan(10)
  })

  it('draws nothing for what is not a capital', () => {
    for (const ch of ['a', '1', ' ', '#', ''])
      expect(glyphPath(ch, 115, 230, 22)).toBe('')
  })

  it('is made only of M, L, A, C and Z, with finite numbers', () => {
    for (const ch of AZ) {
      const d = glyphPath(ch, glyphWidth(ch, 115, 22), 230, 22)
      expect(d).toMatch(/^[MLACZ0-9.\s-]+$/)
      for (const [x, y] of endpoints(d)) {
        expect(Number.isFinite(x)).toBe(true)
        expect(Number.isFinite(y)).toBe(true)
      }
    }
  })

  it('stays in its box: the centre-line is inset by half the stroke, so a square cap fills the box exactly', () => {
    for (const ch of AZ) {
      const w = glyphWidth(ch, 115, 22)
      const d = glyphPath(ch, w, 230, 22)
      for (const [x, y] of endpoints(d)) {
        // The tail of Q is the one stroke that leaves the box on purpose.
        const slack = ch === 'Q' ? 22 : 0.2
        expect(x).toBeGreaterThanOrEqual(11 - slack)
        expect(x).toBeLessThanOrEqual(w - 11 + slack)
        expect(y).toBeGreaterThanOrEqual(11 - slack)
        expect(y).toBeLessThanOrEqual(230 - 11 + slack)
      }
    }
  })

  it('reaches both edges of the box in height, so every letter is cap height', () => {
    // A rounded letter's top or bottom is the middle of an arc, not an endpoint,
    // so only letters with a flat extreme can be checked by their endpoints.
    const roundTop = new Set(['C', 'G', 'O', 'Q', 'S'])
    const roundBottom = new Set(['C', 'G', 'J', 'O', 'Q', 'S', 'U'])
    for (const ch of AZ) {
      const w = glyphWidth(ch, 115, 22)
      const ys = endpoints(glyphPath(ch, w, 230, 22)).map((p) => p[1])
      if (!roundTop.has(ch)) expect(Math.min(...ys)).toBeCloseTo(11, 0)
      if (!roundBottom.has(ch)) expect(Math.max(...ys)).toBeCloseTo(230 - 11, 0)
    }
  })

  it('is deterministic', () => {
    expect(glyphPath('S', 115, 230, 22)).toBe(glyphPath('S', 115, 230, 22))
  })
})

describe('layoutPoster: AD [I] TYA / H [I] MAONE', () => {
  const L = layoutPoster(['AD', 'H'], 'I', ['TYA', 'MAONE'])
  const giant = L.cells.find((c) => c.giant)!
  const row = (r: number) =>
    L.cells.filter((c) => !c.giant && c.row === r).sort((a, b) => a.x - b.x)

  it('spells both names with the one shared I', () => {
    const spell = (r: number) => {
      const cells = row(r)
      const left = cells
        .filter((c) => c.x < giant.x)
        .map((c) => c.ch)
        .join('')
      const right = cells
        .filter((c) => c.x > giant.x)
        .map((c) => c.ch)
        .join('')
      return left + giant.ch + right
    }
    expect(spell(0)).toBe('ADITYA')
    expect(spell(1)).toBe('HIMAONE')
  })

  it('has twelve cells: thirteen letters, one of them shared', () => {
    expect(L.cells).toHaveLength(12)
    expect(L.cells.filter((c) => c.giant)).toHaveLength(1)
  })

  it('makes the giant letter as tall as both rows and the gap between them', () => {
    expect(giant.h).toBe(LH * 2 + ROWGAP)
    expect(giant.y).toBe(100)
    expect(giant.w).toBe(LS * 0 + 42) // an I is one stroke at the giant weight
  })

  it('hugs the giant letter from the left on both rows', () => {
    for (const r of [0, 1]) {
      const left = row(r).filter((c) => c.x < giant.x)
      const last = left[left.length - 1]
      expect(last.x + last.w + LGAP).toBeCloseTo(giant.x, 6)
    }
  })

  it('starts both right rows at the same x, after the gap the metronome stands in', () => {
    const starts = [0, 1].map((r) => row(r).filter((c) => c.x > giant.x)[0].x)
    expect(starts[0]).toBeCloseTo(starts[1], 6)
    expect(starts[0] - (giant.x + giant.w)).toBe(520)
  })

  it('keeps letters apart on a row, in order', () => {
    for (const r of [0, 1]) {
      const cells = row(r)
      for (let i = 1; i < cells.length; i += 1) {
        const prev = cells[i - 1]
        if (prev.x < giant.x && cells[i].x > giant.x) continue
        expect(cells[i].x).toBeGreaterThanOrEqual(prev.x + prev.w + LGAP - 1e-6)
      }
    }
  })

  it('is as wide as its margins and its longest right row say', () => {
    const rightEnd = Math.max(...L.cells.map((c) => c.x + c.w))
    expect(L.width).toBeCloseTo(rightEnd + L.margin, 6)
    expect(L.height).toBe(700)
  })

  it('has a narrower, tighter compact layout for tall screens', () => {
    const C = layoutPoster(['AD', 'H'], 'I', ['TYA', 'MAONE'], true)
    expect(C.width).toBeLessThan(L.width)
    expect(C.margin).toBeLessThan(L.margin)
    expect(C.charScale).toBeLessThan(1)
  })

  it('cleans what it is given', () => {
    const odd = layoutPoster(['a-d', 'h!'], 'i', ['t y a', 'maone'])
    expect(odd.cells.find((c) => c.giant)!.ch).toBe('I')
    expect(odd.cells.length).toBeGreaterThan(8)
  })

  it('has a default giant letter if given none', () => {
    expect(
      layoutPoster(['A', 'B'], '', ['C', 'D']).cells.find((c) => c.giant)!.ch,
    ).toBe('O')
  })

  it('uses the base metrics it exports', () => {
    expect(GW).toBeGreaterThan(LW)
  })
})
