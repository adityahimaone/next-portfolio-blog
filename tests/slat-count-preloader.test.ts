import {
  blindDelay,
  bootProgress,
  bootTimings,
  REDUCED_EXIT_MS,
  REDUCED_STEP_MS,
  sequenceIndexAt,
  SLAT_COUNT,
} from '@/components/ui/slat-count-preloader'

/**
 * The boot schedule, asserted without a DOM.
 *
 * The component's timings are the only thing on this screen a reader is asked
 * to wait through, so they are arithmetic in three pure functions rather than
 * a chain of setTimeouts inside an effect. That is what these cover: the step
 * the clock is on, the value the progress bar reports, and the frame the exit
 * begins on.
 *
 * `SlatCountPreloader` itself is not rendered here. It imports a CSS module,
 * and this suite runs without a stylesheet mapper — the component's
 * reachability (role, aria values, the skip control) is verified in the browser
 * instead, which is the only place a focus ring means anything.
 */

const SEQUENCE = ['003', '002', '001', 'READY'] as const
const STEP_MS = 560
const EXIT_MS = 640

describe('sequenceIndexAt', () => {
  it('holds each count for one beat and lands on the final frame', () => {
    expect(sequenceIndexAt(0, SEQUENCE.length, STEP_MS)).toBe(0)
    expect(sequenceIndexAt(STEP_MS - 1, SEQUENCE.length, STEP_MS)).toBe(0)
    expect(sequenceIndexAt(STEP_MS, SEQUENCE.length, STEP_MS)).toBe(1)
    expect(sequenceIndexAt(STEP_MS * 3, SEQUENCE.length, STEP_MS)).toBe(3)
  })

  it('clamps rather than wrapping, so a late tick still reads READY', () => {
    expect(sequenceIndexAt(STEP_MS * 99, SEQUENCE.length, STEP_MS)).toBe(3)
    expect(sequenceIndexAt(-500, SEQUENCE.length, STEP_MS)).toBe(0)
  })

  it('survives a degenerate schedule instead of dividing by zero', () => {
    expect(sequenceIndexAt(1200, 1, STEP_MS)).toBe(0)
    expect(sequenceIndexAt(1200, SEQUENCE.length, 0)).toBe(0)
  })
})

describe('bootProgress', () => {
  it('reports the first count as a quarter of the boot, not as zero', () => {
    expect(bootProgress(0, SEQUENCE.length)).toBeCloseTo(0.25, 6)
    expect(bootProgress(3, SEQUENCE.length)).toBe(1)
  })

  it('never leaves 0..1', () => {
    for (let step = -2; step <= 8; step += 1) {
      const value = bootProgress(step, SEQUENCE.length)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
    expect(bootProgress(0, 0)).toBe(1)
  })
})

describe('bootTimings', () => {
  it('starts the exit after the last count and completes one exit later', () => {
    const { exitAt, completeAt } = bootTimings(
      SEQUENCE.length,
      STEP_MS,
      EXIT_MS,
    )
    expect(exitAt).toBe(SEQUENCE.length * STEP_MS)
    expect(completeAt).toBe(exitAt + EXIT_MS)
    // The final count gets its own full beat on screen before the blinds move.
    expect(exitAt).toBeGreaterThanOrEqual(SEQUENCE.length * STEP_MS)
  })

  it('shortens under reduced motion without ever going backwards', () => {
    const normal = bootTimings(SEQUENCE.length, STEP_MS, EXIT_MS)
    const reduced = bootTimings(
      SEQUENCE.length,
      REDUCED_STEP_MS,
      REDUCED_EXIT_MS,
    )
    expect(reduced.completeAt).toBeLessThan(normal.completeAt)
    expect(reduced.exitAt).toBeLessThanOrEqual(reduced.completeAt)
  })
})

describe('blindDelay', () => {
  it('stagger the strips from the first to the last over the exit window', () => {
    expect(blindDelay(0, SLAT_COUNT, 600)).toBe(0)
    expect(blindDelay(SLAT_COUNT - 1, SLAT_COUNT, 600)).toBeCloseTo(600, 6)
    expect(blindDelay(2, SLAT_COUNT, 600)).toBeGreaterThan(
      blindDelay(1, SLAT_COUNT, 600),
    )
  })

  it('is monotonic across the rack, so no strip opens out of order', () => {
    let previous = -1
    for (let index = 0; index < SLAT_COUNT; index += 1) {
      const delay = blindDelay(index, SLAT_COUNT, 600)
      expect(delay).toBeGreaterThanOrEqual(previous)
      previous = delay
    }
    expect(blindDelay(0, 1, 600)).toBe(0)
  })
})

describe('the rack itself', () => {
  it('is drawn with an odd strip count, so the two fold origins balance', () => {
    expect(SLAT_COUNT % 2).toBe(1)
    expect(SLAT_COUNT).toBeGreaterThan(8)
  })
})
