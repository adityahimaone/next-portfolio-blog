import { EXPERIENCES } from '../../constants'
import { scrollToY } from '../../lib/smooth-scroll'
import { FLIP_SCROLL_VH, ease, scrub } from '../shared/motion-tokens'
import type { ChapterCleanup, ChapterContext } from '../shared/engine'
import styles from '../../rack-01/rack-01.module.css'

/**
 * The radio swing: Experience → Work as the radio
 * turning a full 360° while it zooms to nearly the
 * whole screen, scrubbed by scroll and correct in
 * both directions.
 *
 * The scene has two layers, not one two-faced body:
 * the radio — the previous ExperienceDeck component,
 * unchanged — rides the front layer, and the Work
 * player waits on a layer BEHIND it. The swing turns
 * the radio through 360° (its back face hidden, so
 * the turn reads as a spin: edge-on, then back
 * around) while it zooms to fill the field, then the
 * radio dives behind the player, which brightens and
 * comes forward to take the stage.
 *
 * Choreography, as fractions of the one
 * `FLIP_SCROLL_VH` window (see motion-tokens):
 *
 *   0.00 – 0.25  tune      the deck advances its stations
 *   0.25 – 0.80  swing     360° of rotation with the
 *                          mechanical easing, zooming to
 *                          near-full field, then diving
 *                          behind the player
 *   0.45 – 0.90  reveal    the player behind brightens
 *                          and comes forward
 *   0.85 – 1.00  power-on  the player's glass panels
 *                          stagger in and the scanline
 *                          sweeps
 *
 * Everything is a pure function of the timeline's
 * progress, so scrolling back renders the same frame
 * at the same position — no hysteresis, no state to
 * undo.
 */

/* Phase boundaries, as fractions of the flip window. The
   tune hands straight into the swing: the dial locks on
   the last station and the radio turns. */
const TUNE_END = 0.25
const SWING_START = 0.25
const SWING_END = 0.8
const ZDIVE_START = 0.55
const REVEAL_START = 0.45
const PLAYER_FORWARD_AT = 0.6
const SWITCH_AT = 0.85
const POWER_AT = 0.85

/* The swing's geometry, in px: the radio rides in front
   of the player, turns a full circle while it zooms to
   near-full field, then dives behind the player's layer.
   The zoom is tuned so a full-size deck covers almost
   the whole viewport at the top of the turn. */
const RADIO_FRONT_Z = 140
const PLAYER_BACK_Z = -320
const RADIO_BEHIND_Z = -380
const RADIO_ZOOM = 1.35

export function radioFlip(ctx: ChapterContext): ChapterCleanup {
  const { root, gsap, ScrollTrigger, setExperienceIndex } = ctx

  /* The stage carries `data-anim="radio-stage"`: it is the
     work section's own sticky box, so the ScrollTrigger's
     `top top` fires exactly when the stage sticks. (The
     RadioStage's root sits inside the stage's padding and
     would never reach the viewport top.) */
  const stage = root.querySelector<HTMLElement>('[data-anim="radio-stage"]')
  if (!stage) return

  const scene = stage.querySelector<HTMLElement>('[data-anim="radio-scene"]')
  const front = stage.querySelector<HTMLElement>('[data-anim="radio-front"]')
  const back = stage.querySelector<HTMLElement>('[data-anim="radio-back"]')
  const fade = stage.querySelector<HTMLElement>(
    '[data-anim="radio-player-fade"]',
  )
  const shadow = stage.querySelector<HTMLElement>('[data-anim="radio-shadow"]')
  const status = stage.querySelector<HTMLElement>('[data-anim="radio-status"]')
  const scanline = back?.querySelector<HTMLElement>(
    '[data-anim="radio-scanline"]',
  )
  const shell = stage.querySelector<HTMLElement>('[data-work-shell]')
  const wheels =
    front?.querySelectorAll<HTMLElement>(`.${styles.tapeWheel}`) ?? []
  /* The player's glass panels, which stagger in as the
     player powers on. Addressed by attribute: the classes
     live in the work module and are not reachable from
     here. */
  const panels = back
    ? (
        [
          back.querySelector<HTMLElement>('[data-anim="work-sidebar"]'),
          back.querySelector<HTMLElement>('[data-anim="work-centre"]'),
          back.querySelector<HTMLElement>('[data-anim="work-artist"]'),
          back.querySelector<HTMLElement>('[data-anim="work-playerbar"]'),
        ] as Array<HTMLElement | null>
      ).filter((panel): panel is HTMLElement => !!panel)
    : []

  if (!scene || !front || !back || !fade || !shadow || !shell) {
    return
  }

  gsap.set(front, {
    rotationY: 0,
    z: RADIO_FRONT_Z,
    scale: 1,
    transformOrigin: '50% 50%',
  })
  gsap.set(back, { z: PLAYER_BACK_Z })
  gsap.set(shadow, { z: PLAYER_BACK_Z + 10, opacity: 1 })
  gsap.set(fade, { opacity: 0.2 })

  /* ── Layer switching ───────────────────────────────────

     Only the layer the visitor is looking at is
     interactive: `inert` and `aria-hidden` move with
     the swing's progress — the radio until it starts
     turning, the player once it has swung behind. The
     middle of the swing is neither: the radio is
     edge-on and the player is still coming forward,
     so both layers stay inert through the whole swing
     window. */
  let lastLayer: 'front' | 'back' = 'front'
  const setLayers = (progress: number) => {
    const showBack = progress > SWITCH_AT
    const swinging = progress >= SWING_START && progress <= SWITCH_AT
    const frontInert = swinging || showBack
    if (front.hasAttribute('inert') !== frontInert) {
      front.toggleAttribute('inert', frontInert)
    }
    if (back.hasAttribute('inert') !== !showBack) {
      back.toggleAttribute('inert', !showBack)
    }
    front.setAttribute('aria-hidden', String(showBack))
    back.setAttribute('aria-hidden', String(!showBack))
    return showBack ? 'back' : 'front'
  }

  const announce = (layer: 'front' | 'back') => {
    if (status) {
      status.textContent =
        layer === 'back' ? 'Selected work' : 'Selected experience'
    }
  }

  /* Start with the contract already true: the player
     waits inert and hidden behind the radio. */
  setLayers(0)

  const flip = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      /* The stage is held by its own `position: sticky`, so
         the timeline needs no pin — it only has to scrub
         against the scroll the stage is stuck for. */
      trigger: stage,
      start: 'top top',
      end: `+=${FLIP_SCROLL_VH}%`,
      scrub: scrub.default,
      invalidateOnRefresh: true,
      onEnter: () => {
        front.style.willChange = 'transform'
        back.style.willChange = 'transform'
      },
      onEnterBack: () => {
        front.style.willChange = 'transform'
        back.style.willChange = 'transform'
      },
      onLeave: () => {
        front.style.willChange = ''
        back.style.willChange = ''
      },
      onLeaveBack: () => {
        front.style.willChange = ''
        back.style.willChange = ''
      },
      onUpdate: (self) => {
        const layer = setLayers(self.progress)
        if (layer !== lastLayer) {
          lastLayer = layer
          announce(layer)
        }
      },
    },
  })

  /* 0.00 – 0.25 ── Tune. The deck advances its four
     stations over the first stretch of the window, exactly
     as it used to across the experience section: the wheels
     spin and the needle sweeps with the selection state the
     deck already owns. */
  flip
    .to(
      { tune: 0 },
      {
        tune: 1,
        duration: TUNE_END,
        ease: 'none',
        onUpdate: function () {
          const local = this.progress()
          const next = Math.min(
            EXPERIENCES.length - 1,
            Math.floor(local * EXPERIENCES.length),
          )
          setExperienceIndex((current) =>
            current === next ? current : next,
          )
        },
      },
      0,
    )
    .to(wheels, { rotation: 920, ease: 'none', duration: TUNE_END }, 0)

  /* 0.25 – 0.80 ── The swing. The main event: a full
     360° turn with the mechanical easing while the radio
     zooms to nearly the whole screen — then, late in the
     turn, it dives behind the player waiting behind it.
     The last quarter of the rotation happens out of
     sight, which is what leaves the player on screen. */
  flip
    .to(
      front,
      {
        rotationY: 360,
        duration: SWING_END - SWING_START,
        ease: ease.mech,
        onUpdate: () => {
          const deg = gsap.getProperty(front, 'rotationY') as number
          /* The specular sheen follows the angle. */
          scene.style.setProperty('--angle', String(deg))
          /* The ground shadow: tightest and faintest
             edge-on, widest and darkest face-on. */
          const c = Math.abs(Math.cos((deg * Math.PI) / 180))
          gsap.set(shadow, { scaleX: 0.35 + 0.65 * c })
        },
      },
      SWING_START,
    )
    /* The zoom to full field, peaking just before the
       turn completes — the radio fills the screen at the
       top of the swing, then dives away. */
    .to(
      front,
      { scale: RADIO_ZOOM, duration: 0.42, ease: 'power2.inOut' },
      SWING_START,
    )
    /* The dive: the radio passes behind the player's layer
       late in the swing. */
    .to(
      front,
      { z: RADIO_BEHIND_Z, duration: SWING_END - ZDIVE_START, ease: ease.mech },
      ZDIVE_START,
    )

  /* 0.45 – 0.90 ── Reveal. The player was a dim presence
     behind the radio from the first frame; as the swing
     carries the radio around and behind it, the player
     brightens and comes forward to take the stage. The
     ground shadow rides the player's floor and dissolves
     as it arrives — there is no floor left to stand on
     once the player is the screen. */
  flip.to(fade, { opacity: 1, duration: 1 - REVEAL_START, ease: 'none' }, REVEAL_START)
  flip.to(back, { z: 0, duration: 0.3, ease: ease.mech }, PLAYER_FORWARD_AT)
  flip.to(
    shadow,
    { z: 10, duration: 0.3, ease: ease.mech },
    PLAYER_FORWARD_AT,
  )
  flip.to(shadow, { opacity: 0, duration: 0.2, ease: 'none' }, ZDIVE_START)

  /* 0.85 – 1.00 ── Power-on. The player lights up as it
     takes the stage: the shell ramps, the glass panels
     stagger in and the scanline sweeps. */
  flip.fromTo(
    shell,
    { opacity: 0.55 },
    { opacity: 1, duration: 0.18, ease: 'none' },
    POWER_AT,
  )

  if (panels.length) {
    flip.fromTo(
      panels,
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.1,
        stagger: 0.03,
        ease: 'power2.out',
      },
      POWER_AT + 0.04,
    )
  }

  if (scanline) {
    flip
      .fromTo(
        scanline,
        { yPercent: -140, opacity: 0 },
        { yPercent: 140, opacity: 1, duration: 0.16, ease: 'none' },
        POWER_AT + 0.02,
      )
      .to(scanline, { opacity: 0, duration: 0.04, ease: 'none' }, 0.97)
  }

  /* The "See the works" link jumps to the settled player
     rather than into the middle of the swing — landing
     edge-on would put the visitor in a frame where neither
     layer is interactive. */
  const onAnchorClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    const anchor = target?.closest?.('a[href="#work"]')
    if (!anchor || !root.contains(anchor)) return
    event.preventDefault()
    const flipPixels = (FLIP_SCROLL_VH / 100) * window.innerHeight
    const top = stage.getBoundingClientRect().top + window.scrollY
    scrollToY(top + flipPixels)
    if (history.replaceState) {
      history.replaceState(null, '', '#work')
    }
  }
  root.addEventListener('click', onAnchorClick)

  return () => {
    root.removeEventListener('click', onAnchorClick)
    flip.scrollTrigger?.kill()
    flip.kill()
  }
}
