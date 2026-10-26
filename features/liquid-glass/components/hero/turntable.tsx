'use client'

import { useEffect, useRef } from 'react'
import { useAudioEngine, useAudioSignal } from '../../audio/engine'
import { useTilt } from '../../interactive/use-pointer'

/**
 * The hero instrument.
 *
 * A pure-CSS record with a real rotation clock, a tonearm that drops when the
 * track starts, and a ring of analyser-driven spokes around the platter. No
 * canvas, no WebGL: at this size a 3D scene would cost 200KB and a GPU context
 * to render a circle that gradients do better.
 *
 * Rotation is intentionally frame-rate independent and keeps its angle when the
 * music pauses — the platter slows to a stop rather than snapping back, which
 * is the difference between a record and a loading spinner.
 */

const SPOKES = 64

export function Turntable() {
  const { isPlaying, track } = useAudioEngine()
  const spinRef = useRef<HTMLDivElement | null>(null)
  const spokeRefs = useRef<Array<HTMLSpanElement | null>>([])
  const tiltRef = useTilt<HTMLDivElement>(2.6)

  // Rotation clock.
  useEffect(() => {
    const element = spinRef.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.style.transform = 'rotate(18deg)'
      return
    }

    let frame = 0
    let last = performance.now()
    let angle = 18
    let speed = 0

    const tick = (now: number) => {
      const delta = Math.min(64, now - last)
      last = now

      // 33⅓ rpm ≈ 200°/s. Approach the target speed with inertia so starting
      // and stopping both take about a third of a second.
      const target = isPlaying ? 200 : 0
      speed += (target - speed) * Math.min(1, delta / 260)
      angle = (angle + (speed * delta) / 1000) % 360

      element.style.transform = `rotate(${angle.toFixed(2)}deg)`
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isPlaying])

  // Analyser ring.
  useAudioSignal((frame) => {
    const bins = frame.bins
    if (!bins.length) return

    for (let index = 0; index < SPOKES; index += 1) {
      const element = spokeRefs.current[index]
      if (!element) continue

      // Mirror around the ring so it reads as a halo, not a left-to-right EQ.
      const mirrored = index < SPOKES / 2 ? index : SPOKES - index
      const bin = Math.min(bins.length - 1, 2 + Math.floor(mirrored * 1.6))
      const value = bins[bin] / 255
      const scale = 0.12 + Math.pow(value, 1.2) * 0.95
      element.style.transform = `scaleY(${scale.toFixed(3)})`
      element.style.opacity = `${(0.2 + value * 0.8).toFixed(2)}`
    }
  })

  return (
    <div className="lg-stage">
      <div
        ref={tiltRef}
        className="lg-turntable"
        data-playing={isPlaying}
        role="img"
        aria-label={`Turntable, ${isPlaying ? 'spinning' : 'paused'}. Now cued: ${track.title} by ${track.artist}.`}
      >
        <div className="lg-turntable__halo" />
        <div className="lg-turntable__shadow" />

        <div className="lg-orbit" aria-hidden="true">
          {Array.from({ length: SPOKES }, (_, index) => (
            <div
              key={index}
              className="lg-orbit__spoke"
              style={{ transform: `rotate(${(360 / SPOKES) * index}deg)` }}
            >
              <span
                ref={(element) => {
                  spokeRefs.current[index] = element
                }}
                className="lg-orbit__bar"
              />
            </div>
          ))}
        </div>

        <div ref={spinRef} className="lg-turntable__spin">
          <div className="lg-turntable__disc" />
          <div className="lg-turntable__grooves" />
          <div className="lg-turntable__sheen" />
        </div>

        {/* The label sits outside the rotating assembly on purpose: vinyl spins,
            but a wordmark that spends half its time upside-down reads as a
            broken asset rather than as a record. The sheen underneath still
            turns, which is what sells the rotation. */}
        <div className="lg-turntable__label">
          <span className="lg-turntable__label-mark">Signal</span>
          <span className="lg-turntable__label-spindle" aria-hidden="true" />
          <span className="lg-turntable__label-side">Side B · 33⅓</span>
        </div>

        <div className="lg-turntable__arm" aria-hidden="true">
          <div className="lg-turntable__arm-pivot" />
          <div className="lg-turntable__arm-bar" />
          <div className="lg-turntable__arm-head" />
        </div>
      </div>
    </div>
  )
}
