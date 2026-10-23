'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import { hash } from './preloader-kit'
import { glyphPath, glyphWidth } from './poster-glyphs'
import styles from './signal-storm-preloader.module.css'

const s = styles

/* ═══════════════════════════════════════════════════════════════════════════
   Signal Storm: a boot that ends *in* the hero.

   Studio words (PLAY, REC, LOOP, MIX...) run edge to edge across the hero's own
   dark ground, in its signal orange, its cream and the three lane colours. Then
   the running words are pulled into one line at the hero's name clip, an orange
   band grows out of that line to the clip's exact rectangle, the ground fades,
   and the hero's own letters rise onto the band.

   There is no poster and nothing in the middle: the last thing on screen is the
   first thing in the hero.

   ## How it lands on the title

   The target is not drawn, it is *measured*: the hero marks its name clip with
   `data-hero-name-clip`, and this reads that element's rectangle and corner
   radius at the moment the words begin to merge. The band it grows is the same
   rectangle in the same orange, so when it fades the real clip is underneath it,
   unchanged.

   The letters are the hero's own. While this plays it holds the hero's letter
   animation (`--boot-play: paused` on the document) and releases it once the
   band has landed, with a shorter delay and stagger (`--boot-delay`,
   `--boot-stagger`). So the title is set in the real face at the real size by the
   real CSS, rising out of its masks onto a band that is already there. Nothing
   is cross-faded, because nothing is duplicated.

   ## Guardrails

   - An overlay, never a gate: `pointer-events: none`, `fixed`, `inset-0`,
     `contain: strict`. The page beneath is already rendered and hydrated; this
     removes itself and cannot cost Time to Interactive or shift the layout.
   - No assets: every letter is a path in `poster-glyphs.ts`; the ground is two
     gradients.
   - One schedule: `STORM_TIMELINE` is the whole of it, and a test checks the
     beats are in order and end inside the total.
   - Reduced motion is its own composition: the hero's ground, held, faded. The
     hero's letters do not animate under reduced motion, so there is nothing to
     hold and nothing to release.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Timeline (ms) ──────────────────────────────────────────────────────── */

export const STORM_TIMELINE = {
  /** The whole sequence. The overlay reports completion here. */
  total: 1740,
  /** The words slide in, one row after another, and run. */
  enter: { duration: 360, stagger: 40 },
  /** The rows are pulled into one line at the name clip. Outer rows first. */
  merge: { start: 900, duration: 440, stagger: 30 },
  /** The orange band grows out of that line to the clip's rectangle. */
  fuse: { start: 1000, duration: 400 },
  /** The hero's own letters are released and start to rise. */
  release: { start: 1300 },
  /** The dark ground fades; the hero is under it. */
  ground: { start: 1400, duration: 220 },
  /** The band fades; the real clip is under it. */
  band: { start: 1580, duration: 160 },
} as const

/** The reduced-motion beat: the hero's ground, held, then faded. */
export const STORM_REDUCED_MS = 600

export const STORM_ROWS = 7

/** The custom properties the hero's letter animation reads. */
export const BOOT = {
  play: '--boot-play',
  delay: '--boot-delay',
  stagger: '--boot-stagger',
} as const

/** What they are released to: no wait, and a tighter stagger than the hero's own. */
export const RELEASE = { delay: '0ms', stagger: '28ms' } as const

/** How long the released letters take to finish, with a margin. The variables
 *  must outlive it: changing a running animation's delay moves it. */
export const SETTLE_MS = 2200

/** When the last thing in the timeline finishes. */
export function stormEnd(t: typeof STORM_TIMELINE = STORM_TIMELINE): number {
  const lastRow =
    t.merge.start +
    Math.floor(STORM_ROWS / 2) * t.merge.stagger +
    t.merge.duration
  return Math.max(
    t.enter.duration + (STORM_ROWS - 1) * t.enter.stagger,
    lastRow,
    t.fuse.start + t.fuse.duration,
    t.release.start,
    t.ground.start + t.ground.duration,
    t.band.start + t.band.duration,
  )
}

/* ── Content ────────────────────────────────────────────────────────────── */

/** The hero's own colours (`--deck-ground`, `--deck-ground-ink`, `--deck-orange`
 *  and the three lane colours). A test reads the theme file and checks these are
 *  still the same values. */
export const PALETTE = {
  ground: '#14171a',
  cream: '#eee9df',
  orange: '#ff5a1f',
  green: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
} as const

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
  { color: PALETTE.orange, hollow: false },
  { color: PALETTE.cream, hollow: true },
  { color: PALETTE.green, hollow: false },
  { color: PALETTE.orange, hollow: true },
  { color: PALETTE.blue, hollow: false },
  { color: PALETTE.cream, hollow: true },
  { color: PALETTE.amber, hollow: false },
]

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

/* ── The merge: geometry, no DOM ────────────────────────────────────────── */

export type Band = {
  x: number
  y: number
  w: number
  h: number
  radius: number
}

/** A row is 15% of the overlay's height and the gap between rows 2.2%. */
export const ROW_HEIGHT = 0.15
export const ROW_PITCH = 0.15 + 0.022

/** Where each row's centre sits, in px from the top, before it moves. The rows
 *  are a column centred on the overlay, so this is arithmetic, not a measurement. */
export function rowCenters(
  viewportHeight: number,
  rows: number = STORM_ROWS,
): number[] {
  return Array.from(
    { length: rows },
    (_, i) => viewportHeight * (0.5 + (i - (rows - 1) / 2) * ROW_PITCH),
  )
}

/** How far each row must travel vertically to sit on the band's centre line. */
export function mergeShifts(
  viewportHeight: number,
  band: Band,
  rows: number = STORM_ROWS,
): number[] {
  const target = band.y + band.h / 2
  return rowCenters(viewportHeight, rows).map((c) => target - c)
}

/** Outer rows start first and the middle one last, so the stack closes inward. */
export function mergeDelay(row: number, rows: number, stagger: number): number {
  const middle = (rows - 1) / 2
  return Math.round((middle - Math.abs(row - middle)) * stagger)
}

/** Is the band on screen enough to land on? A page restored scrolled past the
 *  hero has nothing to fuse into. */
export function bandVisible(band: Band, vw: number, vh: number): boolean {
  const x = Math.min(vw, band.x + band.w) - Math.max(0, band.x)
  const y = Math.min(vh, band.y + band.h) - Math.max(0, band.y)
  return x > band.w * 0.6 && y > band.h * 0.6
}

/** Where to land when there is no name clip to find: a centred band. */
export function fallbackBand(vw: number, vh: number): Band {
  const h = Math.round(vh * 0.26)
  return {
    x: Math.round(vw * 0.06),
    y: Math.round((vh - h) / 2),
    w: Math.round(vw * 0.88),
    h,
    radius: 6,
  }
}

/** The hero's name clip as a `Band`, or `null` if it is missing or has no size. */
export function readBand(el: Element | null): Band | null {
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 2 || r.height < 2) return null
  const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
  return { x: r.left, y: r.top, w: r.width, h: r.height, radius }
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

const reducedNow = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function StormRow({ row, minSpan }: { row: number; minSpan: number }) {
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
                {tone.hollow && (
                  <path d={d} stroke={PALETTE.ground} strokeWidth={5} />
                )}
              </g>
            )
          }),
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
  const [reduced] = useState(reducedNow)
  const [done, setDone] = useState(false)
  const [compact, setCompact] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const groundRef = useRef<HTMLDivElement | null>(null)
  const stormRef = useRef<HTMLDivElement | null>(null)
  const fuseRef = useRef<HTMLDivElement | null>(null)
  const complete = useRef(onComplete)

  useEffect(() => {
    complete.current = onComplete
  })

  // A tall container gets a shorter storm, so it is not wider than it needs to be.
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
    const t = STORM_TIMELINE
    const html = document.documentElement
    const timers: number[] = []
    const animations: Animation[] = []
    let released = false
    let clearing = false

    // Give the hero its own timing back. Once released, its letters are
    // mid-rise, and taking the variables away then would change their delay and
    // snap them back, so this waits for the rise to finish. If the release never
    // happened it is immediate. It is idempotent, and it runs when the sequence
    // ends *and* on unmount, so a parent that keeps this mounted after it has
    // finished (it renders nothing by then) does not leak the variables.
    const restoreHero = () => {
      if (clearing || reduced) return
      clearing = true
      const clear = () => {
        html.style.removeProperty(BOOT.play)
        html.style.removeProperty(BOOT.delay)
        html.style.removeProperty(BOOT.stagger)
      }
      if (released) window.setTimeout(clear, SETTLE_MS)
      else clear()
    }

    timers.push(
      window.setTimeout(
        () => {
          setDone(true)
          restoreHero()
          complete.current?.()
        },
        reduced ? STORM_REDUCED_MS : t.total,
      ),
    )

    if (!reduced) {
      // Hold the hero's letters until the band has landed.
      html.style.setProperty(BOOT.play, 'paused')

      timers.push(
        window.setTimeout(() => {
          const vw = window.innerWidth
          const vh = window.innerHeight
          const found = readBand(
            document.querySelector('[data-hero-name-clip]'),
          )
          const band =
            found && bandVisible(found, vw, vh) ? found : fallbackBand(vw, vh)
          const ground = groundRef.current
          const storm = stormRef.current
          const fuse = fuseRef.current
          // No Web Animations (very old browsers, test DOMs): the boot still
          // ends on time; only the merge itself is skipped.
          if (!ground || !storm || !fuse || typeof fuse.animate !== 'function')
            return

          const run = (
            el: Element,
            keyframes: Keyframe[],
            options: KeyframeAnimationOptions,
          ) => {
            animations.push(
              el.animate(keyframes, { fill: 'forwards', ...options }),
            )
          }

          // 1. The storm straightens and its rows are pulled onto the band's line.
          run(
            storm,
            [{ transform: 'rotate(-7deg)' }, { transform: 'rotate(0deg)' }],
            {
              duration: t.merge.duration,
              easing: 'cubic-bezier(0.7, 0, 0.2, 1)',
            },
          )
          const shifts = mergeShifts(vh, band)
          Array.from(storm.children).forEach((row, i) => {
            const squash = `translate3d(0, ${shifts[i] ?? 0}px, 0) scaleY(0.06)`
            run(
              row,
              [
                { transform: 'translate3d(0, 0, 0) scaleY(1)', opacity: 1 },
                { transform: squash, opacity: 1, offset: 0.62 },
                { transform: squash, opacity: 0 },
              ],
              {
                duration: t.merge.duration,
                delay: mergeDelay(i, STORM_ROWS, t.merge.stagger),
                easing: 'cubic-bezier(0.7, 0, 0.2, 1)',
              },
            )
          })

          // 2. The band grows out of that line, to the clip's exact rectangle.
          Object.assign(fuse.style, {
            left: `${band.x}px`,
            top: `${band.y}px`,
            width: `${band.w}px`,
            height: `${band.h}px`,
            borderRadius: `${band.radius}px`,
          })
          run(
            fuse,
            [
              { clipPath: 'inset(50% 0px 50% 0px)', opacity: 1 },
              { clipPath: 'inset(0px 0px 0px 0px)', opacity: 1 },
            ],
            {
              duration: t.fuse.duration,
              delay: t.fuse.start - t.merge.start,
              easing: 'cubic-bezier(0.7, 0, 0.2, 1)',
            },
          )

          // 3. The ground fades, then the band: the hero is under both.
          run(ground, [{ opacity: 1 }, { opacity: 0 }], {
            duration: t.ground.duration,
            delay: t.ground.start - t.merge.start,
            easing: 'ease-out',
          })
          run(fuse, [{ opacity: 1 }, { opacity: 0 }], {
            duration: t.band.duration,
            delay: t.band.start - t.merge.start,
            easing: 'ease-out',
          })
        }, t.merge.start),
      )

      // Release the hero's letters onto the band.
      timers.push(
        window.setTimeout(() => {
          released = true
          html.style.setProperty(BOOT.delay, RELEASE.delay)
          html.style.setProperty(BOOT.stagger, RELEASE.stagger)
          html.style.setProperty(BOOT.play, 'running')
        }, t.release.start),
      )
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      animations.forEach((a) => a.cancel())
      restoreHero()
    }
  }, [reduced])

  if (done) return null

  const vars = {
    contain: 'strict',
    '--t-enter': `${STORM_TIMELINE.enter.duration}ms`,
    '--t-enter-stagger': `${STORM_TIMELINE.enter.stagger}ms`,
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
      <div ref={groundRef} className={s.ground} />
      {reduced ? null : (
        <div ref={stormRef} className={s.storm}>
          {Array.from({ length: STORM_ROWS }, (_, row) => (
            <StormRow key={row} row={row} minSpan={compact ? 2200 : 2600} />
          ))}
        </div>
      )}
      <div ref={fuseRef} className={s.fuse} />
    </div>
  )
}
