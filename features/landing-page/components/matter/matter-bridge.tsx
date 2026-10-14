'use client'

import { useRef } from 'react'

import { ABOUT_TRACKS } from '../../rack-01/about-copy'
import styles from './matter.module.css'
import { useMatterMotion } from './use-matter-motion'

/**
 * The three contours, as abstract artwork.
 *
 * They are authored at 12%, 30% and 46% of a 1200×800 box and the SVG is drawn
 * with `preserveAspectRatio="none"`, which is what makes those fractions hold
 * at every window size — the one property the artwork has to have, because the
 * band above the reading panel is the only place a line is allowed to be.
 *
 * They are **not** audio measurements. The design deliberately revises the
 * "no data, no motif" rule for this treatment only: a contour is a transition
 * metaphor, and inventing a waveform and calling it a skill score would be a
 * lie told in a chart. The topology is shared with the concept geometry; the
 * vertical placement is authored to clear the biography.
 */
const CONTOURS = [
  { id: 'far', d: 'M-100 96 C200 16 400 196 650 96 S1000 16 1300 96' },
  { id: 'middle', d: 'M-100 240 C200 160 400 340 650 240 S1000 160 1300 240' },
  { id: 'near', d: 'M-100 368 C200 288 400 468 650 368 S1000 288 1300 368' },
] as const

/**
 * Sound becomes matter: the handoff, and the About it hands off to.
 *
 * Two things in one section, and the split matters. The **stage** is
 * decoration — contours, a signal proxy, and the two working art-direction
 * words — and it is `aria-hidden` and out of the flow unless the motion setup
 * succeeds. The **reading panel** is the real thing: the biography, in ordinary
 * document flow, inside its own `#about` landmark, with the title as its
 * accessible name.
 *
 * There is exactly one `id="about"` on the page and it is here. The hero no
 * longer owns it: the panel it used to open onto is gone, and an anchor that
 * resolves to the top of a long pinned runway is worse than no anchor at all.
 */
export function MatterBridge() {
  const root = useRef<HTMLElement>(null)
  useMatterMotion(root)

  return (
    <section ref={root} className={styles.bridge} data-matter-bridge>
      <div className={styles.stage} data-matter-stage aria-hidden="true">
        {/* The machine's ground, first in the paint order and lifted as the
            device leaves. It is the arrangement's own colour, and it arrives
            across the hold — while the hero is still pinned on its final
            frame — so the machine dissolves into it without either of them
            moving. That is what makes the two sections swap without a cut. */}
        <div className={styles.ground} data-matter-ground />

        <svg
          className={styles.contours}
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          {CONTOURS.map((contour) => (
            <path
              key={contour.id}
              className={styles.contour}
              data-contour={contour.id}
              d={contour.d}
            />
          ))}
        </svg>

        {/* The source region. Its box is written by the hook from the hero's
            own PROFILE clip, so the handoff starts where the signal actually
            was rather than at a guessed rectangle. */}
        <div className={styles.proxy} data-matter-proxy>
          <svg
            className={styles.proxySignal}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 50 C14 22 26 78 40 50 S64 22 78 50 S92 78 100 50" />
          </svg>
          {/* The brightness the clip had on the hero, covering the waveform
              until the device has gone. */}
          <i className={styles.proxyInk} data-matter-proxy-ink />
        </div>

        {/* Working art-direction words, not approved copy. They are decorative,
            clipped to the stage, and gone before the first sentence of the
            biography is anywhere near them. */}
        <div className={styles.typeStage}>
          <span data-matter-word="signal">SIGNAL</span>
          <span data-matter-word="human">HUMAN</span>
        </div>
      </div>

      <div className={styles.runway} data-matter-runway aria-hidden="true" />

      <section
        id="about"
        className={styles.about}
        data-matter-about
        data-no-heading-reveal
        aria-labelledby="about-title"
      >
        <div className={styles.reading} data-matter-reading>
          <h2 id="about-title" className={styles.title} data-matter-title>
            Behind the interface.
          </h2>

          <div className={styles.tracks}>
            {ABOUT_TRACKS.map((track) => (
              <article key={track.title} className={styles.track}>
                {/* The statement comes first in the DOM and is placed in the
                    right-hand band by the stylesheet, so the visual editorial
                    spread costs the reading order nothing. */}
                <p className={styles.practice}>{track.heading}</p>
                <div className={styles.body}>
                  <p className={styles.story}>{track.story}</p>
                  {track.credits ? (
                    <ul className={styles.credits}>
                      {track.credits.map((credit) => (
                        <li key={credit.name}>
                          <b>{credit.name}</b>
                          <span>{credit.note}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {track.aside ? (
                    <p className={styles.aside}>{track.aside}</p>
                  ) : null}
                  {track.resumeLink ? (
                    <a className={styles.resume} href={track.resumeLink}>
                      Résumé →
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  )
}
