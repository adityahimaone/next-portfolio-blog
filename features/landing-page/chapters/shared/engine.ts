import type gsap from 'gsap'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * What every chapter needs from the page: the rack root to query
 * against, the motion libraries (dynamically imported by the
 * orchestrator, so a chapter never pays for them at load), and the
 * state setters the scroll timelines write back into.
 *
 * Chapters run inside the orchestrator's `gsap.context` and its
 * `matchMedia('(min-width: 769px)')` scope, so they set timelines up
 * and return; the context revert and the media revert are the
 * teardown. A chapter that adds its own listeners returns a cleanup
 * for them.
 *
 * The libraries are imported as types only: the values arrive through
 * the context, and a static import here would put GSAP on the page's
 * critical path, which is exactly what the dynamic import in the
 * orchestrator avoids.
 */
export type ChapterContext = {
  root: HTMLElement
  gsap: typeof gsap
  ScrollTrigger: typeof ScrollTrigger
  setAboutIndex: React.Dispatch<React.SetStateAction<number>>
  setAboutProgress: React.Dispatch<React.SetStateAction<number>>
  setExperienceIndex: React.Dispatch<React.SetStateAction<number>>
}

/** A chapter's optional teardown, run when its media query stops
     matching or the orchestrator reverts. */
export type ChapterCleanup = void | (() => void) | undefined
