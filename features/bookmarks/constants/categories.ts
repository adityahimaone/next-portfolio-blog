import type { BookmarkCategory } from '../types'

/**
 * Channel order. The six hand-written channels lead, then designeer's groups in
 * the order that site presents them. `views/bookmarks-page.tsx` already filters
 * this down to the channels that actually hold rows, so an empty channel costs
 * nothing to list here.
 */
export const BOOKMARK_CATEGORIES: BookmarkCategory[] = [
  'All',
  'Dev Tools',
  'UI & Design',
  'AI & ML',
  'Audio & DAW',
  'Inspiration',
  'Articles',
  'Design Galleries',
  'Interface Design',
  'Reading',
  'Component Libraries',
  'Motion',
  'Development',
  'Agents & MCP',
  'Deploy',
  'Type',
  'Color',
  '3D',
  'Shaders',
  'Icons',
  'Utilities',
  'Desktop',
  'Video & Capture',
  'Whiteboard',
  'Design Engineers',
]

/** Categories that can hold a bookmark; 'All' is a filter value only. */
export const CHANNEL_CATEGORIES = BOOKMARK_CATEGORIES.filter(
  (category) => category !== 'All',
)

/**
 * Channel identity for the crate index. Only the LED colour and its halo are
 * used — a channel is printed by name next to it, so colour is never the only
 * signal (design.md §2, §4).
 */
export interface ChannelColor {
  accent: string
  glow: string
}

export const CATEGORY_COLORS: Record<string, ChannelColor> = {
  'Dev Tools': { accent: '#34d399', glow: 'rgba(16,185,129,0.25)' },
  'UI & Design': { accent: '#f0abfc', glow: 'rgba(217,70,239,0.25)' },
  'AI & ML': { accent: '#67e8f9', glow: 'rgba(6,182,212,0.25)' },
  'Audio & DAW': { accent: '#fde047', glow: 'rgba(245,158,11,0.25)' },
  Inspiration: { accent: '#fda4af', glow: 'rgba(244,63,94,0.25)' },
  Articles: { accent: '#a5b4fc', glow: 'rgba(99,102,241,0.25)' },

  // designeer channels. Adjacent groups are given distant hues so the LED
  // still separates neighbouring sections in the sidebar: the galleries read
  // as one cool family, tooling as one warm family, and the more visual
  // disciplines each take their own.
  'Design Galleries': { accent: '#f472b6', glow: 'rgba(236,72,153,0.25)' },
  'Interface Design': { accent: '#c084fc', glow: 'rgba(147,51,234,0.25)' },
  Reading: { accent: '#818cf8', glow: 'rgba(99,102,241,0.25)' },
  'Component Libraries': { accent: '#38bdf8', glow: 'rgba(14,165,233,0.25)' },
  Motion: { accent: '#22d3ee', glow: 'rgba(6,182,212,0.25)' },
  Development: { accent: '#fbbf24', glow: 'rgba(245,158,11,0.25)' },
  'Agents & MCP': { accent: '#f97316', glow: 'rgba(249,115,22,0.25)' },
  Deploy: { accent: '#facc15', glow: 'rgba(234,179,8,0.25)' },
  Type: { accent: '#2dd4bf', glow: 'rgba(13,148,136,0.25)' },
  Color: { accent: '#4ade80', glow: 'rgba(34,197,94,0.25)' },
  '3D': { accent: '#a3e635', glow: 'rgba(132,204,22,0.25)' },
  Shaders: { accent: '#fb7185', glow: 'rgba(244,63,94,0.25)' },
  Icons: { accent: '#e879f9', glow: 'rgba(217,70,239,0.25)' },
  Utilities: { accent: '#60a5fa', glow: 'rgba(59,130,246,0.25)' },
  Desktop: { accent: '#fdba74', glow: 'rgba(249,115,22,0.25)' },
  'Video & Capture': { accent: '#f87171', glow: 'rgba(239,68,68,0.25)' },
  Whiteboard: { accent: '#94a3b8', glow: 'rgba(100,116,139,0.25)' },
  'Design Engineers': { accent: '#d8b4fe', glow: 'rgba(168,85,247,0.25)' },

  Other: { accent: '#aeb5aa', glow: 'rgba(174,181,170,0.2)' },
}

export function channelColor(category: string): string {
  return (CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other).accent
}
