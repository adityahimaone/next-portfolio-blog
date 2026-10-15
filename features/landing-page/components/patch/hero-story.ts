import { ARRANGEMENT_BARS, RULER_LABELS } from '../arrangement/arrangement-data'

/**
 * The hero's story line: one caption per ruler stage, shown while the playhead
 * is inside that stage.
 *
 * COMPOSE, CONNECT and SHIP reuse the three headings About already has, so the
 * hero says them first and the Patch says them again with the evidence. DISCOVER
 * and DEFINE have no copy on the page. They are `null` until the owner writes
 * them: a placeholder that ships is worse than a stage with no caption.
 */
export const STAGE_CAPTIONS: Record<
  (typeof RULER_LABELS)[number],
  string | null
> = {
  DISCOVER: null,
  DEFINE: null,
  COMPOSE: 'Start with the user.',
  CONNECT: 'Build the system.',
  SHIP: 'Stay close to production.',
}

/**
 * The stage the playhead is in, from its fraction of the world (0..1). Stage `i`
 * starts at `i / (stages - 1)`, which is where the ruler prints its tick.
 */
export function stageAt(worldFraction: number): number {
  const last = RULER_LABELS.length - 1
  const f = Math.min(1, Math.max(0, worldFraction))
  return Math.min(last, Math.floor(f * last + 1e-9))
}

/** The playhead's bar, matching the toolbar's `floor(bars) + 1`. */
export const barAt = (worldFraction: number) =>
  Math.floor(Math.min(1, Math.max(0, worldFraction)) * ARRANGEMENT_BARS) + 1
