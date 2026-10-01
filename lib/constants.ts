/**
 * Runtime configuration that changes how the site is addressed and measured.
 *
 * `WEBSITE_URL` is the single source of truth for the canonical origin. It was
 * previously hardcoded in three places — here, in `app/layout.tsx`'s
 * `metadataBase`, and again in `app/rss.xml/route.ts` — so a domain change
 * meant finding all three and hoping none was missed. Everything that needs an
 * absolute URL imports this; nothing else spells it out.
 *
 * Staging and preview builds served production canonicals before this existed.
 * `SITE_URL` overrides the default for those, and — importantly — an unset
 * override does not make a preview look canonical, so it must be set explicitly
 * when deploying somewhere that should not claim the production domain.
 */
export const WEBSITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adityahimaone.space'
).replace(/\/$/, '')

/**
 * Stable article image for structured data.
 *
 * The per-post `opengraph-image.tsx` cannot be used here. Next serves it from a
 * build-hashed path — `/blog/<slug>/opengraph-image-1uzpct?137a6282` — and the
 * hash changes with every build, so any URL written into JSON-LD would go stale
 * and start 404ing on the next deploy.
 *
 * A post frontmatter `cover` still wins when one is set; this is the fallback
 * that guarantees every post carries an `image` property, which is what Article
 * rich results require.
 */
export const DEFAULT_ARTICLE_IMAGE = `${WEBSITE_URL}/cover.jpg`

/**
 * GA4 measurement ID, e.g. `G-XXXXXXXXXX`.
 *
 * Unset by default, and `app/layout.tsx` renders no analytics script at all in
 * that case — an empty id would otherwise ship a `gtag.js` request that loads a
 * tracker which can never report anything.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * Google Search Console `google-site-verification` token.
 *
 * Emitted as a `<meta name="google-site-verification">` in the root layout when
 * set. Separate from GA: Search Console is the property that answers "is this
 * page indexed", which is the question most of docs/seo-audit.md depends on and
 * cannot currently be answered.
 */
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION
