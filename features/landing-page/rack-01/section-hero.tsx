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
 * `rack-01.tsx` imports. The hero owns its motion; the page engines
 * (`use-rack-animations.ts`, `chapters/`) have no hero timelines at all.
 */
export function Hero() {
  return <RiddimHero />
}
