'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'

import { createPadAudio } from './pad-voices'
import { CONTACT_PAD_COLORS } from '../../../constants'
import styles from './pad-sea.module.css'

import type { Mutable } from './pad-field'

/**
 * The pad sea's front door.
 *
 * It owns the three decisions the scene must not make for itself:
 *
 *  1. **Whether to run at all.** `prefers-reduced-motion` gets the static pad
 *     frame and never downloads three.js; so do WebGL-less and data-saver
 *     clients. The fallback is server-rendered, so the very first paint is the
 *     composed static frame rather than an empty hole.
 *  2. **Where the scroll bridge lands.** One `progress` ref, written by the
 *     ScrollTrigger in `use-hero-motion` and read inside `useFrame`. No React
 *     state on the scroll path, so scrubbing never re-renders the tree.
 *  3. **When to stop drawing.** Off-screen flips the Canvas to `frameloop:
 *     "never"` without unmounting it.
 */

/**
 * The static frame is an SVG pattern, and the transform that puts it in
 * perspective is derived from the 3D camera rather than eyeballed.
 *
 * A camera pitched `p` below horizontal looks at a ground plane; CSS
 * `rotateX(θ)` measures the plane's tilt from the screen, and the two are
 * complements, so `θ = 90° - p`. Its perspective distance is the camera's focal
 * length in pixels, `f = (H/2) / tan(fov/2)`, and the plane's pixels-per-world-
 * unit is `u = f / D`, where `D` is the camera's depth to the point it looks at
 * on the ground. Those three values reproduce the camera's projection exactly.
 *
 * The pattern is authored in viewBox units at 100 per world unit, so the same
 * tile serves both rigs: only the plane's CSS size changes, and expressing that
 * size in `vh` makes `u` — and therefore the pad size and the perspective —
 * track the viewport height the way `f` does.
 *
 *   desktop  y 5.6  z 8.8  lookZ 0.6  fov 40 -> p 34.3°,  D 9.9302,  u 13.834vh
 *   portrait  y 7.455 z 9.152 lookZ 0.6 fov 60 -> p 41.1°, D 11.402,  u 7.596vh
 *
 * The plane's near edge is just short of the camera and its far edge is past
 * where fog takes over, so the visible frame is always inside it.
 */

const PadSeaCanvas = dynamic(() => import('./pad-sea-canvas'), { ssr: false })

/** 100 viewBox units per world unit, so one tile size fits both rigs. */
const FB_UNIT = 100
/** The Contact key is 0.86 of its 1.0 pitch. */
const FB_PAD = 0.86 * FB_UNIT
const FB_GAP = 0.14 * FB_UNIT
/** 4 x 4, which is the whole sixteen-key bank in one tile. */
const FB_COLS = 4

const BOOT_COLOR = '#ff6a2a'
const PAD_BASE = '#242a26'
const PIP_BASE = '#4a4f52'

/** sRGB mix of two hex colours. Only used to bake the pattern's fills. */
function mixHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const value = Number.parseInt(hex.slice(1), 16)
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  }
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  const channel = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, '0')
  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`
}

/** The Contact bank held back toward the deck's base, as the 3D pads are. */
const FB_BANK = CONTACT_PAD_COLORS.map((hex) => ({
  body: mixHex(PAD_BASE, hex, 0.46),
  full: hex,
  pip: mixHex(PIP_BASE, hex, 0.55),
}))

/** The same sixteen slots, all in the boot colour. */
const FB_BOOT = CONTACT_PAD_COLORS.map(() => ({
  body: mixHex(PAD_BASE, BOOT_COLOR, 0.28),
  full: BOOT_COLOR,
  pip: mixHex(PIP_BASE, BOOT_COLOR, 0.4),
}))

function PadPattern({
  id,
  cells,
}: {
  id: string
  cells: readonly { body: string; full: string; pip: string }[]
}) {
  const pitch = FB_PAD + FB_GAP
  const tile = pitch * FB_COLS

  return (
    <pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse">
      {cells.map((cell, index) => {
        const x = (index % FB_COLS) * pitch
        const y = Math.floor(index / FB_COLS) * pitch
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={FB_PAD}
              height={FB_PAD}
              rx={FB_PAD * 0.08}
              fill={cell.body}
            />
            {/* the white gloss rake, top-left, as the key has it */}
            <rect
              x={x}
              y={y}
              width={FB_PAD}
              height={FB_PAD}
              rx={FB_PAD * 0.08}
              fill="url(#padsea-gloss)"
            />
            {/* the coloured lip across the bottom */}
            <rect
              x={x + FB_PAD * 0.07}
              y={y + FB_PAD * 0.87}
              width={FB_PAD * 0.86}
              height={FB_PAD * 0.075}
              rx={FB_PAD * 0.038}
              fill={cell.full}
            />
            {/* the pip, top-right */}
            <circle
              cx={x + FB_PAD * 0.81}
              cy={y + FB_PAD * 0.14}
              r={FB_PAD * 0.055}
              fill={cell.pip}
            />
          </g>
        )
      })}
    </pattern>
  )
}

/** The boot colour under, the bank over it, filling whatever viewBox holds it. */
function PadFieldFill() {
  return (
    <>
      <rect width="100%" height="100%" fill="url(#padsea-boot)" />
      <rect
        className="padsea-bank-fill"
        width="100%"
        height="100%"
        fill="url(#padsea-bank)"
      />
    </>
  )
}

export type PadSeaProps = {
  progress: Mutable<number>
  energy: Mutable<number>
  onPadHit?: (index: number) => void
}

type Runtime = 'pending' | 'on' | 'off'

export function PadSea({ progress, energy, onPadHit }: PadSeaProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [runtime, setRuntime] = useState<Runtime>('pending')
  const [compact, setCompact] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 768px)').matches,
  )
  const [inView, setInView] = useState(true)
  const [ready, setReady] = useState(false)

  const audio = useMemo(() => createPadAudio(), [])

  useEffect(() => () => audio.dispose(), [audio])

  /* Should we boot the canvas at all?
   *
   * This is a one-shot capability probe, not state that can be derived during
   * render: the server has no `matchMedia`, no WebGL and no `navigator`, and
   * `runtime` is the gate that decides whether three.js is fetched at all — so
   * it has to start at `pending` on both sides to keep hydration honest. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot client capability probe; see above
    setRuntime(decideRuntime())
  }, [])

  /* `compact` never reaches the server-rendered markup (the canvas layer only
     exists once `runtime` turns on), so it can be seeded straight from the
     media query instead of costing an effect. */
  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)')
    const sync = () => setCompact(query.matches)
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  /* Pause while the hero is off-screen. */
  useEffect(() => {
    const host = hostRef.current
    if (!host || runtime !== 'on') return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '10% 0px' },
    )
    observer.observe(host)
    return () => observer.disconnect()
  }, [runtime])

  return (
    <div
      ref={hostRef}
      className={styles.padSea}
      data-runtime={runtime}
      aria-hidden="true"
    >
      {/* Server-rendered, so the first paint is already the pad frame. Stays
          put for reduced motion, WebGL failure and data-saver clients. */}
      <div
        className={styles.fallback}
        data-handed-over={ready ? 'true' : undefined}
      >
        <svg className={styles.fallbackDefs} aria-hidden="true">
          <defs>
            <radialGradient id="padsea-gloss" cx="18%" cy="5%" r="120%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="46%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <PadPattern id="padsea-boot" cells={FB_BOOT} />
            <PadPattern id="padsea-bank" cells={FB_BANK} />
          </defs>
        </svg>
        {/* Two planes, one per rig: the portrait camera sees much further down
            the field, so it needs a taller viewBox. The pattern is shared. */}
        <svg
          className={styles.fallbackFieldWide}
          viewBox="0 0 3000 2200"
          aria-hidden="true"
        >
          <PadFieldFill />
        </svg>
        <svg
          className={styles.fallbackFieldNarrow}
          viewBox="0 0 2400 3800"
          aria-hidden="true"
        >
          <PadFieldFill />
        </svg>
        <span className={styles.fallbackScrim} />
      </div>

      {runtime === 'on' && (
        <div
          className={styles.canvasLayer}
          data-ready={ready ? 'true' : undefined}
        >
          <PadSeaCanvas
            progress={progress}
            energy={energy}
            compact={compact}
            active={inView}
            audio={audio}
            onPadHit={onPadHit}
            onReady={() => setReady(true)}
          />
        </div>
      )}
    </div>
  )
}

function decideRuntime(): Runtime {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return 'off'

  const connection = (
    navigator as unknown as { connection?: { saveData?: boolean } }
  ).connection
  if (connection?.saveData) return 'off'

  return supportsWebGL() ? 'on' : 'off'
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')
    return context !== null
  } catch {
    return false
  }
}
