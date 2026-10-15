import {
  BRIDGE_DEVICES,
  BRIDGE_PHASES,
  bridgeFrame,
} from '@/features/landing-page/components/bridge/skills-bridge-frame'

const frame = (p: number) => bridgeFrame(p, 1440, 900)
const HOLE = { x: 720, y: 396 }

describe('bridgeFrame', () => {
  it('starts on the light sheet and ends with the hole larger than the screen', () => {
    expect(frame(0).iris).toBe(0)
    // 100% of the diagonal reaches the farthest corner; anything less leaves
    // an edge of sheet on screen.
    expect(frame(1).iris).toBeGreaterThanOrEqual(100)
  })

  it('opens the hole only after the sentence has arrived', () => {
    expect(BRIDGE_PHASES.iris[0]).toBeGreaterThanOrEqual(
      BRIDGE_PHASES.arrive[1],
    )
    expect(frame(BRIDGE_PHASES.arrive[1]).statement).toBe(1)
  })

  it('keeps growing the hole for as long as the section is rising behind it', () => {
    let last = -1
    for (let p = 0; p <= 1; p += 0.01) {
      const { iris } = frame(p)
      expect(iris).toBeGreaterThanOrEqual(last)
      last = iris
    }
    // It is still well short of the screen when the devices have gone in, so
    // there is a hole onto the section and not just a flash of it.
    expect(frame(BRIDGE_PHASES.fall[1]).iris).toBeLessThan(60)
  })

  it('has no device and no glow left when the hole has taken the screen', () => {
    const end = frame(1)
    expect(end.core).toBe(0)
    for (const device of end.devices) expect(device.opacity).toBeLessThan(0.05)
  })

  it('draws every device into the hole', () => {
    for (const device of frame(1).devices) {
      expect(Math.hypot(device.x - HOLE.x, device.y - HOLE.y)).toBeLessThan(2)
    }
  })

  it('tightens each device spiral monotonically', () => {
    BRIDGE_DEVICES.forEach((_, index) => {
      let last = Infinity
      for (let p = BRIDGE_PHASES.fall[0] + 0.1; p <= 0.6; p += 0.01) {
        const d = frame(p).devices[index]
        const radius = Math.hypot(d.x - HOLE.x, d.y - HOLE.y)
        expect(radius).toBeLessThanOrEqual(last + 1e-6)
        last = radius
      }
    })
  })

  it('lights the glow only while the hole is small', () => {
    expect(frame(0).core).toBe(0)
    expect(frame(0.45).core).toBeGreaterThan(0.5)
    expect(frame(0.9).core).toBe(0)
  })

  it('never writes NaN, Infinity or negative zero', () => {
    for (const progress of [NaN, -1, 0, 0.4, 1, 2, Infinity]) {
      const f = bridgeFrame(progress, NaN, NaN)
      const values = [
        f.statement,
        f.iris,
        f.core,
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
      ]
      for (const value of values) {
        expect(Number.isFinite(value)).toBe(true)
        expect(Object.is(value, -0)).toBe(false)
      }
    }
  })
})
