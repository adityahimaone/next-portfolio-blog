import type { CSSProperties } from 'react'
import styles from './kit.module.css'

/**
 * The kit: the small hardware parts both sections draw with.
 *
 * Nothing here knows which section it is in. Every part takes its value as a
 * unitless 0..1 custom property and its colour from the cascade, so the hero's
 * mixer and the Patch's panel are the same parts at different sizes. A part that
 * needs to know where it lives belongs in that section's own stylesheet.
 */

/**
 * A panel lamp.
 *
 * Two ways to light it, and they are the same lamp. `on` is the boolean path and
 * is what the Patch uses: a module's LED is lit when that module is the active
 * one, and that is a fact React already holds. `--on` is the cascade path: a
 * section that drives a lamp from a scroll position writes a 0..1 number and the
 * lamp follows without a React update per frame — which is what the hero's mixer
 * does, since its strips peak as the playhead passes their clip. A lamp outside
 * a scroll-driven section never sets `--on`, and then `on` is the whole of its
 * behaviour.
 */
export function Led({ on, color }: { on?: boolean; color?: string }) {
  return (
    <i
      className={styles.led}
      data-on={on}
      style={color ? ({ '--led': color } as CSSProperties) : undefined}
      aria-hidden="true"
    />
  )
}

/** Small-caps panel lettering, the way a faceplate is silkscreened. */
export function Silk({
  children,
  as: Tag = 'span',
}: {
  children: React.ReactNode
  as?: 'span' | 'h3' | 'p'
}) {
  return <Tag className={styles.silk}>{children}</Tag>
}

type ControlProps = {
  name: string
  /** 0..1 — the technology's listed level. */
  level: number
  /** This control's position in its module, for the stagger. */
  index: number
}

const describe = (name: string, level: number) =>
  `${name}, ${Math.round(level * 100)} out of 100`

/**
 * A rotary control. It is `role="img"` with the level in its label, because it
 * reports a value and takes no input: a knob that looked draggable and was not
 * would be the one dishonest part on the panel.
 *
 * The cap's angle is `-135deg + level × sweep × 270deg`. `--ctl` (this control's
 * own sweep, staggered) is computed in the stylesheet, so the scroll writes
 * three numbers per frame no matter how many controls there are.
 */
export function Knob({ name, level, index }: ControlProps) {
  return (
    <span
      className={styles.knob}
      role="img"
      aria-label={describe(name, level)}
      style={{ '--lvl': level, '--i': index } as CSSProperties}
    >
      <i className={styles.knobCap} />
      <b className={styles.controlName} aria-hidden="true">
        {name}
      </b>
    </span>
  )
}

/** A vertical fader. Same contract as `Knob`: a readout, not an input. */
export function Fader({ name, level, index }: ControlProps) {
  return (
    <span
      className={styles.fader}
      role="img"
      aria-label={describe(name, level)}
      style={{ '--lvl': level, '--i': index } as CSSProperties}
    >
      <i className={styles.faderTrack} />
      <i className={styles.faderCap} />
      <b className={styles.controlName} aria-hidden="true">
        {name}
      </b>
    </span>
  )
}

/** A horizontal meter filled to `ratio`, scaled by whatever `--settle` says. */
export function Meter({ ratio }: { ratio: number }) {
  return (
    <span className={styles.meter} aria-hidden="true">
      <i style={{ '--ratio': ratio } as CSSProperties} />
    </span>
  )
}
