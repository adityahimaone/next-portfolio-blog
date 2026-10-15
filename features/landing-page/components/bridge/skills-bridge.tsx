'use client'

import { Fragment, useRef, type CSSProperties } from 'react'

import { MIXER_DATA } from '../../constants'
import { Device } from '../bench/bench-device-layer'
import { GlassDevice } from '../glass/glass-device'
import {
  BRIDGE_DEVICES,
  BRIDGE_PLATE_Y,
  BRIDGE_RING_COUNT,
} from './skills-bridge-frame'
import styles from './skills-bridge.module.css'
import { useSkillsBridge } from './use-skills-bridge'

const STATEMENT = 'Every rule needs an instrument.'
const STATEMENT_WORDS = STATEMENT.split(' ')

/** Plate x, % of the stage. */
const PLATE_X = [20, 50, 80] as const

/** How many channel names a slot prints before it says how many more. */
const SHOWN = 4

/** Every technology in the Skills section, with the group it belongs to. */
const WORDS = MIXER_DATA.flatMap((group, groupIndex) =>
  group.channels.map((channel) => ({ name: channel.name, group: groupIndex })),
)

/**
 * The bridge between the About and the Skills.
 *
 * ## What it is
 *
 * A pinned scene. On the About's own sheet a sentence arrives and three glass
 * devices fly in; the Skills' room opens from the middle of the sheet as a
 * black hole with a lit rim; the devices spiral into it; the stack streams out
 * of it as a tunnel of words and rings; three frosted plates, one per group of
 * the stack, settle out of the depth. See `skills-bridge-frame.ts` for the
 * beats and for why those devices and those plates.
 *
 * ## What the DOM guarantees
 *
 * The plates (group names and the technologies in them) are real text in
 * ordinary flow, so the section says the same thing with the script absent,
 * with reduced motion, and on a phone, where it is a static composition: the
 * sentence, three devices, three labelled plates. The devices, the tunnel, the
 * rim and the caption are decoration and `aria-hidden`.
 *
 * Nothing in the DOM here is positioned by the script except transforms and
 * custom properties; see `use-skills-bridge.ts`.
 */
export function SkillsBridge() {
  const root = useRef<HTMLElement>(null)
  useSkillsBridge(root)

  return (
    <section
      ref={root}
      className={styles.bridge}
      aria-label="From practice to toolkit"
    >
      <div className={styles.stage} data-bridge-stage>
        <div className={styles.sheet}>
          <p
            className={styles.statement}
            data-bridge-statement
            style={{ '--n': STATEMENT_WORDS.length } as CSSProperties}
          >
            {STATEMENT_WORDS.map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                <span className={styles.sw}>
                  <span
                    className={styles.swIn}
                    style={{ '--i': index } as CSSProperties}
                  >
                    {word}
                  </span>
                </span>{' '}
              </Fragment>
            ))}
          </p>
        </div>

        <div className={styles.room} data-bridge-room>
          <i className={styles.core} data-bridge-core aria-hidden="true" />

          <div className={styles.depth} aria-hidden="true">
            {Array.from({ length: BRIDGE_RING_COUNT }, (_, index) => (
              <i key={index} className={styles.ring} data-bridge-ring />
            ))}
            {WORDS.map((word, index) => (
              <span
                key={`${word.name}-${index}`}
                className={styles.word}
                data-bridge-word
                data-group={word.group}
              >
                {word.name}
              </span>
            ))}
          </div>

          <div className={styles.rack} data-bridge-rack>
            {MIXER_DATA.map((group, index) => (
              <div
                key={group.id}
                className={styles.slot}
                data-bridge-slot
                style={
                  {
                    '--sx': `${PLATE_X[index]}%`,
                    '--sy': `${BRIDGE_PLATE_Y}%`,
                  } as CSSProperties
                }
              >
                <div className={styles.slotHead}>
                  <span className={styles.slotLabel}>{group.label}</span>
                  <i className={styles.led} aria-hidden="true" />
                </div>
                <p className={styles.slotChannels}>
                  {group.channels
                    .slice(0, SHOWN)
                    .map((channel) => channel.name)
                    .join(' · ')}
                  {group.channels.length > SHOWN
                    ? ` · +${group.channels.length - SHOWN}`
                    : ''}
                </p>
              </div>
            ))}
          </div>

          <p className={styles.caption} data-bridge-caption aria-hidden="true">
            03 / Toolkit <b>routing three devices to stack control</b>
          </p>
        </div>

        <i className={styles.horizon} data-bridge-horizon aria-hidden="true" />

        <div className={styles.devices} data-bridge-devices aria-hidden="true">
          {BRIDGE_DEVICES.map((spec) => (
            <span
              key={spec.id}
              className={styles.anchor}
              data-bridge-device={spec.id}
            >
              <span className={styles.bob}>
                <span className={styles.rot} data-bridge-rot={spec.id}>
                  <span className={styles.fit}>
                    <GlassDevice
                      kind={spec.id}
                      fallback={<Device kind={spec.id} />}
                    />
                  </span>
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
