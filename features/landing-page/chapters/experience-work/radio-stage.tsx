'use client'

import styles from './radio.module.css'

/**
 * The radio swing: one pinned stage, one 3D scene,
 * two layers.
 *
 * The front layer is the Experience deck and the
 * layer behind it is the Work player — both passed in
 * as nodes by the work section, which owns their
 * state. The deck is the previous deck component,
 * unchanged; the scene around it is new. Everything
 * else in here is the physical world around the two:
 * the player's floor and the ground shadow that
 * follows the radio's angle.
 *
 * The scene is CSS 3D, not WebGL, so the player
 * behind the radio keeps every button, list and ARIA
 * role it has as a standalone section. The swing
 * itself — the scrubbed 360° `rotateY` with the zoom
 * and the dive behind the player — is driven by
 * `radioFlip`, which queries this stage through its
 * `data-anim` attributes. The `radio-stage` marker
 * itself lives on the work section's sticky box one
 * level up: that is the element the ScrollTrigger
 * pins to, so `top top` fires the moment it sticks.
 */

export function RadioStage({
  front,
  back,
}: {
  front: React.ReactNode
  back: React.ReactNode
}) {
  return (
    <div className={styles.radioStage}>
      <div className={styles.flipScene} data-anim="radio-scene">
        {/* The player, waiting behind the radio. */}
        <div className={styles.playerLayer} data-anim="radio-back">
          <div
            className={styles.playerFade}
            data-anim="radio-player-fade"
          >
            {back}
            <div
              className={styles.radioScanline}
              data-anim="radio-scanline"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* The radio: the deck on the front layer. */}
        <div className={styles.radioLayer} data-anim="radio-front">
          {front}
          <div
            className={styles.radioGlassHighlight}
            data-anim="radio-glass"
            aria-hidden="true"
          />
        </div>

        <div
          className={styles.groundShadow}
          data-anim="radio-shadow"
          aria-hidden="true"
        />
      </div>
      <span
        className={styles.radioStatus}
        data-anim="radio-status"
        role="status"
        aria-live="polite"
      />
    </div>
  )
}
