import { test, expect } from '@playwright/test'

/**
 * Verifies the two contact-deck changes against a real browser.
 *
 * The padding assertion exists because the compiled CSS ships
 * `padding:18px26px` with no space. CSS tokenisation separates a dimension from
 * a following digit, so this is valid and computes to 18px/26px — but "valid
 * CSS" is a claim about a spec, and only the engine settles it.
 */
test('the X pad is gone and sixteen pads fill four clean rows', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' })

  const labels = await page
    .locator('[class*="contactPad"] > strong')
    .allTextContents()
  expect(labels).toHaveLength(16)
  expect(labels).not.toContain('X')

  // Four-column grid, sixteen pads, so the rows close exactly. A stray
  // seventeenth would leave a one-pad orphan on a fifth row.
  const grid = await page
    .locator('[class*="contactPadGrid"], [class*="contactPads"]')
    .first()
    .evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
    )
  expect(grid).toBe(4)
})

test('accordion trigger computes real padding, not 18px0', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  const trigger = page
    .locator('button[class*="contactBriefAccordionTrigger"]')
    .first()
  await trigger.scrollIntoViewIfNeeded()

  const box = await trigger.boundingBox()
  const padding = await trigger.evaluate((el) => {
    const s = getComputedStyle(el)
    return { top: s.paddingTop, bottom: s.paddingBottom, left: s.paddingLeft }
  })

  // Computed values, not the declared text: the minifier ships `18px0`, and
  // whether that is 18px/0 or a parse error is exactly what this settles.
  // 26px inline is the card's inset, and the one the corner screws clear.
  expect(padding.top).toBe('18px')
  expect(padding.bottom).toBe('18px')
  expect(padding.left).toBe('26px')

  // Two 18px paddings plus the number cell, which is taller than a line of the
  // question type and is therefore what sets the row's height.
  const cell = await trigger
    .locator('[class*="contactBriefAccordionIndex"]')
    .first()
    .evaluate((el) => el.getBoundingClientRect().height)
  expect(box!.height).toBeGreaterThan(36 + cell - 2)
})

/**
 * Contrast, not a colour sum. The collapsed question is deliberately the muted
 * ink — it is the resting state, and it is the only thing the reader sees when
 * every row is shut, so the assertion that matters is that it clears 4.5:1
 * against the card it sits on. A sum-of-channels threshold passed the old
 * near-black and would have passed a mid grey that failed this.
 */
test('collapsed question ink clears 4.5:1 on the card', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  const trigger = page
    .locator('button[class*="contactBriefAccordionTrigger"]')
    .nth(1)
  await trigger.scrollIntoViewIfNeeded()

  const { ink, ground, family } = await trigger.evaluate((el) => {
    const panel = el.closest('[class*="contactBriefPanel"]')!
    return {
      ink: getComputedStyle(el).color,
      ground: getComputedStyle(panel).backgroundColor,
      family: getComputedStyle(el).fontFamily,
    }
  })

  const channels = (value: string) => value.match(/[\d.]+/g)!.map(Number)
  const luminance = (value: string) => {
    const [r, g, b] = channels(value)
      .slice(0, 3)
      .map((channel) => {
        const c = channel / 255
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [light, dark] = [luminance(ink), luminance(ground)].sort(
    (a, b) => b - a,
  )
  expect((light + 0.05) / (dark + 0.05)).toBeGreaterThanOrEqual(4.5)
  expect(family).toContain('Syne')
})

test('the head strip counts the questions it actually renders', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  const count = page.locator('[class*="contactBriefCount"]')
  await count.scrollIntoViewIfNeeded()

  const rows = await page
    .locator('button[class*="contactBriefAccordionTrigger"]')
    .count()
  // The label is silkscreen — machine-printed data — so it has to stay true to
  // the list under it rather than be a decorative number.
  expect((await count.textContent())!.trim()).toBe(
    `${String(rows).padStart(2, '0')} entries`,
  )
})

test('accordion opens and closes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  const triggers = page.locator('button[class*="contactBriefAccordionTrigger"]')
  const first = triggers.nth(0)
  const second = triggers.nth(1)

  // defaultValue="0" means item 1 starts open.
  await expect(first).toHaveAttribute('aria-expanded', 'true')
  await expect(second).toHaveAttribute('aria-expanded', 'false')

  await second.click()
  // type="single" + collapsible: opening one closes the other.
  await expect(second).toHaveAttribute('aria-expanded', 'true')
  await expect(first).toHaveAttribute('aria-expanded', 'false')
})
