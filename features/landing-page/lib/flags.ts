/**
 * Build-time feature flags for the landing page's motion redesign.
 *
 * Each phase ships behind a flag so production keeps rendering the
 * layout it was built and tested on while the next one is tuned. The
 * defaults are ON — the flag exists to roll back, not to hide — and
 * setting it to `0` restores the previous layout exactly, which is
 * also how the e2e suite exercises both paths.
 */
export const RADIO_FLIP_ENABLED =
  (process.env.NEXT_PUBLIC_RADIO_FLIP ?? '1') !== '0'
