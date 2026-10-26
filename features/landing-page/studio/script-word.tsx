'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'

import { layoutScript, round } from '@/components/ui/sticker-slap-footer'

import { useInView } from './use-in-view'

type Props = {
  /** Letters a–z, `!` and `.`. The same marker alphabet the footer is drawn in. */
  text: string
  className?: string
  strokeWidth?: number
  /** Screen readers get this when the word is not purely decorative. */
  label?: string
  delay?: number
}

/**
 * Section annotations in the footer's own single-stroke script. Keeping one
 * hand for the whole page is the cheapest possible continuity: the same path
 * data that writes "aditya" at the bottom also writes "hello!" at the top.
 */
export function ScriptWord({
  text,
  className,
  strokeWidth = 3.3,
  label,
  delay = 0,
}: Props) {
  const reduced = useReducedMotion() ?? false
  const { ref, inView } = useInView<SVGSVGElement>()
  const shown = reduced || inView
  const word = useMemo(() => layoutScript(text), [text])

  if (!word.width) return null

  const pad = strokeWidth / 2 + 0.6
  const vbX = -1.4 - pad
  const vbY = word.top - pad
  const vbW = word.width + 2.8 + pad * 2 - word.top * 0.1584
  const vbH = word.bottom + pad - vbY

  return (
    <svg
      ref={ref}
      viewBox={[vbX, vbY, vbW, vbH].map(round).join(' ')}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <g transform="skewX(-9)">
        <motion.path
          d={word.main}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={
            shown
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
        {word.extra.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={
              shown
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{
              duration: 0.28,
              delay: delay + 0.9 + i * 0.16,
              ease: 'easeOut',
            }}
          />
        ))}
      </g>
    </svg>
  )
}
