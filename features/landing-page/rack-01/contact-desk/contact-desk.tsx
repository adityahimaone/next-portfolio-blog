import { EMAIL } from '../../constants'
import { Setlist } from './setlist'

/**
 * What sits under the performance controller: the FAQ, as a setlist and lyric
 * sheet set straight onto the section's graph paper. It is rendered between
 * `.contactDeck` and the footer on purpose: the rack's scroll animations address
 * specific children of `.contactDeck` by class, so a block added inside it would
 * sit unanimated in a moving box.
 */
export function ContactDesk() {
  return <Setlist email={EMAIL} />
}
