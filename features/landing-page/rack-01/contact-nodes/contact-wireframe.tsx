'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import type { Shape } from './contact-orbit'
import { useMediaQuery } from './use-media'
import styles from './contact-nodes.module.css'

const ContactWireframeCanvas = dynamic(
  () => import('./contact-wireframe-canvas'),
  { ssr: false },
)

/**
 * The field's background primitive.
 *
 * three.js is deliberately late and optional. The wrapper waits until the
 * section is within 300px of the viewport, checks for WebGL, and honours
 * `prefers-reduced-motion` before it even requests the lazy chunk. Until then
 * — and for every visitor who never gets a canvas — the same three primitives
 * exist as a hand-drawn SVG, so the composition is complete on first paint.
 */
export function ContactWireframe({
  shape,
  color,
}: {
  shape: Shape
  color: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [webgl, setWebgl] = useState(false)
  const still = useMediaQuery('(prefers-reduced-motion: reduce)')

  // WebGL support is a one-time capability probe, scheduled a frame out so it
  // is not a synchronous state write from an effect body.
  useEffect(() => {
    const probeFrame = requestAnimationFrame(() => {
      try {
        const probe = document.createElement('canvas')
        setWebgl(
          Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl')),
        )
      } catch {
        setWebgl(false)
      }
    })
    return () => cancelAnimationFrame(probeFrame)
  }, [])

  useEffect(() => {
    const node = root.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: '300px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const live = near && webgl && !still

  return (
    <div
      ref={root}
      className={styles.wireframe}
      style={{ color }}
      aria-hidden="true"
    >
      {live ? (
        <ContactWireframeCanvas shape={shape} color={color} />
      ) : (
        <ShapeMark shape={shape} className={styles.glyph} />
      )}
    </div>
  )
}

/**
 * The same primitives as line art, used as the no-WebGL/reduced-motion frame
 * and as the large echo behind the expanded question. All three are present;
 * the active one fades up and turns, which is enough to carry the morph when
 * the 3D layer is unavailable.
 */
export function ShapeMark({
  shape,
  className,
}: {
  shape: Shape
  className?: string
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g
        className={styles.glyphShape}
        data-on={shape === 'neutral'}
        vectorEffect="non-scaling-stroke"
      >
        <polygon points="200,24 352,112 352,288 200,376 48,288 48,112" />
        <polygon
          points="200,99 292,153 292,247 200,301 108,247 108,153"
          opacity="0.7"
        />
        <path
          d="M200 24 200 99M352 112 292 153M352 288 292 247M200 376 200 301M48 288 108 247M48 112 108 153M200 99 352 112M200 99 48 112M292 153 352 288M292 247 200 376M108 247 48 288M108 153 48 112"
          opacity="0.55"
        />
      </g>

      <g
        className={styles.glyphShape}
        data-on={shape === 'icosahedron'}
        vectorEffect="non-scaling-stroke"
      >
        <polygon points="200,24 352,112 352,288 200,376 48,288 48,112" />
        <path d="M200 24 108 153 200 200 292 153 200 24M108 153 48 288 200 200 352 288 292 153M200 200 200 376 352 288M200 200 48 288" />
        <path d="M200 200 108 247 200 376 292 247 200 200" opacity="0.55" />
      </g>

      <g
        className={styles.glyphShape}
        data-on={shape === 'torus'}
        vectorEffect="non-scaling-stroke"
      >
        <ellipse
          cx="200"
          cy="200"
          rx="154"
          ry="78"
          transform="rotate(-18 200 200)"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="154"
          ry="78"
          transform="rotate(72 200 200)"
          opacity="0.6"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="96"
          ry="38"
          transform="rotate(-18 200 200)"
          opacity="0.8"
        />
        <path
          d="M200 122 200 162M312 154 282 170M312 246 282 230M200 278 200 238M88 246 118 230M88 154 118 170"
          opacity="0.55"
        />
      </g>

      <g
        className={styles.glyphShape}
        data-on={shape === 'octahedron'}
        vectorEffect="non-scaling-stroke"
      >
        <polygon points="200,22 342,200 200,378 58,200" />
        <polygon points="200,96 274,200 200,304 126,200" opacity="0.55" />
        <path
          d="M200 22 200 96M342 200 274 200M200 378 200 304M58 200 126 200M200 22 200 378M58 200 342 200"
          opacity="0.45"
        />
      </g>
    </svg>
  )
}
