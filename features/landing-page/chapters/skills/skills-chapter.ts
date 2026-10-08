import { scrub, perspective } from '../shared/motion-tokens'
import type { ChapterContext } from '../shared/engine'
import styles from '../../rack-01/rack-01.module.css'

/**
 * The skills chapter: the controller's lid-scrub, the step-sequencer
 * sequence (pads → params → faders, dispatched as a custom event the
 * console also listens to) and the studio-detail rises.
 *
 * The sequence groups were attributes from the start
 * (`data-skill-sequence`); the section, the controller and the
 * detail paragraphs are addressed by `data-anim` now. The one class
 * selector kept — `styles.skillsSequenceActive` — is a class the
 * console component itself toggles, so the class and the component
 * that owns it move together.
 */
export function skillsChapter(ctx: ChapterContext): void {
  const { root, gsap, ScrollTrigger } = ctx

  gsap.fromTo(
    '[data-anim="skills-controller"]',
    {
      rotationX: 20,
      transformPerspective: perspective.controller,
      scale: 1.05,
      yPercent: 0,
    },
    {
      rotationX: 0,
      scale: 1,
      yPercent: -2,
      transformOrigin: '50% 0%',
      ease: 'none',
      scrollTrigger: {
        trigger: root.querySelector<HTMLElement>('[data-anim="skills-section"]'),
        start: 'top top',
        end: 'bottom bottom',
        scrub: scrub.drift,
      },
    },
  )

  const skillSection = root.querySelector<HTMLElement>(
    '[data-anim="skills-section"]',
  )
  if (skillSection) {
    const sequenceGroups = {
      pads: gsap.utils.toArray<HTMLElement>(
        skillSection.querySelectorAll<HTMLElement>(
          '[data-skill-sequence="pad"]',
        ),
      ),
      params: gsap.utils.toArray<HTMLElement>(
        skillSection.querySelectorAll<HTMLElement>(
          '[data-skill-sequence="param"]',
        ),
      ),
      faders: gsap.utils.toArray<HTMLElement>(
        skillSection.querySelectorAll<HTMLElement>(
          '[data-skill-sequence="fader"]',
        ),
      ),
    }
    const activateThrough = (
      items: HTMLElement[],
      progress: number,
      start: number,
      end: number,
    ) => {
      const local = Math.max(0, Math.min(1, (progress - start) / (end - start)))
      const activeCount = Math.ceil(local * items.length)
      items.forEach((item, index) => {
        item.classList.toggle(
          styles.skillsSequenceActive,
          index < activeCount,
        )
      })
    }
    const activateCurrent = (
      items: HTMLElement[],
      progress: number,
      start: number,
      end: number,
    ) => {
      const local = Math.max(0, Math.min(1, (progress - start) / (end - start)))
      const activeIndex = Math.min(
        items.length - 1,
        Math.floor(local * items.length),
      )
      items.forEach((item, index) =>
        item.classList.toggle(
          styles.skillsSequenceActive,
          local > 0 && index === activeIndex,
        ),
      )
    }

    ScrollTrigger.create({
      trigger: skillSection,
      start: 'top 94%',
      end: 'bottom 10%',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress
        skillSection.dispatchEvent(
          new CustomEvent<number>('skills-sequence', {
            detail: progress,
          }),
        )
        activateCurrent(sequenceGroups.pads, progress, 0.02, 0.34)
        activateThrough(sequenceGroups.params, progress, 0.24, 0.5)
        activateThrough(sequenceGroups.faders, progress, 0.46, 0.72)
      },
      onLeaveBack: () => {
        Object.values(sequenceGroups)
          .flat()
          .forEach((item) =>
            item.classList.remove(styles.skillsSequenceActive),
          )
        skillSection.dispatchEvent(
          new CustomEvent<number>('skills-sequence', { detail: -1 }),
        )
      },
    })
  }

  const studioDetails = gsap.utils.toArray<HTMLElement>(
    '[data-anim="studio-detail"]',
    root,
  )
  studioDetails.forEach((detail) => {
    gsap.fromTo(
      detail,
      { y: 24, opacity: 0.35 },
      {
        y: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: detail,
          start: 'top 92%',
          end: 'top 62%',
          scrub: scrub.default,
        },
      },
    )
  })
}
