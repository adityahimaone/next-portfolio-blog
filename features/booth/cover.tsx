'use client'

import { useId } from 'react'
import Image from 'next/image'
import { hashSeed } from '@/lib/waveform-data'

/** Deterministic album-art field, used when a project or post has no image. */
const PALETTES: Array<[string, string]> = [
  ['#ff5a1f', '#2e3f5c'],
  ['#5cd6a3', '#1d1e1c'],
  ['#c9a574', '#7b2735'],
  ['#9b6cff', '#0b0d0c'],
  ['#d9895b', '#25231f'],
  ['#2e3f5c', '#ff5a1f'],
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
  const [a, b] = PALETTES[h % PALETTES.length]
  const rings = 3 + (h % 3)
  const cx = 40 + (h % 60)
  const cy = 150 - (h % 40)

  return (
    <div
      className={className}
      /* A definite width matters here: `aspect-ratio` alone resolves against
         whatever the content measures, so a cover whose image has not loaded
         yet collapses to zero and then snaps to full size — which is what made
         the sleeve art drop below the record on a fresh page load. `width:
         100%` plus the parent's padding gives a stable square either way. */
      style={{
        position: 'relative',
        width: '100%',
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
          width="100%"
          height="100%"
        >
          <defs>
            <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={a} />
              <stop offset="1" stopColor={b} />
            </linearGradient>
          </defs>
          <rect width="200" height="200" fill={`url(#g-${uid})`} />
          {Array.from({ length: rings }).map((_, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={30 + i * 26}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />
          ))}
          <text
            x="16"
            y="124"
            fontSize="72"
            fontWeight="700"
            fill="rgba(255,255,255,0.92)"
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              letterSpacing: '-0.04em',
            }}
          >
            {initials(title)}
          </text>
          {catalog && (
            <text
              x="16"
              y="184"
              fontSize="10"
              fill="rgba(255,255,255,0.75)"
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                letterSpacing: '0.12em',
              }}
            >
              {catalog}
            </text>
          )}
        </svg>
      )}
    </div>
  )
}
