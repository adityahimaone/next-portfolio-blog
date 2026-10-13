import type { CSSProperties } from 'react'
import Link from 'next/link'
import { MIXER_STRIPS, PROOF_READOUTS } from './arrangement-data'
import styles from './arrangement.module.css'

/**
 * The mixer. One insert per technology on the rack, coloured by the stage that
 * uses it, its fader set to the listed level — so this is the stack, not a
 * picture of one. The three proof numbers sit at the left as the project's
 * info display, and the master carries the way into About.
 */
export function ArrangementMixer({ axis }: { axis: string }) {
  return (
    <footer className={styles.proof}>
      <div className={styles.proofReadouts}>
        {PROOF_READOUTS.map((readout) => (
          <div key={readout.unit}>
            <b>{readout.value}</b>
            <small>{readout.unit}</small>
            <span className={styles.meter} aria-hidden="true">
              <i style={{ '--ratio': readout.ratio } as CSSProperties} />
            </span>
            <small>{readout.meter}</small>
          </div>
        ))}
      </div>

      <div
        className={styles.strips}
        aria-label="Stack, one channel per technology"
      >
        {MIXER_STRIPS.map((strip) => (
          <div
            key={strip.id}
            className={styles.strip}
            style={
              {
                '--strip-color': strip.color,
                '--level': strip.level,
                '--phase': `${(strip.index * 137) % 900}ms`,
              } as CSSProperties
            }
          >
            <span className={styles.stripHead}>
              <b>{String(strip.index).padStart(2, '0')}</b>
              <em>{strip.name}</em>
            </span>
            <span className={styles.stripBody} aria-hidden="true">
              <span className={styles.stripName}>{strip.name}</span>
              <span className={styles.stripMeter}>
                <i />
              </span>
              <span className={styles.stripFader}>
                <i />
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className={styles.master}>
        <span className={styles.axis}>{axis}</span>
        <a className={styles.proofJump} href="#about">
          Open profile →
        </a>
      </div>

      {/* The nav is hidden in the toolbar on phones, where the header has one
          line and no room for four links. It reappears here, in the flow. */}
      <nav className={styles.proofNav} aria-label="Portfolio">
        <a href="#work">Projects</a>
        <Link href="/blog">Notes</Link>
        <Link href="/bookmarks">Bookmarks</Link>
        <a href="#about">About</a>
      </nav>
    </footer>
  )
}
