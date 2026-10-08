import type { ChapterContext } from '../shared/engine'

/**
 * The about chapter: the tracklist scrubber. The progress readouts
 * (the arrangement workstation's playhead) and the card-selection
 * triggers both key off the section's scroll position, and the
 * section is the page's second landmark, so the chapter owns the
 * `#about` scroll contract.
 */
export function aboutChapter(ctx: ChapterContext): void {
  const { root, gsap, ScrollTrigger, setAboutProgress, setAboutIndex } = ctx

  ScrollTrigger.create({
    trigger: root.querySelector<HTMLElement>('[data-anim="about-section"]'),
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
