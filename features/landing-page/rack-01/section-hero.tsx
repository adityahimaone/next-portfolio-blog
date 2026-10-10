'use client'

import { RiddimHero } from '../components/riddim-hero'

/**
 * The hero: the RIDDIM SUPERTONE, laid on its side across the frame.
 *
 * It used to be a digital audio player that the scroll took apart; it is now a
 * layering machine that the scroll powers up — knobs turning, lamps stepping
 * on, the screen's glyph field lighting in sequence — before the display turns
 * into the About surface and opens onto the section itself.
 *
 * The component lives in `components/riddim-hero` with its own stylesheet, hook,
 * measured clone geometry and pure choreography, and this file is only the seam
 * `rack-01.tsx` imports. It deliberately carries none of the old hero's
 * `data-anim` hooks or `rack-01.module.css` classes, so the chapter engine's
 * hero timelines find nothing to drive and stand down (see
 * `use-rack-animations.ts` and `chapters/hero/hero-chapter.ts`).
 */
export function Hero() {
  return <RiddimHero />
}
