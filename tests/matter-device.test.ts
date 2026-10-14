import {
  MATTER_DEVICE_PHASES,
  MATTER_RESIDUE_FLOOR,
  MATTER_RESIDUE_PHASES,
  matterDeviceFrame,
  matterDeviceState,
  type DeviceFrame,
} from '@/features/landing-page/components/matter/matter-device'

/**
 * The device layer's one pure function, pinned at the boundaries the handoff
 * is timed on.
 *
 * These assertions are written against `MATTER_DEVICE_PHASES` rather than
 * against literals wherever a boundary is being tested, so a retime cannot
 * leave a fixture asserting last week's numbers.
 */

const numericValues = (frame: DeviceFrame): number[] =>
  Object.values(frame).filter(
    (value): value is number => typeof value === 'number',
  )

/** A sweep with the boundaries included, for the monotonic and replay checks. */
const SAMPLES = Array.from({ length: 101 }, (_, index) => index / 100)

describe('matterDeviceFrame — the shell', () => {
  it('establishes the device before release', () => {
    expect(matterDeviceFrame(0.1).shellOpacity).toBe(1)
    expect(matterDeviceFrame(0.35).residueOpacity).toBe(0)
  })

  it('is absent before the handoff and whole from the establish boundary on', () => {
    expect(matterDeviceFrame(0).shellOpacity).toBe(0)
    expect(
      matterDeviceFrame(MATTER_DEVICE_PHASES.establish[1]).shellOpacity,
    ).toBe(1)
    // Whole all the way through the signal transfer, so the machine never
    // blinks out while the words are crossing.
    expect(matterDeviceFrame(0.35).shellOpacity).toBe(1)
    expect(matterDeviceFrame(MATTER_DEVICE_PHASES.lift[0]).shellOpacity).toBe(1)
  })

  it('clears exactly at the clear boundary and stays cleared', () => {
    const boundary = MATTER_DEVICE_PHASES.clear[1]
    expect(matterDeviceFrame(boundary).shellOpacity).toBe(0)
    expect(matterDeviceFrame(1).shellOpacity).toBe(0)
    expect(matterDeviceFrame(boundary).faceplateOpacity).toBe(0)
    expect(matterDeviceFrame(boundary).signalOpacity).toBe(0)
    // The residue is deliberately not in this set: it outlives the shell it
    // came from, because the practice heading arrives after the shell is gone.
    expect(matterDeviceFrame(boundary).residueOpacity).toBeGreaterThan(0)
  })

  it('loses its faceplate before it loses its outline', () => {
    // The faceplate and the shell are both whole while the machine is still
    // assembled, and once the lift has begun the faceplate is strictly the
    // dimmer of the two — that ordering is the whole point of the two windows.
    const assembled = MATTER_DEVICE_PHASES.lift[0]
    expect(matterDeviceFrame(assembled).faceplateOpacity).toBe(
      matterDeviceFrame(assembled).shellOpacity,
    )
    const lifting = assembled + 0.07
    expect(matterDeviceFrame(lifting).faceplateOpacity).toBeLessThan(
      matterDeviceFrame(lifting).shellOpacity,
    )
  })
})

describe('matterDeviceFrame — the signal route and the mechanics', () => {
  it('lights the route across the signal window', () => {
    expect(matterDeviceFrame(0).signalOpacity).toBe(0)
    expect(
      matterDeviceFrame(MATTER_DEVICE_PHASES.signal[0]).signalOpacity,
    ).toBe(0)
    expect(
      matterDeviceFrame(MATTER_DEVICE_PHASES.signal[1]).signalOpacity,
    ).toBe(1)
  })

  it('turns the platter forward and never backward', () => {
    let previous = -Infinity
    for (const progress of SAMPLES) {
      const rotation = matterDeviceFrame(progress).platterRotation
      expect(rotation).toBeGreaterThanOrEqual(previous)
      previous = rotation
    }
    expect(matterDeviceFrame(1).platterRotation).toBeGreaterThan(
      matterDeviceFrame(0).platterRotation,
    )
  })

  it('swings the tonearm once, inside its own window', () => {
    expect(matterDeviceFrame(0).tonearm).toBe(0)
    expect(matterDeviceFrame(0.62).tonearm).toBe(1)
    expect(matterDeviceFrame(1).tonearm).toBe(1)
  })

  it('keeps the meter live: above zero at rest, at its ceiling with the signal', () => {
    const rest = matterDeviceFrame(0).meterLevel
    expect(rest).toBeGreaterThan(0)
    expect(rest).toBeLessThan(0.5)
    expect(matterDeviceFrame(0.58).meterLevel).toBeGreaterThan(rest)
    expect(matterDeviceFrame(1).meterLevel).toBeLessThanOrEqual(1)
  })
})

describe('matterDeviceFrame — the practice residue', () => {
  it('is absent while the machine is whole, and whole by the break-apart', () => {
    expect(matterDeviceFrame(0.35).residueOpacity).toBe(0)
    expect(matterDeviceFrame(MATTER_RESIDUE_PHASES.in[0]).residueOpacity).toBe(
      0,
    )
    expect(
      matterDeviceFrame(MATTER_RESIDUE_PHASES.in[1]).residueOpacity,
    ).toBeGreaterThan(0)
  })

  it('anchors the practice landing after the shell has already cleared', () => {
    // The whole point of the residue's own windows: the shell is gone by the
    // clear boundary, and the practice heading arrives after it. A residue
    // keyed to the shell would be at zero here, which is the defect this test
    // exists to prevent from coming back.
    expect(matterDeviceFrame(MATTER_DEVICE_PHASES.clear[1]).shellOpacity).toBe(
      0,
    )
    expect(
      matterDeviceFrame(MATTER_DEVICE_PHASES.clear[1]).residueOpacity,
    ).toBeGreaterThan(0)
    expect(matterDeviceFrame(0.85).residueOpacity).toBeGreaterThan(0)
  })

  it('is inside the acceptance band where the first practice line lands', () => {
    // Measured on the rendered page, `Start with the user.` settles as the
    // focal point around p=.80 — not at the p=.65 the prose assumed.
    const at = matterDeviceFrame(0.8).residueOpacity
    expect(at).toBeGreaterThanOrEqual(0.08)
    expect(at).toBeLessThanOrEqual(MATTER_RESIDUE_FLOOR)
    // Quiet by contract: never close to the heading's own contrast.
    expect(at).toBeLessThan(0.5)
  })

  it('clears once the heading has settled, before the story copy lands', () => {
    expect(matterDeviceFrame(MATTER_RESIDUE_PHASES.out[1]).residueOpacity).toBe(
      0,
    )
    expect(matterDeviceFrame(1).residueOpacity).toBe(0)
  })

  it('is never brighter than its declared floor', () => {
    for (const progress of SAMPLES) {
      expect(matterDeviceFrame(progress).residueOpacity).toBeLessThanOrEqual(
        MATTER_RESIDUE_FLOOR,
      )
    }
  })
})

describe('matterDeviceFrame — the contract', () => {
  it('is deterministic and finite', () => {
    expect(matterDeviceFrame(0.53)).toEqual(matterDeviceFrame(0.53))
    for (const value of Object.values(matterDeviceFrame(NaN))) {
      expect(Number.isFinite(value)).toBe(true)
    }
    for (const value of Object.values(matterDeviceFrame(Infinity))) {
      expect(Number.isFinite(value)).toBe(true)
    }
  })

  it('normalises out-of-range progress instead of extrapolating', () => {
    expect(matterDeviceFrame(-1)).toEqual(matterDeviceFrame(0))
    expect(matterDeviceFrame(2)).toEqual(matterDeviceFrame(1))
  })

  it('is every value finite across the whole sweep', () => {
    for (const progress of SAMPLES) {
      for (const value of numericValues(matterDeviceFrame(progress))) {
        expect(Number.isFinite(value)).toBe(true)
      }
    }
  })

  it('reproduces the same frames when scrubbed backward', () => {
    const forward = SAMPLES.map((progress) => matterDeviceFrame(progress))
    const backward = SAMPLES.map((progress) => matterDeviceFrame(progress))
      .reverse()
      .reverse()
    expect(backward).toEqual(forward)
  })
})

describe('matterDeviceState', () => {
  it('reads the composition states off the same boundaries the frame uses', () => {
    expect(matterDeviceState(0)).toBe('source-hold')
    expect(matterDeviceState(0.05)).toBe('source-hold')
    expect(matterDeviceState(MATTER_DEVICE_PHASES.establish[1])).toBe(
      'device-established',
    )
    expect(matterDeviceState(0.35)).toBe('device-established')
    expect(matterDeviceState(MATTER_DEVICE_PHASES.release[0])).toBe(
      'signal-transfer',
    )
    expect(matterDeviceState(MATTER_DEVICE_PHASES.lift[0])).toBe(
      'device-release',
    )
    expect(matterDeviceState(0.65)).toBe('device-release')
    expect(matterDeviceState(MATTER_DEVICE_PHASES.clear[0])).toBe(
      'reading-residue',
    )
    // The reading states end on the residue's exit, not the shell's: the
    // fragment that anchors the practice heading outlives the shell.
    expect(matterDeviceState(MATTER_DEVICE_PHASES.clear[1])).toBe(
      'reading-residue',
    )
    expect(matterDeviceState(MATTER_RESIDUE_PHASES.out[1])).toBe(
      'reading-plateau',
    )
    expect(matterDeviceState(1)).toBe('reading-plateau')
  })

  it('normalises degenerate progress', () => {
    expect(matterDeviceState(NaN)).toBe('source-hold')
    expect(matterDeviceState(-5)).toBe('source-hold')
    expect(matterDeviceState(5)).toBe('reading-plateau')
  })
})
