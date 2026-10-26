import { PALETTE, PRINCIPLES } from '@/features/landing-page/studio/studio-data'

export const SYSTEM = {
  name: 'Sunnyside',
  otherNames: ['Stickerbook', 'Paper Sun', 'Looseleaf'],
  tagline: 'The design system behind Side A.',
  version: 'v1.0',
  year: '2026',
  author: 'Aditya Himawan',
  email: 'adityahimaone@gmail.com',
} as const

export const SECTIONS = [
  { id: 'foundation', number: '01', label: 'Foundation' },
  { id: 'marks', number: '02', label: 'Marks' },
  { id: 'colour', number: '03', label: 'Colour' },
  { id: 'type', number: '04', label: 'Type' },
  { id: 'parts', number: '05', label: 'Parts' },
  { id: 'motion', number: '06', label: 'Motion' },
  { id: 'voice', number: '07', label: 'Voice' },
  { id: 'applications', number: '08', label: 'Applications' },
  { id: 'tokens', number: '09', label: 'Tokens' },
] as const

export type ColorToken = {
  name: string
  token: string
  hex: string
  rgb: string
  role: string
  use: string
  tone: 'light' | 'dark'
  accent?: boolean
}

export const COLORS: readonly ColorToken[] = [
  {
    name: 'Paper',
    token: '--paper',
    hex: PALETTE.paper,
    rgb: '243, 236, 223',
    role: 'Ground',
    use: 'The page, the frame, the room. It should be the first thing a visitor trusts.',
    tone: 'light',
  },
  {
    name: 'Paper Hi',
    token: '--paper-hi',
    hex: PALETTE.paperHi,
    rgb: '255, 250, 241',
    role: 'Sheet',
    use: 'Raised paper: cards, sticker sheets, the preloader. Slightly whiter than the ground.',
    tone: 'light',
  },
  {
    name: 'Paper Lo',
    token: '--paper-lo',
    hex: PALETTE.paperLo,
    rgb: '233, 223, 207',
    role: 'Underlay',
    use: 'Empty media wells, quiet fills, the shadow beneath a sheet.',
    tone: 'light',
  },
  {
    name: 'Ink',
    token: '--ink',
    hex: PALETTE.ink,
    rgb: '25, 26, 46',
    role: 'Text',
    use: 'Body copy, outlines, hard shadows. Not pure black; it has a little violet in it.',
    tone: 'dark',
  },
  {
    name: 'Muted',
    token: '--muted',
    hex: PALETTE.muted,
    rgb: '95, 91, 110',
    role: 'Secondary',
    use: 'Captions, dates, quiet labels. Never the only place a fact lives.',
    tone: 'dark',
  },
  {
    name: 'Cobalt',
    token: '--cobalt',
    hex: PALETTE.cobalt,
    rgb: '61, 83, 214',
    role: 'Loud field',
    use: 'One per page. The work shelf, the footer, the boot. If everything is cobalt, nothing is.',
    tone: 'dark',
    accent: true,
  },
  {
    name: 'Cobalt Ink',
    token: '--cobalt-ink',
    hex: PALETTE.cobaltInk,
    rgb: '44, 60, 174',
    role: 'Deep field',
    use: 'Hover and pressed states on cobalt, and the rare section that needs to go darker.',
    tone: 'dark',
    accent: true,
  },
  {
    name: 'Cobalt Wash',
    token: '--cobalt-wash',
    hex: PALETTE.cobaltWash,
    rgb: '232, 235, 255',
    role: 'Tint',
    use: 'Selected rows, quiet panels, a lap of blue under a light card.',
    tone: 'light',
  },
  {
    name: 'Tangerine',
    token: '--tangerine',
    hex: PALETTE.tangerine,
    rgb: '255, 106, 43',
    role: 'Accent',
    use: 'Annotations, progress, one CTA. Large type and marks only, not body copy.',
    tone: 'light',
    accent: true,
  },
  {
    name: 'Butter',
    token: '--butter',
    hex: PALETTE.butter,
    rgb: '255, 210, 63',
    role: 'Accent',
    use: 'Tape, sun, focus rings, one headline wash. The warmest thing on the page.',
    tone: 'light',
    accent: true,
  },
  {
    name: 'Pink',
    token: '--pink',
    hex: PALETTE.pink,
    rgb: '255, 182, 225',
    role: 'Accent',
    use: 'Stickers, notes, the softer side of a warning. Never for destructive actions.',
    tone: 'light',
    accent: true,
  },
  {
    name: 'Mint',
    token: '--mint',
    hex: PALETTE.mint,
    rgb: '183, 228, 199',
    role: 'Accent',
    use: 'Open status, healthy states, generated sleeves that need a second temperature.',
    tone: 'light',
    accent: true,
  },
  {
    name: 'Sky',
    token: '--sky',
    hex: PALETTE.sky,
    rgb: '169, 200, 255',
    role: 'Accent',
    use: 'A cool note. The system works without it; use it when cobalt needs a lighter sibling.',
    tone: 'light',
    accent: true,
  },
]

export const CONTRAST_PAIRS = [
  {
    text: 'Ink on Paper',
    fg: PALETTE.ink,
    bg: PALETTE.paper,
    ratio: '14.55',
    grade: 'AAA',
  },
  {
    text: 'Cream on Cobalt',
    fg: PALETTE.paperHi,
    bg: PALETTE.cobalt,
    ratio: '5.93',
    grade: 'AA',
  },
  {
    text: 'Muted on Paper',
    fg: PALETTE.muted,
    bg: PALETTE.paper,
    ratio: '5.57',
    grade: 'AA',
  },
  {
    text: 'Ink on Butter',
    fg: PALETTE.ink,
    bg: PALETTE.butter,
    ratio: '11.84',
    grade: 'AAA',
  },
  {
    text: 'Ink on Pink',
    fg: PALETTE.ink,
    bg: PALETTE.pink,
    ratio: '10.61',
    grade: 'AAA',
  },
  {
    text: 'Cream on Cobalt Ink',
    fg: PALETTE.paperHi,
    bg: PALETTE.cobaltInk,
    ratio: '8.54',
    grade: 'AAA',
  },
  {
    text: 'Butter on Cobalt',
    fg: PALETTE.butter,
    bg: PALETTE.cobalt,
    ratio: '4.27',
    grade: 'Large only',
  },
  {
    text: 'Tangerine on Paper',
    fg: PALETTE.tangerine,
    bg: PALETTE.paper,
    ratio: '2.43',
    grade: 'Decorative',
  },
] as const

export const TYPE_VOICES = [
  {
    key: 'display',
    name: 'Syne',
    role: 'Display',
    sample: 'Interfaces with a pulse.',
    note: 'Wide, a little odd, hard to ignore. Use it for the one thing you want remembered. Sentence case. Negative tracking. Never for paragraphs.',
    spec: '800 · tracking -0.045em · leading 0.9',
  },
  {
    key: 'reading',
    name: 'Geist',
    role: 'Reading',
    sample:
      'A design engineer builds the interface and the structure behind it. The browser is where the decisions happen.',
    note: 'The voice you actually read. Set it at 65–70 characters, 1.6–1.7 leading. Weight 400 and 500 are enough; 600 is a highlight.',
    spec: '400 / 500 · 16px / 1.7 · max 68ch',
  },
  {
    key: 'label',
    name: 'Geist Mono',
    role: 'Label',
    sample: '03 / SELECTED WORK · JAKARTA, GMT+7 · 2026',
    note: 'A ruler, not a headline. Uppercase at 8–11px with 0.14–0.2em tracking. It should read like the annotation on a print, not like code.',
    spec: '500 · 9–11px · tracking 0.16em',
  },
  {
    key: 'hand',
    name: 'The marker',
    role: 'Annotation',
    sample: 'hello!',
    note: 'A single-stroke script drawn in code. Use it for a welcome, a section aside or the studio name. If a sentence is longer than three words, it belongs in Geist.',
    spec: 'inline SVG · 3.3 stroke · 9° lean',
  },
] as const

export const TYPE_SCALE = [
  {
    token: 'display-xl',
    size: '76',
    line: '0.88',
    tracking: '-0.058em',
    face: 'Syne 800',
    use: 'Hero statement',
  },
  {
    token: 'display-l',
    size: '62',
    line: '0.94',
    tracking: '-0.045em',
    face: 'Syne 800',
    use: 'Section opener',
  },
  {
    token: 'title-l',
    size: '46',
    line: '0.98',
    tracking: '-0.045em',
    face: 'Syne 800',
    use: 'Project title',
  },
  {
    token: 'title-s',
    size: '24',
    line: '1.05',
    tracking: '-0.035em',
    face: 'Syne 750',
    use: 'Card title',
  },
  {
    token: 'body',
    size: '16',
    line: '1.7',
    tracking: '0',
    face: 'Geist 400',
    use: 'Reading',
  },
  {
    token: 'body-s',
    size: '14',
    line: '1.6',
    tracking: '0',
    face: 'Geist 400',
    use: 'Card copy',
  },
  {
    token: 'label',
    size: '10',
    line: '1.2',
    tracking: '0.16em',
    face: 'Geist Mono 500',
    use: 'Section labels',
  },
  {
    token: 'micro',
    size: '8.5',
    line: '1.2',
    tracking: '0.14em',
    face: 'Geist Mono 500',
    use: 'Codes, captions',
  },
] as const

export const MOTION_TOKENS = [
  {
    token: '--fast',
    value: '160ms',
    ease: 'cubic-bezier(.22,1,.36,1)',
    use: 'Press and release feedback',
  },
  {
    token: '--ui',
    value: '220ms',
    ease: 'cubic-bezier(.22,1,.36,1)',
    use: 'Hover, chips, links',
  },
  {
    token: '--enter',
    value: '700ms',
    ease: 'cubic-bezier(.22,1,.36,1)',
    use: 'Reveal on scroll',
  },
  {
    token: '--peel',
    value: '650ms',
    ease: 'cubic-bezier(.7,0,.2,1)',
    use: 'Boot sheet leaving',
  },
  {
    token: '--slap',
    value: '620ms',
    ease: 'cubic-bezier(.3,1.5,.4,1)',
    use: 'Sticker landing',
  },
  {
    token: '--marquee',
    value: '30s',
    ease: 'linear',
    use: 'The one infinite loop',
  },
] as const

export const VOICE_PAIRS = [
  {
    no: 'Elevate your digital experience.',
    yes: 'Make the next screen easier to use.',
  },
  { no: 'A seamless, next-gen workflow.', yes: 'One board. No second tab.' },
  { no: 'Unleash your creative potential.', yes: 'Start with the messy part.' },
  {
    no: 'Oops! Something went wrong.',
    yes: 'The save didn’t go through. Try again.',
  },
] as const

export const VOICE_NOTES = [
  'Write like a person who has used the thing. If a sentence could sit on any portfolio, cut it.',
  'Specific beats clever. Name the screen, the constraint or the number.',
  'Funny is a garnish. Never make the reader work out what a button does.',
  'Microcopy is interface. “Copied, talk soon” is a better button than “Success”.',
] as const

export const RULES = PRINCIPLES

export const TOKEN_CSS = `:root {
  /* colour */
  --paper: ${PALETTE.paper};
  --paper-hi: ${PALETTE.paperHi};
  --paper-lo: ${PALETTE.paperLo};
  --ink: ${PALETTE.ink};
  --muted: ${PALETTE.muted};
  --line: rgba(25, 26, 46, 0.16);
  --cobalt: ${PALETTE.cobalt};
  --cobalt-ink: ${PALETTE.cobaltInk};
  --cobalt-wash: ${PALETTE.cobaltWash};
  --tangerine: ${PALETTE.tangerine};
  --butter: ${PALETTE.butter};
  --pink: ${PALETTE.pink};
  --mint: ${PALETTE.mint};
  --sky: ${PALETTE.sky};

  /* type */
  --display: var(--font-syne), system-ui, sans-serif;
  --ui: var(--font-geist), system-ui, sans-serif;
  --mono: var(--font-geist-mono), ui-monospace, monospace;

  /* semantic */
  --surface-page: var(--paper);
  --surface-sheet: var(--paper-hi);
  --surface-quiet: var(--paper-lo);
  --surface-loud: var(--cobalt);
  --text-primary: var(--ink);
  --text-secondary: var(--muted);
  --text-on-loud: var(--paper-hi);
  --border-strong: var(--ink);
  --border-quiet: var(--line);
  --accent-mark: var(--tangerine);
  --accent-tape: var(--butter);
  --accent-soft: var(--pink);
  --accent-ok: var(--mint);

  /* component */
  --button-bg: var(--surface-loud);
  --button-ink: var(--text-on-loud);
  --button-radius: var(--radius-pill);
  --card-bg: var(--surface-sheet);
  --card-media-ratio: 16 / 10;
  --card-border: 1.5px solid var(--border-strong);
  --focus-ring: 0 0 0 3px var(--accent-tape);

  /* shape */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-pill: 999px;
  --border: 2px solid var(--ink);
  --shadow-paper: 9px 10px 0 rgb(25 26 46 / 0.13);
  --shadow-lift: 12px 16px 0 rgb(25 26 46 / 0.15);

  /* motion */
  --fast: 160ms;
  --ui: 220ms;
  --enter: 700ms;
  --peel: 650ms;
  --slap: 620ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-sheet: cubic-bezier(0.7, 0, 0.2, 1);
  --ease-slap: cubic-bezier(0.3, 1.5, 0.4, 1);
}
`

export const TOKEN_JSON = {
  name: 'Sunnyside',
  version: '1.0',
  color: {
    paper: PALETTE.paper,
    paperHi: PALETTE.paperHi,
    paperLo: PALETTE.paperLo,
    ink: PALETTE.ink,
    muted: PALETTE.muted,
    cobalt: PALETTE.cobalt,
    cobaltInk: PALETTE.cobaltInk,
    cobaltWash: PALETTE.cobaltWash,
    tangerine: PALETTE.tangerine,
    butter: PALETTE.butter,
    pink: PALETTE.pink,
    mint: PALETTE.mint,
    sky: PALETTE.sky,
  },
  semantic: {
    surfacePage: 'var(--paper)',
    surfaceSheet: 'var(--paper-hi)',
    surfaceLoud: 'var(--cobalt)',
    textPrimary: 'var(--ink)',
    textSecondary: 'var(--muted)',
    accentMark: 'var(--tangerine)',
    accentTape: 'var(--butter)',
  },
  component: {
    buttonBg: 'var(--surface-loud)',
    buttonInk: 'var(--text-on-loud)',
    cardMediaRatio: '16 / 10',
    focusRing: '0 0 0 3px var(--accent-tape)',
  },
  type: {
    display: 'Syne',
    ui: 'Geist',
    mono: 'Geist Mono',
    hand: 'Sunnyside marker script',
  },
  radius: { xs: 4, sm: 8, md: 14, lg: 20, xl: 28, pill: 999 },
  motion: {
    easeOut: 'cubic-bezier(0.22,1,0.36,1)',
    easeSheet: 'cubic-bezier(0.7,0,0.2,1)',
    easeSlap: 'cubic-bezier(0.3,1.5,0.4,1)',
  },
} as const
