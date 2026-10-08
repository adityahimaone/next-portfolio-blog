import { EXPERIENCES } from '../../constants'
import type { ChapterContext } from '../shared/engine'
import styles from '../../rack-01/rack-01.module.css'

/**
 * The experience chapter (legacy layout): the tape wheels spin
 * across the section and the carousel advances through the four
 * stations over the first 52% of the scrub.
 *
 * This chapter only runs when the radio flip is off — with the flip
 * on, the tune phase moves into the flip window's own timeline
 * (useRadioFlip) and the deck becomes the radio's front face. The
 * `.tapeWheel` class is CassetteFace's own, so it stays a class
 * selector: co-located with the component that renders the wheels.
 */
export function useExperienceChapter(ctx: ChapterContext): void {
  const { root, gsap, ScrollTrigger, setExperienceIndex } = ctx

  gsap.to(`.${styles.tapeWheel}`, {
    rotate: 920,
    ease: 'none',
    scrollTrigger: {
      trigger: root.querySelector<HTMLElement>(
        '[data-anim="experience-section"]',
      ),
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: (self) => {
        const experienceProgress = Math.min(1, self.progress / 0.52)
        const next = Math.min(
          EXPERIENCES.length - 1,
          Math.floor(experienceProgress * EXPERIENCES.length),
        )
        setExperienceIndex((current) =>
          current === next ? current : next,
        )
      },
    },
  })
}
