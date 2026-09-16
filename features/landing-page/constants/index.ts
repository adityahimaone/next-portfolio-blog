import {
  Globe,
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
  { label: 'LinkedIn', link: 'https://www.linkedin.com/in/adityahimaone' },
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

// ─── Projects Showcase (Landing Section) ─────────────────
export const PROJECTS_SHOWCASE: ProjectShowcaseItem[] = [
  {
    id: 0,
    title: 'Switchyard',
    description:
      'A control plane for coding agents. The interface brings boards, workspaces, task dispatch, and review into one operational flow.',
    image: '/assets/thumbnail-switchyard-2.webp',
    url: 'https://github.com/adityahimaone/switchyard',
    genre: 'Developer tools / Workflow',
    year: '2024',
    vinylColor: 'from-blue-600 to-cyan-500',
    vinylIcon: Globe,
  },
  {
    id: 1,
    title: 'Primarindo Asia',
    description:
      'A corporate website for Primarindo Asia Infrastructure Tbk. The frontend organizes manufacturing capabilities, product lines, and company information into a clearer public presence.',
    image: '/assets/thumbnail-primarindo-2.webp',
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
      'A focused habit tracker for daily routines, with streaks and weekly overviews kept inside one compact interface.',
    image: '/assets/thumbnail-habit-tracker-2.webp',
    url: 'https://habit.adityahimaone.space/',
    genre: 'Utility / Productivity',
    year: '2026',
    vinylColor: 'from-green-500 to-emerald-500',
    vinylIcon: Zap,
  },
  {
    id: 3,
    title: 'SeaPhantom',
    description:
      'A responsive landing page for the SeaPhantom NFT platform, built to introduce the product and give visitors a clear path into the experience.',
    image:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/y2l1g36bjudgsf6yr0eg.webp',
    url: 'https://seaphantom.com',
    genre: 'Web3 / NFT',
    year: '2022',
    vinylColor: 'from-purple-600 to-pink-600',
    vinylIcon: Cpu,
  },
  {
    id: 4,
    title: 'SeaPhantom P2P',
    description:
      'A frontend for peer-to-peer NFT trading workflows, with attention to account states, trade actions, and interface feedback.',
    image:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/fphb7ddemp4ixeutav1b.webp',
    url: 'https://auth.seaphantom.com/',
    genre: 'DeFi / Trading',
    year: '2022',
    vinylColor: 'from-indigo-600 to-violet-600',
    vinylIcon: Database,
  },
  {
    id: 5,
    title: 'Labgrownbeasts',
    description:
      'A company profile site for Labgrownbeasts, designed to make the company and its work easier to understand.',
    image:
      'https://res.cloudinary.com/deselamak/image/upload/v1699777135/portofolio/mqprcb6todunicq4cg0a.webp',
    url: 'https://labgrownbeasts.com/',
    genre: 'Biotech / Corporate',
    year: '2022',
    vinylColor: 'from-red-500 to-rose-500',
    vinylIcon: Layers,
  },
]
