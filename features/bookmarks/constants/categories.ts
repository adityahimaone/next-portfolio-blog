import type { BookmarkCategory } from '../types'

export const BOOKMARK_CATEGORIES: BookmarkCategory[] = [
  'All',
  'Dev Tools',
  'UI & Design',
  'AI & ML',
  'Audio & DAW',
  'Inspiration',
  'Articles',
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
  Other: { accent: '#aeb5aa', glow: 'rgba(174,181,170,0.2)' },
}

export function channelColor(category: string): string {
  return (CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other).accent
}
