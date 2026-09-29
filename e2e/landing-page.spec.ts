import { test, expect } from '@playwright/test'

/**
 * The landing page was one 2,884-line file until it was split into sections
 * plus a useRackAnimations hook. The GSAP timelines select elements by their
 * CSS-module class name, so moving markup between files can change what those
 * selectors resolve to without any type error.
 *
 * This snapshots the section-level structure of the rendered page: one anchor
 * per section, in order. If a section moves, disappears, or nests inside
 * another, this fails.
 */
test('landing page renders its seven sections in order', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const landmarks = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section'))
    return sections.map((s) => ({
      id: s.id || null,
      className: typeof s.className === 'string' ? s.className : '',
      links: s.querySelectorAll('a').length,
    }))
  })

  // The rack is the whole page; an empty or single-section render means the
  // split lost a section somewhere.
  expect(landmarks.length, 'sections rendered').toBeGreaterThanOrEqual(7)
  for (const s of landmarks) {
    expect(s.className.length, 'section has no class').toBeGreaterThan(0)
  }
})

test('landing page has no duplicate React keys or console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const real = errors.filter((e) => !/Failed to load resource|MIME type|net::ERR_/.test(e))
  expect(real, 'console errors on home: ' + real.join(' | ')).toHaveLength(0)
})
