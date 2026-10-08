import { test, expect, type Page } from '@playwright/test'

/**
 * The radio swing: Experience → Work as the radio
 * turning a full 360° while it zooms to nearly the
 * whole screen, with the player waiting behind it.
 *
 * The spec reads the swing's state off the DOM rather
 * than screenshots: the radio layer's computed
 * `rotateY` is written by the swing chapter's timeline,
 * so a page.evaluate can read it at a given scroll
 * position and assert the choreography the plan calls
 * out — tune, edge-on, dive, power-on — without
 * pinning pixel baselines to a machine.
 *
 * Runs only when the swing is compiled in
 * (`NEXT_PUBLIC_RADIO_FLIP`, default on). With the flag
 * off the legacy eject seam renders instead, and
 * landing-page.spec.ts covers that path.
 */

const FLIP_ON = (process.env.E2E_RADIO_FLIP ?? '1') !== '0'

type SwingState = {
  rotationY: number
  frontScale: number
  frontInert: boolean
  backInert: boolean
  frontHidden: string | null
  backHidden: string | null
  playerOpacity: number
}

const readSwing = `(() => {
  const radio = document.querySelector('[data-anim="radio-front"]')
  if (!radio) return null
  const matrix = getComputedStyle(radio).transform
  let rotationY = 0
  let frontScale = 1
  if (matrix && matrix !== 'none') {
    const values = matrix.match(/matrix3d\\(([^)]+)\\)/)
    if (values) {
      const cells = values[1].split(',').map(Number)
      // rotateY lives in the first row: m11 = s·cos(θ), m13 = s·sin(θ)
      rotationY = Math.round(Math.atan2(-cells[8], cells[0]) * (180 / Math.PI))
      frontScale = Math.round(Math.hypot(cells[0], cells[1]) * 100) / 100
    }
  }
  const front = document.querySelector('[data-anim="radio-front"]')
  const back = document.querySelector('[data-anim="radio-back"]')
  const fade = document.querySelector('[data-anim="radio-player-fade"]')
  return {
    rotationY,
    frontScale,
    frontInert: front ? front.hasAttribute('inert') : null,
    backInert: back ? back.hasAttribute('inert') : null,
    frontHidden: front ? front.getAttribute('aria-hidden') : null,
    backHidden: back ? back.getAttribute('aria-hidden') : null,
    playerOpacity: fade ? Number.parseFloat(getComputedStyle(fade).opacity) : null,
  }
})()`

const readState = async (page: Page): Promise<SwingState | null> =>
  (await page.evaluate<SwingState | null>(readSwing)) ?? null

/** Scroll so the swing window sits at `fraction` of its 260vh range. */
const scrollSwingTo = (page: Page, fraction: number) =>
  page.evaluate(
    (f) => {
      const stage = document.querySelector('[data-anim="radio-stage"]')
      if (!stage) return
      const top = stage.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top + 260 * window.innerHeight * f)
    },
    fraction,
  )

/** Wait out the timeline's scrub (0.8) plus a frame of lenis smoothing. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 900))

test.describe('radio swing (Experience → Work)', () => {
  test.skip(FLIP_ON === false, 'radio swing is compiled out (NEXT_PUBLIC_RADIO_FLIP=0)')

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('the stage renders the radio in front of the player', async ({ page }) => {
    const stage = page.locator('[data-anim="radio-stage"]')
    await expect(stage).toBeVisible()

    // One scene, two layers, both present in the DOM from
    // the first paint — the player is behind the radio in
    // the scene's 3D space, not absent from the page.
    await expect(page.locator('[data-anim="radio-scene"]')).toBeVisible()
    await expect(page.locator('[data-anim="radio-front"]')).toBeVisible()
    await expect(page.locator('[data-anim="radio-back"]')).toBeVisible()

    // The deck rides the front layer, the player waits
    // behind it.
    await expect(
      page.locator('[data-anim="radio-front"] >> text=AH / FIELD RADIO'),
    ).toBeVisible()
    await expect(page.locator('[data-anim="radio-back"] [data-work-shell]')).toBeVisible()
  })

  test('starts on the radio with the player waiting behind', async ({ page }) => {
    const state = await readState(page)
    expect(state).not.toBeNull()
    expect(state!.rotationY).toBe(0)
    expect(state!.frontScale).toBe(1)
    // Only the layer facing the visitor is interactive and
    // exposed to AT; the player is a dim presence behind.
    expect(state!.frontInert).toBe(false)
    expect(state!.backInert).toBe(true)
    expect(state!.frontHidden).toBe('false')
    expect(state!.backHidden).toBe('true')
    expect(state!.playerOpacity).toBeLessThan(0.5)
  })

  test('swings through 360° as the page scrolls', async ({ page }) => {
    // Mid-window: the swing is under way — the radio has
    // turned past the edge-on point, so neither layer is
    // interactive: the radio is edge-on and the player is
    // still coming forward.
    await scrollSwingTo(page, 0.5)
    await settle()

    const state = await readState(page)
    expect(state).not.toBeNull()
    expect(state!.rotationY).toBeGreaterThan(90)
    expect(state!.rotationY).toBeLessThan(270)
    expect(state!.frontInert).toBe(true)
    expect(state!.backInert).toBe(true)
  })

  test('settles with the player in front at the end of the window', async ({
    page,
  }) => {
    await scrollSwingTo(page, 1.02)
    await settle()

    const state = await readState(page)
    expect(state).not.toBeNull()
    // A full turn reads as 0° in the matrix — the radio is
    // face-on again, but it has dived behind the player
    // (which is why the radio is the inert one now) after
    // zooming to near-full field (the scale it carries).
    expect(state!.rotationY).toBe(0)
    expect(state!.frontScale).toBeGreaterThan(1.2)
    expect(state!.frontInert).toBe(true)
    expect(state!.backInert).toBe(false)
    expect(state!.backHidden).toBe('false')
    expect(state!.frontHidden).toBe('true')
    expect(state!.playerOpacity).toBe(1)
  })

  test('reverse scroll returns the identical frame at the same progress', async ({
    page,
  }) => {
    // Forward to ~75% of the window, then back to ~25%, and read
    // the rotation both times. Scrubbed timelines are pure
    // functions of scroll position: the same progress must yield
    // the same rotation with no hysteresis.
    await scrollSwingTo(page, 0.75)
    await settle()
    const forward = (await readState(page))!.rotationY

    await scrollSwingTo(page, 0.25)
    await settle()
    const reverse = (await readState(page))!.rotationY

    await scrollSwingTo(page, 0.25)
    await settle()
    const again = (await readState(page))!.rotationY

    expect(forward).toBeGreaterThan(90)
    expect(reverse).toBeLessThan(90)
    // Same position, same frame — forward and back agree.
    expect(again).toBe(reverse)
  })

  test('the #work anchor jumps past the swing window', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.querySelector('[data-anim="radio-stage"]')
      if (!stage) return
      const top = stage.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top - window.innerHeight)
    })
    await settle()

    await page.click('a[href="#work"]')
    await settle()

    const state = await readState(page)
    expect(state).not.toBeNull()
    // Skip links land at swing progress 1, not mid-turn:
    // the player is the live layer.
    expect(state!.backInert).toBe(false)
    expect(state!.frontInert).toBe(true)
  })

  test('no console errors while the swing window scrolls', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    await page.evaluate(() => {
      const stage = document.querySelector('[data-anim="radio-stage"]')
      if (!stage) return
      const top = stage.getBoundingClientRect().top + window.scrollY
      // Sweep the whole window in steps, forward and back.
      for (let i = 0; i <= 10; i++) {
        window.scrollTo(0, top + ((260 * window.innerHeight * i) / 10))
      }
      for (let i = 10; i >= 0; i--) {
        window.scrollTo(0, top + ((260 * window.innerHeight * i) / 10))
      }
    })
    await new Promise((resolve) => setTimeout(resolve, 1500))

    expect(errors).toEqual([])
  })

  test('reduced motion keeps both layers as ordinary stacked sections', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload()

    // The stacked fallback (CSS media query) puts both layers in
    // normal flow: neither is inert, neither is aria-hidden, the
    // radio carries no rotation, and the player is at full
    // opacity rather than waiting dim behind the radio.
    const state = await readState(page)
    expect(state).not.toBeNull()
    expect(state!.rotationY).toBe(0)
    expect(state!.frontInert).toBe(false)
    expect(state!.backInert).toBe(false)
    expect(state!.playerOpacity).toBe(1)
  })
})
