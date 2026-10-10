'use client'

import { STORY } from './riddim-content'
import styles from './riddim-hero.module.css'

/**
 * Everything the story says that is not the machine.
 *
 * Two kinds of surface, and they belong to different owners:
 *
 *   - the **plane** (`AboutCard`) lives inside the LCD's own rect, clipped by
 *     the letterbox, so it reads as the screen's contents. It is `aria-hidden`
 *     decoration: the machine already carries the page's only `h1`, so a screen
 *     reader never meets the next chapter's headline twice.
 *   - the **columns** (`StorySides`) sit outside the machine, in the space the
 *     camera leaves free at fit height. They are real content, so they are
 *     not hidden, but they are annotations rather than a second sitemap — the
 *     machine's controls are the navigation, and they are only clickable
 *     during the overview beat, so duplicating them here would give the page
 *     two competing nav lists for no gain.
 *
 * Both are styled off the story's custom properties (`--r-sides`, `--r-about`,
 * `--r-flip`), which the scroll bridge writes on the hero.
 */

/** The next chapter's plane: the surface the camera pushes back into. */
export function AboutCard() {
  return (
    <div className={styles.aboutCard}>
      <span className={styles.aboutKicker}>{STORY.screen2.kicker}</span>
      <strong className={styles.aboutTitle}>{STORY.screen2.title}</strong>
      <ul className={styles.aboutTracks}>
        {STORY.screen2.tracks.map((track) => (
          <li key={track}>{track}</li>
        ))}
      </ul>
      <span className={styles.aboutNote}>{STORY.screen2.note}</span>
    </div>
  )
}

function Callout({
  index,
  label,
  note,
}: {
  index: string
  label: string
  note: string
}) {
  return (
    <div className={styles.callout}>
      <span className={styles.calloutIndex}>{index}</span>
      <div className={styles.calloutBody}>
        <strong className={styles.calloutLabel}>{label}</strong>
        <p className={styles.calloutNote}>{note}</p>
      </div>
    </div>
  )
}

/**
 * The two printed columns either side of the machine.
 *
 * Rendered only at the width the machine is small enough to leave room for
 * them (`onMachine`, ≥1181px), and faded by `--r-sides` so they are only on
 * screen during the pull-back and press-swap beats.
 */
export function StorySides() {
  return (
    <div className={styles.sides} data-story-sides>
      <aside className={styles.side} aria-label="Machine notes">
        {STORY.sides.left.map((callout) => (
          <Callout key={callout.index} {...callout} />
        ))}
      </aside>
      <aside className={styles.side} aria-label="Session notes">
        {STORY.sides.right.map((callout) => (
          <Callout key={callout.index} {...callout} />
        ))}
      </aside>
    </div>
  )
}
