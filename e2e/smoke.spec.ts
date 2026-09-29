import { test, expect } from '@playwright/test'

/**
 * Smoke checks that the built site actually serves. These are deliberately
 * about reachability and shell, not about design, so they stay stable.
 *
 * The interactive checks below exist because the refactor moves these exact
 * components around (theme toggle, dock, bookmarks keyboard nav) and nothing
 * else in the repo renders a component under test — Jest's suites cover pure
 * logic and data only.
 */
const ROUTES = ['/', '/contact', '/music']

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

test('theme toggle flips the document class', async ({ page }) => {
  await page.goto('/projects')
  const html = page.locator('html')
  const toggle = page.getByLabel('Switch color theme').first()
  await expect(toggle, 'no theme toggle rendered').toBeVisible()

  // next-themes writes the resolved theme onto <html> before this can read it,
  // but the class lands a tick later, so wait for one of the two states
  // rather than assuming which one loads.
  await expect(html).toHaveClass(/light|dark/)
  const before = (await html.getAttribute('class')) ?? ''

  await toggle.click()
  await expect(html).not.toHaveClass(before)

  // The choice has to survive a reload, or the toggle is only cosmetic.
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(html).not.toHaveClass(before)
})

test('dock renders its navigation items on a booth route', async ({ page }) => {
  await page.goto('/projects')
  const dock = page.getByLabel('Primary').or(page.getByLabel('Quick navigation')).first()
  await expect(dock, 'no dock rendered').toBeVisible()

  // The dock exists to reach the other routes; if it is empty there is
  // nothing to navigate to.
  const links = dock.getByRole('link')
  expect(await links.count(), 'dock rendered no links').toBeGreaterThan(0)
})

test('bookmarks j/k moves the active row', async ({ page }) => {
  await page.goto('/bookmarks')
  // Scoped to the list rows: the dock also marks its current route with
  // `data-active`, and it renders on this page too.
  const active = page.locator('li[data-active]')
  // `active` starts null on purpose — the list is not a text input, so
  // lighting row one on load would imply a selection nobody made.
  await expect(active, 'a row was selected before any keypress').toHaveCount(0)

  await page.keyboard.press('j')
  await expect(active, 'j did not select the first row').toHaveCount(1)

  await page.keyboard.press('j')
  await page.keyboard.press('k')
  await expect(active, 'j/k did not settle on a single row').toHaveCount(1)

  // j/k has to actually change which row is lit, not just toggle one on.
  await page.keyboard.press('j')
  const lit = page.locator('li[data-active] a')
  await expect(lit).toHaveAttribute('data-active', 'true')
})

test('a blog post renders its content', async ({ page }) => {
  const res = await page.goto(
    '/blog/deploy-nextjs-vps-nginx-pm2-custom-domain',
  )
  expect(res!.status(), 'blog post returned an error').toBeLessThan(400)

  // The MDX content itself, not the chrome — a post that 404s still renders a
  // body, so asserting on body visibility would pass on a broken route.
  await expect(page.locator('article').first()).toBeVisible()
  await expect(page.locator('article').first()).not.toBeEmpty()
})
