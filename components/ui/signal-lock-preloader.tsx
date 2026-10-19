'use client'

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import { hash, scrambleAt, useScramble } from './preloader-kit'
import styles from './signal-lock-preloader.module.css'

// The helpers moved to `preloader-kit` so the other preloader can share them;
// they are re-exported so nothing that imported them from here breaks.
export { hash, scrambleAt, useScramble }

const s = styles

/* ═══════════════════════════════════════════════════════════════════════════
   Signal Lock: a 1.4s studio preloader.

   A playhead sweeps three track lanes; as it crosses the middle the name is
   decoded out of vertical reels of monoline glyphs while two rulers draw in and
   a timecode decodes to LOCKED; then the lanes shutter open onto the live page.

   ## Why it is built like this

   - **An overlay, never a gate.** The page underneath is already rendered,
     hydrated and measured; this sits over it, `pointer-events: none`, and goes
     away. Nothing waits on it, so it cannot cost Time to Interactive, and the
     page it reveals is the same page a repeat visitor gets.
   - **No layout, so no layout shift.** The container is `fixed`, `inset-0`,
     `contain: strict`; everything inside moves by transform, opacity or clip.
   - **No assets.** The name is drawn from path data in this file (a ten-letter
     monoline alphabet), the lanes and clips are boxes, the rulers are paths. The
     only text is a timecode and three lane labels, set in the platform's own
     monospace, so there is no font to wait for.
   - **Timing has one source.** Every duration and delay below is in `TIMELINE`,
     is handed to the stylesheet as a custom property, and is checked by a test
     to end inside the total. Nothing in the CSS carries a number of its own.
   - **Reduced motion is its own composition**, not a faster one: the poster is
     shown already resolved, held for a beat, and faded.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Timeline (ms) ──────────────────────────────────────────────────────── */

export const TIMELINE = {
  /** The whole sequence. The overlay reports completion here. */
  total: 1400,
  /** Stage 1: the playhead crosses the screen, lighting the lanes behind it. */
  sweep: { start: 0, duration: 600 },
  /** Stage 2: the reels. A letter starts as the playhead passes it. */
  reel: { start: 150, spread: 400, duration: 400 },
  /** The rulers draw in, in step with the reels. */
  rules: { start: 150, duration: 600 },
  /** The timecode decodes while the name does. */
  scramble: { start: 150, end: 950 },
  /** The registration bar under the name: three lane-coloured strokes. */
  bar: { start: 480, stagger: 90, duration: 300 },
  /** The three LOCKED lamps, one after another, as the decode lands. */
  lock: { start: 920, stagger: 40, duration: 160 },
  /** Stage 3: the poster thumps, then the lanes open. */
  thump: { start: 1000, duration: 140 },
  leave: { start: 1000, duration: 160 },
  shutter: { start: 1000, stagger: 50, duration: 300 },
} as const

/** The reduced-motion beat: the resolved poster, held, then faded. */
export const REDUCED_MS = 650

/** When the last thing in the timeline finishes. */
export function timelineEnd(t: typeof TIMELINE = TIMELINE): number {
  const lanes = LANES.length
  const lastReel = t.reel.start + t.reel.spread + t.reel.duration
  return Math.max(
    t.sweep.start + t.sweep.duration,
    lastReel,
    t.rules.start + t.rules.duration,
    t.bar.start + (lanes - 1) * t.bar.stagger + t.bar.duration,
    t.scramble.end,
    t.lock.start + (lanes - 1) * t.lock.stagger + t.lock.duration,
    t.thump.start + t.thump.duration,
    t.leave.start + t.leave.duration,
    t.shutter.start + (lanes - 1) * t.shutter.stagger + t.shutter.duration,
  )
}

/* ── Content ────────────────────────────────────────────────────────────── */

export const PALETTE = {
  paper: '#EAE6DF',
  ink: '#141414',
} as const

export const LANES = [
  {
    label: '01 // SCOPE',
    color: '#10B981',
    clips: [
      [4, 38],
      [44, 71],
      [76, 96],
    ],
  },
  {
    label: '02 // PROCESS',
    color: '#3B82F6',
    clips: [
      [10, 29],
      [33, 66],
      [72, 93],
    ],
  },
  {
    label: '03 // PRACTICAL',
    color: '#F59E0B',
    clips: [
      [2, 23],
      [28, 52],
      [58, 88],
    ],
  },
] as const

export const NAME_LINES = ['ADITYA', 'HIMAONE'] as const

/** What the timecode decodes to. */
export const TIMECODE = '00:00:00 -> 00:01:20 // LOCKED'

/* ── The glyphs ─────────────────────────────────────────────────────────────
   A monoline alphabet for exactly the letters in the name, in a 10 x 14 cell.
   Strokes only (no fills), so one path per letter and one stroke width for the
   whole word; round caps and joins do the rest. */

export const CELL_W = 10
export const CELL_H = 14
const GAP = 4
export const ADVANCE = CELL_W + GAP
export const LINE_PITCH = CELL_H + 10
/** The vertical spacing of glyphs on a reel. A little more than a cell, so a
 *  rolling reel shows daylight between letters rather than a stack. */
export const REEL_PITCH = CELL_H + 4
export const REEL_DECOYS = 5

export const GLYPHS: Record<string, string> = {
  A: 'M0 14 L5 0 L10 14 M2 9.5 H8',
  D: 'M0 0 V14 H3.5 C8.5 14 10 10.5 10 7 C10 3.5 8.5 0 3.5 0 Z',
  E: 'M10 0 H0 V14 H10 M0 7 H8',
  H: 'M0 0 V14 M10 0 V14 M0 7 H10',
  I: 'M2 0 H8 M5 0 V14 M2 14 H8',
  M: 'M0 14 V0 L5 8 L10 0 V14',
  N: 'M0 14 V0 L10 14 V0',
  O: 'M5 0 C1.5 0 0 3.5 0 7 C0 10.5 1.5 14 5 14 C8.5 14 10 10.5 10 7 C10 3.5 8.5 0 5 0 Z',
  T: 'M0 0 H10 M5 0 V14',
  Y: 'M0 0 L5 7 L10 0 M5 7 V14',
}

const ALPHABET = Object.keys(GLYPHS)

export type Cell = {
  ch: string
  line: number
  col: number
  x: number
  y: number
  /** When this letter's reel starts, in ms from mount. */
  delay: number
}

/**
 * Where every letter sits and when its reel starts.
 *
 * Lines are centred on each other, and a letter's delay is its horizontal
 * position along the name, so the reels fire left to right at the pace of the
 * playhead: the letters snap as it passes over them rather than on a metronome.
 */
export function layoutName(
  lines: readonly string[] = NAME_LINES,
  t: typeof TIMELINE = TIMELINE,
) {
  const widths = lines.map((l) => l.length * ADVANCE - GAP)
  const width = Math.max(...widths)
  const cells: Cell[] = []
  lines.forEach((text, line) => {
    const offset = (width - widths[line]) / 2
    Array.from(text).forEach((ch, col) => {
      const x = offset + col * ADVANCE
      const along = (x + CELL_W / 2) / width
      cells.push({
        ch,
        line,
        col,
        x,
        y: line * LINE_PITCH,
        delay: Math.round(t.reel.start + along * t.reel.spread),
      })
    })
  })
  const height = (lines.length - 1) * LINE_PITCH + CELL_H
  return { cells, width, height }
}

/** The glyphs a reel rolls through before it lands: decoys, never the final
 *  letter and never the same one twice running, then the final letter. */
export function reelStrip(
  ch: string,
  index: number,
  decoys: number = REEL_DECOYS,
): string[] {
  const out: string[] = []
  let previous = ch
  for (let j = 0; j < decoys; j += 1) {
    let pick = ALPHABET[hash(index, j, ch.charCodeAt(0)) % ALPHABET.length]
    for (
      let guard = 0;
      pick === previous && guard < ALPHABET.length;
      guard += 1
    ) {
      pick = ALPHABET[(ALPHABET.indexOf(pick) + 1) % ALPHABET.length]
    }
    out.push(pick)
    previous = pick
  }
  // The decoy next to the final letter must differ from it, or the last roll
  // would be a letter rolling into itself.
  if (out[out.length - 1] === ch) {
    const at = ALPHABET.indexOf(ch)
    out[out.length - 1] = ALPHABET[(at + 1) % ALPHABET.length]
  }
  return [...out, ch]
}

/* ── The rulers ─────────────────────────────────────────────────────────────
   A baseline and a row of ticks, in a 1000-wide box that is stretched to the
   viewport. Major ticks every 100 units, minor every 10. */

export const RULE_W = 1000
export const RULE_H = 24

/** The baseline's `d`: along the screen-side edge of the ruler. */
export function ruleLine(edge: 'top' | 'bottom'): string {
  const y = edge === 'top' ? RULE_H - 2 : 2
  return `M0 ${y} H${RULE_W}`
}

/** The ticks' `d`: grow away from the baseline, inward to the page. */
export function ruleTicks(edge: 'top' | 'bottom'): string {
  const base = edge === 'top' ? RULE_H - 2 : 2
  const sign = edge === 'top' ? -1 : 1
  const parts: string[] = []
  for (let x = 0; x <= RULE_W; x += 10) {
    const major = x % 100 === 0
    parts.push(`M${x} ${base} V${base + sign * (major ? 14 : 6)}`)
  }
  return parts.join(' ')
}

/* ── The component ──────────────────────────────────────────────────────── */

const reducedNow = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * One ruler: a baseline and a row of ticks, both drawn left to right by the same
 * technique. The baseline is a path with `pathLength` 1, so its dash is
 * independent of how wide the screen stretches it; the ticks are revealed
 * through a mask whose own stroke is drawn the same way, so they cannot get
 * ahead of or behind the line they stand on.
 */
function Rule({ edge, uid }: { edge: 'top' | 'bottom'; uid: string }) {
  const maskId = `slp-rule-${edge}-${uid}`
  return (
    <svg
      className={cn(s.rule, edge === 'top' ? s.ruleTop : s.ruleBottom)}
      viewBox={`0 0 ${RULE_W} ${RULE_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={RULE_W}
          height={RULE_H}
        >
          <path
            className={s.ruleMask}
            pathLength={1}
            d={`M0 ${RULE_H / 2} H${RULE_W}`}
          />
        </mask>
      </defs>
      <path className={s.ruleLine} pathLength={1} d={ruleLine(edge)} />
      <path
        className={s.ruleTicks}
        d={ruleTicks(edge)}
        mask={`url(#${maskId})`}
      />
    </svg>
  )
}

export type SignalLockPreloaderProps = {
  /** Called once, when the sequence ends (the overlay then removes itself). */
  onComplete?: () => void
  /** Merged over the container's classes, e.g. a higher `z-*` than the default. */
  className?: string
}

/**
 * The preloader. Render it over the page and let it end: it removes itself, and
 * calls `onComplete` so a parent that mounted it can stop rendering it too.
 */
export default function SignalLockPreloader({
  onComplete,
  className,
}: SignalLockPreloaderProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const clipId = `slp-cell-${uid}`
  const [reduced] = useState(reducedNow)
  const [done, setDone] = useState(false)
  const timecode = useRef<HTMLSpanElement | null>(null)
  const complete = useRef(onComplete)

  useEffect(() => {
    complete.current = onComplete
  })

  useScramble(timecode, TIMECODE, { ...TIMELINE.scramble, enabled: !reduced })

  useEffect(() => {
    const id = window.setTimeout(
      () => {
        setDone(true)
        complete.current?.()
      },
      reduced ? REDUCED_MS : TIMELINE.total,
    )
    return () => window.clearTimeout(id)
  }, [reduced])

  const name = layoutName()
  const pad = 3

  if (done) return null

  const t = TIMELINE
  const vars = {
    contain: 'strict',
    '--paper': PALETTE.paper,
    '--ink': PALETTE.ink,
    '--t-sweep': `${t.sweep.duration}ms`,
    '--t-reel-dur': `${t.reel.duration}ms`,
    '--t-rules-start': `${t.rules.start}ms`,
    '--t-rules-dur': `${t.rules.duration}ms`,
    '--t-bar-start': `${t.bar.start}ms`,
    '--t-bar-stagger': `${t.bar.stagger}ms`,
    '--t-bar-dur': `${t.bar.duration}ms`,
    '--t-lock-start': `${t.lock.start}ms`,
    '--t-lock-stagger': `${t.lock.stagger}ms`,
    '--t-lock-dur': `${t.lock.duration}ms`,
    '--t-thump-start': `${t.thump.start}ms`,
    '--t-thump-dur': `${t.thump.duration}ms`,
    '--t-leave-start': `${t.leave.start}ms`,
    '--t-leave-dur': `${t.leave.duration}ms`,
    '--t-shutter-start': `${t.shutter.start}ms`,
    '--t-shutter-stagger': `${t.shutter.stagger}ms`,
    '--t-shutter-dur': `${t.shutter.duration}ms`,
    '--t-reduced': `${REDUCED_MS}ms`,
  } as CSSProperties

  return (
    <div
      className={cn(
        s.root,
        'pointer-events-none fixed inset-0 z-50',
        className,
      )}
      style={vars}
      aria-hidden="true"
      data-reduced={reduced}
    >
      <div className={s.poster}>
        {LANES.map((lane, i) => {
          const clips = lane.clips.map(([from, to]) => (
            <i
              key={from}
              className={s.clip}
              style={{ left: `${from}%`, width: `${to - from}%` }}
            />
          ))
          return (
            <div
              key={lane.label}
              className={s.lane}
              style={{ '--i': i, '--c': lane.color } as CSSProperties}
            >
              <div className={s.laneBase}>{clips}</div>
              <div className={s.laneLit}>{clips}</div>
              <span className={s.label}>{lane.label}</span>
            </div>
          )
        })}

        <Rule edge="top" uid={uid} />
        <Rule edge="bottom" uid={uid} />

        <div className={s.stage}>
          <svg
            className={s.title}
            viewBox={`${-pad} ${-pad} ${name.width + pad * 2} ${name.height + 24 + pad * 2}`}
            focusable="false"
          >
            <defs>
              {/* One clip for every cell: a clip is read in the user space of the
                  element that references it, translation included, so the same
                  rectangle windows each translated cell. */}
              <clipPath id={clipId}>
                <rect x="-2" y="-2" width={CELL_W + 4} height={CELL_H + 4} />
              </clipPath>
            </defs>

            {name.cells.map((cell, index) => {
              const strip = reelStrip(cell.ch, index)
              const decoys = strip.length - 1
              return (
                <g
                  key={`${cell.line}-${cell.col}`}
                  transform={`translate(${cell.x} ${cell.y})`}
                  clipPath={`url(#${clipId})`}
                >
                  <g
                    className={s.reel}
                    style={
                      {
                        '--dist': `${decoys * REEL_PITCH}px`,
                        '--delay': `${cell.delay}ms`,
                      } as CSSProperties
                    }
                  >
                    {strip.map((key, j) => (
                      <path
                        key={j}
                        d={GLYPHS[key]}
                        transform={`translate(0 ${-(decoys - j) * REEL_PITCH})`}
                      />
                    ))}
                  </g>
                </g>
              )
            })}

            {/* Registration bar: the three lanes' colours, drawn left to right. */}
            {LANES.map((lane, i) => {
              const seg = name.width / LANES.length
              const y = name.height + 12
              return (
                <path
                  key={lane.label}
                  className={s.bar}
                  pathLength={1}
                  d={`M${i * seg + 1} ${y} H${(i + 1) * seg - 1}`}
                  stroke={lane.color}
                  style={{ '--i': i } as CSSProperties}
                />
              )
            })}
          </svg>

          <p className={s.timecode}>
            <span ref={timecode}>{scrambleAt(TIMECODE, 0, 0)}</span>
          </p>
          <span className={s.leds}>
            {LANES.map((lane, i) => (
              <i
                key={lane.label}
                style={{ '--c': lane.color, '--i': i } as CSSProperties}
              />
            ))}
          </span>
        </div>

        <div className={s.playhead}>
          <i />
        </div>
      </div>
    </div>
  )
}
