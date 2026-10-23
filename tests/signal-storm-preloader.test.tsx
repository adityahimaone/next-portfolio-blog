import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import SignalStormPreloader, {
  BOOT,
  PALETTE,
  RELEASE,
  SETTLE_MS,
  STORM_REDUCED_MS,
  STORM_ROWS,
  STORM_TIMELINE,
  STORM_TONES,
  STORM_WORDS,
  bandVisible,
  fallbackBand,
  mergeDelay,
  mergeShifts,
  readBand,
  rowCenters,
  stormEnd,
  stormRow,
  type Band,
} from '@/components/ui/signal-storm-preloader'
;(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const T = STORM_TIMELINE
const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

/* ── The schedule ───────────────────────────────────────────────────────── */

describe('STORM_TIMELINE', () => {
  it('ends exactly at the total, and nothing runs past it', () => {
    expect(stormEnd()).toBe(T.total)
  })

  it('lets the words run, at length, before they are pulled together', () => {
    const entered = T.enter.duration + (STORM_ROWS - 1) * T.enter.stagger
    expect(T.merge.start).toBeGreaterThanOrEqual(entered)
    // The beat that the whole sequence exists for. At 1.74s this gap was 300ms
    // and the rows were still arriving when the merge took them, which is what
    // made the boot read as a flash rather than as something to watch.
    expect(T.merge.start - entered).toBeGreaterThanOrEqual(700)
  })

  it('grows the band out of the merge, not before it and not after it has ended', () => {
    expect(T.fuse.start).toBeGreaterThan(T.merge.start)
    expect(T.fuse.start + T.fuse.duration).toBeLessThanOrEqual(
      T.merge.start +
        Math.floor(STORM_ROWS / 2) * T.merge.stagger +
        T.merge.duration,
    )
  })

  it('releases the hero letters only once the band has landed on the clip', () => {
    expect(T.release.start).toBeGreaterThanOrEqual(
      T.fuse.start + T.fuse.duration - 100,
    )
    expect(T.release.start).toBeLessThan(T.ground.start + T.ground.duration)
  })

  it('fades the ground after the band has landed, and the band after the ground', () => {
    expect(T.ground.start).toBeGreaterThanOrEqual(
      T.fuse.start + T.fuse.duration,
    )
    expect(T.band.start).toBeGreaterThanOrEqual(T.ground.start)
    expect(T.band.start + T.band.duration).toBeLessThanOrEqual(T.total)
  })

  it('is a boot, not a show: long enough to read, short enough not to be waited on', () => {
    // It was under two seconds, and that was too fast to read seven rows of
    // words. The ceiling matters as much as the floor: this plays on every
    // fresh session, in front of a page the visitor has already decided to see.
    expect(T.total).toBeGreaterThanOrEqual(2200)
    expect(T.total).toBeLessThanOrEqual(3000)
    expect(STORM_REDUCED_MS).toBeLessThan(T.total)
  })
})

/* ── The storm ──────────────────────────────────────────────────────────── */

describe('the storm', () => {
  it('is the same every time', () => {
    expect(stormRow(3)).toEqual(stormRow(3))
  })

  it('lays studio words end to end, as capitals only, in order along the row', () => {
    const letters = STORM_WORDS.join('')
    for (let row = 0; row < STORM_ROWS; row += 1) {
      const { glyphs } = stormRow(row)
      expect(glyphs.length).toBeGreaterThan(20)
      for (const g of glyphs) expect(letters).toContain(g.ch)
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
    expect(span).toBeGreaterThan(last.x + last.w)
    expect(span - (last.x + last.w)).toBeLessThan(120)
  })

  it('cycles tones in the hero palette, solid and outlined', () => {
    expect(STORM_TONES).toHaveLength(STORM_ROWS)
    const colours = new Set(STORM_TONES.map((t) => t.color))
    for (const c of [
      PALETTE.orange,
      PALETTE.cream,
      PALETTE.green,
      PALETTE.blue,
      PALETTE.amber,
    ]) {
      expect(colours.has(c)).toBe(true)
    }
    expect(STORM_TONES.some((t) => t.hollow)).toBe(true)
    expect(STORM_TONES.some((t) => !t.hollow)).toBe(true)
    expect(stormRow(STORM_ROWS).tone).toEqual(stormRow(0).tone)
  })
})

/* ── The merge: geometry ────────────────────────────────────────────────── */

describe('the merge geometry', () => {
  const band: Band = { x: 100, y: 300, w: 1000, h: 240, radius: 6 }

  it('centres the column of rows on the overlay', () => {
    const centres = rowCenters(900)
    expect(centres).toHaveLength(STORM_ROWS)
    expect(centres[Math.floor(STORM_ROWS / 2)]).toBeCloseTo(450, 6)
    // Symmetric about the middle, and evenly pitched.
    expect(centres[0] + centres[STORM_ROWS - 1]).toBeCloseTo(900, 6)
    for (let i = 1; i < centres.length; i += 1) {
      expect(centres[i] - centres[i - 1]).toBeCloseTo(900 * 0.172, 6)
    }
  })

  it('moves every row onto the band centre line', () => {
    const shifts = mergeShifts(900, band)
    const centres = rowCenters(900)
    shifts.forEach((dy, i) => {
      expect(centres[i] + dy).toBeCloseTo(band.y + band.h / 2, 6)
    })
  })

  it('moves the middle row least when the band is centred, and outer rows most', () => {
    const centred: Band = { ...band, y: 450 - band.h / 2 }
    const shifts = mergeShifts(900, centred)
    const middle = Math.floor(STORM_ROWS / 2)
    expect(shifts[middle]).toBeCloseTo(0, 6)
    expect(Math.abs(shifts[0])).toBeGreaterThan(Math.abs(shifts[1]))
    expect(shifts[0]).toBeCloseTo(-shifts[STORM_ROWS - 1], 6)
  })

  it('closes inward: outer rows start first, the middle one last, symmetrically', () => {
    const delays = Array.from({ length: STORM_ROWS }, (_, i) =>
      mergeDelay(i, STORM_ROWS, 30),
    )
    expect(delays[0]).toBe(0)
    expect(delays[STORM_ROWS - 1]).toBe(0)
    expect(delays[Math.floor(STORM_ROWS / 2)]).toBe(90)
    for (let i = 0; i < STORM_ROWS; i += 1) {
      expect(delays[i]).toBe(delays[STORM_ROWS - 1 - i])
    }
  })

  it('knows whether a band is on screen enough to land on', () => {
    expect(bandVisible(band, 1280, 900)).toBe(true)
    // Scrolled past the hero.
    expect(bandVisible({ ...band, y: -400 }, 1280, 900)).toBe(false)
    expect(bandVisible({ ...band, y: 1200 }, 1280, 900)).toBe(false)
    // Mostly off to the side.
    expect(bandVisible({ ...band, x: 1200 }, 1280, 900)).toBe(false)
    // Partly clipped is still fine.
    expect(bandVisible({ ...band, y: 780 }, 1280, 900)).toBe(false)
    expect(bandVisible({ ...band, y: 600 }, 1280, 900)).toBe(true)
  })

  it('has a fallback band that is centred and always visible', () => {
    for (const [w, h] of [
      [1280, 900],
      [390, 844],
      [1920, 1080],
    ]) {
      const b = fallbackBand(w, h)
      // Rounded to whole pixels, so centred to within one.
      expect(Math.abs(b.x + b.w / 2 - w / 2)).toBeLessThanOrEqual(1)
      expect(Math.abs(b.y + b.h / 2 - h / 2)).toBeLessThanOrEqual(1)
      expect(bandVisible(b, w, h)).toBe(true)
    }
  })

  it('reads a band from an element, with its corner radius, and refuses nothing', () => {
    const el = document.createElement('div')
    el.style.borderTopLeftRadius = '6px'
    el.getBoundingClientRect = () =>
      ({
        left: 10,
        top: 20,
        width: 300,
        height: 120,
        right: 310,
        bottom: 140,
      }) as DOMRect
    expect(readBand(el)).toEqual({ x: 10, y: 20, w: 300, h: 120, radius: 6 })
    expect(readBand(null)).toBeNull()
    el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 0, height: 0 }) as DOMRect
    expect(readBand(el)).toBeNull()
  })
})

/* ── It matches the hero, and the hero knows about it ───────────────────── */

describe('agreement with the hero', () => {
  const theme = read('app/deck-theme.css')

  it('uses the hero ground, cream and signal orange exactly', () => {
    expect(theme).toContain(`--deck-ground: ${PALETTE.ground};`)
    expect(theme).toContain(`--deck-ground-ink: ${PALETTE.cream};`)
    expect(theme).toContain(`--deck-orange: ${PALETTE.orange};`)
  })

  it('paints its ground and band from the same tokens', () => {
    const css = read('components/ui/signal-storm-preloader.module.css')
    expect(css).toContain('var(--deck-ground, #14171a)')
    expect(css).toContain('var(--deck-orange, #ff5a1f)')
    expect(css).toContain('--deck-grid-line')
  })

  it('reads the hero letter animation through the three variables it sets', () => {
    const hero = read(
      'features/landing-page/components/arrangement/arrangement.module.css',
    )
    const block = /\.nameChar \{[^}]*\}/.exec(hero)![0]
    // With nothing set, the hero's own timing is exactly what it was.
    expect(block).toContain(`var(${BOOT.delay}, 450ms)`)
    expect(block).toContain(`var(${BOOT.stagger}, 45ms)`)
    expect(block).toContain(`var(${BOOT.play}, running)`)
  })

  it('marks the hero name clip it measures', () => {
    const clip = read(
      'features/landing-page/components/arrangement/arrangement-clip.tsx',
    )
    expect(clip).toContain(
      "data-hero-name-clip={clip.kind === 'name' ? '' : undefined}",
    )
  })

  it('releases to a quicker delay and stagger than the hero starts with', () => {
    expect(parseInt(RELEASE.delay, 10)).toBeLessThan(450)
    expect(parseInt(RELEASE.stagger, 10)).toBeLessThan(45)
  })
})

/* ── The component ──────────────────────────────────────────────────────── */

type Call = {
  el: Element
  keyframes: Keyframe[]
  options: KeyframeAnimationOptions
}

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
  let calls: Call[]
  let cancelled: number
  let hero: HTMLDivElement | null

  const html = () => document.documentElement
  const boot = () => ({
    play: html().style.getPropertyValue(BOOT.play),
    delay: html().style.getPropertyValue(BOOT.delay),
    stagger: html().style.getPropertyValue(BOOT.stagger),
  })

  beforeEach(() => {
    jest.useFakeTimers()
    mockReduced(false)
    calls = []
    cancelled = 0
    ;(globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    ;(HTMLElement.prototype as unknown as { animate: unknown }).animate =
      function (
        this: Element,
        keyframes: Keyframe[],
        options: KeyframeAnimationOptions,
      ) {
        calls.push({ el: this, keyframes, options })
        return { cancel: () => void (cancelled += 1) }
      }
    hero = document.createElement('div')
    hero.setAttribute('data-hero-name-clip', '')
    hero.style.borderTopLeftRadius = '6px'
    hero.getBoundingClientRect = () =>
      ({
        left: 100,
        top: 300,
        width: 800,
        height: 240,
        right: 900,
        bottom: 540,
      }) as DOMRect
    document.body.appendChild(hero)
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    jest.runOnlyPendingTimers()
    host.remove()
    hero?.remove()
    delete (HTMLElement.prototype as unknown as { animate?: unknown }).animate
    for (const k of Object.values(BOOT)) html().style.removeProperty(k)
    jest.useRealTimers()
  })

  const mount = (props: Parameters<typeof SignalStormPreloader>[0] = {}) =>
    act(() => root.render(<SignalStormPreloader {...props} />))
  const overlay = () => host.firstElementChild as HTMLElement | null
  const advance = (ms: number) =>
    act(() => {
      jest.advanceTimersByTime(ms)
    })

  it('is a fixed, inert, contained overlay that hides itself from assistive tech', () => {
    mount()
    const el = overlay()!
    for (const c of ['fixed', 'inset-0', 'z-50', 'pointer-events-none']) {
      expect(el.className).toContain(c)
    }
    expect(el.style.contain).toBe('strict')
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('draws seven rows of running words and nothing else: no poster, no metronome', () => {
    mount()
    expect(host.querySelectorAll('svg[viewBox^="0 -6"]')).toHaveLength(
      STORM_ROWS,
    )
    expect(host.querySelectorAll('text')).toHaveLength(0)
    expect(host.querySelectorAll('g[style*="--dist"]')).toHaveLength(0)
  })

  it('holds the hero letters from the first moment', () => {
    mount()
    expect(boot().play).toBe('paused')
  })

  it('does nothing visible to the hero until the merge starts', () => {
    mount()
    advance(T.merge.start - 1)
    expect(calls).toHaveLength(0)
  })

  it('pulls the rows onto the measured name clip when the merge starts', () => {
    mount()
    advance(T.merge.start)
    // The storm, seven rows, the band growing, the ground fading, the band fading.
    expect(calls).toHaveLength(1 + STORM_ROWS + 3)

    const band: Band = { x: 100, y: 300, w: 800, h: 240, radius: 6 }
    const shifts = mergeShifts(window.innerHeight, band)
    const rows = calls.filter(
      (c) =>
        c.options.delay !== undefined &&
        (c.el.parentElement?.children.length ?? 0) === STORM_ROWS,
    )
    expect(rows).toHaveLength(STORM_ROWS)
    rows.forEach((call, i) => {
      expect(call.options.duration).toBe(T.merge.duration)
      expect(call.options.delay).toBe(
        mergeDelay(i, STORM_ROWS, T.merge.stagger),
      )
      expect(call.keyframes[1].transform).toContain(
        `translate3d(0, ${shifts[i]}px, 0)`,
      )
      expect(call.keyframes[1].transform).toContain('scaleY(0.06)')
      // The squashed line is gone by the end, so it never lingers.
      expect(call.keyframes[2].opacity).toBe(0)
    })
  })

  it('sizes the growing band to the clip it measured, corner radius included', () => {
    mount()
    advance(T.merge.start)
    const fuse = overlay()!.lastElementChild as HTMLElement
    expect(fuse.style.left).toBe('100px')
    expect(fuse.style.top).toBe('300px')
    expect(fuse.style.width).toBe('800px')
    expect(fuse.style.height).toBe('240px')
    expect(fuse.style.borderRadius).toBe('6px')
    const grow = calls.find((c) => c.el === fuse && c.keyframes[0].clipPath)!
    expect(grow.keyframes[0].clipPath).toBe('inset(50% 0px 50% 0px)')
    expect(grow.keyframes[1].clipPath).toBe('inset(0px 0px 0px 0px)')
    expect(grow.options.delay).toBe(T.fuse.start - T.merge.start)
    expect(grow.options.duration).toBe(T.fuse.duration)
  })

  it('fades the ground and then the band on the timeline', () => {
    mount()
    advance(T.merge.start)
    const fades = calls.filter(
      (c) => c.keyframes.length === 2 && c.keyframes[1].opacity === 0,
    )
    const delays = fades.map((c) => c.options.delay)
    expect(delays).toContain(T.ground.start - T.merge.start)
    expect(delays).toContain(T.band.start - T.merge.start)
  })

  it('falls back to a centred band when there is no name clip', () => {
    hero!.remove()
    hero = null
    mount()
    advance(T.merge.start)
    const fuse = overlay()!.lastElementChild as HTMLElement
    const b = fallbackBand(window.innerWidth, window.innerHeight)
    expect(fuse.style.width).toBe(`${b.w}px`)
    expect(fuse.style.top).toBe(`${b.y}px`)
  })

  it('falls back when the name clip is scrolled out of view', () => {
    hero!.getBoundingClientRect = () =>
      ({
        left: 100,
        top: -900,
        width: 800,
        height: 240,
        right: 900,
        bottom: -660,
      }) as DOMRect
    mount()
    advance(T.merge.start)
    const fuse = overlay()!.lastElementChild as HTMLElement
    expect(fuse.style.top).not.toBe('-900px')
  })

  it('releases the hero letters at the release beat, quicker than they would have started', () => {
    mount()
    advance(T.release.start - 1)
    expect(boot().play).toBe('paused')
    advance(1)
    expect(boot()).toEqual({
      play: 'running',
      delay: RELEASE.delay,
      stagger: RELEASE.stagger,
    })
  })

  it('ends at the total: present one ms before, gone at it, onComplete once', () => {
    const onComplete = jest.fn()
    mount({ onComplete })
    advance(T.total - 1)
    expect(overlay()).not.toBeNull()
    expect(onComplete).not.toHaveBeenCalled()
    advance(1)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(overlay()).toBeNull()
  })

  it('leaves the hero variables alone while its letters finish rising, then clears them', () => {
    mount()
    advance(T.total)
    expect(overlay()).toBeNull()
    // The overlay is gone but the letters are mid-rise: changing their delay now
    // would snap them back, so the variables must still be there.
    expect(boot().play).toBe('running')
    expect(boot().stagger).toBe(RELEASE.stagger)
    advance(SETTLE_MS - 1)
    expect(boot().play).toBe('running')
    advance(1)
    expect(boot()).toEqual({ play: '', delay: '', stagger: '' })
  })

  it('gives the hero back its own timing at once if it is unmounted before the release', () => {
    mount()
    advance(500)
    expect(boot().play).toBe('paused')
    act(() => root.unmount())
    expect(boot()).toEqual({ play: '', delay: '', stagger: '' })
    root = createRoot(host)
  })

  it('cancels its animations when it is unmounted partway', () => {
    mount()
    advance(T.merge.start)
    act(() => root.unmount())
    expect(cancelled).toBe(calls.length)
    root = createRoot(host)
  })

  it('does nothing after it is unmounted', () => {
    const onComplete = jest.fn()
    mount({ onComplete })
    act(() => root.unmount())
    advance(T.total * 2)
    expect(onComplete).not.toHaveBeenCalled()
    root = createRoot(host)
  })

  it('calls the latest onComplete without restarting the clock', () => {
    const first = jest.fn()
    const second = jest.fn()
    mount({ onComplete: first })
    advance(800)
    mount({ onComplete: second })
    advance(T.total - 800)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('still ends on time where Web Animations are missing', () => {
    delete (HTMLElement.prototype as unknown as { animate?: unknown }).animate
    const onComplete = jest.fn()
    mount({ onComplete })
    expect(() => advance(T.total)).not.toThrow()
    expect(onComplete).toHaveBeenCalledTimes(1)
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

  it('shows only the hero ground: no storm, and the hero letters are never held', () => {
    act(() => root.render(<SignalStormPreloader />))
    expect(host.firstElementChild!.getAttribute('data-reduced')).toBe('true')
    expect(host.querySelectorAll('svg[viewBox^="0 -6"]')).toHaveLength(0)
    expect(document.documentElement.style.getPropertyValue(BOOT.play)).toBe('')
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
