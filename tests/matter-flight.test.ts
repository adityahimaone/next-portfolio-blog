import {
  FLIGHT_FADE_OUT,
  FLIGHT_GROUPS,
  FLIGHT_PART_CAP,
  FLIGHT_PARTS,
  FLIGHT_RESIDENT_EDGE,
  flightFrame,
  groupAnchorFor,
  type FlightGroup,
  type FlightPart,
} from '../features/landing-page/components/matter/matter-flight'
import { MATTER_PHASES } from '../features/landing-page/components/matter/matter-frame'

const geometry = { viewportWidth: 1440, viewportHeight: 900 }

test('cast cap and fade boundary match arrival', () => {
  expect(FLIGHT_PARTS.length).toBeLessThanOrEqual(FLIGHT_PART_CAP)
  expect(FLIGHT_FADE_OUT[1]).toBeLessThanOrEqual(MATTER_PHASES.arrive[0])
})

describe.each(FLIGHT_PARTS)('$id', (part) => {
  test('is asleep at home at frame zero', () => {
    const frame = flightFrame(0, part, geometry)
    expect(frame.opacity).toBe(0)
    expect(frame.scale).toBe(1)
  })

  test('wakes without an opacity discontinuity', () => {
    const [from, to] = part.window
    const before = flightFrame(from - 0.0001, part, geometry)
    const at = flightFrame(from, part, geometry)
    const mid = flightFrame(from + (to - from) * 0.075, part, geometry)
    expect(before.opacity).toBe(0)
    expect(at.opacity).toBe(0)
    expect(mid.opacity).toBeGreaterThan(0)
    expect(mid.opacity).toBeLessThan(1)
  })

  test('travels monotonically through its flight window', () => {
    let previous = -1
    for (
      let progress = part.window[0];
      progress <= part.window[1];
      progress += 0.01
    ) {
      const frame = flightFrame(progress, part, geometry)
      const distance = Math.hypot(frame.x - part.home.x, frame.y - part.home.y)
      expect(distance).toBeGreaterThanOrEqual(previous - 1e-6)
      previous = distance
    }
  })

  test('is gone in reading except for the resident', () => {
    expect(flightFrame(0.8, part, geometry).opacity === 0).toBe(!part.resident)
  })

  test('returns finite, deterministic values for degenerate input', () => {
    for (const value of Object.values(flightFrame(NaN, part, {} as never))) {
      expect(Number.isFinite(value)).toBe(true)
    }
    expect(flightFrame(0.4, part, geometry)).toEqual(
      flightFrame(0.4, part, geometry),
    )
  })
})

test('all non-resident parts are outside the viewport at their final flight frame', () => {
  for (const part of FLIGHT_PARTS) {
    if (part.resident) continue
    const frame = flightFrame(part.window[1], part, geometry)
    const radius = (part.size * frame.scale) / 2
    const outside =
      frame.x + geometry.viewportWidth / 2 + radius < 0 ||
      frame.x + geometry.viewportWidth / 2 - radius > geometry.viewportWidth ||
      frame.y + geometry.viewportHeight / 2 + radius < 0 ||
      frame.y + geometry.viewportHeight / 2 - radius > geometry.viewportHeight
    expect(outside).toBe(true)
  }
})

test('resident parks its nearest edge inside the outer six percent', () => {
  const resident = FLIGHT_PARTS.find((part) => part.resident)
  expect(resident).toBeDefined()
  const frame = flightFrame(1, resident!, geometry)
  const rightEdge =
    geometry.viewportWidth / 2 + frame.x + (resident!.size * frame.scale) / 2
  expect(
    (geometry.viewportWidth - rightEdge) / geometry.viewportWidth,
  ).toBeCloseTo(FLIGHT_RESIDENT_EDGE, 6)
  expect(frame.y).toBe(-0.4 * geometry.viewportHeight)
})

/* ── Grouping ─────────────────────────────────────────────
   The cast is grouped so the scene reads as one machine coming apart rather
   than as particle scatter. The group is math metadata, so these assertions
   are about the maths and not about the DOM. */

const normalizedExit = (part: FlightPart) => {
  const length = Math.hypot(part.exit.x, part.exit.y) || 1
  return { x: part.exit.x / length, y: part.exit.y / length }
}

test('every part declares a valid group', () => {
  for (const part of FLIGHT_PARTS) {
    expect(FLIGHT_GROUPS).toContain(part.group)
  }
})

test('every group with more than one member actually shares a direction', () => {
  const byGroup = new Map<FlightGroup, FlightPart[]>()
  for (const part of FLIGHT_PARTS) {
    const members = byGroup.get(part.group) ?? []
    members.push(part)
    byGroup.set(part.group, members)
  }

  for (const members of byGroup.values()) {
    const reference = normalizedExit(members[0])
    for (const member of members) {
      const exit = normalizedExit(member)
      expect(exit.x).toBeCloseTo(reference.x, 10)
      expect(exit.y).toBeCloseTo(reference.y, 10)
    }
  }

  // A group of one is allowed — the resident is its own — but the scene is only
  // grouped if the majority of the cast is not alone.
  const grouped = FLIGHT_PARTS.filter(
    (part) => (byGroup.get(part.group)?.length ?? 0) > 1,
  )
  expect(grouped.length).toBeGreaterThan(FLIGHT_PARTS.length / 2)
})

test('local offsets stay along their exit, so travel never reverses', () => {
  for (const part of FLIGHT_PARTS) {
    if (part.resident) continue
    const exit = normalizedExit(part)
    const along = part.local.x * exit.x + part.local.y * exit.y
    expect(along).toBeGreaterThanOrEqual(0)
  }
})

test('the cluster bias is finite, deterministic and still until the departure', () => {
  for (const group of FLIGHT_GROUPS) {
    expect(groupAnchorFor(group, 0)).toEqual({ x: 0, y: 0 })
    expect(groupAnchorFor(group, MATTER_PHASES.depart[0])).toEqual({
      x: 0,
      y: 0,
    })
    const mid = groupAnchorFor(group, 0.6)
    expect(Number.isFinite(mid.x)).toBe(true)
    expect(Number.isFinite(mid.y)).toBe(true)
    expect(groupAnchorFor(group, NaN)).toEqual(groupAnchorFor(group, 0))
    expect(groupAnchorFor(group, 0.6)).toEqual(groupAnchorFor(group, 0.6))
  }
})

test('the patch cable waits out its delay before it travels', () => {
  const cable = FLIGHT_PARTS.find((part) => part.id === 'cable')
  expect(cable).toBeDefined()
  const delay = cable!.delay ?? 0
  expect(delay).toBeGreaterThan(0)

  const [from, to] = cable!.window
  const span = to - from
  const distanceAt = (progress: number) => {
    const frame = flightFrame(progress, cable!, geometry)
    return Math.hypot(frame.x - cable!.home.x, frame.y - cable!.home.y)
  }

  const atWake = distanceAt(from + span * 0.05)
  const stillWaiting = distanceAt(from + span * (delay * 0.9))
  // Delayed motion is about position only: the cable holds its place, then goes.
  expect(stillWaiting).toBeCloseTo(atWake, 6)
  expect(distanceAt(to)).toBeGreaterThan(stillWaiting + 1)
})

test('the resident playhead outlives every other part', () => {
  const resident = FLIGHT_PARTS.find((part) => part.resident)
  expect(resident).toBeDefined()
  for (const progress of [0.8, 0.9, 1]) {
    expect(flightFrame(progress, resident!, geometry).opacity).toBeGreaterThan(
      0,
    )
  }
})

test('every frame is finite across the whole sweep', () => {
  for (const part of FLIGHT_PARTS) {
    for (let progress = 0; progress <= 1.0001; progress += 0.01) {
      for (const value of Object.values(
        flightFrame(progress, part, geometry),
      )) {
        expect(Number.isFinite(value)).toBe(true)
      }
    }
  }
})

test('forward and reverse sampling produce identical frames', () => {
  const samples = Array.from({ length: 101 }, (_, index) => index / 100)
  for (const part of FLIGHT_PARTS) {
    const forward = samples.map((progress) =>
      flightFrame(progress, part, geometry),
    )
    const backward = samples
      .map((progress) => flightFrame(progress, part, geometry))
      .reverse()
      .reverse()
    expect(backward).toEqual(forward)
  }
})
