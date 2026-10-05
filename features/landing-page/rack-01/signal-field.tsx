'use client'

import styles from './signal-field.module.css'

/**
 * SignalField — the light in the room across the device wall.
 *
 * The hero's ground was a flat near-black and the devices lit themselves, so
 * the wall behind them stayed dead while the foreground moved. This gives that
 * ground something to be. It is built from the same recipe as the work
 * section's AmbientBackdrop and the booth's Room — a wash, a grain tile, a
 * vignette — but keyed to what the hero is actually about rather than to a
 * palette. Those two are lit by a colour they are handed; this one is lit by a
 * *signal*:
 *
 *  - A slow band travelling up the wall on a long period, so the loop never
 *    reads as a loop. It holds at the top rather than snapping back, so the
 *    wall is not lit uniformly.
 *  - A second, much slower and offset drift underneath, for the same reason.
 *    One loop at a readable period draws attention to itself; two disagreeing
 *    ones read as weather.
 *
 * Two decisions are load-bearing, and both came out of what it looked like
 * when it was wrong the first time.
 *
 * It sits *above* the device wall, not behind it. Behind was the first
 * instinct and it rendered nothing: DawHero's panels are opaque and tile the
 * whole stage, so a layer behind them at z-0 is completely hidden. Above them,
 * at z-1 — under the backdrop name and the content — it can actually be seen.
 *
 * And every lit layer blends with `screen`, not normal. That is what makes it
 * safe to put in front of twelve glass panels. Screen only ever brightens, so
 * the light lands in the dark gaps between the devices and along their upper
 * edges while the panels themselves, the white display type and the orange
 * wordmark all stay exactly as they were. A normal-blended wash at the same
 * opacity would fog the whole rack and cost the device detail that is the
 * point of the section.
 *
 * Cost is the other design brief, and it took measuring to get right. Animated
 * properties are transform and opacity only, so the layer stays on the
 * compositor and never triggers layout or paint — but that alone was not
 * enough. Each blended layer forces the whole device wall behind it to be
 * re-read and re-composited, and four of them measured 26fps against 60 with
 * them removed on an otherwise idle page. They are now painted into a single
 * blended group, which costs one blend instead of four and holds 60.
 *
 * The band is deliberately over-tall rather than softly faded, because a tall
 * element with a hard gradient edge can travel in a way a soft one cannot — it
 * slides behind the vignette, and the vignette is what hides the travel.
 *
 * The pointer-following highlight that used to live here is not duplicated:
 * `.heroAtmosphere` already tracks the cursor and already sits under the name,
 * so a second one would just be two lights fighting.
 */

export function SignalField() {
  return (
    <div className={styles.signalField} aria-hidden="true">
      <div className={styles.fieldLight}>
        <div className={styles.fieldDrift} />
        <div className={styles.fieldBand} />
        <div className={styles.fieldGrain} />
      </div>
    </div>
  )
}
