'use client'

import styles from './rack-01.module.css'
import {
  ArrowDownRight,
  ArrowUpRight,
  Mail,
  Pause,
  Play,
  Square,
} from 'lucide-react'
import { Screw } from '@/components/ui/screw'
import { EMAIL, EXPERIENCES, MIXER_DATA } from '../constants'
import { SectionHeading } from './section-heading'
export function SignalDivider() {
  const topStory = 'Frontend systems / clear interfaces.'
  const bottomStory = 'React / Next.js / product work.'

  return (
    <section
      className={styles.signalDivider}
      aria-label="Frontend systems dock alongside the production stack."
    >
      <div className={styles.signalDividerStage}>
        <div
          className={`${styles.signalDividerLane} ${styles.signalDividerLaneTop}`}
          aria-hidden="true"
        >
          <div
            className={`${styles.signalDividerRail} ${styles.signalDividerTopRail}`}
          >
            {Array.from({ length: 8 }, (_, groupIndex) => (
              <span
                className={styles.signalDividerTrackGroup}
                key={`top-story-${groupIndex}`}
              >
                <span className={styles.signalDividerPhrase}>{topStory}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.signalDock} aria-hidden="true">
          <span className={styles.signalDockRule} />
        </div>

        <div
          className={`${styles.signalDividerLane} ${styles.signalDividerLaneBottom}`}
          aria-hidden="true"
        >
          <div
            className={`${styles.signalDividerRail} ${styles.signalDividerBottomRail}`}
          >
            {Array.from({ length: 8 }, (_, groupIndex) => (
              <span
                className={styles.signalDividerTrackGroup}
                key={`bottom-story-${groupIndex}`}
              >
                <span className={styles.signalDividerPhrase}>
                  {bottomStory}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
