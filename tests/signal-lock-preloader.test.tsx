import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import SignalLockPreloader, {
  ADVANCE,
  CELL_H,
  CELL_W,
  GLYPHS,
  LANES,
  NAME_LINES,
  REDUCED_MS,
  REEL_DECOYS,
  RULE_H,
  RULE_W,
  TIMECODE,
  TIMELINE,
  hash,
  layoutName,
  reelStrip,
  ruleLine,
  ruleTicks,
  scrambleAt,
  timelineEnd,
} from '@/components/ui/signal-lock-preloader'
;(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

/* ── The schedule: the numbers in the brief, asserted ───────────────────── */

describe('TIMELINE', () => {
  it('is 1.4s, and nothing in it runs past that', () => {
    expect(TIMELINE.total).toBe(1400)
    expect(timelineEnd()).toBeLessThanOrEqual(TIMELINE.total)
    // The shutter is the last thing to finish and finishes exactly on time.
    expect(timelineEnd()).toBe(TIMELINE.total)
  })

  it('stage 1: the playhead sweeps from 0 to 600ms', () => {
    expect(TIMELINE.sweep).toEqual({ start: 0, duration: 600 })
  })

  it('stage 2: the decode lives inside 150–950ms, reels and timecode alike', () => {
    const { cells } = layoutName()
    const firstStart = Math.min(...cells.map((c) => c.delay))
    const lastEnd =
      Math.max(...cells.map((c) => c.delay)) + TIMELINE.reel.duration
    expect(firstStart).toBeGreaterThanOrEqual(150)
    expect(lastEnd).toBeLessThanOrEqual(950)
    expect(TIMELINE.scramble).toEqual({ start: 150, end: 950 })
    expect(TIMELINE.rules.start).toBe(150)
    expect(TIMELINE.rules.start + TIMELINE.rules.duration).toBeLessThanOrEqual(
      950,
    )
  })

  it('stage 3: the thump and the shutter start at 1000ms, 50ms apart, and end at 1400', () => {
    expect(TIMELINE.thump.start).toBe(1000)
    expect(TIMELINE.shutter.start).toBe(1000)
    expect(TIMELINE.shutter.stagger).toBe(50)
    const last =
      TIMELINE.shutter.start +
      (LANES.length - 1) * TIMELINE.shutter.stagger +
      TIMELINE.shutter.duration
    expect(last).toBe(1400)
  })

  it('has the reduced-motion beat well under the full sequence', () => {
    expect(REDUCED_MS).toBeLessThan(TIMELINE.total / 2)
  })

  it('locks the lamps as the decode lands, not before it starts', () => {
    expect(TIMELINE.lock.start).toBeGreaterThan(TIMELINE.scramble.start)
    expect(TIMELINE.lock.start).toBeLessThanOrEqual(TIMELINE.scramble.end)
  })
})

/* ── The glyphs ─────────────────────────────────────────────────────────── */

/** Every coordinate a path touches, so a glyph can be checked against its cell. */
function points(d: string): [number, number][] {
  const out: [number, number][] = []
  let x = 0
  let y = 0
  const tokens = d.match(/[MLHVCZ]|-?[\d.]+/g) ?? []
  let i = 0
  let cmd = ''
  const num = () => Number(tokens[i++])
  while (i < tokens.length) {
    if (/[MLHVCZ]/.test(tokens[i])) cmd = tokens[i++]
    if (cmd === 'Z') continue
    if (cmd === 'H') {
      x = num()
      out.push([x, y])
    } else if (cmd === 'V') {
      y = num()
      out.push([x, y])
    } else if (cmd === 'C') {
      for (let k = 0; k < 3; k += 1) {
        x = num()
        y = num()
        out.push([x, y])
      }
    } else {
      x = num()
      y = num()
      out.push([x, y])
    }
  }
  return out
}

describe('the monoline alphabet', () => {
  const letters = [...new Set(NAME_LINES.join(''))]

  it('has a glyph for every letter of the name', () => {
    for (const ch of letters) expect(GLYPHS[ch]).toBeTruthy()
  })

  it('is strokes only: commands and numbers, nothing else', () => {
    for (const d of Object.values(GLYPHS))
      expect(d).toMatch(/^[MLHVCZ0-9.\s-]+$/)
  })

  it('stays inside its cell', () => {
    for (const [ch, d] of Object.entries(GLYPHS)) {
      for (const [x, y] of points(d)) {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(CELL_W)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThanOrEqual(CELL_H)
      }
      // And spans the cell's height, so every letter is cap height.
      const ys = points(d).map((p) => p[1])
      expect(Math.min(...ys)).toBe(0)
      expect(Math.max(...ys)).toBe(CELL_H)
      expect(ch.length).toBe(1)
    }
  })
})

describe('layoutName', () => {
  const name = layoutName()

  it('lays out every letter of both lines', () => {
    expect(name.cells).toHaveLength(NAME_LINES.join('').length)
    expect(NAME_LINES.join('')).toBe('ADITYAHIMAONE')
  })

  it('keeps letters apart and in order along each line', () => {
    for (const line of [0, 1]) {
      const row = name.cells.filter((c) => c.line === line)
      for (let i = 1; i < row.length; i += 1) {
        expect(row[i].x - row[i - 1].x).toBe(ADVANCE)
      }
    }
  })

  it('centres the shorter line on the longer one', () => {
    const first = name.cells.filter((c) => c.line === 0)
    const second = name.cells.filter((c) => c.line === 1)
    const mid = (row: typeof first) =>
      (row[0].x + row[row.length - 1].x + CELL_W) / 2
    expect(mid(first)).toBeCloseTo(mid(second), 6)
    expect(mid(second)).toBeCloseTo(name.width / 2, 6)
  })

  it('fires reels left to right, at the pace of the playhead', () => {
    const sorted = [...name.cells].sort((a, b) => a.x - b.x)
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].delay).toBeGreaterThanOrEqual(sorted[i - 1].delay)
    }
  })
})

describe('reel timing', () => {
  it('is a straight function of horizontal position: same x, same start', () => {
    const { cells, width } = layoutName()
    for (const a of cells) {
      for (const b of cells) {
        if (a.x === b.x) expect(a.delay).toBe(b.delay)
      }
    }
    // The leftmost letter starts first and the rightmost last.
    const left = cells.reduce((m, c) => (c.x < m.x ? c : m))
    const right = cells.reduce((m, c) => (c.x > m.x ? c : m))
    expect(left.delay).toBeLessThan(right.delay)
    expect(right.delay).toBeLessThanOrEqual(150 + 400)
    expect(width).toBe(7 * ADVANCE - (ADVANCE - CELL_W))
  })
})

describe('reelStrip', () => {
  it('rolls through decoys and lands on the real letter', () => {
    const strip = reelStrip('M', 4)
    expect(strip).toHaveLength(REEL_DECOYS + 1)
    expect(strip[strip.length - 1]).toBe('M')
  })

  it('never repeats a glyph back to back, so every step of the roll is visible', () => {
    for (const [i, ch] of [...NAME_LINES.join('')].entries()) {
      const strip = reelStrip(ch, i)
      for (let k = 1; k < strip.length; k += 1)
        expect(strip[k]).not.toBe(strip[k - 1])
    }
  })

  it('uses only glyphs that exist, and is the same every time', () => {
    for (const key of reelStrip('A', 0)) expect(GLYPHS[key]).toBeTruthy()
    expect(reelStrip('E', 12)).toEqual(reelStrip('E', 12))
  })

  it('hashes stably', () => {
    expect(hash(1, 2, 3)).toBe(hash(1, 2, 3))
    expect(hash(1, 2, 3)).not.toBe(hash(3, 2, 1))
  })
})

describe('the rulers', () => {
  const ticks = (d: string) => d.match(/M[\d.]+ [\d.]+ V[\d.-]+/g) ?? []

  it('draws a baseline across the whole width, on the screen-side edge', () => {
    expect(ruleLine('top')).toBe(`M0 ${RULE_H - 2} H${RULE_W}`)
    expect(ruleLine('bottom')).toBe(`M0 2 H${RULE_W}`)
  })

  it('has a tick every 10 units, longer every 100, growing into the page', () => {
    for (const edge of ['top', 'bottom'] as const) {
      const list = ticks(ruleTicks(edge))
      expect(list).toHaveLength(RULE_W / 10 + 1)
      const len = (t: string) => {
        const [, y0, y1] = /M[\d.]+ ([\d.]+) V([\d.-]+)/.exec(t)!
        return Math.abs(Number(y1) - Number(y0))
      }
      list.forEach((t, i) => expect(len(t)).toBe(i % 10 === 0 ? 14 : 6))
      const ys = list.map((t) => Number(/V([\d.-]+)/.exec(t)![1]))
      const base = edge === 'top' ? RULE_H - 2 : 2
      for (const y of ys) {
        if (edge === 'top') expect(y).toBeLessThan(base)
        else expect(y).toBeGreaterThan(base)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThanOrEqual(RULE_H)
      }
    }
  })
})

describe('scrambleAt', () => {
  it('is the target, exactly, at progress 1 (and past it)', () => {
    expect(scrambleAt(TIMECODE, 1, 7)).toBe(TIMECODE)
    expect(scrambleAt(TIMECODE, 5, 7)).toBe(TIMECODE)
  })

  it('keeps the shape of the line at every moment: same length, same punctuation', () => {
    for (let p = 0; p <= 1; p += 0.05) {
      const out = scrambleAt(TIMECODE, p, 3)
      expect(out).toHaveLength(TIMECODE.length)
      for (let i = 0; i < TIMECODE.length; i += 1) {
        if (!/[0-9A-Z]/.test(TIMECODE[i])) expect(out[i]).toBe(TIMECODE[i])
      }
    }
  })

  it('keeps a digit a digit and a letter a letter while it is noise', () => {
    const out = scrambleAt(TIMECODE, 0, 11)
    for (let i = 0; i < TIMECODE.length; i += 1) {
      if (/[0-9]/.test(TIMECODE[i])) expect(out[i]).toMatch(/[0-9]/)
      if (/[A-Z]/.test(TIMECODE[i])) expect(out[i]).toMatch(/[A-Z]/)
    }
  })

  it('resolves left to right and never un-resolves', () => {
    let resolved = 0
    for (let p = 0; p <= 1; p += 0.02) {
      const out = scrambleAt(TIMECODE, p, 5)
      let n = 0
      while (n < TIMECODE.length && out[n] === TIMECODE[n]) n += 1
      expect(n).toBeGreaterThanOrEqual(
        Math.floor(Math.min(1, p) * TIMECODE.length) - 1,
      )
      // The settled prefix only grows (noise may coincide by chance, so test
      // the guaranteed part).
      const guaranteed = Math.floor(p * TIMECODE.length)
      expect(guaranteed).toBeGreaterThanOrEqual(resolved)
      resolved = guaranteed
    }
  })

  it('is the same for the same frame and changes between frames', () => {
    expect(scrambleAt(TIMECODE, 0.3, 9)).toBe(scrambleAt(TIMECODE, 0.3, 9))
    const frames = new Set(
      Array.from({ length: 12 }, (_, f) => scrambleAt(TIMECODE, 0.2, f)),
    )
    expect(frames.size).toBeGreaterThan(6)
  })

  it('treats a bad progress as the start', () => {
    expect(scrambleAt(TIMECODE, Number.NaN, 1)).toBe(scrambleAt(TIMECODE, 0, 1))
    expect(scrambleAt(TIMECODE, -3, 1)).toBe(scrambleAt(TIMECODE, 0, 1))
  })
})

/* ── The component ──────────────────────────────────────────────────────── */

function mockReduced(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: matches && query.includes('reduce'),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  })
}

describe('<SignalLockPreloader />', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    jest.useFakeTimers()
    mockReduced(false)
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    jest.useRealTimers()
  })

  const mount = (props: Parameters<typeof SignalLockPreloader>[0] = {}) =>
    act(() => root.render(<SignalLockPreloader {...props} />))
  const overlay = () => host.firstElementChild as HTMLElement | null

  it('is a fixed, inert, contained overlay that hides itself from assistive tech', () => {
    mount()
    const el = overlay()!
    expect(el).not.toBeNull()
    for (const c of ['fixed', 'inset-0', 'z-50', 'pointer-events-none']) {
      expect(el.className).toContain(c)
    }
    expect(el.style.contain).toBe('strict')
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('draws three lanes with their labels and colours', () => {
    mount()
    const text = host.textContent ?? ''
    for (const lane of LANES) expect(text).toContain(lane.label)
    expect(LANES.map((l) => l.color)).toEqual(['#10B981', '#3B82F6', '#F59E0B'])
  })

  it('sets the paper and the ink', () => {
    mount()
    expect(overlay()!.style.getPropertyValue('--paper')).toBe('#EAE6DF')
    expect(overlay()!.style.getPropertyValue('--ink')).toBe('#141414')
  })

  it('hands the whole schedule to the stylesheet as custom properties', () => {
    mount()
    const style = overlay()!.style
    expect(style.getPropertyValue('--t-sweep')).toBe('600ms')
    expect(style.getPropertyValue('--t-shutter-start')).toBe('1000ms')
    expect(style.getPropertyValue('--t-shutter-stagger')).toBe('50ms')
    expect(style.getPropertyValue('--t-thump-start')).toBe('1000ms')
  })

  it('builds one reel per letter, each with its own start and distance', () => {
    mount()
    const reels = host.querySelectorAll<SVGGElement>('g[style*="--dist"]')
    expect(reels).toHaveLength(13)
    for (const reel of reels) {
      expect(reel.style.getPropertyValue('--dist')).toBe(
        `${REEL_DECOYS * 18}px`,
      )
      expect(
        parseInt(reel.style.getPropertyValue('--delay'), 10),
      ).toBeGreaterThanOrEqual(150)
    }
  })

  it('draws two rulers whose baselines use pathLength 1', () => {
    mount()
    const svgs = [...host.querySelectorAll('svg')].filter(
      (s) => s.getAttribute('viewBox') === `0 0 ${RULE_W} ${RULE_H}`,
    )
    expect(svgs).toHaveLength(2)
    for (const svg of svgs) {
      expect(
        svg.querySelectorAll('path[pathLength="1"]').length,
      ).toBeGreaterThanOrEqual(2)
    }
  })

  it('starts the timecode as noise of the right length and decodes it to LOCKED', () => {
    mount()
    const span = host.querySelector('p span')!
    expect(span.textContent).toHaveLength(TIMECODE.length)
    expect(span.textContent).not.toBe(TIMECODE)
    act(() => {
      jest.advanceTimersByTime(TIMELINE.scramble.end + 50)
    })
    expect(host.querySelector('p span')!.textContent).toBe(TIMECODE)
    expect(host.querySelector('p span')!.textContent).toContain('LOCKED')
  })

  it('ends at 1400ms: present at 1399, gone at 1400, onComplete once', () => {
    const onComplete = jest.fn()
    mount({ onComplete })
    act(() => {
      jest.advanceTimersByTime(1399)
    })
    expect(overlay()).not.toBeNull()
    expect(onComplete).not.toHaveBeenCalled()
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(overlay()).toBeNull()
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('calls the latest onComplete without restarting the clock', () => {
    const first = jest.fn()
    const second = jest.fn()
    mount({ onComplete: first })
    act(() => {
      jest.advanceTimersByTime(700)
    })
    mount({ onComplete: second })
    act(() => {
      jest.advanceTimersByTime(699)
    })
    expect(overlay()).not.toBeNull()
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('does nothing after it is unmounted', () => {
    const onComplete = jest.fn()
    mount({ onComplete })
    act(() => root.unmount())
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(onComplete).not.toHaveBeenCalled()
    root = createRoot(host)
  })

  it('merges a className over the defaults', () => {
    mount({ className: 'z-[100]' })
    expect(overlay()!.className).toContain('z-[100]')
    expect(overlay()!.className).not.toContain('z-50')
  })
})

describe('<SignalLockPreloader /> with reduced motion', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    jest.useFakeTimers()
    mockReduced(true)
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  })
  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    jest.useRealTimers()
    mockReduced(false)
  })

  it('shows the resolved poster at once, with no decode', () => {
    act(() => root.render(<SignalLockPreloader />))
    expect(host.firstElementChild!.getAttribute('data-reduced')).toBe('true')
    act(() => {
      jest.advanceTimersByTime(0)
    })
    expect(host.querySelector('p span')!.textContent).toBe(TIMECODE)
  })

  it('is over in the short beat, not 1.4s', () => {
    const onComplete = jest.fn()
    act(() => root.render(<SignalLockPreloader onComplete={onComplete} />))
    act(() => {
      jest.advanceTimersByTime(REDUCED_MS - 1)
    })
    expect(onComplete).not.toHaveBeenCalled()
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(host.firstElementChild).toBeNull()
  })
})
