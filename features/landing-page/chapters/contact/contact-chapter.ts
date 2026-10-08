import { scrub, perspective } from '../shared/motion-tokens'
import type { ChapterContext } from '../shared/engine'

/**
 * The contact chapter: the deck's tilt-and-separate scrub
 * (brand, controls, mode rails, pads and note all drift to
 * different depths, which is what makes the deck read as a
 * physical object).
 *
 * The deck layers were the most deeply nested selectors in
 * the old hook — `.contact .contactDeck .contactDeckBrand`
 * and friends — so they are the biggest winners of the
 * `data-anim` switch: renaming the pad grid can no longer
 * drop the pads off the timeline.
 *
 * One thing was dropped with the split: the old hook's
 * second contact timeline (a clip-path reveal of
 * `.contactSignal`, a masked rise of `.contactHeadline`'s
 * spans, and a stagger for `.launchpadTopbar`,
 * `.launchpadHeader` and `.launchpadGrid`). None of those
 * classes exist in the markup — they were removed with the
 * deck's rebuild — so that timeline had been animating
 * nothing for as long as anyone can tell. It is left out
 * here rather than carried as a silent no-op; the deck's
 * entrance is handled by the heading chapter like every
 * other section's.
 */
export function contactChapter(ctx: ChapterContext): void {
  const { root, gsap } = ctx

  const contactDeck = root.querySelector<HTMLElement>(
    '[data-anim="contact-deck"]',
  )
  if (contactDeck) {
    const contactLayers = {
      brand: contactDeck.querySelector<HTMLElement>(
        '[data-anim="contact-deck-brand"]',
      ),
      controls: contactDeck.querySelector<HTMLElement>(
        '[data-anim="contact-deck-top"]',
      ),
      rails: gsap.utils.toArray<HTMLElement>(
        contactDeck.querySelectorAll<HTMLElement>(
          '[data-anim="contact-mode-rail"]',
        ),
      ),
      pads: contactDeck.querySelector<HTMLElement>(
        '[data-anim="contact-pad-grid"]',
      ),
      note: contactDeck.querySelector<HTMLElement>(
        '[data-anim="contact-deck-note"]',
      ),
    }
    const layers = Object.values(contactLayers).flatMap((layer) =>
      Array.isArray(layer) ? layer : layer ? [layer] : [],
    )

    gsap.set([contactDeck, ...layers], {
      transformPerspective: perspective.deck,
      transformStyle: 'preserve-3d',
      willChange: 'transform',
    })

    gsap
      .timeline({
        scrollTrigger: {
          trigger: contactDeck,
          start: 'top 90%',
          end: 'bottom 14%',
          scrub: scrub.default,
        },
      })
      .fromTo(
        contactDeck,
        { rotationX: 8, rotationY: -1.8, y: 34, scale: 0.96 },
        { rotationX: 0, rotationY: 0, y: 0, scale: 1, ease: 'none' },
        0,
      )
      .fromTo(
        contactLayers.brand ?? [],
        { y: 16, z: 0 },
        { y: -14, z: 18, ease: 'none' },
        0,
      )
      .fromTo(
        contactLayers.controls ?? [],
        { y: 16, z: 0 },
        { y: -4, z: 30, ease: 'none' },
        0,
      )
      .fromTo(
        contactLayers.rails,
        { y: 16, z: 0 },
        { y: 6, z: 22, ease: 'none' },
        0,
      )
      .fromTo(
        contactLayers.pads ?? [],
        { y: 16, z: 0 },
        { y: 12, z: 42, ease: 'none' },
        0,
      )
      .fromTo(
        contactLayers.note ?? [],
        { y: 16, z: 0 },
        { y: 18, z: 14, ease: 'none' },
        0,
      )
  }
}
