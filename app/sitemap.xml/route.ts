import { getAllPosts } from '@/features/blog'
import { WEBSITE_URL } from '@/lib/constants'

export async function GET() {
  const posts = await getAllPosts()

  // The date the newest post was written. Used as the `lastmod` for the
  // section indexes that are not otherwise datable.
  //
  // These pages previously fell back to `new Date().toISOString()`, which
  // reported "changed just now" on every single request — so /projects looked
  // permanently fresh to a crawler even though its content is a hand-edited
  // list that has not moved in weeks. A lastmod that always says "now" is
  // worse than no lastmod at all: it trains crawlers to ignore the field.
  const lastPostDate = posts[0]?.date
  const fallbackLastmod = lastPostDate ?? undefined

  const pages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/blog', changefreq: 'daily', priority: 0.9 },
    { url: '/projects', changefreq: 'monthly', priority: 0.8 },
    { url: '/bookmarks', changefreq: 'weekly', priority: 0.8 },
    { url: '/music', changefreq: 'monthly', priority: 0.8 },
    // /contact is a real page a visitor can reach from the footer, so it
    // belongs in the sitemap. It was missing while every other route was here.
    { url: '/contact', changefreq: 'monthly', priority: 0.6 },
  ].map((page) => ({ ...page, lastmod: fallbackLastmod }))

  const blogEntries = posts.map((post: { slug: string; date: string }) => ({
    url: `/blog/${post.slug}`,
    lastmod: post.date,
    changefreq: 'monthly',
    priority: 0.7,
  }))

  const allUrls = [...pages, ...blogEntries]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (entry) => `
  <url>
    <loc>${WEBSITE_URL}${entry.url}</loc>${
      'lastmod' in entry && entry.lastmod
        ? `\n    <lastmod>${entry.lastmod}</lastmod>`
        : ''
    }
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
