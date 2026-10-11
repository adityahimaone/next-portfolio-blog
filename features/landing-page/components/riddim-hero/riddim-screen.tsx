import Link from 'next/link'
import type { CSSProperties } from 'react'
import { useId } from 'react'

import { counterDigits } from './riddim-choreography'
import { SCREEN_COPY, type NavEntry } from './riddim-content'
import { SCREEN_UI } from './riddim-geometry'
import { Glyph, SevenSeg } from './riddim-glyphs'
import styles from './riddim-hero.module.css'

/**
 * The LCD, as one component used twice.
 *
 * On the machine it is the 922 x 268 window cut into the panel. In the
 * fullscreen plane the very same component is laid at the same proportions
 * across the whole viewport width, so when the camera has pushed in until the
 * LCD fills the screen's width, the plane's middle band and the machine's own
 * LCD are the same picture and the hand-over between them cannot be seen. The
 * plane then grows the screen up and down from that band (more of the glyph
 * field, a hint line) until it is the whole viewport.
 *
 * Two screens are stacked: the title card and the profile card. `--r-swap`
 * wipes the second over the first from the top, which is the key press the
 * scroll performs in the middle of the story.
 */

type Vars = Record<`--${string}`, string | number>
const vars = (v: Vars) => v as CSSProperties
const round = (n: number) => Math.round(n * 100) / 100

export type ScreenId = 1 | 2

/* `y` in the geometry is a baseline; a line box puts it 0.8em down. */
const baseline = (y: number, size: number) => round(y - size * 0.8)
const SCREEN_VARS = vars({
  '--scr-title-top': baseline(SCREEN_UI.title.y, SCREEN_UI.title.size),
  '--scr-title-size': SCREEN_UI.title.size,
  '--scr-role-top': baseline(SCREEN_UI.role.y, SCREEN_UI.role.size),
  '--scr-role-size': SCREEN_UI.role.size,
  '--scr-readout-top': baseline(SCREEN_UI.readout.y, SCREEN_UI.readout.size),
  '--scr-readout-size': SCREEN_UI.readout.size,
  '--scr-nav-top': baseline(SCREEN_UI.nav.y, SCREEN_UI.nav.size),
  '--scr-nav-size': SCREEN_UI.nav.size,
  '--scr-nav-gap': SCREEN_UI.nav.gap,
  '--scr-pad': SCREEN_UI.pad,
})

/* The darker plate that sits behind the title, as the reference backs it. */
const screenPlate = { x: 10, y: SCREEN_UI.status.y + 6, w: 636, h: 168 }

const FIELD_TONES = [
  'ink',
  'ink',
  'orange',
  'ink',
  'lime',
  'ink',
  'ink',
  'blue',
  'ink',
  'ink',
] as const

/** Five rows of eighteen, drawn from the glyph library: the reference's texture. */
const FIELD_ROWS: readonly (readonly string[])[] = [
  [
    'fan',
    'square',
    'cup',
    'bars',
    'disc',
    'capsule',
    'lines',
    'bird',
    'grid',
    'star',
    'slash',
    'dots',
    'piano',
    'figure',
    'notes',
    'plane',
    'brush',
    'hand',
  ],
  [
    'sun',
    'alarm',
    'mic',
    'toggle',
    'undo',
    'clock',
    'house',
    'foot',
    'leaf',
    'peace',
    'meter',
    'steps',
    'lion',
    'man',
    'disc',
    'capsule',
    'lines',
    'bird',
  ],
  [
    'star',
    'slash',
    'dots',
    'piano',
    'figure',
    'notes',
    'plane',
    'brush',
    'hand',
    'sun',
    'alarm',
    'mic',
    'toggle',
    'undo',
    'clock',
    'house',
    'foot',
    'leaf',
  ],
  [
    'peace',
    'meter',
    'steps',
    'lion',
    'man',
    'fan',
    'square',
    'cup',
    'bars',
    'disc',
    'capsule',
    'lines',
    'bird',
    'grid',
    'star',
    'slash',
    'dots',
    'piano',
  ],
  [
    'figure',
    'notes',
    'plane',
    'brush',
    'hand',
    'sun',
    'alarm',
    'mic',
    'toggle',
    'undo',
    'clock',
    'house',
    'foot',
    'leaf',
    'peace',
    'meter',
    'steps',
    'lion',
  ],
]

const FIELD = SCREEN_UI.field
const PITCH = FIELD.cell + FIELD.gap
const GRID_W = FIELD.cols * FIELD.cell + (FIELD.cols - 1) * FIELD.gap
const GRID_X0 = (SCREEN_UI.w - GRID_W) / 2

function toneClass(rowIndex: number, colIndex: number, shift: number) {
  const tone =
    FIELD_TONES[(rowIndex + colIndex * 3 + shift) % FIELD_TONES.length]
  return styles[`tone${tone[0].toUpperCase()}${tone.slice(1)}`]
}

/** The reference's glyph texture. `rows` may be longer than the five it draws. */
function GlyphRows({
  rows,
  top,
  shift = 0,
}: {
  rows: readonly (readonly string[])[]
  top: number
  shift?: number
}) {
  return (
    <g className={styles.field}>
      {rows.map((row, rowIndex) =>
        row.map((glyph, colIndex) => (
          <g
            key={`${rowIndex}-${colIndex}`}
            className={`${styles.glyph} ${toneClass(rowIndex, colIndex, shift)}`}
            style={vars({ '--i': rowIndex * FIELD.cols + colIndex })}
            transform={`translate(${round(GRID_X0 + colIndex * PITCH)} ${round(top + rowIndex * PITCH)}) scale(${round(FIELD.cell / 24)})`}
          >
            <Glyph id={glyph} />
          </g>
        )),
      )}
    </g>
  )
}

const REVERSED_ROWS = [...FIELD_ROWS].reverse()

function ScreenArt({ screen }: { screen: ScreenId }) {
  const { w, h, pad, counter, words, status } = SCREEN_UI
  const gradient = `sheen-${useId().replace(/:/g, '')}`
  const copy = screen === 1 ? SCREEN_COPY : SCREEN_COPY.second
  const digitW = counter.digit * 0.62 + counter.gap
  const start = counterDigits(0)

  return (
    <svg
      className={styles.screenArt}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="0.32" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} className={styles.screenGreen} />

      <GlyphRows
        rows={screen === 1 ? FIELD_ROWS : REVERSED_ROWS}
        top={FIELD.top}
        shift={screen === 1 ? 0 : 1}
      />

      <rect
        x={screenPlate.x}
        y={screenPlate.y}
        width={screenPlate.w}
        height={screenPlate.h}
        rx="6"
        className={styles.screenPlate}
      />

      {/* a well behind the counter, the way the reference backs its readout */}
      <rect
        x={counter.x - 12}
        y={counter.y - 12}
        width={4 * digitW + counter.dot + 24}
        height={counter.digit + 24}
        rx="6"
        className={styles.readoutWell}
      />

      <g className={styles.counter}>
        {[0, 1, 2, 3].map((index) => (
          <SevenSeg
            key={index}
            index={index}
            x={counter.x + index * digitW + (index > 1 ? counter.dot : 0)}
            y={counter.y}
            size={counter.digit}
            value={start[index]}
          />
        ))}
        <circle
          cx={counter.x + 2 * digitW + counter.dot / 2 - 6}
          cy={counter.y + counter.digit - 4}
          r={counter.dot / 2}
          className={styles.segDot}
        />
      </g>

      {/* the six words, where the reference prints them */}
      <g className={styles.words}>
        {copy.words.map((word, index) => {
          const step = words.size * 0.62 * 6 + words.glyph + words.gap + 14
          const x = words.x + index * step
          return (
            <g key={word}>
              <g
                className={styles.wordGlyph}
                transform={`translate(${round(x)} ${round(words.y - words.glyph * 0.78)}) scale(${round(words.glyph / 24)})`}
              >
                <Glyph id={FIELD_ROWS[screen === 1 ? 0 : 3][index]} />
              </g>
              <text
                className={styles.wordText}
                x={round(x + words.glyph + 8)}
                y={words.y}
              >
                {word}
              </text>
            </g>
          )
        })}
      </g>

      <rect width={w} height={h} fill={`url(#${gradient})`} />
      <text className={styles.screenStatus} x={pad} y={status.y}>
        {copy.status[0]}
      </text>
      <text
        className={styles.screenStatus}
        x={w - pad}
        y={status.y}
        textAnchor="end"
      >
        {copy.status[1]}
      </text>
    </svg>
  )
}

/**
 * The screen's top row as navigation: what the machine hands you before you
 * have scrolled anywhere.
 *
 * It sits outside the two stacked cards, on the status line, because that row
 * is the screen's chrome rather than either card's content — `RD-01` and
 * `4 LAYERS` are printed by both cards and change under the wipe, but a link
 * that vanished mid-wipe would be a link you could focus and not see.
 *
 * Rendered once, on the machine's own LCD: `heading` is true there and nowhere
 * else, so the plane's copy of the screen — a picture — has no links in it, and
 * neither does the profile card underneath.
 */
export type ScreenNav = {
  entries: readonly NavEntry[]
  /** Links only where the machine's controls are the navigation. */
  interactive: boolean
  active: string | null
  describe: (id: string | null) => void
}

function ScreenNavRow({ nav }: { nav: ScreenNav }) {
  return (
    <div className={styles.screenNav} style={SCREEN_VARS}>
      {nav.entries.map((entry) => {
        const armed = nav.active === entry.id
        const shared = {
          className: `${styles.screenNavLink} ${armed ? styles.screenNavArmed : ''}`,
          'data-screen-nav': entry.id,
          'data-armed': armed ? 'true' : 'false',
          onPointerEnter: () => nav.describe(entry.id),
          onPointerLeave: () => nav.describe(null),
          onFocus: () => nav.describe(entry.id),
          onBlur: () => nav.describe(null),
        }
        if (!nav.interactive || entry.kind !== 'link') {
          return (
            <span
              key={entry.id}
              className={styles.screenNavPrint}
              data-screen-nav={entry.id}
            >
              {entry.label}
            </span>
          )
        }
        const { href, external } = entry
        const label = `${entry.label} — ${entry.note}`
        if (external || href.startsWith('#') || href.startsWith('mailto:')) {
          return (
            <a
              key={entry.id}
              {...shared}
              href={href}
              aria-label={label}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {entry.label}
            </a>
          )
        }
        return (
          <Link key={entry.id} {...shared} href={href} aria-label={label}>
            {entry.label}
          </Link>
        )
      })}
    </div>
  )
}

function ScreenUi({
  screen,
  heading,
  readout,
}: {
  screen: ScreenId
  heading: boolean
  readout?: { name: string; note: string }
}) {
  const copy = screen === 1 ? SCREEN_COPY : SCREEN_COPY.second
  const Title = heading && screen === 1 ? 'h1' : 'p'
  const shown = readout ?? copy.idle
  return (
    <div className={styles.screenUi} style={SCREEN_VARS}>
      <Title className={styles.title}>{copy.title}</Title>
      <p className={styles.role}>{copy.role}</p>
      <p className={styles.readout} aria-hidden="true">
        <b>{shown.name}</b>
        <span>{shown.note}</span>
      </p>
    </div>
  )
}

/**
 * Both screens, one over the other. `heading` is true only for the machine's
 * own LCD: the page has one h1, and the plane is a picture of the same screen.
 * `nav` follows the same rule, for the same reason.
 */
export function LcdFace({
  heading,
  readout,
  nav,
}: {
  heading: boolean
  readout?: { name: string; note: string }
  nav?: ScreenNav
}) {
  return (
    <div className={styles.lcd}>
      <div className={styles.lcdOne}>
        <ScreenArt screen={1} />
        <ScreenUi screen={1} heading={heading} readout={readout} />
      </div>
      <div className={styles.lcdTwo}>
        <ScreenArt screen={2} />
        <ScreenUi screen={2} heading={false} readout={readout} />
      </div>
      <span className={styles.scan} aria-hidden="true" />
      <span className={styles.screenRim} aria-hidden="true" />
      {heading && nav ? <ScreenNavRow nav={nav} /> : null}
    </div>
  )
}

/* -------------------------------------------------------------------------
 * The fullscreen plane
 * ---------------------------------------------------------------------- */

/** Nine rows is enough to reach the top of a 1440 x 1300 viewport. */
const EXTENSION_ROWS = Array.from(
  { length: 9 },
  (_, i) => FIELD_ROWS[i % FIELD_ROWS.length],
)

function PlaneField({ edge }: { edge: 'top' | 'bottom' }) {
  const h = EXTENSION_ROWS.length * PITCH
  return (
    <svg
      className={`${styles.planeField} ${edge === 'top' ? styles.planeFieldTop : styles.planeFieldBottom}`}
      viewBox={`0 0 ${SCREEN_UI.w} ${h}`}
      aria-hidden="true"
      focusable="false"
    >
      <GlyphRows
        rows={edge === 'top' ? [...EXTENSION_ROWS].reverse() : EXTENSION_ROWS}
        top={edge === 'top' ? 0 : 6}
        shift={edge === 'top' ? 2 : 0}
      />
    </svg>
  )
}

/**
 * The LCD blown up to the viewport: the real LCD across the middle, the glyph
 * field running on above and below it. It is a picture, so it is hidden from
 * assistive tech; the h1 is the machine's.
 */
export function PlaneScreen() {
  return (
    <div className={styles.planeScreen} aria-hidden="true">
      <div className={styles.planeEdge} data-edge="top">
        <PlaneField edge="top" />
      </div>
      <div className={styles.planeBand}>
        <LcdFace heading={false} />
      </div>
      <div className={styles.planeEdge} data-edge="bottom">
        <PlaneField edge="bottom" />
        <p className={styles.planeHint}>
          <span className={styles.hintOne}>{SCREEN_COPY.hint[0]}</span>
          <span className={styles.hintTwo}>{SCREEN_COPY.hint[1]}</span>
        </p>
      </div>
    </div>
  )
}
