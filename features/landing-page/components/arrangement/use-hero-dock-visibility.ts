'use client'

import { useEffect, type RefObject } from 'react'

import {
  setInterfaceVisibility,
  type InterfaceVisibility,
} from '@/hooks/use-hide-interface'

/**
 * The dock's own claim on the bottom of the viewport.
 *
 * It sits at `bottom-4`/`bottom-5` with an `h-14` body, so it occupies roughly
 * the last 76px of the window. Anything whose top edge reaches this line is
 * about to be read, and once it has, the dock can come back without landing on
 * top of it — which is what makes this the threshold rather than a tuned guess.
 */
const DOCK_CLEARANCE = 76

/** The layouts that un-pin the stage and stack About beneath it. */
const FLOW_LAYOUT = '(max-width: 768px), (prefers-reduced-motion: reduce)'

/**
 * Retires the dock while the arrangement owns the frame, and brings it back
 * once About does.
 *
 * The dock is the one piece of chrome this tree cannot reach with CSS. It is
 * rendered by the root layout — a different React tree, on the far side of the
 * `AudioProvider` — so a rule scoped to `.hero` can never scope it. It goes out
 * through the same document-level channel the mixtape's stealth mode already
 * uses, which the dock already subscribes to and already handles by unmounting.
 *
 * Unmounting is also why the reveal costs nothing. The dock's `dock-rise`
 * keyframes run on *every* mount — opacity 0 → 1 over `translateY(14px)` → 0 —
 * so coming back is the fade-up-from-the-bottom the design asks for. There is
 * no new animation here to write, and none to keep in sync.
 *
 * The rule is one sentence: **hidden while the arrangement owns the frame,
 * shown once About does.** Two ways that can be true, and they are not
 * interchangeable:
 *
 * - **The dive** pins the stage for the whole window, so nothing about the
 *   geometry ever moves — the seam's own state is the only thing that does.
 *   This branch reads a dataset and no rect. Reading a rect here returns
 *   "always visible": the seam is an absolute overlay filling the stage, so its
 *   box is the stage's whether or not the window has opened.
 * - **The flow layouts** un-pin the stage and stack About underneath it, and
 *   nothing writes `data-seam` without the dive, so the scroll position has to
 *   answer instead. The seam is `position: relative` there and its box *is*
 *   About's, which is why measuring the seam is measuring the thing that
 *   arrived rather than the thing it arrived in.
 *
 * Both branches are re-evaluated on scroll and on resize, and on a
 * `prefers-reduced-motion` flip, so a visitor who changes the setting mid-page
 * gets the branch their layout actually uses rather than whichever one ran
 * first.
 */
export function useHeroDockVisibility({
  sectionRef,
  seamRef,
}: {
  sectionRef: RefObject<HTMLElement | null>
  seamRef: RefObject<HTMLDivElement | null>
}) {
  useEffect(() => {
    const section = sectionRef.current
    const seam = seamRef.current
    if (!section || !seam) return

    const flowLayout = window.matchMedia(FLOW_LAYOUT)
    let frame = 0
    let applied: InterfaceVisibility | null = null

    const aboutOwnsTheFrame = () => {
      if (!flowLayout.matches) return section.dataset.seam === 'open'
      return (
        seam.getBoundingClientRect().top <= window.innerHeight - DOCK_CLEARANCE
      )
    }

    const evaluate = () => {
      frame = 0
      const visibility: InterfaceVisibility = aboutOwnsTheFrame()
        ? 'visible'
        : 'hidden'
      // On change only, like the datasets the hero already writes. The publish
      // costs a React state update in a second tree and a style recalc on the
      // document element, neither of which a scroll tick can afford to repeat.
      if (visibility === applied) return
      applied = visibility
      setInterfaceVisibility(visibility)
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(evaluate)
    }

    evaluate()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    flowLayout.addEventListener('change', schedule)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      flowLayout.removeEventListener('change', schedule)
      // The flag outlives this tree on purpose: it is written to the document
      // element so a page in another React tree can read it. Leaving it behind
      // would retire the dock on every other route that renders one, which is
      // why it is restored here rather than left to the dock to notice.
      setInterfaceVisibility('visible')
    }
  }, [sectionRef, seamRef])
}
