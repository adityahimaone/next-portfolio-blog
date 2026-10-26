'use client'

import { useEffect, useState } from 'react'

import { CHAPTERS, type ChapterId } from './studio-data'

type PagePosition = {
  active: ChapterId
  scrolled: boolean
  footerVisible: boolean
}

/**
 * One scroll read for the header, the chapter rail and the progress line.
 * Change-only updates, rAF-throttled, and every listener gets a cleanup. The
 * boundaries are geometric rather than magical ratios so the active chapter
 * matches what the reader can actually see.
 */
export function usePagePosition(): PagePosition {
  const [state, setState] = useState<PagePosition>({
    active: 'home',
    scrolled: false,
    footerVisible: false,
  })

  useEffect(() => {
    let frame = 0

    const evaluate = () => {
      frame = 0
      const line = window.innerHeight * 0.38
      let current: ChapterId = 'home'
      for (const chapter of CHAPTERS) {
        const el = document.getElementById(chapter.id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = chapter.id
      }

      const footer = document.getElementById('outro')
      const footerVisible = footer
        ? footer.getBoundingClientRect().top < window.innerHeight - 96
        : false

      const next = {
        active: current,
        scrolled: window.scrollY > 24,
        footerVisible,
      }

      setState((previous) =>
        previous.active === next.active &&
        previous.scrolled === next.scrolled &&
        previous.footerVisible === next.footerVisible
          ? previous
          : next,
      )
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(evaluate)
    }

    evaluate()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return state
}
