import {
  FAQ_ITEMS,
  TRACKS,
  type FaqEntry,
  type Track,
} from '../contact-desk/contact-content'

/**
 * The FAQ as a field of three orbits.
 *
 * The questions themselves still live in `contact-desk/contact-content.ts`:
 * this module only adds the spatial vocabulary — one colour and one wireframe
 * primitive per track — so the cluster, the filters and the WebGL backdrop all
 * read from the same source and cannot drift apart.
 */

export type Filter = Track | 'All'

export type Shape = 'neutral' | 'icosahedron' | 'torus' | 'octahedron'

export type TrackMeta = {
  label: string
  /** The category signal. Used for the dot, the wireframe and the dock. */
  color: string
  /** Ink that clears 4.5:1 on top of `color`. */
  ink: string
  shape: Shape
  /** The node numbers this orbit owns, as printed on the filter. */
  span: string
}

export const TRACK_META: Record<Track, TrackMeta> = {
  Scope: {
    label: 'Scope',
    color: '#10b981',
    ink: '#04251b',
    shape: 'icosahedron',
    span: '01—03',
  },
  Process: {
    label: 'Process',
    color: '#3b82f6',
    ink: '#04162f',
    shape: 'torus',
    span: '04—06',
  },
  Practical: {
    label: 'Practical',
    color: '#f59e0b',
    ink: '#2a1802',
    shape: 'octahedron',
    span: '07—09',
  },
}

export const TRACK_ORDER = TRACKS

export const FILTERS: readonly Filter[] = ['All', ...TRACKS]

/** `01`–`09`, the number printed on a node and in the dock. */
export const nodeNumber = (index: number) => String(index + 1).padStart(2, '0')

export function countFor(filter: Filter): number {
  return filter === 'All'
    ? FAQ_ITEMS.length
    : FAQ_ITEMS.filter((item) => item.track === filter).length
}

export function metaFor(filter: Filter): TrackMeta | null {
  return filter === 'All' ? null : TRACK_META[filter]
}

/**
 * What the background primitive should be doing.
 *
 * A filter picks its own orbit. Opening a single question overrides it with
 * that question's orbit, so selecting a node morphs the field even when the
 * filter is still set to All.
 */
export function shapeFor(filter: Filter, active: number | null): Shape {
  if (active !== null) {
    const item = FAQ_ITEMS[active]
    return item ? TRACK_META[item.track].shape : 'neutral'
  }
  return metaFor(filter)?.shape ?? 'neutral'
}

export function accentFor(filter: Filter, active: number | null): string {
  if (active !== null) {
    const item = FAQ_ITEMS[active]
    if (item) return TRACK_META[item.track].color
  }
  return metaFor(filter)?.color ?? '#ff5a1f'
}

export function accentInkFor(filter: Filter, active: number | null): string {
  if (active !== null) {
    const item = FAQ_ITEMS[active]
    if (item) return TRACK_META[item.track].ink
  }
  return metaFor(filter)?.ink ?? '#1d0e02'
}

/** The item behind a number, or `null` for a hash that is not ours. */
export function itemAt(index: number): FaqEntry | null {
  return FAQ_ITEMS[index] ?? null
}

export function indexOfId(id: string): number {
  return FAQ_ITEMS.findIndex((item) => item.id === id)
}
