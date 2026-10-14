import { letterFrame } from '../features/landing-page/components/matter/matter-type'

const N = { signal: 6, human: 5 } as const
const all = (p: number, word: 'signal' | 'human') =>
  Array.from({ length: N[word] }, (_, i) => letterFrame(p, word, i, N[word]))

test('SIGNAL fully legible at .35 and gone at .58', () => {
  all(0.35, 'signal').forEach((frame) => expect(frame.opacity).toBe(1))
  all(0.58, 'signal').forEach((frame) => expect(frame.opacity).toBe(0))
})

test('HUMAN fully legible at .58 and gone at .80 and after', () => {
  all(0.58, 'human').forEach((frame) => expect(frame.opacity).toBe(1))
  for (const progress of [0.8, 0.9, 1]) {
    all(progress, 'human').forEach((frame) => expect(frame.opacity).toBe(0))
  }
})

test('nothing is visible before the type beat', () => {
  all(0, 'signal')
    .concat(all(0, 'human'))
    .forEach((frame) => expect(frame.opacity).toBe(0))
})

test('the swap is partially staged at .53 and replay is deterministic', () => {
  const signal = all(0.53, 'signal')
  const human = all(0.53, 'human')
  expect(signal.some((frame) => frame.opacity > 0 && frame.opacity < 1)).toBe(
    true,
  )
  expect(human.some((frame) => frame.opacity > 0 && frame.opacity < 1)).toBe(
    true,
  )
  expect(letterFrame(0.53, 'signal', 2, 6)).toEqual(
    letterFrame(0.53, 'signal', 2, 6),
  )
})

test('degenerate input still returns finite values', () => {
  for (const value of Object.values(letterFrame(NaN, 'signal', NaN, 0))) {
    expect(Number.isFinite(value)).toBe(true)
  }
})
