import { RESUME_URL } from './shared'

/**
 * The About copy, on its own.
 *
 * It lives here rather than beside the component that first rendered it because
 * it is now read by two things that must never disagree: the section's own
 * markup and the Patch's derived data. A component file is the wrong home for a
 * dataset another feature imports — the import would drag the component, and
 * everything it imports, into the data's module graph, and a rewrite of the
 * component would look like it was allowed to change the data.
 *
 * No fact here is new. The titles are the channels the work actually runs in,
 * and the stories, credits and the availability line are the ones the About
 * section has carried all along.
 */

export type AboutCredit = {
  name: string
  note: string
}

export type AboutTrack = {
  title: string
  heading: string
  note: string
  story: string
  credits?: readonly AboutCredit[]
  aside?: string
  resumeLink?: string
}

export const ABOUT_TRACKS: readonly AboutTrack[] = [
  {
    title: 'INTERACTION',
    heading: 'Start with the user.',
    note: 'REACT / NEXT.JS / TYPESCRIPT',
    story:
      'I begin with the interaction, not the component, because the component is the cheap part to get right. Four years of production frontends, most of them React and Next.js on systems where the interface is load-bearing rather than decorative.',
    credits: [
      { name: 'Bisadaya', note: 'Job platform · 15K users' },
      { name: '80&Company', note: 'HR management · Kyoto' },
    ],
  },
  {
    title: 'SYSTEMS',
    heading: 'Build the system.',
    note: 'FEATURES / DATA / DELIVERY',
    story:
      'I use React, Next.js, and TypeScript to create reusable structures that keep new features consistent. Typed data at the boundary and rendering chosen per route make the next six months cheaper to change.',
    credits: [
      { name: 'Primarindo Asia', note: 'Manufacturing · Jakarta' },
      { name: 'Niqcode', note: 'Product studio · Partner' },
    ],
  },
  {
    title: 'PRODUCTION',
    heading: 'Stay close to production.',
    note: 'BACKEND / AUTOMATION / INFRA',
    story:
      'I work across application data, deployment and monitoring when the frontend needs more than a polished screen. This site runs on Cloudflare Workers via OpenNext with an R2 cache, which is why the writing here is about what broke.',
    aside:
      'Based in Jakarta. Available for frontend, design engineering and hard interface work.',
    resumeLink: RESUME_URL,
  },
]
