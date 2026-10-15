import {
  BRIDGE_DEVICES,
  BRIDGE_PHASES,
  BRIDGE_RING_COUNT,
  bridgeFrame,
} from '@/features/landing-page/components/bridge/skills-bridge-frame'

const WORDS = 14
const frame = (p: number) => bridgeFrame(p, 1440, 900, WORDS)

describe('bridgeFrame', () => {
  it('starts on the light sheet and ends with the hole fully open', () => {
    expect(frame(0).iris).toBe(0)
    expect(frame(1).iris).toBeGreaterThanOrEqual(100)
    expect(frame(1).caption).toBe(1)
  })

  it('opens the hole only after the sentence has arrived', () => {
    expect(BRIDGE_PHASES.iris[0]).toBeGreaterThanOrEqual(
      BRIDGE_PHASES.arrive[1],
    )
    expect(frame(BRIDGE_PHASES.arrive[1]).statement).toBe(1)
  })

  it('draws every device into the hole and leaves none on the sheet', () => {
    const hole = { x: 720, y: 396 }
    for (const device of frame(1).devices) {
      expect(device.opacity).toBeLessThan(0.05)
      expect(Math.hypot(device.x - hole.x, device.y - hole.y)).toBeLessThan(2)
    }
  })

  it('tightens each device spiral monotonically', () => {
    const hole = { x: 720, y: 396 }
    BRIDGE_DEVICES.forEach((_, index) => {
      let last = Infinity
      for (let p = BRIDGE_PHASES.fall[0] + 0.1; p <= 0.6; p += 0.01) {
        const d = frame(p).devices[index]
        const radius = Math.hypot(d.x - hole.x, d.y - hole.y)
        // Sway is gone by now, so the radius only shrinks.
        expect(radius).toBeLessThanOrEqual(last + 1e-6)
        last = radius
      }
    })
  })

  it('keeps the stream out of view until the hole is opening', () => {
    expect(frame(0).words.every((w) => w.opacity === 0)).toBe(true)
    expect(
      frame(BRIDGE_PHASES.stream[0]).words.every((w) => w.opacity === 0),
    ).toBe(true)
  })

  it('moves every word toward the viewer and out of sight past it', () => {
    const early = frame(0.5).words
    const late = frame(0.9).words
    early.forEach((word, i) => expect(late[i].z).toBeGreaterThan(word.z))
    expect(frame(1).rings).toHaveLength(BRIDGE_RING_COUNT)
  })

  it('settles all three plates, lit, at the end', () => {
    expect(frame(0).plates.every((plate) => plate.opacity === 0)).toBe(true)
    for (const plate of frame(1).plates) {
      expect(plate.z).toBe(0)
      expect(plate.opacity).toBe(1)
      expect(plate.lit).toBe(1)
    }
  })

  it('never writes NaN, Infinity or negative zero', () => {
    for (const progress of [NaN, -1, 0, 0.4, 1, 2, Infinity]) {
      const f = bridgeFrame(progress, NaN, NaN, WORDS)
      const values = [
        f.statement,
        f.iris,
        f.core,
        f.caption,
        ...f.devices.flatMap((d) => [
          d.x,
          d.y,
          d.scale,
          d.opacity,
          d.rx,
          d.ry,
          d.rz,
          d.spin,
        ]),
        ...f.words.flatMap((w) => [w.x, w.y, w.z, w.opacity]),
        ...f.rings.flatMap((r) => [r.z, r.opacity]),
        ...f.plates.flatMap((pl) => [pl.z, pl.opacity, pl.lit]),
      ]
      for (const value of values) {
        expect(Number.isFinite(value)).toBe(true)
        expect(Object.is(value, -0)).toBe(false)
      }
    }
  })
})
