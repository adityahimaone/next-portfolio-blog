'use client'

import styles from './contact-desk.module.css'
import { SlitTitle } from './slit-title'
import { useIntro } from './use-intro'

/**
 * The Contact section's title: the same slit type as the FAQ that closes the
 * section, so the two bookend it. It replaces the standalone heading
 * ("Bring me the difficult part.") with a line that says the same thing in the
 * studio's own voice: this is where you bring something hard, and it gets
 * recorded properly.
 *
 * The eyebrow keeps the numbered-section convention (06 / Open channel) the
 * other sections use. The title is a real `h2`; see `SlitTitle` for how the
 * letters are kept out of the accessibility tree.
 */
export function ContactTitle() {
  const [ref, intro] = useIntro<HTMLDivElement>(0.3)
  return (
    <div ref={ref} className={styles.contactHead} data-intro={intro}>
      <div className={styles.eyebrow}>
        <b>06</b>
        <i aria-hidden="true" />
        <span>Open channel</span>
      </div>
      <SlitTitle text={"Got a hard one?\nLet's roll tape."} slit={0.38} />
    </div>
  )
}
