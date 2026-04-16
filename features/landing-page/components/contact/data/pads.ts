import { Mail, Github, Linkedin, Music, Copy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface FunctionalPad {
  readonly id: string
  readonly label: string
  readonly subLabel?: string
  readonly icon: LucideIcon
  readonly color: string
  readonly href?: string
  readonly action?: string
  readonly value?: string
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
  readonly mobile: { readonly x: number; readonly y: number; readonly w: number; readonly h: number }
}

export const functionalPads: readonly FunctionalPad[] = [
  {
    id: 'email',
    label: 'EMAIL',
    subLabel: 'Send',
    icon: Mail,
    color: 'bg-red-500',
    href: 'mailto:adityahimaone@gmail.com',
    x: 3,
    y: 1,
    w: 2,
    h: 2,
    mobile: { x: 1, y: 2, w: 2, h: 2 },
  },
  {
    id: 'linkedin',
    label: 'LINKEDIN',
    icon: Linkedin,
    color: 'bg-blue-600',
    href: 'https://linkedin.com/in/adityahimaone',
    x: 2,
    y: 1,
    w: 1,
    h: 1,
    mobile: { x: 0, y: 2, w: 1, h: 1 },
  },
  {
    id: 'github',
    label: 'GITHUB',
    icon: Github,
    color: 'bg-zinc-700',
    href: 'https://github.com/adityahimaone',
    x: 2,
    y: 2,
    w: 1,
    h: 1,
    mobile: { x: 0, y: 3, w: 1, h: 1 },
  },
  {
    id: 'spotify',
    label: 'SPOTIFY',
    icon: Music,
    color: 'bg-green-500',
    href: 'https://open.spotify.com/user/212nmrqpklzmvpntgorzpavgq',
    x: 5,
    y: 1,
    w: 1,
    h: 1,
    mobile: { x: 3, y: 2, w: 1, h: 1 },
  },
  {
    id: 'copy',
    label: 'COPY',
    icon: Copy,
    color: 'bg-amber-500',
    action: 'copy',
    value: 'adityahimaone@gmail.com',
    x: 5,
    y: 2,
    w: 1,
    h: 1,
    mobile: { x: 3, y: 3, w: 1, h: 1 },
  },
] as const

export const dummyColors = [
  'bg-pink-500',
  'bg-cyan-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-rose-500',
] as const
