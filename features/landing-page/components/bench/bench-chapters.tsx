import { Fragment, type CSSProperties } from 'react'

import type { AboutTrack } from '../../rack-01/about-copy'
import { GlassDevice } from '../glass/glass-device'
import { Device } from './bench-device-layer'
import type { BenchDeviceKind } from './bench-devices'
import styles from './bench-chapters.module.css'

/**
 * The chapters: the biography, one device each.
 *
 * Each track of the About is a chapter with a visual that stays pinned while
 * its text scrolls past. The visual is **decoration and aria-hidden**; the
 * text is the real thing and is in ordinary flow in the DOM, before nothing and
 * after nothing it depends on. The device is a real CSS solid (see
 * `bench-device-layer.tsx`) whose whole pose is arithmetic on one custom
 * property, `--p`, that the motion hook writes on `[data-bench-cvisual]`
 * (0 as the chapter enters, 1 as it leaves). With the script absent `--p` is
 * its declared resting `0.5`, which is a composed frame, not an empty one.
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

export function BenchChapter({
  track,
  index,
}: {
  track: AboutTrack
  index: number
}) {
  const kind = KIND[index % KIND.length]
  const number = String(index + 1).padStart(2, '0')

  return (
    <article
      className={styles.chapter}
      data-bench-chapter
      data-side={index % 2 === 0 ? 'left' : 'right'}
    >
      <div className={styles.visual} data-bench-cvisual aria-hidden="true">
        <span className={styles.numeral}>{number}</span>
        <div className={styles.stage} data-kind={kind}>
          <div className={styles.tilt}>
            <div className={styles.scale}>
              <GlassDevice kind={kind} fallback={<Device kind={kind} live />} />
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

      <div className={styles.text}>
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
      </div>
    </article>
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
