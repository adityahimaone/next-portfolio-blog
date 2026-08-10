import {
  Globe,
  Code,
  Zap,
  Cpu,
  Database,
  Layers,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────
export type WorkExperience = {
  company: string
  title: string
  start: string
  end: string
  link: string
  id: string
}

export type SocialLink = {
  label: string
  link: string
}

export interface ExperienceItem {
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
  readonly channels: readonly { readonly name: string; readonly level: number }[]
}

export interface ProjectShowcaseItem {
  readonly id: number
  readonly title: string
  readonly description: string
  readonly image: string
  readonly url: string
  readonly genre?: string
  readonly year?: string
  readonly vinylColor: string
  readonly vinylIcon: LucideIcon
}

// ─── Work Experience ─────────────────────────────────────
export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: 'Reglazed Studio',
    title: 'CEO',
    start: '2024',
    end: 'Present',
    link: 'https://reglazedstudio.com',
    id: 'work1',
  },
  {
    company: 'Freelance',
    title: 'Design Engineer',
    start: '2022',
    end: '2024',
    link: 'https://adityahimaone.tech',
    id: 'work2',
  },
  {
    company: 'Freelance',
    title: 'Front-end Developer',
    start: '2017',
    end: 'Present',
    link: 'https://adityahimaone.tech',
    id: 'work3',
  },
]

export const SOCIAL_LINKS_LANDING: SocialLink[] = [
  { label: 'Github', link: 'https://github.com/adityahimaone' },
  { label: 'Twitter', link: 'https://twitter.com/adityahimaone' },
  { label: 'LinkedIn', link: 'https://www.linkedin.com/in/adityahimaone' },
  { label: 'Instagram', link: 'https://www.instagram.com/adityahimaone' },
]

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
      'Led frontend for Bisadaya — job-seeker platform serving 15K+ users (Next.js SSR, Zustand, React Query).',
      'Shipped Campus Connect in 3 months — student-career platform (SSR, reusable components).',
      'Delivered SaaS HRIS features + KPI automation, cutting manual reporting for HR teams.',
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
      'Built frontend for an HR management system — integrated tRPC + Prisma backend services.',
      'Resolved critical production issues and optimized performance across HR workflows.',
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
      'Built responsive e-commerce UIs with React.js + reusable component system.',
      'Shipped NFT platform components (Tailwind CSS) + a production Next.js landing page.',
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
          "AMIKOM Yogyakarta — Bachelor's in Informatics, GPA 3.75/4.00, Linux lab assistant.",
      },
      {
        role: 'Frontend JavaScript',
        period: 'FEB 2022 - JUL 2022',
        company: 'Binar Academy',
        description:
          'Binar Academy — Kampus Merdeka bootcamp: Frontend JavaScript (React, JavaScript).',
      },
      {
        role: 'Fullstack Engineering',
        period: 'AUG 2021 - JAN 2022',
        company: 'Alterra Academy',
        description:
          'Alterra Academy — Kampus Merdeka bootcamp: Fullstack Engineering (React, Golang).',
      },
      {
        role: 'Cloud Computing',
        period: 'FEB 2021 - JUL 2021',
        company: 'Bangkit Academy',
        description:
          'Bangkit Academy by Google — Kampus Merdeka: Cloud Computing (Node.js, REST API).',
      },
    ],
  },
] as const

// ─── Skills Mixer ────────────────────────────────────────
export const MIXER_DATA: readonly MixerGroup[] = [
  {
    id: 'languages',
    label: 'LANGUAGES',
    type: 'fader',
    channels: [
      { name: 'HTML', level: 95 },
      { name: 'CSS', level: 95 },
      { name: 'JS', level: 95 },
      { name: 'TS', level: 90 },
      { name: 'GO', level: 60 },
      { name: 'SQL', level: 75 },
    ],
  },
  {
    id: 'frameworks',
    label: 'FRAMEWORKS',
    type: 'knob',
    channels: [
      { name: 'REACT', level: 95 },
      { name: 'NEXT', level: 92 },
      { name: 'TAILWIND', level: 95 },
      { name: 'JQUERY', level: 85 },
    ],
  },
  {
    id: 'tools',
    label: 'TOOLS & FX',
    type: 'knob',
    channels: [
      { name: 'VS CODE', level: 99 },
      { name: 'DOCKER', level: 75 },
      { name: 'GIT', level: 90 },
      { name: 'MOTION', level: 90 },
    ],
  },
] as const

// ─── Projects Showcase (Landing Section) ─────────────────
export const PROJECTS_SHOWCASE: ProjectShowcaseItem[] = [
  {
    id: 1,
    title: 'Primarindo Asia',
    description:
      'Company profile for Primarindo Asia Infrastructure Tbk, a manufacturer specializing in shoe production. The website showcases their manufacturing capabilities, product lines, and corporate information.',
    image: '/assets/primarindo.png',
    url: 'https://primarindo.niqcode.com/',
    genre: 'Corporate / Manufacturing',
    year: '2024',
    vinylColor: 'from-blue-600 to-cyan-500',
    vinylIcon: Globe,
  },
  {
    id: 2,
    title: 'Habit Tracker',
    description:
      'Habit tracking app to build better daily routines. Track streaks, view weekly overviews, and stay consistent.',
    image: '/assets/thumbnail-habit-tracker.png',
    url: 'https://habit.adityahimaone.space/',
    genre: 'Utility / Productivity',
    year: '2026',
    vinylColor: 'from-green-500 to-emerald-500',
    vinylIcon: Zap,
  },
  {
    id: 3,
    title: 'Frontend Resources',
    description:
      'A curated collection of the best frontend development tools, libraries, and inspiration sources to supercharge your web development workflow.',
    image: '/assets/thumbnail-fe-resources.png',
    url: 'https://frontend-resources-rouge.vercel.app/',
    genre: 'Educational / Tools',
    year: '2023',
    vinylColor: 'from-yellow-500 to-orange-500',
    vinylIcon: Code,
  },
  {
    id: 4,
    title: 'SeaPhantom',
    description:
      'Landing page for SeaPhantom, an NFT project focusing on innovative and sustainable technologies. Explore the world of NFTs and peer-to-peer trading on the SeaPhantom platform.',
    image:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/y2l1g36bjudgsf6yr0eg.webp',
    url: 'https://seaphantom.com',
    genre: 'Web3 / NFT',
    year: '2022',
    vinylColor: 'from-purple-600 to-pink-600',
    vinylIcon: Cpu,
  },
  {
    id: 5,
    title: 'SeaPhantom P2P',
    description:
      'Engage in NFT trading with the P2P Rum Token Escrow Trading project. This platform facilitates secure and transparent NFT transactions.',
    image:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/fphb7ddemp4ixeutav1b.webp',
    url: 'https://auth.seaphantom.com/',
    genre: 'DeFi / Trading',
    year: '2022',
    vinylColor: 'from-indigo-600 to-violet-600',
    vinylIcon: Database,
  },
  {
    id: 6,
    title: 'Labgrownbeasts',
    description:
      'Explore the Labgrownbeasts Company Profile, showcasing innovation and excellence in the field. Learn about our vision, mission, and the cutting-edge work we do.',
    image:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/mqprcb6todunicq4cg0a.webp',
    url: 'https://labgrownbeasts.com/',
    genre: 'Biotech / Corporate',
    year: '2022',
    vinylColor: 'from-red-500 to-rose-500',
    vinylIcon: Layers,
  },
]
