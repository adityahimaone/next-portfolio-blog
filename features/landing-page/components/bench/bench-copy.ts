import { ABOUT_TRACKS } from '../../rack-01/about-copy'

/**
 * What the bench is made of.
 *
 * The About's decorative layer tells one story — a set of real constraints
 * becomes a small thing, and the thing gives way to the decision behind it —
 * and every word in it is taken from the biography rather than written for the
 * decoration. That is a hard rule here, not a preference: a playful scroll
 * section whose annotations were invented would be claiming a body of work the
 * page cannot support, and the one thing a portfolio About must not do is make
 * things up about the person it describes.
 *
 * So the module derives its strings and refuses to invent any:
 *
 * - the **chips** are the technologies and the credits the About already
 *   carries, verbatim;
 * - the **principle** is the first sentence of the first track's story, cut
 *   from the copy at import time rather than retyped, so it cannot drift away
 *   from the paragraph it is quoting;
 * - the **caption** is a track's own note.
 *
 * Nothing here is a new fact about the author. If the biography changes, this
 * file changes with it and the tests that pin the derivation fail loudly.
 */

/** The first sentence of a paragraph, with its full stop. */
const firstSentence = (text: string) => {
  const end = text.indexOf('. ')
  return end === -1 ? text : text.slice(0, end + 1)
}

/**
 * The line the artifact gives way to.
 *
 * It is the opening sentence of `INTERACTION`'s story — the clearest statement
 * of a working principle the biography contains — quoted rather than
 * paraphrased so the decoration and the paragraph agree word for word.
 */
export const BENCH_PRINCIPLE = firstSentence(ABOUT_TRACKS[0].story)

/** The silkscreen line beside the artifact. A track's own note, verbatim. */
export const BENCH_CAPTION = ABOUT_TRACKS[0].note

export type BenchChip = {
  id: string
  /** Verbatim from the biography. Never a label invented for the drawing. */
  text: string
  /**
   * 0 = furthest back, 1 = closest to the reader.
   *
   * Depth does three things at once, which is what makes it worth being a
   * single number rather than three: a deeper chip scatters further from its
   * slot, is drawn larger, and is painted in front of a shallower one.
   */
  depth: number
  /** Where it docks once the constraints align, as a percentage of the stage. */
  slot: { x: number; y: number }
  /** Where it sits before it aligns, in px away from its slot. */
  home: { x: number; y: number }
  /** Degrees. The scatter's own tilt, given up as the chip docks. */
  rotate: number
  /** How late this chip joins, as a fraction of the arrival window. */
  delay?: number
}

/**
 * The constraints, in the order they arrive.
 *
 * They are laid out as a ring around the artifact rather than as a list,
 * because the story is that these are the things the thing is made of — the
 * ring is the shape of that claim. The slot positions are authored against a
 * 100×100 stage and read back by the stylesheet as percentages, so the ring
 * holds its proportions at every window size.
 */
export const BENCH_CHIPS: readonly BenchChip[] = [
  {
    id: 'next',
    text: 'Next.js',
    depth: 0.35,
    slot: { x: 30, y: 27 },
    home: { x: -140, y: -120 },
    rotate: -9,
  },
  {
    id: 'years',
    text: 'Four years in production',
    depth: 0.9,
    slot: { x: 55, y: 18 },
    home: { x: 120, y: 40 },
    rotate: 7,
    delay: 0.15,
  },
  {
    id: 'workers',
    text: 'Cloudflare Workers',
    depth: 0.75,
    slot: { x: 77, y: 28 },
    home: { x: 70, y: -100 },
    rotate: -6,
    delay: 0.3,
  },
  {
    id: 'react',
    text: 'React',
    depth: 0.55,
    slot: { x: 20, y: 45 },
    home: { x: -90, y: 110 },
    rotate: 12,
    delay: 0.1,
  },
  {
    id: 'eighty',
    text: '80&Company · Kyoto',
    depth: 0.3,
    slot: { x: 80, y: 46 },
    home: { x: 100, y: -60 },
    rotate: -11,
    delay: 0.25,
  },
  {
    id: 'typescript',
    text: 'TypeScript',
    depth: 0.7,
    slot: { x: 22, y: 63 },
    home: { x: -95, y: 80 },
    rotate: 8,
    delay: 0.2,
  },
  {
    id: 'bisadaya',
    text: 'Bisadaya · 15K users',
    depth: 0.85,
    slot: { x: 79, y: 64 },
    home: { x: 75, y: 140 },
    rotate: -7,
    delay: 0.35,
  },
  {
    id: 'niqcode',
    text: 'Niqcode · Partner',
    depth: 0.45,
    slot: { x: 33, y: 77 },
    home: { x: -95, y: 95 },
    rotate: 10,
    delay: 0.4,
  },
  {
    id: 'primarindo',
    text: 'Primarindo Asia · Jakarta',
    depth: 0.6,
    slot: { x: 62, y: 79 },
    home: { x: 40, y: 90 },
    rotate: -5,
    delay: 0.45,
  },
  {
    id: 'cache',
    text: 'R2 cache',
    depth: 0.25,
    slot: { x: 88, y: 76 },
    home: { x: 35, y: -60 },
    rotate: 9,
    delay: 0.5,
  },
] as const
