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

/**
 * The eject handoff is portalled to the body and driven entirely by GSAP, so
 * nothing about it is visible in the section tree above — and every selector it
 * relies on is a string, which TypeScript cannot check. Renaming a class in
 * either stylesheet silently disables the whole effect.
 *
 * This guards the two contracts that silence would break: that the proxy is
 * portalled out of the sections and exists at all, and that it is fully hidden
 * once the seam has passed rather than left parked on screen.
 */
test('eject proxy is portalled out and hidden outside the seam', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const insideSection = await page.evaluate(() => {
    const proxy = document.querySelector('[class*="ejectProxy"]')
    return proxy?.closest('section') != null
  })
  expect(
    insideSection,
    'proxy must live on the body, not inside an overflow-hidden section',
  ).toBe(false)

  const exists = await page.locator('[class*="ejectProxy"]').count()
  expect(exists, 'proxy rendered').toBeGreaterThan(0)

  // Park well past the seam: work is 6 tracks deep, so its midpoint is far
  // beyond the handoff window.
  await page.evaluate(() => {
    const work = document.querySelector('#work')
    if (work) {
      window.scrollTo(
        0,
        work.getBoundingClientRect().top + window.scrollY + 600,
      )
    }
  })
  // The seam scrubs at 0.8, so it keeps easing toward the scroll position for a
  // moment after the scroll stops. Poll until it settles rather than guessing.
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const proxy = document.querySelector<HTMLElement>(
            '[class*="ejectProxy"]',
          )
          return proxy ? Number(getComputedStyle(proxy).opacity) : 1
        }),
      { timeout: 6000, intervals: [250, 250, 500, 500, 1000] },
    )
    .toBeLessThan(0.05)
})

test('the flying cassette paints and holds its real aspect ratio', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const seam = await page.evaluate(() => {
    const work = document.querySelector('#work')
    const top = work!.getBoundingClientRect().top + window.scrollY
    return { start: top - window.innerHeight, end: top }
  })

  // A Type I shell is 100.4 x 63.8mm, and the deck's own cassette is drawn at
  // that same ratio. This is most of what makes the object read as a tape.
  const RATIO = 100.4 / 63.8

  // Two points in the crossing, so a cassette that paints once and then stalls
  // is caught as well as one that never paints at all.
  const sampleAt = async (fraction: number) => {
    await page.evaluate(
      (y) => window.scrollTo(0, y),
      seam.start + (seam.end - seam.start) * fraction,
    )
    await page.waitForTimeout(1800)

    const box = await page.evaluate(() => {
      const cass = document.querySelector<HTMLElement>(
        '[class*="ejectCassette"]',
      )
      if (!cass) return null
      const r = cass.getBoundingClientRect()
      return {
        width: r.width,
        /* offsetWidth/Height are the UNTRANSFORMED box. getBoundingClientRect
           returns the axis-aligned bounds of a rotated element, so the
           in-flight tilt inflates it and the ratio reads low — the shell is
           correct and the measurement was lying. */
        ratio: cass.offsetHeight ? cass.offsetWidth / cass.offsetHeight : 0,
      }
    })

    const withCassette = await page.screenshot({
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    })
    await page.evaluate(() => {
      document.querySelector<HTMLElement>(
        '[class*="ejectProxy"]',
      )!.style.visibility = 'hidden'
    })
    await page.waitForTimeout(350)
    const without = await page.screenshot({
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    })
    await page.evaluate(() => {
      document.querySelector<HTMLElement>(
        '[class*="ejectProxy"]',
      )!.style.visibility = ''
    })
    await page.waitForTimeout(350)

    const changed = await page.evaluate(
      async ([a, b]) => {
        const decode = async (bytes: number[]) => {
          const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' })
          const bitmap = await createImageBitmap(blob)
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(bitmap, 0, 0)
          return ctx.getImageData(0, 0, bitmap.width, bitmap.height).data
        }
        const [withP, withoutP] = await Promise.all([decode(a), decode(b)])
        let n = 0
        for (let i = 0; i < withP.length; i += 4) {
          const delta =
            Math.abs(withP[i] - withoutP[i]) +
            Math.abs(withP[i + 1] - withoutP[i + 1]) +
            Math.abs(withP[i + 2] - withoutP[i + 2])
          if (delta > 24) n++
        }
        return n
      },
      [Array.from(withCassette), Array.from(without)],
    )

    return { ...box!, changed }
  }

  const early = await sampleAt(0.2)
  const late = await sampleAt(0.6)

  // This regressed twice invisibly: once as an `opacity: 0` left over on the
  // travelling box, and once as `var(--signal-orange)` resolving to nothing
  // because the proxy is portalled outside the subtree declaring it. Geometry
  // assertions reported a healthy box in both cases.
  expect(
    early.width,
    'cassette is larger than the artwork early on',
  ).toBeGreaterThan(150)
  expect(early.changed, 'cassette paints while crossing').toBeGreaterThan(400)
  expect(late.width, 'cassette shrinks toward the artwork').toBeLessThan(
    early.width,
  )

  // The artwork is a 1:1 square, so driving width and height to meet it would
  // squash the shell by a third and turn a tape into a card. The ratio has to
  // hold at every frame, not just at rest.
  expect(
    Math.abs(early.ratio - RATIO),
    'early aspect ratio is a real shell',
  ).toBeLessThan(0.02)
  expect(
    Math.abs(late.ratio - RATIO),
    'late aspect ratio is a real shell',
  ).toBeLessThan(0.02)
})

test('the eject cassette is a clone of the deck cassette, not a copy', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const compare = await page.evaluate(() => {
    const describe = (el: Element | null) => {
      if (!el) return null
      const g = getComputedStyle(el)
      return {
        classes: Array.from(el.classList).sort().join(' '),
        borderRadius: g.borderRadius,
        aspect: g.aspectRatio,
        children: Array.from(el.children)
          .map((c) => c.className.toString())
          .sort()
          .join(','),
        label: el.querySelector('[class*="cassetteLabel"] strong')?.textContent,
      }
    }
    return {
      deck: describe(document.querySelector('[class*="cassetteActive"]')),
      clone: describe(document.querySelector('[class*="ejectCassette"]')),
    }
  })

  expect(compare.deck, 'deck cassette found').not.toBeNull()
  expect(compare.clone, 'eject clone found').not.toBeNull()

  // The shell must be the deck's own `.cassette` class, or the two are two
  // drawings that will drift apart again — which is exactly what happened when
  // the handoff had a hand-written stand-in with its own radius and label.
  expect(compare.clone!.classes).toContain(compare.deck!.classes.split(' ')[0])
  expect(compare.clone!.borderRadius).toBe(compare.deck!.borderRadius)
  expect(compare.clone!.aspect).toBe(compare.deck!.aspect)
  expect(compare.clone!.children).toBe(compare.deck!.children)

  // It is the cassette the reader was on: the deck settles on the last entry
  // before the seam opens, so the clone carries that one's identity.
  expect(compare.clone!.label).toBe('Universities & Academies')
})

test('the cassette leaves the bay flat and only tilts once clear', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const seam = await page.evaluate(() => {
    const work = document.querySelector('#work')
    const top = work!.getBoundingClientRect().top + window.scrollY
    return { start: top - window.innerHeight, end: top }
  })

  const rotationAt = async (fraction: number) => {
    await page.evaluate(
      (y) => window.scrollTo(0, y),
      seam.start + (seam.end - seam.start) * fraction,
    )
    await page.waitForTimeout(1600)
    return page.evaluate(() => {
      const c = document.querySelector<HTMLElement>('[class*="ejectCassette"]')
      if (!c) return null
      const m = new DOMMatrixReadOnly(getComputedStyle(c).transform)
      return {
        deg: (Math.atan2(m.b, m.a) * 180) / Math.PI,
        opacity: Number(
          getComputedStyle(document.querySelector('[class*="ejectProxy"]')!)
            .opacity,
        ),
      }
    })
  }

  const early = await rotationAt(0.12)
  const mid = await rotationAt(0.42)
  const late = await rotationAt(0.95)

  // Flat while it still overlaps the bay it left, so the hand-off has no jump.
  expect(early!.opacity, 'proxy is visible this early').toBeGreaterThan(0.3)
  expect(Math.abs(early!.deg), 'leaves the bay at 0deg').toBeLessThan(0.5)
  // Tilted through the crossing, and back to flat as it seats.
  expect(Math.abs(mid!.deg), 'tilts mid-flight').toBeGreaterThan(1)
  expect(Math.abs(late!.deg), 'seats flat').toBeLessThan(0.5)
})

test('every library row is drawn in the same visual language', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  // Land inside the section so the sidebar is rendered and measurable.
  await page.evaluate(() => {
    const work = document.querySelector('#work')
    window.scrollTo(0, work!.getBoundingClientRect().top + window.scrollY + 600)
  })
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

  const work = await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('#work')!
    const top = el.getBoundingClientRect().top + window.scrollY
    return { top, scrollable: el.offsetHeight - window.innerHeight }
  })

  const sizes: Array<[string, number, number]> = []
  for (let i = 0; i < 6; i++) {
    await page.evaluate(
      (y) => window.scrollTo(0, y),
      work.top + work.scrollable * ((i + 0.5) / 6),
    )
    await page.waitForTimeout(1600)
    const s = await page.evaluate(() => {
      const art = document.querySelector('[data-handoff-target]')
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

test('eject proxy never renders for reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})

  const display = await page.evaluate(() => {
    const proxy = document.querySelector<HTMLElement>('[class*="ejectProxy"]')
    return proxy ? getComputedStyle(proxy).display : 'none'
  })
  expect(display, 'proxy suppressed without scroll motion').toBe('none')

  await context.close()
})
