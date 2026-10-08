import { scrub } from '../shared/motion-tokens'
import type { ChapterContext } from '../shared/engine'
import styles from '../../rack-01/rack-01.module.css'

/**
 * The house heading reveal, shared by every numbered section.
 *
 * The label and the title rise out of a clipped slot as the heading
 * enters. Sections marked `data-no-heading-reveal` (the work
 * section, whose heading brightens in with its own power-on beat
 * instead) are excluded — the attribute was the exclusion mechanism
 * before, and still is.
 *
 * The heading itself is addressed by `data-anim="section-heading"`,
 * which the shared SectionHeading component renders; the silkscreen
 * label inside it is that component's own class, so it stays a class
 * selector — co-located with the component that owns it.
 */
export function headingRevealsChapter(ctx: ChapterContext): void {
  const { root, gsap } = ctx

  const storyHeadings = gsap.utils
    .toArray<HTMLElement>('[data-anim="section-heading"]', root)
    .filter((heading) => !heading.closest('[data-no-heading-reveal]'))
  storyHeadings.forEach((heading) => {
    const label = heading.querySelector(`.${styles.silkscreen}`)
    const title = heading.querySelector('h2')
    gsap.fromTo(
      [label, title],
      { yPercent: 105, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 90%',
          end: 'top 58%',
          scrub: 0.7,
        },
      },
    )
  })
}
