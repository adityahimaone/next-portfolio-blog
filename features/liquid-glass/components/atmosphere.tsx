'use client'

/**
 * The light the glass sits in.
 *
 * Fixed, inert, and shared by the hero, the shelf and the reader so that moving
 * between them feels like staying in one room. Five layers, each cheap: two
 * blooms that breathe with the audio energy (via `--lg-bass` / `--lg-mid` on
 * :root), an iridescent middle, a horizon, a masked grid and grain.
 */
export function Atmosphere() {
  return (
    <div className="lg-atmosphere" aria-hidden="true">
      <div className="lg-atmosphere__bloom lg-atmosphere__bloom--key" />
      <div className="lg-atmosphere__bloom lg-atmosphere__bloom--warm" />
      <div className="lg-atmosphere__bloom lg-atmosphere__bloom--iris" />
      <div className="lg-atmosphere__horizon" />
      <div className="lg-atmosphere__grid" />
      <div className="lg-atmosphere__grain" />
      <div className="lg-atmosphere__vignette" />
    </div>
  )
}
