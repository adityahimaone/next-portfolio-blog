/**
 * Values shared between two sections of the rack.
 *
 * The hero and the contact panel both link out to the CV, and the footer
 * tangle at the bottom of Contact carries the same lines the hero quotes, so
 * these live here rather than in whichever file happened to define them
 * first.
 */

/** Google Drive link to the CV, used by the hero and the contact panel. */
export const RESUME_URL =
  'https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing'

/** The struts the footer tangle is drawn from. */
export const FOOTER_TANGLE_LINES = [
  'React / Next.js / TypeScript',
  'Frontend systems for products people use',
  'Product UI, app data, and delivery',
  'Frontend engineer, Jakarta',
  'See the work, then start a conversation',
] as const

export const FOOTER_MOTTO = 'Make it work, then make it sing.'

/**
 * Shell and label colours for the four cassette entries in the experience
 * strip, ordered to match EXPERIENCES.
 */
export const CASSETTE_THEMES = [
  {
    shell: '#d8d1c5',
    shellDeep: '#aaa094',
    label: '#d9895b',
    ink: '#25231f',
    accent: '#7b2735',
  },
  {
    shell: '#b9c7c8',
    shellDeep: '#7f9498',
    label: '#d9c36e',
    ink: '#18292c',
    accent: '#315f68',
  },
  {
    shell: '#c8bfd2',
    shellDeep: '#8e819b',
    label: '#8c769f',
    ink: '#211a26',
    accent: '#523467',
  },
  {
    shell: '#d7c59d',
    shellDeep: '#a78d5b',
    label: '#e36d3f',
    ink: '#30271b',
    accent: '#7d4027',
  },
] as const
