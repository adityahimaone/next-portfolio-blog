'use client'

import { Fragment, useRef, type CSSProperties } from 'react'

import { ABOUT_TRACKS } from '../../rack-01/about-copy'
import { BENCH_CAPTION, BENCH_CHIPS, BENCH_PRINCIPLE } from './bench-copy'
import {
  BenchChapters,
  BenchFinale,
  BenchRail,
  BenchTicker,
} from './bench-chapters'
import { BenchDevices } from './bench-device-layer'
import styles from './bench.module.css'
import { useBenchMotion } from './use-bench-motion'
import { useBenchReveal } from './use-bench-reveal'

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

/**
 * The artifact: a record player, drawn once.
 *
 * It replaces the interface wireframe the section used to assemble around, and
 * it keeps every property that drawing had: one `<svg>` on a fixed viewBox,
 * `pathLength={1}` on every stroke so one dash offset draws the whole thing,
 * and a single accent spent in a few places. The record and the tonearm are
 * the two parts that move: the groove sheen turns with `--bench-spin`, which
 * the hook writes from the scroll, so the record plays as the page does.
 *
 * Like the wireframe, it carries no label and no number. Every mark is
 * abstract; a decorative mark that read like a specification would be a claim
 * the page cannot support.
 */
const ARTIFACT = (
  <svg
    className={styles.artifactFrame}
    data-bench-artifact-frame
    viewBox="0 0 340 260"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="bench-glow" cx="35%" cy="50%" r="60%">
        <stop offset="0" stopColor="var(--primary)" stopOpacity="0.2" />
        <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* The light the record gives off. Fades with the drawing, never alone. */}
    <circle cx="120" cy="130" r="150" fill="url(#bench-glow)" />

    {/* Registration brackets, outside the plinth. */}
    <polyline {...STROKE} points="8,38 8,8 38,8" />
    <polyline {...STROKE} points="302,8 332,8 332,38" />
    <polyline {...STROKE} points="8,222 8,252 38,252" />
    <polyline {...STROKE} points="302,252 332,252 332,222" />

    {/* The plinth and its feet. */}
    <rect {...STROKE} x="22" y="22" width="296" height="216" rx="14" />
    <line {...STROKE} x1="40" y1="238" x2="40" y2="246" />
    <line {...STROKE} x1="300" y1="238" x2="300" y2="246" />

    {/* The platter and the record. */}
    <circle {...STROKE} cx="120" cy="130" r="88" />
    <circle {...STROKE} cx="120" cy="130" r="80" />
    <circle {...STROKE} cx="120" cy="130" r="68" />
    <circle {...STROKE} cx="120" cy="130" r="58" />
    <circle {...STROKE} cx="120" cy="130" r="48" />
    <circle {...STROKE} cx="120" cy="130" r="27" />
    <circle className={styles.artifactFill} cx="120" cy="130" r="21" />
    <circle {...STROKE} cx="120" cy="130" r="3" />

    {/* The sheen: the one part of the record that turns. */}
    <g className={styles.vinylSpin}>
      <line {...STROKE} x1="120" y1="58" x2="120" y2="82" />
      <line {...STROKE} x1="120" y1="178" x2="120" y2="200" />
    </g>

    {/* The tonearm: pivot, counterweight, arm, headshell. */}
    <circle {...STROKE} cx="286" cy="62" r="10" />
    <circle {...STROKE} cx="286" cy="62" r="3" />
    <rect {...STROKE} x="280" y="36" width="12" height="14" rx="3" />
    <polyline {...STROKE} points="286,72 286,130 214,168" />
    <polyline {...STROKE} points="214,168 202,176 196,170" />
    <circle className={styles.artifactFill} cx="199" cy="173" r="3.4" />

    {/* The controls: start, pitch, and the one lit indicator. */}
    <rect {...STROKE} x="232" y="204" width="38" height="14" rx="7" />
    <line {...STROKE} x1="306" y1="150" x2="306" y2="218" />
    <rect {...STROKE} x="299" y="176" width="14" height="9" rx="2" />
    <circle className={styles.artifactFill} cx="246" cy="211" r="3" />
  </svg>
)

/**
 * The principle, one word per mask.
 *
 * Each word is an inline box that clips its own overflow with the word itself
 * inside it, so a word rises *out of* a line rather than fading in on it. The
 * stagger is arithmetic in the stylesheet, not a timeline: the hook writes one
 * number (`--e`, the emerge progress) and every word derives its own offset
 * from its index `--i` and the count `--n`.
 */
const PRINCIPLE_WORDS = BENCH_PRINCIPLE.split(' ')

const TITLE = 'The rules become the work.'

/** The track that carries the availability line, if any. */
const FINALE_TRACK = ABOUT_TRACKS.find((track) => track.aside)
const FINALE = FINALE_TRACK?.aside
  ? { aside: FINALE_TRACK.aside, resumeLink: FINALE_TRACK.resumeLink }
  : null

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
  useBenchReveal(root)

  return (
    <section ref={root} className={styles.bench} data-bench>
      <div className={styles.stage} data-bench-stage aria-hidden="true">
        {/* The sheet. It is the far stratum, so it drifts least — it has to
            read as the page's own surface rather than as a layer on it. */}
        <div className={styles.paper} data-bench-paper />

        {/* The flying devices: behind the artifact and the ring, in the
            gutters, dissolving before they reach the principle's band. */}
        <BenchDevices />

        {/* The line the drawing is an argument for. It is in the far stratum
            too: it was behind the experiment the whole time. */}
        <p
          className={styles.principle}
          data-bench-principle
          style={{ '--n': PRINCIPLE_WORDS.length } as CSSProperties}
        >
          {PRINCIPLE_WORDS.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <span className={styles.pw}>
                <span
                  className={styles.pwIn}
                  style={{ '--i': index } as CSSProperties}
                >
                  {word}
                </span>
              </span>{' '}
            </Fragment>
          ))}
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
        <BenchRail />
        <div className={styles.reading}>
          <h2
            id="about-title"
            data-bench-reveal
            className={styles.title}
            aria-label={TITLE}
          >
            {TITLE.split(' ').map((word, wordIndex, words) => {
              // A running character index across the whole line, so the
              // stagger is one wave rather than a restart at every word.
              const before = words
                .slice(0, wordIndex)
                .reduce((sum, w) => sum + w.length + 1, 0)
              return (
                <Fragment key={`${word}-${wordIndex}`}>
                  <span className={styles.tw} aria-hidden="true">
                    {Array.from(word).map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className={styles.tc}
                        style={{ '--c': before + charIndex } as CSSProperties}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                  {wordIndex < words.length - 1 ? ' ' : null}
                </Fragment>
              )
            })}
          </h2>

          <BenchTicker words={BENCH_CHIPS.map((chip) => chip.text)} />

          <BenchChapters tracks={ABOUT_TRACKS} />

          {FINALE ? (
            <BenchFinale aside={FINALE.aside} resumeLink={FINALE.resumeLink} />
          ) : null}
        </div>
      </section>
    </section>
  )
}
