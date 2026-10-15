'use client'

import { Fragment, useRef, type CSSProperties } from 'react'

import { MIXER_DATA } from '../../constants'
import { Device } from '../bench/bench-device-layer'
import { BRIDGE_DEVICES, BRIDGE_SLOT_Y } from './skills-bridge-frame'
import styles from './skills-bridge.module.css'
import { useSkillsBridge } from './use-skills-bridge'

const STATEMENT = 'Every rule needs an instrument.'
const STATEMENT_WORDS = STATEMENT.split(' ')

/** Slot x, % of the stage. The docks in `skills-bridge-frame.ts` match these. */
const SLOT_X = [20, 50, 80] as const

/** How many channel names a slot prints before it says how many more. */
const SHOWN = 4

/**
 * The bridge between the About and the Skills.
 *
 * ## What it is
 *
 * A pinned scene. On the About's own sheet a sentence arrives and three
 * devices fly in; the Skills' room opens from the middle of the sheet like an
 * iris; the devices dock into three rack slots labelled with the three groups
 * of the stack; cables run out of the bottom of the scene. See
 * `skills-bridge-frame.ts` for why those three devices and those three slots.
 *
 * ## What the DOM guarantees
 *
 * The slots (group names and the technologies in them) are real text in
 * ordinary flow, so the section says the same thing with the script absent,
 * with reduced motion, and on a phone, where it is a static composition: the
 * sentence, three devices, three labelled slots. The devices, cables and
 * caption are decoration and `aria-hidden`.
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
          <div className={styles.rack} data-bridge-rack>
            {MIXER_DATA.map((group, index) => (
              <div
                key={group.id}
                className={styles.slot}
                data-bridge-slot
                style={
                  {
                    '--sx': `${SLOT_X[index]}%`,
                    '--sy': `${BRIDGE_SLOT_Y}%`,
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

          <svg
            className={styles.cables}
            data-bridge-cables
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {CABLES.map((d, index) => (
              <Fragment key={d}>
                <path
                  className={styles.cableGlow}
                  d={d}
                  pathLength={1}
                  style={{
                    strokeDashoffset: `calc(1 - var(--c${index}, 1))`,
                  }}
                />
                <path
                  className={styles.cable}
                  d={d}
                  pathLength={1}
                  style={{
                    strokeDashoffset: `calc(1 - var(--c${index}, 1))`,
                  }}
                />
              </Fragment>
            ))}
          </svg>

          <p className={styles.caption} data-bridge-caption aria-hidden="true">
            03 / Toolkit <b>routing three devices to stack control</b>
          </p>
        </div>

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
                    <Device kind={spec.id} />
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

/**
 * The cables, in the room's own 100 x 100 space (`preserveAspectRatio="none"`,
 * with non-scaling strokes). Each leaves the bottom of its slot and the three
 * meet on one bus that runs off the bottom of the scene, which is where the
 * Skills' controller begins.
 */
const CABLES = [
  `M${SLOT_X[0]} ${BRIDGE_SLOT_Y + 25} C${SLOT_X[0]} 88, 50 80, 50 101`,
  `M${SLOT_X[1]} ${BRIDGE_SLOT_Y + 25} L50 101`,
  `M${SLOT_X[2]} ${BRIDGE_SLOT_Y + 25} C${SLOT_X[2]} 88, 50 80, 50 101`,
] as const
