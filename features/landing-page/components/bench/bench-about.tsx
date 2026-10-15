'use client'

import { useRef } from 'react'

import { ABOUT_TRACKS } from '../../rack-01/about-copy'
import { BENCH_CAPTION, BENCH_CHIPS, BENCH_PRINCIPLE } from './bench-copy'
import styles from './bench.module.css'
import { useBenchMotion } from './use-bench-motion'

/**
 * The artifact, drawn once.
 *
 * It is the thing the constraints assemble around: a small interface
 * experiment — a rail, a card, a primary action, a plot — in one hairline
 * stroke language, plus four registration brackets outside the frame that give
 * it the air of a drawing on a sheet rather than a picture of a screen. It
 * carries no brand, no label, no number and no words: every mark in it is
 * abstract, because a decorative mark that read like a real specification would
 * be a claim the page cannot support.
 *
 * Two mechanical decisions matter more than the drawing:
 *
 * - **It is one `<svg>` on a fixed viewBox with `meet`.** The whole artifact is
 *   one object; splitting it into a node per panel would imply the panels can
 *   move independently, and the story is that they cannot — the thing either
 *   exists or it does not.
 * - **Every stroke carries `pathLength={1}`.** That normalises each path's own
 *   length to one unit whatever its real geometry, so a single `stroke-dashoffset`
 *   drives the draw-on for the frame, the dividers, the plot and the brackets at
 *   once, and a long path and a short one finish together. Without it the
 *   brackets would be drawn and the plot would not have started.
 */
/**
 * The construction marks the drawing replaces.
 *
 * The opening frame is a set of words on an empty sheet, and a sheet with
 * nothing on it but words is not a drawing — it is a list that has come apart.
 * These are the bounds and the centre mark of the thing that is about to exist:
 * a dashed rule at the sheet's own extent, four ticks pointing in at the middle
 * and a small circle at the point they meet. They are present from the first
 * frame and are spent exactly as the wireframe draws over them, which is what
 * makes the assembly read as the scaffolding *becoming* the drawing rather than
 * as a second object fading in beside it.
 *
 * It is a sibling of the drawing rather than a group inside it, and that is
 * load-bearing: the drawing's own node carries `artifactOpacity`, which is zero
 * on the first frame. Inside it, these marks would be invisible at the one
 * moment they are the only thing on the sheet.
 */
const SCAFFOLD = (
  <svg
    className={styles.scaffold}
    data-bench-scaffold
    viewBox="0 0 340 260"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <rect
      className={styles.scaffoldRule}
      x="2"
      y="2"
      width="336"
      height="256"
      rx="6"
    />
    <line className={styles.scaffoldRule} x1="170" y1="-14" x2="170" y2="22" />
    <line className={styles.scaffoldRule} x1="170" y1="238" x2="170" y2="274" />
    <line className={styles.scaffoldRule} x1="-14" y1="130" x2="22" y2="130" />
    <line className={styles.scaffoldRule} x1="318" y1="130" x2="354" y2="130" />
    <circle className={styles.scaffoldRule} cx="170" cy="130" r="4" />
  </svg>
)

const STROKE = { className: styles.artifactStroke, pathLength: 1 } as const

const ARTIFACT = (
  <svg
    className={styles.artifactFrame}
    data-bench-artifact-frame
    viewBox="0 0 340 260"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    {/* Registration brackets, outside the frame. */}
    <polyline {...STROKE} points="8,38 8,8 38,8" />
    <polyline {...STROKE} points="302,8 332,8 332,38" />
    <polyline {...STROKE} points="8,222 8,252 38,252" />
    <polyline {...STROKE} points="302,252 332,252 332,222" />

    {/* The panel. */}
    <rect {...STROKE} x="22" y="22" width="296" height="216" rx="14" />
    <line {...STROKE} x1="22" y1="64" x2="318" y2="64" />

    {/* The header: a title pill, a segmented control, two window dots. */}
    <rect {...STROKE} x="38" y="34" width="68" height="12" rx="6" />
    <rect {...STROKE} x="128" y="32" width="104" height="16" rx="8" />
    <rect
      className={styles.artifactFill}
      x="132"
      y="36"
      width="48"
      height="8"
      rx="4"
    />
    <circle {...STROKE} cx="282" cy="40" r="4.5" />
    <circle {...STROKE} cx="298" cy="40" r="4.5" />

    {/* The rail. */}
    <line {...STROKE} x1="110" y1="64" x2="110" y2="238" />
    <rect {...STROKE} x="38" y="86" width="54" height="9" rx="4.5" />
    <rect {...STROKE} x="38" y="110" width="40" height="9" rx="4.5" />
    <rect {...STROKE} x="38" y="134" width="48" height="9" rx="4.5" />
    <rect {...STROKE} x="38" y="158" width="34" height="9" rx="4.5" />
    {/* The one accent in the rail: the row that is selected. */}
    <rect
      className={styles.artifactFill}
      x="31"
      y="82"
      width="3"
      height="17"
      rx="1.5"
    />

    {/* The content: a card and a primary action. */}
    <rect {...STROKE} x="128" y="78" width="84" height="52" rx="10" />
    <line {...STROKE} x1="142" y1="98" x2="200" y2="98" />
    <line {...STROKE} x1="142" y1="114" x2="182" y2="114" />
    <rect {...STROKE} x="228" y="78" width="78" height="26" rx="9" />
    <line {...STROKE} x1="244" y1="91" x2="292" y2="91" />

    {/* The plot. */}
    <line {...STROKE} x1="128" y1="216" x2="306" y2="216" />
    <line {...STROKE} x1="128" y1="216" x2="128" y2="142" />
    <polyline
      {...STROKE}
      points="132,204 156,182 180,194 204,158 228,174 252,144 276,162 302,138"
    />
    <circle className={styles.artifactFill} cx="252" cy="144" r="5" />
  </svg>
)

/**
 * Rules becoming play: the constraints, the thing they become, and the
 * principle behind it — and then the biography.
 *
 * Two things in one section, and the split matters. The **stage** is
 * decoration: graph paper, a ring of the technologies and credits the
 * biography already names, a wireframe the ring assembles around, and the one
 * line of prose the whole drawing is a demonstration of. It is `aria-hidden`
 * and out of the flow unless the motion setup succeeds. The **reading panel**
 * is the real thing: the biography, in ordinary document flow, inside its own
 * `#about` landmark, with the title as its accessible name.
 *
 * There is exactly one `id="about"` on the page and it is here. The hero does
 * not own it: an anchor that resolves to the top of a long pinned runway is
 * worse than no anchor at all.
 *
 * ## Why the stage holds no words that the panel does not
 *
 * Every string in the stage is derived from `ABOUT_TRACKS` — the chips are the
 * technologies and the credits the biography already names, the principle is
 * the opening sentence of `INTERACTION`'s own story, and the caption is that
 * track's note. Nothing in the drawing is a new claim about the author. That is
 * the whole reason `bench-copy.ts` exists as a module rather than as a handful
 * of literals written into this file, and it is the one property of this
 * section that a reader would never be able to check for themselves.
 */
export function BenchAbout() {
  const root = useRef<HTMLElement>(null)
  useBenchMotion(root)

  return (
    <section ref={root} className={styles.bench} data-bench>
      <div className={styles.stage} data-bench-stage aria-hidden="true">
        {/* The sheet. It is the far stratum, so it drifts least — it has to
            read as the page's own surface rather than as a layer on it. */}
        <div className={styles.paper} data-bench-paper />

        {/* The line the drawing is an argument for. It is in the far stratum
            too: it was behind the experiment the whole time. */}
        <p className={styles.principle} data-bench-principle>
          {BENCH_PRINCIPLE}
        </p>

        {/* The middle stratum: the thing the constraints become. */}
        <div className={styles.artifact} data-bench-artifact>
          {SCAFFOLD}
          {ARTIFACT}
          <span className={styles.caption} data-bench-caption>
            {BENCH_CAPTION}
          </span>
        </div>

        {/* The near stratum: the constraints, in the order they arrive.

            Each chip is two elements, and that is not decoration either. The
            outer span is a zero-size anchor sitting on the chip's authored slot
            and is the node the binder writes its transform to; the inner span
            carries the label and centres it on that anchor with its own static
            transform. One element could not do both — the binder's transform
            would overwrite the centring — and a wrapper with real dimensions
            would make the rotation and the scale happen about the label's box
            instead of about the slot. */}
        <div className={styles.ring} data-bench-ring>
          {BENCH_CHIPS.map((chip) => (
            <span
              key={chip.id}
              className={styles.chip}
              data-bench-chip={chip.id}
              style={
                {
                  left: `${chip.slot.x}%`,
                  top: `${chip.slot.y}%`,
                  // The paint order is the depth, authored rather than
                  // animated: a nearer constraint covers a further one, and it
                  // does so on every frame rather than only once it has landed.
                  zIndex: Math.round(10 + chip.depth * 20),
                } as React.CSSProperties
              }
            >
              <span className={styles.chipLabel}>
                <i className={styles.chipTick} />
                {chip.text}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.runway} data-bench-runway aria-hidden="true" />

      <section
        id="about"
        className={styles.about}
        data-bench-about
        data-no-heading-reveal
        aria-labelledby="about-title"
      >
        <div className={styles.reading}>
          <h2 id="about-title" className={styles.title}>
            The rules become the work.
          </h2>

          <div className={styles.tracks}>
            {ABOUT_TRACKS.map((track) => (
              <article key={track.title} className={styles.track}>
                {/* The statement comes first in the DOM and is placed in the
                    right-hand band by the stylesheet, so the visual editorial
                    spread costs the reading order nothing. */}
                <p className={styles.practice} data-reveal>
                  {track.heading}
                </p>
                <div className={styles.body}>
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
                  {track.aside ? (
                    <p className={styles.aside} data-reveal>
                      {track.aside}
                    </p>
                  ) : null}
                  {track.resumeLink ? (
                    <a
                      className={styles.resume}
                      href={track.resumeLink}
                      data-reveal
                    >
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
