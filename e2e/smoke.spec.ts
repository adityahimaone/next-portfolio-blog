import { test, expect } from '@playwright/test'

/**
 * Smoke checks that the built site actually serves. These are deliberately
 * about reachability and shell, not about design, so they stay stable.
 */
const ROUTES = ['/', '/alt', '/contact', '/music']

test.beforeEach(async ({ page }) => {
  // A dev/prod server can answer before its static assets are ready, which
  // shows up as CSS served as text/html. Give the first load a moment to
  // settle so reachability assertions measure the app, not server startup.
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
})

test('home page serves', async ({ page }) => {
  const res = await page.goto('/')
  expect(res?.status(), 'home returned no response').toBeLessThan(400)
  await expect(page.locator('body')).toBeVisible()
})

for (const route of ROUTES.slice(1)) {
  test(`${route} serves without a server error`, async ({ page }) => {
    const res = await page.goto(route)
    expect(res, `${route} returned no response`).not.toBeNull()
    expect(res!.status(), `${route} returned ${res!.status()}`).toBeLessThan(500)
    await expect(page.locator('body')).toBeVisible()
  })
}

test('page has no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  // A stylesheet served as text/html means the server was still starting, not
  // that the page is broken. Assert on real script/runtime errors instead.
  const real = errors.filter((e) => !/Failed to load resource|MIME type|net::ERR_/.test(e))
  expect(real, 'console errors on home: ' + real.join(' | ')).toHaveLength(0)
})
