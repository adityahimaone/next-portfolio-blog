import type { ChapterContext } from '../shared/engine'

/**
 * The about chapter: the tracklist scrubber. The progress readouts
 * (the arrangement workstation's playhead) and the card-selection
 * triggers both key off the section's scroll position, and the
 * section is the page's second landmark, so the chapter owns the
 * `#about` scroll contract.
 *
 * **It stands down inside the arrangement seam.** The About panel is no longer
 * a section in the page flow: it is the PROFILE clip's interior, pinned inside
 * the hero's sticky stage, and its two pieces of state are published by
 * `use-arrangement-hero` from the dive's own progress. A ScrollTrigger here
 * cannot see that motion at all — it measures layout, and a pinned interior's
 * rects never move — so it would report a constant progress and overwrite the
 * hook's, and its per-card triggers would fire once each at whatever offsets
 * the cards happened to sit at. Two writers, one value.
 *
 * The guard is the containing stage rather than a flag, so this chapter comes
 * back on its own the moment the About is rendered anywhere the arrangement
 * does not own the scroll. A missing section is also a return rather than a
 * trigger on `null`, which is what this used to do: `ScrollTrigger.create`
 * with no trigger element creates a trigger measuring the whole document.
 */
export function aboutChapter(ctx: ChapterContext): void {
  const { root, gsap, ScrollTrigger, setAboutProgress, setAboutIndex } = ctx

  const section = root.querySelector<HTMLElement>('[data-anim="about-section"]')
  if (!section) return
  if (section.closest('[data-arr-stage]')) return

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => setAboutProgress(self.progress),
  })

  const aboutCards = gsap.utils.toArray<HTMLElement>(
    '[data-anim="about-card"]',
    root,
  )
  aboutCards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 58%',
      end: 'bottom 42%',
      onEnter: () => setAboutIndex(index),
      onEnterBack: () => setAboutIndex(index),
    })
  })
}
