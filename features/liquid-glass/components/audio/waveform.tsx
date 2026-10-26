'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useAudioEngine, useAudioSignal } from '../../audio/engine'

/**
 * The frequency readout.
 *
 * Bars are real analyser bins, not a decorative sine — the difference is
 * obvious the moment the music stops. Height is written with `scaleY` on the
 * bar (compositor-only), never with `height` (layout).
 *
 * The bar count is fixed and small; a spectrum with 128 bars on a 2px grid is
 * noise, not information. 32 in the dock, 64 across the hero.
 */

function envelope(index: number, total: number) {
  // Bell-shaped weighting so the strip reads as one object rather than a wall.
  const centre = 0.42
  const position = index / Math.max(1, total - 1)
  const bell = Math.exp(-Math.pow((position - centre) / 0.42, 2))
  return 0.18 + bell * 0.82
}

export function Waveform({
  bars = 32,
  className = 'lg-wave',
  height = 22,
  barWidth = 2,
  gap = 2,
  reactive = true,
}: {
  bars?: number
  className?: string
  height?: number
  barWidth?: number
  gap?: number
  reactive?: boolean
}) {
  const { isPlaying } = useAudioEngine()
  const barRefs = useRef<Array<HTMLSpanElement | null>>([])
  const weights = useMemo(
    () => Array.from({ length: bars }, (_, index) => envelope(index, bars)),
    [bars],
  )

  useAudioSignal((frame) => {
    if (!reactive) return
    const bins = frame.bins
    if (!bins.length) return

    for (let index = 0; index < bars; index += 1) {
      const element = barRefs.current[index]
      if (!element) continue

      // Low bins get more resolution than high ones, because that is where
      // the energy that looks like rhythm actually lives.
      const position = index / bars
      const bin = Math.min(
        bins.length - 1,
        Math.floor(Math.pow(position, 1.45) * 118) + 1,
      )
      const value = bins[bin] / 255
      const scale = Math.max(0.06, Math.min(1, value * 1.35 * weights[index]))
      element.style.transform = `scaleY(${scale.toFixed(3)})`
      element.style.opacity = `${(0.45 + scale * 0.55).toFixed(2)}`
    }
  }, reactive)

  // When the record stops, hand the bars back to CSS so they settle into a slow
  // idle breath instead of freezing mid-frame.
  useEffect(() => {
    if (isPlaying) return
    barRefs.current.forEach((element, index) => {
      if (!element) return
      element.style.transform = ''
      element.style.opacity = ''
      element.style.animationDelay = `${(index % 12) * 0.14}s`
    })
  }, [isPlaying])

  return (
    <div
      className={`${className}${isPlaying ? '' : 'lg-wave--idle'}`}
      style={
        {
          height,
          gap,
          '--lg-bar-width': `${barWidth}px`,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {weights.map((weight, index) => (
        <span
          key={index}
          ref={(element) => {
            barRefs.current[index] = element
          }}
          className="lg-wave__bar"
          style={{ height: `${Math.round(28 + weight * 72)}%` }}
        />
      ))}
    </div>
  )
}
