import { EMAIL } from '../../constants'
import { SceneLaunch } from './scene-launch'

/**
 * What sits under the performance controller: the FAQ, as a second unit on the
 * same desk. It is rendered between `.contactDeck` and the footer on purpose:
 * the rack's scroll animations address specific children of `.contactDeck` by
 * class, so a block added inside it would sit unanimated in a moving box.
 */
export function ContactDesk() {
  return <SceneLaunch email={EMAIL} />
}
