import { test, expect } from '@playwright/test'

/**
 * Verifies the two contact-deck changes against a real browser.
 *
 * The padding assertion exists because the compiled CSS ships
 * `padding:14px0` with no space. CSS tokenisation separates a dimension from a
 * following digit, so this is valid and computes to 14px/0 — but "valid CSS"
 * is a claim about a spec, and only the engine settles it.
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

test('accordion trigger computes real padding, not 14px0', async ({ page }) => {
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

  // Computed values, not the declared text: the minifier ships `14px0`, and
  // whether that is 14px/0 or a parse error is exactly what this settles.
  expect(padding.top).toBe('14px')
  expect(padding.bottom).toBe('14px')
  expect(padding.left).toBe('0px')

  // 28px of padding plus a single line of the question type.
  const textHeight = await trigger
    .locator('[class*="contactBriefAccordionQuestion"]')
    .first()
    .evaluate((el) => el.getBoundingClientRect().height)
  expect(box!.height).toBeGreaterThan(28 + textHeight - 2)
})

test('accordion ink is dark on the cream band', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  const trigger = page
    .locator('button[class*="contactBriefAccordionTrigger"]')
    .first()
  await trigger.scrollIntoViewIfNeeded()

  const ink = await trigger.evaluate((el) => {
    const s = getComputedStyle(el)
    return { color: s.color, family: s.fontFamily }
  })
  // --panel-ink is #101211, near-black. The old hardcoded #f1eee5 was light
  // ink on a cream field, which is the whole reason this was invisible.
  const [r, g, b] = ink.color.match(/\d+/g)!.map(Number)
  expect(r + g + b).toBeLessThan(200)
  expect(ink.family).toContain('Space Grotesk')
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
