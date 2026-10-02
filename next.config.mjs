import withBundleAnalyzerInit from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Run the server from a traced bundle in .next/standalone instead of from the
  // full node_modules. `next start` reads most of node_modules at boot; the
  // standalone bundle is only what the server actually touches, which is a
  // large cut in resident memory on a 1.9GB host. ecosystem.config.js points
  // PM2 at .next/standalone/server.js for this reason -- `next start` refuses to
  // work with this setting.
  //
  // Disabled: the site now deploys to Cloudflare Workers via OpenNext, and the
  // adapter builds its own worker bundle. `output: 'standalone'` also made
  // `next start` and the PM2 target mutually incompatible, which is what left
  // PM2 crash-looping on a stale config. Set CF_DEPLOY=1 if the VPS copy needs
  // to be rebuilt for rollback.
  ...(process.env.CF_DEPLOY === '1' ? { output: 'standalone' } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion'],
    // Build-time only, nothing here reaches the running server. The host has
    // 1.9GB total and builds run on it during deploy, so the defaults -- one
    // worker per core, and static generation fanned out across them -- drove
    // peak RSS high enough to swap. Pinning both trades build wall-clock for a
    // build that fits. Measured knobs, not guesses: raise `cpus` first if the
    // build gets slow, and only drop `staticGenerationMaxConcurrency` below 4
    // if generation is what peaks rather than compilation.
    cpus: 1,
    staticGenerationMaxConcurrency: 2,
  },
  images: {
    // The /_next/image optimizer needs a long-lived Node process with sharp,
    // which Workers do not have. Serving the source file directly is the
    // documented OpenNext approach; format/TTL settings below no longer apply
    // and the source images are already WebP.
    unoptimized: true,
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
    // WebP only, no AVIF. AVIF saves maybe 20% on file size but costs several
    // times the encode CPU and transient memory per image, paid inside the
    // request that triggers the optimization. That tradeoff is backwards on
    // this host: covers and the site-wide noise texture are the largest images
    // served, and they were what drove optimizer spikes. Every browser in the
    // project's browserslist decodes WebP.
    formats: ['image/webp'],
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
