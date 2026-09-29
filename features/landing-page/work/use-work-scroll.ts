'use client'

import { useCallback, useState, type RefObject } from 'react'
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { scrollToY } from '@/features/landing-page/lib/smooth-scroll'
import { resolveActiveIndex, resolveTrackProgress } from './track-math'

export type WorkScroll = {
  scrollYProgress: MotionValue<number>
  trackProgress: MotionValue<number>
  activeIndex: number
  scrollToTrack: (index: number) => void
}

/**
 * Turns section scroll into the transport state: which project is playing and
 * how far the needle has travelled across it. Scroll stays the single source of
 * truth — there is no play timer to drift out of sync.
 */
export function useWorkScroll(
  ref: RefObject<HTMLElement | null>,
  count: number,
): WorkScroll {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const [activeIndex, setActiveIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const next = resolveActiveIndex(progress, count)
    setActiveIndex((previous) => (previous === next ? previous : next))
  })

  const trackProgress = useTransform(scrollYProgress, (progress) =>
    resolveTrackProgress(progress, count),
  )

  const scrollToTrack = useCallback(
    (index: number) => {
      const element = ref.current
      if (!element) return

      const top = element.getBoundingClientRect().top + window.scrollY
      const scrollable = element.offsetHeight - window.innerHeight
      if (scrollable <= 0) return

      // Land mid-track so the incoming record is already playing when it lands.
      const target = top + ((index + 0.5) / count) * scrollable
      scrollToY(target)
    },
    [ref, count],
  )

  return { scrollYProgress, trackProgress, activeIndex, scrollToTrack }
}
