import { getAllPosts } from '@/features/blog'
import { WEBSITE_URL } from '@/lib/constants'

export async function GET() {
  const posts = await getAllPosts()

  const pages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/blog', changefreq: 'daily', priority: 0.9 },
    { url: '/projects', changefreq: 'monthly', priority: 0.8 },
    { url: '/music', changefreq: 'monthly', priority: 0.8 },
  ]

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
    <loc>${WEBSITE_URL}${entry.url}</loc>
    <lastmod>${'lastmod' in entry ? entry.lastmod : new Date().toISOString()}</lastmod>
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
