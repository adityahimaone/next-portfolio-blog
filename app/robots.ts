import type { MetadataRoute } from 'next'
import { WEBSITE_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // `/private/` was disallowed here but no such route has ever existed, so
      // the rule did nothing except make the file look deliberate. Replaced with
      // the paths that are genuinely not destinations:
      //   /api/            — JSON and an OAuth callback, never a page to index
      //   /ui              — a component playground (also `noindex` in its metadata)
      //   /spotify-setup   — a one-time OAuth form; a client component, so it
      //                      cannot export metadata and inherits the home title
      disallow: ['/api/', '/ui', '/spotify-setup'],
    },
    sitemap: `${WEBSITE_URL}/sitemap.xml`,
  }
}
