'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { buildKeyframeArrays, type FlickerSchedule } from './flicker.utils'

export interface FlickerCharProps {
  char: string
  schedule: FlickerSchedule
  glowColor?: string
  mode?: 'settle' | 'loop'
  onSettled?: () => void
}

export function FlickerChar({
  char,
  schedule,
  glowColor,
  mode = 'settle',
  onSettled,
}: FlickerCharProps) {
  const keyframes = useMemo(
    () => buildKeyframeArrays(schedule, glowColor),
    [schedule, glowColor],
  )

  const [isLoopingFlicker, setIsLoopingFlicker] = useState(false)

  useEffect(() => {
    if (mode !== 'loop' || char === ' ') return

    // Trigger occasional random single-blink flickers after initial reveal
    const initialDelay = (schedule.startDelayMs + schedule.totalDurationMs) + 2000
    let timer: NodeJS.Timeout

    const scheduleNextFlicker = () => {
      const delay = 3000 + Math.random() * 4000
      timer = setTimeout(() => {
        if (Math.random() < 0.25) {
          setIsLoopingFlicker(true)
          setTimeout(() => setIsLoopingFlicker(false), 140)
        }
        scheduleNextFlicker()
      }, delay)
    }

    const startTimer = setTimeout(scheduleNextFlicker, initialDelay)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(timer)
    }
  }, [mode, char, schedule])

  if (char === ' ') {
    return <span>&nbsp;</span>
  }

  return (
    <motion.span
      aria-hidden="true"
      className="inline-block transition-[opacity,filter,text-shadow] duration-75"
      initial={{
        opacity: 0.08,
        filter: 'blur(1.5px)',
        textShadow: '0 0 2px transparent',
      }}
      animate={
        isLoopingFlicker
          ? {
              opacity: 0.1,
              filter: 'blur(1.5px)',
              textShadow: '0 0 2px transparent',
            }
          : {
              opacity: keyframes.opacity,
              filter: keyframes.filter,
              textShadow: keyframes.textShadow,
            }
      }
      transition={
        isLoopingFlicker
          ? { duration: 0.06 }
          : {
              duration: keyframes.totalDurationSec,
              delay: keyframes.startDelaySec,
              times: keyframes.times,
              ease: 'easeInOut',
            }
      }
      onAnimationComplete={() => {
        onSettled?.()
      }}
    >
      {char}
    </motion.span>
  )
}
