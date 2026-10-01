import { getAllPosts } from '@/features/blog'
import { WORK_PROJECTS } from '@/data/projects'
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
    {
      url: '/guides/self-hosting-nextjs',
      changefreq: 'monthly',
      priority: 0.8,
    },
    { url: '/guides/vps-vs-vercel', changefreq: 'monthly', priority: 0.7 },
    { url: '/bookmarks', changefreq: 'weekly', priority: 0.8 },
    { url: '/music', changefreq: 'monthly', priority: 0.8 },
    // /contact, /about, /work and /guides are absent on purpose. Their content
    // was folded into the landing profile deck, the landing contact section,
    // the projects filter and the blog index, and those routes now redirect.
    // Listing them would submit a sitemap of permanent redirects.
  ].map((page) => ({ ...page, lastmod: fallbackLastmod }))

  const blogEntries = posts.map(
    (post: { slug: string; date: string; dateModified?: string }) => ({
      url: `/blog/${post.slug}`,
      // The post's own last change, falling back to its publish date. Echoing
      // `date` unconditionally was indistinguishable from omitting the field.
      lastmod: post.dateModified ?? post.date,
      changefreq: 'monthly',
      priority: 0.7,
    }),
  )

  const projectEntries = WORK_PROJECTS.map((project) => ({
    url: `/projects/${project.slug}`,
    // No per-project lastmod exists — the data file is hand-curated and a
    // project entry changes when the project does, not on a schedule. Omitting
    // the field is more honest than stamping every one with the newest post's
    // date, which is what the index pages do.
    changefreq: 'yearly',
    priority: 0.7,
  }))

  const allUrls = [...pages, ...blogEntries, ...projectEntries]

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
