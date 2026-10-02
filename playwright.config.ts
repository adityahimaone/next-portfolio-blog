import { defineConfig, devices } from '@playwright/test'

/**
 * Browser smoke suite, run from the kanban board's e2e trigger.
 * The board passes --project=chromium, so the project name here must match.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Starts the server only when nothing healthy is already serving the port,
  // which is what stops the EADDRINUSE failure. `npm run start` is the
  // standalone server (next.config.mjs sets output: 'standalone'), so this
  // needs `pnpm build` to have run first -- same as it did when this pointed at
  // `next start`.
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
