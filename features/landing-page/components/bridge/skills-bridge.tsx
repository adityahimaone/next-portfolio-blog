'use client'

import { Fragment, useRef, type CSSProperties, type ReactNode } from 'react'

import { Device } from '../bench/bench-device-layer'
import { GlassDevice } from '../glass/glass-device'
import { BRIDGE_QUERY } from '../motion-gate'
import { BRIDGE_DEVICES } from './skills-bridge-frame'
import styles from './skills-bridge.module.css'
import { useSkillsBridge } from './use-skills-bridge'

const STATEMENT = 'Every rule needs an instrument.'
const STATEMENT_WORDS = STATEMENT.split(' ')

/**
 * The bridge between the About and the Skills.
 *
 * ## What it is
 *
 * A pinned scene, and the Skills section is *under* it. See
 * `skills-bridge-frame.ts` for the beats; the structural fact is in
 * `rack-01.tsx` and `SkillsLift` below: the Skills section is lifted up by one
 * viewport so that, while this stage is pinned, the real section is scrolling
 * up beneath it. The stage's sheet has a hole cut in it by a mask, the hole
 * grows, and what it opens onto is the actual Skills section, not a picture of
 * one. When the hole is larger than the screen the sheet is gone and there is
 * nothing to hand over: the page is already the Skills section.
 *
 * ## What the DOM guarantees
 *
 * The sentence is real text in ordinary flow. With the script absent, with
 * reduced motion, and on a phone, this is a static composition: the sentence
 * and three devices on the dark ground, followed by the Skills section in
 * normal flow. The devices, the rim and the glow are decoration and
 * `aria-hidden`.
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
        <i className={styles.core} data-bridge-core aria-hidden="true" />

        <div className={styles.sheet} data-bridge-sheet>
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

/**
 * Lifts whatever it wraps up by one viewport, under the bridge's stage.
 *
 * Only inside the pinned scene's own media query: everywhere else the Skills
 * section follows the bridge in ordinary flow. It is a wrapper rather than a
 * class on the section because the section is another component's, and
 * lifting it is this scene's business, not the section's.
 */
export function SkillsLift({ children }: { children: ReactNode }) {
  return <div className={styles.lift}>{children}</div>
}
