/**
 * Copy and geometry for the DAP hero, in one editable place.
 *
 * `SCREEN` is a fraction of the device box, and it is the single source for
 * both the CSS (it is written onto the stage as custom properties) and the
 * portal maths in the hook, so the OLED in the markup and the window the
 * portal opens from cannot drift apart.
 */

export const SCREEN = { x: 0.07, y: 0.055, w: 0.86, h: 0.7, r: 0.075 } as const

/** Device box: height as a fraction of the stage, width as a ratio of it. */
export const DEVICE = { aspect: 0.5 } as const

export const TRACK = {
  title: 'Aditya Himawan',
  artist: 'Frontend Engineer · Jakarta',
  album: 'Portfolio 2026',
  next: '02 · Profile',
} as const

export const COVER = {
  kicker: 'Frontend Engineer',
  place: 'Jakarta, Indonesia',
  line: 'Built for the moment after launch.',
  sub: 'Frontend systems for products that have to work at scale.',
} as const

/** The three side keys. They are the hero's real links. */
export const KEYS = [
  { label: 'Work', href: '#work', external: false },
  { label: 'Notes', href: '/blog', external: false },
  { label: 'Résumé', href: 'RESUME', external: true },
] as const

/**
 * One tag per layer. `z` is in "units" (1 unit = device height / 740 px) and
 * is how far the layer travels at full explode; `side` is the side its tag
 * hangs on, alternated so the labels do not stack in projection.
 */
export const LAYER_TAGS = [
  {
    id: 'glass',
    n: '01',
    title: 'Interaction',
    note: 'Gestures, motion, the first 100ms',
  },
  {
    id: 'oled',
    n: '02',
    title: 'Interface',
    note: 'React · Next.js · TypeScript',
  },
  {
    id: 'pcb',
    n: '03',
    title: 'Systems',
    note: 'Typed data, SSR, delivery',
  },
  {
    id: 'battery',
    n: '04',
    title: 'Range',
    note: 'Backend · automation · infra',
  },
  {
    id: 'back',
    n: '05',
    title: 'Origin',
    note: 'Built in Jakarta · 4+ years',
  },
] as const

export type LayerId = (typeof LAYER_TAGS)[number]['id']
