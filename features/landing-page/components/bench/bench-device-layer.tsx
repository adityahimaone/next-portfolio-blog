import type { CSSProperties } from 'react'

import { GlassDevice } from '../glass/glass-device'
import { BENCH_DEVICES, type BenchDeviceSpec } from './bench-devices'
import styles from './bench-devices.module.css'

/**
 * The flying devices, built from CSS solids.
 *
 * Every object is real geometry in a 3D rendering context (faces placed in
 * space, not a flat picture tilted), so a tumbling device shows its sides and
 * its back as the hook rotates it. The hook owns two transforms per device:
 * the **anchor** (position and scale) and the **rot** (orientation). A third
 * wrapper, `bob`, carries a slow CSS idle float so a device is never dead
 * between scroll ticks.
 *
 * Opacity is a custom property read by the faces (`--o`), not an `opacity` on
 * the anchor: any `opacity` below 1 forces `transform-style: flat` and would
 * collapse the solid into a sticker the moment it began to fade.
 */

const PADS = Array.from({ length: 16 }, (_, index) => index)
const ACCENT_PADS = new Set([0, 5, 10, 15])
const KNOB_LAYERS = Array.from({ length: 7 }, (_, index) => index)

function Cuboid({
  w,
  h,
  d,
  front,
  className,
}: {
  w: number
  h: number
  d: number
  front: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`${styles.solid} ${className ?? ''}`}
      style={
        { '--w': `${w}px`, '--h': `${h}px`, '--d': `${d}px` } as CSSProperties
      }
    >
      <span className={`${styles.face} ${styles.front}`}>{front}</span>
      <span className={`${styles.face} ${styles.back}`} />
      <span className={`${styles.face} ${styles.left}`} />
      <span className={`${styles.face} ${styles.right}`} />
      <span className={`${styles.face} ${styles.top}`} />
      <span className={`${styles.face} ${styles.bottom}`} />
    </span>
  )
}

export function Device({
  kind,
  live,
}: {
  kind: BenchDeviceSpec['kind']
  /** Chapter mode: parts respond to `--p` instead of sitting still. */
  live?: boolean
}) {
  switch (kind) {
    case 'sampler':
      return (
        <Cuboid
          className={live ? styles.live : undefined}
          w={104}
          h={78}
          d={20}
          front={
            <>
              <i className={styles.samplerLcd} />
              <i className={styles.samplerKnob} />
              <span className={styles.pads}>
                {PADS.map((pad) => (
                  <i
                    key={pad}
                    style={{ '--i': pad } as CSSProperties}
                    className={`${styles.pad} ${
                      ACCENT_PADS.has(pad) ? styles.padAccent : ''
                    }`}
                  />
                ))}
              </span>
            </>
          }
        />
      )
    case 'cassette':
      return (
        <Cuboid
          w={96}
          h={60}
          d={12}
          front={
            <>
              <i className={styles.tapeLabel} />
              <span className={styles.tapeWindow}>
                <i className={styles.reel} />
                <i className={styles.reel} />
              </span>
            </>
          }
        />
      )
    case 'player':
      return (
        <Cuboid
          w={58}
          h={92}
          d={12}
          front={
            <>
              <i className={styles.playerScreen}>
                <b />
                <b />
                <b />
              </i>
              <i className={styles.playerWheel} />
            </>
          }
        />
      )
    case 'knob':
      return (
        <span className={styles.knob}>
          {KNOB_LAYERS.map((layer) => (
            <i
              key={layer}
              className={styles.knobLayer}
              style={{ '--i': layer } as CSSProperties}
            />
          ))}
          <i className={styles.knobCap}>
            <b />
          </i>
        </span>
      )
    case 'vinyl':
      return (
        <span className={`${styles.vinyl} ${live ? styles.live : ''}`}>
          <i className={`${styles.disc} ${styles.discFront}`}>
            <b className={styles.discLabel} />
          </i>
          <i className={`${styles.disc} ${styles.discBack}`}>
            <b className={styles.discLabel} />
          </i>
        </span>
      )
  }
}

/**
 * The layer. `aria-hidden` and `pointer-events: none` by the stage it sits in;
 * it is `display: none` unless the stage is.
 */
export function BenchDevices() {
  return (
    <div className={styles.layer} data-bench-devices aria-hidden="true">
      {BENCH_DEVICES.map((spec, index) => (
        <span
          key={spec.id}
          className={styles.anchor}
          data-bench-device={spec.id}
          style={{ left: `${spec.x}%` }}
        >
          <span
            className={styles.bob}
            style={
              {
                animationDuration: `${5.2 + index * 0.9}s`,
                animationDelay: `${-index * 1.3}s`,
              } as CSSProperties
            }
          >
            <span className={styles.rot} data-bench-device-rot={spec.id}>
              <GlassDevice
                kind={spec.kind}
                fallback={<Device kind={spec.kind} />}
              />
            </span>
          </span>
        </span>
      ))}
    </div>
  )
}
