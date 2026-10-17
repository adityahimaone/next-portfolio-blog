import { EMAIL } from '../../constants'
import { ContactBriefBuilder } from './contact-brief-builder'
import { ContactSignalPath } from './contact-signal-path'
import styles from './contact-desk.module.css'
import { StudioFaq } from './studio-faq'

/**
 * Everything under the performance controller: the rest of the session desk.
 *
 * The controller is the hardware you play. This is the desk around it: the
 * routing diagram that says where a message goes next, the pad that writes the
 * message for you, and, as the last act of the section, the FAQ as a full-bleed
 * dark band. It sits between `.contactDeck` and the footer on purpose: the
 * rack's scroll animations address specific children of `.contactDeck` by
 * class, so a block added inside it would sit unanimated in a moving box.
 */
export function ContactDesk() {
  return (
    <>
      <div className={styles.desk}>
        <div className={styles.pair}>
          <ContactSignalPath />
          <ContactBriefBuilder email={EMAIL} />
        </div>
      </div>
      <StudioFaq email={EMAIL} />
    </>
  )
}
