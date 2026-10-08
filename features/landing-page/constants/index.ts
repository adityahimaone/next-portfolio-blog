import { Globe, Zap, Cpu, Database, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────
interface ExperienceItem {
  readonly id: number
  readonly role: string
  readonly type: string
  readonly company: string
  readonly location: string
  readonly period: string
  readonly color: string
  readonly description?: readonly string[]
  readonly isGroup?: boolean
  readonly items?: readonly {
    readonly role: string
    readonly period: string
    readonly company: string
    readonly description: string
  }[]
}

export interface MixerGroup {
  readonly id: string
  readonly label: string
  readonly type: string
  readonly channels: readonly {
    readonly name: string
    readonly level: number
  }[]
}

export interface ProjectPalette {
  readonly a: string
  readonly b: string
  readonly accent: string
}

// ─── Work track helpers ──────────────────────────────────

export const EMAIL = 'adityahimaone@gmail.com'

// ─── Experience Section ──────────────────────────────────
export const EXPERIENCES: readonly ExperienceItem[] = [
  {
    id: 1,
    role: 'Frontend SaaS Developer',
    type: 'Full Time',
    company: 'PT Fatiha Sakti',
    location: 'Jakarta, Indonesia',
    period: 'OCT 2022 - PRESENT',
    color: 'bg-purple-500',
    description: [
      'Led frontend development for Bisadaya, a job-seeker platform serving 15K+ users.',
      'Built and launched Campus Connect within three months.',
      'Developed SaaS HRIS features and KPI automation for HR teams.',
    ],
  },
  {
    id: 2,
    role: 'Fullstack Developer',
    type: 'Part Time',
    company: '80&Company',
    location: 'Kyoto, Japan (Remote)',
    period: 'APR 2024 - SEP 2024',
    color: 'bg-blue-500',
    description: [
      'Built frontend features for an HR management system with tRPC and Prisma services.',
      'Resolved production issues across HR workflows and tightened the path from data to action.',
    ],
  },
  {
    id: 3,
    role: 'Frontend ReactJS Developer',
    type: 'Contract',
    company: 'PT Unzyp Solusi Teknologi',
    location: 'Jakarta, Indonesia',
    period: 'JUN 2022 - SEP 2022',
    color: 'bg-pink-500',
    description: [
      'Built responsive e-commerce interfaces with React and reusable components.',
      'Developed Tailwind CSS components for an NFT platform and delivered a Next.js landing page.',
    ],
  },
  {
    id: 4,
    role: 'Education',
    type: 'Education',
    company: 'Universities & Academies',
    location: 'Indonesia',
    period: '2018 - 2022',
    color: 'bg-orange-500',
    isGroup: true,
    items: [
      {
        role: "Bachelor's in Informatics",
        period: 'AUG 2018 - OCT 2022',
        company: 'Universitas AMIKOM Yogyakarta',
        description:
          "Bachelor's degree in Informatics, GPA 3.75/4.00. Lab assistant for Data Structures and Operating Systems.",
      },
      {
        role: 'Frontend JavaScript',
        period: 'FEB 2022 - JUL 2022',
        company: 'Binar Academy',
        description:
          'Frontend JavaScript course through Kampus Merdeka, focused on React and JavaScript.',
      },
      {
        role: 'Fullstack Engineering',
        period: 'AUG 2021 - JAN 2022',
        company: 'Alterra Academy',
        description:
          'Fullstack Engineering course through Kampus Merdeka, focused on React and Golang.',
      },
      {
        role: 'Cloud Computing',
        period: 'FEB 2021 - JUL 2021',
        company: 'Bangkit Academy',
        description:
          'Cloud Computing course through Kampus Merdeka, focused on Node.js and REST APIs.',
      },
    ],
  },
] as const

// ─── Skills Mixer ────────────────────────────────────────
export const MIXER_DATA: readonly MixerGroup[] = [
  {
    id: 'frontend',
    label: 'FRONTEND',
    type: 'fader',
    channels: [
      { name: 'REACT', level: 100 },
      { name: 'NEXT.JS', level: 96 },
      { name: 'TYPESCRIPT', level: 94 },
      { name: 'TAILWIND CSS', level: 90 },
      { name: 'TANSTACK QUERY', level: 86 },
      { name: 'JQUERY', level: 64 },
    ],
  },
  {
    id: 'app-data',
    label: 'APP + DATA',
    type: 'knob',
    channels: [
      { name: 'NODE.JS', level: 84 },
      { name: 'GO', level: 76 },
      { name: 'POSTGRESQL', level: 78 },
      { name: 'PRISMA', level: 72 },
    ],
  },
  {
    id: 'delivery-infra',
    label: 'DELIVERY + INFRA',
    type: 'knob',
    channels: [
      { name: 'DOCKER', level: 82 },
      { name: 'NGINX', level: 72 },
      { name: 'GRAFANA', level: 58 },
      { name: 'UPTIME KUMA', level: 52 },
    ],
  },
] as const

/**
 * The Contact controller's sixteen pad colours.
 *
 * Lifted out of `section-contact.tsx` when the hero's pad field started
 * borrowing them: one palette, two instruments. Order is load-bearing — pad 01
 * takes the first colour, and the hero's boot sweep and the deck's pad labels
 * both index into it.
 */
export const CONTACT_PAD_COLORS = [
  '#35c78a',
  '#4d8dff',
  '#a778ff',
  '#f2b84b',
  '#ff5a3d',
  '#ef4f91',
  '#9b6cff',
  '#3e9cff',
  '#23c7b7',
  '#85c94a',
  '#e4ca3f',
  '#f28b3d',
  '#e05b52',
  '#cf62c3',
  '#746fe8',
  '#4bafd1',
] as const
