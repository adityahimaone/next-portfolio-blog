'use client'

import React from 'react'
import { FlickerChar } from './flicker-char'
import { useFlicker, usePrefersReducedMotion, type UseFlickerOptions } from './use-flicker'
import { cn } from '@/lib/utils'

export interface BrokenLightTextProps extends UseFlickerOptions {
  text: string
  as?: React.ElementType
  glowColor?: string
  className?: string
}

export function BrokenLightText({
  text,
  as: Component = 'span',
  glowColor,
  className,
  onSettled,
  mode = 'settle',
  seed,
  ...flickerConfig
}: BrokenLightTextProps) {
  const reducedMotion = usePrefersReducedMotion()

  const { schedules, handleCharSettled } = useFlicker(text, {
    mode,
    seed,
    onSettled,
    disabled: reducedMotion,
    ...flickerConfig,
  })

  if (reducedMotion) {
    return <Component className={className}>{text}</Component>
  }

  // Word-aware splitting so text wraps cleanly on word boundaries
  const words = text.split(' ')
  let globalCharIndex = 0

  return (
    <Component className={cn('inline-block', className)} aria-label={text}>
      {words.map((word, wordIndex) => {
        const wordChars = Array.from(word)
        const wordStartIndex = globalCharIndex

        // Advance index past word + 1 space
        globalCharIndex += wordChars.length + 1

        return (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {wordChars.map((char, charIndex) => {
              const charIdx = wordStartIndex + charIndex
              const schedule = schedules[charIdx]

              return (
                <FlickerChar
                  key={charIndex}
                  char={char}
                  schedule={schedule}
                  glowColor={glowColor}
                  mode={mode}
                  onSettled={() => handleCharSettled(charIdx)}
                />
              );
            })}
            {wordIndex < words.length - 1 && (
              <span aria-hidden="true">&nbsp;</span>
            )}
          </span>
        )
      })}
    </Component>
  )
}

export default BrokenLightText
