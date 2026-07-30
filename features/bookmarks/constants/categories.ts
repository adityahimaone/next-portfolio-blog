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
    bg: 'bg-emerald-800/90',
    text: 'text-emerald-100',
    border: 'border-emerald-400',
    cardBorder: 'border-emerald-400/60 hover:border-emerald-300 shadow-emerald-950/30',
    cardGradient: 'from-emerald-900/70 via-teal-800/60 to-emerald-900/70',
    iconBg: 'bg-emerald-800/90 border-emerald-400 text-emerald-100',
    glow: 'rgba(167,243,208,0.4)',
    accentColor: '#6ee7b7',
  },
  'UI & Design': {
    bg: 'bg-fuchsia-800/90',
    text: 'text-fuchsia-100',
    border: 'border-fuchsia-400',
    cardBorder: 'border-fuchsia-400/60 hover:border-fuchsia-300 shadow-fuchsia-950/30',
    cardGradient: 'from-fuchsia-900/70 via-purple-800/60 to-pink-900/70',
    iconBg: 'bg-fuchsia-800/90 border-fuchsia-400 text-fuchsia-100',
    glow: 'rgba(233,213,255,0.4)',
    accentColor: '#f0abfc',
  },
  'AI & ML': {
    bg: 'bg-cyan-800/90',
    text: 'text-cyan-100',
    border: 'border-cyan-400',
    cardBorder: 'border-cyan-400/60 hover:border-cyan-300 shadow-cyan-950/30',
    cardGradient: 'from-cyan-900/70 via-sky-800/60 to-blue-900/70',
    iconBg: 'bg-cyan-800/90 border-cyan-400 text-cyan-100',
    glow: 'rgba(207,250,254,0.4)',
    accentColor: '#67e8f9',
  },
  'Audio & DAW': {
    bg: 'bg-amber-800/90',
    text: 'text-amber-100',
    border: 'border-amber-400',
    cardBorder: 'border-amber-400/60 hover:border-amber-300 shadow-amber-950/30',
    cardGradient: 'from-amber-900/70 via-orange-800/60 to-amber-900/70',
    iconBg: 'bg-amber-800/90 border-amber-400 text-amber-100',
    glow: 'rgba(254,243,199,0.4)',
    accentColor: '#fde047',
  },
  'Inspiration': {
    bg: 'bg-rose-800/90',
    text: 'text-rose-100',
    border: 'border-rose-400',
    cardBorder: 'border-rose-400/60 hover:border-rose-300 shadow-rose-950/30',
    cardGradient: 'from-rose-900/70 via-pink-800/60 to-red-900/70',
    iconBg: 'bg-rose-800/90 border-rose-400 text-rose-100',
    glow: 'rgba(254,205,211,0.4)',
    accentColor: '#fda4af',
  },
  'Articles': {
    bg: 'bg-indigo-800/90',
    text: 'text-indigo-100',
    border: 'border-indigo-400',
    cardBorder: 'border-indigo-400/60 hover:border-indigo-300 shadow-indigo-950/30',
    cardGradient: 'from-indigo-900/70 via-blue-800/60 to-violet-900/70',
    iconBg: 'bg-indigo-800/90 border-indigo-400 text-indigo-100',
    glow: 'rgba(224,231,255,0.4)',
    accentColor: '#a5b4fc',
  },
}
