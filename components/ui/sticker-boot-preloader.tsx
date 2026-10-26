'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import s from './sticker-boot-preloader.module.css'

/* ═══════════════════════════════════════════════════════════════════════════
   Sticker Boot: the landing page's first frame, in the page's own materials.

   A cobalt room. A cream sticker sheet drops onto it: sun, a fat marker
   "hello!", three swatches, and the stickers from the footer slapped around
   the edges. A tangerine line fills along the bottom, then the whole sheet
   peels upward and off, revealing the cream hero underneath.

   The cover the server paints is the bare cobalt room, which is exactly what
   this overlay looks like at t=0. Nothing is duplicated, nothing is cross-
   faded: the card arrives after hydration, and the sheet leaves in one
   physical move.

   No assets. Every shape is drawn in code and every colour comes from the same
   palette as the page and the footer.
   ═══════════════════════════════════════════════════════════════════════════ */

export const STICKER_BOOT_TIMELINE = {
  /** The whole sequence, including the peel. */
  total: 1800,
  /** When the sheet starts to lift. The sheet is already on screen in the
   *  server cover, so it only has to hold for a beat once hydration lands. */
  leave: 950,
  /** Reduced motion: the held sheet, then the page. */
  reduced: 350,
} as const

/** "hello!" in the footer's single-stroke alphabet, laid out once at build time. */
const HELLO_MAIN =
  'M0 -1C3.42 -3 7.56 -12 7.32 -16.4C7.08 -19.8 2.2 -20 2.2 -16.4L2.2 -1L2.2 -5.6C3.17 -8.6 4.88 -10 6.83 -10C8.78 -10 9.52 -8.8 9.52 -7L9.52 -3C9.52 -0.8 10.74 -1 12.2 -1L13.2 -1C17.35 -2.4 22.96 -4.4 22.96 -7.6C22.96 -9.4 21.25 -10.4 19.06 -10.4C15.88 -10.4 14.18 -7.8 14.18 -5C14.18 -1.8 16.37 0 19.3 0C21.5 0 22.96 -1 24.67 -1L25.67 -1C29.08 -3 33.23 -12 32.99 -16.4C32.74 -19.8 27.86 -20 27.86 -16.4L27.86 -3.2C27.86 -0.6 30.55 -1 33.48 -1L34.48 -1C37.89 -3 42.04 -12 41.8 -16.4C41.55 -19.8 36.67 -20 36.67 -16.4L36.67 -3.2C36.67 -0.6 39.36 -1 42.28 -1L43.28 -1C44.99 -1.4 44.99 -9.6 48.53 -10C46.33 -10 44.5 -7.8 44.5 -5C44.5 -2.2 46.33 0 48.53 0C50.73 0 52.56 -2.2 52.56 -5C52.56 -7.8 50.73 -10 48.53 -10C50.6 -10 52.31 -9.2 54.26 -9M57.7 -16L57.7 -4.4'
const HELLO_DOT = 'M57.7 -0.6L57.83 -0.7'
const HELLO_VIEWBOX = '-3.65 -22.25 70.61 24.5'

function SunMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden
      focusable="false"
    >
      <g stroke="var(--sbf-ink)" strokeWidth="4" strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * 74}
              y1={100 + Math.sin(a) * 74}
              x2={100 + Math.cos(a) * 93}
              y2={100 + Math.sin(a) * 93}
            />
          )
        })}
      </g>
      <circle
        cx="100"
        cy="100"
        r="64"
        fill="var(--sbf-butter)"
        stroke="var(--sbf-ink)"
        strokeWidth="4"
      />
      <circle cx="79" cy="94" r="5.5" fill="var(--sbf-ink)" />
      <circle cx="121" cy="94" r="5.5" fill="var(--sbf-ink)" />
      <path
        d="M77 116Q100 139 123 116"
        fill="none"
        stroke="var(--sbf-ink)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse
        cx="65"
        cy="110"
        rx="10"
        ry="6"
        fill="var(--sbf-tangerine)"
        opacity=".55"
      />
      <ellipse
        cx="135"
        cy="110"
        rx="10"
        ry="6"
        fill="var(--sbf-tangerine)"
        opacity=".55"
      />
    </svg>
  )
}

function Smiley({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
      focusable="false"
    >
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="var(--sbf-cobalt)"
        stroke="var(--sbf-paper-hi)"
        strokeWidth="8"
      />
      <ellipse cx="44" cy="50" rx="4.5" ry="8" fill="var(--sbf-paper-hi)" />
      <ellipse cx="76" cy="50" rx="4.5" ry="8" fill="var(--sbf-paper-hi)" />
      <path
        d="M34 68Q60 94 86 68M30 64L38 71M90 64L82 71"
        fill="none"
        stroke="var(--sbf-paper-hi)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Daisy({ className }: { className?: string }) {
  const petals = Array.from({ length: 9 }, (_, i) => (
    <ellipse
      key={i}
      cx="60"
      cy="32"
      rx="13"
      ry="23"
      transform={`rotate(${i * 40} 60 60)`}
    />
  ))
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
      focusable="false"
    >
      <g fill="var(--sbf-butter)" stroke="var(--sbf-paper-hi)" strokeWidth="7">
        {petals}
      </g>
      <circle cx="60" cy="60" r="19" fill="var(--sbf-tangerine)" />
      <circle cx="53.5" cy="57" r="2.6" fill="var(--sbf-ink)" />
      <circle cx="66.5" cy="57" r="2.6" fill="var(--sbf-ink)" />
      <path
        d="M53 65Q60 71 67 65"
        fill="none"
        stroke="var(--sbf-ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Burst({ className }: { className?: string }) {
  const points = 13
  const pts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 ? 39 : 54
    pts.push(`${60 + Math.cos(a) * r} ${60 + Math.sin(a) * r}`)
  }
  return (
    <svg
      viewBox="-4 -4 128 128"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        d={`M${pts.join('L')}Z`}
        fill="var(--sbf-tangerine)"
        stroke="var(--sbf-paper-hi)"
        strokeWidth="7"
      />
      <text
        x="60"
        y="68"
        textAnchor="middle"
        fontFamily="var(--font-syne), sans-serif"
        fontWeight="800"
        fontSize="28"
        fill="var(--sbf-ink)"
        letterSpacing="-1"
      >
        hi!
      </text>
    </svg>
  )
}

function Heart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        d="M60 102C22 78 10 57 18 39C26 21 50 19 60 39C70 19 94 21 102 39C110 57 98 78 60 102Z"
        fill="var(--sbf-pink)"
        stroke="var(--sbf-paper-hi)"
        strokeWidth="8"
      />
      <path
        d="M31 44Q33 31 46 30"
        fill="none"
        stroke="var(--sbf-paper-hi)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Bolt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        d="M70 8L26 66H55L44 112L94 48H64Z"
        fill="var(--sbf-butter)"
        stroke="var(--sbf-paper-hi)"
        strokeWidth="8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BootContents() {
  return (
    <>
      <div className={s.halo} aria-hidden />

      <div className={s.stage}>
        <div className={s.card}>
          <span className={cn(s.tape, s.tapeTop)} aria-hidden />
          <span className={cn(s.tape, s.tapeBottom)} aria-hidden />

          <div className={s.cardTop}>
            <span>Side A · est. 2021</span>
            <span>sound check · 001</span>
          </div>

          <SunMark className={s.sun} />

          <svg
            className={s.hello}
            viewBox={HELLO_VIEWBOX}
            aria-hidden
            focusable="false"
          >
            <g transform="skewX(-9)">
              <path
                className={s.helloMain}
                d={HELLO_MAIN}
                pathLength="1"
                fill="none"
                stroke="var(--sbf-tangerine)"
                strokeWidth="3.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                className={s.helloDot}
                d={HELLO_DOT}
                pathLength="1"
                fill="none"
                stroke="var(--sbf-tangerine)"
                strokeWidth="3.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>

          <p className={s.line}>a design engineer&apos;s side A</p>

          <div className={s.cardFoot}>
            <span>Aditya Himawan</span>
            <span className={s.swatches} aria-hidden>
              <i style={{ background: 'var(--sbf-cobalt)' }} />
              <i style={{ background: 'var(--sbf-tangerine)' }} />
              <i style={{ background: 'var(--sbf-butter)' }} />
              <i style={{ background: 'var(--sbf-pink)' }} />
            </span>
            <span>Jakarta · GMT+7</span>
          </div>

          <span className={cn(s.sticker, s.stickerBurst)}>
            <span className={s.stickerInner}>
              <Burst className="w-full" />
            </span>
          </span>
          <span className={cn(s.sticker, s.stickerSmiley)}>
            <span className={s.stickerInner}>
              <Smiley className="w-full" />
            </span>
          </span>
          <span className={cn(s.sticker, s.stickerDaisy)}>
            <span className={s.stickerInner}>
              <Daisy className="w-full" />
            </span>
          </span>
          <span className={cn(s.sticker, s.stickerHeart)}>
            <span className={s.stickerInner}>
              <Heart className="w-full" />
            </span>
          </span>
          <span className={cn(s.sticker, s.stickerBolt)}>
            <span className={s.stickerInner}>
              <Bolt className="w-full" />
            </span>
          </span>
        </div>

        <div className={s.progress} aria-hidden>
          <span>opening side a</span>
          <span className={s.progressTrack}>
            <span className={s.progressFill} />
          </span>
          <span>2026</span>
        </div>
      </div>
    </>
  )
}

export function StickerBootCover({ className }: { className?: string }) {
  return (
    <div
      className={cn(s.cover, s.groundPaint, className)}
      aria-hidden
      data-boot-cover=""
    >
      <BootContents />
    </div>
  )
}

export type StickerBootPreloaderProps = {
  onComplete?: () => void
  className?: string
}

export default function StickerBootPreloader({
  onComplete,
  className,
}: StickerBootPreloaderProps) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduced) {
      const done = window.setTimeout(
        () => onComplete?.(),
        STICKER_BOOT_TIMELINE.reduced,
      )
      return () => window.clearTimeout(done)
    }

    const peel = window.setTimeout(
      () => setLeaving(true),
      STICKER_BOOT_TIMELINE.leave,
    )
    const done = window.setTimeout(
      () => onComplete?.(),
      STICKER_BOOT_TIMELINE.total,
    )

    return () => {
      window.clearTimeout(peel)
      window.clearTimeout(done)
    }
  }, [onComplete])

  return (
    <div
      className={cn(s.root, className)}
      data-boot-storm=""
      data-leaving={leaving ? 'true' : 'false'}
      aria-hidden
    >
      <div className={cn(s.ground, s.groundPaint)} />
      <BootContents />
    </div>
  )
}
