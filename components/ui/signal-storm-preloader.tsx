'use client'

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

import { cn } from '@/lib/utils'

import { hash, useScramble } from './preloader-kit'
import {
  GW,
  LW,
  glyphPath,
  glyphWidth,
  layoutPoster,
  type Cell,
} from './poster-glyphs'
import styles from './signal-storm-preloader.module.css'

const s = styles

/* ═══════════════════════════════════════════════════════════════════════════
   Signal Storm: a 2.8s studio-poster preloader.

   A tweak of the Waving Portfolio Landing poster, rewritten for this site:

   - **The poster reads  AD [I] TYA / H [I] MAONE.** Both names contain an I, so
     the one giant shared letter is a tall bar, which is also a playhead. The
     reference's P[O]RT / F[O]LIO trick, found in the name.
   - **The storm is studio vocabulary** (PLAY, REC, LOOP, MIX...) in the three
     lane colours, not random letters.
   - **The waving character is a metronome.** It rises from the baseline, and
     once the poster has landed its pendulum ticks at 120 BPM.
   - **The dice corners are pads:** a play pad and a record pad.
   - **Seven seconds became 2.8.** And it does not end on the poster: it exits
     the way the site's other boot does, three track lanes shuttering open onto
     the page.

   ## Why it is built like this

   It is an overlay, never a gate: the page underneath is already rendered and
   hydrated, this sits over it with `pointer-events: none` and removes itself, so
   it cannot cost Time to Interactive. It is `fixed`, `inset-0`,
   `contain: strict`, and everything inside moves by transform, opacity or clip,
   so it cannot shift the layout. Every shape is a path in this file or a box:
   there is no font, image or package to wait for (the labels use the platform's
   own monospace). And every duration and delay comes from `STORM_TIMELINE`, is
   handed to the stylesheet as a custom property, and is checked by a test to end
   inside the total.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Timeline (ms) ──────────────────────────────────────────────────────── */

export const STORM_TIMELINE = {
  total: 2800,
  /** The storm: rows slide in, run, then shutter away, one after another. */
  storm: {
    enter: 360,
    enterStagger: 40,
    shutterStart: 600,
    shutterStagger: 45,
    shutterDuration: 340,
  },
  /** The letters roll into place (under the storm); the giant one lands last. */
  reel: { start: 380, spread: 300, rowStagger: 40, duration: 620 },
  giant: { start: 800, duration: 560 },
  /** The poster thumps when the giant letter lands. */
  thump: { start: 1360, duration: 240 },
  /** The rules draw in; the labels decode while they do. */
  rules: { start: 1360, stagger: 120, duration: 600 },
  scramble: { start: 1250, end: 1950 },
  corners: { start: 1400, stagger: 80, duration: 450 },
  /** The metronome rises, then ticks. */
  metronome: { start: 1400, duration: 450 },
  tick: { start: 1850, period: 1000 },
  /** The poster leaves, and the three lanes shutter open. */
  leave: { start: 2350, duration: 150 },
  panels: { start: 2400, stagger: 50, duration: 300 },
} as const

/** The reduced-motion beat: the resolved poster, held, then faded. */
export const STORM_REDUCED_MS = 900

export const STORM_ROWS = 7
export const PANELS = 3

/** When the last thing in the timeline finishes. */
export function stormEnd(t: typeof STORM_TIMELINE = STORM_TIMELINE): number {
  const lastStormShutter =
    t.storm.shutterStart +
    (STORM_ROWS - 1) * t.storm.shutterStagger +
    t.storm.shutterDuration
  const lastCell =
    t.reel.start + t.reel.spread + t.reel.rowStagger + t.reel.duration
  return Math.max(
    t.storm.enter + (STORM_ROWS - 1) * t.storm.enterStagger,
    lastStormShutter,
    lastCell,
    t.giant.start + t.giant.duration,
    t.thump.start + t.thump.duration,
    t.rules.start + t.rules.stagger + t.rules.duration,
    t.scramble.end,
    t.corners.start + t.corners.stagger + t.corners.duration,
    t.metronome.start + t.metronome.duration,
    t.leave.start + t.leave.duration,
    t.panels.start + (PANELS - 1) * t.panels.stagger + t.panels.duration,
  )
}

/* ── Content ────────────────────────────────────────────────────────────── */

export const PALETTE = {
  paper: '#EAE6DF',
  ink: '#141414',
  accent: '#FF5A1F',
  green: '#10B981',
  blue: '#3B82F6',
  amber: '#F59E0B',
} as const

/** AD + I + TYA = ADITYA; H + I + MAONE = HIMAONE. One I, shared. */
export const POSTER = {
  left: ['AD', 'H'] as [string, string],
  giant: 'I',
  right: ['TYA', 'MAONE'] as [string, string],
}

export const LABELS = {
  name: 'FRONTEND ENGINEER',
  year: '2026',
  roleLeft: 'JAKARTA // UTC+7',
  roleRight: 'TAKE 01 // LOCKED',
}

/** The storm's vocabulary. */
export const STORM_WORDS = [
  'PLAY',
  'REC',
  'LOOP',
  'MIX',
  'TAKE',
  'GAIN',
  'PAN',
  'MUTE',
  'SOLO',
  'BPM',
  'SYNC',
  'CUT',
  'FADE',
  'BAR',
  'EQ',
  'DUB',
  'SEND',
  'BUS',
] as const

/** Per row: the stroke colour and whether it is outlined (hollow) or solid. */
export const STORM_TONES: { color: string; hollow: boolean }[] = [
  { color: PALETTE.accent, hollow: false },
  { color: PALETTE.ink, hollow: true },
  { color: PALETTE.green, hollow: false },
  { color: PALETTE.accent, hollow: true },
  { color: PALETTE.blue, hollow: false },
  { color: PALETTE.ink, hollow: true },
  { color: PALETTE.amber, hollow: false },
]

export const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export type StormGlyph = { ch: string; x: number; w: number }

/**
 * One row of the storm: studio words laid end to end until the row is longer
 * than `minSpan`. The strip is drawn twice side by side and marqueed by half its
 * width, so the loop is seamless only if `span` is the exact width of one copy,
 * which is what this returns.
 */
export function stormRow(row: number, minSpan = 2600) {
  const glyphs: StormGlyph[] = []
  let x = 0
  let k = 0
  while (x < minSpan) {
    const word = STORM_WORDS[hash(row * 97, k) % STORM_WORDS.length]
    for (const ch of word) {
      const w = glyphWidth(ch, 62, 12)
      glyphs.push({ ch, x, w })
      x += w + 26
    }
    x += glyphWidth(' ', 62, 12) + 26
    k += 1
  }
  return { row, glyphs, span: x, tone: STORM_TONES[row % STORM_TONES.length] }
}

/** The glyphs a reel rolls through before it lands on the letter. */
export function reelFor(cell: Cell, index: number, decoys: number) {
  const base = cell.giant ? GW : LW
  const out: { ch: string; w: number }[] = []
  for (let k = 1; k < decoys; k += 1) {
    const ch = AZ[hash(index * 131, k * 53) % 26]
    out.push({ ch, w: Math.min(glyphWidth(ch, base, cell.s), cell.w * 1.25) })
  }
  return out
}

/** When a cell's reel starts, in ms from mount: left to right, row by row; the
 *  giant letter has its own, late, start. */
export function cellDelay(
  cell: Cell,
  posterWidth: number,
  t: typeof STORM_TIMELINE = STORM_TIMELINE,
): number {
  if (cell.giant) return t.giant.start
  return Math.round(
    t.reel.start +
      (cell.x / posterWidth) * t.reel.spread +
      cell.row * t.reel.rowStagger,
  )
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

const LABEL = 30
const labelWidth = (str: string) => str.length * LABEL * 0.72

const reducedNow = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function StormRow({
  row,
  minSpan,
  paper,
}: {
  row: number
  minSpan: number
  paper: string
}) {
  const { glyphs, span, tone } = useMemo(
    () => stormRow(row, minSpan),
    [row, minSpan],
  )
  const dir = row % 2 ? 'r' : 'l'
  return (
    <div
      className={s.srow}
      data-dir={dir}
      style={{ '--row': row } as CSSProperties}
    >
      <svg
        className={s.strip}
        data-dir={dir}
        viewBox={`0 -6 ${span * 2} 152`}
        style={{ animationDuration: `${4.6 + (row % 3) * 1.5}s` }}
        fill="none"
        strokeLinecap="square"
        strokeMiterlimit={4}
      >
        {[0, span].map((off) =>
          glyphs.map((g, k) => {
            const d = glyphPath(g.ch, g.w, 140, 12)
            return (
              <g key={`${off}-${k}`} transform={`translate(${off + g.x} 0)`}>
                <path d={d} stroke={tone.color} strokeWidth={12} />
                {tone.hollow && <path d={d} stroke={paper} strokeWidth={5} />}
              </g>
            )
          }),
        )}
      </svg>
    </div>
  )
}

/** One reel: the letter, with decoy glyphs stacked above it, rolled up into the
 *  window. Invisible until its own start, so letters arrive rather than wait. */
function LetterCell({
  cell,
  index,
  delay,
}: {
  cell: Cell
  index: number
  delay: number
}) {
  const pad = cell.s
  const pitch = cell.h + cell.s * 2 + 24
  const n = cell.giant ? 14 : 10
  const reel = reelFor(cell, index, n)
  const style = {
    '--dist': `${(n - 1) * pitch}px`,
    '--delay': `${delay}ms`,
    '--dur': `${cell.giant ? STORM_TIMELINE.giant.duration : STORM_TIMELINE.reel.duration}ms`,
  } as CSSProperties
  return (
    <svg
      x={cell.x - pad}
      y={cell.y - pad}
      width={cell.w + pad * 2}
      height={cell.h + pad * 2}
      viewBox={`${-pad} ${-pad} ${cell.w + pad * 2} ${cell.h + pad * 2}`}
      overflow="hidden"
    >
      <g
        className={cn(s.reel, cell.giant && s.giantReel)}
        style={style}
        fill="none"
        stroke={PALETTE.accent}
        strokeWidth={cell.s}
        strokeLinecap="square"
        strokeMiterlimit={4}
      >
        <path d={glyphPath(cell.ch, cell.w, cell.h, cell.s)} />
        {reel.map((g, k) => (
          <path
            key={k}
            transform={`translate(${(cell.w - g.w) / 2} ${-(k + 1) * pitch})`}
            d={glyphPath(g.ch, g.w, cell.h, cell.s)}
          />
        ))}
      </g>
    </svg>
  )
}

/** A rule with a dot at each end (and one in the middle on the top rule). */
function Rule({
  a,
  b,
  y,
  mid,
  delay,
}: {
  a: number
  b: number
  y: number
  mid?: boolean
  delay: number
}) {
  if (b - a < 40) return null
  const dots = mid ? [a, (a + b) / 2, b] : [a, b]
  return (
    <g>
      <path
        className={s.draw}
        pathLength={1}
        d={`M ${a} ${y} L ${b} ${y}`}
        stroke={PALETTE.accent}
        strokeWidth={3}
        style={{ '--delay': `${delay}ms` } as CSSProperties}
      />
      {dots.map((x, k) => (
        <circle
          key={k}
          className={s.dot}
          cx={x}
          cy={y}
          r={6.5}
          fill={PALETTE.accent}
          style={{ '--delay': `${delay + k * 120}ms` } as CSSProperties}
        />
      ))}
    </g>
  )
}

/**
 * The metronome. Local frame 0 0 460 600, the bottom edge is the baseline it
 * rises from; the pendulum pivots at (230, 540) and ticks at 120 BPM once the
 * poster has landed. Hand-inked in the reference's manner: paper fill, ink
 * outline, an ink speckle on the shaded side.
 */
function Metronome({ clipId }: { clipId: string }) {
  const body = 'M 105 600 L 170 130 L 290 130 L 355 600 Z'
  const specks = useMemo(
    () =>
      Array.from({ length: 70 }, (_, k) => {
        const y = 140 + (hash(k, 3) % 440)
        const spread = 40 + ((y - 130) / 470) * 60
        const x = 232 + ((hash(k, 7) % 1000) / 1000) * spread
        return [x, y, 1 + (hash(k, 11) % 18) / 10] as const
      }),
    [],
  )
  const ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => 200 + i * 38)
  return (
    <g className={s.rise}>
      <clipPath id={clipId}>
        <path d={body} />
      </clipPath>
      <path d="M 92 560 L 368 560 L 372 640 L 88 640 Z" fill={PALETTE.ink} />
      <path
        d={body}
        fill={PALETTE.paper}
        stroke={PALETTE.ink}
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <g clipPath={`url(#${clipId})`} fill={PALETTE.ink}>
        {specks.map(([x, y, r], k) => (
          <circle key={k} cx={x} cy={y} r={r} />
        ))}
      </g>
      <rect x={186} y={112} width={88} height={26} rx={7} fill={PALETTE.ink} />
      <circle
        className={s.lamp}
        cx={230}
        cy={98}
        r={10}
        fill={PALETTE.accent}
        stroke={PALETTE.ink}
        strokeWidth={4}
      />
      <rect
        x={208}
        y={168}
        width={44}
        height={382}
        rx={22}
        fill={PALETTE.ink}
      />
      {ticks.map((y) => (
        <g key={y} stroke={PALETTE.ink} strokeWidth={3} strokeLinecap="round">
          <path d={`M 190 ${y} h 10`} />
          <path d={`M 260 ${y} h 10`} />
        </g>
      ))}
      <circle
        className={cn(s.blip, s.blipL)}
        cx={186}
        cy={150}
        r={6}
        fill={PALETTE.accent}
      />
      <circle
        className={cn(s.blip, s.blipR)}
        cx={274}
        cy={150}
        r={6}
        fill={PALETTE.accent}
      />
      <g className={s.pend}>
        <path
          d="M 230 540 L 230 196"
          stroke={PALETTE.accent}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d="M 207 262 L 253 262 L 247 300 L 213 300 Z"
          fill={PALETTE.accent}
          stroke={PALETTE.ink}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <circle
          cx={230}
          cy={540}
          r={9}
          fill={PALETTE.paper}
          stroke={PALETTE.ink}
          strokeWidth={4}
        />
      </g>
    </g>
  )
}

/** A corner pad: registration lines, an accent square, and a glyph on it. */
function Corner({ side }: { side: 'l' | 'r' }) {
  return (
    <div
      className={cn(s.corner, side === 'l' ? s.cornerL : s.cornerR)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 170 170">
        {[108, 124, 140].map((v) => (
          <path
            key={v}
            d={`M 0 ${v} L ${v} ${v} L ${v} 0`}
            fill="none"
            stroke={PALETTE.accent}
            strokeWidth={2}
          />
        ))}
        <rect x={0} y={0} width={92} height={92} fill={PALETTE.accent} />
        {side === 'l' ? (
          <path d="M 34 26 L 34 66 L 68 46 Z" fill={PALETTE.paper} />
        ) : (
          <circle
            className={s.rec}
            cx={46}
            cy={46}
            r={18}
            fill={PALETTE.paper}
          />
        )}
      </svg>
    </div>
  )
}

/* ── The component ──────────────────────────────────────────────────────── */

export type SignalStormPreloaderProps = {
  /** Called once, when the sequence ends (the overlay then removes itself). */
  onComplete?: () => void
  /** Merged over the container's classes, e.g. a higher `z-*` than the default. */
  className?: string
}

export default function SignalStormPreloader({
  onComplete,
  className,
}: SignalStormPreloaderProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [reduced] = useState(reducedNow)
  const [done, setDone] = useState(false)
  const [stormGone, setStormGone] = useState(reduced)
  const [compact, setCompact] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const complete = useRef(onComplete)
  const name = useRef<SVGTextElement | null>(null)
  const year = useRef<SVGTextElement | null>(null)
  const roleL = useRef<SVGTextElement | null>(null)
  const roleR = useRef<SVGTextElement | null>(null)

  useEffect(() => {
    complete.current = onComplete
  })

  const t = STORM_TIMELINE
  const animate = !reduced
  useScramble(name, LABELS.name, {
    start: t.scramble.start,
    end: t.scramble.end,
    enabled: animate,
  })
  useScramble(year, LABELS.year, {
    start: t.scramble.start + 80,
    end: t.scramble.end,
    enabled: animate,
  })
  useScramble(roleL, LABELS.roleLeft, {
    start: t.scramble.start + 40,
    end: t.scramble.end,
    enabled: animate,
  })
  useScramble(roleR, LABELS.roleRight, {
    start: t.scramble.start + 120,
    end: t.scramble.end,
    enabled: animate,
  })

  // The poster fits its container: a tall container gets the compact layout.
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width && height) setCompact(width / height < 0.9)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const end = window.setTimeout(
      () => {
        setDone(true)
        complete.current?.()
      },
      reduced ? STORM_REDUCED_MS : t.total,
    )
    // The storm is unmounted once its last row has shuttered away: a hidden
    // strip is still a running marquee.
    const storm = window.setTimeout(
      () => setStormGone(true),
      t.storm.shutterStart +
        (STORM_ROWS - 1) * t.storm.shutterStagger +
        t.storm.shutterDuration,
    )
    return () => {
      window.clearTimeout(end)
      window.clearTimeout(storm)
    }
  }, [reduced, t])

  const poster = useMemo(
    () => layoutPoster(POSTER.left, POSTER.giant, POSTER.right, compact),
    [compact],
  )
  const minSpan = compact ? 2200 : 2600

  if (done) return null

  const k = poster.charScale
  const charLeft = poster.charX - 205 * k
  const nameEnd = poster.margin + labelWidth(LABELS.name) + 26
  const yearStart = poster.width - poster.margin - labelWidth(LABELS.year) - 26
  const roleLEnd = poster.margin + labelWidth(LABELS.roleLeft) + 26
  const roleRStart =
    poster.width - poster.margin - labelWidth(LABELS.roleRight) - 26

  const vars = {
    contain: 'strict',
    '--paper': PALETTE.paper,
    '--ink': PALETTE.ink,
    '--accent': PALETTE.accent,
    '--t-enter': `${t.storm.enter}ms`,
    '--t-enter-stagger': `${t.storm.enterStagger}ms`,
    '--t-shutter-start': `${t.storm.shutterStart}ms`,
    '--t-shutter-stagger': `${t.storm.shutterStagger}ms`,
    '--t-shutter-dur': `${t.storm.shutterDuration}ms`,
    '--t-thump-start': `${t.thump.start}ms`,
    '--t-thump-dur': `${t.thump.duration}ms`,
    '--t-rules-dur': `${t.rules.duration}ms`,
    '--t-corner-start': `${t.corners.start}ms`,
    '--t-corner-stagger': `${t.corners.stagger}ms`,
    '--t-corner-dur': `${t.corners.duration}ms`,
    '--t-metro-start': `${t.metronome.start}ms`,
    '--t-metro-dur': `${t.metronome.duration}ms`,
    '--t-tick-start': `${t.tick.start}ms`,
    '--t-tick-period': `${t.tick.period}ms`,
    '--t-leave-start': `${t.leave.start}ms`,
    '--t-leave-dur': `${t.leave.duration}ms`,
    '--t-panel-start': `${t.panels.start}ms`,
    '--t-panel-stagger': `${t.panels.stagger}ms`,
    '--t-panel-dur': `${t.panels.duration}ms`,
    '--t-reduced': `${STORM_REDUCED_MS}ms`,
  } as CSSProperties

  return (
    <div
      ref={rootRef}
      className={cn(
        s.root,
        'pointer-events-none fixed inset-0 z-50',
        className,
      )}
      style={vars}
      aria-hidden="true"
      data-reduced={reduced}
    >
      {Array.from({ length: PANELS }, (_, i) => (
        <div
          key={i}
          className={s.panel}
          style={{ '--i': i } as CSSProperties}
        />
      ))}

      <div className={s.stage}>
        <svg
          className={s.poster}
          viewBox={`0 0 ${poster.width} ${poster.height}`}
          preserveAspectRatio="xMidYMid meet"
          focusable="false"
        >
          <g>
            <text ref={name} className={s.label} x={poster.margin} y={73}>
              {LABELS.name}
            </text>
            <text
              ref={year}
              className={s.label}
              x={poster.width - poster.margin}
              y={73}
              textAnchor="end"
            >
              {LABELS.year}
            </text>
            <Rule a={nameEnd} b={yearStart} y={62} mid delay={t.rules.start} />
            <text ref={roleL} className={s.label} x={poster.margin} y={663}>
              {LABELS.roleLeft}
            </text>
            <text
              ref={roleR}
              className={s.label}
              x={poster.width - poster.margin}
              y={663}
              textAnchor="end"
            >
              {LABELS.roleRight}
            </text>
            <Rule
              a={roleLEnd}
              b={roleRStart}
              y={652}
              delay={t.rules.start + t.rules.stagger}
            />
          </g>

          <g className={s.letters}>
            {poster.cells.map((cell, i) => (
              <LetterCell
                key={i}
                cell={cell}
                index={i}
                delay={cellDelay(cell, poster.width)}
              />
            ))}
          </g>

          <svg
            x={charLeft}
            y={605 - 600 * k}
            width={460 * k}
            height={600 * k}
            viewBox="0 0 460 600"
            overflow="hidden"
          >
            <Metronome clipId={`ssp-${uid}-body`} />
          </svg>
        </svg>

        <Corner side="l" />
        <Corner side="r" />
      </div>

      {!stormGone ? (
        <div className={s.storm}>
          {Array.from({ length: STORM_ROWS }, (_, row) => (
            <StormRow
              key={row}
              row={row}
              minSpan={minSpan}
              paper={PALETTE.paper}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
