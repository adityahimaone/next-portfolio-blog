import { EMAIL } from '../../constants'
import { RESUME_URL } from '../../rack-01/shared'

/**
 * Everything the machine says that is not a copy of the photograph.
 *
 * The clone is the hardware (`riddim-geometry.ts`); this is the software. The
 * device's controls are addressed by id, derived from the geometry at render
 * time (`live-sound`, `pad-7`, `right-record`), so a control and its
 * destination are joined by one string rather than by a coordinate.
 */

export const COPY = {
  kicker: 'Frontend Engineer',
  place: 'Jakarta, Indonesia',
  /** Printed on the blank half of the fascia, as if ordered that way. */
  line: 'Built for the moment after launch.',
  sub: 'Frontend systems for products that have to work at scale.',
  hint: 'Scroll to power up',
} as const

export const SCREEN_COPY = {
  brand: 'RIDDIM',
  model: 'SUPERTONE',
  tagline: 'Original layering machine',
  status: ['RD-01', '4 LAYERS'],
  /** The hero's h1, printed by the machine rather than beside it. */
  title: 'ADITYA HIMAWAN',
  role: 'FRONTEND ENGINEER · JAKARTA, INDONESIA',
  /** What the screen prints when nothing is armed. */
  idle: { name: 'READY', note: 'Twelve pads, three caps, one machine.' },
  /** The reference's own six words, kept where it prints them. */
  words: ['SOUND', 'MAIN', 'TEMPO', 'ERASE', 'SYSTEM', 'SWING'],
  /** Printed by the console's bottom label row as the machine hands over. */
  handoff: ['NEXT', '02', 'PROFILE'],
  /** What the fullscreen plane prints under the screen, per screen. */
  hint: ['SCROLL TO POWER UP ↓', 'KEEP SCROLLING ↓'],
  /**
   * The second screen: what the key press swaps in. It is the About section's
   * own line, so the page you scroll into is the screen you were just looking
   * at.
   */
  second: {
    status: ['RD-01', 'LAYER 02'],
    title: 'PROFILE',
    role: 'MAKE THE COMPLICATED PART FEEL OBVIOUS.',
    idle: { name: 'NEXT', note: 'Keep scrolling.' },
    words: ['FOCUS', 'SYSTEMS', 'RANGE', 'SSR', 'VPS', 'SHIP'],
  },
} as const

/**
 * What stands either side of the machine while the camera is pulled back and
 * the key is pressed. Left: the pitch and the two things to do. Right: the
 * track list, which is the page's own sections, and the signal chain, which is
 * About's three tracks in one line each (kept in step by hand with
 * `ABOUT_TRACKS` in `section-about.tsx`).
 */
export const SIDE_COPY = {
  now: ['NOW PLAYING', 'NOW PLAYING'],
  playing: ['ADITYA HIMAWAN', 'PROFILE'],
  actions: [
    { label: 'See the work', href: '#work', external: false },
    { label: 'Résumé', href: RESUME_URL, external: true },
  ],
  tracks: [
    { n: '01', title: 'Aditya Himawan', note: 'Frontend engineer', href: null },
    { n: '02', title: 'Profile', note: 'How I work', href: '#about' },
    { n: '03', title: 'Work', note: 'Selected systems', href: '#work' },
    { n: '04', title: 'Contact', note: 'Say hello', href: '#contact' },
  ],
  chain: [
    {
      title: 'FOCUS',
      note: 'REACT / NEXT.JS / TYPESCRIPT',
      metric: '04+',
      label: 'YEARS IN FRONTEND',
    },
    {
      title: 'SYSTEMS',
      note: 'FEATURES / DATA / DELIVERY',
      metric: 'SSR',
      label: 'RENDERING',
    },
    {
      title: 'RANGE',
      note: 'BACKEND / AUTOMATION / INFRA',
      metric: 'VPS',
      label: 'SELF-HOSTED',
    },
  ],
} as const

export type NavEntry = {
  /** Geometry id of the control this entry wires up. */
  id: string
  /** Printed on the control, replacing the clone's word. */
  label: string
  /** Printed by the screen while the control is hovered or focused. */
  note: string
} & (
  | { kind: 'link'; href: string; external?: boolean }
  | {
      kind: 'action'
      action: 'theme-light' | 'theme-dark' | 'copy-link' | 'top'
    }
)

/**
 * The machine's controls, as navigation.
 *
 * Three tiers, because that is how the hardware is laid out: the three caps of
 * the LIVE row's top line are the primary destinations, the nine numbered pads
 * are the index, and the right-hand cap column carries the utilities that are
 * not places — the theme, the clipboard, the feed.
 *
 * The primary three repeat inside the index on purpose: on the machine they
 * are the caps you reach for without looking, and the pads are the numbered
 * map. Nine is what the pad field's numeric bank holds, so the index is
 * exactly the sitemap.
 */
export const MACHINE_NAV: readonly NavEntry[] = [
  /* ---- primary: the LIVE row's top line ---- */
  {
    kind: 'link',
    id: 'live-sound',
    label: 'WORK',
    href: '#work',
    note: 'Selected systems and case work',
  },
  {
    kind: 'link',
    id: 'live-main',
    label: 'PROFILE',
    href: '#about',
    note: 'How I work, in four years',
  },
  {
    kind: 'link',
    id: 'live-tempo',
    label: 'RÉSUMÉ',
    href: RESUME_URL,
    external: true,
    note: 'One page, PDF',
  },

  /* ---- index: the nine numbered pads, read left to right ---- */
  {
    kind: 'link',
    id: 'pad-7',
    label: 'WORK',
    href: '#work',
    note: 'Shipped frontend, at scale',
  },
  {
    kind: 'link',
    id: 'pad-8',
    label: 'PROJECTS',
    href: '/projects',
    note: 'Repositories and releases',
  },
  {
    kind: 'link',
    id: 'pad-9',
    label: 'NOTES',
    href: '/blog',
    note: 'Writing about what broke',
  },
  {
    kind: 'link',
    id: 'pad-4',
    label: 'MIXTAPE',
    href: '/music',
    note: 'What is on repeat',
  },
  {
    kind: 'link',
    id: 'pad-5',
    label: 'BOOKMARKS',
    href: '/bookmarks',
    note: 'Links worth keeping',
  },
  {
    kind: 'link',
    id: 'pad-6',
    label: 'PROFILE',
    href: '#about',
    note: 'Start with the user',
  },
  {
    kind: 'link',
    id: 'pad-1',
    label: 'CONTACT',
    href: '#contact',
    note: 'Say hello',
  },
  {
    kind: 'link',
    id: 'pad-2',
    label: 'RÉSUMÉ',
    href: RESUME_URL,
    external: true,
    note: 'One page, PDF',
  },
  {
    kind: 'link',
    id: 'pad-3',
    label: 'EMAIL',
    href: `mailto:${EMAIL}`,
    note: EMAIL,
  },

  /* ---- utilities: the places the sitemap does not cover ---- */
  {
    kind: 'link',
    id: 'right-record',
    label: 'RÉSUMÉ',
    href: RESUME_URL,
    external: true,
    note: 'Take the document with you',
  },
  {
    kind: 'link',
    id: 'right-sample',
    label: 'EMAIL',
    href: `mailto:${EMAIL}`,
    note: 'Open a message',
  },
  {
    kind: 'action',
    id: 'right-chop',
    label: 'SHARE',
    action: 'copy-link',
    note: 'Copy a link to this page',
  },
  {
    kind: 'action',
    id: 'right-timing',
    label: 'LIGHT',
    action: 'theme-light',
    note: 'Daylight studio',
  },
  {
    kind: 'action',
    id: 'right-correct',
    label: 'DARK',
    action: 'theme-dark',
    note: 'Night session',
  },
  {
    kind: 'link',
    id: 'right-fx',
    label: 'RSS',
    href: '/rss.xml',
    note: 'Subscribe to the feed',
  },
  {
    kind: 'action',
    id: 'right-erase',
    label: 'TOP',
    action: 'top',
    note: 'Back to the top of the page',
  },
] as const

export const NAV_BY_ID = new Map(MACHINE_NAV.map((entry) => [entry.id, entry]))

/** The primary three, in the order the LIVE row prints them. */
export const PRIMARY_IDS = ['live-sound', 'live-main', 'live-tempo'] as const

/**
 * The screen's top row, as navigation.
 *
 * The machine's own print — `RD-01` on the left, `4 LAYERS` on the right —
 * keeps the corners; these three sit between them. They are the destinations
 * the console does not reach without a scroll and a look: the pads carry them
 * too, but the pads are the numbered index and read as a keyboard, whereas
 * this is the one row of the screen that is always facing you. Which is the
 * point: the screen you are looking at is also the way out of it.
 *
 * Deliberately not part of `MACHINE_NAV`: that list is what the controls and
 * the phone's stack are built from, and these three already appear there.
 */
export const SCREEN_NAV: readonly NavEntry[] = [
  {
    kind: 'link',
    id: 'screen-projects',
    label: 'PROJECTS',
    href: '/projects',
    note: 'Repositories and releases',
  },
  {
    kind: 'link',
    id: 'screen-bookmarks',
    label: 'BOOKMARKS',
    href: '/bookmarks',
    note: 'Links worth keeping',
  },
  {
    kind: 'link',
    id: 'screen-blog',
    label: 'BLOG',
    href: '/blog',
    note: 'Writing about what broke',
  },
]
