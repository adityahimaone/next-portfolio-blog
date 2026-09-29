/**
 * The device wall is a hand-authored rack layout, not a row-major grid: device
 * 9 sits in row 5 while device 7 sits in row 6. Both the power-on loop in
 * `DawHero` and the GSAP intro stagger in `rack-01` need the tiles in visual
 * order, so the order is measured once here and shared.
 */

/**
 * Device indices in left-to-right, row-by-row order, derived from the `sm:`
 * placements in `daw-hero.tsx`. Used before the wall can be measured (first
 * paint, prerender) and as a fallback if layout is unavailable.
 *
 *   row 1  dap 0 · keys 1 · mixer 2 · fx 3
 *   row 3  jog 4 · sampler 5 · synth 6
 *   row 5  tape 9
 *   row 6  monitor 7 · meter 10 · cassette 11
 *   row 7  sequencer 8
 */
export const BOOT_ORDER_FALLBACK: readonly number[] = [
  0, 1, 2, 3, 4, 5, 6, 9, 7, 10, 11, 8,
]

/**
 * Sorts tile indices by their position on screen: rows top to bottom, and
 * left to right within a row.
 *
 * A grid row's tiles all resolve to the same `top`, so exact keys band them
 * correctly without a tolerance that would risk merging two nearby rows.
 * Falls back to the input order when the elements have not been laid out yet,
 * which keeps the caller from having to special-case an unmeasured wall.
 */
export function heroSweepIndices(
  tiles: ReadonlyArray<HTMLElement>,
  fallback: readonly number[] = BOOT_ORDER_FALLBACK,
): number[] {
  if (tiles.length === 0) return [...fallback]

  const rows = new Map<number, number[]>()
  tiles.forEach((tile, index) => {
    const top = tile.getBoundingClientRect().top
    const row = rows.get(top)
    if (row) row.push(index)
    else rows.set(top, [index])
  })

  const order: number[] = []
  for (const [, row] of [...rows.entries()].sort((a, b) => a[0] - b[0])) {
    row.sort(
      (a, b) =>
        tiles[a].getBoundingClientRect().left -
        tiles[b].getBoundingClientRect().left,
    )
    order.push(...row)
  }

  // Zero-sized boxes mean layout has not run yet; sorting those would produce
  // an arbitrary rather than a meaningful order.
  return order.length === tiles.length ? order : [...fallback]
}
