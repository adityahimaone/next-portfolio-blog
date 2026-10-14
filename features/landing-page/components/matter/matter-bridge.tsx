'use client'

import { useRef } from 'react'

import { ABOUT_TRACKS } from '../../rack-01/about-copy'
import styles from './matter.module.css'
import { useMatterMotion } from './use-matter-motion'
import { FLIGHT_PARTS, flightBand } from './matter-flight'
import { MATTER_PARTS } from './matter-parts'
import { useMatterReveal } from './use-matter-reveal'
import { KineticLine } from './kinetic-line'

const letters = (word: string) =>
  Array.from(word).map((character, index) => (
    <span key={`${character}-${index}`} data-letter>
      {character}
    </span>
  ))

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

/** The four mixer strips in the device shell, by their left edge. */
const CHANNEL_STRIPS = [96, 216, 336, 456] as const

/**
 * One mixer channel, as shell artwork.
 *
 * It is a function rather than a component because it is not a React thing: it
 * is four copies of the same drawing, and giving it a component identity would
 * imply it can vary. The mounting geometry is what matters — every strip shares
 * the same panel, the same knob centre, the same meter and fader columns — and
 * that is the rule the whole shell is built to obey.
 */
const channelStrip = (x: number) => (
  <g key={x}>
    <rect
      className={styles.shellPanel}
      x={x}
      y={376}
      width={96}
      height={188}
      rx={10}
    />
    <circle className={styles.shellLine} cx={x + 48} cy={420} r={36} />
    <circle className={styles.shellPanel} cx={x + 48} cy={420} r={26} />
    <line
      className={styles.shellAccentLine}
      x1={x + 48}
      y1={420}
      x2={x + 48}
      y2={398}
    />
    <rect
      className={styles.shellLine}
      x={x + 16}
      y={468}
      width={10}
      height={82}
      rx={5}
    />
    <line
      className={styles.shellLine}
      x1={x + 72}
      y1={468}
      x2={x + 72}
      y2={550}
    />
    <rect
      className={styles.shellPanel}
      x={x + 60}
      y={498}
      width={24}
      height={18}
      rx={4}
    />
    <line
      className={styles.shellAccentLine}
      x1={x + 64}
      y1={507}
      x2={x + 80}
      y2={507}
    />
  </g>
)

/**
 * The machine the handoff is a picture of, as one decorative SVG.
 *
 * It is the cast's *body*: a compact sampler and turntable hybrid viewed
 * slightly from above, with a mixer bank on the left, a platter and tonearm on
 * the right, a timeline lane above the mixer and a patch bay below the record.
 * It stays inside the `aria-hidden` stage and never carries a label, a brand or
 * a number — every mark in it is abstract, because a decorative mark that
 * looked like a real specification would be a claim the page cannot support.
 *
 * It is one `<svg>` rather than a node per mechanism on purpose: the flight cap
 * is counted in cast members, and the shell is not one of them. The binder
 * writes a handful of paint-only custom properties to it and rotates two
 * groups; nothing else about it ever moves.
 *
 * Three groups carry meaning the binder reads: `data-device-platter` (which
 * turns), `data-device-signal` (the one primary-colour route) and
 * `data-device-chassis` (which lifts first). `data-device-tonearm` and
 * `data-device-meter` are the two smaller consumers of the device frame.
 */
const DEVICE_SHELL = (
  <svg
    className={styles.deviceShell}
    data-device-shell
    viewBox="0 0 1200 620"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <g className={styles.deviceChassis} data-device-chassis>
      <rect
        className={styles.chassis}
        x="6"
        y="6"
        width="1188"
        height="608"
        rx="24"
      />
      <rect
        className={styles.faceplate}
        x="36"
        y="36"
        width="1128"
        height="548"
        rx="14"
      />
      {/* The cue light: the one mark that says the machine is running. */}
      <circle className={styles.shellAccentFill} cx="1122" cy="452" r="11" />
    </g>

    <g data-device-mixer>
      {CHANNEL_STRIPS.map(channelStrip)}
      {/* A three-bar level meter, scaled by `--meter-level`. */}
      <g className={styles.deviceMeter} data-device-meter>
        <line
          className={styles.shellLine}
          x1="596"
          y1="560"
          x2="596"
          y2="376"
        />
        <line
          className={styles.shellLine}
          x1="620"
          y1="560"
          x2="620"
          y2="410"
        />
        <line
          className={styles.shellLine}
          x1="644"
          y1="560"
          x2="644"
          y2="440"
        />
      </g>
    </g>

    <g className={styles.deviceTimeline} data-device-timeline>
      <line className={styles.shellDim} x1="96" y1="182" x2="552" y2="182" />
      <rect
        className={styles.shellAccentFill}
        x="104"
        y="134"
        width="180"
        height="74"
        rx="8"
        opacity=".78"
      />
      <polyline
        className={styles.shellWave}
        points="116,170 140,150 164,190 192,144 220,192 248,158 262,170"
      />
      <rect
        className={styles.shellPanel}
        x="300"
        y="134"
        width="248"
        height="74"
        rx="8"
      />
      <polyline
        className={styles.shellDim}
        points="312,170 340,156 368,180 400,150 432,184 464,160 496,174 536,170"
      />
      <line className={styles.shellLine} x1="300" y1="122" x2="300" y2="220" />
      <line
        className={styles.shellAccentLine}
        x1="430"
        y1="126"
        x2="430"
        y2="222"
        strokeWidth="3"
      />
      <polygon
        className={styles.shellAccentFill}
        points="430,126 448,136 430,146"
      />
    </g>

    <g className={styles.devicePlatter} data-device-platter>
      <circle className={styles.shellPanel} cx="920" cy="246" r="176" />
      <circle className={styles.shellLine} cx="920" cy="246" r="140" />
      <circle className={styles.shellDim} cx="920" cy="246" r="118" />
      <circle className={styles.shellDim} cx="920" cy="246" r="96" />
      <circle className={styles.shellDim} cx="920" cy="246" r="74" />
      <circle
        className={styles.shellAccentFill}
        cx="920"
        cy="246"
        r="44"
        opacity=".9"
      />
      <circle className={styles.shellPanel} cx="920" cy="246" r="7" />
      {/* A mark on the outer groove so the record's own turn is legible. */}
      <circle className={styles.shellLine} cx="1030" cy="246" r="6" />
      <g className={styles.deviceTonearm} data-device-tonearm>
        <circle className={styles.shellPanel} cx="1122" cy="96" r="24" />
        <line
          className={styles.shellLine}
          x1="1122"
          y1="96"
          x2="1002"
          y2="206"
          strokeWidth="6"
        />
        <polygon
          className={styles.shellAccentFill}
          points="1002,206 988,220 1010,226"
        />
      </g>
    </g>

    {/* The signal route, drawn last so it reads over the faceplate. It runs
        from the record, through the mixer bank, and up to the playhead lane —
        one continuous primary-colour path, never a second accent. */}
    <path
      className={styles.signalPath}
      data-device-signal
      d="M744 250 C 660 250, 610 330, 540 330 C 480 330, 470 200, 430 174"
    />

    <g className={styles.devicePatch} data-device-patch>
      <rect
        className={styles.shellPanel}
        x="690"
        y="452"
        width="316"
        height="118"
        rx="12"
      />
      <circle className={styles.shellLine} cx="742" cy="510" r="20" />
      <circle className={styles.shellPanel} cx="742" cy="510" r="9" />
      <circle className={styles.shellLine} cx="822" cy="510" r="20" />
      <circle className={styles.shellPanel} cx="822" cy="510" r="9" />
      <circle className={styles.shellLine} cx="902" cy="510" r="20" />
      <circle className={styles.shellPanel} cx="902" cy="510" r="9" />
      <path
        className={styles.shellLine}
        d="M902 510 C 960 510, 990 578, 1064 566"
        strokeWidth="4"
      />
      <rect
        className={styles.shellAccentFill}
        x="1052"
        y="554"
        width="26"
        height="20"
        rx="5"
      />
    </g>
  </svg>
)

/**
 * Sound becomes matter: the handoff, and the About it hands off to.
 *
 * Two things in one section, and the split matters. The **stage** is
 * decoration — the machine's shell, contours, a signal proxy, the flying cast,
 * the two working art-direction words, and the quiet residue the first practice
 * line lands beside. It is `aria-hidden` and out of the flow unless the motion
 * setup succeeds. The **reading panel** is the real thing: the biography, in
 * ordinary document flow, inside its own `#about` landmark, with the title as
 * its accessible name.
 *
 * There is exactly one `id="about"` on the page and it is here. The hero no
 * longer owns it: the panel it used to open onto is gone, and an anchor that
 * resolves to the top of a long pinned runway is worse than no anchor at all.
 */
export function MatterBridge() {
  const root = useRef<HTMLElement>(null)
  useMatterMotion(root)
  useMatterReveal(root)

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

        {/* The machine itself. It sits over the signal band and under the
            flying cast, so the band reads as the signal the device is
            standing on rather than as a sheet laid across it. */}
        {DEVICE_SHELL}

        <div className={styles.flightStage}>
          {FLIGHT_PARTS.filter((part) => MATTER_PARTS[part.id]).map((part) => (
            <span
              key={part.id}
              className={styles.part}
              data-flight={part.id}
              data-group={part.group}
              data-band={flightBand(part.depth)}
              style={{ '--size': `${part.size}px` } as React.CSSProperties}
            >
              {MATTER_PARTS[part.id]}
            </span>
          ))}
        </div>

        {/* Decorative words stay in the stage; their letters share the bridge clock. */}
        <div className={styles.typeStage}>
          <span data-matter-word="signal">{letters('SIGNAL')}</span>
          <span data-matter-word="human">{letters('HUMAN')}</span>
        </div>

        {/* A quiet piece of the machine for the first practice line to land
            beside. It is not copy and never carries any: it is the platter, its
            tonearm and a three-bar meter, drawn at the same geometry the shell
            uses, so the heading has context instead of an empty stage.

            It is a *fragment*, not an icon, and that is the whole reason it is
            built from four groups rather than one path. The first version of
            this node was two hairline paths on a 240×120 box, and measured on
            the rendered page it was invisible at the one moment it existed for:
            the practice heading arrives around `p=.80`, by which point the
            shell has cleared, and a 1.5px arc at 0.22 opacity is not something
            a reader recognises as a machine. This draws the same three
            mechanisms the shell does — outer edge, grooves, label, spindle, a
            tonearm still reaching for the record, and a meter on its baseline —
            at a size that survives the panel's own climb. */}
        <div
          className={styles.practiceResidue}
          data-practice-residue
          aria-hidden="true"
        >
          <svg viewBox="0 0 400 200" aria-hidden="true">
            <g data-residue-platter>
              <circle cx="104" cy="100" r="88" />
              <circle data-residue-dim cx="104" cy="100" r="66" />
              <circle data-residue-dim cx="104" cy="100" r="46" />
              <circle cx="104" cy="100" r="22" />
              <circle data-residue-accent cx="104" cy="100" r="9" />
              {/* A mark on the outer groove, so the disc reads as a disc. */}
              <circle data-residue-dim cx="178" cy="100" r="5" />
            </g>
            <g data-residue-tonearm>
              <circle cx="216" cy="30" r="11" />
              <line x1="216" y1="30" x2="166" y2="80" />
              <polygon data-residue-accent points="166,80 155,90 170,95" />
            </g>
            <g data-residue-meter>
              <line data-residue-dim x1="252" y1="164" x2="392" y2="164" />
              <line x1="274" y1="164" x2="274" y2="62" />
              <line x1="318" y1="164" x2="318" y2="94" />
              <line x1="362" y1="164" x2="362" y2="78" />
            </g>
          </svg>
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
                <KineticLine
                  text={track.heading}
                  className={styles.practice}
                  dir={track.title === 'SYSTEMS' ? -1 : 1}
                />
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
