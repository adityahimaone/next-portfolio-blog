export type FlickerKeyframe = {
  time: number
  state: 'on' | 'off'
}

export type FlickerSchedule = {
  startDelayMs: number
  keyframes: FlickerKeyframe[]
  totalDurationMs: number
}

export interface FlickerConfig {
  flickerWindowMs: [number, number]
  minFlickers: number
  maxFlickers: number
  onFlickerRange: [number, number]
  offFlickerRange: [number, number]
  settleWindowMs: [number, number]
  extraBrokenChance: number
}

export const DEFAULT_FLICKER_CONFIG: FlickerConfig = {
  flickerWindowMs: [50, 650],
  minFlickers: 2,
  maxFlickers: 6,
  onFlickerRange: [60, 220],
  offFlickerRange: [30, 90],
  settleWindowMs: [250, 450],
  extraBrokenChance: 0.18,
}

function createPrng(seed: number) {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomInRange([min, max]: [number, number], rand: () => number) {
  return min + rand() * (max - min)
}

function randomInt(min: number, max: number, rand: () => number) {
  return Math.floor(randomInRange([min, max + 1], rand))
}

export function buildFlickerSchedule(
  charIndex: number,
  config: FlickerConfig = DEFAULT_FLICKER_CONFIG,
  rand: () => number = Math.random,
): FlickerSchedule {
  const isExtraBroken = rand() < config.extraBrokenChance

  const startDelayMs =
    randomInRange(config.flickerWindowMs, rand) +
    (isExtraBroken ? randomInRange([120, 300], rand) : 0)

  const minFlickers = isExtraBroken
    ? config.minFlickers + 2
    : config.minFlickers
  const maxFlickers = isExtraBroken
    ? config.maxFlickers + 3
    : config.maxFlickers
  const flickerCount = randomInt(minFlickers, maxFlickers, rand)

  const keyframes: FlickerKeyframe[] = []
  let currentTime = 0

  for (let i = 0; i < flickerCount; i++) {
    const offDuration = randomInRange(config.offFlickerRange, rand)
    keyframes.push({ time: currentTime, state: 'off' })
    currentTime += offDuration

    const onDuration = randomInRange(config.onFlickerRange, rand)
    keyframes.push({ time: currentTime, state: 'on' })
    currentTime += onDuration
  }

  // Final settle on state
  keyframes.push({ time: currentTime, state: 'on' })

  return {
    startDelayMs: Math.round(startDelayMs),
    keyframes,
    totalDurationMs: Math.round(currentTime),
  }
}

export function buildScheduleForText(
  text: string,
  config: FlickerConfig = DEFAULT_FLICKER_CONFIG,
  seed?: number,
): FlickerSchedule[] {
  const rand = seed !== undefined ? createPrng(seed) : Math.random

  return Array.from(text).map((char, index) => {
    if (char === ' ') {
      return {
        startDelayMs: 0,
        keyframes: [{ time: 0, state: 'on' }],
        totalDurationMs: 0,
      }
    }
    return buildFlickerSchedule(index, config, rand)
  })
}

export function buildKeyframeArrays(
  schedule?: FlickerSchedule,
  glowColor?: string,
) {
  const hasGlow = Boolean(glowColor)

  const getShadow = (isOn: boolean) => {
    if (!hasGlow) return 'none'
    return isOn
      ? `0 0 10px ${glowColor}, 0 0 22px ${glowColor}aa, 0 0 34px ${glowColor}44`
      : '0 0 2px transparent'
  }

  if (!schedule || !schedule.keyframes || schedule.keyframes.length === 0) {
    const shadow = getShadow(true)
    return {
      times: [0, 1],
      opacity: [1, 1],
      filter: ['blur(0px)', 'blur(0px)'],
      textShadow: [shadow, shadow],
      totalDurationSec: 0.1,
      startDelaySec: 0,
    }
  }

  const totalDurationMs = Math.max(
    80,
    schedule.keyframes[schedule.keyframes.length - 1].time,
  )
  const startDelaySec = schedule.startDelayMs / 1000

  const times: number[] = [0]
  const opacity: number[] = [0.08]
  const filter: string[] = ['blur(1.5px)']
  const textShadow: string[] = [getShadow(false)]

  for (const kf of schedule.keyframes) {
    const normTime = Math.min(1, Math.max(0, kf.time / totalDurationMs))
    if (times.length > 0 && Math.abs(times[times.length - 1] - normTime) < 0.001) {
      continue
    }
    const isOn = kf.state === 'on'
    times.push(normTime)
    opacity.push(isOn ? 1 : 0.1)
    filter.push(isOn ? 'blur(0px)' : 'blur(1.5px)')
    textShadow.push(getShadow(isOn))
  }

  if (times[times.length - 1] < 1) {
    times.push(1)
    opacity.push(1)
    filter.push('blur(0px)')
    textShadow.push(getShadow(true))
  }

  return {
    times,
    opacity,
    filter,
    textShadow,
    totalDurationSec: Math.max(0.15, totalDurationMs / 1000),
    startDelaySec,
  }
}
