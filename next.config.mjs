import withBundleAnalyzerInit from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.gifer.com' },
      { protocol: 'https', hostname: 'images.ctfassets.net' },
      { protocol: 'https', hostname: 'camo.githubusercontent.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
    // AVIF alongside the default WebP. Covers and the one site-wide noise
    // texture are the largest images served, so they take the biggest win here.
    formats: ['image/avif', 'image/webp'],
    // The default 60s revalidates a stable asset on every crawl. Nothing here
    // is content-hashed by query string, so a week is safe.
    minimumCacheTTL: 604800,
  },
  // Legacy paths from before the App Router rewrite, plus the four routes whose
  // content was folded back into the sections that already existed.
  //
  // `/about` and `/work` now live in the landing profile deck and in the
  // projects filter; `/contact` is the landing page's contact section, whose id
  // is `contact`; `/guides` is listed on the blog index. The routes themselves
  // still exist so these have something to point at, but nothing in the app
  // links to them any more.
  //
  // Every one of these is `permanent`, including the anchor destinations: the
  // content is not coming back at these addresses, and an external link or a
  // bookmark should land on the content rather than a 404.
  async redirects() {
    return [
      { source: '/spotify', destination: '/music', permanent: true },
      { source: '/v2', destination: '/', permanent: true },
      // One hop, not a chain: /contact used to answer on a trailing slash and
      // Next would 308 that to the clean path.
      { source: '/contact/', destination: '/contact', permanent: true },
      // Folded content.
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/work', destination: '/projects', permanent: true },
      { source: '/contact', destination: '/#contact', permanent: true },
      { source: '/guides', destination: '/blog', permanent: true },
    ]
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // The other three security headers were here; HSTS was not, so a
            // first visit negotiated plain HTTP before being redirected.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

// Only apply bundle analyzer when ANALYZE=true. This keeps it out of the
// normal build path rather than measuring a plugin that is not measuring.
export default process.env.ANALYZE === 'true'
  ? withBundleAnalyzerInit({ enabled: true })(nextConfig)
  : nextConfig
