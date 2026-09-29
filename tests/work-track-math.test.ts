import {
  resolveActiveIndex,
  resolveTrackProgress,
} from '@/features/landing-page/work/track-math'
import {
  formatProjectTime,
  trackLabel,
  PROJECTS_SHOWCASE,
} from '@/features/landing-page/constants'

const COUNT = 6

describe('resolveActiveIndex', () => {
  it('maps the start of the section to the first track', () => {
    expect(resolveActiveIndex(0, COUNT)).toBe(0)
  })

  it('advances one track per equal slice of scroll', () => {
    const indices = [0, 1, 2, 3, 4, 5]
    indices.forEach((expected) => {
      expect(resolveActiveIndex((expected + 0.5) / COUNT, COUNT)).toBe(expected)
    })
  })

  it('switches exactly at the track boundary', () => {
    expect(resolveActiveIndex(1 / COUNT, COUNT)).toBe(1)
    expect(resolveActiveIndex(1 / COUNT - 1e-9, COUNT)).toBe(0)
  })

  it('clamps to the last track at the end of the section', () => {
    expect(resolveActiveIndex(1, COUNT)).toBe(COUNT - 1)
  })

  it('clamps out-of-range progress from scroll bounce', () => {
    expect(resolveActiveIndex(-0.2, COUNT)).toBe(0)
    expect(resolveActiveIndex(1.4, COUNT)).toBe(COUNT - 1)
  })

  it('never returns an invalid index for an empty or single-track list', () => {
    expect(resolveActiveIndex(0.5, 0)).toBe(0)
    expect(resolveActiveIndex(0, 1)).toBe(0)
    expect(resolveActiveIndex(0.99, 1)).toBe(0)
  })
})

describe('resolveTrackProgress', () => {
  it('starts at zero and resets at each boundary', () => {
    expect(resolveTrackProgress(0, COUNT)).toBe(0)
    expect(resolveTrackProgress(1 / COUNT, COUNT)).toBeCloseTo(0, 6)
    expect(resolveTrackProgress(2 / COUNT, COUNT)).toBeCloseTo(0, 6)
  })

  it('reaches the midpoint of each track', () => {
    for (let track = 0; track < COUNT; track += 1) {
      const progress = (track + 0.5) / COUNT
      expect(resolveTrackProgress(progress, COUNT)).toBeCloseTo(0.5, 6)
    }
  })

  it('stays below 1 on the final track so the record never overshoots', () => {
    expect(resolveTrackProgress(1, COUNT)).toBeLessThan(1)
    expect(resolveTrackProgress(1, COUNT)).toBeGreaterThan(0.999)
  })

  it('clamps out-of-range progress from scroll bounce', () => {
    expect(resolveTrackProgress(-0.2, COUNT)).toBe(0)
    expect(resolveTrackProgress(1.4, COUNT)).toBeLessThan(1)
  })

  it('returns 0 for an empty list', () => {
    expect(resolveTrackProgress(0.5, 0)).toBe(0)
  })
})

describe('trackLabel', () => {
  it('labels each library entry with a 1-based catalog number', () => {
    expect(PROJECTS_SHOWCASE.map((_, index) => trackLabel(index))).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
    ])
  })

  it('keeps counting past the original six releases', () => {
    expect(trackLabel(6)).toBe('07')
    expect(trackLabel(9)).toBe('10')
  })
})

describe('formatProjectTime', () => {
  it('pads seconds and rolls into minutes', () => {
    expect(formatProjectTime(0)).toBe('0:00')
    expect(formatProjectTime(9)).toBe('0:09')
    expect(formatProjectTime(59)).toBe('0:59')
    expect(formatProjectTime(60)).toBe('1:00')
    expect(formatProjectTime(185)).toBe('3:05')
  })
})

describe('PROJECTS_SHOWCASE work metadata', () => {
  it('gives every project the fields the section renders', () => {
    for (const project of PROJECTS_SHOWCASE) {
      expect(project.cover).toBeTruthy()
      expect(project.role).toBeTruthy()
      expect(project.stack.length).toBeGreaterThan(0)
      expect(project.highlights.length).toBeGreaterThanOrEqual(3)
      expect(project.palette.a).toMatch(/^#[0-9a-f]{6}$/i)
      expect(project.palette.b).toMatch(/^#[0-9a-f]{6}$/i)
      expect(project.palette.accent).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
