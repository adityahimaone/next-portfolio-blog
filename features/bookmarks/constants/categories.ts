import { BookmarkCategory } from '../types'

export const BOOKMARK_CATEGORIES: BookmarkCategory[] = [
  'All',
  'Dev Tools',
  'UI & Design',
  'AI & ML',
  'Audio & DAW',
  'Inspiration',
  'Articles',
]

export interface CategoryTheme {
  bg: string
  text: string
  border: string
  cardBorder: string
  cardGradient: string
  iconBg: string
  glow: string
  accentColor: string
}

export const CATEGORY_COLORS: Record<string, CategoryTheme> = {
  'Dev Tools': {
    bg: 'bg-emerald-950/70',
    text: 'text-emerald-200',
    border: 'border-emerald-500/50',
    cardBorder: 'border-emerald-500/40 hover:border-emerald-400',
    cardGradient: 'bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-900/90',
    iconBg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200',
    glow: 'rgba(16,185,129,0.25)',
    accentColor: '#34d399',
  },
  'UI & Design': {
    bg: 'bg-fuchsia-950/70',
    text: 'text-fuchsia-200',
    border: 'border-fuchsia-500/50',
    cardBorder: 'border-fuchsia-500/40 hover:border-fuchsia-400',
    cardGradient: 'bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-900/90',
    iconBg: 'bg-fuchsia-950/80 border-fuchsia-500/50 text-fuchsia-200',
    glow: 'rgba(217,70,239,0.25)',
    accentColor: '#f0abfc',
  },
  'AI & ML': {
    bg: 'bg-cyan-950/70',
    text: 'text-cyan-200',
    border: 'border-cyan-500/50',
    cardBorder: 'border-cyan-500/40 hover:border-cyan-400',
    cardGradient: 'bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-900/90',
    iconBg: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200',
    glow: 'rgba(6,182,212,0.25)',
    accentColor: '#67e8f9',
  },
  'Audio & DAW': {
    bg: 'bg-amber-950/70',
    text: 'text-amber-200',
    border: 'border-amber-500/50',
    cardBorder: 'border-amber-500/40 hover:border-amber-400',
    cardGradient: 'bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-900/90',
    iconBg: 'bg-amber-950/80 border-amber-500/50 text-amber-200',
    glow: 'rgba(245,158,11,0.25)',
    accentColor: '#fde047',
  },
  'Inspiration': {
    bg: 'bg-rose-950/70',
    text: 'text-rose-200',
    border: 'border-rose-500/50',
    cardBorder: 'border-rose-500/40 hover:border-rose-400',
    cardGradient: 'bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-900/90',
    iconBg: 'bg-rose-950/80 border-rose-500/50 text-rose-200',
    glow: 'rgba(244,63,94,0.25)',
    accentColor: '#fda4af',
  },
  'Articles': {
    bg: 'bg-indigo-950/70',
    text: 'text-indigo-200',
    border: 'border-indigo-500/50',
    cardBorder: 'border-indigo-500/40 hover:border-indigo-400',
    cardGradient: 'bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-900/90',
    iconBg: 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200',
    glow: 'rgba(99,102,241,0.25)',
    accentColor: '#a5b4fc',
  },
}

