import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'

export default defineCloudflareConfig({
  // ISR pages (the blog index, the GitHub repo list) and `unstable_cache` for
  // blog posts need somewhere to persist their revalidated output. R2 is bound
  // as NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc.
  incrementalCache: r2IncrementalCache,
})