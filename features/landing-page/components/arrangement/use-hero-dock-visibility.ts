'use client'

import { useEffect, type RefObject } from 'react'

import {
  setInterfaceVisibility,
  type InterfaceVisibility,
} from '@/hooks/use-hide-interface'

/**
 * The dock's own claim on the bottom of the viewport.
 *
 * It sits at `bottom-4`/`bottom-5` with an `h-12` body, so it occupies roughly
 * the last 68px of the window. Anything whose top edge reaches this line is
 * about to be read, and once it has, the dock can come back without landing on
 * top of it — which is what makes this the threshold rather than a tuned guess.
 *
 * Kept in step with the dock's own height: it was 76 when the dock was `h-14`,
 * so a resize of the bar has to move this number with it or the dock returns
 * early and lands on the thing it was waiting for.
 */
const DOCK_CLEARANCE = 68

/** Below the desktop header there is a menu button, so the dock is redundant. */
const COMPACT_LAYOUT = '(max-width: 1023px)'

/**
 * Retires the dock while the arrangement owns the frame, and brings it back
 * once the biography does.
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
 * ## The rule
 *
 * **Hidden while the arrangement owns the frame, shown once About does, hidden
 * again while the footer is on screen.** The last clause is newer: the footer
 * ends in a giant script wordmark, and the dock was landing squarely on the
 * middle of it. The footer has its own navigation, so the dock can step aside
 * for the finale and come back if the reader scrolls up.
 *
 * The reading panel's own top edge is the boundary. Below the clearance line it
 * is still arriving and the dock stays out; at or above it, the reader has the
 * biography and the dock can come back without covering the first sentence.
 *
 * The element is looked up rather than passed in because the two live in
 * different components — the hero owns the dock, the bridge owns the panel —
 * and a ref threaded between them would be a coupling with no other purpose.
 * The lookup is memoised and re-tried, so a route that renders no About falls
 * back to the hero's own bottom edge instead of leaving the dock hidden.
 */
export function useHeroDockVisibility({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>
}) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const compactLayout = window.matchMedia(COMPACT_LAYOUT)
    let frame = 0
    let applied: InterfaceVisibility | null = null
    let about: HTMLElement | null = null
    let outro: HTMLElement | null = null

    const aboutOwnsTheFrame = () => {
      if (!about) about = document.getElementById('about')
      const boundary = about ?? section
      return (
        boundary.getBoundingClientRect().top <=
        window.innerHeight - DOCK_CLEARANCE
      )
    }

    const evaluate = () => {
      frame = 0
      if (!outro) outro = document.getElementById('outro')
      const footerOwnsTheFrame = outro
        ? outro.getBoundingClientRect().top <
          window.innerHeight - DOCK_CLEARANCE
        : false
      // On compact layouts the header's menu already carries every destination.
      // The dock was landing on cards, cards' chips and the footer wordmark.
      const visibility: InterfaceVisibility =
        compactLayout.matches || footerOwnsTheFrame || !aboutOwnsTheFrame()
          ? 'hidden'
          : 'visible'
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
    // A preference flip re-lays the whole page out without firing a resize.
    compactLayout.addEventListener('change', schedule)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      compactLayout.removeEventListener('change', schedule)
      // The flag outlives this tree on purpose: it is written to the document
      // element so a page in another React tree can read it. Leaving it behind
      // would retire the dock on every other route that renders one, which is
      // why it is restored here rather than left to the dock to notice.
      setInterfaceVisibility('visible')
    }
  }, [sectionRef])
}
