import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  buildScheduleForText,
  DEFAULT_FLICKER_CONFIG,
  type FlickerConfig,
  type FlickerSchedule,
} from './flicker.utils'

export interface UseFlickerOptions extends Partial<FlickerConfig> {
  mode?: 'settle' | 'loop'
  seed?: number
  onSettled?: () => void
  disabled?: boolean
}

export interface UseFlickerResult {
  schedules: FlickerSchedule[]
  settled: boolean
  handleCharSettled: (charIndex: number) => void
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])
  return reduced
}

export function useFlicker(
  text: string,
  options: UseFlickerOptions = {},
): UseFlickerResult {
  const { mode = 'settle', seed, onSettled, disabled, ...configOverrides } = options

  const config: FlickerConfig = useMemo(
    () => ({ ...DEFAULT_FLICKER_CONFIG, ...configOverrides }),
    [
      configOverrides.flickerWindowMs,
      configOverrides.minFlickers,
      configOverrides.maxFlickers,
      configOverrides.onFlickerRange,
      configOverrides.offFlickerRange,
      configOverrides.settleWindowMs,
      configOverrides.extraBrokenChance,
    ],
  )

  const schedules = useMemo(() => {
    if (disabled) {
      return Array.from(text).map(() => ({
        startDelayMs: 0,
        keyframes: [{ time: 0, state: 'on' as const }],
        totalDurationMs: 0,
      }))
    }
    return buildScheduleForText(text, config, seed)
  }, [text, config, seed, disabled])

  const [settledCount, setSettledCount] = useState(0)
  const settled = schedules.length > 0 && settledCount >= schedules.length

  const handleCharSettled = useCallback(
    (_charIndex: number) => {
      setSettledCount((prev) => {
        const next = prev + 1
        if (next >= schedules.length) {
          onSettled?.()
        }
        return next
      })
    },
    [schedules.length, onSettled],
  )

  return { schedules, settled, handleCharSettled }
}
