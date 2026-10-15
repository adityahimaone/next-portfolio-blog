import {
  BRIDGE_DEVICES,
  BRIDGE_PHASES,
  bridgeFrame,
} from '@/features/landing-page/components/bridge/skills-bridge-frame'

describe('bridgeFrame', () => {
  it('starts on the light sheet and ends with the room fully open', () => {
    const start = bridgeFrame(0, 1440, 900)
    const end = bridgeFrame(1, 1440, 900)
    expect(start.iris).toBe(0)
    expect(start.rack).toBe(0)
    expect(end.iris).toBeGreaterThanOrEqual(100)
    expect(end.rack).toBe(1)
    expect(end.caption).toBe(1)
  })

  it('opens the room only after the sentence has arrived', () => {
    expect(BRIDGE_PHASES.iris[0]).toBeGreaterThanOrEqual(
      BRIDGE_PHASES.arrive[1],
    )
    expect(bridgeFrame(BRIDGE_PHASES.arrive[1], 1440, 900).statement).toBe(1)
  })

  it('docks every device into its slot, face on and lit, at the end', () => {
    const end = bridgeFrame(1, 1440, 900)
    end.devices.forEach((device, index) => {
      const dock = BRIDGE_DEVICES[index].dock
      expect(device.x).toBeCloseTo((dock.x / 100) * 1440, 5)
      expect(device.y).toBeCloseTo((dock.y / 100) * 900, 5)
      expect(device.rx).toBeCloseTo(0, 5)
      expect(device.ry).toBeCloseTo(0, 5)
      expect(device.lit).toBe(1)
      expect(device.cable).toBe(1)
    })
  })

  it('keeps the devices off the sheet until they have started flying in', () => {
    expect(
      bridgeFrame(0, 1440, 900).devices.every((d) => d.opacity === 0),
    ).toBe(true)
  })

  it('draws a cable only after its device has docked', () => {
    for (let p = 0; p <= 1; p += 0.01) {
      for (const device of bridgeFrame(p, 1440, 900).devices) {
        if (device.cable > 0) expect(device.lit).toBeGreaterThan(0)
      }
    }
  })

  it('never writes NaN, Infinity or negative zero', () => {
    for (const progress of [NaN, -1, 0, 0.4, 1, 2, Infinity]) {
      const frame = bridgeFrame(progress, NaN, NaN)
      const values = [
        frame.statement,
        frame.iris,
        frame.rack,
        frame.caption,
        ...frame.devices.flatMap((d) => [
          d.x,
          d.y,
          d.scale,
          d.opacity,
          d.rx,
          d.ry,
          d.rz,
          d.lit,
          d.cable,
        ]),
      ]
      for (const value of values) {
        expect(Number.isFinite(value)).toBe(true)
        expect(Object.is(value, -0)).toBe(false)
      }
    }
  })
})
