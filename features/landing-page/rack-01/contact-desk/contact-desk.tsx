import { EMAIL } from '../../constants'
import { ContactNodes } from '../contact-nodes/contact-nodes'

/**
 * What sits under the performance controller: the FAQ, as a magnetic field of
 * question nodes rather than a second piece of hardware.
 *
 * It is rendered between `.contactDeck` and the footer on purpose: the rack's
 * scroll animations address specific children of `.contactDeck` by class, so a
 * block added inside it would sit unanimated in a moving box. It also owns its
 * own portal for the expanded stage, so the section's perspective cannot
 * become the containing block for a fixed overlay.
 */
export function ContactDesk() {
  return <ContactNodes email={EMAIL} />
}
