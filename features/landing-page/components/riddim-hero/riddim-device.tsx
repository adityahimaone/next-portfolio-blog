'use client'

import Link from 'next/link'
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { useTheme } from 'next-themes'

import { counterDigits } from './riddim-choreography'
import {
  COPY,
  MACHINE_NAV,
  NAV_BY_ID,
  SCREEN_COPY,
  type NavEntry,
} from './riddim-content'
import {
  CANVAS,
  CHASSIS,
  COPY_BLOCK,
  capId,
  DIMPLES,
  FADER,
  FASCIA,
  FRAME,
  KNOBS,
  LEFT_CAPS,
  LIVE_CAPS,
  LOOSE_LEDS,
  PAD,
  PAD_COLS,
  PAD_ROWS,
  PADS,
  PALETTE,
  PARAM_ROWS,
  RIGHT_CAPS,
  SCREEN,
  SCREEN_UI,
  SCREWS,
  SILK_LABELS,
  SILK_RULES,
  SPEAKER,
  TOP_CAPS,
  TOP_LED,
  TOP_STRIP,
  WORDMARK,
  padId,
  type Cap,
} from './riddim-geometry'
import styles from './riddim-hero.module.css'

/**
 * The RIDDIM SUPERTONE, working.
 *
 * The panel is one SVG whose viewBox IS the measured clone canvas, so a
 * coordinate in the markup is a coordinate on the photograph, and the screen
 * is a second plane laid exactly on the reference's screen rect. Type that
 * belongs to the page — the name, the role line, the hero's own copy — is real
 * HTML positioned over those planes in native units, so it is selectable,
 * translatable, and can be an `h1`.
 *
 * The machine is also the navigation. Controls that appear in `MACHINE_NAV`
 * become links or buttons in place, printed with their destination instead of
 * the clone's word; every other control stays a drawing. Hovering or focusing
 * one arms it: its lamp comes up and the screen prints its name, which is what
 * a screen on a machine like this is for.
 *
 * Everything driven by the scroll arrives as custom properties written on the
 * hero (`--r-*`); the only React state here is which control is armed, which
 * is off the scroll path.
 */

type Vars = Record<`--${string}`, string | number>
const vars = (v: Vars) => v as CSSProperties
const round = (n: number) => Math.round(n * 100) / 100

type MachineApi = {
  /** False on narrow viewports, where the stack below carries the links. */
  enabled: boolean
  active: string | null
  describe: (id: string | null) => void
  activate: (entry: NavEntry) => void
}

/* -------------------------------------------------------------------------
 * Controls: a drawing, or a link, or a button — same pixels either way
 * ---------------------------------------------------------------------- */

function Control({
  id,
  api,
  className,
  ring,
  children,
}: {
  id: string
  api: MachineApi
  className: string
  /** Focus outline, drawn to the control's own shape. */
  ring: ReactNode
  children: ReactNode
}) {
  const entry = api.enabled ? NAV_BY_ID.get(id) : undefined
  const armed = api.active === id
  const handlers = {
    onPointerEnter: () => api.describe(id),
    onPointerLeave: () => api.describe(null),
    onFocus: () => api.describe(id),
    onBlur: () => api.describe(null),
  }
  const body = (
    <>
      {ring}
      {children}
    </>
  )
  const shared = {
    className: `${className} ${styles.control}`,
    'data-control': id,
    'data-armed': armed ? 'true' : 'false',
    ...handlers,
  }

  if (!entry) return <g {...shared}>{body}</g>

  if (entry.kind === 'action') {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      api.activate(entry)
    }
    return (
      <g
        {...shared}
        role="button"
        tabIndex={0}
        aria-label={`${entry.label} — ${entry.note}`}
        onClick={() => api.activate(entry)}
        onKeyDown={onKeyDown}
      >
        {body}
      </g>
    )
  }

  const { href, external } = entry
  if (external || href.startsWith('#') || href.startsWith('mailto:')) {
    return (
      <a
        {...shared}
        href={href}
        aria-label={`${entry.label} — ${entry.note}`}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {body}
      </a>
    )
  }

  return (
    <Link {...shared} href={href} aria-label={`${entry.label} — ${entry.note}`}>
      {body}
    </Link>
  )
}

/** The outline that has to be visible on every one of the machine's controls. */
const ring = (x: number, y: number, w: number, h: number, r: number) => (
  <rect
    className={styles.ring}
    x={x - 4}
    y={y - 4}
    width={w + 8}
    height={h + 8}
    rx={r + 4}
  />
)

/* -------------------------------------------------------------------------
 * Glyphs — the reference's icon language, in a 24 x 24 box
 * ---------------------------------------------------------------------- */

const GLYPHS: Record<string, ReactNode> = {
  fan: (
    <>
      <path d="M3 21 12 21 12 12Z" />
      <path d="M3 21 11 11 3 8Z" />
      <path d="M3 21 8 5 2 3Z" />
    </>
  ),
  square: (
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    />
  ),
  cup: (
    <>
      <path d="M6 4h12l-2 8H8Z" />
      <path d="M7 15h10l-1 5H8Z" opacity=".75" />
    </>
  ),
  bars: (
    <>
      <rect x="3" y="4" width="18" height="4" rx="2" />
      <rect x="3" y="10" width="18" height="4" rx="2" />
      <rect x="3" y="16" width="18" height="4" rx="2" />
    </>
  ),
  lines: (
    <>
      <rect x="3" y="5" width="18" height="2" rx="1" />
      <rect x="3" y="11" width="18" height="2" rx="1" />
      <rect x="3" y="17" width="18" height="2" rx="1" />
    </>
  ),
  disc: (
    <>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <circle cx="9" cy="12" r="2.4" />
    </>
  ),
  capsule: <rect x="2" y="8" width="20" height="8" rx="4" />,
  grid: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </>
  ),
  bird: (
    <>
      <path d="M4 18c6 0 12-3 13-9 1 3 2 4 4 4-2 5-8 8-14 8Z" />
      <path d="M8 10c3 0 5 2 5 5H8Z" opacity=".7" />
    </>
  ),
  leaf: (
    <>
      <path d="M12 3c5 4 8 7 8 11a8 8 0 0 1-16 0c0-4 3-7 8-11Z" />
      <path d="M12 8v11" stroke="#00000055" strokeWidth="1.6" />
    </>
  ),
  hand: (
    <>
      <rect x="7" y="9" width="10" height="12" rx="3" />
      <rect x="5" y="3" width="3" height="9" rx="1.5" />
      <rect x="10" y="2" width="3" height="9" rx="1.5" />
      <rect x="15" y="3" width="3" height="9" rx="1.5" />
    </>
  ),
  peace: (
    <>
      <rect x="6" y="10" width="12" height="11" rx="3" />
      <rect x="8" y="3" width="3" height="9" rx="1.5" />
      <rect x="13" y="3" width="3" height="9" rx="1.5" />
    </>
  ),
  foot: (
    <>
      <ellipse cx="12" cy="15" rx="5" ry="6" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="6" r="2" />
    </>
  ),
  house: (
    <>
      <path d="M12 3 22 12h-3v9H5v-9H2Z" />
      <rect x="10" y="14" width="4" height="7" fill="#00000055" />
    </>
  ),
  figure: (
    <>
      <circle cx="14" cy="4" r="2.6" />
      <path d="M13 7 8 12l4 3-2 6h3l2-6 3 4v6h3v-7l-4-5 3-4Z" />
    </>
  ),
  piano: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2.5" />
      <path d="M7 6v12M12 6v12M17 6v12" stroke="#00000066" strokeWidth="1.6" />
    </>
  ),
  notes: (
    <>
      <circle cx="7" cy="17" r="3.4" />
      <circle cx="17" cy="15" r="3.4" />
      <path
        d="M10 17V5l10-2v12"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
    </>
  ),
  plane: <path d="M2 11 22 3l-7 18-3-7Z" />,
  brush: (
    <>
      <path d="M4 20c0-4 2-6 5-6l4 4c-1 3-3 4-6 4Z" />
      <path d="M11 13 20 4l2 2-9 9Z" opacity=".75" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path
        d="M12 1v4M12 19v4M1 12h4M19 12h4M4 4l3 3M17 17l3 3M20 4l-3 3M7 17l-3 3"
        stroke="currentColor"
        strokeWidth="2.2"
      />
    </>
  ),
  alarm: (
    <>
      <path d="M12 5a6 6 0 0 1 6 6v5H6v-5a6 6 0 0 1 6-6Z" />
      <rect x="4" y="17" width="16" height="3" rx="1.5" />
      <path
        d="M12 1v2M4 3l2 2M20 3l-2 2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path
        d="M6 12a6 6 0 0 0 12 0"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
      <rect x="11" y="18" width="2" height="4" rx="1" />
    </>
  ),
  toggle: (
    <>
      <rect x="2" y="7" width="20" height="10" rx="5" />
      <circle cx="17" cy="12" r="3.2" fill="#00000055" />
    </>
  ),
  undo: (
    <>
      <path
        d="M12 5a8 8 0 1 1-7.4 5"
        stroke="currentColor"
        strokeWidth="2.6"
        fill="none"
      />
      <path d="M3 3v6h6Z" />
    </>
  ),
  star: <path d="M12 1 14 9l8 3-8 3-2 8-2-8-8-3 8-3Z" />,
  slash: (
    <rect
      x="4"
      y="10"
      width="16"
      height="4"
      rx="2"
      transform="rotate(-42 12 12)"
    />
  ),
  dots: (
    <>
      <circle cx="8" cy="12" r="5" />
      <circle cx="17" cy="12" r="5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v7l5 3" stroke="#00000066" strokeWidth="2" fill="none" />
    </>
  ),
  meter: (
    <>
      <rect x="3" y="14" width="4" height="7" rx="1.5" />
      <rect x="10" y="9" width="4" height="12" rx="1.5" />
      <rect x="17" y="4" width="4" height="17" rx="1.5" />
    </>
  ),
  steps: (
    <>
      <rect x="2" y="16" width="6" height="6" rx="1.5" />
      <rect x="9" y="11" width="6" height="11" rx="1.5" />
      <rect x="16" y="5" width="6" height="17" rx="1.5" />
    </>
  ),
  lion: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path
        d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M20 4l-2 2M6 18l-2 2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="9.5" cy="11" r="1.3" fill="#00000066" />
      <circle cx="14.5" cy="11" r="1.3" fill="#00000066" />
    </>
  ),
  man: (
    <>
      <circle cx="12" cy="5" r="3" />
      <path d="M9 9h6l2 6h-3v7h-4v-7H7Z" />
    </>
  ),
}

function Glyph({ id }: { id: string }) {
  return GLYPHS[id] ?? GLYPHS.grid
}

/* -------------------------------------------------------------------------
 * Seven-segment counter
 * ---------------------------------------------------------------------- */

const SEG_T = 5

function segmentBars(w: number, h: number) {
  const t = SEG_T
  const mid = h / 2
  return {
    a: { x: t, y: 0, w: w - 2 * t, h: t },
    g: { x: t, y: mid - t / 2, w: w - 2 * t, h: t },
    d: { x: t, y: h - t, w: w - 2 * t, h: t },
    f: { x: 0, y: t, w: t, h: mid - t * 1.5 },
    b: { x: w - t, y: t, w: t, h: mid - t * 1.5 },
    e: { x: 0, y: mid + t / 2, w: t, h: mid - t * 1.5 },
    c: { x: w - t, y: mid + t / 2, w: t, h: mid - t * 1.5 },
  }
}

/** All seven bars are always drawn; the CSS lights them from `data-v`. */
function SevenSeg({
  index,
  x,
  y,
  size,
  value,
}: {
  index: number
  x: number
  y: number
  size: number
  value: string
}) {
  const w = size * 0.62
  const h = size
  const bars = segmentBars(w, h)
  return (
    <g
      className={styles.seg}
      data-seg={index}
      data-v={value}
      transform={`translate(${round(x)} ${round(y)})`}
    >
      {Object.entries(bars).map(([key, bar]) => (
        <rect
          key={key}
          className={styles[`seg${key}`]}
          x={bar.x}
          y={bar.y}
          width={bar.w}
          height={bar.h}
          rx="2"
        />
      ))}
    </g>
  )
}

/* -------------------------------------------------------------------------
 * Panel pieces
 * ---------------------------------------------------------------------- */

const TONE_CLASS = {
  light: styles.capLight,
  cream: styles.capCream,
  orange: styles.capOrange,
  green: styles.capGreen,
} as const

function CapFace({ cap, label }: { cap: Cap; label: string }) {
  const { x, y, w, h, label2, tone, jacks, big } = cap
  const textY = y + h / 2 + 5
  return (
    <>
      <rect
        className={styles.capBody}
        x={x}
        y={y}
        width={w}
        height={h}
        rx="5"
      />
      <rect
        className={styles.capTop}
        x={x + 1.5}
        y={y + 1.5}
        width={w - 3}
        height={h - 3}
        rx="4"
        fill={`url(#cap-${tone})`}
      />
      {label2 ? (
        <>
          <text
            className={styles.capText}
            x={x + w * 0.3}
            y={textY}
            textAnchor="middle"
          >
            {label}
          </text>
          <text
            className={styles.capText}
            x={x + w * 0.76}
            y={textY}
            textAnchor="middle"
          >
            {label2}
          </text>
        </>
      ) : (
        <text
          className={big ? styles.capSymbol : styles.capText}
          x={x + w / 2}
          y={big ? y + h / 2 + 18 : textY}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
      {jacks ? (
        <>
          <path
            className={styles.jackMark}
            d={`M${x + w * 0.2} ${y + 4}h12M${x + w * 0.2} ${y + 4}v-4M${x + w * 0.66} ${y + 4}h12M${x + w * 0.66} ${y + 4}v-4`}
          />
          <circle
            className={styles.jackDot}
            cx={x + w * 0.43}
            cy={y + 3}
            r="2.4"
          />
          <circle
            className={styles.jackDot}
            cx={x + w * 0.62}
            cy={y + 3}
            r="2.4"
          />
        </>
      ) : null}
    </>
  )
}

function CapControl({
  zone,
  cap,
  api,
}: {
  zone: string
  cap: Cap
  api: MachineApi
}) {
  const id = capId(zone, cap)
  const entry = NAV_BY_ID.get(id)
  return (
    <Control
      id={id}
      api={api}
      className={`${styles.cap} ${TONE_CLASS[cap.tone]}`}
      ring={entry ? ring(cap.x, cap.y, cap.w, cap.h, 5) : null}
    >
      <CapFace cap={cap} label={entry?.label ?? cap.label} />
    </Control>
  )
}

/** The pad's own artwork: kit, pattern, blocks, vinyl, square, zero, or print. */
function PadArt({ glyph, value }: { glyph: string; value?: string }) {
  switch (glyph) {
    case 'kit':
      return (
        <>
          <ellipse
            cx="30"
            cy="20"
            rx="17"
            ry="7"
            className={styles.padOrange}
          />
          <path d="M13 20 17 48h26l4-28Z" className={styles.padGreen} />
          <path d="M30 22v26" stroke={PALETTE.capFace} strokeWidth="2.4" />
        </>
      )
    case 'pattern':
      return (
        <>
          <rect
            x="9"
            y="34"
            width="20"
            height="7"
            rx="3.5"
            className={styles.padOrange}
            transform="rotate(-38 19 37)"
          />
          <circle cx="34" cy="18" r="6" className={styles.padGreen} />
          <rect
            x="30"
            y="26"
            width="7"
            height="7"
            rx="2"
            className={styles.padOrange}
          />
          <rect
            x="40"
            y="20"
            width="7"
            height="7"
            rx="2"
            className={styles.padOrange}
          />
          <rect
            x="36"
            y="34"
            width="7"
            height="7"
            rx="2"
            className={styles.padOrange}
          />
        </>
      )
    case 'blocks':
      return (
        <>
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={10 + col * 12}
                y={9 + row * 12}
                width="8"
                height="9"
                rx="1.6"
                className={(row + col) % 2 ? styles.padGreen : styles.padOrange}
              />
            )),
          )}
        </>
      )
    case 'vinyl':
      return (
        <>
          <circle cx="30" cy="30" r="21" className={styles.padOrange} />
          <circle cx="24" cy="26" r="3" fill={PALETTE.capFaceHi} />
          <circle cx="36" cy="34" r="3" fill={PALETTE.capFaceHi} />
        </>
      )
    case 'square':
      return (
        <rect
          x="14"
          y="12"
          width="15"
          height="15"
          rx="3"
          className={styles.padOrange}
        />
      )
    case 'zero':
      return (
        <>
          <rect
            x="21"
            y="11"
            width="18"
            height="38"
            rx="9"
            className={styles.padGreen}
          />
          <rect
            x="26"
            y="22"
            width="8"
            height="16"
            rx="4"
            fill={PALETTE.padFace}
          />
        </>
      )
    case 'text':
      return (
        <text className={styles.padWord} x="30" y="36" textAnchor="middle">
          {value}
        </text>
      )
    default:
      return (
        <text className={styles.padDigit} x="30" y="52" textAnchor="middle">
          {value}
        </text>
      )
  }
}

function Led({ cx, cy, i }: { cx: number; cy: number; i: number }) {
  return (
    <g className={styles.led} style={vars({ '--i': i })}>
      <circle className={styles.ledOff} cx={cx} cy={cy} r="6" />
      <circle className={styles.ledOn} cx={cx} cy={cy} r="6" />
      <circle className={styles.ledGlow} cx={cx} cy={cy} r="11" />
    </g>
  )
}

/** How many lamps there are, so the meter's stagger has a known span. */
const LED_COUNT = PARAM_ROWS.length * PAD_COLS.length

/**
 * A printed name longer than its column is pinched to fit rather than allowed
 * to run into the next one — the label rows are 130 units apart, and
 * `BOOKMARKS` at the reference's own label size is wider than that.
 */
const longLabel = (text: string) =>
  text.length > 6
    ? { textLength: PAD.w - 30, lengthAdjust: 'spacingAndGlyphs' as const }
    : {}

/** A plate behind the print, so the glyph texture never crowds the name. */
const screenPlate = { x: 10, y: SCREEN_UI.status.y + 6, w: 636, h: 168 }

function Panel({ api }: { api: MachineApi }) {
  return (
    <svg
      className={styles.panel}
      viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={PALETTE.bodyHi} />
          <stop offset="0.55" stopColor={PALETTE.body} />
          <stop offset="1" stopColor={PALETTE.bodyLo} />
        </linearGradient>
        <linearGradient id="fascia" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor={PALETTE.fascia} />
          <stop offset="1" stopColor={PALETTE.fasciaLo} />
        </linearGradient>
        <linearGradient id="plate" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={PALETTE.plate} />
          <stop offset="1" stopColor={PALETTE.bodyLo} />
        </linearGradient>
        <linearGradient id="cap-cream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PALETTE.capFaceHi} />
          <stop offset="1" stopColor={PALETTE.capFace} />
        </linearGradient>
        <linearGradient id="cap-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf9f3" />
          <stop offset="1" stopColor="#eae6dc" />
        </linearGradient>
        <linearGradient id="cap-orange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6420" />
          <stop offset="1" stopColor={PALETTE.orange} />
        </linearGradient>
        <linearGradient id="cap-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#12513b" />
          <stop offset="1" stopColor={PALETTE.green} />
        </linearGradient>
        <linearGradient id="pad-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfaf5" />
          <stop offset="1" stopColor={PALETTE.padFace} />
        </linearGradient>
        <pattern id="ribs" width="6" height="9" patternUnits="userSpaceOnUse">
          <rect y="0" width="6" height="4" fill="#ffffff" opacity="0.5" />
          <rect y="4" width="6" height="5" fill="#000000" opacity="0.07" />
        </pattern>
        <pattern
          id="grille"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <rect width="10" height="10" fill={PALETTE.grille} />
          <rect y="6" width="10" height="4" fill="#000000" />
          <rect y="0" width="10" height="1.4" fill="#6b6f60" opacity="0.5" />
        </pattern>
        <radialGradient id="grilleShade" cx="0.5" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.35" />
        </radialGradient>
        <radialGradient id="knob-white" cx="0.38" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#eae6dc" />
          <stop offset="1" stopColor="#c9c2b3" />
        </radialGradient>
        <radialGradient id="knob-orange" cx="0.38" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#ff7a3a" />
          <stop offset="0.62" stopColor={PALETTE.orange} />
          <stop offset="1" stopColor={PALETTE.orangeLo} />
        </radialGradient>
        <radialGradient id="knob-green" cx="0.38" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#1a6b4c" />
          <stop offset="0.62" stopColor={PALETTE.green} />
          <stop offset="1" stopColor={PALETTE.greenLo} />
        </radialGradient>
      </defs>

      <rect
        width={CANVAS.w}
        height={CANVAS.h}
        rx={CHASSIS.r}
        fill="url(#body)"
      />
      <rect
        x="1.5"
        y="1.5"
        width={CANVAS.w - 3}
        height={CANVAS.h - 3}
        rx={CHASSIS.r - 1}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="2"
      />

      {/* ---- fascia, wordmark and speaker ---- */}
      <rect
        x={FASCIA.x}
        y={FASCIA.y}
        width={FASCIA.w}
        height={FASCIA.h}
        fill="url(#fascia)"
      />
      <rect
        x={SPEAKER.x}
        y={SPEAKER.y}
        width={SPEAKER.w}
        height={SPEAKER.h}
        fill="url(#plate)"
      />
      <rect
        x={SPEAKER.x}
        y={SPEAKER.y}
        width={SPEAKER.w}
        height={SPEAKER.h}
        fill="url(#ribs)"
      />
      <rect
        x={SPEAKER.x}
        y={SPEAKER.y}
        width={SPEAKER.w}
        height={SPEAKER.h}
        fill="none"
        stroke="#00000018"
        strokeWidth="2"
      />
      <circle
        cx={SPEAKER.grille.cx}
        cy={SPEAKER.grille.cy}
        r={SPEAKER.grille.r}
        fill="url(#grille)"
      />
      <circle
        cx={SPEAKER.grille.cx}
        cy={SPEAKER.grille.cy}
        r={SPEAKER.grille.r}
        fill="url(#grilleShade)"
      />
      <circle
        cx={SPEAKER.grille.cx}
        cy={SPEAKER.grille.cy}
        r={SPEAKER.grille.r}
        fill="none"
        stroke="#0c0f0a"
        strokeWidth="5"
      />
      <circle
        cx={SPEAKER.grille.cx}
        cy={SPEAKER.grille.cy}
        r={SPEAKER.grille.r - 5}
        fill="none"
        stroke="#00000055"
        strokeWidth="2"
      />
      {DIMPLES.map((dimple) => (
        <circle
          key={`${dimple.cx}-${dimple.cy}`}
          cx={dimple.cx}
          cy={dimple.cy}
          r="13"
          fill="#00000012"
          stroke="#ffffff55"
          strokeWidth="1.5"
        />
      ))}
      <text className={styles.wordmark} x={WORDMARK.x} y={WORDMARK.y}>
        {SCREEN_COPY.brand}
      </text>
      <text className={styles.model} x={WORDMARK.x + 2} y={WORDMARK.supertoneY}>
        {SCREEN_COPY.model}
      </text>
      <text className={styles.tagline} x={WORDMARK.x} y={WORDMARK.lineY}>
        {SCREEN_COPY.tagline}
      </text>

      {/* ---- screen module: the bezel; the lit part is its own plane ---- */}
      <rect
        x={FRAME.x}
        y={FRAME.y}
        width={FRAME.w}
        height={FRAME.h}
        rx={FRAME.r}
        fill={PALETTE.frame}
      />
      <rect
        x={2}
        y={FRAME.y + 6}
        width={CANVAS.w - 4}
        height={FRAME.h - 12}
        fill={PALETTE.frame}
        opacity="0.55"
      />
      {SCREWS.map((screw) => (
        <g key={`${screw.cx}-${screw.cy}`}>
          <circle
            cx={screw.cx}
            cy={screw.cy}
            r="7"
            fill="#0a0c09"
            opacity="0.75"
          />
          <circle
            cx={screw.cx - 1.5}
            cy={screw.cy - 1.5}
            r="2.4"
            fill="#ffffff"
            opacity="0.18"
          />
        </g>
      ))}

      {/* ---- console silkscreen ---- */}
      {SILK_RULES.map((rule) => (
        <path key={rule.d} className={styles.silkRule} d={rule.d} />
      ))}
      {SILK_LABELS.map((label) => (
        <text key={label.text} className={styles.silk} x={label.x} y={label.y}>
          {label.text}
        </text>
      ))}
      <path
        className={styles.gainRule}
        d={`M668 ${KNOBS.bpm.cy - 30}v60h-10M668 ${KNOBS.bpm.cy - 30}h10`}
      />
      <text
        className={styles.gainText}
        x="656"
        y={KNOBS.bpm.cy}
        transform={`rotate(-90 656 ${KNOBS.bpm.cy})`}
      >
        GAIN
      </text>
      <path
        className={styles.silkRule}
        d={`M944 ${KNOBS.swing.cy - 34}v68h-12M944 ${KNOBS.swing.cy - 34}h-12`}
      />
      <text
        className={styles.swingText}
        x="932"
        y={KNOBS.swing.cy}
        transform={`rotate(-90 932 ${KNOBS.swing.cy})`}
      >
        SWING
      </text>

      {/* ---- fader slot ---- */}
      <rect
        x={FADER.cx - 5}
        y={FADER.slotY}
        width="10"
        height={FADER.slotH}
        rx="5"
        fill="#2b2a22"
        opacity="0.85"
      />
      <rect
        x={FADER.cx - 5}
        y={FADER.slotY}
        width="10"
        height={FADER.slotH}
        rx="5"
        fill="none"
        stroke="#ffffff44"
        strokeWidth="1.2"
      />
      <path
        className={styles.silkRule}
        d={`M${FADER.cx - 30} ${FADER.capY + FADER.capH / 2}h60`}
      />

      {/* ---- caps ---- */}
      {LEFT_CAPS.map((cap) => (
        <CapControl key={cap.label} zone="left" cap={cap} api={api} />
      ))}
      {LIVE_CAPS.map((cap) => (
        <CapControl
          key={`${cap.y}-${cap.label}`}
          zone="live"
          cap={cap}
          api={api}
        />
      ))}
      {RIGHT_CAPS.map((cap) => (
        <CapControl
          key={`${cap.y}-${cap.label}`}
          zone="right"
          cap={cap}
          api={api}
        />
      ))}

      {/* ---- the pad field ---- */}
      {PADS.map((pad, i) => {
        const x = PAD_COLS[pad.col]
        const y = PAD_ROWS[pad.row]
        const id = padId(pad)
        const entry = NAV_BY_ID.get(id)
        return (
          <Control
            key={id}
            id={id}
            api={api}
            className={styles.pad}
            ring={entry ? ring(x, y, PAD.w, PAD.h, PAD.r) : null}
          >
            <g style={vars({ '--i': i })}>
              <rect
                className={styles.padShadow}
                x={x}
                y={y + 5}
                width={PAD.w}
                height={PAD.h}
                rx={PAD.r}
              />
              <rect
                className={styles.padBody}
                x={x}
                y={y}
                width={PAD.w}
                height={PAD.h}
                rx={PAD.r}
              />
              <rect
                className={styles.padFace}
                x={x + 1.6}
                y={y + 1.6}
                width={PAD.w - 3.2}
                height={PAD.h - 3.2}
                rx={PAD.r - 1}
              />
              <g className={styles.padGlow}>
                <rect
                  className={styles.padPulse}
                  x={x + 5}
                  y={y + 5}
                  width={PAD.w - 10}
                  height={PAD.h - 10}
                  rx="8"
                />
              </g>
              <g transform={`translate(${x} ${y})`}>
                <PadArt glyph={pad.glyph} value={pad.value} />
              </g>
            </g>
          </Control>
        )
      })}

      {/* ---- lamps, their printed names, and the handoff row ---- */}
      {PARAM_ROWS.map((row, rowIndex) =>
        PAD_COLS.map((colX, colIndex) => {
          const i = rowIndex * PAD_COLS.length + colIndex
          const pad = PADS.find((p) => p.col === colIndex && p.row === rowIndex)
          const entry = pad ? NAV_BY_ID.get(padId(pad)) : undefined
          const clone = row.labels[colIndex]
          const last = rowIndex === PARAM_ROWS.length - 1
          const armedPad = pad && api.active === padId(pad)
          return (
            <g
              key={`${rowIndex}-${colIndex}`}
              data-armed={armedPad ? 'true' : 'false'}
            >
              <Led cx={colX + 18} cy={row.y} i={i} />
              {entry || clone ? (
                <text
                  className={`${styles.param} ${
                    last && !entry ? styles.paramOut : ''
                  }`}
                  x={colX + 40}
                  y={row.y + 5}
                  {...longLabel(entry?.label ?? clone)}
                >
                  {entry?.label ?? clone}
                </text>
              ) : null}
              {/* the machine hands over on its own bottom label row */}
              {last && colIndex > 0 ? (
                <text
                  className={`${styles.param} ${styles.paramHandoff} ${
                    colIndex === 2 ? styles.paramHandoffKey : ''
                  }`}
                  x={colX + 40}
                  y={row.y + 5}
                >
                  {SCREEN_COPY.handoff[colIndex - 1]}
                </text>
              ) : null}
            </g>
          )
        }),
      )}
      {LOOSE_LEDS.map((led, i) => (
        <Led key={`loose-${i}`} cx={led.cx} cy={led.cy} i={LED_COUNT - 2 + i} />
      ))}

      {/* ---- top strip, last so its caps sit on the case edge ---- */}
      <rect
        x="0"
        y={TOP_STRIP.y - 18}
        width={CANVAS.w}
        height={TOP_STRIP.h + 20}
        fill="url(#body)"
      />
      <rect
        x="0"
        y={TOP_STRIP.y + TOP_STRIP.h - 2}
        width={CANVAS.w}
        height="2"
        fill="#00000018"
      />
      {TOP_CAPS.map((cap) => (
        <CapControl key={cap.label} zone="strip" cap={cap} api={api} />
      ))}
      <rect
        className={styles.powerLed}
        x={TOP_LED.x}
        y="1"
        width={TOP_LED.w}
        height={TOP_LED.h}
        rx="3"
      />

      {/* ---- knobs ---- */}
      {(
        Object.entries(KNOBS) as [
          keyof typeof KNOBS,
          (typeof KNOBS)[keyof typeof KNOBS],
        ][]
      ).map(([name, knob]) => (
        <g
          key={name}
          className={styles.knob}
          style={vars({
            '--cx': `${knob.cx}px`,
            '--cy': `${knob.cy}px`,
            '--sweep': knob.sweep,
          })}
        >
          <circle cx={knob.cx} cy={knob.cy + 6} r={knob.r} fill="#00000030" />
          <circle
            cx={knob.cx}
            cy={knob.cy}
            r={knob.r}
            fill={`url(#knob-${knob.tone})`}
          />
          <circle
            cx={knob.cx}
            cy={knob.cy}
            r={knob.r}
            fill="none"
            stroke="#00000030"
            strokeWidth="1.6"
          />
          <g className={styles.knobSpin}>
            <circle
              cx={knob.cx}
              cy={knob.cy}
              r={knob.cap}
              fill={`url(#knob-${knob.tone})`}
            />
            <circle
              cx={knob.cx}
              cy={knob.cy}
              r={knob.cap}
              fill="none"
              stroke="#00000022"
              strokeWidth="1.4"
            />
            <rect
              x={knob.cx - 2}
              y={knob.cy - knob.cap + 3}
              width="4"
              height={knob.cap - 6}
              rx="2"
              fill="#ffffff"
              opacity={knob.tone === 'white' ? 0.35 : 0.75}
            />
          </g>
        </g>
      ))}

      {/* ---- fader cap ---- */}
      <g className={styles.faderCap} style={vars({ '--travel': FADER.travel })}>
        <rect
          x={FADER.cx - FADER.capW / 2}
          y={FADER.capY}
          width={FADER.capW}
          height={FADER.capH}
          rx="7"
          fill="#00000030"
        />
        <rect
          x={FADER.cx - FADER.capW / 2}
          y={FADER.capY - 4}
          width={FADER.capW}
          height={FADER.capH}
          rx="7"
          fill="url(#cap-light)"
          stroke="#00000022"
          strokeWidth="1.2"
        />
        <rect
          x={FADER.cx - FADER.capW / 2 + 4}
          y={FADER.capY - 1}
          width={FADER.capW - 8}
          height="3"
          rx="1.5"
          fill="#ffffff"
          opacity="0.7"
        />
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------
 * The screen
 * ---------------------------------------------------------------------- */

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

function ScreenArt() {
  const { w, h, pad, counter, field, words, status } = SCREEN_UI
  const cell = field.cell
  const pitch = cell + field.gap
  const gridW = field.cols * cell + (field.cols - 1) * field.gap
  const x0 = (w - gridW) / 2
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
        <linearGradient id="screen-sheen" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="0.32" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} className={styles.screenGreen} />

      {/* the reference's glyph texture, under everything */}
      <g className={styles.field}>
        {FIELD_ROWS.map((row, rowIndex) =>
          row.map((glyph, colIndex) => {
            const i = rowIndex * field.cols + colIndex
            const tone =
              FIELD_TONES[(rowIndex + colIndex * 3) % FIELD_TONES.length]
            return (
              <g
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.glyph} ${styles[`tone${tone[0].toUpperCase()}${tone.slice(1)}`]}`}
                style={vars({ '--i': i })}
                transform={`translate(${round(x0 + colIndex * pitch)} ${round(field.top + rowIndex * pitch)}) scale(${round(cell / 24)})`}
              >
                <Glyph id={glyph} />
              </g>
            )
          }),
        )}
      </g>

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
        width={4 * (counter.digit * 0.62 + counter.gap) + counter.dot + 24}
        height={counter.digit + 24}
        rx="6"
        className={styles.readoutWell}
      />

      {/* the machine's own counter */}
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

      {/* the six layer words, where the reference prints them */}
      <g className={styles.words}>
        {SCREEN_COPY.words.map((word, index) => {
          const step = words.size * 0.62 * 6 + words.glyph + words.gap + 14
          const x = words.x + index * step
          return (
            <g key={word}>
              <g
                className={styles.wordGlyph}
                transform={`translate(${round(x)} ${round(words.y - words.glyph * 0.78)}) scale(${round(words.glyph / 24)})`}
              >
                <Glyph id={FIELD_ROWS[0][index]} />
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

      <rect width={w} height={h} className={styles.screenSheen} />
      <text className={styles.screenStatus} x={pad} y={status.y}>
        {SCREEN_COPY.status[0]}
      </text>
      <text
        className={styles.screenStatus}
        x={w - pad}
        y={status.y}
        textAnchor="end"
      >
        {SCREEN_COPY.status[1]}
      </text>
      <rect
        x="0.5"
        y="0.5"
        width={w - 1}
        height={h - 1}
        rx={SCREEN.r}
        fill="none"
        className={styles.screenEdge}
      />
    </svg>
  )
}

/* -------------------------------------------------------------------------
 * Assembly
 * ---------------------------------------------------------------------- */

export function RiddimMachine({
  interactive,
  printCopy,
}: {
  /** The machine's controls are the navigation (desktop widths). */
  interactive: boolean
  /** The fascia's copy is large enough to read (wide desktops). */
  printCopy: boolean
}) {
  const [active, setActive] = useState<string | null>(null)
  const { setTheme } = useTheme()

  const describe = useCallback((id: string | null) => setActive(id), [])

  const activate = useCallback(
    (entry: NavEntry) => {
      if (entry.kind !== 'action') return
      switch (entry.action) {
        case 'theme-light':
          setTheme('light')
          break
        case 'theme-dark':
          setTheme('dark')
          break
        case 'copy-link':
          void navigator.clipboard?.writeText(window.location.href)
          break
        case 'top':
          window.scrollTo({ top: 0, behavior: 'smooth' })
          break
      }
    },
    [setTheme],
  )

  const api: MachineApi = { enabled: interactive, active, describe, activate }
  const armed = active ? NAV_BY_ID.get(active) : undefined
  const Shell = interactive ? 'nav' : 'div'

  /* The clone table owns these numbers; HTML type reads them through the same
     `--u` the SVG uses, so print and markup cannot drift apart. `y` in the
     geometry is a baseline, and a line box puts it 0.8em down. */
  const baseline = (y: number, size: number) => round(y - size * 0.8)
  const screenVars = vars({
    '--scr-title-top': baseline(SCREEN_UI.title.y, SCREEN_UI.title.size),
    '--scr-title-size': SCREEN_UI.title.size,
    '--scr-role-top': baseline(SCREEN_UI.role.y, SCREEN_UI.role.size),
    '--scr-role-size': SCREEN_UI.role.size,
    '--scr-readout-top': baseline(SCREEN_UI.readout.y, SCREEN_UI.readout.size),
    '--scr-readout-size': SCREEN_UI.readout.size,
    '--scr-pad': SCREEN_UI.pad,
  })
  const copyVars = vars({
    '--copy-x': COPY_BLOCK.x,
    '--copy-y': COPY_BLOCK.y,
    '--copy-w': COPY_BLOCK.w,
    '--copy-kicker': COPY_BLOCK.kicker,
    '--copy-headline': COPY_BLOCK.headline,
    '--copy-line': COPY_BLOCK.line,
    '--copy-sub': COPY_BLOCK.sub,
    '--copy-hint': COPY_BLOCK.hint,
  })

  return (
    <Shell
      className={styles.machine}
      {...(interactive ? { 'aria-label': 'Primary' } : {})}
    >
      <Panel api={api} />
      <span className={styles.sheen} aria-hidden="true" />

      <div className={styles.screen}>
        <ScreenArt />
        <div className={styles.screenUi} style={screenVars}>
          <h1 className={styles.title}>{SCREEN_COPY.title}</h1>
          <p className={styles.role}>{SCREEN_COPY.role}</p>
          <p className={styles.readout} aria-hidden="true">
            <b>{armed?.label ?? SCREEN_COPY.idle.name}</b>
            <span>{armed?.note ?? SCREEN_COPY.idle.note}</span>
          </p>
        </div>
      </div>

      {printCopy ? (
        <div className={styles.copy} style={copyVars}>
          <p className={styles.kicker}>
            <i aria-hidden="true" />
            <span>{COPY.kicker}</span>
            <em>{COPY.place}</em>
          </p>
          <strong className={styles.line}>{COPY.line}</strong>
          <p className={styles.sub}>{COPY.sub}</p>
          <p className={styles.hint}>{COPY.hint}</p>
        </div>
      ) : null}
    </Shell>
  )
}

/**
 * The phone's stack: the same copy and the same destinations, at sizes a phone
 * can read and tap. The machine above it stays the poster, and only one of the
 * two is ever a live navigation — `interactive` and `printCopy` are set from
 * the viewport in `riddim-hero.tsx`.
 */
export function HeroIndex({ showIndex }: { showIndex: boolean }) {
  const { setTheme } = useTheme()

  const activate = useCallback(
    (entry: NavEntry) => {
      if (entry.kind !== 'action') return
      switch (entry.action) {
        case 'theme-light':
          setTheme('light')
          break
        case 'theme-dark':
          setTheme('dark')
          break
        case 'copy-link':
          void navigator.clipboard?.writeText(window.location.href)
          break
        case 'top':
          window.scrollTo({ top: 0, behavior: 'smooth' })
          break
      }
    },
    [setTheme],
  )

  return (
    <div className={styles.stack}>
      <div className={styles.stackCopy}>
        <p className={styles.kicker}>
          <i aria-hidden="true" />
          <span>{COPY.kicker}</span>
          <em>{COPY.place}</em>
        </p>
        <strong className={styles.line}>{COPY.line}</strong>
        <p className={styles.sub}>{COPY.sub}</p>
      </div>

      {showIndex ? (
        <nav aria-label="Primary">
          <ul className={styles.index}>
            {MACHINE_NAV.map((entry) => (
              <li key={entry.id}>
                {entry.kind === 'link' ? (
                  entry.external ||
                  entry.href.startsWith('#') ||
                  entry.href.startsWith('mailto:') ? (
                    <a
                      className={styles.indexLink}
                      href={entry.href}
                      {...(entry.external
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                    >
                      <b>{entry.label}</b>
                    </a>
                  ) : (
                    <Link className={styles.indexLink} href={entry.href}>
                      <b>{entry.label}</b>
                    </Link>
                  )
                ) : (
                  <button
                    type="button"
                    className={styles.indexLink}
                    onClick={() => activate(entry)}
                  >
                    <b>{entry.label}</b>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
