'use client'

import { DapHero } from '../components/dap-hero'

/**
 * The hero. It used to be the pad sea; it is now a digital audio player that
 * the scroll takes apart, layer by layer, before falling into its own screen
 * to arrive at the About section.
 *
 * The component lives in `components/dap-hero` with its own stylesheet, hook
 * and pure choreography, and this file is only the seam `rack-01.tsx` imports.
 * It deliberately carries none of the old hero's `data-anim` hooks or
 * `rack-01.module.css` classes, so the chapter engine's hero timelines find
 * nothing to drive and stand down (see `use-rack-animations.ts` and
 * `chapters/hero/hero-chapter.ts`).
 */
export function Hero() {
  return <DapHero />
}
