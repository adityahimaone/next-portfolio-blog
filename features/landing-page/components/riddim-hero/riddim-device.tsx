'use client'

import Link from 'next/link'
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { useTheme } from 'next-themes'

import {
  COPY,
  MACHINE_NAV,
  NAV_BY_ID,
  SCREEN_COPY,
  SCREEN_NAV,
  type NavEntry,
} from './riddim-content'
import {
  CANVAS,
  CHASSIS,
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
import { LcdFace } from './riddim-screen'
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
        {/* The reference's grille is a handful of bold black slats on the
            cream plate, with the cone showing dark at the middle. */}
        <pattern
          id="grille"
          width="25"
          height="25"
          patternUnits="userSpaceOnUse"
        >
          <rect width="25" height="25" fill="#e6dccb" />
          <rect y="10.5" width="25" height="14.5" fill="#06140e" />
          <rect y="10.5" width="25" height="1.6" fill="#2c3a31" opacity="0.8" />
        </pattern>
        <radialGradient id="grilleCone" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#050c08" stopOpacity="0.96" />
          <stop offset="0.74" stopColor="#050c08" stopOpacity="0.9" />
          <stop offset="1" stopColor="#050c08" stopOpacity="0" />
        </radialGradient>
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
        {/* The lamp's halo, as a gradient instead of a blur filter. */}
        <radialGradient id="led-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={PALETTE.orange} stopOpacity="0.6" />
          <stop offset="0.42" stopColor={PALETTE.orange} stopOpacity="0.22" />
          <stop offset="1" stopColor={PALETTE.orange} stopOpacity="0" />
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
        r={SPEAKER.grille.r * 0.46}
        fill="url(#grilleCone)"
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
 * Assembly
 * ---------------------------------------------------------------------- */

export function RiddimMachine({
  interactive,
}: {
  /** The machine's controls are the navigation (desktop widths). */
  interactive: boolean
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

  return (
    <Shell
      className={styles.machine}
      data-riddim-machine
      {...(interactive ? { 'aria-label': 'Primary' } : {})}
    >
      <Panel api={api} />
      <span className={styles.sheen} aria-hidden="true" />

      <div className={styles.screen}>
        <LcdFace
          heading
          readout={armed ? { name: armed.label, note: armed.note } : undefined}
          nav={{ entries: SCREEN_NAV, interactive, active, describe }}
        />
      </div>
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
