import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { LGAP, LW, layoutPoster } from '@/components/ui/poster-glyphs'
import SignalStormPreloader, {
  LABELS,
  PALETTE,
  PANELS,
  POSTER,
  STORM_REDUCED_MS,
  STORM_ROWS,
  STORM_TIMELINE,
  STORM_TONES,
  STORM_WORDS,
  cellDelay,
  reelFor,
  stormEnd,
  stormRow,
} from '@/components/ui/signal-storm-preloader'
;(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const T = STORM_TIMELINE

describe('STORM_TIMELINE', () => {
  it('ends exactly at the total, and nothing runs past it', () => {
    expect(stormEnd()).toBe(T.total)
    expect(T.total).toBe(2800)
  })

  it('shutters the storm away before the giant letter lands', () => {
    const lastShutter =
      T.storm.shutterStart +
      (STORM_ROWS - 1) * T.storm.shutterStagger +
      T.storm.shutterDuration
    expect(lastShutter).toBeLessThanOrEqual(T.thump.start)
  })

  it('has the ordinary letters landed before the giant one thumps the poster', () => {
    const L = layoutPoster(POSTER.left, POSTER.giant, POSTER.right)
    for (const cell of L.cells.filter((c) => !c.giant)) {
      expect(cellDelay(cell, L.width) + T.reel.duration).toBeLessThanOrEqual(
        T.thump.start,
      )
    }
    expect(T.giant.start + T.giant.duration).toBeLessThanOrEqual(T.thump.start)
  })

  it('draws the rules and decodes the labels once the poster has landed', () => {
    expect(T.rules.start).toBeGreaterThanOrEqual(T.thump.start)
    expect(T.scramble.start).toBeLessThan(T.rules.start + T.rules.duration)
    expect(T.scramble.end).toBeLessThanOrEqual(T.leave.start)
  })

  it('lets the metronome finish rising before it ticks, and tick for a full beat before the poster leaves', () => {
    expect(T.tick.start).toBeGreaterThanOrEqual(
      T.metronome.start + T.metronome.duration,
    )
    expect(T.leave.start - T.tick.start).toBeGreaterThanOrEqual(
      T.tick.period / 2,
    )
  })

  it('does not take the poster away before everything on it has finished', () => {
    const contentEnds = [
      T.rules.start + T.rules.stagger + T.rules.duration,
      T.corners.start + T.corners.stagger + T.corners.duration,
      T.metronome.start + T.metronome.duration,
      T.scramble.end,
      T.thump.start + T.thump.duration,
    ]
    for (const end of contentEnds)
      expect(end).toBeLessThanOrEqual(T.leave.start)
  })

  it('opens the lanes after the poster has begun to leave, 50ms apart', () => {
    expect(T.panels.start).toBeGreaterThan(T.leave.start)
    expect(T.panels.stagger).toBe(50)
    expect(
      T.panels.start + (PANELS - 1) * T.panels.stagger + T.panels.duration,
    ).toBe(T.total)
  })

  it('ticks at 120 BPM: two beats, one at each extreme, in a second', () => {
    expect(T.tick.period).toBe(1000)
  })

  it('has a reduced-motion beat well under the full sequence', () => {
    expect(STORM_REDUCED_MS).toBeLessThan(T.total / 2)
  })
})

describe('the storm', () => {
  it('is the same every time', () => {
    expect(stormRow(3)).toEqual(stormRow(3))
  })

  it('lays studio words end to end, as capitals only, in order along the row', () => {
    const words = STORM_WORDS.join('')
    for (let row = 0; row < STORM_ROWS; row += 1) {
      const { glyphs } = stormRow(row)
      expect(glyphs.length).toBeGreaterThan(20)
      for (const g of glyphs) expect(words).toContain(g.ch)
      for (let i = 1; i < glyphs.length; i += 1) {
        expect(glyphs[i].x).toBeGreaterThan(glyphs[i - 1].x)
      }
    }
  })

  it('is longer than it is asked to be, so a screen of it is never short', () => {
    for (const minSpan of [1200, 2600, 4000]) {
      expect(stormRow(0, minSpan).span).toBeGreaterThanOrEqual(minSpan)
    }
  })

  it('has span equal to one whole copy, so a half-width marquee loops seamlessly', () => {
    const { glyphs, span } = stormRow(2)
    const last = glyphs[glyphs.length - 1]
    // One copy ends after its last glyph, its gap, and the space between words.
    expect(span).toBeGreaterThan(last.x + last.w)
    expect(span - (last.x + last.w)).toBeLessThan(120)
  })

  it('cycles the tones: colours of the lanes, solid and outlined', () => {
    expect(STORM_TONES).toHaveLength(7)
    expect(STORM_TONES.map((t) => t.color)).toEqual(
      expect.arrayContaining([
        PALETTE.accent,
        PALETTE.ink,
        PALETTE.green,
        PALETTE.blue,
        PALETTE.amber,
      ]),
    )
    expect(STORM_TONES.some((t) => t.hollow)).toBe(true)
    expect(STORM_TONES.some((t) => !t.hollow)).toBe(true)
    expect(stormRow(7).tone).toEqual(stormRow(0).tone)
  })
})

describe('the reels', () => {
  const L = layoutPoster(POSTER.left, POSTER.giant, POSTER.right)

  it('roll through one fewer decoy than the strip is long, all capitals', () => {
    for (const [i, cell] of L.cells.entries()) {
      const decoys = reelFor(cell, i, cell.giant ? 14 : 10)
      expect(decoys).toHaveLength(cell.giant ? 13 : 9)
      for (const d of decoys) {
        expect(d.ch).toMatch(/^[A-Z]$/)
        expect(d.w).toBeLessThanOrEqual(cell.w * 1.25)
      }
    }
  })

  it('are deterministic, and different for different cells', () => {
    const [a, b] = L.cells
    expect(reelFor(a, 0, 10)).toEqual(reelFor(a, 0, 10))
    expect(reelFor(a, 0, 10)).not.toEqual(reelFor(b, 1, 10))
  })

  it('start left to right, row by row, with the giant letter last', () => {
    const letters = L.cells.filter((c) => !c.giant)
    const row0 = letters.filter((c) => c.row === 0).sort((a, b) => a.x - b.x)
    for (let i = 1; i < row0.length; i += 1) {
      expect(cellDelay(row0[i], L.width)).toBeGreaterThanOrEqual(
        cellDelay(row0[i - 1], L.width),
      )
    }
    const same = (r: number) => letters.filter((c) => c.row === r)[0]
    expect(cellDelay(same(1), L.width)).toBeGreaterThan(
      cellDelay(same(0), L.width) - 1,
    )
    const giant = L.cells.find((c) => c.giant)!
    expect(cellDelay(giant, L.width)).toBe(T.giant.start)
    for (const cell of letters)
      expect(cellDelay(cell, L.width)).toBeGreaterThanOrEqual(T.reel.start)
  })
})

describe('the content', () => {
  it('spells the name from the poster', () => {
    expect(POSTER.left[0] + POSTER.giant + POSTER.right[0]).toBe('ADITYA')
    expect(POSTER.left[1] + POSTER.giant + POSTER.right[1]).toBe('HIMAONE')
  })

  it('keeps the labels as capitals and digits, so the decode keeps their shape', () => {
    for (const label of Object.values(LABELS))
      expect(label).toMatch(/^[A-Z0-9 /+:-]+$/)
  })

  it('uses a gap that is wider than one letter, for the metronome', () => {
    expect(LW + LGAP).toBeLessThan(520)
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

describe('<SignalStormPreloader />', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    jest.useFakeTimers()
    mockReduced(false)
    ;(globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  })
  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    jest.useRealTimers()
  })

  const mount = (props: Parameters<typeof SignalStormPreloader>[0] = {}) =>
    act(() => root.render(<SignalStormPreloader {...props} />))
  const overlay = () => host.firstElementChild as HTMLElement | null

  it('is a fixed, inert, contained overlay that hides itself from assistive tech', () => {
    mount()
    const el = overlay()!
    for (const c of ['fixed', 'inset-0', 'z-50', 'pointer-events-none']) {
      expect(el.className).toContain(c)
    }
    expect(el.style.contain).toBe('strict')
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('sets the paper, the ink and the accent', () => {
    mount()
    const style = overlay()!.style
    expect(style.getPropertyValue('--paper')).toBe(PALETTE.paper)
    expect(style.getPropertyValue('--ink')).toBe(PALETTE.ink)
    expect(style.getPropertyValue('--accent')).toBe(PALETTE.accent)
  })

  it('hands the whole schedule to the stylesheet', () => {
    mount()
    const style = overlay()!.style
    expect(style.getPropertyValue('--t-shutter-start')).toBe(
      `${T.storm.shutterStart}ms`,
    )
    expect(style.getPropertyValue('--t-tick-period')).toBe('1000ms')
    expect(style.getPropertyValue('--t-panel-start')).toBe(
      `${T.panels.start}ms`,
    )
    expect(style.getPropertyValue('--t-panel-stagger')).toBe('50ms')
  })

  it('draws seven storm rows, three lanes, two pads, and a reel per letter', () => {
    mount()
    expect(host.querySelectorAll('[data-dir]').length).toBeGreaterThanOrEqual(
      STORM_ROWS * 2,
    )
    expect(
      host.querySelectorAll('[data-dir="l"],[data-dir="r"]').length,
    ).toBeGreaterThan(0)
    expect(host.querySelectorAll('g[style*="--dist"]')).toHaveLength(12)
  })

  it('removes the storm once its last row has shuttered away', () => {
    mount()
    expect(host.querySelectorAll('svg[viewBox^="0 -6"]').length).toBe(
      STORM_ROWS,
    )
    act(() => {
      jest.advanceTimersByTime(
        T.storm.shutterStart +
          (STORM_ROWS - 1) * T.storm.shutterStagger +
          T.storm.shutterDuration,
      )
    })
    expect(host.querySelectorAll('svg[viewBox^="0 -6"]').length).toBe(0)
    expect(overlay()).not.toBeNull()
  })

  it('decodes the labels to their final text', () => {
    mount()
    const text = () =>
      [...host.querySelectorAll('text')].map((t) => t.textContent)
    expect(text()).not.toEqual(expect.arrayContaining([LABELS.name]))
    act(() => {
      jest.advanceTimersByTime(T.scramble.end + 100)
    })
    for (const label of Object.values(LABELS)) expect(text()).toContain(label)
  })

  it('ends at the total: present one ms before, gone at it, onComplete once', () => {
    const onComplete = jest.fn()
    mount({ onComplete })
    act(() => {
      jest.advanceTimersByTime(T.total - 1)
    })
    expect(overlay()).not.toBeNull()
    expect(onComplete).not.toHaveBeenCalled()
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(overlay()).toBeNull()
  })

  it('calls the latest onComplete without restarting the clock', () => {
    const first = jest.fn()
    const second = jest.fn()
    mount({ onComplete: first })
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    mount({ onComplete: second })
    act(() => {
      jest.advanceTimersByTime(T.total - 1000)
    })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('does nothing after it is unmounted', () => {
    const onComplete = jest.fn()
    mount({ onComplete })
    act(() => root.unmount())
    act(() => {
      jest.advanceTimersByTime(T.total * 2)
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

describe('<SignalStormPreloader /> with reduced motion', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    jest.useFakeTimers()
    mockReduced(true)
    ;(globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
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

  it('shows the resolved poster with no storm and final labels at once', () => {
    act(() => root.render(<SignalStormPreloader />))
    expect(host.firstElementChild!.getAttribute('data-reduced')).toBe('true')
    expect(host.querySelectorAll('svg[viewBox^="0 -6"]').length).toBe(0)
    const text = [...host.querySelectorAll('text')].map((t) => t.textContent)
    for (const label of Object.values(LABELS)) expect(text).toContain(label)
  })

  it('is over in the short beat', () => {
    const onComplete = jest.fn()
    act(() => root.render(<SignalStormPreloader onComplete={onComplete} />))
    act(() => {
      jest.advanceTimersByTime(STORM_REDUCED_MS - 1)
    })
    expect(onComplete).not.toHaveBeenCalled()
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(host.firstElementChild).toBeNull()
  })
})
