export const WEBSITE_URL = 'https://adityahimaone.space'

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
