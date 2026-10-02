'use client'

import { useId } from 'react'
import Image from 'next/image'
import { hashSeed } from '@/lib/waveform-data'

/**
 * Generated artwork, used when a project or post ships no image.
 *
 * Most items have no artwork — only a few of the featured projects have an
 * image and blog `cover` is optional — so this is what gives the site one
 * consistent catalogue at zero image weight. It is seeded by slug, so it is
 * stable across builds.
 *
 * It is drawn to sit beside real cover art rather than announce itself as a
 * placeholder. The previous version was a flat two-stop gradient with a few
 * concentric rings and two large initials, and sitting next to Switchyard's
 * illustrated sleeve it read as a broken image: same box, different language.
 * What the real covers share is a deep saturated field, one luminous subject
 * floating in it, and a small-caps wordmark along the bottom — so this draws
 * those three things.
 */

/** Deep, saturated fields. Kept dark so the glowing subject carries the frame. */
const FIELDS: Array<{ from: string; to: string; glow: string }> = [
  { from: '#0a1a3a', to: '#04102a', glow: '#5cc8ff' },
  { from: '#1a0a2e', to: '#0a0418', glow: '#c07bff' },
  { from: '#0a2418', to: '#04140c', glow: '#4ce0a8' },
  { from: '#2a0f10', to: '#140506', glow: '#ff7a5c' },
  { from: '#0a1f28', to: '#04121a', glow: '#54e0d8' },
  { from: '#23140a', to: '#120a04', glow: '#ffb45c' },
]

function initials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

interface CoverProps {
  /** Slug. Seeds the generator, so the same item always draws the same art. */
  seed: string
  title: string
  catalog?: string
  src?: string
  sizes: string
  priority?: boolean
  className?: string
}

/**
 * The 1:1 unit used everywhere in the booth.
 *
 * Most items have no artwork — only one of five featured projects ships an
 * image and blog `cover` is optional — so the generated fallback is what
 * gives the site one consistent album-art language at zero image weight.
 * It is seeded by slug, so it is stable across builds.
 */
export function Cover({
  seed,
  title,
  catalog,
  src,
  sizes,
  priority,
  className,
}: CoverProps) {
  const uid = useId().replace(/:/g, '')
  const h = hashSeed(seed)
  const field = FIELDS[h % FIELDS.length]

  /* One luminous subject per cover: a ringed orbit, a coil, or a stack — all
     seeded, so a given slug always draws the same figure. */
  const figure = h % 3
  const spin = (h % 7) * 9
  const halo = 58 + (h % 14)

  return (
    <div
      className={className}
      /* A definite width matters here: `aspect-ratio` alone resolves against
         whatever the content measures, so a cover whose image has not loaded
         yet collapses to zero and then snaps to full size — which is what made
         the sleeve art drop below the record on a fresh page load. `width:
         100%` plus the parent's padding gives a stable square either way.

         `height: 100%` is the other half, and it is what keeps the generated
         art the same size as real artwork. An `<img fill>` covers the box
         absolutely, but an inline `<svg viewBox>` has an intrinsic aspect
         ratio and no intrinsic height, so where the parent's height is set in
         percentage terms the SVG won and sized itself to its own `max-width` —
         300px where every photograph rendered at 220px. The two covers in the
         library were visibly different sizes for that reason alone. */
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={`${title} cover`}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <svg
          viewBox="0 0 200 200"
          role="img"
          aria-label={`${title} cover`}
          /* `preserveAspectRatio` left alone on purpose — the default
             `xMidYMid meet` centres the drawing if the box is ever not square,
             rather than cropping it the way the photographs are cropped by
             `object-fit: cover`. */
          width="100%"
          height="100%"
          style={{ display: 'block' }}
        >
          <defs>
            {/* The deep field. Radial, so the light sits behind the subject
                rather than being laid over the top of it. */}
            <radialGradient id={`f-${uid}`} cx="50%" cy="42%" r="78%">
              <stop offset="0" stopColor={field.from} />
              <stop offset="1" stopColor={field.to} />
            </radialGradient>
            {/* The subject's own falloff — this is what makes it read as lit
                rather than as a flat shape sitting on a flat ground. */}
            <radialGradient id={`g-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor={field.glow} stopOpacity="0.95" />
              <stop offset="0.55" stopColor={field.glow} stopOpacity="0.28" />
              <stop offset="1" stopColor={field.glow} stopOpacity="0" />
            </radialGradient>
            <filter
              id={`b-${uid}`}
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          <rect width="200" height="200" fill={`url(#f-${uid})`} />

          {/* The glow the subject sits in, blurred and wide. */}
          <circle
            cx="100"
            cy="86"
            r={halo}
            fill={`url(#g-${uid})`}
            filter={`url(#b-${uid})`}
          />

          {figure === 0 && (
            /* Orbit: concentric rings around a lit core, like the seal on the
               illustrated covers. */
            <g transform={`rotate(${spin} 100 86)`}>
              {[26, 42, 58].map((r) => (
                <circle
                  key={r}
                  cx="100"
                  cy="86"
                  r={r}
                  fill="none"
                  stroke={field.glow}
                  strokeOpacity={0.34 - r * 0.002}
                  strokeWidth="1.1"
                />
              ))}
              <circle
                cx="100"
                cy="86"
                r="15"
                fill={field.glow}
                fillOpacity="0.9"
              />
              <circle cx="100" cy="86" r="7" fill="#fff" fillOpacity="0.85" />
            </g>
          )}

          {figure === 1 && (
            /* Coil: a stack of arcs reading as a spool or a signal. */
            <g transform={`rotate(${spin - 45} 100 86)`}>
              {Array.from({ length: 6 }, (_, i) => (
                <ellipse
                  key={i}
                  cx="100"
                  cy={62 + i * 9}
                  rx={52 - i * 4}
                  ry="7"
                  fill="none"
                  stroke={field.glow}
                  strokeOpacity={0.5 - i * 0.06}
                  strokeWidth="1.4"
                />
              ))}
              <circle
                cx="100"
                cy="86"
                r="11"
                fill={field.glow}
                fillOpacity="0.85"
              />
            </g>
          )}

          {figure === 2 && (
            /* Stack: offset bars, like a signal trace or a set of tracks. */
            <g transform={`rotate(${spin} 100 86)`}>
              {Array.from({ length: 5 }, (_, i) => (
                <rect
                  key={i}
                  x={58 + i * 5}
                  y={44 + i * 17}
                  width={72 - i * 8}
                  height="6"
                  rx="3"
                  fill={field.glow}
                  fillOpacity={0.62 - i * 0.09}
                />
              ))}
            </g>
          )}

          {/* Starfield, so the field is not an empty gradient. */}
          {Array.from({ length: 14 }, (_, i) => {
            const sx = hashSeed(`${seed}-s${i}`) % 200
            const sy = hashSeed(`${seed}-y${i}`) % 150
            const so = 0.1 + (hashSeed(`${seed}-o${i}`) % 5) * 0.05
            return (
              <circle
                key={i}
                cx={sx}
                cy={sy}
                r="0.9"
                fill="#fff"
                fillOpacity={so}
              />
            )
          })}

          {/* The wordmark along the bottom, matching the letter-spaced caption
              the real covers carry. Set from the title rather than initials —
              the big two-letter mark was the clearest tell that this was not
              real artwork. */}
          <text
            x="100"
            y="172"
            fontSize="11"
            fontWeight="600"
            fill="#ffffff"
            fillOpacity="0.9"
            textAnchor="middle"
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            {title.length > 18 ? `${title.slice(0, 17)}…` : title.toUpperCase()}
          </text>
          <text
            x="100"
            y="188"
            fontSize="8"
            fill="#ffffff"
            fillOpacity="0.42"
            textAnchor="middle"
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              letterSpacing: '0.3em',
            }}
          >
            {initials(title)}
            {catalog ? ` · ${catalog}` : ''}
          </text>
        </svg>
      )}
    </div>
  )
}
