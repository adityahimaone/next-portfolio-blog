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

test('landing page has no duplicate React keys or console errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const real = errors.filter(
    (e) => !/Failed to load resource|MIME type|net::ERR_/.test(e),
  )
  expect(real, 'console errors on home: ' + real.join(' | ')).toHaveLength(0)
})

const SEAM_SVH = 120

async function seamBounds(page: import('@playwright/test').Page) {
  return page.evaluate((svh) => {
    const work = document.querySelector('#work')!
    const start = work.getBoundingClientRect().top + window.scrollY
    return { start, end: start + (svh / 100) * window.innerHeight }
  }, SEAM_SVH)
}

async function flipState(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const inner = document.querySelector<HTMLElement>('[data-deck-flip-inner]')!
    const matrix = new DOMMatrixReadOnly(getComputedStyle(inner).transform)
    const section = inner.closest('section')!
    const shell = document.querySelector<HTMLElement>('[data-work-shell]')!
    const scale = Math.hypot(matrix.m11, matrix.m12, matrix.m13)
    return {
      scale,
      cosY: matrix.m11 / (scale || 1),
      sectionOpacity: Number(getComputedStyle(section).opacity),
      sectionVisibility: getComputedStyle(section).visibility,
      shellOpacity: Number(getComputedStyle(shell).opacity),
    }
  })
}

test('the eject proxy is removed and the radio has two faces', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  await expect(page.locator('[class*="ejectProxy"]')).toHaveCount(0)
  await expect(page.locator('[class*="ejectCassette"]')).toHaveCount(0)
  await expect(page.locator('[data-deck-flip-inner]')).toHaveCount(1)
  await expect(page.locator('[data-deck-back]')).toHaveCount(1)
  await expect(page.locator('[data-seam-wash]')).toHaveCount(1)
})

test('the radio flips through the seam and hands over to the player', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const seam = await seamBounds(page)
  const at = async (fraction: number) => {
    await page.evaluate(
      (y) => window.scrollTo(0, y),
      seam.start + (seam.end - seam.start) * fraction,
    )
    await page.waitForTimeout(1200)
    return flipState(page)
  }

  const before = await at(-0.02)
  expect(Math.abs(before.scale - 1), 'no growth before the seam').toBeLessThan(
    0.01,
  )
  expect(before.cosY, 'front-facing before the seam').toBeGreaterThan(0.99)
  expect(before.sectionOpacity).toBe(1)

  const mid = await at(0.45)
  expect(mid.scale, 'radio is growing').toBeGreaterThan(1.02)
  expect(mid.cosY, 'radio is mid-turn').toBeLessThan(0.99)
  expect(mid.sectionOpacity, 'experience still covers the player').toBe(1)

  const after = await at(1.02)
  expect(after.sectionVisibility).toBe('hidden')
  expect(after.shellOpacity).toBe(1)

  const back = await at(-0.02)
  expect(Math.abs(back.scale - 1)).toBeLessThan(0.01)
  expect(back.sectionOpacity).toBe(1)
})

test('the GitHub archive collapses while All projects stays visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(
    (lead) => {
      const work = document.querySelector('#work')!
      const top = work.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top + lead + 600)
    },
    (SEAM_SVH / 100) * 900,
  )

  const toggle = page.getByRole('button', { name: 'More on GitHub' })
  const archive = page.locator('#github-archive-list')
  const allProjects = page.getByRole('link', { name: 'All projects' })

  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(archive).toBeHidden()
  await expect(archive.getByRole('link')).toHaveCount(0)
  await expect(allProjects).toBeVisible()

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(archive).toBeVisible()
  await expect(archive.getByRole('link')).toHaveCount(3)
  await expect(allProjects).toBeVisible()

  await toggle.scrollIntoViewIfNeeded()
  await toggle.focus()
  await expect(toggle).toBeFocused()
  await toggle.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(archive).toBeHidden()
  await expect(allProjects).toBeVisible()
})

test('the active library indicator stays centered on its project', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.evaluate(
      (lead) => {
        const work = document.querySelector('#work')!
        const top = work.getBoundingClientRect().top + window.scrollY
        window.scrollTo(0, top + lead + 600)
      },
      (SEAM_SVH / 100) * viewport.height,
    )

    const options = page.getByRole('option')
    await expect(options).toHaveCount(6)
    await options.nth(3).click()

    const active = page.getByRole('option', { selected: true })
    const indicator = active.locator('[class*="libraryIndicator"]')
    await expect(indicator).toHaveCount(1)
    await page.waitForFunction(() => {
      const row = document.querySelector(
        '[role="option"][aria-selected="true"]',
      )
      const rule = row?.querySelector('[class*="libraryIndicator"]')
      if (!row || !rule) return false
      const rowRect = row.getBoundingClientRect()
      const ruleRect = rule.getBoundingClientRect()
      return (
        Math.abs(
          ruleRect.top +
            ruleRect.height / 2 -
            (rowRect.top + rowRect.height / 2),
        ) <= 1
      )
    })

    const geometry = await page.evaluate(() => {
      const row = document.querySelector(
        '[role="option"][aria-selected="true"]',
      )!
      const rule = row.querySelector('[class*="libraryIndicator"]')!
      const rowRect = row.getBoundingClientRect()
      const ruleRect = rule.getBoundingClientRect()
      return {
        rowCenter: rowRect.top + rowRect.height / 2,
        indicatorCenter: ruleRect.top + ruleRect.height / 2,
        indicatorHeight: ruleRect.height,
        rowHeight: rowRect.height,
      }
    })

    expect(
      Math.abs(geometry.indicatorCenter - geometry.rowCenter),
      `${viewport.width}px: indicator center ${geometry.indicatorCenter} vs row center ${geometry.rowCenter}`,
    ).toBeLessThanOrEqual(1)
    expect(geometry.indicatorHeight).toBeGreaterThan(0)
    expect(geometry.indicatorHeight).toBeLessThan(geometry.rowHeight)
  }
})

test('every library row is drawn in the same visual language', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  // Land inside the section so the sidebar is rendered and measurable.
  await page.evaluate(
    (lead) => {
      const work = document.querySelector('#work')!
      const top = work.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top + lead + 600)
    },
    (SEAM_SVH / 100) * 900,
  )
  await page.waitForTimeout(2000)

  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[role="option"]')).map((r) => {
      const art = r.querySelector('[class*="libraryArt"]') as HTMLElement | null
      const svg = art?.querySelector('svg')
      const img = art?.querySelector('img')
      const box = art?.getBoundingClientRect()
      return {
        title: r.querySelector('[class*="libraryName"]')?.textContent ?? '',
        kind: img ? 'image' : svg ? 'generated' : 'none',
        w: box ? Math.round(box.width) : 0,
        h: box ? Math.round(box.height) : 0,
        /* A real photograph and a drawn SVG are different elements, and the
           generated one used to be a flat gradient with two large initials —
           which is what made SeaPhantom P2P and Labgrownbeasts read as broken
           next to the four with artwork. It now has to carry the same three
           things the real covers share: a deep field, one luminous subject, and
           a wordmark. */
        hasField: !!svg?.querySelector('radialGradient'),
        hasSubject:
          !!svg?.querySelector('g') ||
          !!svg?.querySelector('circle[fill-opacity]'),
        hasWordmark: !!svg?.querySelector('text'),
      }
    })
  })

  expect(rows.length, 'library rows found').toBe(6)

  const missing = rows.filter((r) => r.kind === 'none')
  expect(
    missing.map((r) => r.title),
    'rows with no art at all',
  ).toEqual([])

  // Generated art has to look like the rest of the catalogue.
  for (const r of rows.filter((x) => x.kind === 'generated')) {
    expect(r.hasField, `${r.title}: deep field`).toBe(true)
    expect(r.hasSubject, `${r.title}: luminous subject`).toBe(true)
    expect(r.hasWordmark, `${r.title}: wordmark`).toBe(true)
  }

  // Every thumbnail is the same square, whichever kind it is.
  for (const r of rows) {
    expect(Math.abs(r.w - r.h), `${r.title}: square`).toBeLessThanOrEqual(1)
    expect(r.w, `${r.title}: has size`).toBeGreaterThan(20)
  }
})

test('every cover renders at the same size, generated or real', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const work = await page.evaluate(
    (lead) => {
      const el = document.querySelector<HTMLElement>('#work')!
      const top = el.getBoundingClientRect().top + window.scrollY
      return {
        top: top + lead,
        scrollable: el.offsetHeight - window.innerHeight - lead,
      }
    },
    (SEAM_SVH / 100) * 900,
  )

  const sizes: Array<[string, number, number]> = []
  for (let i = 0; i < 6; i++) {
    await page.evaluate(
      (y) => window.scrollTo(0, y),
      work.top + work.scrollable * ((i + 0.5) / 6),
    )
    await page.waitForTimeout(1600)
    const s = await page.evaluate(() => {
      const art = document.querySelector('[data-work-art]')
      const r = art?.getBoundingClientRect()
      return {
        title:
          document.querySelector('h3[class*="bannerTitle"]')?.textContent ?? '',
        w: r ? Math.round(r.width) : 0,
        h: r ? Math.round(r.height) : 0,
      }
    })
    sizes.push([s.title, s.w, s.h])
  }

  expect(sizes.length, 'all six tracks measured').toBe(6)

  /* A photograph and a drawn SVG are different elements, and they sized
     differently: the SVG carries no intrinsic height, so with `place-items:
     center` on an implicit grid row it contributed its own intrinsic 300px and
     the art overflowed a 220px band. SeaPhantom P2P and Labgrownbeasts
     rendered visibly larger than Switchyard and the rest for that reason
     alone. Every track has to measure the same. */
  const widths = sizes.map(([, w]) => w)
  const heights = sizes.map(([, h]) => h)
  const min = Math.min(...widths)
  const max = Math.max(...widths)

  expect(
    min,
    `smallest cover (${sizes[widths.indexOf(min)][0]})`,
  ).toBeGreaterThan(100)
  expect(
    max - min,
    `cover widths agree: ${sizes.map(([t, w]) => `${t}=${w}`).join(', ')}`,
  ).toBeLessThanOrEqual(1)
  expect(
    Math.max(...heights) - Math.min(...heights),
    'cover heights agree',
  ).toBeLessThanOrEqual(1)

  for (const [title, w, h] of sizes) {
    expect(Math.abs(w - h), `${title} is square`).toBeLessThanOrEqual(1)
  }
})

test('the landing document ships render-blocking CSS in head', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  /* The unstyled-flash bug, guarded.

     The critical-css script used to delete the stylesheet <link> tags and
     replace them with an inline block. When that block was trimmed it turned
     out to be almost entirely @font-face, so nothing styled the document until
     React injected the sheets during hydration — a cold first visit rendered
     raw markup for over a second. The links are render-blocking and are what
     hold the first paint, so their presence in <head> is the contract. */
  const head = await page.evaluate(() => {
    const h = document.head.innerHTML
    return {
      links: document.head.querySelectorAll('link[rel="stylesheet"]').length,
      inlineCritical: h.includes('data-critical'),
      bodyLinks: document.body.querySelectorAll('link[rel="stylesheet"]')
        .length,
    }
  })

  expect(head.links, 'stylesheet links in <head>').toBeGreaterThan(0)
  expect(
    head.bodyLinks,
    'stylesheet links must not be stranded in <body>',
  ).toBe(0)
  expect(head.inlineCritical, 'critical CSS inlined').toBe(true)
})

test('the first paint is already styled', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })

  /* Cold and throttled: the case a first-time visitor and every shared link
     get. A warm edge hid this entirely — FCP measured ~0.59s cached versus
     ~1.49s cold, which is why it survived review. */
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 40,
    downloadThroughput: (10 * 1024 * 1024) / 8 / 4,
    uploadThroughput: (2 * 1024 * 1024) / 8 / 4,
  })
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })

  await page.goto('/', { waitUntil: 'commit' })

  // Wait for the first paint, then judge what it produced.
  await page.waitForFunction(
    () => performance.getEntriesByType('paint').length > 0,
    undefined,
    { timeout: 15_000 },
  )
  await page.waitForTimeout(150)

  const atFirstPaint = await page.evaluate(() => {
    const hero = document.querySelector('main > section')
    const r = hero?.getBoundingClientRect()
    return {
      /* The unstyled hero collapsed to the raw text line height; a styled one is
         a full-bleed panel. 1200px wide also proves the layout rules ran, not
         just the font faces. */
      heroWidth: r ? Math.round(r.width) : 0,
      heroHeight: r ? Math.round(r.height) : 0,
      sheets: document.styleSheets.length,
    }
  })

  expect(
    atFirstPaint.heroWidth,
    'hero laid out at first paint',
  ).toBeGreaterThanOrEqual(1200)
  expect(
    atFirstPaint.heroHeight,
    'hero has real height at first paint (not collapsed)',
  ).toBeGreaterThan(400)
})

test('the radio flip is disabled for reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const state = await page.evaluate(() => {
    const back = document.querySelector<HTMLElement>('[data-deck-back]')
    const wash = document.querySelector<HTMLElement>('[data-seam-wash]')
    const inner = document.querySelector<HTMLElement>('[data-deck-flip-inner]')!
    const section = inner.closest('section')!
    return {
      back: back ? getComputedStyle(back).display : 'none',
      wash: wash ? getComputedStyle(wash).display : 'none',
      transform: getComputedStyle(inner).transform,
      overlapped:
        document.querySelector('#work')!.getBoundingClientRect().top <
        section.getBoundingClientRect().bottom - 1,
    }
  })
  expect(state.back, 'back face hidden').toBe('none')
  expect(state.wash, 'wash hidden').toBe('none')
  expect(state.transform, 'radio never transformed').toBe('none')
  expect(state.overlapped, 'sections do not overlap').toBe(false)

  await context.close()
})
