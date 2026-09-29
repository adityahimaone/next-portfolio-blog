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
export function CableDivider() {
  return (
    <section
      className={styles.cableDivider}
      aria-label="Skills output connected to experience input"
    >
      <div className={styles.cableDividerInner}>
        <p className={styles.cableDividerLabel}>
          <span>SIGNAL PATH / 03-04</span>
          <strong>Putting the stack to work.</strong>
        </p>

        <div className={styles.cableAssembly} aria-hidden="true">
          <div className={`${styles.cableHalf} ${styles.cableMaleHalf}`}>
            <span className={styles.cableLine} />
            <span className={styles.cableMale}>
              <i />
            </span>
          </div>
          <div className={`${styles.cableHalf} ${styles.cableFemaleHalf}`}>
            <span className={styles.cableFemale}>
              <i />
            </span>
            <span className={styles.cableLine} />
          </div>
          <span className={styles.cableConnectionFx}>
            <i />
            <i />
          </span>
        </div>
      </div>
    </section>
  )
}
