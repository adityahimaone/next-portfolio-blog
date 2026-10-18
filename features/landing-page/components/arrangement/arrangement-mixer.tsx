import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Led, Meter } from '../patch/patch-kit'
import {
  ARRANGEMENT_CLIPS,
  MIXER_STRIPS,
  PROOF_READOUTS,
} from './arrangement-data'
import styles from './arrangement.module.css'

/**
 * The mixer. One insert per technology on the rack, coloured by the stage that
 * uses it, its fader set to the listed level — so this is the stack, not a
 * picture of one. The three proof numbers sit at the left as the project's
 * info display, and the master carries the way into About.
 *
 * Two things changed when the Patch arrived, and both are the same idea:
 * the hero stops pretending to be a machine of its own and draws from the
 * shared kit.
 *
 * - The proof meters are the kit's `Meter`, so the number, the groove and the
 *   fill are one part in both sections.
 * - Each strip now carries a lamp, and the lamp and the meter report the same
 *   reading: how much of this channel is live under the playhead. It is a real
 *   signal, not a heartbeat — the strip's `--on` is 1 while the playhead is
 *   inside that group's clip and 0 outside it, and both the lamp and the meter
 *   are drawn from it in the stylesheet. The old `meter-bounce` loop is gone
 *   with it: the design rule is no perpetual animation, and a meter that
 *   breathes while nothing is playing was the one place the page broke it.
 */
export function ArrangementMixer({ axis }: { axis: string }) {
  return (
    <footer className={styles.proof} data-arr-proof>
      <div className={styles.proofReadouts}>
        {PROOF_READOUTS.map((readout) => (
          <div key={readout.unit}>
            <b>{readout.value}</b>
            <small>{readout.unit}</small>
            <Meter ratio={readout.ratio} />
            <small>{readout.meter}</small>
          </div>
        ))}
      </div>

      <div
        className={styles.strips}
        aria-label="Stack, one channel per technology"
      >
        {MIXER_STRIPS.map((strip) => {
          // The clip this group's work is drawn in. The span is the clip's own
          // start and end, so the strip is live exactly while the playhead is
          // over the part of the arrangement the technology belongs to.
          const clip = ARRANGEMENT_CLIPS.find(
            (item) => item.group === strip.group,
          )
          return (
            <div
              key={strip.id}
              className={styles.strip}
              style={
                {
                  '--strip-color': strip.color,
                  '--level': strip.level,
                  '--from': clip?.start ?? 0,
                  '--to': clip?.end ?? 1,
                } as CSSProperties
              }
            >
              <span className={styles.stripHead}>
                <b>{String(strip.index).padStart(2, '0')}</b>
                <em>{strip.name}</em>
              </span>
              <span className={styles.stripBody} aria-hidden="true">
                <span className={styles.stripName}>{strip.name}</span>
                <span className={styles.stripLed}>
                  <Led color={strip.color} />
                </span>
                <span className={styles.stripMeter}>
                  <i />
                </span>
                <span className={styles.stripFader}>
                  <i
                    data-flight-source={
                      strip.id === 'frontend-REACT' ? 'fader' : undefined
                    }
                  />
                </span>
              </span>
            </div>
          )
        })}
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
        <Link href="/projects">Projects</Link>
        <Link href="/blog">Notes</Link>
        <Link href="/bookmarks">Bookmarks</Link>
        <Link href="/skills">Skills</Link>
        <Link href="/music">Mixtape</Link>
      </nav>
    </footer>
  )
}
