/**
 * Phase maths shared by the chapters.
 *
 * Every transition on the page is a pure function of scroll progress
 * — the same rule the cassette seam already followed — which is what
 * makes reverse scroll render the identical frame at the identical
 * position. These helpers keep that property visible: a chapter asks
 * for "the progress inside this window" and never re-derives it.
 */

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

export const smoothstep = (n: number) => n * n * (3 - 2 * n)

/** Progress within a phase window, smoothed at both ends. */
export const phase = (progress: number, start: number, end: number) =>
  smoothstep(clamp01((progress - start) / (end - start)))

/** Progress within a phase window, linear. */
export const phaseLinear = (progress: number, start: number, end: number) =>
  clamp01((progress - start) / (end - start))

/**
 * Remap a section's whole scroll range onto the part of it that comes
 * after `startAt` — the fraction of the range the flip window
 * occupies. The work section's tracks begin after the flip, so the
 * track maths sees a 0–1 range that starts where the radio settles.
 */
export const remapAfter = (progress: number, startAt: number) => {
  const span = 1 - startAt
  if (span <= 1e-6) return progress < startAt ? 0 : 1
  return clamp01((progress - startAt) / span)
}
