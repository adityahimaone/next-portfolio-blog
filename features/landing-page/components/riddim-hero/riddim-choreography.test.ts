import {
  RIDDIM_COUNTER,
  RIDDIM_PHASES,
  counterDigits,
  riddimFrame,
} from './riddim-choreography'
import { MACHINE_NAV } from './riddim-content'
import {
  LEFT_CAPS,
  LIVE_CAPS,
  PADS,
  RIGHT_CAPS,
  TOP_CAPS,
  capId,
  padId,
} from './riddim-geometry'

const samples = Array.from({ length: 201 }, (_, i) => i / 200)

const DRIVEN = [
  'power',
  'controls',
  'meter',
  'ink',
  'readout',
  'play',
  'handoff',
] as const

describe('riddimFrame', () => {
  it('starts at the machine top edge, down to its pilot light', () => {
    const f = riddimFrame(0)
    for (const key of DRIVEN) expect(f[key]).toBe(0)
    expect(f.digits.join('')).toBe('0112')
  })

  it('ends fully powered, with the next chapter printed', () => {
    const f = riddimFrame(1)
    for (const key of DRIVEN) expect(f[key]).toBe(1)
    expect(f.digits.join('')).toBe('0416')
  })

  it('is a pure function: the same progress always gives the same frame', () => {
    const forward = samples.map((p) => riddimFrame(p))
    const backward = [...samples]
      .reverse()
      .map((p) => riddimFrame(p))
      .reverse()
    expect(backward).toEqual(forward)
  })

  it('clamps progress outside 0..1', () => {
    expect(riddimFrame(-3)).toEqual(riddimFrame(0))
    expect(riddimFrame(7)).toEqual(riddimFrame(1))
  })

  it('keeps every driven value inside its range', () => {
    for (const p of samples) {
      const f = riddimFrame(p)
      for (const key of DRIVEN) {
        expect(f[key]).toBeGreaterThanOrEqual(0)
        expect(f[key]).toBeLessThanOrEqual(1)
      }
    }
  })

  it('finishes the story exactly at the last frame of the hero', () => {
    // The About band arrives in the frame the machine's bottom edge does, so
    // anything still animating at progress 1 is a frame nobody sees.
    expect(RIDDIM_PHASES.handoff[1]).toBe(1)
    expect(riddimFrame(1).handoff).toBe(1)
    expect(riddimFrame(0.999).handoff).toBeGreaterThan(0.99)
  })

  it('keeps the handoff off the console until the reader is near its foot', () => {
    for (const p of samples) {
      if (p < 0.7) expect(riddimFrame(p).handoff).toBe(0)
    }
  })

  it('keeps its phase windows ordered and inside the story', () => {
    const keys = Object.keys(RIDDIM_PHASES) as (keyof typeof RIDDIM_PHASES)[]
    for (const key of keys) {
      const [a, b] = RIDDIM_PHASES[key]
      expect(a).toBeLessThan(b)
      expect(a).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThanOrEqual(1)
    }
  })
})

describe('counterDigits', () => {
  it('prints bar.beat from the reference, four bars of sixteen', () => {
    expect(counterDigits(0).join('')).toBe('0112')
    expect(counterDigits(1).join('')).toBe('0416')
  })

  it('stays a four-digit readout across the whole run', () => {
    for (let i = 0; i <= 100; i++) {
      const digits = counterDigits(i / 100)
      expect(digits).toHaveLength(4)
      expect(digits.join('')).toMatch(/^0[1-4][0-2][0-9]$/)
    }
  })

  it('only ever moves forward, from the first step to the last', () => {
    const step = (p: number) => {
      const [a, b, c, d] = counterDigits(p)
      return (Number(`${a}${b}`) - 1) * 16 + Number(`${c}${d}`)
    }
    let previous = -1
    for (let i = 0; i <= 100; i++) {
      const value = step(i / 100)
      expect(value).toBeGreaterThanOrEqual(previous)
      previous = value
    }
    expect(step(0)).toBe(RIDDIM_COUNTER.first)
    expect(step(1)).toBe(RIDDIM_COUNTER.last)
  })

  it('clamps outside 0..1', () => {
    expect(counterDigits(-4)).toEqual(counterDigits(0))
    expect(counterDigits(9)).toEqual(counterDigits(1))
  })
})

describe('the machine as navigation', () => {
  /** Every control the geometry draws, addressed the way the markup is. */
  const controls = new Set<string>([
    ...TOP_CAPS.map((cap) => capId('strip', cap)),
    ...LEFT_CAPS.map((cap) => capId('left', cap)),
    ...LIVE_CAPS.map((cap) => capId('live', cap)),
    ...RIGHT_CAPS.map((cap) => capId('right', cap)),
    ...PADS.map((pad) => padId(pad)),
  ])

  it('points every destination at a control that exists', () => {
    for (const entry of MACHINE_NAV) {
      expect(controls.has(entry.id)).toBe(true)
    }
  })

  it('addresses every control at most once', () => {
    const ids = MACHINE_NAV.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('is the nine pads plus the caps, not a second sitemap', () => {
    const pads = MACHINE_NAV.filter((entry) => entry.id.startsWith('pad-'))
    expect(pads).toHaveLength(9)
    expect(
      MACHINE_NAV.filter((entry) => entry.kind === 'link').length,
    ).toBeGreaterThanOrEqual(12)
  })

  it('sends every link somewhere that exists', () => {
    const allowed = [
      '#work',
      '#about',
      '#contact',
      '/projects',
      '/blog',
      '/bookmarks',
      '/music',
      '/rss.xml',
      '/resume.pdf',
    ]
    for (const entry of MACHINE_NAV) {
      if (entry.kind !== 'link') continue
      const ok =
        allowed.includes(entry.href) || entry.href.startsWith('mailto:')
      expect(ok).toBe(true)
    }
  })

  it('keeps every destination labelled and described', () => {
    for (const entry of MACHINE_NAV) {
      expect(entry.label.length).toBeGreaterThan(0)
      expect(entry.note.length).toBeGreaterThan(0)
      expect(entry.label).toBe(entry.label.toUpperCase())
    }
  })
})
