import type { ReactNode } from 'react'

import styles from './riddim-hero.module.css'

const round = (n: number) => Math.round(n * 100) / 100

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

export function Glyph({ id }: { id: string }) {
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
export function SevenSeg({
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
