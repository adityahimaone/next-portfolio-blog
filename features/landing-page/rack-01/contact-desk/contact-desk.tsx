import { EMAIL } from '../../constants'
import { ContactBriefBuilder } from './contact-brief-builder'
import { ContactConsole } from './contact-console'
import { ContactSignalPath } from './contact-signal-path'
import styles from './contact-desk.module.css'

/**
 * Everything under the performance controller: the rest of the session desk.
 *
 * The controller is the hardware you play. This is the desk around it — the
 * printed insert that answers the questions (a recall console), the routing
 * diagram that says where a message goes next, and the pad that writes the
 * message for you. It sits between `.contactDeck` and the footer on purpose:
 * the rack's scroll animations address specific children of `.contactDeck` by
 * class, so a block added inside it would sit unanimated in a moving box.
 */
export function ContactDesk() {
  return (
    <div className={styles.desk}>
      <ContactConsole />
      <div className={styles.pair}>
        <ContactSignalPath />
        <ContactBriefBuilder email={EMAIL} />
      </div>
    </div>
  )
}
