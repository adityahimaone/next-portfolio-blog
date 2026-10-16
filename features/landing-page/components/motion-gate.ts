/**
 * The media queries every scroll-driven scene on the landing page gates on.
 *
 * Both sides of each scene read the same string: the hook that activates the
 * motion (`matchMedia`) and the stylesheet that only turns the static
 * composition into a sticky layer inside the matching query. They have to
 * agree, or a viewport that fails the query gets the layout of a scene that
 * never animates.
 *
 * There is a third reader now — `GlassDevice`. A canvas that has taken over
 * from the CSS solid cannot be posed by a hook that never ran, so it must not
 * take over at all unless the scene's own query matches. See the `gate` prop.
 */

/**
 * The About's chapters and the stage above them. `use-bench-motion.ts` and
 * `bench.module.css` both read this.
 */
export const BENCH_QUERY =
  '(min-width: 769px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)'

/**
 * The About-to-Skills bridge. Taller-tolerant than the bench because the
 * bridge is a shorter scene. `use-skills-bridge.ts` and
 * `skills-bridge.module.css` both read this.
 */
export const BRIDGE_QUERY =
  '(min-width: 769px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)'
