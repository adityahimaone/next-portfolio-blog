'use client'

import type { CSSProperties } from 'react'

import styles from './rack-01.module.css'
import { SectionHeading } from './section-heading'
import { RESUME_URL } from './shared'

/**
 * About, as the PROFILE clip's interior.
 *
 * The three channels are the three things this practice is actually made of,
 * and they are laid out as one timeline rail rather than as three equal cards.
 * That is the whole redesign: three cards side by side are a brochure, and a
 * rail with one open channel is the instrument the rest of the page has been
 * pretending to be. The reader scans the arrangement, locks onto a channel, and
 * reads it — the same move the camera makes one level up.
 *
 * Three rules the markup below is holding to:
 *
 * 1. **The text is real and it is in the DOM.** Every channel's heading, story
 *    and credits are rendered on the server, always. Collapsing the inactive
 *    ones is a CSS decision gated on the same conditions that pin the seam, so
 *    a phone, a reduced-motion visitor and a reader with scripting off all get
 *    the full rail with every channel open — nothing required is behind an
 *    animation, and nothing is behind a script.
 * 2. **The buttons are the keyboard path.** Each channel header is a real
 *    `<button>` with `aria-pressed`, so the rail is operable without a pointer
 *    and without hovering anything. The résumé link is outside the button,
 *    because a focusable descendant of a button is not reachable.
 * 3. **Scroll and click write the same state.** `selected` is what the rail
 *    reads and what a click writes; the arrangement hook writes it from the
 *    read's own progress. One value, two authors, no third copy.
 *
 * Every fact here was already on the page. The titles are the channels the work
 * actually runs in, and the stories, credits and the availability line are the
 * ones the About section carried before — this is a rewrite of the shape, not
 * of the record.
 */

export type AboutCredit = {
  name: string
  note: string
}

export type AboutTrack = {
  title: string
  heading: string
  note: string
  story: string
  credits?: readonly AboutCredit[]
  aside?: string
  resumeLink?: string
}

export const ABOUT_TRACKS: readonly AboutTrack[] = [
  {
    title: 'INTERACTION',
    heading: 'Start with the user.',
    note: 'REACT / NEXT.JS / TYPESCRIPT',
    story:
      'I begin with the interaction, not the component, because the component is the cheap part to get right. Four years of production frontends, most of them React and Next.js on systems where the interface is load-bearing rather than decorative.',
    credits: [
      { name: 'Bisadaya', note: 'Job platform · 15K users' },
      { name: '80&Company', note: 'HR management · Kyoto' },
    ],
  },
  {
    title: 'SYSTEMS',
    heading: 'Build the system.',
    note: 'FEATURES / DATA / DELIVERY',
    story:
      'I use React, Next.js, and TypeScript to create reusable structures that keep new features consistent. Typed data at the boundary and rendering chosen per route make the next six months cheaper to change.',
    credits: [
      { name: 'Primarindo Asia', note: 'Manufacturing · Jakarta' },
      { name: 'Niqcode', note: 'Product studio · Partner' },
    ],
  },
  {
    title: 'PRODUCTION',
    heading: 'Stay close to production.',
    note: 'BACKEND / AUTOMATION / INFRA',
    story:
      'I work across application data, deployment and monitoring when the frontend needs more than a polished screen. This site runs on Cloudflare Workers via OpenNext with an R2 cache, which is why the writing here is about what broke.',
    aside:
      'Based in Jakarta. Available for frontend, design engineering and hard interface work.',
    resumeLink: RESUME_URL,
  },
]

export function About({
  selected,
  setSelected,
  scrollProgress,
}: {
  selected: number
  setSelected: React.Dispatch<React.SetStateAction<number>>
  /**
   * 0 → 1 across the read. On `main` this was the About *section's* own scroll
   * progress, from a ScrollTrigger spanning `top bottom` → `bottom top`; here the
   * same range is the seam's window, which is the only scroll this section gets.
   * Either way it is the reader's position through the three channels, and the
   * signal head is what reports it.
   */
  scrollProgress: number
}) {
  // Clamped rather than trusted: the hook derives this from the read's own
  // progress and a retime could momentarily hand over an out-of-range index.
  // An unclamped one would leave every channel inactive for a frame, which
  // reads as the rail losing its selection.
  const active = Math.min(Math.max(0, selected), ABOUT_TRACKS.length - 1)

  return (
    <div
      className={`${styles.about} ${styles.aboutSeam}`}
      data-anim="about-section"
      data-no-heading-reveal
    >
      <div className={styles.aboutStage}>
        <SectionHeading index="02" eyebrow="Profile">
          Make the complicated part feel obvious.
        </SectionHeading>

        {/* `data-about-read` marks the window the read travels inside, and
            `data-about-rail` the content that moves. The hook measures the rail
            against the deck to work out how far the column has to move and
            counts the rail's children to know how many channels the read has to
            walk through — so the rail must keep exactly one element per
            channel, and neither attribute is decorative. */}
        <div className={styles.aboutDeck} data-about-read>
          <div className={styles.aboutRail} data-about-rail>
            {ABOUT_TRACKS.map((track, index) => (
              <article
                key={track.title}
                className={`${styles.aboutTrack} ${
                  active === index ? styles.aboutTrackActive : ''
                }`}
                data-anim="about-card"
              >
                <button
                  type="button"
                  className={styles.aboutTrackButton}
                  aria-pressed={active === index}
                  onClick={() => setSelected(index)}
                >
                  <span className={styles.aboutTrackIndex}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <strong className={styles.aboutTrackTitle}>
                    {track.title}
                  </strong>
                  <span className={styles.aboutTrackNote}>{track.note}</span>
                </button>

                <div className={styles.aboutTrackBody} aria-live="polite">
                  <h3>{track.heading}</h3>
                  <p>{track.story}</p>
                  {track.credits ? (
                    <ul className={styles.aboutTrackCredits}>
                      {track.credits.map((credit) => (
                        <li key={credit.name}>
                          <b>{credit.name}</b>
                          <span>{credit.note}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {track.aside ? (
                    <p className={styles.aboutTrackAside}>{track.aside}</p>
                  ) : null}
                  {/* The résumé is a sibling of the button, not a child of it.
                      A link inside a button is announced as part of the button
                      and is unreachable by keyboard. */}
                  {track.resumeLink ? (
                    <a
                      className={styles.aboutTrackResume}
                      href={track.resumeLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Résumé (PDF)
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {/* The playhead, as a column. It is the one part of the rail that
              reports the read rather than responding to it, which is why it is
              driven by `--about-progress` and hidden from assistive tech: the
              same position is already conveyed by which channel is open. */}
          <div className={styles.aboutSignal} aria-hidden="true">
            <span className={styles.aboutSignalLine} />
            <span
              className={styles.aboutSignalHead}
              style={{ '--about-progress': scrollProgress } as CSSProperties}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
