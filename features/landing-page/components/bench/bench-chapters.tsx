import { Fragment, type CSSProperties } from 'react'

import type { AboutTrack } from '../../rack-01/about-copy'
import { GlassDevice } from '../glass/glass-device'
import { Device } from './bench-device-layer'
import type { BenchDeviceKind } from './bench-devices'
import styles from './bench-chapters.module.css'

/**
 * The chapters: the biography, one device each.
 *
 * Three texts scroll past one pinned stage, and the three devices live in it
 * (see `bench-stage.ts`, and `BenchChapters` below for the structure). The
 * stage is **decoration and aria-hidden**; the texts are the real thing and are
 * in ordinary flow in the DOM, before nothing and after nothing they depend on.
 * Each device is a real CSS solid (see `bench-device-layer.tsx`) posed by the
 * motion hook through one number; with the script absent the stage is a plain
 * resting column of the three devices, which is a composed frame, not an empty
 * one.
 *
 * Which device belongs to which track is a decision about the *work*, not the
 * decoration, and it is the only authored content here:
 *
 * - INTERACTION is a sampler. Its pads light one by one as you scroll: the
 *   interface being played, step by step.
 * - SYSTEMS is a cassette. The reels turn: structure that keeps running.
 * - PRODUCTION is a record and a level meter: the thing that has to keep
 *   playing, and the reading that says whether it is.
 */
const KIND: readonly BenchDeviceKind[] = ['sampler', 'cassette', 'vinyl']

const METER = Array.from({ length: 16 }, (_, index) => index)

/** A heading, one mask per word, so each word rises out of its own line. */
export function Words({ text, base = 0 }: { text: string; base?: number }) {
  return (
    <>
      {text.split(' ').map((word, index, words) => (
        <Fragment key={`${word}-${index}`}>
          <span className={styles.rw}>
            <span
              className={styles.rwIn}
              style={{ '--i': base + index } as CSSProperties}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}

/**
 * The chapters: one pinned stage, three texts scrolling past it.
 *
 * ## One stage, not three
 *
 * Each chapter used to own a pinned visual of its own. The first one unpinned
 * and scrolled away as the second arrived on the other side of the page, so the
 * device did not move from 01 to 03, it was replaced, with a jump in between.
 * Now there is a single pinned stage and the three devices live in it. The
 * motion hook writes one number, the scroll position expressed in chapters (`g`,
 * with chapter *i* centred at `g = i`), and each device is a continuous function
 * of its distance from it: it rises into the stage from below as the previous
 * chapter ends, settles into its resting pose as its own text is centred, and
 * rises out of the top as the next one arrives, turning the whole way. Nothing
 * is replaced and nothing jumps.
 *
 * ## What the DOM guarantees
 *
 * The stage is decoration and `aria-hidden`; the texts are the real thing, in
 * ordinary flow. With the script absent, with reduced motion, and on a phone,
 * the stage is a plain row (or column) of the three devices at rest above or
 * beside the text, which is a finished layout, not an empty one.
 *
 * Which device belongs to which track is a decision about the *work*, not the
 * decoration, and it is the only authored content here:
 *
 * - INTERACTION is a sampler. Its pads light one by one as you scroll: the
 *   interface being played, step by step.
 * - SYSTEMS is a cassette. The reels turn: structure that keeps running.
 * - PRODUCTION is a record and a level meter: the thing that has to keep
 *   playing, and the reading that says whether it is.
 */
export function BenchChapters({ tracks }: { tracks: readonly AboutTrack[] }) {
  return (
    <div className={styles.chapters} data-bench-chapters>
      <div className={styles.stageCol}>
        <div className={styles.pin} data-bench-pin aria-hidden="true">
          {tracks.map((track, index) => {
            const kind = KIND[index % KIND.length]
            return (
              <div
                key={track.title}
                className={styles.slide}
                data-bench-slide={index}
                data-kind={kind}
              >
                <span className={styles.numeral}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className={styles.stage} data-kind={kind}>
                  <div className={styles.tilt}>
                    <div className={styles.scale}>
                      <GlassDevice
                        kind={kind}
                        fallback={<Device kind={kind} live />}
                      />
                    </div>
                  </div>
                </div>
                {kind === 'vinyl' ? (
                  <span className={styles.meter}>
                    {METER.map((bar) => (
                      <i key={bar} style={{ '--i': bar } as CSSProperties} />
                    ))}
                  </span>
                ) : null}
                <span className={styles.note}>{track.note}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.texts}>
        {tracks.map((track, index) => {
          const number = String(index + 1).padStart(2, '0')
          return (
            <article
              key={track.title}
              className={styles.chapter}
              data-bench-chapter
            >
              <p className={styles.kicker}>
                <b>{number}</b> {track.title}
              </p>
              <h3
                className={styles.heading}
                data-bench-reveal
                aria-label={track.heading}
              >
                <span aria-hidden="true">
                  <Words text={track.heading} />
                </span>
              </h3>
              <p className={styles.story} data-reveal>
                {track.story}
              </p>
              {track.credits ? (
                <ul className={styles.credits} data-reveal>
                  {track.credits.map((credit) => (
                    <li key={credit.name}>
                      <b>{credit.name}</b>
                      <span>{credit.note}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          )
        })}
      </div>
    </div>
  )
}

/**
 * The ticker: the constraints, as two rows of outlined type that slide past
 * each other as the title leaves. Decoration; every word is already a chip.
 */
export function BenchTicker({ words }: { words: readonly string[] }) {
  const upper = words.map((word) => word.toUpperCase())
  const half = Math.ceil(upper.length / 2)
  const rows = [upper.slice(0, half), upper.slice(half)]
  return (
    <div className={styles.ticker} data-bench-ticker aria-hidden="true">
      {rows.map((row, rowIndex) => (
        <p
          key={rowIndex}
          className={`${styles.tickerRow} ${rowIndex === 1 ? styles.tickerBack : ''}`}
        >
          {[...row, ...row, ...row].map((word, index) => (
            <span key={index}>{word}</span>
          ))}
        </p>
      ))}
    </div>
  )
}

/** The last beat: where the work is, and what it is available for. */
export function BenchFinale({
  aside,
  resumeLink,
}: {
  aside: string
  resumeLink?: string
}) {
  const cut = aside.indexOf('. ')
  const place = cut === -1 ? '' : aside.slice(0, cut + 1)
  const offer = cut === -1 ? aside : aside.slice(cut + 2)

  return (
    <section className={styles.finale} aria-label="Availability">
      {place ? <p className={styles.place}>{place}</p> : null}
      <p className={styles.offer} data-bench-reveal aria-label={offer}>
        <span aria-hidden="true">
          <Words text={offer} />
        </span>
      </p>
      {resumeLink ? (
        <a className={styles.resume} href={resumeLink} data-reveal>
          <span>Résumé</span>
          <i aria-hidden="true">→</i>
        </a>
      ) : null}
    </section>
  )
}

/** The playhead down the left edge of the About. Decoration. */
export function BenchRail() {
  return (
    <div className={styles.rail} data-bench-rail aria-hidden="true">
      <i className={styles.railFill} />
      <i className={styles.railDot} />
    </div>
  )
}
